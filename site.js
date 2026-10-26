// When Pigs Fly USA — the 100-envelope board and the free-challenges form.
(() => {
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

  // Free challenges: the email goes to the newsletter service in `action`, which sends the PDF and handles unsubscribes.
  const form = document.getElementById("form");
  if (form) {
    const msg = document.getElementById("form-msg");
    const button = form.querySelector("button");
    const ok = "Almost there: check your inbox and confirm your email to get the challenges.";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email_address.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        msg.textContent = "That email doesn't look right. Check it and try again.";
        return;
      }
      if (form.website.value) { msg.textContent = ok; return; } // bot filled the hidden field
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
        msg.textContent = ok;
        form.reset();
      } catch {
        form.submit(); // the service's own page takes over if the background request is blocked
      } finally {
        button.disabled = false;
      }
    });
  }
})();
