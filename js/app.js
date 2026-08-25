/**
 * WINLINE VIETNAM - Core Application Logic
 * Brand Alignment: Winline Blue (#0060B6)
 * Features:
 * - Circular Back-to-Top combined with Dynamic Scroll Progress Bar
 * - Auto-injected Cart Drawer & VAT Invoice Calculation
 * - High-Res Quick View Modal
 * - Smart Live Search Suggestions
 * - Toast Notifications
 */

// Initialize Cart & Compare from localStorage
let cart = JSON.parse(localStorage.getItem("winline_cart")) || [];
let compareList = JSON.parse(localStorage.getItem("winline_compare")) || [];

// Currency formatter
function formatVND(amount) {
  if (isNaN(amount) || amount === null) return "0₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

// Toast Notification
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = "position:fixed; bottom:24px; right:24px; z-index:99999; display:flex; flex-direction:column; gap:8px; pointer-events:none;";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  const bg = type === "success" ? "#1e8a5f" : type === "info" ? "#0060B6" : "#d41e3d";
  const icon = type === "success" ? "fa-check-circle" : type === "info" ? "fa-info-circle" : "fa-exclamation-circle";

  toast.style.cssText = `background:${bg}; color:#ffffff; padding:12px 18px; border-radius:8px; box-shadow:0 10px 25px rgba(7,34,66,0.25); font-size:13.5px; font-weight:500; display:flex; align-items:center; gap:10px; transition:all 0.3s cubic-bezier(0.22, 1, 0.36, 1); transform:translateY(10px); opacity:0; pointer-events:auto; max-width:420px; font-family:'Be Vietnam Pro',sans-serif;`;
  toast.innerHTML = `
    <i class="fas ${icon}" style="font-size:16px;"></i>
    <div style="flex:1;">${message}</div>
    <button onclick="this.parentElement.remove()" style="background:none; border:none; color:#ffffff; opacity:0.8; cursor:pointer; font-size:13px; padding:2px 4px;">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    toast.style.transform = "translateY(10px)";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Auto-inject UI Containers (Top Progress, Back-to-Top, Cart Drawer, Modals)
function ensureAppContainers() {
  // 1. Top Scroll Progress Bar
  if (!document.getElementById("top-scroll-progress")) {
    const topBar = document.createElement("div");
    topBar.id = "top-scroll-progress";
    topBar.className = "top-scroll-progress";
    document.body.appendChild(topBar);
  }

  // 2. Standard Back-to-Top Button
  if (!document.getElementById("back-to-top-btn")) {
    const bttBtn = document.createElement("button");
    bttBtn.id = "back-to-top-btn";
    bttBtn.className = "back-to-top-btn";
    bttBtn.setAttribute("aria-label", "Cuộn lên đầu trang");
    bttBtn.setAttribute("type", "button");
    bttBtn.title = "Lên đầu trang";
    bttBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="12" y1="19" x2="12" y2="5"></line>
        <polyline points="5 12 12 5 19 12"></polyline>
      </svg>
    `;
    bttBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(bttBtn);
  }

  // 3. Cart Drawer
  if (!document.getElementById("cart-drawer")) {
    const drawerDiv = document.createElement("div");
    drawerDiv.id = "cart-drawer";
    drawerDiv.style.display = "none";
    drawerDiv.innerHTML = `
      <div onclick="closeCartDrawer()" class="drawer-backdrop"></div>
      <div id="cart-drawer-panel" class="drawer-panel translate-x-full">
        <div class="cart-header">
          <h3><i class="fas fa-shopping-bag" style="color:var(--orange);"></i> Giỏ Hàng (<span class="cart-badge-count">0</span>)</h3>
          <button onclick="closeCartDrawer()" class="cart-close-btn" aria-label="Đóng giỏ hàng"><i class="fas fa-times"></i></button>
        </div>

        <div class="cart-body">
          <div id="cart-empty-state" class="text-center py-10" style="color:var(--ink-soft); display:none; padding:40px 10px; text-align:center;">
            <div style="width:64px; height:64px; border-radius:50%; background:var(--brand-blue-light); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:24px; color:var(--brand-blue); border:1px solid var(--line);">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <h4 style="font-size:16px; color:var(--navy-950); margin:0 0 6px; font-weight:700;">Giỏ hàng của bạn đang trống</h4>
            <p style="font-size:13px; color:var(--ink-soft); margin:0 0 20px;">Hãy tham khảo các dòng quạt công nghiệp chất lượng cao của Winline.</p>
            <a href="san-pham.html" onclick="closeCartDrawer()" style="display:inline-block; background:var(--brand-blue); color:#ffffff; padding:10px 22px; border-radius:6px; font-size:13px; font-weight:700; box-shadow:0 3px 8px rgba(0,96,182,0.3);">Xem danh mục quạt &rarr;</a>
          </div>

          <div id="cart-filled-state">
            <div id="cart-drawer-items"></div>
          </div>
        </div>

        <div id="cart-footer-controls" class="cart-footer">
          <div class="cart-summary-row">
            <span style="color:var(--ink-soft); font-weight:600;">Tạm tính:</span>
            <span id="cart-drawer-total" class="cart-summary-total">0₫</span>
          </div>

          <div style="background:var(--paper); padding:10px 12px; border-radius:6px; margin-bottom:12px; border:1px solid var(--line); font-size:12px;">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600; color:var(--navy-950);">
              <input type="checkbox" id="vat-request-checkbox" onchange="toggleVAT(this.checked)" style="width:15px; height:15px; accent-color:var(--orange);">
              <span>Yêu cầu xuất Hóa Đơn GTGT (VAT 10%)</span>
            </label>
            <div id="vat-company-info" style="display:none; margin-top:8px;">
              <input type="text" id="vat-tax-id" placeholder="Mã số thuế doanh nghiệp..." style="width:100%; padding:6px 10px; font-size:11.5px; border:1px solid var(--line); border-radius:4px; margin-bottom:4px; font-family:'IBM Plex Mono',monospace;">
              <input type="text" id="vat-company-name" placeholder="Tên công ty / đơn vị..." style="width:100%; padding:6px 10px; font-size:11.5px; border:1px solid var(--line); border-radius:4px;">
            </div>
          </div>

          <form onsubmit="handleCheckout(event)" style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <input type="text" name="customer_name" placeholder="Họ tên người nhận *" required style="padding:9px 10px; border:1px solid var(--line); border-radius:6px; font-size:12.5px; font-family:inherit;">
              <input type="tel" name="customer_phone" placeholder="Số điện thoại *" required style="padding:9px 10px; border:1px solid var(--line); border-radius:6px; font-size:12.5px; font-family:inherit;">
            </div>
            <input type="text" name="customer_address" placeholder="Địa chỉ nhận hàng (Ví dụ: KCN Tiên Sơn, Bắc Ninh)..." style="padding:9px 10px; border:1px solid var(--line); border-radius:6px; font-size:12.5px; font-family:inherit;">

            <button type="submit" style="width:100%; background:var(--orange); color:#ffffff; border:none; padding:12px; border-radius:6px; font-weight:700; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 12px rgba(212,30,61,0.25); transition:background 0.2s;">
              <i class="fas fa-check-circle"></i> Đặt Hàng &amp; Nhận Báo Giá Ngay
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(drawerDiv);
  }

  // 4. Quick View Modal
  if (!document.getElementById("quickview-modal")) {
    const qvModal = document.createElement("div");
    qvModal.id = "quickview-modal";
    qvModal.style.display = "none";
    qvModal.innerHTML = `
      <div onclick="closeQuickView()" class="drawer-backdrop"></div>
      <div style="background:#ffffff; border-radius:12px; box-shadow:0 15px 35px rgba(0,0,0,0.25); width:100%; max-width:800px; max-height:90vh; overflow-y:auto; position:relative; z-index:2;">
        <button onclick="closeQuickView()" style="position:absolute; top:16px; right:16px; background:#ffffff; border:1px solid var(--line); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; color:var(--ink-soft);">
          <i class="fas fa-times"></i>
        </button>
        <div id="quickview-modal-content"></div>
      </div>
    `;
    document.body.appendChild(qvModal);
  }

  // 5. Off-Canvas Mobile Drawer System
  if (!document.getElementById("mobile-drawer-overlay")) {
    const drawerOverlay = document.createElement("div");
    drawerOverlay.id = "mobile-drawer-overlay";
    drawerOverlay.className = "mobile-drawer-backdrop";
    drawerOverlay.innerHTML = `
      <div class="mobile-drawer-panel">
        <div class="mobile-drawer-head">
          <a href="index.html" class="site-logo-wrap" onclick="closeMobileDrawer()">
            <img src="assets/images/logo.png" alt="Winline Việt Nam" class="site-logo-img">
          </a>
          <button onclick="closeMobileDrawer()" class="mobile-drawer-close" aria-label="Đóng menu">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="mobile-drawer-hotline-box">
          <div>
            <div class="label">Hotline tư vấn 24/7</div>
            <a href="tel:0949761893" class="phone">0949.761.893</a>
          </div>
          <a href="tel:0949761893" class="call-btn">
            <i class="fas fa-phone-alt"></i> Gọi
          </a>
        </div>

        <div class="mobile-drawer-nav">
          <div class="mobile-nav-group-title">Danh mục chính</div>
          <a href="san-pham.html" class="mobile-drawer-link" onclick="closeMobileDrawer()">
            <span><i class="fas fa-bars-staggered icon-lead"></i> Danh mục sản phẩm</span>
            <i class="fas fa-chevron-right" style="font-size:11px; opacity:0.4;"></i>
          </a>
          <a href="gioi-thieu.html" class="mobile-drawer-link" onclick="closeMobileDrawer()">
            <span><i class="fas fa-info-circle icon-lead"></i> Giới thiệu</span>
            <i class="fas fa-chevron-right" style="font-size:11px; opacity:0.4;"></i>
          </a>
          <a href="giai-phap.html" class="mobile-drawer-link" onclick="closeMobileDrawer()">
            <span><i class="fas fa-industry icon-lead"></i> Giải pháp</span>
            <i class="fas fa-chevron-right" style="font-size:11px; opacity:0.4;"></i>
          </a>
          <a href="du-an.html" class="mobile-drawer-link" onclick="closeMobileDrawer()">
            <span><i class="fas fa-building icon-lead"></i> Dự án</span>
            <i class="fas fa-chevron-right" style="font-size:11px; opacity:0.4;"></i>
          </a>
          <a href="cong-cu-tinh-quat.html" class="mobile-drawer-link" onclick="closeMobileDrawer()">
            <span><i class="fas fa-calculator icon-lead" style="color:#f59e0b;"></i> Công cụ tính quạt</span>
            <span style="background:#fef3c7; color:#b45309; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px;">HOT</span>
          </a>
          <a href="gioi-thieu.html" class="mobile-drawer-link" onclick="closeMobileDrawer()">
            <span><i class="fas fa-newspaper icon-lead"></i> Tin tức &amp; Hỗ trợ</span>
            <i class="fas fa-chevron-right" style="font-size:11px; opacity:0.4;"></i>
          </a>

          <div style="margin-top:20px; padding:14px; background:var(--paper); border-radius:8px; border:1px solid var(--line);">
            <div style="font-size:12px; font-weight:700; color:var(--navy-950); margin-bottom:6px;">Winline Việt Nam</div>
            <div style="font-size:11px; color:var(--ink-soft); line-height:1.5;">Số 7 BT6, Pháp Vân – Tứ Hiệp, Hà Nội.<br>Đầy đủ hoá đơn VAT &amp; chứng chỉ xuất xưởng.</div>
          </div>
        </div>
      </div>
    `;
    drawerOverlay.addEventListener("click", (e) => {
      if (e.target === drawerOverlay) closeMobileDrawer();
    });
    document.body.appendChild(drawerOverlay);
  }
}

// Mobile Drawer Controls
function openMobileDrawer() {
  ensureAppContainers();
  const drawer = document.getElementById("mobile-drawer-overlay");
  if (drawer) {
    drawer.style.display = "block";
    drawer.offsetHeight; // reflow
    drawer.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeMobileDrawer() {
  const drawer = document.getElementById("mobile-drawer-overlay");
  if (drawer) {
    drawer.classList.remove("active");
    setTimeout(() => {
      drawer.style.display = "none";
      document.body.style.overflow = "";
    }, 250);
  }
}

function toggleMobileDrawer() {
  const drawer = document.getElementById("mobile-drawer-overlay");
  if (drawer && drawer.classList.contains("active")) {
    closeMobileDrawer();
  } else {
    openMobileDrawer();
  }
}

// 60fps Smooth Scroll Progress Tracker & Back-to-Top Controller
function initScrollProgress() {
  let isTicking = false;

  function updateProgress() {
    const topBar = document.getElementById("top-scroll-progress");
    const bttBtn = document.getElementById("back-to-top-btn");

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const docHeight = scrollHeight - windowHeight;
    const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;

    // Update Top Reading Bar
    if (topBar) {
      topBar.style.width = progress + "%";
    }

    // Toggle Back-To-Top button visibility
    if (bttBtn) {
      if (scrollTop > 220) {
        bttBtn.classList.add("visible");
      } else {
        bttBtn.classList.remove("visible");
      }
    }

    isTicking = false;
  }

  function onScroll() {
    if (!isTicking) {
      window.requestAnimationFrame(updateProgress);
      isTicking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateProgress();
}

// Toggle VAT Display
function toggleVAT(checked) {
  const compInfo = document.getElementById("vat-company-info");
  if (compInfo) {
    compInfo.style.display = checked ? "block" : "none";
  }
  updateCartUI();
}

// Update Cart Badge & Content
function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Update all badges
  document.querySelectorAll(".cart-badge-count").forEach(el => {
    el.textContent = totalCount;
    el.style.display = totalCount > 0 ? "flex" : "none";
  });

  const cartItemsContainer = document.getElementById("cart-drawer-items");
  const cartTotalEl = document.getElementById("cart-drawer-total");
  const emptyState = document.getElementById("cart-empty-state");
  const filledState = document.getElementById("cart-filled-state");
  const footerControls = document.getElementById("cart-footer-controls");

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    if (filledState) filledState.style.display = "none";
    if (footerControls) footerControls.style.display = "none";
    cartItemsContainer.innerHTML = "";
    localStorage.setItem("winline_cart", JSON.stringify(cart));
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  if (filledState) filledState.style.display = "block";
  if (footerControls) footerControls.style.display = "block";

  let subtotal = 0;
  cartItemsContainer.innerHTML = cart.map((item, idx) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    return `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/km750s.jpg'" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-sku">Model: <strong class="mono" style="color:var(--navy-950);">${item.code || 'Winline'}</strong> ${item.powerText ? '| ' + item.powerText : ''}</div>
          <div class="cart-item-price">${formatVND(item.price)}</div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
          <button onclick="removeFromCart(${idx})" style="background:none; border:none; color:var(--ink-soft); cursor:pointer; font-size:12px;" title="Xóa">
            <i class="fas fa-trash-alt"></i>
          </button>
          <div class="qty-control">
            <button onclick="changeCartQty(${idx}, -1)" class="qty-btn">-</button>
            <span class="qty-val">${item.qty}</span>
            <button onclick="changeCartQty(${idx}, 1)" class="qty-btn">+</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  const vatCheckbox = document.getElementById("vat-request-checkbox");
  const finalTotal = vatCheckbox && vatCheckbox.checked ? subtotal * 1.1 : subtotal;

  if (cartTotalEl) {
    cartTotalEl.textContent = formatVND(finalTotal);
    if (vatCheckbox && vatCheckbox.checked) {
      cartTotalEl.innerHTML = `${formatVND(finalTotal)} <small style="font-size:11px; font-weight:normal; color:var(--ink-soft);">(đã gồm 10% VAT)</small>`;
    }
  }

  localStorage.setItem("winline_cart", JSON.stringify(cart));
}

// Add Product to Cart
function addToCart(productId, qty = 1) {
  let prod = null;
  if (typeof WINLINE_DATA !== "undefined" && WINLINE_DATA.products) {
    prod = WINLINE_DATA.products.find(p => p.id === productId || p.code === productId);
  }

  if (!prod) {
    prod = {
      id: productId,
      code: productId,
      name: "Quạt công nghiệp Winline " + productId,
      price: 2500000,
      image: "assets/images/km750s.jpg",
      powerText: "Chính hãng"
    };
  }

  const existingIdx = cart.findIndex(item => item.id === prod.id || item.code === prod.code);
  if (existingIdx > -1) {
    cart[existingIdx].qty += qty;
  } else {
    cart.push({
      id: prod.id,
      code: prod.code,
      name: prod.name,
      price: prod.price || 2000000,
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
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
}

function removeFromCart(index) {
  if (!cart[index]) return;
  const name = cart[index].name;
  cart.splice(index, 1);
  updateCartUI();
  showToast(`Đã xóa <strong>${name}</strong> khỏi giỏ hàng`, "info");
}

function openCartDrawer() {
  ensureAppContainers();
  updateCartUI();
  const drawer = document.getElementById("cart-drawer");
  const panel = document.getElementById("cart-drawer-panel");
  if (drawer && panel) {
    drawer.style.display = "block";
    drawer.offsetHeight; // trigger reflow
    drawer.classList.add("active");
    panel.classList.remove("translate-x-full");
    document.body.style.overflow = "hidden";
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const panel = document.getElementById("cart-drawer-panel");
  if (drawer && panel) {
    drawer.classList.remove("active");
    panel.classList.add("translate-x-full");
    setTimeout(() => {
      drawer.style.display = "none";
      document.body.style.overflow = "";
    }, 250);
  }
}

// Quick View Modal Display
function openQuickView(productId) {
  ensureAppContainers();
  let prod = null;
  if (typeof WINLINE_DATA !== "undefined" && WINLINE_DATA.products) {
    prod = WINLINE_DATA.products.find(p => p.id === productId || p.code === productId);
  }

  if (!prod) {
    prod = {
      id: productId,
      code: productId,
      name: "Quạt công nghiệp cao cấp Winline",
      brandName: "Komasu",
      price: 2550000,
      powerText: "250W",
      airflowText: "15.200 m³/h",
      bladeText: "750mm",
      voltage: "220V / 50Hz",
      warranty: "12 tháng",
      image: "assets/images/km750s.jpg",
      description: "Dòng quạt công nghiệp động cơ 100% dây đồng nguyên chất, vận hành bền bỉ 24/7 trong môi trường nhà xưởng, nhà hàng và kho lưu trữ."
    };
  }

  const modal = document.getElementById("quickview-modal");
  const content = document.getElementById("quickview-modal-content");
  if (!modal || !content) return;

  content.innerHTML = `
    <div style="padding:28px; display:grid; grid-template-columns:1fr 1.2fr; gap:26px; align-items:start;">
      <div style="background:var(--paper); border:1px solid var(--line); border-radius:8px; padding:20px; display:flex; align-items:center; justify-content:center; aspect-ratio:1/1;">
        <img src="${prod.image}" alt="${prod.name}" style="max-height:100%; max-width:100%; object-fit:contain;" onerror="this.src='assets/images/km750s.jpg'">
      </div>

      <div>
        <div style="font-size:11.5px; font-weight:700; color:var(--brand-blue); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">${prod.brandName || 'CHÍNH HÃNG'}</div>
        <h2 style="font-size:18px; font-weight:700; color:var(--navy-950); margin:0 0 8px; line-height:1.35;">${prod.name}</h2>
        <div style="font-size:12px; color:var(--ink-soft); margin-bottom:12px;">Mã sản phẩm: <strong class="mono" style="color:var(--navy-950);">${prod.code || 'KM-750S'}</strong></div>

        <div style="font-size:22px; font-weight:800; color:var(--orange); font-family:'IBM Plex Mono',monospace; margin-bottom:14px;">
          ${formatVND(prod.price)}
        </div>

        <div style="background:var(--paper); border:1px solid var(--line); border-radius:6px; padding:12px; font-size:12.5px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="color:var(--ink-soft);">Công suất:</span><strong class="mono">${prod.powerText || '250W'}</strong></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="color:var(--ink-soft);">Lưu lượng gió:</span><strong class="mono" style="color:var(--green);">${prod.airflowText || '15.200 m³/h'}</strong></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;"><span style="color:var(--ink-soft);">Sải cánh:</span><strong class="mono">${prod.bladeText || '750 mm'}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--ink-soft);">Bảo hành:</span><strong style="color:var(--orange);">${prod.warranty || '12 tháng chính hãng'}</strong></div>
        </div>

        <p style="font-size:13px; color:var(--ink-soft); line-height:1.6; margin:0 0 18px;">${prod.description || ''}</p>

        <div style="display:flex; gap:10px;">
          <button onclick="addToCart('${prod.id}'); closeQuickView();" style="flex:1; background:var(--orange); color:#ffffff; border:none; padding:11px 16px; border-radius:6px; font-weight:700; font-size:13.5px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
            <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
          </button>
          <a href="chi-tiet-san-pham.html" style="background:var(--brand-blue); color:#ffffff; padding:11px 16px; border-radius:6px; font-weight:600; font-size:13.5px; display:inline-flex; align-items:center; justify-content:center;">
            Xem chi tiết &rarr;
          </a>
        </div>
      </div>
    </div>
  `;

  modal.style.display = "flex";
  modal.offsetHeight; // trigger reflow
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeQuickView() {
  const modal = document.getElementById("quickview-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }, 250);
  }
}

// Checkout Submission
function handleCheckout(e) {
  e.preventDefault();
  if (cart.length === 0) {
    showToast("Giỏ hàng đang trống!", "warning");
    return;
  }
  const form = e.target;
  const name = form.customer_name?.value || "Quý khách";
  const phone = form.customer_phone?.value || "";

  showToast(`Đặt hàng thành công! Đơn hàng của <strong>${name}</strong> (${phone}) đã được chuyển đến bộ phận dự án Winline.`, "success");
  cart = [];
  updateCartUI();
  closeCartDrawer();
  form.reset();
}

function handleConsultSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name?.value || "Quý khách";
  const phone = form.phone?.value || "";

  showToast(`Cảm ơn <strong>${name}</strong> (${phone})! Kỹ sư Winline sẽ liên hệ tư vấn trong 15 phút.`, "success");
  form.reset();
}

// Live Search Suggestions
function initLiveSearch() {
  const searchInputs = document.querySelectorAll(".header-search-input, .search-box");
  searchInputs.forEach(input => {
    const parent = input.parentElement;
    if (!parent) return;

    let dropdown = parent.querySelector(".search-suggest-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-suggest-dropdown";
      dropdown.style.cssText = "position:absolute; top:calc(100% + 4px); left:0; right:0; background:#ffffff; border:1px solid var(--line); border-radius:6px; box-shadow:0 10px 25px rgba(7,34,66,0.14); z-index:9999; display:none; max-height:360px; overflow-y:auto;";
      parent.style.position = "relative";
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
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.brandName && p.brandName.toLowerCase().includes(q))
        );
      }

      if (matches.length === 0) {
        dropdown.innerHTML = `<div style="padding:14px; text-align:center; font-size:12.5px; color:var(--ink-soft);">Không tìm thấy sản phẩm cho "<strong>${q}</strong>"</div>`;
      } else {
        dropdown.innerHTML = `
          <div style="padding:8px 12px; font-size:11px; font-weight:700; color:var(--brand-blue); background:var(--brand-blue-subtle); border-bottom:1px solid var(--line); text-transform:uppercase;">
            Gợi ý ${matches.length} sản phẩm phù hợp:
          </div>
          ${matches.slice(0, 5).map(p => `
            <a href="chi-tiet-san-pham.html" style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-bottom:1px solid var(--line); text-decoration:none; transition:background 0.15s;" onmouseover="this.style.background='var(--brand-blue-light)'" onmouseout="this.style.background='#fff'">
              <img src="${p.image}" onerror="this.src='assets/images/km750s.jpg'" style="width:42px; height:42px; object-fit:contain; border:1px solid var(--line); border-radius:4px; padding:2px; flex-shrink:0; background:#fff;">
              <div style="flex:1; min-width:0;">
                <div style="font-size:13px; font-weight:600; color:var(--navy-950); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
                <div style="font-size:11px; color:var(--ink-soft);">${p.powerText ? p.powerText + ' | ' : ''}Lưu lượng: ${p.airflowText || 'Tiêu chuẩn'}</div>
                <div style="font-size:12.5px; font-weight:700; color:var(--orange); font-family:'IBM Plex Mono',monospace;">${formatVND(p.price)}</div>
              </div>
            </a>
          `).join("")}
          <a href="san-pham.html" style="display:block; padding:9px; text-align:center; font-size:12px; font-weight:700; color:var(--brand-blue); background:var(--brand-blue-subtle);">
            Xem toàn bộ sản phẩm &rarr;
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

// Mobile Nav Toggle
function initMobileToggle() {
  const toggleBtn = document.getElementById("mobile-nav-toggle");
  const catNav = document.querySelector(".catnav");
  if (toggleBtn && catNav) {
    toggleBtn.addEventListener("click", () => {
      catNav.classList.toggle("show-mobile");
    });
  }
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  ensureAppContainers();
  initScrollProgress();
  updateCartUI();
  initLiveSearch();
  initMobileToggle();
});
