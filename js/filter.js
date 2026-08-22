/**
 * Winline Vietnam - Product Filtering, Dual-Thumb Range Slider,
 * Grid/List View Switcher, Pagination, SEO Expand/Collapse
 * Exact match with Sản phẩm.jpg & Mockup Design
 */

// Filter State
const filterState = {
  category: "all",
  subCategory: "all",
  selectedBrands: [],
  selectedPowerRanges: [],
  selectedAirflowRanges: [],
  selectedBladeSizes: [],
  minPrice: 0,
  maxPrice: 10000000,
  searchQuery: "",
  sortBy: "newest",
  itemsPerPage: 12,
  currentPage: 1,
  viewMode: "grid" // "grid" or "list"
};

// Dual Slider Min/Max limits
const SLIDER_CONFIG = {
  min: 0,
  max: 10000000,
  step: 50000
};

// DOM References
let priceMinInput, priceMaxInput, priceTrackRange, priceDisplayLabel, productsGridEl, paginationEl, productCountEl;

// Initialize Dual Range Slider
function initPriceSlider() {
  priceMinInput = document.getElementById("price-min");
  priceMaxInput = document.getElementById("price-max");
  priceTrackRange = document.getElementById("price-slider-range");
  priceDisplayLabel = document.getElementById("price-display-label");

  if (!priceMinInput || !priceMaxInput || !priceTrackRange || !priceDisplayLabel) return;

  function updateSliderVisual(isFinal = false) {
    let minVal = parseInt(priceMinInput.value);
    let maxVal = parseInt(priceMaxInput.value);

    // Prevent cross-over
    if (minVal > maxVal - SLIDER_CONFIG.step) {
      if (this === priceMinInput) {
        priceMinInput.value = maxVal - SLIDER_CONFIG.step;
        minVal = maxVal - SLIDER_CONFIG.step;
      } else {
        priceMaxInput.value = minVal + SLIDER_CONFIG.step;
        maxVal = minVal + SLIDER_CONFIG.step;
      }
    }

    const minPercent = ((minVal - SLIDER_CONFIG.min) / (SLIDER_CONFIG.max - SLIDER_CONFIG.min)) * 100;
    const maxPercent = ((maxVal - SLIDER_CONFIG.min) / (SLIDER_CONFIG.max - SLIDER_CONFIG.min)) * 100;

    priceTrackRange.style.left = `${minPercent}%`;
    priceTrackRange.style.width = `${maxPercent - minPercent}%`;

    priceDisplayLabel.innerHTML = `Giá: <strong>${formatVND(minVal)}</strong> — <strong>${formatVND(maxVal)}</strong>`;

    filterState.minPrice = minVal;
    filterState.maxPrice = maxVal;

    if (isFinal) {
      filterState.currentPage = 1;
      applyFilters();
    }
  }

  priceMinInput.addEventListener("input", () => updateSliderVisual.call(priceMinInput, false));
  priceMaxInput.addEventListener("input", () => updateSliderVisual.call(priceMaxInput, false));

  // Initial call
  updateSliderVisual(false);

  // Filter Button click (Teal button matching screenshot)
  const filterBtn = document.getElementById("btn-apply-price-filter");
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      filterState.currentPage = 1;
      applyFilters();
      showToast(`Đã lọc sản phẩm từ <strong>${formatVND(filterState.minPrice)}</strong> đến <strong>${formatVND(filterState.maxPrice)}</strong>`, "info");
    });
  }
}

// Checkbox Filter Listeners
function initCheckboxes() {
  // Brand checkboxes
  document.querySelectorAll("input[data-filter='brand']").forEach(cb => {
    cb.addEventListener("change", () => {
      const brandId = cb.value;
      if (cb.checked) {
        filterState.selectedBrands.push(brandId);
      } else {
        filterState.selectedBrands = filterState.selectedBrands.filter(b => b !== brandId);
      }
      filterState.currentPage = 1;
      applyFilters();
    });
  });

  // Power range checkboxes
  document.querySelectorAll("input[data-filter='power']").forEach(cb => {
    cb.addEventListener("change", () => {
      const val = cb.value;
      if (cb.checked) {
        filterState.selectedPowerRanges.push(val);
      } else {
        filterState.selectedPowerRanges = filterState.selectedPowerRanges.filter(p => p !== val);
      }
      filterState.currentPage = 1;
      applyFilters();
    });
  });

  // Airflow range checkboxes
  document.querySelectorAll("input[data-filter='airflow']").forEach(cb => {
    cb.addEventListener("change", () => {
      const val = cb.value;
      if (cb.checked) {
        filterState.selectedAirflowRanges.push(val);
      } else {
        filterState.selectedAirflowRanges = filterState.selectedAirflowRanges.filter(a => a !== val);
      }
      filterState.currentPage = 1;
      applyFilters();
    });
  });

  // Blade size checkboxes
  document.querySelectorAll("input[data-filter='blade']").forEach(cb => {
    cb.addEventListener("change", () => {
      const val = parseInt(cb.value);
      if (cb.checked) {
        filterState.selectedBladeSizes.push(val);
      } else {
        filterState.selectedBladeSizes = filterState.selectedBladeSizes.filter(s => s !== val);
      }
      filterState.currentPage = 1;
      applyFilters();
    });
  });
}

// Category Accordion & Selection
function initCategoryAccordion() {
  document.querySelectorAll(".cat-header").forEach(btn => {
    btn.addEventListener("click", () => {
      const catItem = btn.closest(".category-item");
      const subList = catItem.querySelector(".subcategory-list");
      const icon = btn.querySelector(".cat-arrow");

      if (subList) {
        const isHidden = subList.classList.contains("hidden");
        subList.classList.toggle("hidden");
        if (icon) {
          icon.style.transform = isHidden ? "rotate(90deg)" : "rotate(0deg)";
        }
      }
    });
  });

  // Subcategory click
  document.querySelectorAll(".subcategory-item").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".subcategory-item").forEach(el => el.classList.remove("active", "text-red-600", "font-bold"));
      item.classList.add("active", "text-red-600", "font-bold");

      const subCatId = item.getAttribute("data-subcat");
      filterState.subCategory = subCatId;
      filterState.currentPage = 1;

      // Update Breadcrumb
      updateBreadcrumb(item.textContent.trim());
      applyFilters();
    });
  });
}

function updateBreadcrumb(subCatName) {
  const breadcrumbEl = document.getElementById("breadcrumb-current");
  if (breadcrumbEl && subCatName) {
    breadcrumbEl.textContent = subCatName;
  }
}

// View switcher & Sorting
function initToolbar() {
  // Sort dropdown
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      filterState.sortBy = e.target.value;
      applyFilters();
    });
  }

  // Items per page
  const limitSelect = document.getElementById("limit-select");
  if (limitSelect) {
    limitSelect.addEventListener("change", (e) => {
      filterState.itemsPerPage = parseInt(e.target.value) || 12;
      filterState.currentPage = 1;
      applyFilters();
    });
  }

  // Grid/List view toggle
  const gridBtn = document.getElementById("view-grid-btn");
  const listBtn = document.getElementById("view-list-btn");
  if (gridBtn && listBtn) {
    gridBtn.addEventListener("click", () => {
      filterState.viewMode = "grid";
      gridBtn.classList.add("text-brandRed", "bg-white", "shadow-xs");
      gridBtn.classList.remove("text-slate-500");
      listBtn.classList.remove("text-brandRed", "bg-white", "shadow-xs");
      listBtn.classList.add("text-slate-500");
      renderProducts(getFilteredProducts());
    });

    listBtn.addEventListener("click", () => {
      filterState.viewMode = "list";
      listBtn.classList.add("text-brandRed", "bg-white", "shadow-xs");
      listBtn.classList.remove("text-slate-500");
      gridBtn.classList.remove("text-brandRed", "bg-white", "shadow-xs");
      gridBtn.classList.add("text-slate-500");
      renderProducts(getFilteredProducts());
    });
  }

  // Reset Filters Button
  const resetBtn = document.getElementById("btn-reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAllFilters);
  }
}

function resetAllFilters() {
  filterState.selectedBrands = [];
  filterState.selectedPowerRanges = [];
  filterState.selectedAirflowRanges = [];
  filterState.selectedBladeSizes = [];
  filterState.subCategory = "all";
  filterState.searchQuery = "";
  filterState.minPrice = SLIDER_CONFIG.min;
  filterState.maxPrice = SLIDER_CONFIG.max;
  filterState.currentPage = 1;

  // Uncheck checkboxes
  document.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);

  // Reset price slider
  if (priceMinInput && priceMaxInput) {
    priceMinInput.value = SLIDER_CONFIG.min;
    priceMaxInput.value = SLIDER_CONFIG.max;
    if (priceTrackRange) {
      priceTrackRange.style.left = "0%";
      priceTrackRange.style.width = "100%";
    }
    if (priceDisplayLabel) {
      priceDisplayLabel.innerHTML = `Giá: <strong>${formatVND(SLIDER_CONFIG.min)}</strong> — <strong>${formatVND(SLIDER_CONFIG.max)}</strong>`;
    }
  }

  // Reset subcategory active
  document.querySelectorAll(".subcategory-item").forEach(el => el.classList.remove("active", "text-red-600", "font-bold"));

  applyFilters();
  showToast("Đã đặt lại tất cả bộ lọc về mặc định", "info");
}

// Filter Engine
function getFilteredProducts() {
  if (!WINLINE_DATA || !WINLINE_DATA.products) return [];

  return WINLINE_DATA.products.filter(item => {
    // Category & Subcategory
    if (filterState.subCategory !== "all" && item.subCategory !== filterState.subCategory) {
      return false;
    }

    // Brand filter
    if (filterState.selectedBrands.length > 0 && !filterState.selectedBrands.includes(item.brand)) {
      return false;
    }

    // Power filter
    if (filterState.selectedPowerRanges.length > 0 && !filterState.selectedPowerRanges.includes(item.powerRange)) {
      return false;
    }

    // Airflow filter
    if (filterState.selectedAirflowRanges.length > 0 && !filterState.selectedAirflowRanges.includes(item.airflowRange)) {
      return false;
    }

    // Blade size filter
    if (filterState.selectedBladeSizes.length > 0 && !filterState.selectedBladeSizes.includes(item.bladeSize)) {
      return false;
    }

    // Price range
    if (item.price < filterState.minPrice || item.price > filterState.maxPrice) {
      return false;
    }

    // Search query
    if (filterState.searchQuery) {
      const q = filterState.searchQuery.toLowerCase();
      const match = item.name.toLowerCase().includes(q) ||
                    item.code.toLowerCase().includes(q) ||
                    item.brandName.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

// Sort engine
function sortProducts(list) {
  const sorted = [...list];
  switch (filterState.sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "best-seller":
      return sorted.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    case "newest":
    default:
      return sorted;
  }
}

// Render Products Grid / List
function renderProducts(filteredList) {
  productsGridEl = document.getElementById("products-container");
  productCountEl = document.getElementById("products-count-label");

  if (!productsGridEl) return;

  const sortedList = sortProducts(filteredList);
  const totalItems = sortedList.length;

  if (productCountEl) {
    productCountEl.textContent = `Hiển thị ${Math.min(totalItems, filterState.itemsPerPage)} sản phẩm`;
  }

  // Active filter chips
  renderFilterChips();

  if (totalItems === 0) {
    productsGridEl.innerHTML = `
      <div class="col-span-full py-16 text-center bg-white rounded-lg border border-dashed border-slate-300 p-8">
        <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i class="fas fa-search"></i>
        </div>
        <h3 class="text-base font-bold text-slate-800 mb-1 font-heading">Không tìm thấy sản phẩm phù hợp</h3>
        <p class="text-xs text-slate-500 max-w-md mx-auto mb-5">
          Vui lòng thử điều chỉnh lại mức giá, bỏ chọn các thương hiệu hoặc xóa bộ lọc để xem nhiều sản phẩm hơn.
        </p>
        <button onclick="resetAllFilters()" class="btn-filter-price">
          Xóa toàn bộ bộ lọc
        </button>
      </div>
    `;
    if (paginationEl) paginationEl.innerHTML = "";
    return;
  }

  // Pagination Slice
  const startIndex = (filterState.currentPage - 1) * filterState.itemsPerPage;
  const pageItems = sortedList.slice(startIndex, startIndex + filterState.itemsPerPage);

  if (filterState.viewMode === "list") {
    productsGridEl.className = "products-list-view flex flex-col gap-4";
    productsGridEl.innerHTML = pageItems.map(p => renderListCard(p)).join("");
  } else {
    productsGridEl.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4";
    productsGridEl.innerHTML = pageItems.map(p => renderGridCard(p)).join("");
  }

  renderPagination(totalItems);
}

// Product Grid Card (100% Pixel Match with Sản phẩm.jpg)
function renderGridCard(p) {
  const isCompared = compareList.includes(p.id);
  return `
    <div class="product-card group bg-white border border-slate-200 rounded-md flex flex-col justify-between p-3.5 hover:shadow-md transition">
      
      <!-- Top Image Area -->
      <div class="img-wrap cursor-pointer relative" onclick="openQuickView('${p.id}')">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='assets/images/km750s.jpg'" class="mx-auto">
        
        <!-- Hover Quick Actions -->
        <div class="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
          <button onclick="event.stopPropagation(); openQuickView('${p.id}')" title="Xem nhanh" class="w-7 h-7 bg-white/95 text-slate-700 hover:text-red-600 rounded-full shadow-xs flex items-center justify-center text-[11px] transition">
            <i class="fas fa-eye"></i>
          </button>
          <button onclick="event.stopPropagation(); addToCart('${p.id}')" title="Thêm giỏ" class="w-7 h-7 bg-white/95 text-slate-700 hover:text-red-600 rounded-full shadow-xs flex items-center justify-center text-[11px] transition">
            <i class="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>

      <!-- Card Body matching exact mockup typography -->
      <div class="pt-3 flex-1 flex flex-col justify-between">
        <div>
          <!-- Title -->
          <h3 onclick="openQuickView('${p.id}')" class="text-xs md:text-[13px] font-bold text-slate-900 group-hover:text-red-600 transition cursor-pointer line-clamp-1 mb-1.5 font-heading" title="${p.name}">
            ${p.name}
          </h3>

          <!-- Specs snippet matching mockup lines -->
          <div class="text-[11px] text-slate-600 space-y-0.5 mb-2 font-normal leading-tight">
            <div>Công suất: <span class="text-slate-800 font-semibold">${p.powerText}</span></div>
            <div>Lưu lượng: <span class="text-slate-800 font-semibold">${p.airflowText}</span></div>
          </div>
        </div>

        <div>
          <!-- Red Price matching mockup -->
          <div class="text-sm md:text-base font-bold text-red-600 mb-2.5 font-heading">
            ${formatVND(p.price)}
          </div>

          <!-- Full Width "Xem chi tiết" Button matching exact mockup -->
          <button onclick="openQuickView('${p.id}')" class="w-full py-1.5 px-3 border border-slate-300 rounded text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition text-xs font-semibold text-center block">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  `;
}

// Product List Card Variant
function renderListCard(p) {
  return `
    <div class="product-card group bg-white border border-slate-200 rounded-md p-4 flex flex-col sm:flex-row gap-4 items-center">
      <div class="img-wrap cursor-pointer w-44 h-36 flex-shrink-0" onclick="openQuickView('${p.id}')">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='assets/images/km750s.jpg'" class="max-h-full max-w-full object-contain mx-auto">
      </div>
      <div class="flex-1 space-y-1.5">
        <div class="text-xs text-red-600 font-bold uppercase">${p.brandName}</div>
        <h3 onclick="openQuickView('${p.id}')" class="text-sm font-bold text-slate-900 group-hover:text-red-600 transition cursor-pointer font-heading">
          ${p.name}
        </h3>
        <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
          <div>Công suất: <strong class="text-slate-800">${p.powerText}</strong></div>
          <div>Lưu lượng: <strong class="text-slate-800">${p.airflowText}</strong></div>
          <div>Sải cánh: <strong class="text-slate-800">${p.bladeText}</strong></div>
          <div>Điện áp: <strong class="text-slate-800">${p.voltage}</strong></div>
        </div>
      </div>
      <div class="flex flex-col items-end justify-center min-w-[140px] pl-4 border-l border-slate-100">
        <div class="text-base font-bold text-red-600 mb-2">${formatVND(p.price)}</div>
        <button onclick="openQuickView('${p.id}')" class="w-full py-1.5 px-3 border border-slate-300 rounded text-slate-800 hover:bg-slate-900 hover:text-white transition text-xs font-semibold text-center mb-1.5">
          Xem chi tiết
        </button>
        <button onclick="addToCart('${p.id}')" class="w-full py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold text-center">
          Thêm vào giỏ
        </button>
      </div>
    </div>
  `;
}

// Active Filter Chips
function renderFilterChips() {
  const chipsContainer = document.getElementById("active-filter-chips");
  if (!chipsContainer) return;

  const chips = [];

  if (filterState.subCategory !== "all") {
    const subCatObj = WINLINE_DATA.categories.flatMap(c => c.children).find(s => s.id === filterState.subCategory);
    if (subCatObj) {
      chips.push({ label: `Danh mục: ${subCatObj.name}`, onRemove: () => { filterState.subCategory = "all"; applyFilters(); } });
    }
  }

  filterState.selectedBrands.forEach(bId => {
    const brand = WINLINE_DATA.brands.find(b => b.id === bId);
    if (brand) {
      chips.push({ label: `Hãng: ${brand.name}`, onRemove: () => {
        filterState.selectedBrands = filterState.selectedBrands.filter(x => x !== bId);
        const cb = document.querySelector(`input[data-filter='brand'][value='${bId}']`);
        if (cb) cb.checked = false;
        applyFilters();
      }});
    }
  });

  if (filterState.minPrice > SLIDER_CONFIG.min || filterState.maxPrice < SLIDER_CONFIG.max) {
    chips.push({
      label: `Giá: ${formatVND(filterState.minPrice)} - ${formatVND(filterState.maxPrice)}`,
      onRemove: () => {
        filterState.minPrice = SLIDER_CONFIG.min;
        filterState.maxPrice = SLIDER_CONFIG.max;
        if (priceMinInput && priceMaxInput) {
          priceMinInput.value = SLIDER_CONFIG.min;
          priceMaxInput.value = SLIDER_CONFIG.max;
          priceTrackRange.style.left = "0%";
          priceTrackRange.style.width = "100%";
          priceDisplayLabel.innerHTML = `Giá: <strong>${formatVND(SLIDER_CONFIG.min)}</strong> — <strong>${formatVND(SLIDER_CONFIG.max)}</strong>`;
        }
        applyFilters();
      }
    });
  }

  if (chips.length === 0) {
    chipsContainer.innerHTML = "";
    chipsContainer.classList.add("hidden");
    return;
  }

  chipsContainer.classList.remove("hidden");
  chipsContainer.innerHTML = `
    <div class="flex flex-wrap items-center gap-2 mb-4 p-3 bg-white rounded border border-slate-200">
      <span class="text-xs font-semibold text-slate-500 mr-1">Đang lọc:</span>
      ${chips.map((chip, idx) => `
        <span class="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded text-xs font-medium transition">
          ${chip.label}
          <button data-chip-idx="${idx}" class="text-slate-400 hover:text-red-600 font-bold ml-1">×</button>
        </span>
      `).join("")}
      <button onclick="resetAllFilters()" class="text-xs font-bold text-red-600 hover:underline ml-auto">
        Xóa tất cả
      </button>
    </div>
  `;

  chipsContainer.querySelectorAll("button[data-chip-idx]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-chip-idx"));
      if (chips[idx]) chips[idx].onRemove();
    });
  });
}

// Pagination Controls matching mockup: [ 1 ] 2 3 4 5 ... 15 >
function renderPagination(totalItems) {
  paginationEl = document.getElementById("pagination-container");
  if (!paginationEl) return;

  const totalPages = Math.ceil(totalItems / filterState.itemsPerPage);

  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  let html = `<div class="flex items-center justify-center gap-2 my-8">`;

  // Page Numbers
  for (let i = 1; i <= Math.min(5, totalPages); i++) {
    const isActive = i === filterState.currentPage;
    html += `
      <button onclick="changePage(${i})" class="w-8 h-8 rounded text-xs font-bold flex items-center justify-center transition ${isActive ? 'bg-[#0b1f3a] text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}">
        ${i}
      </button>
    `;
  }

  if (totalPages > 5) {
    html += `<span class="w-6 text-center text-xs text-slate-400">...</span>`;
    html += `
      <button onclick="changePage(${totalPages})" class="w-8 h-8 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center transition">
        ${totalPages}
      </button>
    `;
  }

  // Next >
  if (filterState.currentPage < totalPages) {
    html += `
      <button onclick="changePage(${filterState.currentPage + 1})" class="w-8 h-8 rounded flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">
        <i class="fas fa-chevron-right text-[10px]"></i>
      </button>
    `;
  }

  html += `</div>`;
  paginationEl.innerHTML = html;
}

function changePage(pageNum) {
  filterState.currentPage = pageNum;
  applyFilters();
  const target = document.getElementById("products-top-anchor") || document.getElementById("products-container");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Master Apply Filters Trigger
function applyFilters() {
  const filtered = getFilteredProducts();
  renderProducts(filtered);
}

// SEO Content Toggle (Xem thêm / Thu gọn)
function initSeoToggle() {
  const wrapper = document.getElementById("seo-content-wrapper");
  const toggleBtn = document.getElementById("seo-toggle-btn");
  const toggleText = document.getElementById("seo-toggle-text");
  const toggleIcon = document.getElementById("seo-toggle-icon");

  if (!wrapper || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const isExpanded = wrapper.classList.contains("expanded");
    if (isExpanded) {
      wrapper.classList.remove("expanded");
      if (toggleText) toggleText.textContent = "Xem thêm";
      if (toggleIcon) toggleIcon.style.transform = "rotate(0deg)";
    } else {
      wrapper.classList.add("expanded");
      if (toggleText) toggleText.textContent = "Thu gọn";
      if (toggleIcon) toggleIcon.style.transform = "rotate(180deg)";
    }
  });
}

// Parse URL Parameters
function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("category");
  const subcat = params.get("subcat");
  const brand = params.get("brand");
  const search = params.get("search");

  if (subcat) {
    filterState.subCategory = subcat;
    const subCatObj = WINLINE_DATA.categories.flatMap(c => c.children).find(s => s.id === subcat);
    if (subCatObj) updateBreadcrumb(subCatObj.name);
  }

  if (brand) {
    filterState.selectedBrands = [brand];
    const cb = document.querySelector(`input[data-filter='brand'][value='${brand}']`);
    if (cb) cb.checked = true;
  }

  if (search) {
    filterState.searchQuery = search;
    const searchInput = document.getElementById("catalog-search-input");
    if (searchInput) searchInput.value = search;
  }
}

// DOM Ready initialization for product page
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("products-container")) {
    initPriceSlider();
    initCheckboxes();
    initCategoryAccordion();
    initToolbar();
    initSeoToggle();
    parseUrlParams();
    applyFilters();
  }
});
