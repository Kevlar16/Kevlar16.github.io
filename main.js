// keval.vegas — the only script on the page.

(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- sign: bulbs around the frame ---------- */

  var sign = document.getElementById("sign");
  var track = document.getElementById("track");
  var bulbs = document.getElementById("bulbs");
  var len = track.getTotalLength();
  var count = Math.round(len / 17);
  for (var i = 0; i < count; i++) {
    var p = track.getPointAtLength(i * len / count);
    var c = document.createElementNS(SVGNS, "circle");
    c.setAttribute("cx", p.x.toFixed(1));
    c.setAttribute("cy", p.y.toFixed(1));
    c.setAttribute("r", "3.4");
    c.setAttribute("class", "bulb p" + (i % 3));
    bulbs.appendChild(c);
  }

  // flip the power
  sign.addEventListener("click", function () {
    if (sign.classList.contains("off")) {
      sign.classList.remove("off");
      sign.classList.add("booting");
      setTimeout(function () { sign.classList.remove("booting"); }, 750);
    } else {
      sign.classList.add("off");
    }
  });

  /* ---------- neon: ignition + random flicker ---------- */

  var svg = sign.querySelector("svg");
  // split the name into one tspan per letter, in all three glow layers
  var layers = Array.prototype.slice.call(svg.querySelectorAll(".name"));
  var NAME = "keval patel";
  layers.forEach(function (t) {
    t.textContent = "";
    for (var k = 0; k < NAME.length; k++) {
      if (NAME[k] === " ") { t.appendChild(document.createTextNode(" ")); continue; }
      var ts = document.createElementNS(SVGNS, "tspan");
      ts.textContent = NAME[k];
      ts.setAttribute("data-i", k);
      if (k === 8) ts.setAttribute("class", "dying"); // the t in patel never quite works
      t.appendChild(ts);
    }
  });
  var letterIdx = [];
  for (var k2 = 0; k2 < NAME.length; k2++) if (NAME[k2] !== " " && k2 !== 8) letterIdx.push(k2);
  var coins = Array.prototype.slice.call(svg.querySelectorAll(".coins > g"));
  var toWord = svg.querySelector(".to");

  function letterEls(i) { return svg.querySelectorAll('tspan[data-i="' + i + '"]'); }

  // run a flicker pattern: alternating off/on durations in ms
  function flick(els, pattern, cls) {
    var t = 0;
    pattern.forEach(function (ms, n) {
      setTimeout(function () {
        for (var j = 0; j < els.length; j++) els[j].classList.toggle(cls, n % 2 === 0);
      }, t);
      t += ms;
    });
    setTimeout(function () {
      for (var j = 0; j < els.length; j++) els[j].classList.remove(cls);
    }, t);
  }

  var PATTERNS = [[60, 80, 40], [120, 50, 30, 60, 50], [40, 40, 40, 300, 70], [200]];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function randomFlicker() {
    if (!sign.classList.contains("off")) {
      var r = Math.random();
      if (r < 0.55) flick(letterEls(pick(letterIdx)), pick(PATTERNS), "fx-off");
      else if (r < 0.85) flick([pick(coins)], pick(PATTERNS), "fx-off");
      else if (r < 0.93) flick([toWord], pick(PATTERNS), "fx-off");
      else flick([svg], [70, 60, 90], "fx-brown"); // whole sign browns out
    }
    setTimeout(randomFlicker, 900 + Math.random() * 2600);
  }

  // ignition: bulbs first, then coins one by one, then "to", then the name
  function ignite() {
    sign.classList.add("off", "cold");
    setTimeout(function () {
      sign.classList.remove("off");
      coins.concat([toWord]).forEach(function (c) { c.classList.add("fx-off"); });
      layers.forEach(function (l) { l.classList.add("fx-off"); });
      coins.forEach(function (c, i) {
        setTimeout(function () { c.classList.remove("fx-off"); flick([c], [50, 60], "fx-off"); }, 250 + i * 110);
      });
      setTimeout(function () { toWord.classList.remove("fx-off"); }, 1100);
      setTimeout(function () {
        layers.forEach(function (l) { l.classList.remove("fx-off"); });
        flick(layers, [80, 120, 60, 40, 50, 200, 90], "fx-off");
        sign.classList.remove("cold");
      }, 1350);
      setTimeout(randomFlicker, 3200);
    }, 350);
  }

  if (!reduce) ignite();

  /* ---------- the rattlesnake heist ----------
     hover the rattlesnake link in the bio: a snake slithers to the edge of the
     screen, a mobster runs in, snatches it, and runs off with it. */

  if (!reduce) {
    var P = 3; // css px per art pixel
    var MOB_PAL = { K: "#111014", b: "#7a0a10", s: "#d9a066", e: "#050505", S: "#34323e",
                    p: "#76748a", w: "#f4efe2", r: "#d4141e", k: "#0a0a0a" };
    var MOB_TOP = [
      "....KKKK....",
      "...KKKKKK...",
      "...KbbbbK...",
      ".KKKKKKKKKK.",
      "....ssss....",
      "....sses....",
      "....ssss....",
      ".....ss.....",
      "..SSwrwSS...",
      ".SSpSrSpSS..",
      ".SpSSrSSpS..",
      ".SpSpSSpSS..",
      ".s.SpSSpS.s.",
      "...SpSSpS...",
      "...SSSSSS..."
    ];
    var MOB_GRAB_ARM = { 11: ".SpSpSSpSSss", 12: ".s.SpSSpS..." };
    var LEGS = [
      ["...SS..SS...", "...SS..SS...", "...SS..SS...", "...SS..SS...", "..kkk..kkk.."],
      ["...SS...SS..", "..SS.....SS.", ".SS.......S.", ".S........S.", "kk........kk"],
      ["...SS.SS....", "....SSS.....", "....SS.S....", "...SS..SS...", "..kkk.kkk..."]
    ];
    function mobSprite(legs, grab) {
      var rows = MOB_TOP.map(function (r, i) { return grab && MOB_GRAB_ARM[i] ? MOB_GRAB_ARM[i] : r; }).concat(legs);
      var cv = document.createElement("canvas");
      cv.width = 12; cv.height = rows.length;
      var cx = cv.getContext("2d");
      rows.forEach(function (row, y) {
        for (var x = 0; x < row.length; x++) {
          var col = MOB_PAL[row[x]];
          if (col) { cx.fillStyle = col; cx.fillRect(x, y, 1, 1); }
        }
      });
      return cv;
    }
    var MOB = {
      stand: mobSprite(LEGS[0], false),
      run: [mobSprite(LEGS[1], false), mobSprite(LEGS[2], false)],
      grabRun: [mobSprite(LEGS[1], true), mobSprite(LEGS[2], true)],
      grab: mobSprite(LEGS[0], true)
    };
    var MOB_H = 20, MOB_W = 12;
    var BODY = "#8a6a3a", DARK = "#4a3418", BELLY = "#c9a86a", RATTLE = "#e8dcc0";

    // draw a snake whose segments are laid out by pos(i) -> [x, y]; i = 0 is the head
    function drawSnake(ctx, LEN, pos, now, headDir) {
      for (var i = LEN; i >= 0; i--) {
        var q = pos(i), x = Math.round(q[0]), y = Math.round(q[1]);
        if (i >= LEN - 2) {
          ctx.fillStyle = RATTLE;
          ctx.fillRect(x, y + (Math.floor(now / 40) % 2 ? -1 : 0), 1, 2);
        } else {
          ctx.fillStyle = (i % 4 === 1) ? DARK : BODY;
          ctx.fillRect(x, y, 1, 2);
          ctx.fillStyle = BELLY;
          ctx.fillRect(x, y + 1, 1, 1);
        }
        if (i === 0) {
          ctx.fillStyle = DARK;
          ctx.fillRect(x - (headDir < 0 ? 1 : 0), y - 1, 2, 3);
          ctx.fillStyle = "#050505";
          ctx.fillRect(x + (headDir < 0 ? -1 : 1), y - 1, 1, 1);
          if (Math.floor(now / 120) % 2) {
            ctx.fillStyle = "#d4141e";
            ctx.fillRect(headDir < 0 ? x - 3 : x + 2, y + 1, 2, 1);
          }
        }
      }
    }

    var heistLink = document.querySelector('.bio a[href*="userattlesnake.com"]');
    if (heistLink) {
      var heisting = false;
      heistLink.addEventListener("mouseenter", function () {
        if (heisting) return;
        heisting = true;

        var r = heistLink.getBoundingClientRect();
        var vw = document.documentElement.clientWidth;
        var W = Math.floor((vw - r.left) / P);   // strip runs from the link to the screen edge
        var H = MOB_H + 4;
        var cv = document.createElement("canvas");
        cv.className = "heist";
        cv.width = W; cv.height = H;
        cv.style.width = W * P + "px";
        cv.style.height = H * P + "px";
        cv.style.left = (r.left + window.scrollX) + "px";
        cv.style.top = (r.bottom + window.scrollY + 14 - H * P) + "px";
        document.body.appendChild(cv);
        var ctx = cv.getContext("2d");

        var GROUND = H - 1;           // feet line
        var SY = GROUND - 2;          // snake belly line
        var LEN = 20;
        var stopX = Math.max(W - 62, 26); // where the snake ends up waiting
        var SNAKE_V = 0.1;            // art px per ms (~300 css px/s)
        var tArrive = Math.max(stopX / SNAKE_V, 700);
        var MOB_V_IN = 0.09, MOB_V_OUT = 0.085;
        var mobStop = stopX + 2;      // mobster's left edge when he grabs
        var tMobEnter = Math.max(tArrive - (W + 4 - mobStop) / MOB_V_IN, 0);
        var tGrab = tMobEnter + (W + 4 - mobStop) / MOB_V_IN;
        var tLeave = tGrab + 450;
        var t0 = performance.now();

        (function frame(now) {
          var t = now - t0;
          ctx.clearRect(0, 0, W, H);

          // the snake
          if (t < tGrab) {
            var head = Math.min(t * SNAKE_V, stopX);
            drawSnake(ctx, LEN, function (i) {
              var x = head - i;
              return [x, SY + Math.sin(x * 0.55 - now * 0.012) * 2];
            }, now, 1);
          }

          // the mobster
          var mx, img, flip;
          if (t >= tMobEnter && t < tGrab) {                   // running in, facing left
            mx = W + 4 - (t - tMobEnter) * MOB_V_IN;
            img = MOB.run[Math.floor(t / 90) % 2]; flip = true;
          } else if (t >= tGrab && t < tLeave) {               // the snatch
            mx = mobStop; img = MOB.grab; flip = true;
            var hx = mx + 1, hy = GROUND - 8;
            drawSnake(ctx, LEN, function (i) {               // held up, thrashing
              return [hx + Math.sin(i * 0.9 + now * 0.03) * 1.5, hy + i * 0.45];
            }, now, -1);
          } else if (t >= tLeave) {                            // running off, facing right
            mx = mobStop + (t - tLeave) * MOB_V_OUT;
            img = MOB.grabRun[Math.floor(t / 80) % 2]; flip = false;
            var gx = mx + MOB_W - 1, gy = GROUND - 9;
            drawSnake(ctx, LEN, function (i) {               // flailing behind him
              return [gx - i * 0.85, gy + Math.sin(i * 0.8 - now * 0.03) * 2.2 + i * 0.12];
            }, now, 1);
          }
          if (img) {
            ctx.save();
            if (flip) { ctx.translate(Math.round(mx) + MOB_W, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, GROUND - MOB_H + 1); }
            else ctx.drawImage(img, Math.round(mx), GROUND - MOB_H + 1);
            ctx.restore();
          }

          if (t < tLeave || mx < W + LEN + 4) requestAnimationFrame(frame);
          else { cv.remove(); heisting = false; }
        })(t0);
      });
    }
  }

  /* ---------- pronunciation: tap support for phones ---------- */

  var say = document.querySelector(".say");
  if (say) {
    // mouse: hover only, a click changes nothing. touch/pen: tap toggles it.
    var lastPointer = "mouse";
    say.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType; });
    say.addEventListener("click", function (e) {
      e.stopPropagation();
      if (lastPointer !== "mouse") say.classList.toggle("show");
    });
    say.addEventListener("mouseleave", function () { if (lastPointer === "mouse") say.classList.remove("show"); });
    document.addEventListener("click", function () { say.classList.remove("show"); });
  }

  /* ---------- contact, assembled here so html scrapers get nothing ---------- */

  var mail = document.getElementById("mail");
  var addr = ["keval", "userattlesnake.com"].join("@");
  mail.href = "mailto:" + addr;
  mail.textContent = addr;

  var payoutEl = document.getElementById("payout");
  var chars = [];
  [mail, document.getElementById("li")].forEach(function (a) {
    var t = a.textContent;
    a.setAttribute("aria-label", t);
    a.textContent = "";
    for (var q = 0; q < t.length; q++) {
      var sp = document.createElement("span");
      sp.className = "ch";
      sp.setAttribute("aria-hidden", "true");
      sp.textContent = t[q];
      a.appendChild(sp);
      chars.push(sp);
    }
  });
  var canPayout = !reduce && "IntersectionObserver" in window;
  if (canPayout) payoutEl.classList.add("pending");

  /* ---------- pixel showgirls ---------- */

  var PAL = { Y: "#f6ff3a", P: "#b64dff", p: "#6a1fb8", s: "#d9a066", h: "#3b2314" };
  var TOP = [
    "..Y...Y.Y...Y..",
    "...Y..YPY..Y...",
    "....YYPYPYY....",
    ".....PYPYP.....",
    "......hhh......",
    ".....hsssh.....",
    ".....hsssh.....",
    "......sss......",
    ".......s.......",
    "....pPPPPPp....",
    "...s.PYPYP.s...",
    "..s..PPPPP..s..",
    ".s...PYPYP...s.",
    "Y....PPPPP....Y",
    "....YYYYYYY....",
    "....Y.Y.Y.Y...."
  ];
  var LEGS_A = [
    ".....ss.ss.....",
    ".....ss.ss.....",
    ".....ss.ss.....",
    ".....ss.ss.....",
    ".....ss.ss.....",
    ".....ss.ss.....",
    ".....ss.ss.....",
    "....YYY.YYY...."
  ];
  var LEGS_B = [
    ".....ss.ss.....",
    ".....ss..ss....",
    ".....ss...ss...",
    ".....ss....ss..",
    ".....ss.....ssY",
    ".....ss........",
    ".....ss........",
    "....YYY........"
  ];

  function sprite(rows) {
    var cv = document.createElement("canvas");
    cv.width = 15; cv.height = rows.length;
    var ctx = cv.getContext("2d");
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var col = PAL[row[x]];
        if (col) { ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1); }
      }
    });
    return cv.toDataURL();
  }

  var frames = [sprite(TOP.concat(LEGS_A)), sprite(TOP.concat(LEGS_B))];
  var parade = document.getElementById("parade");
  var GIRLS = 6, GAP = 70;
  var girls = [];
  for (var g = 0; g < GIRLS; g++) {
    var img = document.createElement("img");
    img.alt = "";
    img.src = frames[0];
    parade.appendChild(img);
    girls.push(img);
  }

  // first scroll sets the line walking; it crosses once and leaves the stage
  function walk() {
    window.removeEventListener("scroll", walk);
    var vw = window.innerWidth;
    var from = -GIRLS * GAP, to = vw + 40;
    var SPEED = 170; // px per second
    var dur = (to - from) / SPEED * 1000;
    var t0 = performance.now();
    parade.classList.add("on");
    (function frame(now) {
      var el = now - t0;
      var x0 = from + (to - from) * Math.min(el / dur, 1);
      var step = Math.floor(el / 200);
      for (var i = 0; i < GIRLS; i++) {
        girls[i].style.transform = "translateX(" + (x0 + i * GAP).toFixed(0) + "px)";
        girls[i].src = frames[(step + i) % 2];
      }
      if (el < dur) requestAnimationFrame(frame);
      else parade.classList.remove("on");
    })(t0);
  }

  if (!reduce) {
    girls.forEach(function (g) { g.style.transform = "translateX(-200px)"; });
    window.addEventListener("scroll", walk, { passive: true });
  }

  /* ---------- slot machine ---------- */

  var slot = document.getElementById("slot");
  var msg = document.getElementById("slot-msg");
  var lever = document.getElementById("lever");
  var fx = document.getElementById("coins-fx");
  var reels = Array.prototype.slice.call(slot.querySelectorAll(".reel"));
  var SYMS = ["7", "$", "bar", "♦", "★"];
  var spinning = false;

  function show(reel, sym) {
    var s = reel.firstElementChild;
    s.textContent = sym;
    s.className = sym === "7" ? "s7" : sym === "bar" ? "sbar" : "";
  }

  function rain() {
    for (var i = 0; i < 18; i++) {
      var c = document.createElement("i");
      c.className = "coin";
      c.style.left = (40 + Math.random() * 200) + "px";
      c.style.setProperty("--dx", (Math.random() * 80 - 40).toFixed(0) + "px");
      c.style.animationDelay = (Math.random() * .5).toFixed(2) + "s";
      fx.appendChild(c);
      setTimeout(function (el) { el.remove(); }.bind(null, c), 1800);
    }
  }

  function spin(result) {
    if (spinning) return;
    spinning = true;
    slot.classList.remove("win");
    msg.textContent = "good luck";
    lever.classList.add("pulled");
    setTimeout(function () { lever.classList.remove("pulled"); }, 260);

    reels.forEach(function (reel, i) {
      reel.classList.add("spin");
      var t = setInterval(function () {
        show(reel, SYMS[Math.floor(Math.random() * SYMS.length)]);
      }, 70);
      setTimeout(function () {
        clearInterval(t);
        reel.classList.remove("spin");
        show(reel, result[i]);
        if (i === reels.length - 1) done(result);
      }, 700 + i * 380);
    });
  }

  function done(r) {
    spinning = false;
    if (r[0] === r[1] && r[1] === r[2]) {
      msg.textContent = r[0] === "7" ? "jackpot!" : "winner!";
      slot.classList.add("win");
      if (!paid && canPayout) payout(); else rain();
    } else if (r[0] === r[1] || r[1] === r[2]) {
      msg.textContent = "so close";
    } else {
      msg.textContent = "house wins";
    }
  }

  function randomResult() {
    if (Math.random() < 0.18) return ["7", "7", "7"];
    return [0, 1, 2].map(function () { return SYMS[Math.floor(Math.random() * SYMS.length)]; });
  }

  var paid = false;

  // coins burst out, scatter, then fall into place as the contact details
  function payout() {
    paid = true;
    var sr = slot.getBoundingClientRect();
    var ox = sr.left + sr.width / 2 + window.scrollX;
    var oy = sr.top + sr.height * 0.5 + window.scrollY;
    var parts = chars.map(function (ch, i) {
      var el = document.createElement("i");
      el.className = "gold";
      el.textContent = ch.textContent;
      el.style.left = "0"; el.style.top = "0";
      document.body.appendChild(el);
      var ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
      var spd = 4 + Math.random() * 7;
      return { el: el, ch: ch, x: ox, y: oy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
               t0: 750 + i * 24, fly: false, done: false };
    });
    var dts = payoutEl.querySelectorAll("dt");
    setTimeout(function () { dts.forEach(function (d) { d.style.opacity = 1; }); }, 750);

    function put(p, x, y, s) { p.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + s.toFixed(2) + ")"; }
    var start = performance.now();
    (function tick(now) {
      var el = now - start, alive = false;
      parts.forEach(function (p) {
        if (p.done) return;
        alive = true;
        if (el < p.t0) {                         // scatter under gravity
          p.vy += 0.32; p.vx *= 0.985;
          p.x += p.vx; p.y += p.vy;
          put(p, p.x, p.y, 1);
        } else {                                 // fall into its letter
          if (!p.fly) {
            p.fly = true; p.fx = p.x; p.fy = p.y;
            var r = p.ch.getBoundingClientRect();
            p.tx = r.left + r.width / 2 + window.scrollX;
            p.ty = r.top + r.height / 2 + window.scrollY;
          }
          var k = Math.min((el - p.t0) / 520, 1);
          var ex = 1 - Math.pow(1 - k, 3);
          put(p, p.fx + (p.tx - p.fx) * ex, p.fy + (p.ty - p.fy) * k * k, 1 - 0.4 * k);
          if (k >= 1) {
            p.done = true;
            p.el.remove();
            p.ch.style.opacity = 1;
            p.ch.classList.add("land");
          }
        }
      });
      if (alive) requestAnimationFrame(tick);
      else payoutEl.classList.remove("pending");
    })(start);
  }

  lever.addEventListener("click", function () {
    spin(reduce || (!paid && canPayout) ? ["7", "7", "7"] : randomResult());
  });

  // first pull is on the house: reaching the bottom spins it
  if (canPayout) {
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting || paid) return;
      if (spinning) return; // a lever pull is already paying out
      io.disconnect();
      spin(["7", "7", "7"]);
    }, { threshold: 0.9 });
    io.observe(payoutEl);
  }
})();
