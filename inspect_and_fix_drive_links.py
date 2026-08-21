import os
import re

drive_dir = "drive_files"

html_files = [
    "index.html",
    "homepage.html",
    "san-pham.html",
    "gioi-thieu.html",
    "about-company.html",
    "giai-phap.html",
    "thuong-hieu.html",
    "cong-cu-tinh-quat.html",
    "du-an.html",
    "du-an-da-trien-khai.html",
    "chi-tiet-san-pham.html"
]

for filename in html_files:
    path = os.path.join(drive_dir, filename)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # Link mappings so navigation works smoothly
    content = content.replace('href="homepage.html"', 'href="homepage.html"')
    content = content.replace('href="about-company.html"', 'href="about-company.html"')
    content = content.replace('href="Giải pháp.html"', 'href="giai-phap.html"')
    content = content.replace('href="Thương hiệu"', 'href="thuong-hieu.html"')
    content = content.replace('href="Sản phẩm"', 'href="san-pham.html"')
    content = content.replace('href="Trang chi tiết sản phẩm"', 'href="chi-tiet-san-pham.html"')
    content = content.replace('href="du-an-da-trien-khai.html"', 'href="du-an-da-trien-khai.html"')
    
    # Ensure image onerror fallback
    content = re.sub(r'<img\s+([^>]*?)>', lambda m: m.group(0) if 'onerror' in m.group(0) else m.group(0)[:-1] + ' onerror="this.src=\'../assets/images/km750s.jpg\'">', content)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated links in {path}")
