const canvas = document.querySelector("#signal-canvas");
const ctx = canvas.getContext("2d");
const glow = document.querySelector(".cursor-glow");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = 0;
let height = 0;
let particles = [];
let pulse = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.floor(Math.min(92, Math.max(36, width / 18)));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.32,
    vy: (Math.random() - 0.5) * 0.32,
    radius: index % 7 === 0 ? 1.8 : 1,
  }));
}

function drawSignals() {
  ctx.clearRect(0, 0, width, height);
  pulse += 0.012;

  const waveY = height * 0.72;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 10) {
    const y = waveY + Math.sin(x * 0.012 + pulse * 2.2) * 22 + Math.sin(x * 0.031 + pulse) * 8;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(217, 170, 85, 0.22)";
  ctx.lineWidth = 1;
  ctx.stroke();

  particles.forEach((point, index) => {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < 0 || point.x > width) point.vx *= -1;
    if (point.y < 0 || point.y > height) point.vy *= -1;

    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fillStyle = index % 5 === 0 ? "rgba(217, 170, 85, 0.55)" : "rgba(66, 233, 255, 0.42)";
    ctx.fill();

    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const dx = point.x - other.x;
      const dy = point.y - other.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 118) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = `rgba(66, 233, 255, ${0.11 * (1 - distance / 118)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  if (!prefersReducedMotion) requestAnimationFrame(drawSignals);
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}

function setupFilters() {
  const buttons = document.querySelectorAll("[data-filter]");
  const posts = document.querySelectorAll(".post-card");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      posts.forEach((post) => {
        post.classList.toggle("is-hidden", filter !== "all" && post.dataset.category !== filter);
      });
    });
  });
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-count]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = Number(entry.target.dataset.count);
        let current = 0;
        const step = () => {
          current += Math.ceil(target / 38);
          entry.target.textContent = Math.min(current, target);
          if (current < target) requestAnimationFrame(step);
        };
        step();
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function setupPointerEffects() {
  window.addEventListener("pointermove", (event) => {
    glow.style.opacity = "1";
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 7}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

function setupSubscribe() {
  const form = document.querySelector(".subscribe");
  const note = document.querySelector(".form-note");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    note.textContent = "收到，我會把這裡當作聯絡入口保留";
    form.reset();
  });
}

const ticker = document.querySelector(".ticker div");
ticker.innerHTML += ticker.innerHTML;

resizeCanvas();
setupReveal();
setupFilters();
setupCounters();
setupSubscribe();
if (!prefersReducedMotion) setupPointerEffects();
drawSignals();

window.addEventListener("resize", resizeCanvas);
