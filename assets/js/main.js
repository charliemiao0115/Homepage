/* =========================================================
   Miao Yuchen · personal site
   ========================================================= */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVG_NS = "http://www.w3.org/2000/svg";

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function el(tag, attrs, parent) {
    var node = doc.createElementNS(SVG_NS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  // Small seeded PRNG so generated artwork is identical on every load.
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pathFrom(points, close) {
    return points.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ") + (close ? " Z" : "");
  }

  /* ---------------- Hero chip ---------------- */
  function buildChip() {
    var traces = $("#chip-traces"), pins = $("#chip-pins"), cores = $("#chip-cores");
    if (!traces) return;
    var rand = rng(7);

    for (var side = 0; side < 4; side++) {
      var gT = el("g", { transform: "rotate(" + side * 90 + " 300 300)" }, traces);
      var gP = el("g", { transform: "rotate(" + side * 90 + " 300 300)" }, pins);
      for (var i = 0; i < 14; i++) {
        var x = 180 + i * 18.5;
        el("rect", { x: x - 3, y: 147, width: 6, height: 12, rx: 1.5 }, gP);
        if (rand() < 0.25) continue;
        var rise = 10 + rand() * 30;
        var spread = (x - 300) * (0.35 + rand() * 0.5);
        var endY = 8 + rand() * 60;
        var d = "M" + x + " 145 V" + (145 - rise) + " L" + (x + spread) + " " + (145 - rise - Math.abs(spread) * 0.8) + " V" + endY;
        el("path", { d: d, pathLength: 100 }, gT);
        el("circle", { cx: x + spread, cy: endY, r: 2.6 }, gT);
      }
    }

    var size = 26, gap = 8, start = 202;
    for (var r = 0; r < 6; r++) {
      for (var c = 0; c < 6; c++) {
        if (r > 0 && r < 5 && c > 0 && c < 5) continue; // keep the centre clear for the label
        var core = el("rect", { x: start + c * (size + gap), y: start + r * (size + gap), width: size, height: size, rx: 4 }, cores);
        if (rand() < 0.45) {
          core.setAttribute("class", "on");
          core.style.animationDelay = (rand() * 2.4).toFixed(2) + "s";
        }
      }
    }
  }

  /* ---------------- Overview: split words ---------------- */
  function buildWords() {
    var p = $("#words");
    if (!p) return;
    var highlight = /^(milliwatts,|NPUs|RISC-V|box\.)$/;
    var words = p.textContent.trim().split(/\s+/);
    p.textContent = "";
    words.forEach(function (w, i) {
      var span = doc.createElement("span");
      span.className = "w" + (highlight.test(w) ? " w--hl" : "");
      span.style.setProperty("--i", (i / words.length).toFixed(4));
      span.textContent = w;
      p.appendChild(span);
      p.appendChild(doc.createTextNode(" "));
    });
  }

  /* ---------------- Showcase visuals ---------------- */
  function svgRoot(host) {
    return el("svg", { viewBox: "0 0 400 400", "aria-hidden": "true" }, host);
  }

  function detectionBox(svg, x, y, w, h, label, blue) {
    var g = el("g", { class: "lock" }, svg);
    el("rect", { x: x, y: y, width: w, height: h, rx: 6, class: "v-box" + (blue ? " v-box--blue" : "") }, g);
    var tw = label.length * 6.9 + 14;
    el("rect", { x: x - 1.2, y: y - 22, width: tw, height: 20, rx: 4, class: "v-tag" + (blue ? " v-tag--blue" : "") }, g);
    var t = el("text", { x: x + 6, y: y - 8, class: "v-tag-text" }, g);
    t.textContent = label;
    return g;
  }

  function label(svg, x, y, text, anchor) {
    var t = el("text", { x: x, y: y, class: "v-label", "text-anchor": anchor || "start" }, svg);
    t.textContent = text;
  }

  function dots(group, pts, alt) {
    pts.forEach(function (p, k) {
      var c = el("circle", { cx: p[0], cy: p[1], r: alt ? 4.2 : 3, class: "pop v-dot" + (alt ? " v-dot--alt" : "") }, group);
      c.style.setProperty("--k", k);
    });
  }

  function buildFace() {
    var host = $("#viz-face");
    if (!host) return;
    var svg = svgRoot(host);
    var pts = [];
    var i;
    for (i = 0; i <= 16; i++) { var th = Math.PI - i * Math.PI / 16; pts.push([200 + 108 * Math.cos(th), 178 + 138 * Math.sin(th)]); }
    for (i = 0; i < 5; i++) pts.push([122 + i * 15, 146 - 12 * Math.sin(Math.PI * (i + 0.5) / 5)]);
    for (i = 0; i < 5; i++) pts.push([218 + i * 15, 146 - 12 * Math.sin(Math.PI * (i + 0.5) / 5)]);
    for (i = 0; i < 4; i++) pts.push([200, 168 + i * 17]);
    for (i = 0; i < 5; i++) pts.push([180 + i * 10, 236 + (i === 2 ? 4 : i % 4 === 0 ? -3 : 1)]);
    [152, 248].forEach(function (cx) {
      for (var j = 0; j < 6; j++) { var a = Math.PI + j * Math.PI / 3; pts.push([cx + 21 * Math.cos(a), 178 + 8 * Math.sin(a)]); }
    });
    for (i = 0; i < 12; i++) { var b = Math.PI + i * Math.PI / 6; pts.push([200 + 42 * Math.cos(b), 284 + 15 * Math.sin(b) * (Math.sin(b) < 0 ? 0.8 : 1.1)]); }
    for (i = 0; i < 8; i++) { var m = Math.PI + i * Math.PI / 4; pts.push([200 + 26 * Math.cos(m), 284 + 6 * Math.sin(m)]); }

    var g = el("g", { class: "breathe" }, svg);
    var groups = [[0, 16, false], [17, 21, false], [22, 26, false], [27, 30, false], [31, 35, false], [36, 41, true], [42, 47, true], [48, 59, true], [60, 67, true]];
    groups.forEach(function (gr) {
      el("path", { d: pathFrom(pts.slice(gr[0], gr[1] + 1), gr[2]), class: "v-line draw", pathLength: 1 }, g);
    });
    dots(g, pts);

    var o = [200, 228];
    el("path", { d: "M" + o + " L252 232", class: "v-axis-x draw", pathLength: 1 }, g);
    el("path", { d: "M" + o + " L197 176", class: "v-axis-y draw", pathLength: 1 }, g);
    el("path", { d: "M" + o + " L176 254", class: "v-axis-z draw", pathLength: 1 }, g);

    detectionBox(svg, 78, 108, 244, 240, "face 0.98");
    label(svg, 22, 32, "yaw -3.2°  pitch 1.8°  roll 0.4°");
    label(svg, 378, 32, "eyes: open · gaze: road", "end");
  }

  function buildHand() {
    var host = $("#viz-hand");
    if (!host) return;
    var svg = svgRoot(host);
    var k = [[200, 340], [160, 315], [130, 285], [110, 255], [95, 228], [165, 230], [158, 180], [154, 148], [151, 118],
      [198, 224], [198, 168], [198, 132], [198, 98], [230, 230], [236, 180], [240, 148], [243, 120], [258, 245], [272, 205], [281, 180], [289, 156]];
    var chains = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [0, 17, 18, 19, 20], [5, 9, 13, 17]];
    var g = el("g", { class: "breathe" }, svg);
    chains.forEach(function (c) {
      el("path", { d: pathFrom(c.map(function (i) { return k[i]; })), class: "v-line draw", pathLength: 1 }, g);
    });
    dots(g, k, true);
    detectionBox(svg, 74, 82, 240, 280, "open_palm 0.96");
    label(svg, 22, 32, "21 keypoints");
    label(svg, 378, 32, "gesture: open_palm", "end");
  }

  function buildQR() {
    var host = $("#viz-qr");
    if (!host) return;
    var svg = svgRoot(host);
    var defs = el("defs", {}, svg);
    var grad = el("linearGradient", { id: "scan-grad", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el("stop", { offset: 0, "stop-color": "#30d158", "stop-opacity": 0 }, grad);
    el("stop", { offset: 1, "stop-color": "#30d158", "stop-opacity": 0.55 }, grad);

    var n = 21, s = 10, x0 = 95, y0 = 95, rand = rng(42);
    function inFinder(r, c) {
      var f = [[0, 0], [0, 14], [14, 0]];
      for (var i = 0; i < 3; i++) {
        var rr = r - f[i][0], cc = c - f[i][1];
        if (rr >= -1 && rr <= 7 && cc >= -1 && cc <= 7) {
          if (rr < 0 || rr > 6 || cc < 0 || cc > 6) return 0;
          var ring = Math.min(rr, cc, 6 - rr, 6 - cc);
          return ring === 1 ? 0 : 1;
        }
      }
      return -1;
    }
    var g = el("g", {}, svg);
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        var f = inFinder(r, c), on;
        if (f !== -1) on = f === 1;
        else if (r === 6 || c === 6) on = (r + c) % 2 === 0;
        else on = rand() < 0.48;
        if (!on) continue;
        var m = el("rect", { x: x0 + c * s + 0.6, y: y0 + r * s + 0.6, width: s - 1.2, height: s - 1.2, rx: 1.6, class: "pop v-module" }, g);
        m.style.setProperty("--k", ((r + c) * 0.9).toFixed(1));
      }
    }
    var scan = el("rect", { x: 82, y: 50, width: 236, height: 30, class: "v-scan scanline" }, svg);
    scan.style.setProperty("--scan-h", "236px");
    detectionBox(svg, 80, 80, 240, 240, "qr_code 0.99");
    label(svg, 22, 370, "fixed-point CNN → RISC-V decode");
    label(svg, 378, 32, "1 code found", "end");
  }

  function person(g, x, y, sc) {
    var p = el("g", { transform: "translate(" + x + " " + y + ") scale(" + sc + ")" }, g);
    el("circle", { cx: 0, cy: -118, r: 16, class: "v-silhouette" }, p);
    el("path", { d: "M-26 -92 Q0 -100 26 -92 L32 -30 L20 -30 L18 0 L6 0 L2 -40 L-2 -40 L-6 0 L-18 0 L-20 -30 L-32 -30 Z", class: "v-silhouette" }, p);
  }

  function buildPerson() {
    var host = $("#viz-person");
    if (!host) return;
    var svg = svgRoot(host);
    var ground = el("g", {}, svg);
    for (var i = 0; i < 7; i++) {
      var x = 200 + (i - 3) * 70;
      el("path", { d: "M200 210 L" + (200 + (x - 200) * 2.4) + " 400", class: "v-line draw", pathLength: 1, style: "stroke: rgba(255,255,255,0.08)" }, ground);
    }
    [250, 290, 345].forEach(function (y) {
      el("path", { d: "M0 " + y + " H400", class: "v-line draw", pathLength: 1, style: "stroke: rgba(255,255,255,0.08)" }, ground);
    });
    var walkers = el("g", { class: "breathe" }, svg);
    person(walkers, 140, 330, 1.25);
    person(walkers, 285, 290, 0.85);
    detectionBox(svg, 92, 158, 96, 176, "person 0.97", true);
    detectionBox(svg, 252, 172, 66, 122, "person 0.91", true);
    label(svg, 22, 32, "always-on · parking surveillance");
    label(svg, 378, 32, "event: person_detected", "end");
  }

  /* ---------------- Showcase stepping ---------------- */
  function initShowcase() {
    var frame = $("#viz-frame");
    var steps = $$(".step");
    var hud = $("#viz-hud-label");
    var hudRight = $(".viz-hud__right");
    if (!frame || !steps.length) return;
    var labels = ["dms · 68 landmarks", "gesture · 21 keypoints", "qr · detect + decode", "person · always-on"];
    var chips = ["OAX4600 · NPU", "OG12B10 · on-sensor NPU", "OG12B10 · on-sensor NPU", "OAX7700 · NPU"];

    function activate(i) {
      if (frame.getAttribute("data-active") === String(i) && steps[i].classList.contains("is-active")) return;
      frame.setAttribute("data-active", i);
      steps.forEach(function (s, j) { s.classList.toggle("is-active", j === i); });
      if (hud) hud.textContent = labels[i];
      if (hudRight) hudRight.textContent = chips[i];
    }
    activate(0);

    if (!("IntersectionObserver" in window)) return;
    var mobile = window.matchMedia("(max-width: 900px)").matches;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) activate(Number(e.target.getAttribute("data-step")));
      });
    }, { rootMargin: mobile ? "-55% 0px -35% 0px" : "-48% 0px -48% 0px" });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ---------------- Scroll engine ---------------- */
  var scrollSections = $$("[data-scroll]");
  var hscroll = $("[data-hscroll]");
  var track = $("#hscroll-track");
  var words = $("#overview");

  function sizeHScroll() {
    if (!hscroll || !track || reduceMotion) return;
    var dist = Math.max(0, track.scrollWidth - window.innerWidth);
    hscroll.style.setProperty("--dist", dist);
    hscroll.style.height = (window.innerHeight + dist * 1.1) + "px";
  }

  function update() {
    var vh = window.innerHeight;
    for (var i = 0; i < scrollSections.length; i++) {
      var s = scrollSections[i];
      var r = s.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      var p;
      if (s.hasAttribute("data-pin")) p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
      else p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      s.style.setProperty("--p", p.toFixed(4));
      if (s === words) s.style.setProperty("--q", (p * 1.3 - 0.06).toFixed(4));
    }
    var max = root.scrollHeight - vh;
    nav.classList.toggle("is-scrolled", window.scrollY > 10 && max > 0);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }

  /* ---------------- Reveal + counters ---------------- */
  function animateCount(node) {
    var target = parseFloat(node.getAttribute("data-count"));
    var decimals = parseInt(node.getAttribute("data-decimals") || "0", 10);
    if (reduceMotion) { node.textContent = target.toFixed(decimals); return; }
    var start = performance.now(), dur = 1600;
    (function frame(now) {
      var t = clamp((now - start) / dur, 0, 1);
      var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      node.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(frame);
    })(start);
  }

  function initReveal() {
    var items = $$("[data-reveal]");
    var counters = $$("[data-count]");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (n) { io.observe(n); });

    counters.forEach(function (n) { n.textContent = "0"; });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        animateCount(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (n) { cio.observe(n); });
  }

  /* ---------------- Nav ---------------- */
  var nav = $(".nav");
  function initNav() {
    var burger = $("#nav-burger");
    var links = $("#nav-links");
    function setOpen(open) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      links.classList.toggle("is-open", open);
      doc.body.style.overflow = open ? "hidden" : "";
    }
    burger.addEventListener("click", function () { setOpen(burger.getAttribute("aria-expanded") !== "true"); });
    $$("a", links).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });

    if (!("IntersectionObserver" in window)) return;
    var map = {};
    $$("a", links).forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$("a", links).forEach(function (a) { a.classList.remove("is-active"); });
        if (map[e.target.id]) map[e.target.id].classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------------- Boot ---------------- */
  buildChip();
  buildWords();
  buildFace();
  buildHand();
  buildQR();
  buildPerson();
  initShowcase();
  initReveal();
  initNav();
  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  sizeHScroll();
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { sizeHScroll(); onScroll(); });
  window.addEventListener("load", function () { sizeHScroll(); update(); });
})();
