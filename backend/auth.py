# ==============================================================
# auth.py  —  JWT Authentication Logic
# ==============================================================
#
# This file handles everything related to user authentication:
#   1. Password hashing and verification  (using bcrypt)
#   2. JWT token creation and validation  (using python-jose)
#   3. User storage in a local JSON file  (users.json)
#   4. FastAPI dependency that protects routes
#
# HOW JWT WORKS (simple summary):
#   - User logs in with username + password
#   - We verify the password, then create a JWT token
#   - JWT token is a signed string: { "sub": "username", "exp": <timestamp> }
#   - Frontend stores this token in localStorage
#   - On every protected API call, frontend sends: Authorization: Bearer <token>
#   - FastAPI reads the token, decodes it, and identifies the user
# ==============================================================

import json
import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel

from database.supabase_client import get_supabase_client

# ==============================================================
# CONFIGURATION
# ==============================================================

# Secret key used to SIGN the JWT. Anyone with this key can forge tokens,
# so in production, store this in an environment variable (.env file).
# Generate a new one with: openssl rand -hex 32
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"

# Hashing algorithm used to sign the token
ALGORITHM = "HS256"

# How long the token is valid before the user must log in again
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# ==============================================================
# PASSWORD HELPERS
# ==============================================================

def hash_password(plain_password: str) -> str:
    """
    Hash a plain-text password using bcrypt.

    bcrypt automatically:
      - Generates a random salt (so same password → different hash each time)
      - Applies a cost factor to make brute-force attacks slow

    Returns the hash as a UTF-8 string (safe to store in JSON).
    """
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed_bytes.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Check if a plain-text password matches a stored bcrypt hash.

    Returns True if the password is correct, False otherwise.
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


# ==============================================================
# USER REGISTRATION
# ==============================================================

def register_user(username: str, email: str, password: str) -> dict:
    """
    Register a new user by:
      1. Checking that the username/email is not already taken
      2. Hashing the password
      3. Saving the user to Supabase

    Returns the new user's data (without the password) on success.
    Raises HTTPException(400) if the username or email is already taken.
    """
    supabase = get_supabase_client()

    # Check if username already exists
    existing_user = supabase.table("users").select("*").eq("username", username).execute()
    if existing_user.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{username}' is already taken. Please choose a different one."
        )
        
    # Check if email already exists
    existing_email = supabase.table("users").select("*").eq("email", email).execute()
    if existing_email.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{email}' is already registered."
        )

    # Insert new user record
    hashed = hash_password(password)
    response = supabase.table("users").insert({
        "username": username,
        "email": email,
        "hashed_password": hashed
    }).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create user in database.")

    # Return user info (exclude the hashed_password from the response)
    return {"username": username, "email": email}


# ==============================================================
# PYDANTIC MODELS
# Used by FastAPI to validate request/response data shapes
# ==============================================================

class Token(BaseModel):
    """The JSON response returned after a successful login."""
    access_token: str   # The JWT string, e.g. "eyJhbGci..."
    token_type: str     # Always "bearer"


class TokenData(BaseModel):
    """Data we extract FROM the JWT payload after decoding it."""
    username: Optional[str] = None


class User(BaseModel):
    """Public user info (safe to return in API responses)."""
    id: Optional[str] = None
    username: str
    email: Optional[str] = None


class UserInDB(User):
    """User info as stored in the database (includes hashed password)."""
    hashed_password: str


# ==============================================================
# OAUTH2 SCHEME
# ==============================================================

# This tells FastAPI:
#   "To authenticate, the client should POST to /auth/token and get a bearer token"
# FastAPI will automatically show a login form in the Swagger UI (/docs)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


# ==============================================================
# JWT TOKEN CREATION
# ==============================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token.

    Steps:
      1. Copy the payload data (e.g. {"sub": "alice"})
      2. Add an expiry timestamp ("exp")
      3. Sign everything with the SECRET_KEY using HS256
      4. Return the resulting token string

    Args:
        data: Dictionary to encode into the token (usually {"sub": username})
        expires_delta: How long the token should be valid (default: 15 min)

    Returns:
        A signed JWT string like "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    """
    to_encode = data.copy()

    # Set expiry time
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode["exp"] = expire

    # Sign and encode the token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ==============================================================
# CURRENT USER DEPENDENCY  (used to protect routes)
# ==============================================================

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    FastAPI dependency — call this with Depends() to protect a route.

    What it does on every protected request:
      1. Reads the "Authorization: Bearer <token>" header (done by oauth2_scheme)
      2. Decodes and verifies the JWT signature
      3. Extracts the username from the token's "sub" field
      4. Looks up the user in users.json
      5. Returns the User object if everything is valid

    If anything fails (bad token, expired, user not found), it raises
    HTTP 401 Unauthorized, and the request is rejected.

    Usage in a route:
        @app.get("/protected")
        def my_route(current_user: User = Depends(get_current_user)):
            return {"message": f"Hello {current_user.username}"}
    """
    # Standard 401 error we'll raise for any auth failure
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},  # tells the client to send a Bearer token
    )

    try:
        # Decode the token — this also verifies the signature and expiry
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # "sub" (subject) is the username we stored when creating the token
        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception

        token_data = TokenData(username=username)

    except JWTError:
        # Token is malformed, expired, or has an invalid signature
        raise credentials_exception

    # Look up the user in Supabase
    supabase = get_supabase_client()
    user_resp = supabase.table("users").select("*").eq("username", token_data.username).execute()

    if not user_resp.data:
        # User no longer exists in the database
        raise credentials_exception
        
    user_dict = user_resp.data[0]

    # Return only the public-safe User model (no hashed_password)
    return User(
        id=str(user_dict.get("id")),
        username=user_dict["username"], 
        email=user_dict.get("email")
    )
