
(() => {
  const panel = document.getElementById("home-daphne");
  const form = document.getElementById("home-chat-form");
  const input = document.getElementById("home-chat-input");
  const log = document.getElementById("home-chat-log");
  const status = document.getElementById("home-ai-status");
  const count = document.getElementById("home-char-count");
  const suggestions = document.getElementById("home-chat-suggestions");
  const focusLink = document.getElementById("focus-daphne");

  if (!panel || !form || !input || !log) return;

  let messages = [];
  let turn = 0;
  let profile = {
    centerName: "",
    centerType: "",
    cabins: null,
    team: null,
    priority: "",
    goal: "",
    maturity: "In valutazione"
  };

  const refs = {
    center: document.getElementById("hm-center"),
    team: document.getElementById("hm-team"),
    cabins: document.getElementById("hm-cabins"),
    goal: document.getElementById("hm-goal")
  };

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[ch]);

  function append(role, text, tone = "") {
    const item = document.createElement("div");
    item.className = `home-chat-message ${role}${tone === "error" ? " error" : ""}`;
    item.innerHTML = `<span>${role === "user" ? "TU" : "DAPHNE"}</span><p>${escapeHtml(text)}</p>`;
    log.appendChild(item);
    log.scrollTop = log.scrollHeight;
  }

  function updateMemory() {
    const centerValue = profile.centerName || profile.centerType;
    refs.center.textContent = centerValue || "Centro da conoscere";
    refs.center.classList.toggle("known", Boolean(centerValue));

    refs.team.textContent = Number.isFinite(profile.team) ? `Team ${profile.team}` : "Team —";
    refs.team.classList.toggle("known", Number.isFinite(profile.team));

    refs.cabins.textContent = Number.isFinite(profile.cabins) ? `Cabine ${profile.cabins}` : "Cabine —";
    refs.cabins.classList.toggle("known", Number.isFinite(profile.cabins));

    const goalValue = profile.goal || profile.priority;
    refs.goal.textContent = goalValue || "Obiettivo da definire";
    refs.goal.classList.toggle("known", Boolean(goalValue));

    const cockpitName = document.querySelector(".cockpit-brand span");
    if (cockpitName && profile.centerName) cockpitName.textContent = profile.centerName;

    const cards = document.querySelectorAll(".cockpit-kpis article");
    cards.forEach(card => {
      card.classList.remove("cockpit-react");
      void card.offsetWidth;
      card.classList.add("cockpit-react");
    });
  }

  function setBusy(busy) {
    panel.classList.toggle("thinking", busy);
    input.disabled = busy;
    form.querySelector("button").disabled = busy;
    status.textContent = busy ? "sta riflettendo…" : "online";
  }

  function updateCount() {
    count.textContent = `${input.value.length} / 1800`;
  }

  async function askDaphne(text) {
    const response = await fetch("/api/daphne", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        message: text,
        messages: messages.slice(-10),
        profile,
        turn,
        maxTurns: 10
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Daphne non è disponibile in questo momento.");
    return data;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    turn += 1;
    append("user", value);
    messages.push({role:"user", content:value});
    input.value = "";
    updateCount();
    setBusy(true);

    try {
      const data = await askDaphne(value);
      const answer = data.answer || "Per capirti meglio ho bisogno di un dettaglio in più.";
      append("daphne", answer);
      messages.push({role:"assistant", content:answer});

      if (data.profile && typeof data.profile === "object") {
        profile = {...profile, ...data.profile};
        updateMemory();
      }

      if (data.conversion?.show) {
        const conversion = `${data.conversion.title || "Vuoi continuare?"}\n${data.conversion.copy || "Dentro AESTRA posso lavorare sui dati reali del tuo centro."}`;
        append("daphne", conversion);
      }

      if (data.endConversation || turn >= 10) {
        input.placeholder = "Continua la conversazione dentro AESTRA";
        input.disabled = true;
        form.querySelector("button").disabled = true;
        status.textContent = "prima lettura conclusa";
      } else {
        setBusy(false);
        input.focus();
      }
    } catch (error) {
      append("daphne", error.message, "error");
      setBusy(false);
      status.textContent = "non disponibile";
    }
  });

  input.addEventListener("input", updateCount);

  suggestions?.addEventListener("click", event => {
    const button = event.target.closest("[data-home-prompt]");
    if (!button) return;
    input.value = button.dataset.homePrompt;
    updateCount();
    input.focus();
  });

  focusLink?.addEventListener("click", () => {
    window.setTimeout(() => input.focus(), 350);
  });

  updateCount();
})();
