/* In-browser WhatsApp-style simulation. It runs the same engine as the real WhatsApp flow.
   Nothing typed here is stored in your browser. Anonymous reasons are sent to the team view. */
(function () {
  var E = window.FitEngine;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var fmt = function (s) { return esc(s).replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,!?]|$)/g, '$1<i>$2</i>'); };

  function mount(root, ids, opts) {
    var token = {};
    root.__token = token;
    var state = null, skip = false, busy = false;
    root.innerHTML =
      '<div class="phone" aria-label="WhatsApp-style simulation"><div class="phone-in">' +
      '<div class="chat-h"><div class="av"><svg viewBox="0 0 32 32"><path d="M9 16.5l4.5 4.5L23 11" stroke="#128C7E" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div><b>FitCheck</b><small>online · browser preview</small></div></div>' +
      '<div class="skipbar" id="skipbar" hidden><span id="skiptxt"></span><button type="button" id="skipbtn">Skip the wait</button></div>' +
      '<div class="msgs" id="msgs" role="log" aria-live="polite"></div>' +
      '<form class="composer" id="composer" autocomplete="off"><input id="txt" type="text" maxlength="200" placeholder="Type a message" aria-label="Type a message"><button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M3 20l18-8L3 4v6l11 2-11 2z"/></svg></button></form>' +
      '</div></div>';
    var msgs = root.querySelector('#msgs'), skipbar = root.querySelector('#skipbar'), skiptxt = root.querySelector('#skiptxt');
    root.querySelector('#skipbtn').onclick = function () { skip = true; };

    function bubble(cls, html) { var d = document.createElement('div'); d.className = 'b ' + cls; d.innerHTML = html; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; }
    function clearOpts() { var o = msgs.querySelector('.opts'); if (o) o.remove(); }
    function typing() { var t = document.createElement('div'); t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>'; msgs.appendChild(t); msgs.scrollTop = msgs.scrollHeight; return t; }

    async function countdown(ms) {
      skip = false; skipbar.hidden = false;
      var end = Date.now() + ms;
      while (Date.now() < end && !skip && root.__token === token) {
        skiptxt.textContent = 'Demo time skip: check-in arrives in ' + Math.ceil((end - Date.now()) / 1000) + 's';
        await sleep(250);
      }
      skipbar.hidden = true;
    }

    async function play(list) {
      busy = true;
      for (var i = 0; i < list.length; i++) {
        if (root.__token !== token) return;
        var m = list[i];
        if (m.delay >= 5000) await countdown(m.delay);
        else if (m.delay) await sleep(Math.min(m.delay, 900));
        var t = typing(); await sleep(350); t.remove();
        bubble('in', fmt(m.body));
        if (m.kind !== 'text') {
          var box = document.createElement('div'); box.className = 'opts' + (m.multi ? ' multi' : '');
          if (m.multi) { // several answers at once: tick the boxes, then send
            var picked = [];
            var note = document.createElement('small'); note.className = 'mnote'; note.textContent = 'Tick all that apply (up to 3)'; box.appendChild(note);
            var go = document.createElement('button'); go.type = 'button'; go.className = 'mgo'; go.textContent = 'Send'; go.disabled = true;
            m.options.forEach(function (o) {
              var lab = document.createElement('label'); lab.className = 'mopt';
              var cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = o.id;
              var sp = document.createElement('span'); sp.textContent = o.title.replace(/^\d+\.\s*/, '');
              cb.onchange = function () {
                if (cb.checked && picked.length >= 3) { cb.checked = false; return; }
                picked = Array.prototype.map.call(box.querySelectorAll('input:checked'), function (i) { return i.value; });
                go.disabled = !picked.length;
              };
              lab.appendChild(cb); lab.appendChild(sp); box.appendChild(lab);
            });
            go.onclick = function () {
              var titles = m.options.filter(function (o) { return picked.indexOf(o.id) >= 0; }).map(function (o) { return o.title.replace(/^\d+\.\s*/, ''); });
              send({ text: picked.join(', ') }, titles.join(', '));
            };
            box.appendChild(go);
            msgs.appendChild(box); msgs.scrollTop = msgs.scrollHeight; continue;
          }
          m.options.forEach(function (o) {
            var b = document.createElement('button'); b.type = 'button'; b.textContent = o.title; if (o.desc) { var sm = document.createElement('small'); sm.textContent = o.desc; b.appendChild(sm); }
            b.onclick = function () { choose(o); }; box.appendChild(b);
          });
          msgs.appendChild(box); msgs.scrollTop = msgs.scrollHeight;
        }
      }
      busy = false;
    }

    function report(events) {
      if (!events || !events.length) return;
      try { fetch('api/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events: events }) }).catch(function () {}); } catch (e) { /* offline is fine */ }
    }

    async function send(input, label) {
      if (busy) return;
      clearOpts();
      bubble('out', esc(label));
      var r = E.reply(state, input, { siteUrl: location.origin });
      state = r.state; report(r.events);
      await play(r.out);
    }
    function choose(o) { send({ id: o.id, text: o.title }, o.title); }

    root.querySelector('#composer').onsubmit = function (ev) {
      ev.preventDefault();
      var inp = root.querySelector('#txt'), v = inp.value.trim();
      if (!v || busy) return; inp.value = '';
      send({ text: v }, v);
    };

    (async function init() {
      bubble('sys', 'Browser preview. The WhatsApp version runs the same conversation.');
      var r = E.startSession(ids, { siteUrl: location.origin, receipt: opts && opts.receipt });
      state = r.state; report(r.events);
      await play(r.out);
    })();
  }
  window.FitChat = { mount: mount };
})();
