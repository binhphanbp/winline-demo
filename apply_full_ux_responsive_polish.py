import os
import re

# Comprehensive Responsive & UX/UI CSS enhancements to inject into all pages
common_ux_css = """
/* ==========================================================================
   ENHANCED RESPONSIVE & UX/UI ADDITIONS
   ========================================================================== */

/* Logo styling */
.site-logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.site-logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
  display: block;
}

/* Mobile Nav Toggle Button */
.nav-toggle-btn {
  display: none;
  background: none;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--ink);
  font-size: 20px;
  padding: 6px 12px;
  cursor: pointer;
}

/* Mobile Bottom Floating Bar */
.mobile-floating-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid var(--line);
  box-shadow: 0 -4px 15px rgba(0,0,0,0.08);
  z-index: 999;
  padding: 8px 12px;
}
.mobile-floating-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}
.mobile-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  gap: 3px;
}
.mobile-action-item .m-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
}
.m-icon.call { background: var(--orange); }
.m-icon.zalo { background: #0068ff; }
.m-icon.calc { background: #eab308; }
.m-icon.home { background: var(--navy-800); }

/* Responsive Media Queries */
@media (max-width: 900px) {
  .nav-toggle-btn {
    display: block;
  }
  .catnav {
    display: none;
  }
  .catnav.show-mobile {
    display: block;
    background: var(--navy-950);
  }
  .catnav.show-mobile .catnav-inner {
    flex-direction: column;
    align-items: stretch;
    padding: 10px 15px;
    gap: 2px;
  }
  .catnav.show-mobile .nav-top {
    padding: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .catnav.show-mobile .nav-panel {
    position: static;
    display: block;
    box-shadow: none;
    background: rgba(255,255,255,0.05);
    border: none;
    padding: 8px 15px;
  }
  .catnav.show-mobile .nav-panel a {
    color: #cbd5e1;
    padding: 6px 0;
  }
  .catnav.show-mobile .nav-panel-wide {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .header-inner {
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .search-wrap {
    order: 3;
    width: 100%;
    margin-top: 10px;
  }
  
  .listing {
    grid-template-columns: 1fr !important;
  }
  .mobile-filter-btn {
    display: block !important;
    width: 100%;
    background: #fff;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 10px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 15px;
    cursor: pointer;
  }
  .filters {
    display: none;
  }
  .filters.show-mobile-filter {
    display: block !important;
    margin-bottom: 20px;
  }

  .mobile-floating-bar {
    display: block;
  }
  body {
    padding-bottom: 60px;
  }
}
"""

# Common Mobile Floating Bar HTML
mobile_bar_html = """
<div class="mobile-floating-bar">
  <div class="mobile-floating-inner">
    <a href="index.html" class="mobile-action-item">
      <div class="m-icon home">🏠</div>
      <span>Trang chủ</span>
    </a>
    <a href="cong-cu-tinh-quat.html" class="mobile-action-item">
      <div class="m-icon calc">🧮</div>
      <span>Tính quạt</span>
    </a>
    <a href="https://zalo.me/0949761893" target="_blank" class="mobile-action-item">
      <div class="m-icon zalo">💬</div>
      <span>Zalo</span>
    </a>
    <a href="tel:0949761893" class="mobile-action-item">
      <div class="m-icon call">📞</div>
      <span>Gọi ngay</span>
    </a>
  </div>
</div>
"""

# Common Mobile Toggle JS
common_js = """
<script>
document.addEventListener("DOMContentLoaded", function() {
  // Mobile Nav Toggle
  const toggleBtn = document.getElementById("mobile-nav-toggle");
  const catNav = document.querySelector(".catnav");
  if (toggleBtn && catNav) {
    toggleBtn.addEventListener("click", function() {
      catNav.classList.toggle("show-mobile");
    });
  }

  // Mobile Filter Toggle on san-pham.html
  const filterBtn = document.getElementById("btn-toggle-filters");
  const filtersSection = document.getElementById("filtersSection");
  if (filterBtn && filtersSection) {
    filterBtn.addEventListener("click", function() {
      filtersSection.classList.toggle("show-mobile-filter");
      filterBtn.textContent = filtersSection.classList.contains("show-mobile-filter") ? "✕ Đóng bộ lọc" : "☰ Mở bộ lọc sản phẩm";
    });
  }
});
</script>
"""

pages = [
    "index.html",
    "gioi-thieu.html",
    "san-pham.html",
    "chi-tiet-san-pham.html",
    "giai-phap.html",
    "thuong-hieu.html",
    "cong-cu-tinh-quat.html",
    "du-an.html"
]

for filename in pages:
    if not os.path.exists(filename):
        continue
    with open(filename, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Inject CSS before </style>
    if "/* ==========================================================================\n   ENHANCED RESPONSIVE & UX/UI ADDITIONS" not in html:
        html = html.replace("</style>", common_ux_css + "\n</style>")

    # 2. Add Mobile Toggle button to Header
    if 'id="mobile-nav-toggle"' not in html:
        html = re.sub(
            r'(<div class="header-actions">)',
            r'<button id="mobile-nav-toggle" class="nav-toggle-btn" aria-label="Mở menu">☰</button>\n      \1',
            html
        )

    # 3. Add Logo image alongside/in place of plain text logo
    html = re.sub(
        r'<div class="logo">WIN<span>LINE</span></div>|<a href="index.html" class="logo"[^>]*>WIN<span>LINE</span></a>',
        r'<a href="index.html" class="site-logo-wrap"><img src="assets/images/logo.png" alt="Winline.vn" class="site-logo-img"><div class="logo" style="margin:0;">WIN<span>LINE</span></div></a>',
        html
    )

    # 4. On san-pham.html, add mobile filter toggle button
    if filename == "san-pham.html" and 'id="btn-toggle-filters"' not in html:
        html = html.replace(
            '<div class="listing">',
            '<button id="btn-toggle-filters" class="mobile-filter-btn" style="display:none;">☰ Mở bộ lọc sản phẩm</button>\n<div class="listing">'
        )

    # 5. Inject Mobile Floating Bar before </body>
    if '<div class="mobile-floating-bar">' not in html:
        html = html.replace("</body>", mobile_bar_html + "\n" + common_js + "\n</body>")

    with open(filename, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Polished {filename}")

print("\n--- RESPONSIVE & UX/UI POLISH COMPLETED ---")
