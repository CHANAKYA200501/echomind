# EchoMind  
### *Decode Stress • Unlock Focus • Escape Mental Locks*

EchoMind is an **AI-powered cognitive intelligence system** built as an **escape-room–inspired experience**.  
Instead of passively showing stress levels, EchoMind **forces recovery through interaction**, turning mental clarity into something you **earn**, not just observe.

Designed for **Escape Da Vinci (EDV26)**, EchoMind blends  
**Machine Learning + Explainable AI + Psychology + Gamification** into a single immersive prototype.

---

## Why EchoMind is Different

Most stress apps ask *“How stressed are you?”*  
EchoMind asks:

> **“Can you recover your focus and unlock your mind?”**

✔ Not a dashboard — a **challenge**  
✔ Not raw data — **interpretable intelligence**  
✔ Not alerts — **actions & puzzles**  
✔ Not passive — **interactive recovery**

---

## Core Features

### Real-Time Stress Intelligence
- Machine Learning–based stress scoring
- **Temporal smoothing** for realistic behavior (no jittery jumps)
- Live stress trend visualization
- Explainable AI → *why this score exists*

---

### Cognitive State Engine
Detects higher-order mental conditions:
- **CALM**
- **FOCUSED**
- **DRIFTING**
- **OVERLOADED**
- **CRITICAL**

Additional signals:
-  Boredom detection  
-  Cognitive drift  
-  Recovery speed tracking  

Each state triggers **context-aware recommendations**.

---

### Escape-Room Mechanism (Core Innovation)
- Mental states control **locks**:
  - `LOCKED` → overloaded
  - `UNLOCKING` → stabilizing
  - `UNLOCKED` → recovered
- When unlocked, users must solve a **logic puzzle**
- Focus recovery becomes **measurable & interactive**

> This directly aligns with **Escape Da Vinci’s escape-room philosophy**.

---

### Multi-Session Intelligence
- Session history archive
- Tracks:
  - Mode (study / work / creative)
  - Average stress
  - Peak stress
- Insights page for reflection & comparison

---

###  UX & Interaction Design
- Netflix-inspired dark UI (black & red)
- Live animated charts
- Keyboard shortcut: **ESC → Safe termination**
- Confirmation modals (no accidental exits)
- Privacy-first (no camera, no mic, no biometrics)

---

##  Technology Stack

| Layer | Tech |
|-----|------|
| Backend | Flask (Python) |
| Machine Learning | Scikit-learn |
| Frontend | HTML, CSS, Vanilla JS |
| Visualization | Chart.js |
| Deployment | Render / PythonAnywhere |
| Design | Dark UI + Gamification |

---

##  Project Structure
<img width="450" height="368" alt="Screenshot 2026-01-20 at 10 46 32 AM" src="https://github.com/user-attachments/assets/7e044d4b-bdc9-40ee-8ab7-e378a5bcadc4" />


## ⚙️ How EchoMind Works (System Flow)

1. Simulated behavioral signals are generated  
   *(typing speed, idle time, app switching, mouse activity)*  
2. ML model predicts stress probability  
3. Temporal smoothing stabilizes output  
4. Cognitive state is inferred  
5. UI updates in real time  
6. Recovery unlocks a puzzle  
7. Session data is archived  

---

##  Deployment Guide

###  Deploy on Render (Recommended)

#### Requirements (`requirements.txt`)
```txt
flask
numpy
scikit-learn
gunicorn
