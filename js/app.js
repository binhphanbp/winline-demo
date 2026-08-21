/**
 * Winline Vietnam - Core Application Logic
 * Cart, Search, Modals, Comparison, Notification Toasts
 */

// Initialize Cart from localStorage
let cart = JSON.parse(localStorage.getItem("winline_cart")) || [];
let compareList = JSON.parse(localStorage.getItem("winline_compare")) || [];

// Helper currency formatter
function formatVND(amount) {
  if (isNaN(amount)) return "0₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

// Toast Notification
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  const bgClass = type === "success" ? "bg-emerald-600" : type === "info" ? "bg-blue-600" : "bg-red-600";
  const icon = type === "success" ? "fa-check-circle" : type === "info" ? "fa-info-circle" : "fa-exclamation-circle";

  toast.className = `${bgClass} text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium flex items-center gap-3 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto max-w-md`;
  toast.innerHTML = `
    <i class="fas ${icon} text-base"></i>
    <div class="flex-1">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-white/80 hover:text-white ml-2 text-xs">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  }, 10);

  setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Update Cart Badge & Drawer Content
function updateCartUI() {
  const badgeEls = document.querySelectorAll(".cart-badge-count");
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  badgeEls.forEach(el => {
    el.textContent = totalCount;
    el.classList.toggle("hidden", totalCount === 0);
  });

  const cartItemsContainer = document.getElementById("cart-drawer-items");
  const cartSubtotalEl = document.getElementById("cart-drawer-subtotal");
  const cartTotalEl = document.getElementById("cart-drawer-total");
  const cartEmptyState = document.getElementById("cart-empty-state");
  const cartFilledState = document.getElementById("cart-filled-state");

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    if (cartEmptyState) cartEmptyState.classList.remove("hidden");
    if (cartFilledState) cartFilledState.classList.add("hidden");
    cartItemsContainer.innerHTML = "";
    return;
  }

  if (cartEmptyState) cartEmptyState.classList.add("hidden");
  if (cartFilledState) cartFilledState.classList.remove("hidden");

  let subtotal = 0;
  cartItemsContainer.innerHTML = cart.map((item, idx) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    return `
      <div class="flex items-center gap-3 py-3 border-b border-slate-100">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/km750s.jpg'" class="w-16 h-16 object-contain rounded border border-slate-100 p-1 flex-shrink-0">
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-slate-800 truncate">${item.name}</h4>
          <div class="text-xs text-slate-500 mt-0.5">Model: ${item.code || 'Chính hãng'} | ${item.powerText || ''}</div>
          <div class="text-sm font-bold text-red-600 mt-1">${formatVND(item.price)}</div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <button onclick="removeFromCart(${idx})" class="text-slate-400 hover:text-red-600 text-xs transition">
            <i class="fas fa-trash-alt"></i>
          </button>
          <div class="flex items-center border border-slate-200 rounded">
            <button onclick="changeCartQty(${idx}, -1)" class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-xs">-</button>
            <span class="w-7 text-center text-xs font-semibold">${item.qty}</span>
            <button onclick="changeCartQty(${idx}, 1)" class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-xs">+</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (cartSubtotalEl) cartSubtotalEl.textContent = formatVND(subtotal);
  if (cartTotalEl) cartTotalEl.textContent = formatVND(subtotal);

  localStorage.setItem("winline_cart", JSON.stringify(cart));
}

// Add To Cart Function
function addToCart(productId, qty = 1) {
  const prod = WINLINE_DATA.products.find(p => p.id === productId);
  if (!prod) return;

  const existingIdx = cart.findIndex(item => item.id === productId);
  if (existingIdx > -1) {
    cart[existingIdx].qty += qty;
  } else {
    cart.push({
      id: prod.id,
      code: prod.code,
      name: prod.name,
      price: prod.price,
      image: prod.image,
      powerText: prod.powerText,
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

// Open/Close Cart Drawer
function openCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const panel = document.getElementById("cart-drawer-panel");
  if (drawer && panel) {
    drawer.classList.remove("pointer-events-none", "opacity-0");
    panel.classList.remove("translate-x-full");
    document.body.style.overflow = "hidden";
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const panel = document.getElementById("cart-drawer-panel");
  if (drawer && panel) {
    drawer.classList.add("pointer-events-none", "opacity-0");
    panel.classList.add("translate-x-full");
    document.body.style.overflow = "";
  }
}

// Quick View Modal (ENLARGED HIGH-RES DISPLAY)
function openQuickView(productId) {
  const prod = WINLINE_DATA.products.find(p => p.id === productId);
  if (!prod) return;

  const modal = document.getElementById("quickview-modal");
  const content = document.getElementById("quickview-modal-content");
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      <!-- Left: Large High-Res Image Area -->
      <div class="md:col-span-6 flex flex-col items-center">
        <div class="w-full h-80 md:h-96 bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-center shadow-xs">
          <img id="qv-main-img" src="${prod.image}" alt="${prod.name}" class="max-h-full max-w-full object-contain transition duration-300" onerror="this.src='assets/images/km750s.jpg'">
        </div>
        <div class="flex gap-3 mt-4 overflow-x-auto w-full py-1 justify-center">
          ${prod.gallery.map(img => `
            <img src="${img}" onclick="document.getElementById('qv-main-img').src='${img}'" class="w-16 h-16 object-contain border-2 border-slate-200 hover:border-red-600 rounded-xl p-1.5 cursor-pointer transition bg-white shadow-2xs">
          `).join("")}
        </div>
      </div>

      <!-- Right: Detailed Specs & Actions -->
      <div class="md:col-span-6 space-y-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">${prod.brandName}</span>
            <span class="text-xs text-slate-400">Mã SP: <strong class="text-slate-800 font-bold">${prod.code}</strong></span>
          </div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-900 font-heading leading-snug">${prod.name}</h2>
        </div>
        
        <div class="flex items-center gap-2">
          <div class="flex text-amber-400 text-sm">
            ${Array(5).fill(0).map((_, i) => `<i class="fas fa-star ${i < Math.floor(prod.rating) ? '' : 'text-slate-200'}"></i>`).join("")}
          </div>
          <span class="text-xs text-slate-500 font-medium">(${prod.reviewsCount} đánh giá)</span>
          <span class="text-xs text-emerald-600 font-bold ml-2 bg-emerald-50 px-2 py-0.5 rounded"><i class="fas fa-check-circle mr-1"></i> Còn hàng (Giao 2h)</span>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-baseline gap-3">
          <span class="text-2xl md:text-3xl font-black text-red-600 font-heading">${formatVND(prod.price)}</span>
          ${prod.oldPrice ? `<span class="text-sm text-slate-400 line-through">${formatVND(prod.oldPrice)}</span>` : ''}
          ${prod.discount ? `<span class="badge-discount">-${prod.discount}%</span>` : ''}
        </div>

        <div class="space-y-2 text-xs text-slate-600 border-y border-slate-100 py-3.5">
          <div class="flex justify-between"><span class="text-slate-400">Công suất tiêu thụ:</span><strong class="text-slate-800 font-bold">${prod.powerText}</strong></div>
          <div class="flex justify-between"><span class="text-slate-400">Lưu lượng gió thực tế:</span><strong class="text-emerald-700 font-bold">${prod.airflowText}</strong></div>
          <div class="flex justify-between"><span class="text-slate-400">Đường kính sải cánh:</span><strong class="text-slate-800 font-bold">${prod.bladeText}</strong></div>
          <div class="flex justify-between"><span class="text-slate-400">Nguồn điện sử dụng:</span><strong class="text-slate-800 font-bold">${prod.voltage}</strong></div>
          <div class="flex justify-between"><span class="text-slate-400">Thời gian bảo hành:</span><strong class="text-amber-600 font-bold">${prod.warranty} chính hãng</strong></div>
        </div>

        <p class="text-xs text-slate-500 leading-relaxed line-clamp-3">${prod.description}</p>

        <div class="flex items-center gap-3 pt-2">
          <div class="flex items-center border border-slate-300 rounded-xl bg-slate-50">
            <button onclick="let el=document.getElementById('qv-qty'); el.value=Math.max(1, parseInt(el.value)-1)" class="px-3.5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-l-xl text-sm font-bold">-</button>
            <input id="qv-qty" type="number" value="1" min="1" class="w-12 text-center text-sm font-bold bg-transparent border-none focus:outline-none">
            <button onclick="let el=document.getElementById('qv-qty'); el.value=parseInt(el.value)+1" class="px-3.5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-r-xl text-sm font-bold">+</button>
          </div>
          <button onclick="addToCart('${prod.id}', parseInt(document.getElementById('qv-qty').value)); closeQuickView()" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg hover:shadow-red-600/30">
            <i class="fas fa-cart-plus text-base"></i> Thêm vào giỏ hàng
          </button>
        </div>

        <div class="mt-4 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100">
          <span><i class="fas fa-truck text-red-500 mr-1"></i> Giao toàn quốc</span>
          <span><i class="fas fa-shield-alt text-blue-500 mr-1"></i> 100% chính hãng</span>
          <span><i class="fas fa-phone-alt text-emerald-500 mr-1"></i> 0949.761.893</span>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("pointer-events-none", "opacity-0");
  document.body.style.overflow = "hidden";
}

function closeQuickView() {
  const modal = document.getElementById("quickview-modal");
  if (modal) {
    modal.classList.add("pointer-events-none", "opacity-0");
    document.body.style.overflow = "";
  }
}

// Compare Drawer Management
function toggleCompare(productId) {
  const idx = compareList.indexOf(productId);
  if (idx > -1) {
    compareList.splice(idx, 1);
    showToast("Đã bỏ sản phẩm khỏi danh sách so sánh", "info");
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

function updateCompareUI() {
  const drawer = document.getElementById("compare-drawer");
  const countEl = document.getElementById("compare-count");
  const itemsContainer = document.getElementById("compare-items-list");
  
  if (!drawer) return;

  if (countEl) countEl.textContent = compareList.length;

  if (compareList.length > 0) {
    drawer.classList.remove("translate-y-full");
  } else {
    drawer.classList.add("translate-y-full");
    return;
  }

  if (itemsContainer) {
    itemsContainer.innerHTML = compareList.map(pid => {
      const p = WINLINE_DATA.products.find(x => x.id === pid);
      if (!p) return "";
      return `
        <div class="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs">
          <img src="${p.image}" onerror="this.src='assets/images/km750s.jpg'" class="w-8 h-8 object-contain bg-white rounded p-0.5">
          <span class="truncate max-w-[120px]">${p.name}</span>
          <button onclick="toggleCompare('${p.id}')" class="text-slate-400 hover:text-white ml-1">×</button>
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

  const modal = document.getElementById("compare-modal");
  const content = document.getElementById("compare-modal-content");
  if (!modal || !content) return;

  const prods = compareList.map(pid => WINLINE_DATA.products.find(p => p.id === pid)).filter(Boolean);

  content.innerHTML = `
    <div class="p-6 md:p-8">
      <div class="flex justify-between items-center pb-4 border-b border-slate-200">
        <h3 class="text-xl font-bold text-slate-800 font-heading">So Sánh Chi Tiết Thông Số Kỹ Thuật</h3>
        <button onclick="closeCompareModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times text-lg"></i></button>
      </div>

      <div class="overflow-x-auto mt-4">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="p-3.5 bg-slate-50 w-44 font-semibold text-slate-700">Thông Số</th>
              ${prods.map(p => `
                <th class="p-3.5 text-center w-60">
                  <img src="${p.image}" onerror="this.src='assets/images/km750s.jpg'" class="w-28 h-28 object-contain mx-auto mb-2 bg-white rounded p-1">
                  <div class="font-bold text-slate-900 line-clamp-2">${p.name}</div>
                  <div class="text-red-600 font-bold text-sm my-1">${formatVND(p.price)}</div>
                  <button onclick="addToCart('${p.id}'); closeCompareModal();" class="bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition">
                    Chọn mua
                  </button>
                </th>
              `).join("")}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr><td class="p-3.5 font-medium bg-slate-50">Hãng sản xuất</td>${prods.map(p => `<td class="p-3.5 text-center font-bold text-slate-800">${p.brandName}</td>`).join("")}</tr>
            <tr><td class="p-3.5 font-medium bg-slate-50">Mã sản phẩm</td>${prods.map(p => `<td class="p-3.5 text-center font-semibold text-slate-600">${p.code}</td>`).join("")}</tr>
            <tr><td class="p-3.5 font-medium bg-slate-50">Công suất tiêu thụ</td>${prods.map(p => `<td class="p-3.5 text-center font-bold text-blue-600">${p.powerText}</td>`).join("")}</tr>
            <tr><td class="p-3.5 font-medium bg-slate-50">Lưu lượng gió</td>${prods.map(p => `<td class="p-3.5 text-center font-bold text-emerald-600">${p.airflowText}</td>`).join("")}</tr>
            <tr><td class="p-3.5 font-medium bg-slate-50">Đường kính cánh</td>${prods.map(p => `<td class="p-3.5 text-center font-semibold text-slate-700">${p.bladeText}</td>`).join("")}</tr>
            <tr><td class="p-3.5 font-medium bg-slate-50">Điện áp sử dụng</td>${prods.map(p => `<td class="p-3.5 text-center">${p.voltage}</td>`).join("")}</tr>
            <tr><td class="p-3.5 font-medium bg-slate-50">Thời gian bảo hành</td>${prods.map(p => `<td class="p-3.5 text-center font-bold text-amber-600">${p.warranty}</td>`).join("")}</tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  modal.classList.remove("pointer-events-none", "opacity-0");
  document.body.style.overflow = "hidden";
}

function closeCompareModal() {
  const modal = document.getElementById("compare-modal");
  if (modal) {
    modal.classList.add("pointer-events-none", "opacity-0");
    document.body.style.overflow = "";
  }
}

// Live Search In Header
function initLiveSearch() {
  const searchInputs = document.querySelectorAll(".header-search-input");
  searchInputs.forEach(input => {
    const parent = input.closest(".search-container");
    if (!parent) return;

    let dropdown = parent.querySelector(".search-dropdown-results");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-dropdown-results absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto hidden";
      parent.appendChild(dropdown);
    }

    input.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (q.length < 2) {
        dropdown.classList.add("hidden");
        dropdown.innerHTML = "";
        return;
      }

      const matches = WINLINE_DATA.products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.code.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        dropdown.innerHTML = `
          <div class="p-4 text-center text-xs text-slate-400">
            Không tìm thấy sản phẩm với từ khóa "<strong>${q}</strong>"
          </div>
        `;
      } else {
        dropdown.innerHTML = `
          <div class="p-2.5 text-xs font-bold text-slate-400 bg-slate-50 uppercase tracking-wider border-b border-slate-100">Tìm thấy ${matches.length} sản phẩm</div>
          ${matches.slice(0, 5).map(p => `
            <a href="san-pham.html?search=${encodeURIComponent(p.name)}" class="flex items-center gap-3 p-3 hover:bg-slate-50 border-b border-slate-100 transition">
              <img src="${p.image}" onerror="this.src='assets/images/km750s.jpg'" class="w-12 h-12 object-contain rounded-lg border border-slate-100 p-1 flex-shrink-0 bg-white">
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-slate-800 truncate">${p.name}</div>
                <div class="text-[11px] text-slate-400">${p.powerText} | ${p.airflowText}</div>
                <div class="text-xs font-bold text-red-600 mt-0.5">${formatVND(p.price)}</div>
              </div>
            </a>
          `).join("")}
          <a href="san-pham.html?search=${encodeURIComponent(q)}" class="block p-2.5 text-center text-xs font-bold text-blue-600 bg-slate-50 hover:bg-blue-50 transition">
            Xem tất cả ${matches.length} kết quả →
          </a>
        `;
      }
      dropdown.classList.remove("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!parent.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  });
}

// Request Consultation / Quote Modal
function openConsultModal(defaultSubject = "Tư vấn chọn mua quạt công nghiệp") {
  const modal = document.getElementById("consult-modal");
  const subjectInput = document.getElementById("consult-subject");
  if (subjectInput) subjectInput.value = defaultSubject;
  if (modal) {
    modal.classList.remove("pointer-events-none", "opacity-0");
    document.body.style.overflow = "hidden";
  }
}

function closeConsultModal() {
  const modal = document.getElementById("consult-modal");
  if (modal) {
    modal.classList.add("pointer-events-none", "opacity-0");
    document.body.style.overflow = "";
  }
}

function handleConsultSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name?.value || "Quý khách";
  const phone = form.phone?.value || "";
  
  showToast(`Cảm ơn <strong>${name}</strong> (${phone})! Kỹ sư Winline sẽ liên hệ tư vấn trong 15 phút.`, "success");
  closeConsultModal();
  form.reset();
}

function downloadCatalogue(brand = "Winline") {
  showToast(`Đang tải file Catalogue & Bảng giá ${brand} 2026...`, "info");
  setTimeout(() => {
    showToast(`Đã tải thành công Catalogue ${brand} (PDF - 18.5 MB)`, "success");
  }, 1200);
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
  
  showToast(`Đặt hàng thành công! Đơn hàng của <strong>${name}</strong> (${phone}) đang được xử lý giao hàng.`, "success");
  cart = [];
  updateCartUI();
  closeCartDrawer();
  form.reset();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
  updateCompareUI();
  initLiveSearch();

  const backToTopBtn = document.getElementById("btn-back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.remove("opacity-0", "pointer-events-none");
      } else {
        backToTopBtn.classList.add("opacity-0", "pointer-events-none");
      }
    });
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
