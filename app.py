from flask import Flask, render_template, request, jsonify
import numpy as np
import random

from model import load_model
from engine import simulate_behavior, explain

app = Flask(__name__)
model = load_model()

# -------------------------------
# GLOBAL SESSION STATE
# -------------------------------
state = {
    "typing": 70,
    "idle": 5,
    "apps": 3,
    "mouse": 85,
    "history": [],
    "mode": "study"
}

# Archive of past sessions
session_archive = []

# Smoothed stress score
smoothed_score = 30


# -------------------------------
# PUZZLE DATA (ESCAPE ROOM CORE)
# -------------------------------
PUZZLES = [
    {
        "question": "2, 6, 12, 20, ?",
        "answer": "30",
        "hint": "Pattern: n² + n"
    },
    {
        "question": "1, 4, 9, 16, ?",
        "answer": "25",
        "hint": "Perfect squares"
    },
    {
        "question": "3, 6, 11, 18, ?",
        "answer": "27",
        "hint": "Add consecutive odd numbers"
    }
]


# -------------------------------
# HELPER INTELLIGENCE FUNCTIONS
# -------------------------------
def cognitive_state(score, state):
    if score < 30:
        return "CALM"
    if score < 50 and state["idle"] < 15:
        return "FOCUSED"
    if score < 40 and state["idle"] > 30:
        return "DRIFTING"
    if score < 75:
        return "OVERLOADED"
    return "CRITICAL"


def detect_boredom(score, state):
    return score < 35 and state["idle"] > 40


def detect_drift(state):
    return (
        state["idle"] > 20 and
        state["typing"] < 40 and
        state["mouse"] > 70
    )


def intervention(cog_state):
    if cog_state == "DRIFTING":
        return "Try switching tasks to regain engagement."
    if cog_state == "OVERLOADED":
        return "Take a short 2-minute micro-break."
    if cog_state == "CRITICAL":
        return "Pause the session and reset cognitive load."
    return "You are in a healthy cognitive zone."


# -------------------------------
# ROUTES (PAGES)
# -------------------------------
@app.route("/")
def landing():
    return render_template("index.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/insights")
def insights():
    return render_template("insights.html")


# -------------------------------
# SESSION CONTROL API
# -------------------------------
@app.route("/start", methods=["POST"])
def start():
    global state, smoothed_score, session_archive
    data = request.get_json()

    # Archive previous session
    if state["history"]:
        session_archive.append({
            "mode": state["mode"],
            "avg": int(sum(state["history"]) / len(state["history"])),
            "peak": max(state["history"]),
            "length": len(state["history"])
        })

    # Reset session
    state = {
        "typing": 70,
        "idle": 5,
        "apps": 3,
        "mouse": 85,
        "history": [],
        "mode": data.get("mode", "study")
    }

    smoothed_score = 30

    return jsonify({
        "status": "session started",
        "mode": state["mode"]
    })


# -------------------------------
# CORE ANALYSIS TICK
# -------------------------------
@app.route("/tick", methods=["POST"])
def tick():
    global state, smoothed_score

    # Simulate next behavior step
    state.update(simulate_behavior(state, state["mode"]))

    # Feature vector
    features = np.array([[
        state["typing"],
        state["idle"],
        state["apps"],
        state["mouse"]
    ]])

    # ML prediction
    prob = model.predict_proba(features)[0][1]
    raw_score = prob * 100

    # Temporal smoothing
    alpha = 0.15
    smoothed_score = alpha * raw_score + (1 - alpha) * smoothed_score
    score = int(smoothed_score)

    # Store history
    state["history"].append(score)
    state["history"] = state["history"][-10:]

    # Escape-room lock logic
    if score > 70:
        lock = "LOCKED"
    elif score > 40:
        lock = "UNLOCKING"
    else:
        lock = "UNLOCKED"

    # Cognitive intelligence
    cog_state = cognitive_state(score, state)
    boredom = detect_boredom(score, state)
    drift = detect_drift(state)

    recovery = None
    if len(state["history"]) >= 2:
        if state["history"][-2] > 70 and score < 50:
            recovery = "FAST"

    return jsonify({
        "score": score,
        "lock": lock,
        "history": state["history"],
        "reasons": explain(state),

        "cognitive_state": cog_state,
        "boredom": boredom,
        "drift": drift,
        "recovery": recovery,
        "intervention": intervention(cog_state)
    })


# -------------------------------
# SESSION HISTORY API
# -------------------------------
@app.route("/sessions")
def sessions():
    return jsonify(session_archive[-5:])


# -------------------------------
# PUZZLE APIs (ESCAPE ROOM)
# -------------------------------
@app.route("/puzzle")
def puzzle():
    p = random.choice(PUZZLES)
    return jsonify({
        "question": p["question"],
        "hint": p["hint"]
    })


@app.route("/validate_puzzle", methods=["POST"])
def validate_puzzle():
    data = request.get_json()
    answer = data.get("answer", "").strip()

    for p in PUZZLES:
        if answer == p["answer"]:
            return jsonify({"success": True})

    return jsonify({"success": False})


# -------------------------------
# RUN APP
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)