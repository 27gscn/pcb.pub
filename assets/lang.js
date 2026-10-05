/*
 * PCB.PUB 多语言（核心）
 * 简体中文直接写在 HTML 里；其他 11 种语言的译文在 assets/i18n/ 下，每种语言一个文件，按需加载。
 * 新增文案：在 HTML 元素上加 data-i18n="键名"（纯文本）或 data-i18n-html="键名"（含链接等标签），
 * 再在 assets/i18n/ 的每个语言文件里补上同名的键。脚本里用到的简体中文提示语写在下面的 ZH 里。
 * 语言顺序：网址 ?lang= → 访客手动选择 → 浏览器语言 → English。
 */
(function () {
  "use strict";

  var KEY = "pcb-lang";
  var SUPPORTED = ["zh-CN", "zh-TW", "en", "ja", "ko", "fr", "de", "es", "pt", "it", "ru", "vi"];
  var DICT = window.PCB_I18N_DICT = window.PCB_I18N_DICT || {};

  // 只在脚本里用到的文字（简体中文）
  DICT["zh-CN"] = {
    "mail.apply": "申请入住",
    "mail.report": "举报 xxx.pcb.pub",
    "ui.copied": "已复制",
    "ui.copyFail": "请手动复制",
    "stat.day": "天",
    "chk.empty": "请输入想要的子域名",
    "chk.short": "子域名需要 3 位及以上",
    "chk.long": "最多 32 个字符",
    "chk.chars": "只能使用小写字母 a～z、数字 0～9 和连字符“-”",
    "chk.hyphen": "不能以连字符开头或结尾，也不能连续使用两个连字符",
    "chk.reserved": "“{name}”是保留名称，不开放申请",
    "chk.similar": "“{name}”与保留名称或本站名称相近，不开放申请",
    "chk.pending": "{domain} 已有人申请，正在审核中",
    "chk.checking": "正在查询 {domain}……",
    "chk.free": "{domain} 可以申请",
    "chk.freeNote": "结果仅供参考：正在审核的申请可能查不到，同名申请按邮件先后处理。",
    "chk.use": "用这个名字申请",
    "chk.filled": "已填入下方邮件模板",
    "chk.taken": "{domain} 已被占用，换一个试试",
    "chk.error": "暂时无法查询。可以直接在申请邮件里写明，我们会人工确认。"
  };

  /* ---------- 以下是切换逻辑，一般不用改 ---------- */

  var script = document.currentScript;
  if (!script) {
    var scripts = document.getElementsByTagName("script");
    script = scripts[scripts.length - 1];
  }
  var BASE = (script && script.src ? script.src : "assets/lang.js").replace(/lang\.js(?:[?#].*)?$/, "i18n/");

  function normalize(tag) {
    if (!tag) return null;
    tag = String(tag).toLowerCase().replace(/_/g, "-");
    if (tag.indexOf("zh") === 0) return /hant|-tw|-hk|-mo/.test(tag) ? "zh-TW" : "zh-CN";
    var base = tag.split("-")[0];
    return SUPPORTED.indexOf(base) > -1 ? base : null;
  }

  function read(type) {
    try { return window[type].getItem(KEY); } catch (e) { return null; }
  }

  function store(type, value) {
    try { window[type].setItem(KEY, value); } catch (e) { /* 存储不可用时忽略 */ }
  }

  function detect() {
    var match = /[?&]lang=([^&#]+)/.exec(location.search);
    var lang = null;
    if (match) {
      try { lang = normalize(decodeURIComponent(match[1])); } catch (e) { lang = null; }
    }
    if (lang) {
      store("sessionStorage", lang);
      return lang;
    }
    lang = normalize(read("sessionStorage")) || normalize(read("localStorage"));
    if (lang) return lang;
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < list.length; i++) {
      lang = normalize(list[i]);
      if (lang) return lang;
    }
    return "en";
  }

  // 按需加载语言文件 assets/i18n/<语言>.js
  var waiting = {};
  function load(lang, done) {
    if (lang === "zh-CN" || DICT[lang]) {
      done();
      return;
    }
    if (waiting[lang]) {
      waiting[lang].push(done);
      return;
    }
    waiting[lang] = [done];
    var el = document.createElement("script");
    var finish = function () {
      var list = waiting[lang] || [];
      waiting[lang] = null;
      for (var i = 0; i < list.length; i++) list[i]();
    };
    el.src = BASE + lang + ".js";
    el.onload = finish;
    el.onerror = finish;
    (document.head || document.documentElement).appendChild(el);
  }

  var root = document.documentElement;
  var current = detect();
  root.lang = current;
  root.classList.add("js");
  if (current !== "zh-CN") {
    root.classList.add("i18n-wait");
    setTimeout(function () { root.classList.remove("i18n-wait"); }, 2500);
    load(current, function () {});
  }

  function t(key) {
    var dict = DICT[current] || {};
    if (dict[key] != null) return dict[key];
    return DICT["zh-CN"][key] != null ? DICT["zh-CN"][key] : null;
  }

  function each(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }

  function apply(lang) {
    var dict = lang === "zh-CN" ? {} : DICT[lang] || {};
    each("[data-i18n]", function (el) {
      if (el._i18n == null) el._i18n = el.textContent;
      var value = dict[el.getAttribute("data-i18n")];
      el.textContent = value != null ? value : el._i18n;
    });
    each("[data-i18n-html]", function (el) {
      if (el._i18n == null) el._i18n = el.innerHTML;
      var value = dict[el.getAttribute("data-i18n-html")];
      el.innerHTML = value != null ? value : el._i18n;
    });
    each("[data-i18n-attr]", function (el) {
      if (!el._i18nAttr) el._i18nAttr = {};
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var i = pair.indexOf(":");
        if (i < 1) return;
        var attr = pair.slice(0, i).trim();
        var key = pair.slice(i + 1).trim();
        if (!(attr in el._i18nAttr)) el._i18nAttr[attr] = el.getAttribute(attr);
        var value = dict[key] != null ? dict[key] : el._i18nAttr[attr];
        if (value == null) el.removeAttribute(attr);
        else el.setAttribute(attr, value);
      });
    });
    current = lang;
    api.lang = lang;
    root.lang = lang;
    each("[data-lang-select]", function (select) { select.value = lang; });
    each("[data-lang]", function (link) {
      if (link.getAttribute("data-lang") === lang) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    root.classList.remove("i18n-wait");
    var event;
    try {
      event = new CustomEvent("pcb:lang", { detail: { lang: lang } });
    } catch (e) {
      event = document.createEvent("CustomEvent");
      event.initCustomEvent("pcb:lang", false, false, { lang: lang });
    }
    document.dispatchEvent(event);
  }

  function set(lang) {
    lang = normalize(lang) || "zh-CN";
    store("localStorage", lang);
    store("sessionStorage", lang);
    if (/[?&]lang=/.test(location.search) && window.history && history.replaceState) {
      history.replaceState(null, "", location.pathname + location.hash);
    }
    load(lang, function () { apply(lang); });
  }

  var api = { lang: current, langs: SUPPORTED, t: t, set: set, dict: DICT };
  window.PCB_I18N = api;

  function init() {
    load(current, function () { apply(current); });
    each("[data-lang-select]", function (select) {
      select.value = current;
      select.addEventListener("change", function () { set(select.value); });
    });
    each("[data-lang]", function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        set(link.getAttribute("data-lang"));
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
