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

  /* ---------- contact, assembled here so html scrapers get nothing ---------- */

  var mail = document.getElementById("mail");
  var addr = ["keval", "userattlesnake.com"].join("@");
  mail.href = "mailto:" + addr;
  mail.textContent = addr;

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

  var lastY = window.scrollY, dir = 1, idle, ticking = false;

  function draw() {
    ticking = false;
    var y = window.scrollY;
    if (y !== lastY) dir = y > lastY ? 1 : -1;
    lastY = y;
    var vw = window.innerWidth;
    var loop = vw + GIRLS * GAP;
    var base = (y * 0.55) % loop;
    var step = Math.floor(y / 34);
    for (var i = 0; i < GIRLS; i++) {
      // offset so the line is already partly on stage at the top of the page
      var x = ((base + i * GAP + GIRLS * GAP + 40) % loop) - GIRLS * GAP;
      girls[i].style.transform = "translateX(" + x.toFixed(0) + "px)" + (dir < 0 ? " scaleX(-1)" : "");
      girls[i].src = frames[(step + i) % 2];
    }
  }

  if (!reduce) {
    window.addEventListener("scroll", function () {
      parade.classList.add("on");
      clearTimeout(idle);
      idle = setTimeout(function () { parade.classList.remove("on"); }, 900);
      if (!ticking) { ticking = true; requestAnimationFrame(draw); }
    }, { passive: true });
    draw();
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
      rain();
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

  lever.addEventListener("click", function () { spin(reduce ? ["7", "7", "7"] : randomResult()); });

  // first pull is on the house
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); spin(["7", "7", "7"]); }
    }, { threshold: 0.7 });
    io.observe(slot);
  }
})();
