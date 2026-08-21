/**
 * Winline Vietnam - Industrial Ventilation & Fan Sizing Calculator
 * Engineering formula: Q = V * T (m3/h)
 */

const SPACE_TYPES = {
  garment: {
    name: "Xưởng dệt may / Bao bì / Da giày",
    achDefault: 50,
    achMin: 40,
    achMax: 60,
    desc: "Mật độ công nhân cao, nhiều bụi bông vải, yêu cầu trao đổi không khí liên tục.",
    recommendedFans: ["KM-1380", "W18000", "KM-750S", "CP-1860"]
  },
  mechanic: {
    name: "Xưởng cơ khí / Đúc kim loại / Hàn / Sơn",
    achDefault: 60,
    achMin: 50,
    achMax: 70,
    desc: "Phát sinh nhiều nhiệt lượng, khói hàn và khí thải nặng mùi, cần lưu lượng hút xả lớn.",
    recommendedFans: ["KM-1380", "11-62-3.5A", "FAG-1380", "DHF-750"]
  },
  warehouse: {
    name: "Nhà kho lưu trữ / Trung tâm Logistics",
    achDefault: 30,
    achMin: 25,
    achMax: 40,
    desc: "Không gian trần cao, cần chống ẩm mốc và thông gió chống om nhiệt mái tôn.",
    recommendedFans: ["KM-1380", "DHF-750", "KVF-1845"]
  },
  kitchen: {
    name: "Nhà hàng / Bếp ăn công nghiệp / Quán nướng",
    achDefault: 45,
    achMin: 35,
    achMax: 60,
    desc: "Hút khói mùi dầu mỡ và nhiệt độ cao từ bếp nấu, tạo môi trường thoáng mát.",
    recommendedFans: ["11-62-3.5A", "KM-750S", "DPT20-66B"]
  },
  farm: {
    name: "Trang trại chăn nuôi gia cầm / Heo / Bò sữa",
    achDefault: 50,
    achMin: 40,
    achMax: 65,
    desc: "Cần hút khí amoniac (NH3), giảm nhiệt độ chuồng nuôi kết hợp Cooling Pad.",
    recommendedFans: ["KM-1380", "CP-1860", "FAG-1380"]
  },
  basement: {
    name: "Tầng hầm / Bãi đỗ xe tòa nhà / TTTM",
    achDefault: 25,
    achMin: 20,
    achMax: 35,
    desc: "Hút khí thải CO từ động cơ xe và tăng áp cấp khí tươi theo chuẩn PCCC QCVN 06.",
    recommendedFans: ["11-62-3.5A", "DPT20-66B", "KVF-1845"]
  }
};

function initCalculator() {
  const calcForm = document.getElementById("fan-calculator-form");
  if (!calcForm) return;

  const lengthInput = document.getElementById("calc-length");
  const widthInput = document.getElementById("calc-width");
  const heightInput = document.getElementById("calc-height");
  const spaceTypeSelect = document.getElementById("calc-space-type");
  const achInput = document.getElementById("calc-ach");
  const achValueDisplay = document.getElementById("calc-ach-display");
  const spaceDescEl = document.getElementById("calc-space-desc");

  // On space type change
  if (spaceTypeSelect) {
    spaceTypeSelect.addEventListener("change", () => {
      const typeKey = spaceTypeSelect.value;
      const typeData = SPACE_TYPES[typeKey] || SPACE_TYPES.garment;
      if (achInput) {
        achInput.value = typeData.achDefault;
        achInput.min = typeData.achMin;
        achInput.max = typeData.achMax;
      }
      if (achValueDisplay) achValueDisplay.textContent = `${typeData.achDefault} lần/giờ`;
      if (spaceDescEl) spaceDescEl.textContent = typeData.desc;
      calculateAirflow();
    });
  }

  // On ACH slider change
  if (achInput) {
    achInput.addEventListener("input", () => {
      if (achValueDisplay) achValueDisplay.textContent = `${achInput.value} lần/giờ`;
      calculateAirflow();
    });
  }

  // Live input changes
  [lengthInput, widthInput, heightInput].forEach(inp => {
    if (inp) inp.addEventListener("input", calculateAirflow);
  });

  // Calculate on form submit
  calcForm.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateAirflow();
    showToast("Đã tính toán xong lưu lượng thông gió và gợi ý số lượng quạt!", "success");
    const resultSec = document.getElementById("calc-results-section");
    if (resultSec) resultSec.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Initial calculation
  calculateAirflow();
}

function calculateAirflow() {
  const length = parseFloat(document.getElementById("calc-length")?.value) || 30;
  const width = parseFloat(document.getElementById("calc-width")?.value) || 20;
  const height = parseFloat(document.getElementById("calc-height")?.value) || 6;
  const typeKey = document.getElementById("calc-space-type")?.value || "garment";
  const ach = parseInt(document.getElementById("calc-ach")?.value) || 50;

  const floorArea = length * width; // m2
  const volume = floorArea * height; // m3
  const totalAirflow = volume * ach; // m3/h

  // Update Output Stats
  const areaEl = document.getElementById("res-floor-area");
  const volumeEl = document.getElementById("res-volume");
  const achEl = document.getElementById("res-ach");
  const totalAirflowEl = document.getElementById("res-total-airflow");

  if (areaEl) areaEl.textContent = `${floorArea.toLocaleString("vi-VN")} m²`;
  if (volumeEl) volumeEl.textContent = `${volume.toLocaleString("vi-VN")} m³`;
  if (achEl) achEl.textContent = `${ach} lần/giờ`;
  if (totalAirflowEl) totalAirflowEl.textContent = `${totalAirflow.toLocaleString("vi-VN")} m³/h`;

  // Quantities for different fan types
  // 1. Quạt vuông 1380 (44.500 m3/h)
  const qty1380 = Math.max(1, Math.ceil(totalAirflow / 44500));
  // 2. Quạt đứng Komasu 750 (15.200 m3/h)
  const qty750 = Math.max(1, Math.ceil(totalAirflow / 15200));
  // 3. Máy làm mát Air Cooler (18.000 m3/h)
  const qtyCooler = Math.max(1, Math.ceil(totalAirflow / 18000));
  // 4. Diện tích tấm Cooling pad (m2) = Q / (2.5 * 3600)
  const areaPad = (totalAirflow / 9000).toFixed(1);
  const qtyPadSheets = Math.ceil(parseFloat(areaPad) / (1.8 * 0.6)); // mỗi tấm 1.8x0.6m = 1.08 m2

  const qty1380El = document.getElementById("res-qty-1380");
  const qty750El = document.getElementById("res-qty-750");
  const qtyCoolerEl = document.getElementById("res-qty-cooler");
  const areaPadEl = document.getElementById("res-area-pad");

  if (qty1380El) qty1380El.textContent = `${qty1380} Quạt`;
  if (qty750El) qty750El.textContent = `${qty750} Quạt`;
  if (qtyCoolerEl) qtyCoolerEl.textContent = `${qtyCooler} Máy`;
  if (areaPadEl) areaPadEl.textContent = `${areaPad} m² (~${qtyPadSheets} tấm)`;

  // Render Recommended Product Cards
  renderCalculatorRecommendations(typeKey, { qty1380, qty750, qtyCooler, qtyPadSheets });
}

function renderCalculatorRecommendations(typeKey, quantities) {
  const container = document.getElementById("calc-recommended-products");
  if (!container || !WINLINE_DATA) return;

  const typeData = SPACE_TYPES[typeKey] || SPACE_TYPES.garment;
  const prods = typeData.recommendedFans.map(code => WINLINE_DATA.products.find(p => p.code === code)).filter(Boolean);

  container.innerHTML = prods.map(p => {
    let suggestedQty = 1;
    if (p.code === "KM-1380" || p.code === "FAG-1380") suggestedQty = quantities.qty1380;
    else if (p.code === "KM-750S" || p.code === "DHF-750") suggestedQty = quantities.qty750;
    else if (p.code === "W18000") suggestedQty = quantities.qtyCooler;
    else if (p.code === "CP-1860") suggestedQty = quantities.qtyPadSheets;

    return `
      <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-lg transition">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded">Khuyên Dùng</span>
            <span class="text-xs font-bold text-red-600">Đề xuất: ${suggestedQty} chiếc</span>
          </div>
          <div class="h-36 flex items-center justify-center p-2">
            <img src="${p.image}" alt="${p.name}" class="max-h-full max-w-full object-contain" onerror="this.src='assets/images/km750s.jpg'">
          </div>
          <h4 class="text-sm font-bold text-slate-800 line-clamp-2 mt-2">${p.name}</h4>
          <div class="text-xs text-slate-500 my-1">${p.powerText} • ${p.airflowText}</div>
          <div class="text-base font-bold text-red-600 my-2">${formatVND(p.price)}</div>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
          <button onclick="addToCart('${p.id}', ${suggestedQty})" class="bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold py-2 transition flex items-center justify-center gap-1">
            <i class="fas fa-cart-plus"></i> Chọn ${suggestedQty}
          </button>
          <button onclick="openConsultModal('Báo giá dự án model ${p.name} số lượng ${suggestedQty} chiếc')" class="btn-detail-outline text-xs py-2">
            Báo giá sỉ
          </button>
        </div>
      </div>
    `;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  initCalculator();
});
