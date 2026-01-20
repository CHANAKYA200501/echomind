/* ==============================
   LIVE INSIGHTS (LATEST SESSION)
================================ */

fetch("/tick", { method: "POST" })
  .then(r => r.json())
  .then(d => {

    document.getElementById("cogState").innerText =
      `Cognitive State: ${d.cognitive_state}`;

    document.getElementById("boredom").innerText =
      d.boredom ? "⚠️ Boredom detected" : "Engagement normal";

    document.getElementById("drift").innerText =
      d.drift ? "🧠 Cognitive drift detected" : "No drift detected";

    document.getElementById("recovery").innerText =
      d.recovery ? `Recovery Speed: ${d.recovery}` : "Recovery: Stable";

    document.getElementById("intervention").innerText =
      d.intervention;

    const ul = document.getElementById("reasons");
    ul.innerHTML = "";
    d.reasons.forEach(r => {
      const li = document.createElement("li");
      li.innerText = r;
      ul.appendChild(li);
    });
  });


/* ==============================
   MULTI-SESSION HISTORY
================================ */

fetch("/sessions")
  .then(r => r.json())
  .then(data => {
    const ul = document.getElementById("sessionHistory");
    if (!ul) return;

    ul.innerHTML = "";

    data.reverse().forEach((s, i) => {
      const li = document.createElement("li");
      li.innerText =
        `Session ${i + 1} (${s.mode}) → Avg: ${s.avg}, Peak: ${s.peak}`;
      ul.appendChild(li);
    });
  });