/**
 * Site navbar behaviour: mobile menu toggle + active-link highlighting.
 * Markup lives in each page (<header class="site-nav" data-site-nav>).
 */
(function () {
  "use strict";

  var nav = document.querySelector("[data-site-nav]");
  if (!nav) return;

  var toggle = nav.querySelector(".site-nav__toggle");
  var menu = nav.querySelector(".site-nav__menu");
  var links = nav.querySelectorAll(".site-nav__link");
  var mq = window.matchMedia("(max-width: 991px)");

  /* ---- Mobile menu ------------------------------------------------------ */
  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    // Close after choosing a link
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    // Close on Escape or click outside
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target)) {
        setOpen(false);
      }
    });

    // Reset when resizing back to desktop
    var onChange = function (e) {
      if (!e.matches) setOpen(false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---- Active link (section in view) ----------------------------------- */
  var sectionLinks = [];
  links.forEach(function (a) {
    var hash = a.hash;
    if (hash && hash.length > 1) {
      var target = document.getElementById(hash.slice(1));
      // Only track links that point at a section on the current page
      if (target) sectionLinks.push({ link: a, target: target });
    }
  });

  if (sectionLinks.length && "IntersectionObserver" in window) {
    var setActive = function (link) {
      links.forEach(function (a) {
        if (a === link) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var match = sectionLinks.filter(function (s) {
            return s.target === entry.target;
          })[0];
          if (match) setActive(match.link);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    sectionLinks.forEach(function (s) {
      observer.observe(s.target);
    });
  }

  /* ---- Navbar follows the scroll: slides up as you scroll down, back as you scroll up */
  var lastY = window.scrollY;
  var shift = 0;            // current upward offset in px (0 = fully visible)
  var navTicking = false;

  function maxShift() {
    return nav.getBoundingClientRect().height + 40;
  }
  function applyShift() {
    nav.style.transform = shift ? "translate3d(0," + -shift + "px,0)" : "";
  }
  function onNavScroll() {
    navTicking = false;
    var y = Math.max(0, window.scrollY);
    var dy = y - lastY;
    lastY = y;
    if (nav.classList.contains("is-open")) { shift = 0; applyShift(); return; }
    shift = Math.min(maxShift(), Math.max(0, shift + dy));
    if (y <= 0) shift = 0;
    applyShift();
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!navTicking) {
        navTicking = true;
        window.requestAnimationFrame(onNavScroll);
      }
    },
    { passive: true }
  );
  // keyboard users: never leave a focused link off-screen
  nav.addEventListener("focusin", function () { shift = 0; applyShift(); });
})();
