(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const state = {
    duration: null,
    cuts: [],
    jobId: null,
    poll: null,
  };

  // ---------- utilidades ----------

  function fmt(seconds) {
    const total = Math.round(seconds * 1000);
    const h = Math.floor(total / 3600000);
    const m = Math.floor((total % 3600000) / 60000);
    const s = Math.floor((total % 60000) / 1000);
    const ms = total % 1000;
    const pad = (n, w = 2) => String(n).padStart(w, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}` + (ms ? `.${pad(ms, 3)}` : "");
  }

  function setMessage(text, kind = "") {
    const el = $("message");
    el.textContent = text;
    el.className = "message" + (kind ? " " + kind : "");
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    let data = {};
    try { data = await res.json(); } catch (_) { /* resposta sem JSON */ }
    if (!res.ok) {
      const error = new Error(data.error || `Erro ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return data;
  }

  // ---------- estado do ffmpeg ----------

  async function checkStatus() {
    const pill = $("ffmpeg-state");
    try {
      const status = await api("/api/status");
      if (status.ready) {
        pill.textContent = "ffmpeg pronto";
        pill.className = "pill ok";
        $("setup-banner").classList.add("hidden");
      } else {
        pill.textContent = "ffmpeg em falta";
        pill.className = "pill bad";
        $("setup-banner").classList.remove("hidden");
      }
    } catch (_) {
      pill.textContent = "servidor offline";
      pill.className = "pill bad";
    }
  }

  // ---------- análise do vídeo ----------

  async function analyzeVideo() {
    const path = $("video-path").value.trim();
    const info = $("video-info");
    if (!path) {
      info.textContent = "Introduza o caminho do vídeo.";
      return;
    }
    info.textContent = "A analisar…";
    try {
      const data = await api("/api/probe", {
        method: "POST",
        body: JSON.stringify({ path }),
      });
      state.duration = data.duration;
      info.textContent =
        `Duração ${fmt(data.duration)} · ${data.width}×${data.height}` +
        (data.has_audio ? " · com áudio" : " · sem áudio");
      info.className = "muted small";
    } catch (err) {
      state.duration = null;
      info.textContent = err.message;
      info.className = "small";
      info.style.color = "var(--bad)";
    }
  }

  // ---------- cortes ----------

  function emptyCut(extra = {}) {
    return { start: "", end: "", title: "", ...extra };
  }

  function renderCuts() {
    const container = $("cut-rows");
    container.innerHTML = "";
    state.cuts.forEach((cut, i) => {
      const row = document.createElement("div");
      row.className = "cut-row";
      row.innerHTML = `
        <input type="text" placeholder="Início" aria-label="Início do corte ${i + 1}" value="">
        <input type="text" placeholder="Fim" aria-label="Fim do corte ${i + 1}" value="">
        <input type="text" class="title-field" placeholder="Título (opcional)" aria-label="Título do corte ${i + 1}" value="">
        <button type="button" class="icon" title="Remover corte" aria-label="Remover corte ${i + 1}">×</button>
      `;
      const [startIn, endIn, titleIn] = row.querySelectorAll("input");
      startIn.value = cut.start;
      endIn.value = cut.end;
      titleIn.value = cut.title;
      startIn.addEventListener("input", () => { cut.start = startIn.value; });
      endIn.addEventListener("input", () => { cut.end = endIn.value; });
      titleIn.addEventListener("input", () => { cut.title = titleIn.value; });
      row.querySelector("button").addEventListener("click", () => {
        state.cuts.splice(i, 1);
        if (state.cuts.length === 0) state.cuts.push(emptyCut());
        renderCuts();
      });
      container.appendChild(row);
    });
  }

  function addCut(cut = emptyCut()) {
    state.cuts.push(cut);
    renderCuts();
  }

  // Aceita: "início - fim - título", "início<TAB>fim<TAB>título" ou "início;fim;título"
  function parsePasteLine(line) {
    const parts = line.split(/\s*[-–;\t]\s*/);
    if (parts.length < 2) return null;
    const [start, end, ...rest] = parts;
    return emptyCut({ start: start.trim(), end: end.trim(), title: rest.join(" - ").trim() });
  }

  function pasteCuts() {
    const lines = $("paste-box").value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsed = lines.map(parsePasteLine);
    const valid = parsed.filter(Boolean);
    if (valid.length === 0) {
      setMessage("Nenhuma linha válida. Use: início - fim - título", "bad");
      return;
    }
    const onlyEmpty = state.cuts.length === 1 && !state.cuts[0].start && !state.cuts[0].end && !state.cuts[0].title;
    if (onlyEmpty) state.cuts = [];
    state.cuts.push(...valid);
    renderCuts();
    $("paste-box").value = "";
    const skipped = parsed.length - valid.length;
    setMessage(
      `${valid.length} corte(s) adicionado(s).` + (skipped ? ` ${skipped} linha(s) ignorada(s).` : ""),
      skipped ? "" : "ok"
    );
  }

  // ---------- geração ----------

  function collectPayload() {
    const videoPath = $("video-path").value.trim();
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const outputDir = $("output-dir").value.trim();
    const cuts = state.cuts
      .filter((c) => c.start || c.end || c.title)
      .map((c) => ({ start: c.start, end: c.end, title: c.title }));
    return { video: videoPath, mode, output_dir: outputDir, cuts };
  }

  async function generate() {
    const payload = collectPayload();
    if (!payload.video) {
      setMessage("Introduza o caminho do vídeo.", "bad");
      return;
    }
    if (payload.cuts.length === 0) {
      setMessage("Adicione pelo menos um corte.", "bad");
      return;
    }

    $("generate-btn").disabled = true;
    setMessage("A iniciar…");
    try {
      const data = await api("/api/jobs", { method: "POST", body: JSON.stringify(payload) });
      state.jobId = data.id;
      setMessage("");
      showProgress(payload);
      startPolling();
    } catch (err) {
      setMessage(err.message, "bad");
      $("generate-btn").disabled = false;
    }
  }

  function showProgress(payload) {
    $("progress-card").classList.remove("hidden");
    $("open-folder").textContent = "";
    $("clip-list").innerHTML = "";
    payload.cuts.forEach((cut, i) => {
      const li = document.createElement("li");
      li.dataset.index = String(i);
      li.innerHTML = `<span class="name"></span><span class="status s-pending">à espera</span>`;
      li.querySelector(".name").textContent = `${String(i + 1).padStart(2, "0")} · ${cut.title || "Corte " + (i + 1)}`;
      $("clip-list").appendChild(li);
    });
    updateBar(0, payload.cuts.length);
  }

  function updateBar(done, total) {
    const pct = total ? Math.round((done / total) * 100) : 0;
    $("bar-fill").style.width = pct + "%";
    $("progress-text").textContent = `${done} de ${total} cortes concluídos`;
  }

  function renderJob(job) {
    const items = $("clip-list").children;
    let finished = 0;
    job.clips.forEach((clip, i) => {
      const li = items[i];
      if (!li) return;
      const status = li.querySelector(".status");
      const labels = { pending: "à espera", running: "a gerar…", done: "pronto", error: "erro" };
      status.textContent = labels[clip.status] || clip.status;
      status.className = "status s-" + (clip.status === "pending" ? "pending" : clip.status === "running" ? "running" : clip.status);
      const existing = li.querySelector(".detail");
      if (clip.status === "error" && clip.error) {
        if (!existing) {
          const d = document.createElement("div");
          d.className = "detail";
          d.textContent = clip.error;
          li.appendChild(d);
        }
      } else if (existing) {
        existing.remove();
      }
      if (clip.status === "done" || clip.status === "error") finished++;
    });
    updateBar(finished, job.clips.length);
  }

  function startPolling() {
    stopPolling();
    state.poll = setInterval(async () => {
      try {
        const job = await api(`/api/jobs/${state.jobId}`);
        renderJob(job);
        if (job.status !== "running") {
          stopPolling();
          finish(job);
        }
      } catch (err) {
        stopPolling();
        setMessage(err.message, "bad");
        $("generate-btn").disabled = false;
      }
    }, 800);
  }

  function stopPolling() {
    if (state.poll) clearInterval(state.poll);
    state.poll = null;
  }

  function finish(job) {
    $("generate-btn").disabled = false;
    const kind = job.status === "done" ? "ok" : "bad";
    $("progress-text").textContent = job.finished_message;
    $("open-folder").textContent = `Pasta de saída: ${job.output_dir}`;
    setMessage(job.finished_message, kind);
  }

  // ---------- arranque ----------

  function init() {
    $("analyze-btn").addEventListener("click", analyzeVideo);
    $("video-path").addEventListener("keydown", (e) => { if (e.key === "Enter") analyzeVideo(); });
    $("video-path").addEventListener("change", () => {
      state.duration = null;
      $("video-info").textContent = "Clique em Analisar para ver a duração.";
      $("video-info").style.color = "";
    });
    $("add-cut-btn").addEventListener("click", () => addCut());
    $("paste-btn").addEventListener("click", pasteCuts);
    $("generate-btn").addEventListener("click", generate);

    if (state.cuts.length === 0) state.cuts.push(emptyCut());
    renderCuts();
    checkStatus();
  }

  init();
})();
