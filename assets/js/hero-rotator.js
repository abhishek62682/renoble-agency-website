/* Hero headline: rotate the highlighted word ("Next-Gen") through alternates. */
(function () {
  var el = document.querySelector(".home-hero .h1-highlight");
  if (!el) return;
  var WORDS = ["Next-Gen", "High-End", "Bug-Free", "Top-Rank"]; // all exactly 8 characters incl. the hyphen, same as "Next-Gen"
  var HOLD = 2600;  // ms each word stays
  var SPEED = 650;  // ms slide duration
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  var original = el.textContent.trim();
  if (WORDS.indexOf(original) === -1) WORDS.unshift(original);

  // measure each word with the same font as the headline
  function measure(text) {
    var m = document.createElement("span");
    m.textContent = text;
    m.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;left:0;top:0";
    el.appendChild(m);
    var w = m.getBoundingClientRect().width;
    m.remove();
    return w;
  }

  var mask = document.createElement("span");
  mask.className = "rot__mask";
  var cur = document.createElement("span");
  cur.className = "rot__word";
  cur.textContent = original;
  el.setAttribute("aria-label", original);
  el.textContent = "";
  el.appendChild(mask);
  mask.appendChild(cur);

  // always measure live: the web font may load after this script runs
  function widthOf(t) {
    return Math.ceil(measure(t)) + 2;
  }
  // fixed width (widest word): only the word slides, nothing else on the line moves
  function maxWidth() {
    var m = 0;
    WORDS.forEach(function (w) { m = Math.max(m, widthOf(w)); });
    return m;
  }
  mask.style.width = maxWidth() + "px";
  function refit() {
    mask.style.width = maxWidth() + "px";
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
  window.addEventListener("load", function () { setTimeout(refit, 100); });
  window.addEventListener("resize", refit);

  var i = WORDS.indexOf(original);
  var busy = false;

  function next() {
    if (busy || document.hidden) return;
    busy = true;
    i = (i + 1) % WORDS.length;
    var word = WORDS[i];
    var incoming = document.createElement("span");
    incoming.className = "rot__word rot__word--in";
    incoming.textContent = word;
    mask.appendChild(incoming);
    // force layout then slide: old goes up, new comes from below
    void incoming.offsetWidth;
    cur.classList.add("rot__word--out");
    incoming.classList.remove("rot__word--in");
    setTimeout(function () {
      cur.remove();
      cur = incoming;
      busy = false;
    }, SPEED);
  }

  // start after the page loader has opened
  setTimeout(function () {
    setInterval(next, HOLD + SPEED);
  }, 4600);
})();
