// When Pigs Fly USA — the 100-envelope board and the free-challenges form.
(() => {
  // Meta Pixel, only on pages that ask for it (<body data-pixel>) and never if the visitor opted out here
  // or their browser sends Global Privacy Control. See privacy/#choices.
  const PIXEL_ID = "1453984696537511";
  const optedOut = () => {
    try { return localStorage.getItem("wpf-optout") === "1"; } catch { return false; }
  };
  if (document.body.hasAttribute("data-pixel") && !navigator.globalPrivacyControl && !optedOut()) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }
  const track = (...args) => { if (window.fbq) window.fbq(...args); };
  document.querySelectorAll("[data-out]").forEach((a) => a.addEventListener("click", () => track("trackCustom", "OutboundClick", { store: a.dataset.out })));

  // Privacy choices: opt out of ad measurement in this browser.
  const optBtn = document.getElementById("optout");
  if (optBtn) {
    const optMsg = document.getElementById("optout-msg");
    const show = () => { optMsg.textContent = optedOut() || navigator.globalPrivacyControl ? "You're opted out in this browser. We won't load the Meta Pixel here." : ""; };
    optBtn.addEventListener("click", () => {
      try { localStorage.setItem("wpf-optout", "1"); } catch { /* storage blocked: nothing loads anyway on next visit with GPC */ }
      show();
    });
    show();
  }
  // Board: tap a number to "stuff" that envelope. Starts with a few done so it reads as a challenge in progress.
  const board = document.getElementById("board");
  if (board) {
    const saved = document.getElementById("saved");
    const meter = document.getElementById("meter");
    const count = document.getElementById("count");
    const done = new Set([1, 5, 12, 20, 33, 47, 50, 64, 71, 88, 100]);
    const fmt = (n) => "$" + n.toLocaleString("en-US");
    const render = () => {
      let total = 0;
      done.forEach((n) => (total += n));
      saved.textContent = fmt(total);
      meter.style.width = (total / 5050) * 100 + "%";
      count.textContent = done.size + " of 100 envelopes";
      board.querySelectorAll(".cell").forEach((c) => {
        const on = done.has(Number(c.dataset.n));
        c.classList.toggle("done", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
    };
    for (let n = 1; n <= 100; n++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cell";
      b.dataset.n = n;
      b.textContent = n;
      b.setAttribute("aria-label", "Envelope " + n + ", $" + n);
      b.addEventListener("click", () => { done.has(n) ? done.delete(n) : done.add(n); render(); });
      board.appendChild(b);
    }
    document.getElementById("random").addEventListener("click", () => {
      const left = [];
      for (let n = 1; n <= 100; n++) if (!done.has(n)) left.push(n);
      if (left.length) done.add(left[Math.floor(Math.random() * left.length)]);
      render();
    });
    document.getElementById("reset").addEventListener("click", () => { done.clear(); render(); });
    render();
  }

  // Photo reviews: a small photo swaps the big one.
  document.querySelectorAll(".pr-thumbs").forEach((row) => {
    const main = row.parentElement.querySelector(".pr-main");
    row.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      main.src = b.dataset.src;
      row.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    });
  });

  // Free challenges: the email goes to the newsletter service in `action`, which sends the PDF and handles unsubscribes.
  // A page can have several forms; each one has its own message line right after it.
  document.querySelectorAll("form.form").forEach((form) => {
    const msg = form.nextElementSibling;
    const button = form.querySelector("button");
    const ok = "Almost there: check your inbox and confirm your email to get the challenges.";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email_address.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        msg.textContent = "That email doesn't look right. Check it and try again.";
        return;
      }
      if (form.querySelector(".hp").value) { msg.textContent = ok; return; } // bot filled the hidden field
      if (!/^https:\/\//.test(form.getAttribute("action") || "")) {
        msg.textContent = "Sign-up opens very soon. Please try again in a few days.";
        return;
      }
      button.disabled = true;
      msg.textContent = "Sending…";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json().catch(() => ({}));
        if (data.status === "failed") {
          msg.textContent = (data.errors?.messages || [])[0] || "That didn't work. Check your email and try again.";
          return;
        }
        msg.textContent = ok;
        track("track", "Lead");
        form.reset();
      } catch {
        form.submit(); // the service's own page takes over if the background request is blocked
      } finally {
        button.disabled = false;
      }
    });
  });
})();
