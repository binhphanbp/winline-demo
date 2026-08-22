import re
import os

files_nav_map = {
    "index.html": "home",
    "gioi-thieu.html": "about",
    "san-pham.html": "products",
    "giai-phap.html": "solutions",
    "thuong-hieu.html": "brands",
    "cong-cu-tinh-quat.html": "calc",
    "du-an.html": "projects",
    "chi-tiet-san-pham.html": "products"
}

def get_header_html():
    return """<div class="utility-bar">
  <div class="wrap">
    <div>Công ty TNHH Winline Việt Nam — MST: <b>0106085370</b> (Sở KH&amp;ĐT TP Hà Nội cấp 15/01/2013)</div>
    <div><a href="gioi-thieu.html">Hồ sơ năng lực</a><span class="sep">|</span><a href="tel:0949761893">Hotline: 0949.761.893</a></div>
  </div>
</div>

<header class="site">
  <div class="header-inner">
    <a href="index.html" class="site-logo-wrap">
      <img src="assets/images/logo.png" alt="Winline.vn" class="site-logo-img" onerror="this.style.display='none'">
      <div class="logo">WIN<span>LINE</span></div>
    </a>

    <div class="search-wrap">
      <input type="search" class="search-box header-search-input" placeholder="Tìm theo tên sản phẩm, mã model (KM-750S, 1380, Vinawind, Deton...)...">
      <button class="search-btn" aria-label="Tìm kiếm"><i class="fas fa-search"></i></button>
    </div>

    <div class="header-actions">
      <button class="header-action-btn" onclick="openCartDrawer()">
        <i class="fas fa-shopping-cart" style="color: var(--orange);"></i>
        <span>Giỏ hàng</span>
        <span class="cart-badge-count" style="display:none;">0</span>
      </button>
      <button class="nav-toggle-btn" id="mobile-nav-toggle" aria-label="Menu"><i class="fas fa-bars"></i></button>
    </div>
  </div>
</header>"""

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

def get_footer_html():
    return """<footer class="site-footer">
  <div class="footer-inner">
    <div>
      <h4 style="color:#fff; font-size:15px; margin-bottom:12px;">Công ty TNHH Winline Việt Nam</h4>
      <p>Mã số thuế: <b>0106085370</b> do Sở KH&amp;ĐT TP Hà Nội cấp ngày 15/01/2013.</p>
      <p>Showroom: Số 17 Ngõ 46 Quan Nhân, Phường Thanh Xuân, TP. Hà Nội.</p>
      <p>Trụ sở: Số 7 BT6 KĐT Pháp Vân - Tứ Hiệp, P. Hoàng Liệt, Q. Hoàng Mai, Hà Nội.</p>
      <p>Hotline: <b>0949.761.893</b> — Tổng đài kỹ thuật: <b>1900 099 806</b></p>
    </div>

    <div>
      <h4>Sản Phẩm &amp; Danh Mục</h4>
      <a href="san-pham.html">Quạt cây công nghiệp</a>
      <a href="san-pham.html">Quạt treo tường công nghiệp</a>
      <a href="san-pham.html">Quạt thông gió vuông 1380</a>
      <a href="san-pham.html">Quạt ly tâm &amp; hướng trục</a>
      <a href="san-pham.html">Máy làm mát Air Cooler</a>
    </div>

    <div>
      <h4>Thương Hiệu Phân Phối</h4>
      <a href="thuong-hieu.html">Komasu Nhật Bản</a>
      <a href="thuong-hieu.html">Vinawind (Điện cơ Thống Nhất)</a>
      <a href="thuong-hieu.html">Deton chính hãng</a>
      <a href="thuong-hieu.html">Dasin Đài Loan</a>
      <a href="thuong-hieu.html">Chinghai &amp; Hatari</a>
    </div>

    <div>
      <h4>Chính Sách &amp; Hỗ Trợ</h4>
      <a href="gioi-thieu.html">Hồ sơ năng lực Winline</a>
      <a href="cong-cu-tinh-quat.html">Công cụ tính lưu lượng HVAC</a>
      <a href="du-an.html">Dự án đã triển khai</a>
      <a href="lien-he.html">Chính sách bảo hành 24 tháng</a>
      <a href="lien-he.html">Hỗ trợ xuất hóa đơn VAT</a>
    </div>
  </div>

  <div class="footer-bottom">
    <div>© 2013 - 2026 Winline.vn — Đại lý phân phối quạt công nghiệp và thiết bị thông gió hàng đầu Việt Nam.</div>
    <div>Bảo lưu mọi quyền.</div>
  </div>
</footer>"""

def get_mobile_bar_html(active_tag):
    return f"""<div class="mobile-floating-bar">
  <div class="mobile-floating-inner">
    <a href="index.html" class="mobile-action-item {'active' if active_tag == 'home' else ''}">
      <div class="m-icon home"><i class="fas fa-home"></i></div>
      <span>Trang chủ</span>
    </a>
    <a href="cong-cu-tinh-quat.html" class="mobile-action-item {'active' if active_tag == 'calc' else ''}">
      <div class="m-icon calc"><i class="fas fa-calculator"></i></div>
      <span>Tính quạt</span>
    </a>
    <a href="https://zalo.me/0949761893" target="_blank" class="mobile-action-item">
      <div class="m-icon zalo"><i class="fas fa-comment-dots"></i></div>
      <span>Zalo</span>
    </a>
    <a href="tel:0949761893" class="mobile-action-item">
      <div class="m-icon call"><i class="fas fa-phone-alt"></i></div>
      <span>Gọi ngay</span>
    </a>
  </div>
</div>"""

for fn, active_tag in files_nav_map.items():
    if not os.path.exists(fn):
        continue
    with open(fn, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Ensure <head> links css/style.css and font-awesome
    if 'href="css/style.css"' not in content:
        content = content.replace('</head>', '  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">\n  <link rel="stylesheet" href="css/style.css">\n</head>')

    if 'assets/images/favicon.png' not in content and '<head>' in content:
        content = content.replace('<head>', '<head>\n  <link rel="icon" href="assets/images/favicon.png" type="image/png">')

    # 2. Replace Header
    header_pattern = re.compile(r'(<div class="utility-bar">.*?)(<main|<section|\s*<div class="breadcrumb"|\s*<div class="page-head"|\s*<div class="listing")', re.DOTALL)
    # Better approach: Replace .utility-bar, header.site and nav.catnav
    content = re.sub(r'<div class="utility-bar">.*?</div>\s*</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'<header class="site">.*?</header>', '', content, flags=re.DOTALL)
    content = re.sub(r'<nav class="catnav">.*?</nav>', '', content, flags=re.DOTALL)
    
    # Insert unified Header and Nav at start of body
    body_pos = content.find('<body>')
    if body_pos != -1:
        content = content[:body_pos+6] + '\n' + get_header_html() + '\n' + get_nav_html(active_tag) + '\n' + content[body_pos+6:]

    # 3. Replace Footer
    content = re.sub(r'<footer.*?>.*?</footer>', get_footer_html(), content, flags=re.DOTALL)

    # 4. Remove redundant mobile-sticky
    content = re.sub(r'<div class="mobile-sticky">.*?</div>\s*</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'<div class="mobile-sticky">.*?</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'<div class="menu-sheet-overlay".*?</div>\s*</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'<div class="mobile-floating-bar">.*?</div>\s*</div>', '', content, flags=re.DOTALL)
    content = re.sub(r'<div class="mobile-floating-bar">.*?</div>', '', content, flags=re.DOTALL)

    # Add single mobile floating bar
    mobile_bar = get_mobile_bar_html(active_tag)
    
    # 5. Ensure scripts at bottom
    scripts = """
<script src="js/products-data.js"></script>
<script src="js/app.js"></script>
"""
    if fn in ["san-pham.html", "thuong-hieu.html"]:
        scripts += '<script src="js/filter.js"></script>\n'
    elif fn == "cong-cu-tinh-quat.html":
        scripts += '<script src="js/calculator.js"></script>\n'

    # Remove old duplicate bottom script blocks if any
    content = re.sub(r'<script src="js/products-data.js"></script>', '', content)
    content = re.sub(r'<script src="js/app.js"></script>', '', content)
    content = re.sub(r'<script src="js/filter.js"></script>', '', content)
    content = re.sub(r'<script src="js/calculator.js"></script>', '', content)

    # Clean up before </body>
    content = content.replace('</body>', mobile_bar + '\n' + scripts + '\n</body>')

    with open(fn, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Applied unified UX/UI polish to {fn}")

print("\n--- ALL PAGES SYSTEMATICALLY POLISHED & UNIFIED ---")
