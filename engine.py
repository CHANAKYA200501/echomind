import random

def simulate_behavior(prev, mode):
    drift = {"study": 1, "work": 2, "creative": 0.5}[mode]

    return {
        "typing": max(20, prev["typing"] - random.uniform(0, drift)),
        "idle": min(30, prev["idle"] + random.uniform(0, drift)),
        "apps": min(15, prev["apps"] + random.uniform(0, drift)),
        "mouse": max(20, prev["mouse"] - random.uniform(0, drift))
    }

def explain(features):
    reasons = []
    if features["idle"] > 12:
        reasons.append("Idle time spike → fatigue detected")
    if features["apps"] > 7:
        reasons.append("Frequent app switching → focus loss")
    if features["typing"] < 45:
        reasons.append("Typing slowdown → cognitive load")
    if features["mouse"] < 50:
        reasons.append("Unstable mouse movement → stress signal")
    return reasons or ["Stable behavior detected"]