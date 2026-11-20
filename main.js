// keval.vegas — the only script on the page.

(function () {
  var sign = document.getElementById("sign");
  var bulbs = sign.querySelector(".bulbs");
  var GAP = 18;    // px between bulbs
  var INSET = 9;   // px from the sign's edge

  // lay bulbs around the frame
  function layBulbs() {
    var w = sign.clientWidth - INSET * 2;
    var h = sign.clientHeight - INSET * 2;
    var nx = Math.max(2, Math.round(w / GAP));
    var ny = Math.max(2, Math.round(h / GAP));
    var pts = [], i;
    for (i = 0; i < nx; i++) pts.push([i * w / nx, 0]);   // top
    for (i = 0; i < ny; i++) pts.push([w, i * h / ny]);   // right
    for (i = nx; i > 0; i--) pts.push([i * w / nx, h]);   // bottom
    for (i = ny; i > 0; i--) pts.push([0, i * h / ny]);   // left

    var frag = document.createDocumentFragment();
    pts.forEach(function (p, n) {
      var b = document.createElement("i");
      b.className = "bulb p" + (n % 3);
      b.style.left = (p[0] + INSET) + "px";
      b.style.top = (p[1] + INSET) + "px";
      frag.appendChild(b);
    });
    bulbs.replaceChildren(frag);
  }

  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(layBulbs, 120);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layBulbs);
  layBulbs();

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

  // email, assembled here so scrapers reading raw html get nothing
  var mail = document.getElementById("mail");
  var addr = ["kevkpatel", "gmail.com"].join("@");
  mail.href = "mailto:" + addr;
  mail.title = addr;
})();
