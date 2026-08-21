import urllib.request
import re
import json

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

def fetch(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

# Fetch categories and products
html = fetch("https://winline.vn/")

# Parse product items
items = []
product_boxes = re.findall(r'<div class="item-product[^"]*">(.*?)</div>\s*</div>\s*</div>', html, re.DOTALL)
if not product_boxes:
    # try other product class
    product_boxes = re.findall(r'<div class="[^"]*product-box[^"]*">(.*?)</div>\s*</div>', html, re.DOTALL)

print(f"Product boxes count: {len(product_boxes)}")

# Extract links and images from winline
raw_products = re.findall(r'<a\s+href="([^"]+)"\s+title="([^"]+)"[^>]*>.*?<img[^>]+src="([^"]+)"', html, re.DOTALL)
print(f"Raw product links: {len(raw_products)}")

results = []
for href, title, img in raw_products:
    if "logo" in img or "banner" in img or len(title) < 5:
        continue
    if img.startswith("//"):
        img = "https:" + img
    results.append({
        "url": "https://winline.vn" + href if href.startswith("/") else href,
        "title": title.strip(),
        "image": img
    })

# Also fetch category pages: quat-cong-nghiep, quat-thong-gio, quat-dan-dung
cat_urls = [
    "https://winline.vn/quat-cong-nghiep.html",
    "https://winline.vn/quat-cay-cong-nghiep.html",
    "https://winline.vn/quat-thong-gio-cong-nghiep.html",
    "https://winline.vn/quat-treo-tuong-cong-nghiep.html"
]

for curl in cat_urls:
    chtml = fetch(curl)
    cproducts = re.findall(r'<a\s+href="([^"]+)"\s+title="([^"]+)"[^>]*>.*?<img[^>]+data-src="([^"]+)"|<a\s+href="([^"]+)"\s+title="([^"]+)"[^>]*>.*?<img[^>]+src="([^"]+)"', chtml, re.DOTALL)
    print(f"Category {curl} found: {len(cproducts)}")
    for match in cproducts:
        href = match[0] or match[3]
        title = match[1] or match[4]
        img = match[2] or match[5]
        if title and img and "logo" not in img and "banner" not in img and len(title) > 6:
            if img.startswith("//"):
                img = "https:" + img
            results.append({
                "url": "https://winline.vn" + href if href.startswith("/") else href,
                "title": title.strip(),
                "image": img
            })

# Deduplicate
seen = set()
unique_products = []
for p in results:
    if p["title"] not in seen:
        seen.add(p["title"])
        unique_products.append(p)

print(f"Total unique products: {len(unique_products)}")
with open("winline_products.json", "w", encoding="utf-8") as f:
    json.dump(unique_products[:40], f, ensure_ascii=False, indent=2)

print("Saved sample products to winline_products.json")
