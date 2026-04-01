// Simple cart using localStorage
// Stores cart as array of {id, title, price, img, qty}

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

const CART_KEY = 'ebookstore_cart_v1';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getTotal(cart) {
  return cart.reduce((s,i) => s + (Number(i.price) * (i.qty||1)), 0);
}

function renderCartCount() {
  const cart = loadCart();
  const count = cart.reduce((s,i)=> s + (i.qty||1), 0);
  const el = qs('.cart-count');
  if (el) el.textContent = count;
}

function renderCartDropdown() {
  const cart = loadCart();
  const list = qs('.cart-items');
  const totalEl = qs('#cart-total');
  if (!list) return;
  list.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${item.img}" alt="" />
      <div class="ci-meta">
        <div class="ci-title">${item.title}</div>
        <div class="ci-qty">Qty: ${item.qty || 1}</div>
        <div class="ci-price">₹${Number(item.price) * (item.qty||1)}</div>
      </div>
      <button class="remove-item" data-id="${item.id}">Remove</button>
    `;
    list.appendChild(li);
  });
  if (totalEl) totalEl.textContent = getTotal(cart);
}

function addToCart(item) {
  const cart = loadCart();
  const existing = cart.find(i=>i.id === item.id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    item.qty = 1;
    cart.push(item);
  }
  saveCart(cart);
  renderCartCount();
  renderCartDropdown();
}

function removeFromCart(id) {
  let cart = loadCart();
  cart = cart.filter(i=>i.id !== id);
  saveCart(cart);
  renderCartCount();
  renderCartDropdown();
}

function clearCart() {
  saveCart([]);
  renderCartCount();
  renderCartDropdown();
}

function buildItemFromButton(btn) {
  const card = btn.closest('.image-holder');
  const titleEl = card ? qs('.book-title', card) : null;
  const imgEl = card ? qs('img', card) : null;
  const descEl = card ? qs('.desc', card) : null;

  const title = btn.dataset.title || (titleEl ? titleEl.textContent.trim() : 'Book');
  const img = btn.dataset.img || (imgEl ? imgEl.getAttribute('src') || '' : '');

  let price = Number(btn.dataset.price || 0);
  if (!price && descEl) {
    const m = descEl.textContent.match(/(\d+(?:\.\d+)?)/);
    price = m ? Number(m[1]) : 0;
  }

  const id = btn.dataset.id || `${title}__${img}`.toLowerCase().replaceAll(/\s+/g, '-');

  return { id, title, price, img };
}

// Wire up UI
document.addEventListener('DOMContentLoaded', ()=>{
  renderCartCount();
  renderCartDropdown();

  // Add-to-cart click handler for both dataset-based buttons and plain product card buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart, .image-holder .desc button');
    if (!btn) return;

    const item = buildItemFromButton(btn);
    addToCart(item);

    // simple feedback while preserving original label casing
    const originalLabel = btn.textContent;
    btn.textContent = 'Added';
    setTimeout(()=> { btn.textContent = originalLabel; }, 900);
  });

  // Toggle dropdown
  const cartBtn = qs('.cart-btn');
  const cartDropdown = qs('.cart-dropdown');
  if (cartBtn && cartDropdown) {
    cartBtn.addEventListener('click', ()=>{
      const open = cartDropdown.getAttribute('aria-hidden') === 'false';
      cartDropdown.setAttribute('aria-hidden', String(open));
      cartDropdown.style.display = open ? 'none' : 'block';
    });
  }

  // remove item (event delegation)
  const cartList = qs('.cart-items');
  if (cartList) {
    cartList.addEventListener('click', (e)=>{
      if (e.target.matches('.remove-item')) {
        const id = e.target.dataset.id;
        removeFromCart(id);
      }
    });
  }

  const clearBtn = qs('#clear-cart');
  if (clearBtn) clearBtn.addEventListener('click', clearCart);
});
