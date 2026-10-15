(function () {
  // Paste your Google Apps Script Web App URL here (ends with /exec).
  // If empty, the form falls back to opening WhatsApp.
  var SHEET_URL = "https://script.google.com/macros/s/AKfycbwyJ_7crysBa9xQm0qkRB0Gg4BnYp5HXYUlxkQMWyNlLZ1ULqiR8j8-5PGGwog1jSB0Zw/exec";
  var WA = "918356971330";

  var form = document.getElementById("email-form");
  if (!form) return;
  var wrap = document.getElementById("contact-form-block");
  var done = wrap.querySelector(".w-form-done");
  var fail = wrap.querySelector(".w-form-fail");
  var submit = form.querySelector('input[type="submit"]');

  // honeypot field (hidden from humans)
  var trap = document.createElement("input");
  trap.type = "text";
  trap.name = "hp_x7q"; // unusual name so browser autofill never fills it
  trap.tabIndex = -1;
  trap.autocomplete = "new-password";
  trap.setAttribute("aria-hidden", "true");
  trap.style.cssText = "position:absolute;left:-9999px;opacity:0;height:0;width:0";
  form.appendChild(trap);

  // Visible status line right above the button, so errors are never missed
  var status = document.createElement("p");
  status.setAttribute("role", "alert");
  status.style.cssText =
    "margin:0 0 12px;font-size:14px;line-height:1.4;color:#c0392b;display:none";
  if (submit && submit.parentNode) submit.parentNode.insertBefore(status, submit);

  function showFail(msg) {
    status.textContent = msg || "Something went wrong. Please try again.";
    status.style.display = "block";
  }

  // capture phase + stopImmediatePropagation keeps Webflow's own form handler
  // from also firing (it posts to Webflow and shows its generic error)
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    var name = form.elements["name"].value.trim();
    var email = form.elements["email"].value.trim();
    var phone = form.elements["phone"].value.trim();
    var msg = form.elements["Message"].value.trim();
    var digits = phone.replace(/\D/g, "");
    var ok =
      name &&
      /^\S+@\S+\.\S+$/.test(email) &&
      digits.length >= 10 &&
      digits.length <= 13 &&
      msg;
    status.style.display = "none";
    if (fail) fail.style.display = "none";
    if (!name) return showFail("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return showFail("Please enter a valid email address.");
    if (digits.length < 10 || digits.length > 13) return showFail("Please enter a valid 10-digit mobile number.");
    if (!msg) return showFail("Please tell us how we can help.");

    var data = new URLSearchParams();
    data.set("name", name);
    data.set("email", email);
    data.set("phone", phone);
    data.set("message", msg);
    data.set("page", location.href);
    data.set("company", ""); // server honeypot stays empty for real users

    if (trap.value) return; // honeypot filled: bot, drop silently

    function finish() {
      form.style.display = "none";
      if (done) done.style.display = "block";
    }

    if (!SHEET_URL) {
      var text =
        "Hi renoble.agency,\nName: " + name + "\nEmail: " + email + "\nMobile: " + phone + "\n\n" + msg;
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      return finish();
    }

    if (submit) {
      submit.disabled = true;
      submit.value = "Sending...";
    }

    // Reliable delivery to Apps Script: a hidden form posted into a hidden iframe
    // (no CORS, works from file:// and behind most ad-blockers).
    var frameName = "lead_frame_" + Date.now();
    var iframe = document.createElement("iframe");
    iframe.name = frameName;
    iframe.style.display = "none";
    var post = document.createElement("form");
    post.method = "POST";
    post.action = SHEET_URL;
    post.target = frameName;
    post.style.display = "none";
    data.forEach(function (value, key) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      post.appendChild(input);
    });
    document.body.appendChild(iframe);
    document.body.appendChild(post);

    var finished = false;
    function complete() {
      if (finished) return;
      finished = true;
      finish();
      setTimeout(function () {
        iframe.remove();
        post.remove();
      }, 1000);
    }
    iframe.addEventListener("load", complete);
    setTimeout(complete, 6000); // never leave the user hanging
    post.submit();
  }, true);
})();
