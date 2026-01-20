// ==============================
// GLOBAL STATE
// ==============================
let startTime = null;
let chart = null;
let intervalId = null;
let sessionActive = false;
let puzzleShown = false; // 🧩 prevent repeated puzzle popup

// Baseline so graph is never empty
let historyData = [20, 22, 21, 23];

// Frontend display smoothing (slow & realistic)
let displayedScore = 30;


// ==============================
// INITIALIZE SESSION
// ==============================
function initializeSession() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  sessionActive = false;
  puzzleShown = false;
  startTime = null;
  historyData = [20, 22, 21, 23];
  displayedScore = 30;

  document.getElementById("score").innerText = "—";
  document.getElementById("lock").innerText = "MENTAL LOCK";
  document.getElementById("status").innerText =
    "Session initialized. Ready to analyze.";
  document.getElementById("status").className = "status idle";
  document.getElementById("reasons").innerHTML = "";

  // Reset intelligence UI
  document.getElementById("cognitiveState").innerText = "Cognitive State: —";
  document.getElementById("signals").innerText = "—";
  document.getElementById("intervention").innerText = "—";

  updateLockVisual("LOCKED");
  drawChart(historyData);

  fetch("/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: document.getElementById("mode").value
    })
  });

  const analyzeBtn = document.getElementById("analyzeBtn");
  analyzeBtn.disabled = false;
  analyzeBtn.innerText = "▶ Start Real-Time Analysis";

  document.getElementById("terminateBtn").disabled = false;
}


// ==============================
// START REAL-TIME ANALYSIS
// ==============================
function startRealtimeAnalysis() {
  if (intervalId || sessionActive) return;

  sessionActive = true;
  startTime = Date.now();

  const status = document.getElementById("status");
  status.innerText = "Analyzing work patterns in real time…";
  status.className = "status running";

  const btn = document.getElementById("analyzeBtn");
  btn.disabled = true;
  btn.innerText = "Analyzing…";

  updateTimer();
  drawChart(historyData);

  // ⏳ Slow sampling for realism
  intervalId = setInterval(runAnalysisTick, 6000);
}


// ==============================
// TERMINATE SESSION (LOGIC ONLY)
// ==============================
function terminateSession() {
  if (!sessionActive) return;

  sessionActive = false;

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  showSessionSummary();
  startTime = null;

  document.getElementById("status").className = "status idle";

  const analyzeBtn = document.getElementById("analyzeBtn");
  analyzeBtn.disabled = false;
  analyzeBtn.innerText = "▶ Start Real-Time Analysis";

  document.getElementById("terminateBtn").disabled = true;

  const analyzer = document.querySelector(".analyzer-left");
  if (analyzer) analyzer.classList.remove("alert");
}


// ==============================
// ANALYSIS TICK
// ==============================
function runAnalysisTick() {
  if (!sessionActive) return;

  fetch("/tick", { method: "POST" })
    .then(r => r.json())
    .then(d => {
      if (!sessionActive) return;

      // 🧠 Strong temporal smoothing
      displayedScore = Math.round(
        0.08 * d.score + 0.92 * displayedScore
      );

      document.getElementById("score").innerText =
        `Stress Score: ${displayedScore}`;

      document.getElementById("lock").innerText =
        `MENTAL LOCK: ${d.lock}`;

      // 🔐 Visuals
      updateLockVisual(d.lock);
      updateReasons(d.reasons);
      applyStressAlert(displayedScore);

      // 🧠 Cognitive Intelligence
      document.getElementById("cognitiveState").innerText =
        `Cognitive State: ${d.cognitive_state}`;

      let signals = [];
      if (d.boredom) signals.push("😴 Boredom detected");
      if (d.drift) signals.push("🧠 Cognitive drift detected");

      document.getElementById("signals").innerText =
        signals.length ? signals.join(" • ") : "Engagement stable";

      document.getElementById("intervention").innerText =
        d.intervention;

      // 📊 Chart
      historyData = d.history && d.history.length ? d.history : historyData;
      drawChart(historyData);

      // 🧩 PUZZLE TRIGGER (ESCAPE ROOM CORE)
      if (d.lock === "UNLOCKED" && !puzzleShown) {
        puzzleShown = true;
        openPuzzle();
      }
    })
    .catch(() => {
      if (sessionActive) {
        document.getElementById("status").innerText =
          "Connection unstable — running locally";
      }
    });
}


// ==============================
// TIMER
// ==============================
function updateTimer() {
  if (!sessionActive || !startTime) return;

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  document.getElementById("status").innerText =
    `Analyzing… Session time ${mins}:${secs.toString().padStart(2, "0")}`;

  setTimeout(updateTimer, 1000);
}


// ==============================
// SESSION SUMMARY
// ==============================
function showSessionSummary() {
  if (!historyData.length) return;

  const avg = Math.round(
    historyData.reduce((a, b) => a + b, 0) / historyData.length
  );
  const peak = Math.max(...historyData);

  const state =
    avg < 40 ? "UNLOCKED" :
    avg < 70 ? "UNSTABLE" : "LOCKED";

  document.getElementById("status").innerText =
    `Session Summary → Avg: ${avg}, Peak: ${peak}, State: ${state}`;
}


// ==============================
// EXPLAINABLE AI
// ==============================
function updateReasons(reasons) {
  const ul = document.getElementById("reasons");
  if (!ul) return;

  ul.innerHTML = "";
  reasons.forEach(reason => {
    const li = document.createElement("li");
    li.innerText = reason;
    ul.appendChild(li);
  });
}


// ==============================
// LOCK VISUAL
// ==============================
function updateLockVisual(lockState) {
  const lockBox = document.getElementById("lockBox");
  lockBox.className = "lock";

  if (lockState === "LOCKED") {
    lockBox.classList.add("locked");
    lockBox.innerText = "🔒";
  } else if (lockState === "UNLOCKING") {
    lockBox.classList.add("unstable");
    lockBox.innerText = "⚠️";
  } else {
    lockBox.classList.add("unlocked");
    lockBox.innerText = "🔓";
  }
}


// ==============================
// HIGH STRESS ALERT
// ==============================
function applyStressAlert(score) {
  const analyzer = document.querySelector(".analyzer-left");
  if (!analyzer) return;

  if (score >= 75) {
    analyzer.classList.add("alert");
  } else {
    analyzer.classList.remove("alert");
  }
}


// ==============================
// STRESS TREND CHART
// ==============================
function drawChart(data) {
  const canvas = document.getElementById("graph");
  if (!canvas || typeof Chart === "undefined") return;

  const ctx = canvas.getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((_, i) => `T${i + 1}`),
      datasets: [{
        data: data,
        borderColor: "#e50914",
        backgroundColor: "rgba(229,9,20,0.25)",
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 400 },
      scales: {
        y: { min: 0, max: 100 }
      },
      plugins: { legend: { display: false } }
    }
  });
}


// ==============================
// TERMINATION CONFIRMATION MODAL
// ==============================
function openModal() {
  const modal = document.getElementById("confirmModal");
  if (modal) modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("confirmModal");
  if (modal) modal.classList.add("hidden");
}

function confirmTerminate() {
  closeModal();
  terminateSession();
}


// ==============================
// KEYBOARD SHORTCUT (ESC)
// ==============================
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sessionActive) {
    openModal();
  }
});


// ==============================
// 🧩 PUZZLE FUNCTIONS
// ==============================
function openPuzzle() {
  const modal = document.getElementById("puzzleModal");
  if (!modal || !modal.classList.contains("hidden")) return;

  fetch("/puzzle")
    .then(r => r.json())
    .then(p => {
      document.getElementById("puzzleQuestion").innerText = p.question;
      document.getElementById("puzzleHint").innerText = "Hint: " + p.hint;
      document.getElementById("puzzleResult").innerText = "";
      document.getElementById("puzzleAnswer").value = "";
      modal.classList.remove("hidden");
    });
}

function closePuzzle() {
  document.getElementById("puzzleModal").classList.add("hidden");
}

function submitPuzzle() {
  const answer = document.getElementById("puzzleAnswer").value;

  fetch("/validate_puzzle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer })
  })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        document.getElementById("puzzleResult").innerText =
          "✅ Door Unlocked! Cognitive control achieved.";
        setTimeout(closePuzzle, 1500);
      } else {
        document.getElementById("puzzleResult").innerText =
          "❌ Incorrect. Try again.";
      }
    });
}