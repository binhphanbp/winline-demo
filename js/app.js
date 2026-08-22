/**
 * Winline Vietnam - Master Application Logic (Production-Ready)
 * Cart Drawer, Quick View Modal, Product Compare Drawer, Live Search, Toast Notifications
 */

// Global State
let cart = JSON.parse(localStorage.getItem("winline_cart")) || [];
let compareList = JSON.parse(localStorage.getItem("winline_compare")) || [];

// Helper Currency Formatter (VND)
function formatVND(amount) {
  if (isNaN(amount) || amount === null) return "0₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

// Toast Notifications System
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  const typeClass = type === "success" ? "toast-success" : type === "info" ? "toast-info" : type === "warning" ? "toast-warning" : "toast-error";
  const icon = type === "success" ? "fa-check-circle" : type === "info" ? "fa-info-circle" : type === "warning" ? "fa-exclamation-triangle" : "fa-exclamation-circle";

  toast.className = `toast-item ${typeClass}`;
  toast.innerHTML = `
    <i class="fas ${icon}" style="font-size: 15px;"></i>
    <div style="flex: 1; line-height: 1.4;">${message}</div>
    <button onclick="this.parentElement.remove()" style="color: rgba(255,255,255,0.7); cursor: pointer; padding: 2px 4px;">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Ensure Core Modals / Drawers exist in DOM
function ensureDOMContainers() {
  // 1. Toast Container
  if (!document.getElementById("toast-container")) {
    const toastCont = document.createElement("div");
    toastCont.id = "toast-container";
    document.body.appendChild(toastCont);
  }

  // 2. Cart Drawer
  if (!document.getElementById("cart-drawer")) {
    const cartEl = document.createElement("div");
    cartEl.id = "cart-drawer";
    cartEl.className = "cart-drawer-custom";
    cartEl.innerHTML = `
      <div onclick="closeCartDrawer()" style="position: absolute; inset: 0;"></div>
      <div id="cart-drawer-panel" class="cart-drawer-panel-custom">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; background: var(--navy-950); color: #fff;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-shopping-cart text-orange" style="color: var(--orange);"></i> Giỏ Hàng Của Bạn
          </h3>
          <button onclick="closeCartDrawer()" style="color: #fff; font-size: 18px; cursor: pointer;">✕</button>
        </div>
        
        <div id="cart-drawer-items" style="flex: 1; overflow-y: auto; padding: 16px;"></div>

        <div id="cart-empty-state" style="display: none; padding: 40px 20px; text-align: center; color: var(--ink-soft);">
          <i class="fas fa-box-open" style="font-size: 44px; color: var(--ink-muted); margin-bottom: 12px; display: block;"></i>
          <p style="font-size: 14px; margin-bottom: 16px;">Giỏ hàng của bạn đang trống</p>
          <a href="san-pham.html" class="btn btn-primary" onclick="closeCartDrawer()" style="font-size: 12.5px; padding: 8px 16px;">
            Duyệt xem sản phẩm
          </a>
        </div>

        <div id="cart-filled-state" style="padding: 16px 20px; border-top: 1px solid var(--line); background: var(--paper);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: var(--ink-soft);">
            <span>Tạm tính:</span>
            <strong id="cart-drawer-subtotal" style="color: var(--ink); font-family: var(--font-mono);">0₫</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 16px; font-weight: 800;">
            <span>Tổng thanh toán:</span>
            <strong id="cart-drawer-total" style="color: var(--orange); font-family: var(--font-mono);">0₫</strong>
          </div>
          <form onsubmit="handleCheckout(event)" style="display: flex; flex-direction: column; gap: 8px;">
            <input type="text" name="customer_name" required placeholder="Họ và tên quý khách *" style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: var(--radius-sm); font-size: 13px; background: #fff;">
            <input type="tel" name="customer_phone" required placeholder="Số điện thoại nhận hàng / báo giá *" style="width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: var(--radius-sm); font-size: 13px; background: #fff;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-soft); margin-top: 2px;">
              <input type="checkbox" name="require_vat" checked> Xuất hóa đơn VAT (10%) cho công ty
            </label>
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; margin-top: 4px; font-weight: 800; font-size: 14px;">
              ĐẶT HÀNG / GỬI YÊU CẦU BÁO GIÁ
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(cartEl);
  }

  // 3. Quick View Modal
  if (!document.getElementById("quickview-modal")) {
    const qvEl = document.createElement("div");
    qvEl.id = "quickview-modal";
    qvEl.className = "modal-backdrop-custom";
    qvEl.innerHTML = `
      <div class="modal-dialog-custom">
        <button onclick="closeQuickView()" style="position: absolute; top: 14px; right: 16px; font-size: 20px; color: var(--ink-soft); z-index: 10; cursor: pointer;">✕</button>
        <div id="quickview-modal-content" style="padding: 24px;"></div>
      </div>
    `;
    document.body.appendChild(qvEl);
  }

  // 4. Compare Floating Drawer & Modal
  if (!document.getElementById("compare-drawer")) {
    const compEl = document.createElement("div");
    compEl.id = "compare-drawer";
    compEl.className = "compare-drawer-custom";
    compEl.innerHTML = `
      <div style="max-width: 1240px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <span style="font-size: 13px; font-weight: 700; color: #fff;">
            <i class="fas fa-balance-scale text-orange mr-1" style="color: var(--orange);"></i> So sánh (<span id="compare-count">0</span>/3 model):
          </span>
          <div id="compare-items-list" style="display: flex; gap: 8px; flex-wrap: wrap;"></div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="openCompareModal()" class="btn btn-primary" style="padding: 7px 16px; font-size: 12.5px;">
            So Sánh Ngay
          </button>
          <button onclick="clearCompare()" style="color: #9db2c7; font-size: 12px; cursor: pointer; text-decoration: underline;">
            Xóa hết
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(compEl);
  }

  if (!document.getElementById("compare-modal")) {
    const compModalEl = document.createElement("div");
    compModalEl.id = "compare-modal";
    compModalEl.className = "modal-backdrop-custom";
    compModalEl.innerHTML = `
      <div class="modal-dialog-custom" style="max-width: 900px;">
        <div id="compare-modal-content"></div>
      </div>
    `;
    document.body.appendChild(compModalEl);
  }
}

// Cart Management Logic
function updateCartUI() {
  const badgeEls = document.querySelectorAll(".cart-badge-count");
  const totalCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  badgeEls.forEach(el => {
    el.textContent = totalCount;
    el.style.display = totalCount > 0 ? "flex" : "none";
  });

  const cartItemsContainer = document.getElementById("cart-drawer-items");
  const cartSubtotalEl = document.getElementById("cart-drawer-subtotal");
  const cartTotalEl = document.getElementById("cart-drawer-total");
  const cartEmptyState = document.getElementById("cart-empty-state");
  const cartFilledState = document.getElementById("cart-filled-state");

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    if (cartEmptyState) cartEmptyState.style.display = "block";
    if (cartFilledState) cartFilledState.style.display = "none";
    cartItemsContainer.innerHTML = "";
    return;
  }

  if (cartEmptyState) cartEmptyState.style.display = "none";
  if (cartFilledState) cartFilledState.style.display = "block";

  let subtotal = 0;
  cartItemsContainer.innerHTML = cart.map((item, idx) => {
    const priceNum = typeof item.price === "number" ? item.price : parseInt(String(item.price).replace(/[^0-9]/g, "")) || 0;
    const itemTotal = priceNum * (item.qty || 1);
    subtotal += itemTotal;
    return `
      <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line-light);">
        <img src="${item.image || 'assets/images/km750s.jpg'}" alt="${item.name}" onerror="this.src='assets/images/km750s.jpg'" style="width: 54px; height: 54px; object-fit: contain; background: #fff; border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 4px; flex-shrink: 0;">
        <div style="flex: 1; min-width: 0;">
          <h4 style="font-size: 13px; font-weight: 600; color: var(--navy-950); margin: 0 0 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</h4>
          <div style="font-size: 11px; color: var(--ink-soft);">${item.powerText || item.code || 'Chính hãng'}</div>
          <div style="font-size: 13.5px; font-weight: 700; color: var(--orange); font-family: var(--font-mono); margin-top: 2px;">${formatVND(priceNum)}</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          <button onclick="removeFromCart(${idx})" style="color: var(--ink-muted); font-size: 12px; cursor: pointer;" title="Xóa">
            <i class="fas fa-trash-alt"></i>
          </button>
          <div style="display: flex; align-items: center; border: 1px solid var(--line); border-radius: var(--radius-xs); background: #fff;">
            <button onclick="changeCartQty(${idx}, -1)" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink);">-</button>
            <span style="width: 26px; text-align: center; font-size: 12px; font-weight: 700;">${item.qty || 1}</span>
            <button onclick="changeCartQty(${idx}, 1)" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--ink);">+</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (cartSubtotalEl) cartSubtotalEl.textContent = formatVND(subtotal);
  if (cartTotalEl) cartTotalEl.textContent = formatVND(subtotal);

  localStorage.setItem("winline_cart", JSON.stringify(cart));
}

function addToCart(productId, qty = 1) {
  let prod = typeof WINLINE_DATA !== "undefined" ? WINLINE_DATA.products.find(p => p.id === productId || p.code === productId) : null;
  if (!prod) {
    prod = {
      id: productId,
      name: "Quạt công nghiệp Komasu KM-750S",
      code: "KM-750S",
      price: 1850000,
      image: "assets/images/km750s.jpg",
      powerText: "250W"
    };
  }

  const existingIdx = cart.findIndex(item => item.id === prod.id);
  if (existingIdx > -1) {
    cart[existingIdx].qty = (cart[existingIdx].qty || 1) + qty;
  } else {
    cart.push({
      id: prod.id,
      code: prod.code,
      name: prod.name,
      price: typeof prod.price === "number" ? prod.price : parseInt(String(prod.price).replace(/[^0-9]/g, "")) || 0,
      image: prod.image || "assets/images/km750s.jpg",
      powerText: prod.powerText || "",
      qty: qty
    });
  }

  updateCartUI();
  showToast(`Đã thêm <strong>${prod.name}</strong> vào giỏ hàng!`, "success");
  openCartDrawer();
}

function changeCartQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty = (cart[index].qty || 1) + delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

function removeFromCart(index) {
  if (!cart[index]) return;
  const removedName = cart[index].name;
  cart.splice(index, 1);
  updateCartUI();
  showToast(`Đã xóa <strong>${removedName}</strong> khỏi giỏ hàng`, "info");
}

function clearCart() {
  cart = [];
  updateCartUI();
  showToast("Đã xóa toàn bộ giỏ hàng", "info");
}

function openCartDrawer() {
  ensureDOMContainers();
  const drawer = document.getElementById("cart-drawer");
  if (drawer) {
    drawer.classList.add("open");
    drawer.classList.remove("pointer-events-none", "opacity-0");
    const panel = document.getElementById("cart-drawer-panel");
    if (panel) panel.classList.remove("translate-x-full");
    document.body.style.overflow = "hidden";
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  if (drawer) {
    drawer.classList.remove("open");
    drawer.classList.add("pointer-events-none", "opacity-0");
    const panel = document.getElementById("cart-drawer-panel");
    if (panel) panel.classList.add("translate-x-full");
    document.body.style.overflow = "";
  }
}

// Quick View Modal
function openQuickView(productId) {
  ensureDOMContainers();
  let prod = typeof WINLINE_DATA !== "undefined" ? WINLINE_DATA.products.find(p => p.id === productId || p.code === productId) : null;
  if (!prod) {
    prod = {
      id: productId,
      name: "Quạt cây công nghiệp Komasu KM-750S",
      code: "KM-750S",
      brandName: "Komasu",
      price: 1850000,
      oldPrice: 2150000,
      powerText: "250W",
      airflowText: "15.200 m³/h",
      bladeText: "750mm",
      voltage: "220V / 50Hz",
      warranty: "24 tháng",
      image: "assets/images/km750s.jpg",
      description: "Quạt cây công nghiệp Komasu KM-750S sải cánh 750mm công suất 250W làm mát diện rộng cho nhà xưởng, kho bãi, nhà hàng tiệc cưới."
    };
  }

  const modal = document.getElementById("quickview-modal");
  const content = document.getElementById("quickview-modal-content");
  if (!modal || !content) return;

  content.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;">
      <div style="background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 20px; display: flex; align-items: center; justify-content: center; height: 320px;">
        <img src="${prod.image || 'assets/images/km750s.jpg'}" alt="${prod.name}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
      </div>
      <div>
        <div style="font-size: 11px; font-weight: 700; color: var(--navy-800); text-transform: uppercase; margin-bottom: 4px;">
          ${prod.brandName || 'CHÍNH HÃNG'} • MÃ: <span class="mono">${prod.code || 'KM-750S'}</span>
        </div>
        <h2 style="font-size: 18px; font-weight: 800; color: var(--navy-950); margin: 0 0 10px; line-height: 1.35;">${prod.name}</h2>
        
        <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px;">
          <span style="font-size: 22px; font-weight: 800; color: var(--orange); font-family: var(--font-mono);">${formatVND(prod.price)}</span>
          ${prod.oldPrice ? `<span style="font-size: 13px; color: var(--ink-muted); text-decoration: line-through; font-family: var(--font-mono);">${formatVND(prod.oldPrice)}</span>` : ''}
        </div>

        <div style="background: var(--navy-50); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 14px; font-size: 12.5px; line-height: 1.7;">
          <div>• Công suất: <strong>${prod.powerText || '250W'}</strong></div>
          <div>• Lưu lượng gió: <strong>${prod.airflowText || '15.200 m³/h'}</strong></div>
          <div>• Sải cánh: <strong>${prod.bladeText || '750mm'}</strong></div>
          <div>• Bảo hành: <strong style="color: var(--green);">${prod.warranty || '24 tháng chính hãng'}</strong></div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="addToCart('${prod.id}', 1); closeQuickView();" class="btn btn-primary" style="flex: 1; padding: 11px 16px; font-size: 13px;">
            <i class="fas fa-cart-plus"></i> Thêm vào giỏ
          </button>
          <a href="chi-tiet-san-pham.html" class="btn btn-navy" style="padding: 11px 16px; font-size: 13px;">
            Xem chi tiết
          </a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("open");
  modal.classList.remove("pointer-events-none", "opacity-0");
  document.body.style.overflow = "hidden";
}

function closeQuickView() {
  const modal = document.getElementById("quickview-modal");
  if (modal) {
    modal.classList.remove("open");
    modal.classList.add("pointer-events-none", "opacity-0");
    document.body.style.overflow = "";
  }
}

// Compare System
function toggleCompare(productId) {
  ensureDOMContainers();
  const idx = compareList.indexOf(productId);
  if (idx > -1) {
    compareList.splice(idx, 1);
    showToast("Đã bỏ sản phẩm khỏi bảng so sánh", "info");
  } else {
    if (compareList.length >= 3) {
      showToast("Chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc!", "warning");
      return;
    }
    compareList.push(productId);
    showToast("Đã thêm vào danh sách so sánh thông số", "success");
  }
  localStorage.setItem("winline_compare", JSON.stringify(compareList));
  updateCompareUI();
}

function clearCompare() {
  compareList = [];
  localStorage.setItem("winline_compare", JSON.stringify(compareList));
  updateCompareUI();
  showToast("Đã xóa danh sách so sánh", "info");
}

function updateCompareUI() {
  const drawer = document.getElementById("compare-drawer");
  const countEl = document.getElementById("compare-count");
  const itemsContainer = document.getElementById("compare-items-list");
  
  if (!drawer) return;

  if (countEl) countEl.textContent = compareList.length;

  if (compareList.length > 0) {
    drawer.classList.add("open");
    drawer.classList.remove("translate-y-full");
  } else {
    drawer.classList.remove("open");
    drawer.classList.add("translate-y-full");
    return;
  }

  if (itemsContainer) {
    itemsContainer.innerHTML = compareList.map(pid => {
      let p = typeof WINLINE_DATA !== "undefined" ? WINLINE_DATA.products.find(x => x.id === pid || x.code === pid) : null;
      const name = p ? p.name : pid;
      const img = p ? p.image : "assets/images/km750s.jpg";
      return `
        <div style="display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.12); padding: 4px 8px; border-radius: var(--radius-xs); font-size: 11.5px;">
          <img src="${img}" onerror="this.src='assets/images/km750s.jpg'" style="width: 20px; height: 20px; object-fit: contain; background: #fff; border-radius: 2px;">
          <span style="max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</span>
          <button onclick="toggleCompare('${pid}')" style="color: #fff; opacity: 0.7; cursor: pointer; padding: 0 2px;">✕</button>
        </div>
      `;
    }).join("");
  }
}

function openCompareModal() {
  if (compareList.length < 2) {
    showToast("Vui lòng chọn ít nhất 2 sản phẩm để so sánh", "warning");
    return;
  }

  ensureDOMContainers();
  const modal = document.getElementById("compare-modal");
  const content = document.getElementById("compare-modal-content");
  if (!modal || !content) return;

  const prods = compareList.map(pid => {
    return (typeof WINLINE_DATA !== "undefined" ? WINLINE_DATA.products.find(p => p.id === pid || p.code === pid) : null) || {
      id: pid,
      name: "Quạt " + pid,
      code: pid,
      brandName: "Komasu",
      price: 1850000,
      powerText: "250W",
      airflowText: "15.200 m³/h",
      bladeText: "750mm",
      voltage: "220V",
      warranty: "24 tháng",
      image: "assets/images/km750s.jpg"
    };
  });

  content.innerHTML = `
    <div style="padding: 20px 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 1px solid var(--line);">
        <h3 style="font-size: 18px; font-weight: 800; color: var(--navy-950); margin: 0;">So Sánh Thông Số Kỹ Thuật</h3>
        <button onclick="closeCompareModal()" style="font-size: 18px; color: var(--ink-soft); cursor: pointer;">✕</button>
      </div>

      <div class="table-responsive-wrapper" style="margin-top: 16px;">
        <table class="spec-table">
          <thead>
            <tr>
              <th style="width: 140px;">Tiêu chí</th>
              ${prods.map(p => `
                <th style="text-align: center; width: 220px;">
                  <img src="${p.image}" onerror="this.src='assets/images/km750s.jpg'" style="width: 80px; height: 80px; object-fit: contain; margin: 0 auto 8px; background: #fff; padding: 4px; border-radius: 4px;">
                  <div style="font-size: 12.5px; font-weight: 700; color: var(--navy-950);">${p.name}</div>
                  <div style="font-size: 14px; font-weight: 800; color: var(--orange); font-family: var(--font-mono); margin: 4px 0;">${formatVND(p.price)}</div>
                  <button onclick="addToCart('${p.id}'); closeCompareModal();" class="btn btn-primary" style="padding: 5px 12px; font-size: 11.5px;">
                    Mua ngay
                  </button>
                </th>
              `).join("")}
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Thương hiệu</strong></td>${prods.map(p => `<td style="text-align: center; font-weight: 700;">${p.brandName || 'Komasu'}</td>`).join("")}</tr>
            <tr><td><strong>Mã Model</strong></td>${prods.map(p => `<td style="text-align: center;" class="mono">${p.code}</td>`).join("")}</tr>
            <tr><td><strong>Công suất</strong></td>${prods.map(p => `<td style="text-align: center; font-weight: 700; color: var(--navy-800);">${p.powerText || '250W'}</td>`).join("")}</tr>
            <tr><td><strong>Lưu lượng gió</strong></td>${prods.map(p => `<td style="text-align: center; font-weight: 700; color: var(--green);">${p.airflowText || '15.200 m³/h'}</td>`).join("")}</tr>
            <tr><td><strong>Đường kính cánh</strong></td>${prods.map(p => `<td style="text-align: center;">${p.bladeText || '750mm'}</td>`).join("")}</tr>
            <tr><td><strong>Điện áp</strong></td>${prods.map(p => `<td style="text-align: center;">${p.voltage || '220V'}</td>`).join("")}</tr>
            <tr><td><strong>Bảo hành</strong></td>${prods.map(p => `<td style="text-align: center; font-weight: 600;">${p.warranty || '24 tháng'}</td>`).join("")}</tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  modal.classList.add("open");
  modal.classList.remove("pointer-events-none", "opacity-0");
  document.body.style.overflow = "hidden";
}

function closeCompareModal() {
  const modal = document.getElementById("compare-modal");
  if (modal) {
    modal.classList.remove("open");
    modal.classList.add("pointer-events-none", "opacity-0");
    document.body.style.overflow = "";
  }
}

// Live Search Autocomplete in Header
function initLiveSearch() {
  const searchInputs = document.querySelectorAll(".search-box, .header-search-input");
  searchInputs.forEach(input => {
    const parent = input.closest(".search-wrap, .search-container");
    if (!parent) return;

    let dropdown = parent.querySelector(".search-suggest, .search-dropdown-results");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-suggest";
      parent.appendChild(dropdown);
    }

    input.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (q.length < 2) {
        dropdown.style.display = "none";
        dropdown.innerHTML = "";
        return;
      }

      let matches = [];
      if (typeof WINLINE_DATA !== "undefined" && WINLINE_DATA.products) {
        matches = WINLINE_DATA.products.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.code.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q)
        );
      }

      if (matches.length === 0) {
        dropdown.innerHTML = `
          <div style="padding: 12px; text-align: center; font-size: 12.5px; color: var(--ink-soft);">
            Không tìm thấy sản phẩm khớp với "<strong>${q}</strong>"
          </div>
        `;
      } else {
        dropdown.innerHTML = `
          <div class="hint">Gợi ý sản phẩm (${matches.length})</div>
          ${matches.slice(0, 5).map(p => `
            <a href="san-pham.html" class="row" style="text-decoration: none;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${p.image}" onerror="this.src='assets/images/km750s.jpg'" style="width: 36px; height: 36px; object-fit: contain; background: #fff; border: 1px solid var(--line); border-radius: 4px; padding: 2px;">
                <div>
                  <div style="font-size: 13px; font-weight: 600; color: var(--navy-950);">${p.name}</div>
                  <div style="font-size: 11px; color: var(--ink-soft);">${p.powerText || ''} | ${p.airflowText || ''}</div>
                </div>
              </div>
              <strong style="color: var(--orange); font-size: 13px; font-family: var(--font-mono);">${formatVND(p.price)}</strong>
            </a>
          `).join("")}
          <a href="san-pham.html" style="display: block; padding: 8px 10px; text-align: center; font-size: 12px; font-weight: 700; color: var(--navy-800); background: var(--navy-50); border-radius: 4px; margin-top: 4px;">
            Xem tất cả kết quả →
          </a>
        `;
      }
      dropdown.style.display = "block";
    });

    document.addEventListener("click", (e) => {
      if (!parent.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
  });
}

function handleCheckout(e) {
  e.preventDefault();
  if (cart.length === 0) {
    showToast("Giỏ hàng đang trống!", "warning");
    return;
  }
  const form = e.target;
  const name = form.customer_name?.value || "Quý khách";
  const phone = form.customer_phone?.value || "";
  
  showToast(`Đặt hàng thành công! Kỹ sư Winline sẽ liên hệ <strong>${name}</strong> (${phone}) để xác nhận giao hàng.`, "success");
  cart = [];
  updateCartUI();
  closeCartDrawer();
  form.reset();
}

// Mobile Nav and App Initialization
document.addEventListener("DOMContentLoaded", () => {
  ensureDOMContainers();
  updateCartUI();
  updateCompareUI();
  initLiveSearch();

  // Mobile Nav Toggle
  const toggleBtn = document.getElementById("mobile-nav-toggle") || document.querySelector(".nav-toggle-btn");
  const catNav = document.querySelector(".catnav");
  if (toggleBtn && catNav) {
    toggleBtn.addEventListener("click", () => {
      catNav.classList.toggle("show-mobile");
    });
  }

  // Back to Top Button
  const backToTopBtn = document.getElementById("btn-back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      backToTopBtn.style.display = window.scrollY > 400 ? "flex" : "none";
    });
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
