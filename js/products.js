(function () {
  var CONTACT_EMAIL = 'pattydefeliceart@gmail.com';
  var cart = {};
  var productMap = {};

  function money(value) {
    return '$' + value.toFixed(2);
  }

  function init() {
    var productCards = document.querySelectorAll('.product-card');
    var cartToggleBtn = document.getElementById('cart-toggle-btn');
    var cartCloseBtn = document.getElementById('cart-close-btn');
    var cartClearBtn = document.getElementById('cart-clear-btn');
    var cartCheckoutBtn = document.getElementById('cart-checkout-btn');

    productCards.forEach(function (card) {
      var id = card.getAttribute('data-id');
      var name = card.getAttribute('data-name');
      var price = parseFloat(card.getAttribute('data-price'));
      productMap[id] = { id: id, name: name, price: price };
      var addBtn = card.querySelector('.add-to-cart-btn');
      if (addBtn) {
        addBtn.addEventListener('click', function () {
          addToCart(id);
        });
      }
    });

    if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartClearBtn) cartClearBtn.addEventListener('click', clearCart);
    if (cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', checkout);

    document.addEventListener('click', function (e) {
      var panel = document.getElementById('cart-panel');
      if (!panel || panel.getAttribute('aria-hidden') === 'true') return;
      var inner = panel.querySelector('.cart-panel-inner');
      var toggle = document.getElementById('cart-toggle-btn');
      if (inner && !inner.contains(e.target) && toggle && !toggle.contains(e.target)) {
        closeCart();
      }
    });

    renderCart();
  }

  function addToCart(productId) {
    if (!productMap[productId]) return;
    if (!cart[productId]) cart[productId] = 0;
    cart[productId] += 1;
    renderCart();
  }

  function setQty(productId, qty) {
    if (qty <= 0) {
      delete cart[productId];
    } else {
      cart[productId] = qty;
    }
    renderCart();
  }

  function clearCart() {
    cart = {};
    renderCart();
  }

  function getCartRows() {
    return Object.keys(cart).map(function (id) {
      var product = productMap[id];
      var qty = cart[id];
      var subtotal = product.price * qty;
      return { id: id, name: product.name, qty: qty, price: product.price, subtotal: subtotal };
    });
  }

  function renderCart() {
    var rows = getCartRows();
    var itemsEl = document.getElementById('cart-items');
    var countEl = document.getElementById('cart-count');
    var totalEl = document.getElementById('cart-total');
    if (!itemsEl || !countEl || !totalEl) return;

    var totalCount = 0;
    var total = 0;
    rows.forEach(function (row) {
      totalCount += row.qty;
      total += row.subtotal;
    });

    countEl.textContent = String(totalCount);
    totalEl.textContent = money(total);

    if (rows.length === 0) {
      itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      return;
    }

    itemsEl.innerHTML = '';
    rows.forEach(function (row) {
      var rowEl = document.createElement('div');
      rowEl.className = 'cart-item-row';
      rowEl.innerHTML =
        '<div class="cart-item-main">' +
          '<p class="cart-item-name">' + escapeHtml(row.name) + '</p>' +
          '<p class="cart-item-price">' + money(row.price) + ' each · Subtotal: ' + money(row.subtotal) + '</p>' +
        '</div>' +
        '<div class="cart-item-qty">' +
          '<button type="button" class="qty-btn" data-action="dec" data-id="' + row.id + '">-</button>' +
          '<span class="qty-value">' + row.qty + '</span>' +
          '<button type="button" class="qty-btn" data-action="inc" data-id="' + row.id + '">+</button>' +
        '</div>';
      itemsEl.appendChild(rowEl);
    });

    itemsEl.querySelectorAll('.qty-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var action = btn.getAttribute('data-action');
        var qty = cart[id] || 0;
        if (action === 'inc') setQty(id, qty + 1);
        if (action === 'dec') setQty(id, qty - 1);
      });
    });
  }

  function checkout() {
    var rows = getCartRows();
    if (!rows.length) {
      alert('Your cart is empty.');
      return;
    }

    var total = rows.reduce(function (sum, row) { return sum + row.subtotal; }, 0);
    var lines = [];
    lines.push('Hello Patty,');
    lines.push('');
    lines.push('I would like to place an order:');
    lines.push('');
    rows.forEach(function (row) {
      lines.push('- ' + row.name + ' x ' + row.qty + ' = ' + money(row.subtotal));
    });
    lines.push('');
    lines.push('Total cash: ' + money(total));
    lines.push('');
    lines.push('Thank you!');

    var subject = 'Shop Order: ' + money(total);
    var body = lines.join('\n');
    var href = 'mailto:' + encodeURIComponent(CONTACT_EMAIL) +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    window.location.href = href;
  }

  function openCart() {
    var panel = document.getElementById('cart-panel');
    if (!panel) return;
    panel.setAttribute('aria-hidden', 'false');
  }

  function closeCart() {
    var panel = document.getElementById('cart-panel');
    if (!panel) return;
    panel.setAttribute('aria-hidden', 'true');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
