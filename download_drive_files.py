import urllib.request
import re
import os

url = "https://drive.google.com/drive/folders/1tIx_uw1HQ2L_c3gyaSr3D5NQVEMQ0IT_?usp=sharing"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
with urllib.request.urlopen(req, timeout=15) as resp:
    html = resp.read().decode("utf-8", errors="ignore")

# Find data-id and data-tooltip
matches = re.findall(r'data-id="([a-zA-Z0-9_\-]{20,})"[^>]*data-tooltip="([^"]+)"', html)
print(f"Found matches: {len(matches)}")
for m in matches:
    print(m)

os.makedirs("drive_files", exist_ok=True)

# Also let us search for all data-id occurrences
all_data_ids = re.findall(r'data-id="([a-zA-Z0-9_\-]{20,})"', html)
print("All data IDs:", set(all_data_ids))

for file_id, raw_name in matches:
    # Clean up name (e.g., 'Giải pháp.html HTML' -> 'Giải pháp.html')
    clean_name = raw_name.rsplit(" ", 1)[0] if (" HTML" in raw_name or " Image" in raw_name or " PDF" in raw_name) else raw_name
    print(f"\nProcessing ID: {file_id} -> {clean_name}")
    
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
    try:
        req = urllib.request.Request(download_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            out_path = os.path.join("drive_files", clean_name)
            with open(out_path, "wb") as f:
                f.write(data)
            print(f"  SUCCESS! Saved {out_path} ({len(data)} bytes)")
    except Exception as e:
        print(f"  Error downloading {clean_name}: {e}")
