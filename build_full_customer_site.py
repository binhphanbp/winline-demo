import os
import re

drive_dir = "drive_files"

# Map source file from drive to destination file in root
pages_map = {
    "index.html": ("homepage.html", "home"),
    "gioi-thieu.html": ("about-company.html", "about"),
    "san-pham.html": ("san-pham.html", "products"),
    "giai-phap.html": ("giai-phap.html", "solutions"),
    "thuong-hieu.html": ("thuong-hieu.html", "brands"),
    "cong-cu-tinh-quat.html": ("cong-cu-tinh-quat.html", "calc"),
    "du-an.html": ("du-an-da-trien-khai.html", "projects"),
    "chi-tiet-san-pham.html": ("chi-tiet-san-pham.html", "products")
}

# The unified 7-menu Navigation Bar matching customer's exact CSS .catnav
def get_nav_html(active_tag):
    return f"""<nav class="catnav">
  <div class="catnav-inner">
    <a href="index.html" class="nav-top {'active' if active_tag == 'home' else ''}">Trang chủ</a>
    <a href="gioi-thieu.html" class="nav-top {'active' if active_tag == 'about' else ''}">Giới thiệu</a>

    <div class="nav-drop">
      <a href="san-pham.html" class="nav-top {'active' if active_tag == 'products' else ''}">Sản phẩm ▾</a>
      <div class="nav-panel nav-panel-wide">
        <div class="np-col">
          <div class="np-title">Quạt dân dụng</div>
          <a href="san-pham.html">Quạt trần</a>
          <a href="san-pham.html">Quạt cây / quạt đứng</a>
          <a href="san-pham.html">Quạt treo tường</a>
          <a href="san-pham.html">Quạt sàn / quạt quỳ</a>
        </div>
        <div class="np-col">
          <div class="np-title">Quạt công nghiệp</div>
          <a href="san-pham.html">Quạt cây công nghiệp</a>
          <a href="san-pham.html">Quạt treo tường công nghiệp</a>
          <a href="san-pham.html">Quạt sàn công nghiệp</a>
        </div>
        <div class="np-col">
          <div class="np-title">Thông gió &amp; làm mát</div>
          <a href="san-pham.html">Quạt thông gió dân dụng</a>
          <a href="san-pham.html">Quạt thông gió công nghiệp</a>
          <a href="san-pham.html">Quạt cắt gió</a>
          <a href="san-pham.html">Máy làm mát / điều hoà di động</a>
        </div>
      </div>
    </div>

    <a href="giai-phap.html" class="nav-top {'active' if active_tag == 'solutions' else ''}">Giải pháp</a>

    <div class="nav-drop">
      <a href="thuong-hieu.html" class="nav-top {'active' if active_tag == 'brands' else ''}">Thương hiệu ▾</a>
      <div class="nav-panel">
        <a href="thuong-hieu.html">Vinawind (Điện cơ Thống Nhất)</a>
        <a href="thuong-hieu.html">Komasu Nhật Bản</a>
        <a href="thuong-hieu.html">Deton</a>
        <a href="thuong-hieu.html">Dasin</a>
        <a href="thuong-hieu.html">Chinghai</a>
        <a href="thuong-hieu.html">Hatari</a>
        <a href="thuong-hieu.html">Panasonic</a>
        <a href="thuong-hieu.html">Nedfon</a>
      </div>
    </div>

    <a href="cong-cu-tinh-quat.html" class="nav-top {'active' if active_tag == 'calc' else ''}">Công cụ tính quạt</a>
    <a href="du-an.html" class="nav-top {'active' if active_tag == 'projects' else ''}">Dự án</a>
  </div>
</nav>"""

# Dual Price Slider CSS to inject into customer styles
dual_slider_css = """
/* Dual Range Price Slider (Yêu cầu bổ sung của khách hàng) */
.price-slider-wrap {
  margin-top: 14px;
  padding: 10px 0;
}
.price-slider-track {
  position: relative;
  width: 100%;
  height: 6px;
  background: #dde3ea;
  border-radius: 999px;
}
.price-slider-range {
  position: absolute;
  height: 100%;
  background: #26a69a;
  border-radius: 999px;
}
.range-inputs {
  position: relative;
}
.range-inputs input[type="range"] {
  position: absolute;
  width: 100%;
  height: 6px;
  top: -6px;
  background: none;
  pointer-events: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  margin: 0;
}
.range-inputs input[type="range"]::-webkit-slider-thumb {
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #64748b;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  pointer-events: auto;
  -webkit-appearance: none;
  cursor: pointer;
}
.range-inputs input[type="range"]::-moz-range-thumb {
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #64748b;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  pointer-events: auto;
  -moz-appearance: none;
  cursor: pointer;
}
.btn-filter-teal {
  background: #26a69a;
  color: #ffffff;
  font-weight: 700;
  border-radius: 999px;
  padding: 5px 18px;
  font-size: 12px;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(38,166,154,0.25);
  transition: all 0.2s;
}
.btn-filter-teal:hover {
  background: #00897b;
}
"""

dual_slider_html = """
    <div class="filter-group">
      <div class="filter-title">Lọc theo giá</div>
      <div class="price-slider-wrap">
        <div class="price-slider-track">
          <div id="price-slider-range" class="price-slider-range" style="left:0%; width:100%;"></div>
        </div>
        <div class="range-inputs">
          <input type="range" id="price-min" min="0" max="10000000" step="50000" value="0">
          <input type="range" id="price-max" min="0" max="10000000" step="50000" value="10000000">
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
          <button type="button" id="btn-apply-price" class="btn-filter-teal">LỌC</button>
          <div id="price-label" style="font-size:12px; color:var(--ink-soft); text-align:right;">
            Giá: <strong style="color:var(--ink);">0₫</strong> — <strong style="color:var(--ink);">10.000.000₫</strong>
          </div>
        </div>
      </div>
    </div>
"""

dual_slider_js = """
<script>
document.addEventListener("DOMContentLoaded", function() {
  const pMin = document.getElementById("price-min");
  const pMax = document.getElementById("price-max");
  const pRange = document.getElementById("price-slider-range");
  const pLabel = document.getElementById("price-label");
  const pBtn = document.getElementById("btn-apply-price");

  function fmtVND(n) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  }

  if (pMin && pMax && pRange && pLabel) {
    function updateSlider() {
      let minVal = parseInt(pMin.value);
      let maxVal = parseInt(pMax.value);
      if (minVal > maxVal - 50000) {
        if (this === pMin) pMin.value = maxVal - 50000;
        else pMax.value = minVal + 50000;
        minVal = parseInt(pMin.value);
        maxVal = parseInt(pMax.value);
      }
      const minP = (minVal / 10000000) * 100;
      const maxP = (maxVal / 10000000) * 100;
      pRange.style.left = minP + "%";
      pRange.style.width = (maxP - minP) + "%";
      pLabel.innerHTML = 'Giá: <strong>' + fmtVND(minVal) + '</strong> — <strong>' + fmtVND(maxVal) + '</strong>';
    }
    pMin.addEventListener("input", updateSlider);
    pMax.addEventListener("input", updateSlider);
    updateSlider();

    if (pBtn) {
      pBtn.addEventListener("click", function() {
        const minVal = parseInt(pMin.value);
        const maxVal = parseInt(pMax.value);
        const cards = document.querySelectorAll(".card, .product-card");
        let visibleCount = 0;
        cards.forEach(card => {
          const priceText = card.querySelector(".price, .price-red")?.textContent.replace(/[^0-9]/g, "") || "0";
          const priceNum = parseInt(priceText) || 0;
          if (priceNum >= minVal && priceNum <= maxVal) {
            card.style.display = "";
            visibleCount++;
          } else {
            card.style.display = "none";
          }
        });
      });
    }
  }
});
</script>
"""

# Process each file
for dest_file, (src_file, active_tag) in pages_map.items():
    src_path = os.path.join(drive_dir, src_file)
    if not os.path.exists(src_path):
        print(f"Missing {src_path}!")
        continue
    
    with open(src_path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    # 1. Replace <nav class="catnav">...</nav> with the unified 7-item nav
    nav_pattern = re.compile(r'<nav class="catnav">.*?</nav>', re.DOTALL)
    html = nav_pattern.sub(get_nav_html(active_tag), html)

    # 2. Update internal links
    html = html.replace('href="homepage.html"', 'href="index.html"')
    html = html.replace('href="about-company.html"', 'href="gioi-thieu.html"')
    html = html.replace('href="category.html"', 'href="san-pham.html"')
    html = html.replace('href="Sản phẩm"', 'href="san-pham.html"')
    html = html.replace('href="product-detail.html"', 'href="chi-tiet-san-pham.html"')
    html = html.replace('href="Trang chi tiết sản phẩm"', 'href="chi-tiet-san-pham.html"')
    html = html.replace('href="Giải pháp.html"', 'href="giai-phap.html"')
    html = html.replace('href="giai-phap.html"', 'href="giai-phap.html"')
    html = html.replace('href="Thương hiệu"', 'href="thuong-hieu.html"')
    html = html.replace('href="du-an-da-trien-khai.html"', 'href="du-an.html"')
    html = html.replace('href="du-an.html"', 'href="du-an.html"')
    html = html.replace('href="cong-cu-tinh-quat.html"', 'href="cong-cu-tinh-quat.html"')

    # 3. For san-pham.html, inject the dual price slider
    if dest_file == "san-pham.html":
        # Inject CSS
        html = html.replace('</style>', dual_slider_css + '\n</style>')
        # Inject Slider into sidebar filters
        if '<div class="filter-group">' in html:
            # Insert after the second filter group
            pos = html.find('</div>\n    <div class="filter-group">')
            if pos != -1:
                html = html[:pos+6] + dual_slider_html + html[pos+6:]
        # Inject JS before </body>
        html = html.replace('</body>', dual_slider_js + '\n</body>')

    # 4. Ensure images load with fallback
    html = re.sub(r'<img\s+([^>]*?)>', lambda m: m.group(0) if 'onerror' in m.group(0) else m.group(0)[:-1] + ' onerror="this.src=\'assets/images/km750s.jpg\'">', html)

    # 5. Fix logo text or links
    html = html.replace('<div class="logo">WIN<span>LINE</span></div>', '<a href="index.html" class="logo" style="text-decoration:none;">WIN<span>LINE</span></a>')

    with open(dest_file, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Successfully generated {dest_file} ({len(html)} bytes) from {src_file}")

print("\n--- ALL CUSTOMER DRIVE TEMPLATES ADOPTED 100% ---")
