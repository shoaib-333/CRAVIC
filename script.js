/* =========================================================
   CRAVIC — site logic
   Menu data, category filter, order tray, WhatsApp checkout
   ========================================================= */

/* ---- Settings: edit these two lines for your kitchen ---- */
const CONFIG = {
  phone: "923712342377",          // WhatsApp number, country code first, no + or spaces
  displayPhone: "+92 371 2342377",
  hours: "Daily · 10:00 AM – 9:00 PM",
  area: "Home Delivery & Pickup across Islamabad / Rawalpindi City",
  currency: "Rs"
};

const IMG = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;

const MENU = [
  // ---------- Burgers ----------
  { id: "b1", cat: "burgers", catLabel: "Burger", name: "Zinger Burger", emoji: "🍔", badge: "Bestseller", price: 480,
    desc: "Crispy fried chicken fillet, crunchy lettuce and our signature sauce in a soft toasted bun.",
    img: IMG(34407059) },
  { id: "b2", cat: "burgers", catLabel: "Burger", name: "Cravic Special Burger", emoji: "🍔", badge: "Signature", price: 620,
    desc: "Double crisp patty, melted cheese, fresh veggies and the house Cravic spread.",
    img: IMG(12664796) },
  { id: "b3", cat: "burgers", catLabel: "Burger", name: "Cheese Patty Burger", emoji: "🍔", badge: "", price: 550,
    desc: "Juicy grilled patty loaded with cheddar, caramelised onion and smoky mayo.",
    img: IMG(9975765) },

  // ---------- Fries ----------
  { id: "f1", cat: "fries", catLabel: "Fries", name: "Classic Fries", emoji: "🍟", badge: "", price: 180,
    desc: "Golden, salted and perfectly crisp — the eternal sidekick to every meal.",
    img: IMG(5779487) },
  { id: "f2", cat: "fries", catLabel: "Fries", name: "Loaded Fries", emoji: "🍟", badge: "Popular", price: 380,
    desc: "Mountain of fries drizzled with cheese sauce, smoky BBQ and crispy toppings.",
    img: IMG(27758758) },
  { id: "f3", cat: "fries", catLabel: "Fries", name: "Cheesy Bacon Fries", emoji: "🍟", badge: "", price: 420,
    desc: "Fries buried under molten cheese, crispy bits and a whisper of pepper.",
    img: IMG(17035142) },

  // ---------- Shawarma ----------
  { id: "s1", cat: "shawarma", catLabel: "Shawarma", name: "Chicken Shawarma Roll", emoji: "🌯", badge: "Bestseller", price: 280,
    desc: "Slow-roasted shawarma chicken, garlic sauce and pickles rolled in warm pita.",
    img: IMG(16022887) },
  { id: "s2", cat: "shawarma", catLabel: "Shawarma", name: "Shawarma Platter", emoji: "🌯", badge: "", price: 550,
    desc: "Generous platter of shawarma meat with fries, fresh salad and two dips.",
    img: IMG(37322775) },
  { id: "s3", cat: "shawarma", catLabel: "Shawarma", name: "Zinger Shawarma", emoji: "🌯", badge: "New", price: 350,
    desc: "Crispy zinger strips, spicy sauce and crunchy slaw — our boldest wrap.",
    img: IMG(5779423) },

  // ---------- Chicken Karahi ----------
  { id: "k1", cat: "karahi", catLabel: "Chicken Karahi", name: "Chicken Karahi (Half)", emoji: "🍗", badge: "Bestseller", price: 750,
    desc: "Half kg of tender chicken simmered fresh in tomatoes, green chilli and ginger.",
    img: IMG(39378356) },
  { id: "k2", cat: "karahi", catLabel: "Chicken Karahi", name: "Chicken Karahi (Full)", emoji: "🍗", badge: "Family", price: 1400,
    desc: "A full kilo of our house karahi — made for sharing, gone in minutes.",
    img: IMG(29684985) },
  { id: "k3", cat: "karahi", catLabel: "Chicken Karahi", name: "Masala Karahi + Naan", emoji: "🍗", badge: "", price: 950,
    desc: "Rich, thick masala karahi served with two hot naan straight from the tandoor.",
    img: IMG(36202022) }
];

const money = (n) => `${CONFIG.currency} ${n.toLocaleString("en-PK")}`;
const byId = (id) => MENU.find((m) => m.id === id);

/* ---------------- Menu render + filter ---------------- */
const grid = document.getElementById("menuGrid");

function cardHTML(item) {
  return `
    <article class="card reveal" data-cat="${item.cat}">
      <div class="card-media">
        <span class="card-emoji" aria-hidden="true">${item.emoji}</span>
        <img src="${item.img}" alt="${item.name}" loading="lazy" decoding="async"
             onerror="this.remove()" />
        ${item.badge ? `<span class="card-badge">${item.badge}</span>` : ""}
        <span class="card-cat">${item.catLabel}</span>
      </div>
      <div class="card-body">
        <div class="card-head">
          <h3>${item.name}</h3>
          <span class="price-pill">${money(item.price)}</span>
        </div>
        <p class="card-desc">${item.desc}</p>
        <button class="btn-add" data-add="${item.id}">Add to order <span>+</span></button>
      </div>
    </article>`;
}

function renderMenu(filter = "all") {
  grid.innerHTML = MENU
    .filter((i) => filter === "all" || i.cat === filter)
    .map(cardHTML)
    .join("");
  grid.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("is-active", t === btn);
    t.setAttribute("aria-selected", String(t === btn));
  });
  renderMenu(btn.dataset.cat);
});

/* ---------------- Order tray (cart) ---------------- */
const STORAGE_KEY = "cravic-order-v1";
let cart = {};

try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { cart = {}; }

const cartEl = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const itemsEl = document.getElementById("cartItems");
const countEl = document.getElementById("cartCount");
const totalEl = document.getElementById("cartTotal");

function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* private mode */ }
}

function cartCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }
function cartTotal() { return Object.entries(cart).reduce((sum, [id, q]) => sum + (byId(id)?.price || 0) * q, 0); }

function renderCart() {
  const entries = Object.entries(cart).filter(([, q]) => q > 0);
  const count = cartCount();

  countEl.hidden = count === 0;
  countEl.textContent = count;
  if (count) { countEl.classList.remove("is-bump"); void countEl.offsetWidth; countEl.classList.add("is-bump"); }

  totalEl.textContent = money(cartTotal());

  if (!entries.length) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <span class="big-heart">♥</span>
        <h4>Your order tray is empty</h4>
        <p>Add something delicious from the menu — burgers, fries, shawarma or karahi.</p>
      </div>`;
    return;
  }

  itemsEl.innerHTML = entries.map(([id, q]) => {
    const item = byId(id);
    if (!item) return "";
    return `
      <div class="cart-item">
        <img class="ci-thumb" src="${item.img}" alt="" onerror="this.style.visibility='hidden'">
        <div class="ci-info">
          <h4>${item.name}</h4>
          <span class="ci-price">${money(item.price * q)}</span>
        </div>
        <div class="qty">
          <button data-qty="dec" data-id="${id}" aria-label="Remove one ${item.name}">−</button>
          <span>${q}</span>
          <button data-qty="inc" data-id="${id}" aria-label="Add one ${item.name}">+</button>
        </div>
      </div>`;
  }).join("");
}

function changeQty(id, delta) {
  cart[id] = Math.max(0, (cart[id] || 0) + delta);
  if (cart[id] === 0) delete cart[id];
  saveCart();
  renderCart();
}

function addToCart(id) {
  changeQty(id, 1);
  showToast(`${byId(id).name} added <span class="mini-heart">♥</span>`);
}

grid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  addToCart(btn.dataset.add);
  btn.classList.add("is-added");
  btn.innerHTML = `Added <span>✓</span>`;
  setTimeout(() => {
    btn.classList.remove("is-added");
    btn.innerHTML = `Add to order <span>+</span>`;
  }, 1300);
});

itemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-qty]");
  if (!btn) return;
  changeQty(btn.dataset.id, btn.dataset.qty === "inc" ? 1 : -1);
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if (!cartCount()) return showToast("Your order tray is already empty");
  cart = {};
  saveCart();
  renderCart();
  showToast("Order tray cleared");
});

/* ---------------- Drawer open / close ---------------- */
function openCart() {
  cartEl.classList.add("is-open");
  cartEl.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("is-open"));
  document.body.style.overflow = "hidden";
}
function closeCart() {
  cartEl.classList.remove("is-open");
  cartEl.setAttribute("aria-hidden", "true");
  overlay.classList.remove("is-open");
  document.body.style.overflow = "";
  setTimeout(() => { overlay.hidden = true; }, 320);
}

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

/* ---------------- WhatsApp checkout ---------------- */
function waLink(text) { return `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(text)}`; }

document.getElementById("checkoutBtn").addEventListener("click", () => {
  const entries = Object.entries(cart).filter(([, q]) => q > 0);
  if (!entries.length) return showToast("Add something to your order first ♥");

  const lines = entries.map(([id, q]) => {
    const i = byId(id);
    return `• ${q} × ${i.name} — ${money(i.price * q)}`;
  });

  const msg =
`Salam CRAVIC! I would like to place an order:

${lines.join("\n")}

Subtotal: ${money(cartTotal())}

Name:
Address:
Delivery / Pickup:`;

  window.open(waLink(msg), "_blank", "noopener");
});

document.querySelectorAll(".wa-link").forEach((el) => {
  el.href = waLink("Salam CRAVIC! I would like to order some food. Please share today's menu ♥");
  el.target = "_blank";
  el.rel = "noopener";
});

document.querySelectorAll(".tel-link").forEach((el) => {
  el.href = `tel:+${CONFIG.phone}`;
});

document.getElementById("phoneText").textContent = CONFIG.displayPhone;
document.getElementById("hoursText").textContent = CONFIG.hours;
document.getElementById("areaText").textContent = CONFIG.area;
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------------- Toast ---------------- */
let toastTimer;
function showToast(html) {
  const t = document.getElementById("toast");
  t.innerHTML = html;
  t.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-show"), 2400);
}

/* ---------------- Header, nav, scroll reveal ---------------- */
const header = document.getElementById("siteHeader");
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");

window.addEventListener("scroll", () => {
  header.classList.toggle("is-stuck", window.scrollY > 24);
}, { passive: true });

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navToggle.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
});

nav.addEventListener("click", (e) => {
  if (e.target.matches(".nav-link")) {
    nav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

/* Scroll spy for nav highlighting */
const sections = ["top", "menu", "order", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    document.querySelectorAll(".nav-link").forEach((l) => {
      l.classList.toggle("is-active", l.getAttribute("href") === `#${en.target.id}`);
    });
  });
}, { rootMargin: "-45% 0px -50% 0px" });

sections.forEach((s) => spy.observe(s));

/* ---------------- Boot ---------------- */
renderMenu();
renderCart();
