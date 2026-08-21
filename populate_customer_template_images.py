import os
import re

# Map keywords in product names to image files
img_map = {
    "KM-750S": "assets/images/km750s.jpg",
    "KM-750": "assets/images/km750s.jpg",
    "KM-650S": "assets/images/km650s.jpg",
    "KM-650": "assets/images/km650s.jpg",
    "QĐ-650": "assets/images/qd650.jpg",
    "QD-650": "assets/images/qd650.jpg",
    "QĐ-750": "assets/images/qd750.jpg",
    "QD-750": "assets/images/qd750.jpg",
    "TC-750": "assets/images/qd650.jpg",
    "SK-700": "assets/images/ksf3076.jpg",
    "NF-750": "assets/images/dhf750.jpg",
    "KJ-750": "assets/images/dhf650.jpg",
    "DHF-750": "assets/images/dhf750.jpg",
    "DHF-650": "assets/images/dhf650.jpg",
    "KSF-3076": "assets/images/ksf3076.jpg",
    "KSF-2460": "assets/images/ksf2460.jpg",
    "1380": "assets/images/km-vuong-1380.jpg",
    "1845": "assets/images/dasin-kvf1845.jpg",
    "FAG": "assets/images/deton-fag1380.jpg",
    "Cooler": "assets/images/air-cooler-18000.jpg",
    "Cooling Pad": "assets/images/cooling-pad.jpg",
    "Panasonic": "assets/images/panasonic-tran.jpg",
    "Hatari": "assets/images/hatari-ip22m1.jpg",
    "Nedfon": "assets/images/nedfon-noi-ong.jpg",
    "Chinghai": "assets/images/chinghai-w9199.jpg",
    "ly tâm": "assets/images/deton-lytam.jpg",
    "quỳ": "assets/images/dasin-san.jpg",
    "sàn": "assets/images/dasin-san.jpg",
    "treo": "assets/images/km-treo-750.jpg"
}

def get_image_for_card(card_text):
    for kw, img_path in img_map.items():
        if kw.lower() in card_text.lower():
            return img_path
    return "assets/images/km750s.jpg"

html_files = ["san-pham.html", "index.html", "thuong-hieu.html", "chi-tiet-san-pham.html", "du-an.html", "giai-phap.html"]

for fn in html_files:
    if not os.path.exists(fn):
        continue
    with open(fn, "r", encoding="utf-8") as f:
        content = f.read()

    # In chi-tiet-san-pham.html, replace the main image area
    if fn == "chi-tiet-san-pham.html":
        content = re.sub(
            r'<div class="main-img">.*?</div>',
            '<div class="main-img" style="background:#fff; display:flex; align-items:center; justify-content:center; padding:20px; border:1px solid var(--line); border-radius:var(--radius);"><img src="assets/images/km750s.jpg" alt="Quạt Komasu KM-750S" style="max-height:360px; max-width:100%; object-fit:contain;"></div>',
            content,
            flags=re.DOTALL
        )

    # Replace <div class="p-img">...</div> in product cards
    def replace_p_img(match):
        full_match = match.group(0)
        badge_match = re.search(r'<span class="p-badge[^"]*">[^<]+</span>', full_match)
        badge_html = badge_match.group(0) if badge_match else ""
        
        # Determine image
        img = get_image_for_card(full_match)
        return f'<div class="p-img" style="background:#fff; display:flex; align-items:center; justify-content:center; height:180px; position:relative; padding:10px; border-bottom:1px solid #f0f2f5;">{badge_html}<img src="{img}" alt="Sản phẩm" style="max-height:160px; max-width:100%; object-fit:contain; margin:auto;" onerror="this.src=\'assets/images/km750s.jpg\'"></div>'

    content = re.sub(r'<div class="p-img">.*?</div>', replace_p_img, content, flags=re.DOTALL)

    # In index.html, replace category card images or hero thumbnails if any
    content = content.replace('Ảnh sản phẩm thật', '<img src="assets/images/km750s.jpg" alt="Quạt" style="max-height:140px; max-width:100%; object-fit:contain; margin:auto;">')

    # Make .p-name clickable to chi-tiet-san-pham.html
    content = re.sub(
        r'<div class="p-name">([^<]+)</div>',
        r'<div class="p-name"><a href="chi-tiet-san-pham.html" style="color:inherit; text-decoration:none;">\1</a></div>',
        content
    )

    with open(fn, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated images and links in {fn}")

print("Image injection into customer templates complete.")
