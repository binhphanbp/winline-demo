import urllib.request
import re
import json

url = "https://drive.google.com/drive/folders/1tIx_uw1HQ2L_c3gyaSr3D5NQVEMQ0IT_?usp=sharing"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

# Search for the filenames in the HTML to find surrounding JSON / arrays
targets = ['about-company.html', 'homepage.html', 'cong-cu-tinh-quat.html', 'du-an-da-trien-khai.html', 'Giải pháp.html', 'Sản phẩm.jpg']

for t in targets:
    idx = 0
    print(f"\n--- Searching for {t} ---")
    while True:
        pos = html.find(t, idx)
        if pos == -1:
            break
        snippet = html[max(0, pos-250):min(len(html), pos+250)]
        print(f"Found at {pos}:")
        print(snippet)
        idx = pos + len(t)
