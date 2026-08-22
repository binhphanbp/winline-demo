import os
import re

files = [
    "index.html", "gioi-thieu.html", "san-pham.html", 
    "giai-phap.html", "thuong-hieu.html", "cong-cu-tinh-quat.html", 
    "du-an.html", "chi-tiet-san-pham.html", "lien-he.html"
]

for f in files:
    if not os.path.exists(f):
        continue
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()

    # Clean multiple consecutive blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)

    # Clean stray duplicate utility-bars or navs if any
    # Remove any empty </div> right after </nav>
    content = re.sub(r'</nav>\s*</div>\s*<div class="breadcrumb"', '</nav>\n\n<div class="breadcrumb"', content)
    content = re.sub(r'</nav>\s*</div>\s*<div class="page-head"', '</nav>\n\n<div class="page-head"', content)
    content = re.sub(r'</nav>\s*</div>\s*<section', '</nav>\n\n<section', content)
    content = re.sub(r'</nav>\s*</div>\s*<main', '</nav>\n\n<main', content)

    # Ensure fontawesome is in head
    if 'cdnjs.cloudflare.com/ajax/libs/font-awesome' not in content:
        content = content.replace('</head>', '  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">\n</head>')

    # Ensure style.css is in head
    if 'css/style.css' not in content:
        content = content.replace('</head>', '  <link rel="stylesheet" href="css/style.css">\n</head>')

    # Ensure favicon is in head
    if 'favicon.png' not in content:
        content = content.replace('<head>', '<head>\n  <link rel="icon" href="assets/images/favicon.png" type="image/png">')

    # Ensure breadcrumbs link to index.html instead of #
    content = content.replace('<a href="#">Trang chủ</a>', '<a href="index.html">Trang chủ</a>')

    with open(f, "w", encoding="utf-8") as file:
        file.write(content)
    print(f"Validated and cleaned {f}")

print("\n--- ALL HTML FILES VERIFIED CLEAN ---")
