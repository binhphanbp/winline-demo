import urllib.request
import json
import os
import re

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

def fetch(url, dest):
    if url.startswith("//"): url = "https:" + url
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as r, open(dest, "wb") as f:
            f.write(r.read())
        print(f"Saved {dest} ({os.path.getsize(dest)} bytes)")
        return True
    except Exception as e:
        print(f"Error {dest}: {e}")
        return False

os.makedirs("assets/images/brands", exist_ok=True)
os.makedirs("assets/images/products", exist_ok=True)

# 1. Search and download high resolution product images for real fans on winline.vn
product_searches = {
    "km750s.jpg": "quat cay komasu km750",
    "km650s.jpg": "quat cay komasu km650",
    "qd650.jpg": "quat dung vinawind qd650",
    "qd750.jpg": "quat dung vinawind qd750",
    "dhf750.jpg": "quat dung deton dhf750",
    "dhf650.jpg": "quat dung deton dhf650",
    "ksf3076.jpg": "quat dasin ksf 3076",
    "ksf2460.jpg": "quat dasin ksf 2460",
    "km-vuong-1380.jpg": "quat thong gio vuong 1380",
    "km-treo-750.jpg": "quat treo komasu 750",
    "air-cooler-18000.jpg": "may lam mat cong nghiep 18000",
    "cooling-pad.jpg": "tam lam mat cooling pad",
    "panasonic-tran.jpg": "quat tran panasonic",
    "hatari-ip22m1.jpg": "quat hatari ip22m1",
    "nedfon-noi-ong.jpg": "quat noi ong nedfon",
    "chinghai-w9199.jpg": "quat chinghai",
    "deton-lytam.jpg": "quat ly tam deton",
    "dasin-san.jpg": "quat san dasin"
}

for filename, query in product_searches.items():
    dest = os.path.join("assets/images", filename)
    search_url = f"https://winline.vn/search?q={urllib.parse.quote(query)}&view=json"
    try:
        req = urllib.request.Request(search_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            results = data.get("results", [])
            if results and results[0].get("thumbnail"):
                thumb = results[0]["thumbnail"]
                thumb_large = thumb.replace("/thumb/compact/", "/thumb/1024x1024/").replace("/thumb/small/", "/thumb/1024x1024/")
                success = fetch(thumb_large, dest)
                if not success:
                    fetch(thumb, dest)
    except Exception as e:
        print(f"Search failed for {query}: {e}")

print("Asset enrichment finished.")
