# ==============================================================
# routers/auth_router.py  —  Authentication Routes
# ==============================================================
#
# WHY A SEPARATE FILE?
#   In FastAPI, an APIRouter lets you group related routes together
#   in their own file instead of cramming everything into main.py.
#
#   This file owns ONLY authentication-related endpoints:
#     - POST /register   → Create a new user account
#     - POST /token      → Login and get a JWT access token
#
#   main.py then includes this router with one line:
#     app.include_router(auth_router)
#
#   This keeps main.py clean and makes the codebase easier to read.
# ==============================================================

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from auth import (
    Token,                        # Pydantic model for the token response
    verify_password,              # compare plain password with bcrypt hash
    create_access_token,          # create a signed JWT string
    register_user,                # save a new user to Supabase
    ACCESS_TOKEN_EXPIRE_MINUTES,  # how long the token stays valid
)
from database.supabase_client import get_supabase_client


# ==============================================================
# CREATE ROUTER
# ==============================================================
# APIRouter works just like FastAPI's app object, but it's only
# a piece of the app — it gets "included" into main.py.

router = APIRouter(
    prefix="/auth",    # All routes here start with /auth
                       # e.g. /auth/register, /auth/token
    tags=["Authentication"],  # Groups these routes in Swagger UI /docs
)


# ==============================================================
# REQUEST MODEL
# ==============================================================
# Pydantic model to validate the JSON body sent to POST /auth/register
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


# ==============================================================
# ROUTE: POST /auth/register
# ==============================================================
@router.post("/register", summary="Create a new user account")
async def register(request: RegisterRequest):
    """
    Register a new user.

    Expects a JSON body:
    {
        "username": "alice",
        "email": "alice@example.com",
        "password": "mysecret"
    }

    Steps:
      1. Check that the username is not already in users.json
      2. Hash the password using bcrypt (never store plain text!)
      3. Save the new user to users.json
      4. Return a success message

    Raises HTTP 400 if the username is already taken.
    """
    # register_user() handles all the validation and saving logic
    # It's defined in auth.py so the logic is reusable
    created_user = register_user(
        username=request.username,
        email=request.email,
        password=request.password
    )

    return {
        "message": "Account created successfully! You can now log in.",
        "user": created_user   # returns { username, email } — no password!
    }


# ==============================================================
# ROUTE: POST /auth/token   (Login)
# ==============================================================
@router.post("/token", response_model=Token, summary="Login and get a JWT token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login with username + password. Returns a JWT access token.

    Uses OAuth2PasswordRequestForm, so the body must be
    sent as form-encoded data (not JSON):
        username=alice&password=mysecret

    How the frontend uses the returned token:
      1. Store it in localStorage:  localStorage.setItem('access_token', token)
      2. Send it in every request:  Authorization: Bearer <token>
      3. The backend will verify it on each protected route

    Raises HTTP 400 if credentials are wrong.
    """
    # Load user from Supabase
    supabase = get_supabase_client()
    user_resp = supabase.table("users").select("*").eq("username", form_data.username).execute()

    # ── Check 1: Does the username exist? ───────────────────
    if not user_resp.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )
        
    user_dict = user_resp.data[0]

    # ── Check 2: Does the password match the stored hash? ───
    # We NEVER store plain passwords — only bcrypt hashes.
    # verify_password() compares the plain input against the hash.
    if not verify_password(form_data.password, user_dict["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )

    # ── Create JWT token ─────────────────────────────────────
    # The token payload contains "sub" (subject) = the username.
    # When the user sends this token later, we decode "sub" to
    # identify who is making the request.
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_dict["username"]},
        expires_delta=access_token_expires
    )

    # Return the token — the frontend stores this in localStorage
    return {"access_token": access_token, "token_type": "bearer"}
