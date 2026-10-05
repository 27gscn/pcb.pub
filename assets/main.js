/*
 * PCB.PUB 页面脚本
 * 子域名查询 · 邮件模板 · 运行时间 · 公历/农历 · 访问统计 · 在线人数 · 信鸽
 * 日常配置请改 assets/config.js，这里一般不用动。
 */
(function () {
  "use strict";

  var CFG = window.PCB_CONFIG || {};
  var I18N = window.PCB_I18N || { lang: "zh-CN", t: function () { return null; } };
  var EMAIL = CFG.email || "tyzokaw@163.com";
  var ZONE = "pcb.pub";
  var DEFAULT_LAUNCH = "2026-10-05T00:00:00+08:00";
  var LAUNCH = Date.parse(CFG.launch || DEFAULT_LAUNCH);
  if (isNaN(LAUNCH)) LAUNCH = Date.parse(DEFAULT_LAUNCH);
  var RESERVED = names(CFG.reserved, ["www", "mail", "email", "smtp", "imap", "pop", "ftp", "admin", "root", "api", "app", "dev", "test", "status", "docs", "help", "support", "apply", "about", "static", "cdn", "ns1", "ns2"]);
  var PENDING = names(CFG.pending, []);
  var state = { name: "", check: null };

  function names(value, fallback) {
    return (Array.isArray(value) ? value : fallback)
      .map(function (x) { return String(x).trim().toLowerCase(); })
      .filter(Boolean);
  }

  function t(key, fallback) {
    var value = I18N.t(key);
    return value == null ? fallback || "" : value;
  }

  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setText(selector, text) {
    all(selector).forEach(function (el) {
      if (el.textContent !== text) el.textContent = text;
    });
  }

  function locale() {
    var map = { en: "en-US", pt: "pt-BR" };
    return map[I18N.lang] || I18N.lang;
  }

  function num(n) {
    try { return Number(n).toLocaleString(locale()); } catch (e) { return String(n); }
  }

  function on(type, fn) {
    document.addEventListener(type, fn);
  }

  function loadScript(src, onload, onerror) {
    var script = document.createElement("script");
    script.src = src;
    script.async = true;
    if (onload) script.onload = onload;
    if (onerror) script.onerror = onerror;
    document.head.appendChild(script);
  }

  /* ---------- 邮件模板 ---------- */

  function subject() {
    return t("mail.apply", "申请入住") + " " + (state.name || "yourname") + "." + ZONE;
  }

  function renderMail() {
    setText("[data-tpl-subject]", subject());
    setText("[data-tpl-name]", state.name ? state.name + "." + ZONE : "");
    var tpl = document.getElementById("mail-template");
    var body = tpl ? tpl.textContent.replace(/\s+$/, "") + "\n" : "";
    var apply = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject()) + (body ? "&body=" + encodeURIComponent(body) : "");
    var report = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(t("mail.report", "举报 xxx.pcb.pub"));
    all('[data-mail="apply"]').forEach(function (a) { a.href = apply; });
    all('[data-mail="report"]').forEach(function (a) { a.href = report; });
  }

  function initCopy() {
    var button = document.getElementById("copy-template");
    var tpl = document.getElementById("mail-template");
    if (!button || !tpl) return;
    var label = null;
    var timer = null;

    function feedback(text) {
      if (label === null) label = button.textContent;
      button.textContent = text;
      clearTimeout(timer);
      timer = setTimeout(function () {
        button.textContent = label;
        label = null;
      }, 2000);
    }

    function legacyCopy(text) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(area);
      return ok;
    }

    on("pcb:lang", function () {
      clearTimeout(timer);
      label = null;
    });

    button.addEventListener("click", function () {
      var text = tpl.textContent.replace(/\s+$/, "") + "\n";
      var ok = function () { feedback(t("ui.copied", "已复制")); };
      var fail = function () { feedback(t("ui.copyFail", "请手动复制")); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(ok, function () {
          if (legacyCopy(text)) ok(); else fail();
        });
      } else if (legacyCopy(text)) {
        ok();
      } else {
        fail();
      }
    });
  }

  /* ---------- 子域名查询 ---------- */

  // 依次尝试：阿里 DNS（国内外都能用）→ Cloudflare → Google
  var RESOLVERS = [
    "https://dns.alidns.com/resolve?type=1&name=",
    "https://cloudflare-dns.com/dns-query?type=A&name=",
    "https://dns.google/resolve?type=A&name="
  ];

  var ICONS = {
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m7.5 12.5 3 3 6-6.5"/></svg>',
    no: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 7.5v5.5M12 16.5h.01"/></svg>',
    wait: '<svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.2-8.6"/></svg>'
  };

  var KINDS = {
    invalid: { icon: "warn" },
    reserved: { icon: "no", key: "chk.reserved" },
    pending: { icon: "no", key: "chk.pending" },
    taken: { icon: "no", key: "chk.taken" },
    checking: { icon: "wait", key: "chk.checking" },
    free: { icon: "ok", key: "chk.free" },
    error: { icon: "warn", key: "chk.error" }
  };

  function clean(raw) {
    return String(raw || "").trim().toLowerCase()
      .replace(/^[a-z]+:\/\//, "")
      .replace(/[\/?#].*$/, "")
      .replace(/\.pcb\.pub\.?$/, "");
  }

  function problem(name) {
    if (!name) return "chk.empty";
    if (/[^a-z0-9-]/.test(name)) return "chk.chars";
    if (name.length < 3) return "chk.short";
    if (name.length > 32) return "chk.long";
    if (/^-|-$|--/.test(name)) return "chk.hyphen";
    return null;
  }

  function fetchJSON(url, ms) {
    return new Promise(function (resolve, reject) {
      var controller = typeof AbortController === "function" ? new AbortController() : null;
      var timer = setTimeout(function () {
        if (controller) controller.abort();
        reject(new Error("timeout"));
      }, ms);
      fetch(url, { headers: { Accept: "application/dns-json" }, signal: controller ? controller.signal : undefined })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (data) {
          clearTimeout(timer);
          resolve(data);
        }, function (err) {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  // 有 A / CNAME / AAAA 记录 = 已占用；NXDOMAIN 或无记录 = 可申请
  function judge(data) {
    if (!data || typeof data.Status !== "number") return null;
    var answers = (data.Answer || []).filter(function (r) {
      return r.type === 1 || r.type === 5 || r.type === 28;
    });
    if (answers.length) return "taken";
    if (data.Status === 0 || data.Status === 3) return "free";
    return null;
  }

  function lookup(domain) {
    if (!window.fetch || typeof Promise !== "function") return { then: function (fn) { fn("error"); } };
    var i = 0;
    return new Promise(function (resolve) {
      (function next() {
        if (i >= RESOLVERS.length) return resolve("error");
        fetchJSON(RESOLVERS[i++] + encodeURIComponent(domain), 4500).then(function (data) {
          var result = judge(data);
          if (result) resolve(result); else next();
        }, next);
      })();
    });
  }

  function appendTemplate(parent, text, vars) {
    text.split(/(\{domain\}|\{name\})/).forEach(function (part) {
      if (part === "{domain}" || part === "{name}") {
        var b = document.createElement("b");
        b.textContent = part === "{domain}" ? vars.domain : vars.name;
        parent.appendChild(b);
      } else if (part) {
        parent.appendChild(document.createTextNode(part));
      }
    });
  }

  function renderCheck() {
    var hasTemplate = !!document.getElementById("mail-template");
    all("[data-check-result]").forEach(function (box) {
      var s = state.check;
      box.textContent = "";
      box.className = "checker-result";
      if (!s) return;
      var kind = KINDS[s.kind] || KINDS.error;
      var domain = s.name + "." + ZONE;
      box.classList.add("is-" + s.kind);

      var line = document.createElement("p");
      line.className = "checker-msg";
      var icon = document.createElement("span");
      icon.className = "checker-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = ICONS[kind.icon];
      line.appendChild(icon);
      var text = document.createElement("span");
      appendTemplate(text, t(s.kind === "invalid" ? s.key : kind.key), { domain: domain, name: s.name });
      line.appendChild(text);
      box.appendChild(line);

      if (s.kind === "free") {
        var note = document.createElement("p");
        note.className = "checker-note";
        note.textContent = t("chk.freeNote");
        box.appendChild(note);
      }
      if (s.kind === "free" || s.kind === "error") {
        var link = document.createElement("a");
        link.className = "checker-action";
        if (hasTemplate) {
          link.href = "#send";
          link.textContent = t("chk.filled") + " ↓";
        } else {
          link.href = "apply.html?name=" + encodeURIComponent(s.name) + "#send";
          link.textContent = t("chk.use") + " →";
        }
        box.appendChild(link);
      }
    });
  }

  function initChecker() {
    var forms = all("[data-checker]");
    if (!forms.length) return;
    var hasTemplate = !!document.getElementById("mail-template");
    var seq = 0;

    function show(s) {
      state.check = s;
      if (hasTemplate) {
        state.name = s.kind === "free" || s.kind === "error" ? s.name : "";
        renderMail();
      }
      renderCheck();
    }

    function run(name) {
      var id = ++seq;
      var key = problem(name);
      if (key) return show({ kind: "invalid", key: key, name: name });
      if (RESERVED.indexOf(name) !== -1) return show({ kind: "reserved", name: name });
      if (PENDING.indexOf(name) !== -1) return show({ kind: "pending", name: name });
      show({ kind: "checking", name: name });
      lookup(name + "." + ZONE).then(function (result) {
        if (id === seq) show({ kind: result, name: name });
      });
    }

    forms.forEach(function (form) {
      var input = form.querySelector("input");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        run(clean(input.value));
      });
      input.addEventListener("input", function () {
        var value = clean(input.value);
        setText("[data-slot]", value.replace(/[^a-z0-9-]/g, "").slice(0, 32) || "yourname");
        if (state.check && state.check.name !== value) {
          seq++;
          state.check = null;
          renderCheck();
        }
      });
    });

    var match = /[?&]name=([^&#]*)/.exec(location.search);
    if (match) {
      var value = "";
      try { value = clean(decodeURIComponent(match[1].replace(/\+/g, " "))); } catch (e) { value = ""; }
      if (value) {
        forms.forEach(function (form) { form.querySelector("input").value = value; });
        run(value);
      }
    }
  }

  function renderReserved() {
    all("[data-reserved]").forEach(function (box) {
      if (box.getAttribute("data-rendered")) return;
      box.textContent = "";
      RESERVED.forEach(function (name) {
        var code = document.createElement("code");
        code.textContent = name;
        box.appendChild(code);
      });
      box.setAttribute("data-rendered", "1");
    });
  }

  /* ---------- 运行时间 · 公历 · 农历 ---------- */

  var STEMS = "甲乙丙丁戊己庚辛壬癸";
  var BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
  var MONTHS = "正二三四五六七八九十冬腊";
  var DIGITS = "一二三四五六七八九十";
  var lunarFormats = {};

  function lunarDay(n) {
    if (n === 10) return "初十";
    if (n === 20) return "二十";
    if (n === 30) return "三十";
    return "初十廿三".charAt(Math.floor(n / 10)) + DIGITS.charAt((n - 1) % 10);
  }

  function lunar(date, timeZone) {
    try {
      var key = timeZone || "local";
      var format = lunarFormats[key] || (lunarFormats[key] = new Intl.DateTimeFormat("en-u-ca-chinese", {
        timeZone: timeZone, year: "numeric", month: "numeric", day: "numeric"
      }));
      var parts = {};
      format.formatToParts(date).forEach(function (p) { parts[p.type] = p.value; });
      var year = parseInt(parts.relatedYear || parts.year, 10);
      var month = parseInt(parts.month, 10);
      var day = parseInt(parts.day, 10);
      if (!(year > 1000 && month >= 1 && month <= 12 && day >= 1 && day <= 30)) return null;
      return { year: year, month: month, day: day, leap: /\D/.test(parts.month) };
    } catch (e) {
      return null;
    }
  }

  function lunarText(date, timeZone) {
    var l = lunar(date, timeZone);
    if (!l) return "";
    var cycle = (l.year - 4) % 60;
    var ganzhi = STEMS.charAt(cycle % 10) + BRANCHES.charAt(cycle % 12);
    var lang = I18N.lang;
    var fmt = t("lunar.fmt", null);
    if (fmt) {
      // 其他语言：按语言文件里的 lunar.* 格式拼出农历
      var list = function (key) {
        var value = t(key, "");
        return value ? String(value).split(",") : [];
      };
      var stems = list("lunar.stems");
      var branches = list("lunar.branches");
      var gz = stems.length === 10 && branches.length === 12
        ? stems[cycle % 10] + (t("lunar.gzSep", "") || "") + branches[cycle % 12]
        : ganzhi;
      var month = String(t(l.leap ? "lunar.leap" : "lunar.month", "{m}")).replace("{m}", l.month);
      return String(fmt)
        .replace("{month}", month)
        .replace("{d}", l.day)
        .replace("{animal}", list("lunar.animals")[cycle % 12] || "")
        .replace("{gz}", gz);
    }
    if (lang === "ja") {
      return "旧暦 " + ganzhi + "年" + (l.leap ? "閏" : "") + l.month + "月" + l.day + "日";
    }
    var tw = lang === "zh-TW";
    var month = tw && l.month === 12 ? "臘" : MONTHS.charAt(l.month - 1);
    return (tw ? "農曆" : "农历") + ganzhi + "年" + (l.leap ? (tw ? "閏" : "闰") : "") + month + "月" + lunarDay(l.day);
  }

  function solar(date, timeZone, options) {
    try {
      var opts = { timeZone: timeZone };
      for (var k in options) opts[k] = options[k];
      return new Intl.DateTimeFormat(locale(), opts).format(date);
    } catch (e) {
      return date.toLocaleDateString();
    }
  }

  function renderDates() {
    var now = new Date();
    var launch = new Date(LAUNCH);
    var long = { year: "numeric", month: "long", day: "numeric" };
    setText("[data-launch-solar]", solar(launch, "Asia/Shanghai", long));
    var launchLunar = lunarText(launch, "Asia/Shanghai");
    setText("[data-launch-lunar]", launchLunar ? " · " + launchLunar : "");
    setText("[data-today-solar]", solar(now, undefined, long));
    setText("[data-today-week]", solar(now, undefined, { weekday: "long" }));
    setText("[data-today-lunar]", lunarText(now));
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  var lastDay = "";

  function tick() {
    var now = new Date();
    var secs = Math.max(0, Math.floor((now.getTime() - LAUNCH) / 1000));
    var days = Math.floor(secs / 86400);
    setText('[data-rt="d"]', num(days));
    setText('[data-rt="h"]', pad(Math.floor((secs % 86400) / 3600)));
    setText('[data-rt="m"]', pad(Math.floor((secs % 3600) / 60)));
    setText('[data-rt="s"]', pad(secs % 60));
    setText("[data-days]", num(days));
    var day = now.toDateString();
    if (day !== lastDay) {
      lastDay = day;
      renderDates();
    }
  }

  /* ---------- 访问统计（不蒜子） ---------- */

  function initStats() {
    var groups = function (visible) {
      all("[data-stats]").forEach(function (el) { el.hidden = !visible; });
    };
    if (!CFG.statsScript) return groups(false);
    var ids = { pv: "busuanzi_value_site_pv", uv: "busuanzi_value_site_uv" };
    var values = {};

    function paint() {
      Object.keys(ids).forEach(function (k) {
        setText('[data-stat="' + k + '"]', values[k] != null ? num(values[k]) : "—");
      });
    }

    Object.keys(ids).forEach(function (k) {
      var el = document.getElementById(ids[k]);
      if (!el || !window.MutationObserver) return;
      new MutationObserver(function () {
        var n = parseInt(String(el.textContent).replace(/[^\d]/g, ""), 10);
        if (!isNaN(n)) {
          values[k] = n;
          groups(true);
          paint();
        }
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });

    on("pcb:lang", paint);
    loadScript(CFG.statsScript, null, function () { groups(false); });
    setTimeout(function () {
      if (values.pv == null && values.uv == null) groups(false);
    }, 15000);
  }

  /* ---------- 实时在线（Supabase Realtime Presence） ---------- */

  function visitorId() {
    var id = null;
    try { id = localStorage.getItem("pcb-vid"); } catch (e) { id = null; }
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      try { localStorage.setItem("pcb-vid", id); } catch (e) { /* 忽略 */ }
    }
    return id;
  }

  function initOnline() {
    var url = CFG.supabaseUrl;
    var key = CFG.supabaseKey;
    if (!url || !key) return;
    var count = 0;

    function show(visible) {
      all("[data-online]").forEach(function (el) { el.hidden = !visible; });
    }

    function paint() {
      setText('[data-stat="online"]', num(Math.max(1, count)));
    }

    loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", function () {
      var lib = window.supabase;
      if (!lib || !lib.createClient) return;
      try {
        var client = lib.createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
        var channel = client.channel("pcb-online", { config: { presence: { key: visitorId() } } });
        channel
          .on("presence", { event: "sync" }, function () {
            count = Object.keys(channel.presenceState()).length;
            paint();
            show(true);
          })
          .subscribe(function (status) {
            if (status === "SUBSCRIBED") channel.track({ at: Date.now() });
            else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") show(false);
          });
        on("pcb:lang", paint);
      } catch (e) {
        show(false);
      }
    });
  }

  /* ---------- 飞过的信鸽 ---------- */

  var PIGEON =
    '<svg viewBox="0 0 64 44" focusable="false"><g class="pg-bob">' +
    '<path class="pg-wing pg-wing--far" d="M43 21C44 13 42 7 37 2C36 9 35 15 33 21Z"/>' +
    '<path class="pg-body" d="M17 22L5 19L6 30L17 28Z"/>' +
    '<ellipse class="pg-body" cx="30" cy="25" rx="15" ry="7.5"/>' +
    '<circle class="pg-body" cx="46" cy="19" r="6"/>' +
    '<path class="pg-beak" d="M51.5 17.2L58 19.2L51.5 21.4Z"/>' +
    '<circle class="pg-eye" cx="47.8" cy="17.6" r="1.3"/>' +
    "@LETTER@" +
    '<path class="pg-wing" d="M36 22C35 12 29 5 19 1C21 9 23 16 25 22Z"/>' +
    "</g></svg>";
  var LETTER = '<g class="pg-letter" transform="translate(24 29) rotate(-8)"><rect width="12" height="8.5" rx="1"/><path d="M1 1.2l5 3.6 5-3.6"/></g>';

  function pigeons() {
    if (CFG.pigeons === false) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var sky = document.createElement("div");
    sky.className = "pigeon-sky";
    sky.setAttribute("aria-hidden", "true");
    var count = 2 + Math.floor(Math.random() * 4);
    var carrier = Math.floor(Math.random() * count);
    var longest = 0;
    for (var i = 0; i < count; i++) {
      var size = i === carrier ? 46 + Math.random() * 10 : 24 + Math.random() * 30;
      var depth = (size - 24) / 32;
      var duration = 13 - depth * 5 + Math.random() * 2;
      var delay = i * 0.7 + Math.random() * 1.6;
      var bird = document.createElement("div");
      bird.className = "pigeon" + (Math.random() < 0.5 ? " pigeon--rtl" : "");
      bird.style.top = (6 + Math.random() * 56).toFixed(1) + "vh";
      bird.style.width = Math.round(size) + "px";
      bird.style.opacity = (0.65 + depth * 0.35).toFixed(2);
      bird.style.animationDuration = duration.toFixed(2) + "s";
      bird.style.animationDelay = delay.toFixed(2) + "s";
      bird.style.setProperty("--rise", (Math.random() * 18 - 9).toFixed(1) + "vh");
      bird.style.setProperty("--flap", (0.2 + Math.random() * 0.14).toFixed(2) + "s");
      bird.innerHTML = PIGEON.replace("@LETTER@", i === carrier ? LETTER : "");
      sky.appendChild(bird);
      longest = Math.max(longest, duration + delay);
    }
    document.body.appendChild(sky);
    setTimeout(function () {
      if (sky.parentNode) sky.parentNode.removeChild(sky);
    }, (longest + 0.5) * 1000);
  }

  /* ---------- 启动 ---------- */

  /* ---------- 文字适配：外语较长时缩小邮戳、邮票上的字 ---------- */

  function fitPostmark() {
    all(".postmark text[data-i18n]").forEach(function (el) {
      if (!el.getComputedTextLength) return;
      var max = 44;
      el.removeAttribute("textLength");
      el.removeAttribute("lengthAdjust");
      el.setAttribute("font-size", "10");
      var len = el.getComputedTextLength();
      if (len <= max) return;
      el.setAttribute("font-size", Math.max(7.5, (10 * max) / len).toFixed(2));
      if (el.getComputedTextLength() > max) {
        el.setAttribute("textLength", String(max));
        el.setAttribute("lengthAdjust", "spacingAndGlyphs");
      }
    });
  }

  function fitStamp() {
    all(".stamp-text span, .stamp-text b").forEach(function (el) {
      el.style.fontSize = "";
      var box = el.clientWidth;
      var need = el.scrollWidth;
      if (!box || need <= box) return;
      var size = parseFloat(window.getComputedStyle(el).fontSize) * box / need;
      el.style.fontSize = Math.max(8, Math.floor(size * 10) / 10) + "px";
    });
  }

  function fitText() {
    fitPostmark();
    fitStamp();
  }

  function renderAll() {
    renderMail();
    renderDates();
    renderCheck();
    fitText();
  }

  renderReserved();
  initCopy();
  initChecker();
  initStats();
  initOnline();
  renderAll();
  tick();
  setInterval(tick, 1000);
  on("pcb:lang", renderAll);
  var fitTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitStamp, 150);
  });
  pigeons();

  window.PCB_TEST = { clean: clean, problem: problem, judge: judge, lunarText: lunarText, lunarDay: lunarDay };
})();
