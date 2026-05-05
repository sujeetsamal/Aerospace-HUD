// ============================================================================
// CINEMATIC INTRO ANIMATION — COMPLETE REBUILD
// ============================================================================

document.addEventListener("DOMContentLoaded", function() {
  initIntro();
});

function initIntro() {
  const overlay = document.getElementById("intro-overlay");
  
  // Force overlay visible immediately
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000010;z-index:9999;overflow:hidden;display:flex;align-items:center;justify-content:center;";

  // Inject canvas for starfield
  const canvas = document.createElement("canvas");
  canvas.id = "intro-canvas";
  canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  overlay.appendChild(canvas);

  // Inject boot text
  const bootText = document.createElement("div");
  bootText.id = "boot-text";
  bootText.style.cssText = "position:absolute;bottom:80px;left:50%;transform:translateX(-50%);color:#00d4ff;font-family:'JetBrains Mono',monospace;font-size:14px;letter-spacing:3px;text-align:center;z-index:10";
  bootText.textContent = "INITIALIZING LAUNCH SEQUENCE...";
  overlay.appendChild(bootText);

  // Inject skip button
  const skipBtn = document.createElement("button");
  skipBtn.id = "skip-intro";
  skipBtn.textContent = "[ SKIP ]";
  skipBtn.style.cssText = "position:absolute;top:20px;right:24px;background:transparent;border:1px solid rgba(0,212,255,0.3);color:rgba(0,212,255,0.5);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:2px;padding:6px 12px;cursor:pointer;z-index:10000;display:none;";
  overlay.appendChild(skipBtn);

  // Hide main content while intro plays
  document.body.style.overflow = "hidden";

  // Start sequence
  startPhase1(canvas, overlay, skipBtn);
  
  // Show skip button after 1s
  setTimeout(() => { skipBtn.style.display = "block"; }, 1000);
  
  // Skip button handler
  skipBtn.addEventListener("click", () => completeIntro(overlay));
}

// ============================================================================
// PHASE 1–3: Starfield + Warp
// ============================================================================

function startPhase1(canvas, overlay, skipBtn) {
  const ctx = canvas.getContext("2d");
  const stars = [];
  
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: 0,
      speed: Math.random() * 0.3 + 0.1
    });
  }

  let phase = "stars";
  let warpProgress = 0;
  let animFrame;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (phase === "stars") {
      stars.forEach(s => {
        s.alpha = Math.min(s.alpha + 0.008, 0.9);
        s.y -= s.speed;
        if (s.y < 0) s.y = canvas.height;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180, 220, 255, " + s.alpha + ")";
        ctx.fill();
      });
    }

    if (phase === "warp") {
      warpProgress = Math.min(warpProgress + 0.025, 1);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.strokeStyle = "rgba(0, 212, 255, " + (0.6 * warpProgress) + ")";
      stars.forEach(s => {
        const dx = s.x - cx;
        const dy = s.y - cy;
        const len = Math.sqrt(dx*dx + dy*dy) * warpProgress * 0.4;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          ctx.beginPath();
          ctx.lineWidth = s.r;
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + nx * len, s.y + ny * len);
          ctx.stroke();
        }
      });
    }

    animFrame = requestAnimationFrame(draw);
  }

  draw();
  setTimeout(() => launchRocket(overlay), 1500);
  setTimeout(() => { phase = "warp"; }, 3500);
  setTimeout(() => {
    cancelAnimationFrame(animFrame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showCockpit(overlay);
  }, 5000);
  setTimeout(() => completeIntro(overlay), 7500);
}

function launchRocket(overlay) {
  const rocket = document.createElement("div");
  rocket.innerHTML = "<svg width=\"60\" height=\"120\" viewBox=\"0 0 60 120\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"30\" cy=\"55\" rx=\"12\" ry=\"40\" fill=\"#0a2a4a\" stroke=\"#00d4ff\" stroke-width=\"1.5\"/><polygon points=\"30,5 18,50 42,50\" fill=\"#00d4ff\" opacity=\"0.8\"/><polygon points=\"18,80 5,110 18,95\" fill=\"#00d4ff\" opacity=\"0.6\"/><polygon points=\"42,80 55,110 42,95\" fill=\"#00d4ff\" opacity=\"0.6\"/><circle cx=\"30\" cy=\"50\" r=\"7\" fill=\"none\" stroke=\"#00ff88\" stroke-width=\"1.5\"/><circle cx=\"30\" cy=\"50\" r=\"3\" fill=\"#00ff88\" opacity=\"0.5\"/><ellipse cx=\"30\" cy=\"100\" rx=\"8\" ry=\"5\" fill=\"#ff6b35\" opacity=\"0.9\"/><ellipse cx=\"30\" cy=\"108\" rx=\"5\" ry=\"8\" fill=\"#ff9500\" opacity=\"0.6\"/><ellipse cx=\"30\" cy=\"116\" rx=\"3\" ry=\"6\" fill=\"#ffff00\" opacity=\"0.3\"/></svg>";
  rocket.style.cssText = "position:absolute;bottom:-140px;left:50%;transform:translateX(-50%);z-index:20;filter:drop-shadow(0 0 20px #ff6b35) drop-shadow(0 0 40px rgba(255,107,53,0.4));transition:bottom 2s cubic-bezier(0.25, 0.46, 0.15, 1);";
  overlay.appendChild(rocket);
  requestAnimationFrame(() => {
    setTimeout(() => {
      rocket.style.bottom = "120vh";
      rocket.style.filter = "drop-shadow(0 0 30px #ff6b35) drop-shadow(0 0 60px rgba(255,150,0,0.6))";
    }, 50);
  });
  setTimeout(() => rocket.remove(), 2100);
}

function showCockpit(overlay) {
  const cockpit = document.createElement("div");
  cockpit.id = "cockpit-frame";
  cockpit.innerHTML = "<svg id=\"cockpit-svg\" viewBox=\"0 0 800 600\" xmlns=\"http://www.w3.org/2000/svg\" style=\"position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.05);transition:transform 1.5s cubic-bezier(0.16,1,0.3,1);width:120vw;max-width:1400px;\"><path d=\"M 100,580 L 50,200 Q 400,20 750,200 L 700,580 Z\" fill=\"none\" stroke=\"#00d4ff\" stroke-width=\"2\" opacity=\"0.8\"/><path d=\"M 150,560 L 110,230 Q 400,80 690,230 L 650,560 Z\" fill=\"rgba(0,10,30,0.3)\" stroke=\"#00d4ff\" stroke-width=\"1\" opacity=\"0.4\"/><line x1=\"200\" y1=\"320\" x2=\"600\" y2=\"320\" stroke=\"#00ff88\" stroke-width=\"1\" opacity=\"0\"/><line x1=\"380\" y1=\"280\" x2=\"420\" y2=\"280\" stroke=\"#00d4ff\" stroke-width=\"1.5\" opacity=\"0\"/><line x1=\"400\" y1=\"260\" x2=\"400\" y2=\"300\" stroke=\"#00d4ff\" stroke-width=\"1.5\" opacity=\"0\"/><circle cx=\"400\" cy=\"290\" r=\"15\" fill=\"none\" stroke=\"#00d4ff\" stroke-width=\"1\" opacity=\"0\"/><path d=\"M 160,160 L 160,190 L 190,190\" fill=\"none\" stroke=\"#00d4ff\" stroke-width=\"2\" opacity=\"0\"/><path d=\"M 640,160 L 640,190 L 610,190\" fill=\"none\" stroke=\"#00d4ff\" stroke-width=\"2\" opacity=\"0\"/><text x=\"170\" y=\"420\" fill=\"#00ff88\" font-family=\"monospace\" font-size=\"14\" opacity=\"0\">ALT: 32,000 FT</text><text x=\"530\" y=\"420\" fill=\"#00ff88\" font-family=\"monospace\" font-size=\"14\" opacity=\"0\">SPD: MACH 2.1</text><text x=\"340\" y=\"530\" fill=\"#00d4ff\" font-family=\"monospace\" font-size=\"14\" opacity=\"0\">HDG: 090°</text></svg>";
  cockpit.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;z-index:30;";
  overlay.appendChild(cockpit);
  const svg = cockpit.querySelector("#cockpit-svg");
  requestAnimationFrame(() => {
    setTimeout(() => {
      svg.style.transform = "translate(-50%,-50%) scale(1)";
    }, 50);
  });
  setTimeout(() => {
    const elements = svg.querySelectorAll("[opacity=\"0\"]");
    elements.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = "opacity 0.3s";
        el.setAttribute("opacity", "1");
      }, i * 120);
    });
  }, 1200);
}

function completeIntro(overlay) {
  const scanline = document.createElement("div");
  scanline.style.cssText = "position:absolute;top:-4px;left:0;width:100%;height:4px;background:linear-gradient(90deg, transparent, #00d4ff, transparent);box-shadow:0 0 20px #00d4ff;z-index:100;transition:top 0.8s linear;";
  overlay.appendChild(scanline);
  requestAnimationFrame(() => {
    setTimeout(() => { scanline.style.top = "100vh"; }, 50);
  });
  setTimeout(() => {
    overlay.style.transition = "opacity 0.8s ease";
    overlay.style.opacity = "0";
    document.body.style.overflow = "";
  }, 700);
  setTimeout(() => {
    overlay.remove();
    document.dispatchEvent(new CustomEvent("introComplete"));
  }, 1500);
}
