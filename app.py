from flask import Flask, render_template, request, jsonify
import numpy as np
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

# Smoothed stress score (important)
smoothed_score = 30  # starting baseline


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
# API ROUTES
# -------------------------------
@app.route("/start", methods=["POST"])
def start():
    global state, smoothed_score
    data = request.get_json()

    state = {
        "typing": 70,
        "idle": 5,
        "apps": 3,
        "mouse": 85,
        "history": [],
        "mode": data.get("mode", "study")
    }

    smoothed_score = 30  # reset baseline each session

    return jsonify({
        "status": "session started",
        "mode": state["mode"]
    })


@app.route("/tick", methods=["POST"])
def tick():
    global state, smoothed_score

    # 1️⃣ Simulate next behavior step
    state.update(simulate_behavior(state, state["mode"]))

    # 2️⃣ Feature vector
    features = np.array([[
        state["typing"],
        state["idle"],
        state["apps"],
        state["mouse"]
    ]])

    # 3️⃣ Raw ML output
    prob = model.predict_proba(features)[0][1]
    raw_score = prob * 100

    # 4️⃣ TEMPORAL SMOOTHING (KEY FIX)
    alpha = 0.15  # smoothing factor (10–20% is ideal)
    smoothed_score = alpha * raw_score + (1 - alpha) * smoothed_score
    score = int(smoothed_score)

    # 5️⃣ Store history
    state["history"].append(score)
    state["history"] = state["history"][-10:]

    # 6️⃣ Escape-room lock logic
    if score > 70:
        lock = "LOCKED"
    elif score > 40:
        lock = "UNLOCKING"
    else:
        lock = "UNLOCKED"

    return jsonify({
        "score": score,
        "lock": lock,
        "history": state["history"],
        "reasons": explain(state)
    })


# -------------------------------
# RUN
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)