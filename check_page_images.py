import re
import os

files = ["index.html", "gioi-thieu.html", "san-pham.html", "giai-phap.html", "thuong-hieu.html", "cong-cu-tinh-quat.html", "du-an.html", "chi-tiet-san-pham.html"]

for f in files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    img_srcs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content)
    print(f"\nImages in {f} ({len(img_srcs)} found):")
    for s in set(img_srcs):
        exists = os.path.exists(s) or s.startswith("http") or s.startswith("data:")
        print(f"  {s} -> {'EXISTS' if exists else 'NOT FOUND'}")
