import os
import shutil
import re

drive_dir = "drive_files"

# Map customer raw names to standard clean names
rename_map = {
    "Sản phẩm": "san-pham.html",
    "Giải pháp.html": "giai-phap.html",
    "Thương hiệu": "thuong-hieu.html",
    "Trang chi tiết sản phẩm": "chi-tiet-san-pham.html",
    "du-an-da-trien-khai.html": "du-an.html",
    "about-company.html": "gioi-thieu.html",
    "homepage.html": "index.html"
}

for src_name, target_name in rename_map.items():
    src_path = os.path.join(drive_dir, src_name)
    target_path = os.path.join(drive_dir, target_name)
    if os.path.exists(src_path):
        shutil.copy2(src_path, target_path)
        print(f"Mapped {src_name} -> {target_path}")

print("\nFiles in drive_files after mapping:")
for f in sorted(os.listdir(drive_dir)):
    p = os.path.join(drive_dir, f)
    print(f"  {f} ({os.path.getsize(p)} bytes)")
