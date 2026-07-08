/**
 * CHAT WIDGET — "Preguntale a los datos"
 * Municipio de Tres de Febrero — Análisis Presupuestario
 *
 * Cómo instalarlo:
 * 1. Subí este archivo a la raíz del repo (junto a datos.js y render.js).
 * 2. En index.html, agregá esta línea DESPUÉS de <script src="datos.js"></script>
 *    y de render.js, justo antes de </body>:
 *
 *      <script src="chat-widget.js"></script>
 *
 * 3. Reemplazá WORKER_URL de abajo por la URL de tu Worker de Cloudflare
 *    (te la da Cloudflare al hacer deploy, algo como
 *    https://tu-worker.tu-usuario.workers.dev)
 */

(function () {
  // ⚠️ CAMBIAR ESTO por la URL real de tu Worker una vez desplegado
  const WORKER_URL = "https://presupuesto-3df-chat.franco-d-iuliani.workers.dev/";

  // --- Estilos (usa las mismas variables CSS que ya tiene la web) ---
  const style = document.createElement("style");
  style.textContent = `
    #agente3f-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: var(--teal, #1d6fa4); color: #fff; border: none;
      border-radius: 999px; padding: 14px 20px; font-family: inherit;
      font-size: 14px; font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      display: flex; align-items: center; gap: 8px;
      transition: transform 0.15s ease;
    }
    #agente3f-btn:hover { transform: scale(1.04); }
    #agente3f-panel {
      position: fixed; bottom: 90px; right: 24px; z-index: 9999;
      width: 360px; max-width: calc(100vw - 32px); height: 480px;
      max-height: calc(100vh - 140px);
      background: var(--card, #fff); border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.28);
      display: none; flex-direction: column; overflow: hidden;
      border: 1px solid var(--borde, #e5e7eb);
      font-family: inherit;
    }
    #agente3f-panel.open { display: flex; }
    #agente3f-header {
      background: var(--navy, #1a2332); color: #fff; padding: 14px 16px;
      font-size: 14px; font-weight: 700; display: flex;
      justify-content: space-between; align-items: center;
    }
    #agente3f-header span.sub { font-weight: 400; opacity: 0.75; font-size: 11px; display:block; margin-top:2px;}
    #agente3f-close { cursor: pointer; background: none; border: none; color: #fff; font-size: 18px; line-height:1;}
    #agente3f-messages {
      flex: 1; overflow-y: auto; padding: 14px; font-size: 13.5px;
      display: flex; flex-direction: column; gap: 10px;
      background: var(--bg, #f7f8fa);
    }
    .a3f-msg { padding: 9px 12px; border-radius: 10px; max-width: 88%; line-height: 1.45; }
    .a3f-msg.user { align-self: flex-end; background: var(--teal, #1d6fa4); color: #fff; }
    .a3f-msg.bot { align-self: flex-start; background: var(--card, #fff); color: var(--ink, #111827); border: 1px solid var(--borde, #e5e7eb); }
    .a3f-msg.bot.loading { color: var(--ink3, #6b7280); font-style: italic; }
    #agente3f-inputrow { display: flex; border-top: 1px solid var(--borde, #e5e7eb); }
    #agente3f-input {
      flex: 1; border: none; padding: 12px 14px; font-size: 13.5px;
      font-family: inherit; outline: none; background: var(--card, #fff); color: var(--ink,#111827);
    }
    #agente3f-send {
      border: none; background: var(--teal, #1d6fa4); color: #fff;
      padding: 0 16px; cursor: pointer; font-weight: 600; font-size: 13px;
    }
    #agente3f-send:disabled { opacity: 0.5; cursor: default; }
  `;
  document.head.appendChild(style);

  // --- Botón flotante ---
  const btn = document.createElement("button");
  btn.id = "agente3f-btn";
  btn.innerHTML = "💬 Preguntale a los datos";
  document.body.appendChild(btn);

  // --- Panel del chat ---
  const panel = document.createElement("div");
  panel.id = "agente3f-panel";
  panel.innerHTML = `
    <div id="agente3f-header">
      <div>
        Asistente presupuestario
        <span class="sub">Responde en base a los datos RAFAM cargados</span>
      </div>
      <button id="agente3f-close">✕</button>
    </div>
    <div id="agente3f-messages"></div>
    <div id="agente3f-inputrow">
      <input id="agente3f-input" type="text" placeholder="Ej: ¿cuánto se gastó en Higiene Urbana en 2025?" />
      <button id="agente3f-send">Enviar</button>
    </div>
  `;
  document.body.appendChild(panel);

  const messagesEl = panel.querySelector("#agente3f-messages");
  const inputEl = panel.querySelector("#agente3f-input");
  const sendBtn = panel.querySelector("#agente3f-send");

  addMsg("bot", "Hola, Franco. Preguntame sobre el presupuesto de Tres de Febrero (recursos, gastos por secretaría, personal, deuda, variaciones interanuales) y te respondo con los datos cargados en la web.");

  btn.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) inputEl.focus();
  });
  panel.querySelector("#agente3f-close").addEventListener("click", () => panel.classList.remove("open"));

  sendBtn.addEventListener("click", send);
  inputEl.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });

  async function send() {
    const question = inputEl.value.trim();
    if (!question) return;
    addMsg("user", question);
    inputEl.value = "";
    sendBtn.disabled = true;
    const loadingEl = addMsg("bot", "Pensando...", true);

    try {
      // Serializamos los datos globales que ya están cargados en la página
      const dataContext = JSON.stringify({
        DATA: window.DATA ?? {},
        SEC_EQUIV: window.SEC_EQUIV ?? {},
        PROG_EQUIV: window.PROG_EQUIV ?? {},
      });

      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, dataContext }),
      });

      const json = await res.json();
      loadingEl.remove();

      if (!res.ok || json.error) {
        addMsg("bot", "Uh, hubo un error consultando los datos. Probá de nuevo en un momento.");
      } else {
        addMsg("bot", json.answer);
      }
    } catch (err) {
      loadingEl.remove();
      addMsg("bot", "No se pudo conectar con el asistente. Revisá tu conexión.");
    } finally {
      sendBtn.disabled = false;
    }
  }

  function addMsg(role, text, loading = false) {
    const div = document.createElement("div");
    div.className = `a3f-msg ${role}` + (loading ? " loading" : "");
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }
})();
