/**
 * Winline Vietnam - Product Filtering & Dual Range Price Slider (Flawless UX)
 * Interacts with both static HTML product cards and dynamic datasets
 */

document.addEventListener("DOMContentLoaded", () => {
  const pMin = document.getElementById("price-min");
  const pMax = document.getElementById("price-max");
  const pRange = document.getElementById("price-slider-range");
  const pLabel = document.getElementById("price-label") || document.getElementById("price-display-label");
  const pBtn = document.getElementById("btn-apply-price") || document.getElementById("btn-apply-price-filter");
  const countEl = document.querySelector(".page-head .count") || document.getElementById("product-count");

  function fmtVND(n) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  }

  // Dual Slider logic
  if (pMin && pMax && pRange && pLabel) {
    function updateSliderVisual() {
      let minVal = parseInt(pMin.value) || 0;
      let maxVal = parseInt(pMax.value) || 10000000;

      if (minVal > maxVal - 50000) {
        if (this === pMin) {
          pMin.value = maxVal - 50000;
          minVal = maxVal - 50000;
        } else {
          pMax.value = minVal + 50000;
          maxVal = minVal + 50000;
        }
      }

      const minPercent = (minVal / 10000000) * 100;
      const maxPercent = (maxVal / 10000000) * 100;

      pRange.style.left = minPercent + "%";
      pRange.style.width = (maxPercent - minPercent) + "%";
      pLabel.innerHTML = `Giá: <strong>${fmtVND(minVal)}</strong> — <strong>${fmtVND(maxVal)}</strong>`;
    }

    pMin.addEventListener("input", updateSliderVisual);
    pMax.addEventListener("input", updateSliderVisual);
    updateSliderVisual();
  }

  // Master Filter Function
  function applyProductFilters() {
    const minVal = pMin ? parseInt(pMin.value) || 0 : 0;
    const maxVal = pMax ? parseInt(pMax.value) || 10000000 : 10000000;

    // Get checked brands
    const brandCheckboxes = document.querySelectorAll(".filter-group:has(.filter-title) label.filter-opt input[type='checkbox']");
    const checkedBrands = [];
    document.querySelectorAll(".filter-group").forEach(group => {
      const title = group.querySelector(".filter-title")?.textContent.trim();
      if (title === "Thương hiệu") {
        group.querySelectorAll("label.filter-opt").forEach(label => {
          const cb = label.querySelector("input[type='checkbox']");
          if (cb && cb.checked) {
            // Get brand text
            const brandText = label.textContent.replace(/[0-9]/g, "").trim().toLowerCase();
            checkedBrands.push(brandText);
          }
        });
      }
    });

    const cards = document.querySelectorAll(".prod-card, .product-card");
    let visibleCount = 0;

    cards.forEach(card => {
      const priceText = card.querySelector(".p-price, .price, .price-red")?.textContent.replace(/[^0-9]/g, "") || "0";
      const priceNum = parseInt(priceText) || 0;
      const cardBrand = card.querySelector(".p-brand")?.textContent.trim().toLowerCase() || "";

      let matchesPrice = (priceNum >= minVal && priceNum <= maxVal);
      let matchesBrand = (checkedBrands.length === 0) || checkedBrands.some(b => cardBrand.includes(b) || b.includes(cardBrand));

      if (matchesPrice && matchesBrand) {
        card.style.display = "flex";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    if (countEl) {
      countEl.textContent = `Hiển thị ${visibleCount} sản phẩm phù hợp`;
    }
  }

  // Filter Button Event
  if (pBtn) {
    pBtn.addEventListener("click", () => {
      applyProductFilters();
      if (typeof showToast === "function") {
        const minVal = pMin ? parseInt(pMin.value) || 0 : 0;
        const maxVal = pMax ? parseInt(pMax.value) || 10000000 : 10000000;
        showToast(`Đã lọc danh sách: ${fmtVND(minVal)} — ${fmtVND(maxVal)}`, "info");
      }
    });
  }

  // Price Preset Chips
  document.querySelectorAll(".price-chip").forEach(chip => {
    chip.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".price-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const text = chip.textContent.trim();
      if (text.includes("Dưới 1.500.000")) {
        if (pMin) pMin.value = 0;
        if (pMax) pMax.value = 1500000;
      } else if (text.includes("1.500.000") && text.includes("3.000.000")) {
        if (pMin) pMin.value = 1500000;
        if (pMax) pMax.value = 3000000;
      } else if (text.includes("3.000.000") && text.includes("5.000.000")) {
        if (pMin) pMin.value = 3000000;
        if (pMax) pMax.value = 5000000;
      } else if (text.includes("Trên 5.000.000")) {
        if (pMin) pMin.value = 5000000;
        if (pMax) pMax.value = 10000000;
      }

      if (pMin && pMax && pRange && pLabel) {
        const minVal = parseInt(pMin.value);
        const maxVal = parseInt(pMax.value);
        pRange.style.left = (minVal / 10000000) * 100 + "%";
        pRange.style.width = ((maxVal - minVal) / 10000000) * 100 + "%";
        pLabel.innerHTML = `Giá: <strong>${fmtVND(minVal)}</strong> — <strong>${fmtVND(maxVal)}</strong>`;
      }

      applyProductFilters();
    });
  });

  // Checkbox change events
  document.querySelectorAll(".filter-group input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", applyProductFilters);
  });

  // Clear filters button
  const clearBtn = document.querySelector(".filter-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (pMin) pMin.value = 0;
      if (pMax) pMax.value = 10000000;
      if (pRange) {
        pRange.style.left = "0%";
        pRange.style.width = "100%";
      }
      if (pLabel) {
        pLabel.innerHTML = `Giá: <strong>${fmtVND(0)}</strong> — <strong>${fmtVND(10000000)}</strong>`;
      }
      document.querySelectorAll(".price-chip").forEach(c => c.classList.remove("active"));
      document.querySelectorAll(".filter-group input[type='checkbox']").forEach(cb => cb.checked = false);
      applyProductFilters();
      if (typeof showToast === "function") {
        showToast("Đã xóa tất cả bộ lọc", "info");
      }
    });
  }

  // Mobile Filter Toggle Button
  const filterToggleBtn = document.getElementById("btn-toggle-filters");
  const filtersSection = document.getElementById("filtersSection");
  if (filterToggleBtn && filtersSection) {
    filterToggleBtn.addEventListener("click", () => {
      filtersSection.classList.toggle("show-mobile-filter");
      filterToggleBtn.textContent = filtersSection.classList.contains("show-mobile-filter") ? "✕ Đóng bộ lọc" : "☰ Mở bộ lọc sản phẩm";
    });
  }

  // Sort Dropdown
  const sortSelect = document.querySelector(".sort-wrap select");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      const grid = document.querySelector(".prod-grid");
      if (!grid) return;
      const cards = Array.from(grid.querySelectorAll(".prod-card"));
      const val = sortSelect.value;

      cards.sort((a, b) => {
        const pA = parseInt(a.querySelector(".p-price")?.textContent.replace(/[^0-9]/g, "") || "0");
        const pB = parseInt(b.querySelector(".p-price")?.textContent.replace(/[^0-9]/g, "") || "0");
        if (val.includes("thấp đến cao")) return pA - pB;
        if (val.includes("cao đến thấp")) return pB - pA;
        return 0;
      });

      cards.forEach(c => grid.appendChild(c));
    });
  }
});
