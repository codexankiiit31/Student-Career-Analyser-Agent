import streamlit as st
from agents.chatbot_router_agent import ChatbotRouterAgent

# ---------------------------------------
# Page config
# ---------------------------------------
st.set_page_config(
    page_title="Chatbot Router Test",
    layout="centered"
)

st.title("🧠 Chatbot Router Agent – Test Console")
st.caption("Test intent routing, greetings, and fallback behavior")

# ---------------------------------------
# Initialize router
# ---------------------------------------
@st.cache_resource
def load_router():
    return ChatbotRouterAgent()

router = load_router()

# ---------------------------------------
# Session-based chat history
# ---------------------------------------
if "history" not in st.session_state:
    st.session_state.history = []

def format_history(history):
    return "\n".join(
        f"{msg['role'].upper()}: {msg['content']}"
        for msg in history
    )

# ---------------------------------------
# Chat UI
# ---------------------------------------
user_input = st.text_input(
    "Type a message",
    placeholder="Try: Hello, I am confused about my future, Check my resume..."
)

if st.button("Send") and user_input.strip():

    # Save user message
    st.session_state.history.append(
        {"role": "user", "content": user_input}
    )

    history_text = format_history(st.session_state.history)

    # Route intent
    result = router.route(
        history=history_text,
        message=user_input
    )

    # Display router output
    st.subheader("🔍 Router Decision")
    st.json(result)

    # Greeting / fallback behavior simulation
    if result["intent"] == "unknown":
        reply = (
            "Hi! I’m your AI Career Assistant. "
            "I can help with career guidance, resume analysis, "
            "job market insights, and learning roadmaps. "
            "How can I assist you today?"
        )

    elif result["intent"] == "general_guidance":
        reply = (
            "I understand. We can break this down step by step. "
            "Would you like help with career direction, resume improvement, "
            "or understanding job market trends?"
        )

    else:
        reply = f"➡ Suggested action: {result['suggested_action']}"

    # Save assistant reply
    st.session_state.history.append(
        {"role": "assistant", "content": reply}
    )

    # Show assistant reply
    st.subheader("🤖 Assistant Response")
    st.write(reply)

# ---------------------------------------
# Debug: Conversation history
# ---------------------------------------
with st.expander("🧾 Conversation History (Debug)"):
    st.text(format_history(st.session_state.history))
