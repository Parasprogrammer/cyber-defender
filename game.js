(function () {
  'use strict';


  const STORAGE_KEY = 'cyberDefenderState_v2';

  function defaultState() {
    return {
      levelStars: {},
      levelLoss: {},
      totalXP: 0,
      badges: [],
      certName: '',
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) {
      return defaultState();
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  let state = loadState();

  // Mission content lives in scenarios.js
  const LEVELS = CYBER_LEVELS;


  const $ = (sel, root) => (root || document).querySelector(sel);
  const screenEl = $('#screen');

  function rupees(n) {
    return '₹' + n.toLocaleString('en-IN');
  }

  function starsHtml(count) {
    return [1, 2, 3].map((n) => `<span class="${n <= count ? '' : 'dim'}">⭐</span>`).join('');
  }

  function lossExcept(levelId) {
    return Object.keys(state.levelLoss)
      .filter((id) => +id !== levelId)
      .reduce((sum, id) => sum + state.levelLoss[id], 0);
  }

  function bankBalance() {
    return Math.max(0, START_BALANCE - lossExcept(null));
  }


  const BADGES = [
    { id: 'first-steps', icon: '👣', name: 'First Steps', desc: 'Finish your first mission' },
    ...LEVELS.map((l) => ({ id: l.badge.id, icon: l.badge.icon, name: l.badge.name, desc: `3 stars in Mission ${l.id}` })),
    { id: 'cyber-defender', icon: '🛡️', name: 'Cyber Defender', desc: `Finish all ${LEVELS.length} missions` },
  ];

  function awardBadge(id) {
    if (state.badges.includes(id)) return;
    state.badges.push(id);
    saveState();
    const b = BADGES.find((x) => x.id === id);
    if (b) showToast(`${b.icon} Badge unlocked`, b.name);
    updateHudChrome();
  }

  function showToast(title, sub) {
    const stack = $('#toast-stack');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<b>${title}</b><span>${sub}</span>`;
    stack.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }

  function updateHudChrome() {
    $('#hud-xp').textContent = state.totalXP;
    $('#hud-badge-count').textContent = state.badges.length;
    $('#hud-balance').textContent = rupees(bankBalance());
  }


  function scoreToStars(score) {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 40) return 1;
    return 0;
  }

  function allMissionsCleared() {
    return LEVELS.every((l) => (state.levelStars[l.id] || 0) > 0);
  }

  function completeLevel(lvl, rawScore, loss) {
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));
    const stars = scoreToStars(score);
    const xpGain = 50 + score;

    state.totalXP += xpGain;
    if (stars > (state.levelStars[lvl.id] || 0)) state.levelStars[lvl.id] = stars;
  
    const prevLoss = state.levelLoss[lvl.id];
    if (prevLoss === undefined || loss < prevLoss) state.levelLoss[lvl.id] = loss;

    awardBadge('first-steps');
    if (stars === 3) awardBadge(lvl.badge.id);
    if (allMissionsCleared()) awardBadge('cyber-defender');

    saveState();
    updateHudChrome();
    return { score, stars, xpGain, loss };
  }


  const COMMON_PASSWORDS = [
    'password', 'qwerty', 'abc', 'iloveyou', 'admin', 'welcome', 'monkey', 'letmein', 'dragon',
    'india', 'sachin', 'krishna', 'sairam', 'omsairam', 'ganesh', 'princess', 'sunshine', 'football', 'cricket',
  ];
  const STRONG_SECONDS = 100 * 365 * 24 * 3600;

  function crackSeconds(pw) {
    if (!pw) return 0;
    const letters = pw.toLowerCase().replace(/[^a-z]/g, '');
    if (!letters && pw.length < 12) return 0;
    if (COMMON_PASSWORDS.includes(letters)) return 0;

    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/\d/.test(pw)) pool += 10;
    if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
    let bits = pw.length * Math.log2(pool);

    // Predictable shapes attackers try first: Name@123, word2005, etc.
    if (/^[A-Za-z][a-z]+[@#$!]?\d{0,4}[@#$!]?$/.test(pw)) bits = Math.min(bits, 34);
    if (/(19|20)\d{2}/.test(pw)) bits -= 10;
    if (/(.)\1{2,}/.test(pw)) bits -= 8;
    if (/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf)/i.test(pw)) bits -= 10;

    return Math.pow(2, Math.max(bits, 1)) / 2 / 1e10;
  }

  function crackPhrase(s) {
    if (s < 1) return 'instantly';
    const years = s / 31536000;
    if (years >= 1e9) return 'in billions of years';
    if (years >= 1e6) return 'in millions of years';
    if (years >= 1000) return `in ${Math.round(years / 1000).toLocaleString('en-IN')} thousand years`;
    const units = [['year', 31536000], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
    for (const [name, size] of units) {
      if (s >= size) {
        const n = Math.round(s / size);
        return `in ${n} ${name}${n === 1 ? '' : 's'}`;
      }
    }
    return 'instantly';
  }


  function playDevice(lvl, ctx) {
    const { stage, meta, finish } = ctx;
    const scenarios = lvl.scenarios;
    const total = scenarios.length;
    const otherLoss = lossExcept(lvl.id);
    let idx = 0, done = 0, safeCount = 0, runLoss = 0;
    let sc = null, step = null, header = null, thread = [], shown = 0;
    let actions = [], timers = [], ending = false;
    let pin = '', showAddress = false, sheet = null;
    let screen = null, side = null, currentDevice = null;

    function mountDevice(device) {
      if (device === currentDevice) return;
      currentDevice = device;
      const frame = device === 'laptop'
        ? '<div class="laptop"><div class="laptop-screen" id="dev-screen"></div><div class="laptop-base"></div></div>'
        : '<div class="phone"><div class="phone-screen" id="dev-screen"></div></div>';
      stage.innerHTML = `
        <div class="device-layout${device === 'laptop' ? ' is-laptop' : ''}">
          ${frame}
          <div class="device-side" id="dev-side"></div>
        </div>
      `;
      screen = $('#dev-screen', stage);
      side = $('#dev-side', stage);
    }

    function clock() {
      return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    function initials(name) {
      const words = name.replace(/[^A-Za-z ]/g, '').trim().split(/\s+/).filter(Boolean);
      return words.length ? words.slice(0, 2).map((w) => w[0]).join('').toUpperCase() : '#';
    }

    function clearTimers() {
      timers.forEach(clearTimeout);
      timers = [];
    }

    function later(fn, ms) {
      timers.push(setTimeout(() => { if (stage.isConnected) fn(); }, ms));
    }

    function reg(a) {
      actions.push(a);
      return actions.length - 1;
    }


    const choiceOrder = new Map();
    function shuffled(list) {
      if (!choiceOrder.has(list)) {
        const a = list.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        choiceOrder.set(list, a);
      }
      return choiceOrder.get(list);
    }

    function updateMeta() {
      meta.innerHTML = `
        <span class="meta-pill">Balance ${rupees(Math.max(0, START_BALANCE - otherLoss - runLoss))}</span>
        <span class="meta-pill">Safe ${safeCount}/${done}</span>
        <span class="meta-pill">${Math.min(idx + 1, total)}/${total}</span>
      `;
    }

    function paint(html) {
      screen.innerHTML = html;
      screen.querySelectorAll('[data-act]').forEach((el) =>
        el.addEventListener('click', () => act(actions[+el.dataset.act]))
      );
      const scroller = screen.querySelector('.chat-body, .call-lines');
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }


    function statusBar(dark) {
      return `<div class="status-bar${dark ? ' dark' : ''}"><span>${clock()}</span><span>4G · 82%</span></div>`;
    }

    function appBar(title, sub, avatar) {
      return `<div class="app-bar">
        <span class="app-back">‹</span>
        ${avatar ? `<div class="app-avatar">${initials(title)}</div>` : ''}
        <div><div class="app-title">${title}</div>${sub ? `<div class="app-sub">${sub}</div>` : ''}</div>
      </div>`;
    }

    function actionsHtml(list, extraClass) {
      return `<div class="phone-actions${extraClass ? ' ' + extraClass : ''}">
        ${shuffled(list).map((a) => `<button class="phone-btn" data-act="${reg(a)}">${a.label}</button>`).join('')}
      </div>`;
    }

    function blocksHtml(blocks) {
      return blocks.map((b) => {
        if (b.t === 'h') return `<div class="blk-h">${b.text}</div>`;
        if (b.t === 'p') return `<p class="blk-p">${b.text}</p>`;
        if (b.t === 'muted') return `<p class="blk-muted">${b.text}</p>`;
        if (b.t === 'note') return `<div class="blk-note">${b.text}</div>`;
        if (b.t === 'card') return `<div class="blk-card"><b>${b.text}</b>${b.sub ? `<span>${b.sub}</span>` : ''}</div>`;
        if (b.t === 'field') return `<div class="blk-field"><span>${b.label}</span><div>${b.value || '&nbsp;'}</div></div>`;
        return '';
      }).join('');
    }

    function lockHtml(notes, hint) {
      const date = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
      return `<div class="lock-screen">${statusBar(true)}
        <div class="lock-time">${clock()}</div>
        <div class="lock-date">${date}</div>
        <div class="lock-notes">${notes}</div>
        <div class="lock-hint">${hint || ''}</div>
      </div>`;
    }

    function noteHtml(n, actIdx) {
      const open = actIdx == null ? '<div class="lock-note static">' : `<button class="lock-note" data-act="${actIdx}">`;
      const close = actIdx == null ? '</div>' : '</button>';
      return `${open}<div class="lock-note-top"><span>${n.app}</span><span>now</span></div><b>${n.from}</b>${n.preview}${close}`;
    }

   
    function qrSvg() {
      const n = 25;
      let seed = 7;
      const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      const inFinder = (x, y) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);
      let cells = '';
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          if (!inFinder(x, y) && rand() < 0.5) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
        }
      }
      const finder = (fx, fy) => `<rect x="${fx}" y="${fy}" width="7" height="7"/><rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" fill="#fff"/><rect x="${fx + 2}" y="${fy + 2}" width="3" height="3"/>`;
      return `<svg class="qr-code" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges">
        <rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/>
        <g fill="#151719">${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}${cells}</g>
      </svg>`;
    }

    function desktopHtml(inner, toast) {
      return `<div class="desktop">
        ${inner}
        ${toast ? `<div class="desk-toast"><b>${toast.from}</b>${toast.text}</div>` : ''}
      </div>
      <div class="taskbar"><span class="taskbar-start"></span><span>${clock()}</span></div>`;
    }

    /* ---------- scenario flow ---------- */
    function startScenario() {
      clearTimers();
      ending = false;
      if (idx >= total) {
        finish(Math.round((safeCount / total) * 100), runLoss);
        return;
      }
      sc = scenarios[idx];
      mountDevice(sc.device || lvl.device || 'phone');
      updateMeta();
      thread = []; shown = 0; header = null;
      side.innerHTML = `
        <div class="side-label">Situation ${idx + 1} of ${total}</div>
        <h3>${sc.title}</h3>
        <p>${sc.setup}</p>
        <div class="side-hint">Use the ${currentDevice} the way you normally would. Nobody will tell you which choice is right until it's over.</div>
      `;
      if (!sc.notify) { showStep(sc.start); return; }
      actions = [];
      paint(lockHtml('', ''));
      later(() => {
        actions = [];
        paint(lockHtml(noteHtml(sc.notify, reg({ go: sc.start })), 'Tap the notification to open it'));
      }, 900);
    }

    function act(a) {
      if (!a || ending) return;
      if (a.end && a.say && step && (step.view === 'chat' || step.view === 'call')) {
        // Show the player's reply before the scenario closes.
        ending = true;
        thread.push({ from: 'me', text: a.say });
        shown = thread.length;
        drawThread(true);
        later(() => endScenario(a.end), 1200);
        return;
      }
      if (a.say) thread.push({ from: 'me', text: a.say });
      if (a.end) endScenario(a.end);
      else showStep(a.go);
    }

    function showStep(id) {
      clearTimers();
      step = sc.steps[id];
      actions = [];

      switch (step.view) {
        case 'chat':
        case 'call': {
          const contact = step.contact || step.name;
          if (contact && (!header || header.contact !== contact)) {
            thread = []; shown = 0;
            header = { contact, sub: step.sub || '' };
          }
          const incoming = step.view === 'call' ? step.lines.map((text) => ({ from: 'them', text })) : step.messages;
          thread.push(...incoming);
          revealThread();
          break;
        }
        case 'ring':
          header = { contact: step.name, sub: step.number };
          paint(`<div class="call-screen">${statusBar(true)}
            <div class="call-head">
              <div class="app-avatar">${initials(step.name)}</div>
              <div class="call-name">${step.name}</div>
              <div class="call-number">${step.number}</div>
              <div class="call-state">Incoming call…</div>
            </div>
            <div class="ring-buttons">
              <button class="ring-btn ring-decline" data-act="${reg(step.decline)}"><span>✕</span>Decline</button>
              <button class="ring-btn ring-accept" data-act="${reg(step.accept)}"><span>✆</span>Accept</button>
            </div>
          </div>`);
          break;
        case 'browser':
          paint(`${statusBar(false)}
            <div class="browser-bar">
              <div class="browser-url">${step.url}</div>
              <button class="browser-close" data-act="${reg(step.close)}">${step.close.label}</button>
            </div>
            <div class="site-page">
              <div class="site-banner">${step.heading}</div>
              <div class="site-note">${step.note}</div>
              <form class="site-form" id="site-form">
                ${step.fields.map((f) => `<label>${f}<input type="${/password|otp|cvv/i.test(f) ? 'password' : 'text'}" autocomplete="off" /></label>`).join('')}
                <button type="submit" class="site-submit">${step.submit.label}</button>
              </form>
            </div>`);
          $('#site-form', screen).addEventListener('submit', (e) => {
            e.preventDefault();
            act(step.submit);
          });
          break;
        case 'upi':
          paint(`${statusBar(false)}
            ${appBar('UPI', step.label)}
            <div class="upi-card">
              <div class="upi-label">${step.label}</div>
              <div class="app-avatar upi-avatar">${initials(step.payee)}</div>
              <div class="upi-payee">${step.payee}</div>
              <div class="upi-vpa">${step.vpa}</div>
              <div class="upi-amount">${rupees(step.amount)}</div>
              <div class="upi-note">${step.note}</div>
              <div class="upi-buttons">
                <button class="upi-decline" data-act="${reg(step.decline)}">Decline</button>
                <button class="upi-pay" data-act="${reg(step.pay)}">Pay</button>
              </div>
            </div>`);
          break;
        case 'pin':
          pin = '';
          drawPin();
          break;
        case 'inbox':
          paint(`${statusBar(false)}
            ${appBar('Inbox', 'Mail')}
            <div class="inbox">
              ${step.items.map((m) => `<button class="inbox-row unread" data-act="${reg({ go: m.go })}">
                <div class="inbox-top"><b>${m.from}</b><span>now</span></div>
                <div class="inbox-subject">${m.subject}</div>
                <div class="inbox-preview">${m.preview}</div>
              </button>`).join('')}
              ${OLD_MAIL.map((m) => `<div class="inbox-row">
                <div class="inbox-top"><span>${m.from}</span><span>${m.time}</span></div>
                <div class="inbox-subject">${m.subject}</div>
                <div class="inbox-preview">${m.preview}</div>
              </div>`).join('')}
            </div>`);
          break;
        case 'mail':
          showAddress = false;
          sheet = null;
          drawMail();
          break;
        case 'signup':
          drawSignup();
          break;
        case 'app':
          paint(`${statusBar(false)}
            ${appBar(step.app, step.title)}
            <div class="app-body">${blocksHtml(step.blocks)}</div>
            ${actionsHtml(step.actions)}`);
          break;
        case 'dialog':
          paint(`${statusBar(false)}
            ${appBar(step.app)}
            <div class="app-body dimmed">${blocksHtml(step.behind || [])}</div>
            <div class="sys-dialog-wrap">
              <div class="sys-dialog">
                <div class="sys-title">${step.title}</div>
                ${step.text ? `<div class="sys-text">${step.text}</div>` : ''}
                <div class="sys-actions">
                  ${step.actions.map((a) => `<button data-act="${reg(a)}">${a.label}</button>`).join('')}
                </div>
              </div>
            </div>`);
          break;
        case 'wifi':
          paint(`${statusBar(false)}
            ${appBar('Wi-Fi', 'Settings')}
            <div class="app-body">
              <p class="blk-muted">Available networks</p>
              ${step.networks.map((n) => {
                const tag = n.go ? 'button' : 'div';
                const attr = n.go ? ` data-act="${reg({ go: n.go })}"` : '';
                return `<${tag} class="wifi-row"${attr}>
                  <div><b>${n.name}</b><span>${n.note || (n.secure ? 'Secured' : 'Open network')}</span></div>
                  <span class="wifi-lock">${n.secure ? '🔒' : ''}</span>
                </${tag}>`;
              }).join('')}
            </div>
            ${actionsHtml(step.actions)}`);
          break;
        case 'qr':
          paint(`<div class="qr-screen">${statusBar(true)}
            <div class="qr-frame">${qrSvg()}</div>
            <div class="qr-result">
              <div class="qr-label">QR code detected</div>
              <code>${step.payload}</code>
            </div>
            ${actionsHtml(step.actions, 'dark')}
          </div>`);
          break;
        case 'window':
          paint(desktopHtml(`
            <div class="win${step.alert ? ' win-alert' : ''}">
              <div class="win-title"><span>${step.title}</span><span class="win-ctrl">—&nbsp;&nbsp;▢&nbsp;&nbsp;✕</span></div>
              <div class="win-body">
                ${step.lines.map((l) => `<p>${l}</p>`).join('')}
                ${step.files ? `<div class="win-files">${step.files.map((f) => `<div class="win-file">${f}</div>`).join('')}</div>` : ''}
              </div>
              <div class="win-actions">
                ${shuffled(step.actions).map((a) => `<button data-act="${reg(a)}">${a.label}</button>`).join('')}
              </div>
            </div>`));
          break;
      }
    }

    /* ---------- chat & call threads ---------- */
    function revealThread() {
      drawThread(false);
      if (shown >= thread.length) return;
      const delay = thread[shown].from === 'me' ? 300 : 1000;
      later(() => {
        shown++;
        revealThread();
      }, delay);
    }

    function drawThread(hideActions) {
      actions = [];
      const pending = shown < thread.length;
      const dots = '<span></span><span></span><span></span>';
      const typing = pending && thread[shown].from === 'them';
      const acts = pending || hideActions ? '' : actionsHtml(step.actions, step.view === 'call' ? 'dark' : '');

      if (step.view === 'call') {
        const lines = thread.slice(0, shown).map((m) => `<div class="call-line${m.from === 'me' ? ' me' : ''}">${m.text}</div>`).join('');
        paint(`<div class="call-screen">${statusBar(true)}
          <div class="call-head">
            <div class="call-name">${header.contact}</div>
            <div class="call-state">On call${header.sub ? ' · ' + header.sub : ''}</div>
          </div>
          <div class="call-lines">${lines}${typing ? `<div class="call-line typing">${dots}</div>` : ''}</div>
          ${acts}
        </div>`);
        return;
      }

      const msgs = thread.slice(0, shown).map((m) => {
        if (m.file) {
          return `<button class="msg msg-them msg-file" data-act="${reg({ go: m.file.go })}">
            <span class="file-icon"></span><span><b>${m.file.name}</b><small>${m.file.size}</small></span>
          </button>`;
        }
        const link = m.link ? ` <a class="msg-link" data-act="${reg({ go: m.link.go })}">${m.link.url}</a>` : '';
        return `<div class="msg msg-${m.from}">${m.text}${link}</div>`;
      }).join('');
      paint(`${statusBar(false)}
        ${appBar(header.contact, header.sub, true)}
        <div class="chat-body">${msgs}${typing ? `<div class="msg msg-them typing">${dots}</div>` : ''}</div>
        ${acts}`);
    }

    /* ---------- email ---------- */
    function drawMail() {
      actions = [];
      const linkHtml = step.link ? `<p><a class="mail-link" id="mail-link">${step.link.text}</a></p>` : '';
      const attachHtml = step.attachment
        ? `<button class="mail-attach" data-act="${reg({ go: step.attachment.go })}"><span class="file-icon"></span><span><b>${step.attachment.name}</b><small>${step.attachment.size}</small></span></button>`
        : '';
      const sheetHtml = sheet ? `<div class="sheet-wrap"><div class="sheet">
          <div class="sheet-label">This link goes to</div>
          <div class="sheet-url">${sheet.url}</div>
          <button class="sheet-btn" data-act="${reg(sheet)}">Open link</button>
          <button class="sheet-btn ghost" id="sheet-cancel">Cancel</button>
        </div></div>` : '';
      paint(`${statusBar(false)}
        ${appBar('Inbox', 'Mail')}
        <div class="mail-body">
          <div class="mail-subject">${step.subject}</div>
          <button class="mail-from" id="mail-from">
            <div class="app-avatar">${initials(step.from)}</div>
            <div><b>${step.from}</b><span>${showAddress ? step.address : 'to me · tap to see address'}</span></div>
          </button>
          <div class="mail-text">${step.body.map((p) => `<p>${p}</p>`).join('')}${linkHtml}</div>
          ${attachHtml}
        </div>
        ${actionsHtml(step.actions)}
        ${sheetHtml}`);
      $('#mail-from', screen).addEventListener('click', () => { showAddress = !showAddress; drawMail(); });
      const link = $('#mail-link', screen);
      if (link) link.addEventListener('click', () => { sheet = step.link; drawMail(); });
      const cancel = $('#sheet-cancel', screen);
      if (cancel) cancel.addEventListener('click', () => { sheet = null; drawMail(); });
    }

    /* ---------- password signup ---------- */
    function drawSignup() {
      paint(`${statusBar(false)}
        ${appBar(step.app, 'Create account')}
        <div class="app-body">
          <div class="blk-h">Create your ${step.app} account</div>
          <label class="app-field">Email<input value="${step.email}" disabled /></label>
          <label class="app-field">Password<input id="pw-input" type="text" autocomplete="off" spellcheck="false" placeholder="Make up a new one" /></label>
          <div class="pw-meter"><div class="pw-meter-fill" id="pw-fill"></div></div>
          <div class="pw-verdict" id="pw-verdict">Start typing to see how fast it could be cracked.</div>
          <button class="site-submit" id="pw-submit" disabled>Create account</button>
        </div>`);
      const input = $('#pw-input', screen);
      const fill = $('#pw-fill', screen);
      const verdict = $('#pw-verdict', screen);
      const submit = $('#pw-submit', screen);
      let seconds = 0;
      input.addEventListener('input', () => {
        seconds = crackSeconds(input.value);
        const pct = input.value ? Math.max(6, Math.min(100, (Math.log10(seconds + 1) / Math.log10(STRONG_SECONDS * 100)) * 100)) : 0;
        fill.style.width = pct + '%';
        fill.className = 'pw-meter-fill ' + (seconds >= STRONG_SECONDS ? 'strong' : seconds >= 86400 ? 'medium' : 'weak');
        verdict.textContent = input.value ? `A computer could crack this ${crackPhrase(seconds)}.` : 'Start typing to see how fast it could be cracked.';
        submit.disabled = !input.value;
      });
      submit.addEventListener('click', () => {
        if (ending) return;
        input.value = '';
        const when = crackPhrase(seconds);
        endScenario(seconds >= STRONG_SECONDS ? step.strongEnd : step.weakEnd, `A computer could have cracked your password ${when}.`);
      });
      input.focus();
    }

    /* ---------- UPI PIN pad ---------- */
    function drawPin() {
      actions = [];
      const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'cancel', '0', '⌫'];
      paint(`${statusBar(false)}
        <div class="upi-card pin-head">
          <div class="upi-label">Paying ${step.payee}</div>
          <div class="upi-amount">${rupees(step.amount)}</div>
          <div class="upi-payee">Enter 4-digit UPI PIN</div>
          <div class="pin-dots">${[0, 1, 2, 3].map((i) => `<span class="${i < pin.length ? 'on' : ''}"></span>`).join('')}</div>
        </div>
        <div class="pin-pad">
          ${keys.map((k) => (k === 'cancel'
            ? `<button class="pin-cancel" data-act="${reg(step.cancel)}">Cancel</button>`
            : `<button data-key="${k}">${k}</button>`)).join('')}
        </div>`);
      screen.querySelectorAll('[data-key]').forEach((b) =>
        b.addEventListener('click', () => {
          if (ending) return;
          const k = b.dataset.key;
          if (k === '⌫') pin = pin.slice(0, -1);
          else if (pin.length < 4) pin += k;
          drawPin();
          if (pin.length === 4) {
            ending = true;
            later(() => endScenario(step.done.end), 500);
          }
        })
      );
    }

    /* ---------- outcome ---------- */
    function endScenario(key, extra) {
      clearTimers();
      ending = true;
      const o = sc.outcomes[key];
      const loss = o.loss || 0;
      done++;
      if (o.safe) safeCount++;
      runLoss += loss;
      updateMeta();

      actions = [];
      const balanceNow = Math.max(0, START_BALANCE - otherLoss - runLoss);
      const debit = loss
        ? { from: 'AX-BNKALT', text: `Rs ${loss.toLocaleString('en-IN')}.00 debited from A/c XX4821. Avl bal Rs ${balanceNow.toLocaleString('en-IN')}.00. Not you? Call your bank.` }
        : null;
      if (currentDevice === 'laptop') {
        paint(desktopHtml('', debit));
      } else {
        paint(lockHtml(debit ? noteHtml({ app: 'Messages', from: debit.from, preview: debit.text }) : '', debit ? '' : 'No new notifications'));
      }

      side.innerHTML = `
        <div class="side-label">Situation ${idx + 1} of ${total}</div>
        <h3>${sc.title}</h3>
        <div class="outcome ${o.safe ? 'safe' : 'unsafe'}">
          <div class="outcome-title">${o.title}</div>
          ${loss ? `<div class="outcome-loss">−${rupees(loss)}</div>` : ''}
          <p>${o.text}</p>
          ${extra ? `<p>${extra}</p>` : ''}
        </div>
        <div class="side-list-title">${sc.flagsTitle || 'Red flags in this one'}</div>
        <ul class="side-list">${sc.flags.map((f) => `<li>${f}</li>`).join('')}</ul>
        ${loss ? `
        <div class="side-list-title">If this happens to you for real</div>
        <ul class="side-list">${REAL_LIFE_HELP.map((h) => `<li>${h}</li>`).join('')}</ul>` : ''}
        <div class="btn-row left">
          <button class="btn btn-primary" id="dev-next">${idx + 1 >= total ? 'See results →' : 'Next situation →'}</button>
        </div>
      `;
      $('#dev-next', side).addEventListener('click', () => {
        idx++;
        startScenario();
      });
    }

    startScenario();
  }


  function safetyScore() {
    const totalStars = Object.values(state.levelStars).reduce((a, b) => a + b, 0);
    const starPct = totalStars / (LEVELS.length * 3);
    const badgePct = state.badges.length / BADGES.length;
    const score = Math.round(starPct * 70 + badgePct * 30);
    let tier;
    if (score >= 85) tier = { label: 'Scam-proof', tone: 'tone-good', desc: 'You spot tricks most people fall for.' };
    else if (score >= 60) tier = { label: 'Careful', tone: 'tone-good', desc: 'You catch most scams, but a few still slip past.' };
    else if (score >= 30) tier = { label: 'At risk', tone: 'tone-mid', desc: 'Getting better, but scammers could still get through.' };
    else tier = { label: 'Easy target', tone: 'tone-bad', desc: 'Play the missions below to learn what to watch for.' };
    return { score, totalStars, ...tier };
  }


  function drawCertificate(name) {
    const canvas = $('#cert-canvas');
    const ctx2d = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    ctx2d.fillStyle = '#fbfaf6';
    ctx2d.fillRect(0, 0, W, H);

    ctx2d.strokeStyle = '#1d1d1b';
    ctx2d.lineWidth = 3;
    ctx2d.strokeRect(28, 28, W - 56, H - 56);
    ctx2d.strokeStyle = '#cfcfc8';
    ctx2d.lineWidth = 1;
    ctx2d.strokeRect(40, 40, W - 80, H - 80);

    ctx2d.textAlign = 'center';
    ctx2d.fillStyle = '#6b6b65';
    ctx2d.font = '600 18px Segoe UI, sans-serif';
    ctx2d.fillText('CYBER DEFENDER  ·  CYBER AWARENESS PORTAL', W / 2, 110);

    ctx2d.fillStyle = '#1d1d1b';
    ctx2d.font = '700 42px Georgia, serif';
    ctx2d.fillText('Certificate of Completion', W / 2, 175);

    ctx2d.fillStyle = '#6b6b65';
    ctx2d.font = '400 20px Segoe UI, sans-serif';
    ctx2d.fillText('This certifies that', W / 2, 250);

    ctx2d.fillStyle = '#24508a';
    ctx2d.font = 'italic 700 50px Georgia, serif';
    ctx2d.fillText(name || 'Cyber Defender', W / 2, 320);

    ctx2d.fillStyle = '#1d1d1b';
    ctx2d.font = '400 19px Segoe UI, sans-serif';
    ctx2d.fillText(`has completed all ${LEVELS.length} Cyber Defender missions, showing they can spot phishing,`, W / 2, 375);
    ctx2d.fillText('protect their accounts, handle scam calls, UPI fraud and fake apps,', W / 2, 402);
    ctx2d.fillText('stay safe in public places, and respond when their laptop is attacked.', W / 2, 429);

    const safety = safetyScore();
    ctx2d.font = '600 17px Segoe UI, sans-serif';
    ctx2d.fillStyle = '#44443f';
    ctx2d.fillText(`${safety.totalStars}/${LEVELS.length * 3} Stars   ·   ${state.totalXP} XP   ·   ${state.badges.length}/${BADGES.length} Badges   ·   ${rupees(bankBalance())} kept safe`, W / 2, 500);

    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    ctx2d.fillStyle = '#6b6b65';
    ctx2d.font = '400 16px Segoe UI, sans-serif';
    ctx2d.fillText(dateStr, W / 2, 610);
    ctx2d.strokeStyle = '#9a9a94';
    ctx2d.lineWidth = 1;
    ctx2d.beginPath(); ctx2d.moveTo(W / 2 - 140, 580); ctx2d.lineTo(W / 2 + 140, 580); ctx2d.stroke();
    ctx2d.fillText('Date Issued', W / 2, 632);

    ctx2d.fillStyle = '#1d1d1b';
    ctx2d.font = '700 18px Segoe UI, sans-serif';
    ctx2d.fillText('Cyber Defender Program', W / 2, 660);

    return canvas.toDataURL('image/png');
  }

  function openCertModal() {
    $('#cert-name-input').value = state.certName || '';
    $('#cert-canvas').style.display = 'none';
    $('#cert-download-row').style.display = 'none';
    $('#cert-modal-overlay').hidden = false;
  }
  function closeCertModal() { $('#cert-modal-overlay').hidden = true; }


  function renderMenu() {
    const safety = safetyScore();
    const cleared = allMissionsCleared();

    screenEl.innerHTML = `
      <div class="menu-hero">
        <h1>A day in your <span class="accent">digital life</span></h1>
        <p>One phone, one laptop and ${rupees(START_BALANCE)} in the bank. Scammers will text, call, email and pop up all day. Use your devices the way you normally would, and see how much money you still have at the end.</p>
      </div>

      <div class="progress-summary">
        <div class="stat"><b>${rupees(bankBalance())}</b><span>Bank balance</span></div>
        <div class="stat"><b>${safety.totalStars}/${LEVELS.length * 3}</b><span>Stars</span></div>
        <div class="stat"><b>${state.badges.length}/${BADGES.length}</b><span>Badges</span></div>
        <div class="stat"><b>${state.totalXP}</b><span>XP</span></div>
      </div>

      <div class="posture-card glass-card ${safety.tone}">
        <div class="posture-top">
          <span class="posture-label">Your cyber safety: <b>${safety.label}</b></span>
          <span class="posture-score">${safety.score}%</span>
        </div>
        <div class="meter-track"><div class="meter-fill" style="width:${safety.score}%"></div></div>
        <p class="posture-desc">${safety.desc}</p>
      </div>

      ${cleared ? `
      <div class="cert-banner glass-card">
        <div>
          <div class="cert-banner-title">🎓 All missions cleared!</div>
          <div class="cert-banner-desc">Claim your Certificate of Completion.</div>
        </div>
        <button class="btn btn-primary" id="claim-cert-btn">Get certificate →</button>
      </div>` : ''}

      <div class="level-map" id="level-map"></div>
    `;

    if (cleared) $('#claim-cert-btn').addEventListener('click', openCertModal);

    const map = $('#level-map');
    LEVELS.forEach((lvl) => {
      const card = document.createElement('div');
      card.className = 'glass-card level-card';
      card.innerHTML = `
        <div class="level-num">Mission ${lvl.id}</div>
        <div class="level-icon">${lvl.icon}</div>
        <h3>${lvl.title}</h3>
        <p>${lvl.subtitle}</p>
        <div class="level-stars">${starsHtml(state.levelStars[lvl.id] || 0)}</div>
        <div class="level-tags">
          <span class="tag">${lvl.device === 'laptop' ? 'Laptop' : 'Phone'} · ${lvl.scenarios.length} situations</span>
          <span class="tag diff-${lvl.difficulty}">${lvl.difficulty}</span>
        </div>
      `;
      card.addEventListener('click', () => renderIntro(lvl));
      map.appendChild(card);
    });
  }

  function renderIntro(lvl) {
    const device = lvl.device === 'laptop' ? 'laptop' : 'phone';
    const rules = [
      `${lvl.scenarios.length} situations on your ${device}. There are no quiz options: tap, reply, pay or hang up, just like you normally would.`,
      `Every mistake costs money from your bank balance (now ${rupees(bankBalance())}).`,
      "After each one you'll see the red flags you should have spotted.",
      `Tip: ${lvl.tip}`,
    ];
    screenEl.innerHTML = `
      <div class="glass-card intro-card">
        <div class="level-icon">${lvl.icon}</div>
        <h2>Mission ${lvl.id}: ${lvl.title}</h2>
        <p class="intro-sub">${lvl.subtitle}</p>
        <div class="intro-rules"><ul>${rules.map((r) => `<li>${r}</li>`).join('')}</ul></div>
        <div class="btn-row">
          <button class="btn btn-secondary" id="intro-back">← All missions</button>
          <button class="btn btn-primary" id="intro-start">Start mission</button>
        </div>
      </div>
    `;
    $('#intro-back').addEventListener('click', renderMenu);
    $('#intro-start').addEventListener('click', () => renderPlay(lvl));
  }

  function renderPlay(lvl) {
    screenEl.innerHTML = `
      <div class="play-hud">
        <h2>${lvl.icon} ${lvl.title}</h2>
        <div class="play-meta" id="play-meta"></div>
      </div>
      <div class="glass-card level-stage" id="level-stage"></div>
    `;
    playDevice(lvl, {
      stage: $('#level-stage'),
      meta: $('#play-meta'),
      finish: (rawScore, loss) => renderResults(lvl, completeLevel(lvl, rawScore, loss)),
    });
  }

  function renderResults(lvl, result) {
    const { score, stars, xpGain, loss } = result;
    const circumference = 2 * Math.PI * 70;
    const offset = circumference - (score / 100) * circumference;
    const nextLvl = LEVELS.find((l) => l.id === lvl.id + 1);
    const safeCount = Math.round((score / 100) * lvl.scenarios.length);
    screenEl.innerHTML = `
      <div class="glass-card results-card">
        <h2>${score >= 70 ? 'Mission complete' : 'Mission attempted'}</h2>
        <p class="muted">You stayed safe in ${safeCount} of ${lvl.scenarios.length} situations.</p>
        <div class="score-ring-wrap">
          <svg width="140" height="140" viewBox="0 0 160 160">
            <circle class="ring-bg" cx="80" cy="80" r="70" />
            <circle class="ring-fill" cx="80" cy="80" r="70" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" id="ring-fill-el" />
          </svg>
          <div class="ring-text">${score}%</div>
        </div>
        <div class="result-stars">${starsHtml(stars)}</div>
        <div class="result-loss${loss ? '' : ' none'}">${loss ? `Money lost in this mission: ${rupees(loss)}` : 'No money lost'}</div>
        <div class="result-xp">+${xpGain} XP</div>
        <div class="btn-row">
          <button class="btn btn-secondary" id="res-map">All missions</button>
          <button class="btn btn-ghost" id="res-retry">Try again</button>
          ${nextLvl ? '<button class="btn btn-primary" id="res-next">Next mission →</button>' : ''}
        </div>
      </div>
    `;
    requestAnimationFrame(() => {
      const ring = $('#ring-fill-el');
      if (ring) ring.style.strokeDashoffset = String(offset);
    });
    $('#res-map').addEventListener('click', renderMenu);
    $('#res-retry').addEventListener('click', () => renderIntro(lvl));
    const nextBtn = $('#res-next');
    if (nextBtn) nextBtn.addEventListener('click', () => renderIntro(nextLvl));
  }

 
  function openBadgeModal() {
    $('#badge-grid').innerHTML = BADGES.map((b) => `
      <div class="badge-item ${state.badges.includes(b.id) ? '' : 'locked'}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.desc}</div>
      </div>
    `).join('');
    $('#badge-modal-overlay').hidden = false;
  }
  function closeBadgeModal() { $('#badge-modal-overlay').hidden = true; }


  function init() {
    updateHudChrome();
    renderMenu();
    $('#hud-logo').addEventListener('click', renderMenu);
    $('#badges-btn').addEventListener('click', openBadgeModal);
    $('#badge-modal-close').addEventListener('click', closeBadgeModal);
    $('#badge-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'badge-modal-overlay') closeBadgeModal();
    });
    $('#reset-btn').addEventListener('click', () => {
      if (confirm('Reset all progress, money, stars and badges? This cannot be undone.')) {
        state = defaultState();
        saveState();
        updateHudChrome();
        renderMenu();
      }
    });
    $('#cert-modal-close').addEventListener('click', closeCertModal);
    $('#cert-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'cert-modal-overlay') closeCertModal();
    });
    $('#cert-generate-btn').addEventListener('click', () => {
      const name = $('#cert-name-input').value.trim();
      if (!name) { $('#cert-name-input').focus(); return; }
      state.certName = name;
      saveState();
      $('#cert-canvas').style.display = 'block';
      $('#cert-download-link').href = drawCertificate(name);
      $('#cert-download-row').style.display = 'flex';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
