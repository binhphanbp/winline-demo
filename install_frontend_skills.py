import urllib.request
import os
import json

skills_to_fetch = [
    {
        "name": "ui-ux-pro-max",
        "url": "https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/SKILL.md"
    },
    {
        "name": "frontend-design",
        "url": "https://raw.githubusercontent.com/pbakaus/impeccable/main/skills/frontend-design/SKILL.md"
    },
    {
        "name": "frontend-ui-engineering",
        "url": "https://raw.githubusercontent.com/addyosmani/agent-skills/main/skills/frontend-ui-engineering/SKILL.md"
    },
    {
        "name": "tailwind-design-system",
        "url": "https://raw.githubusercontent.com/wshobson/agents/main/skills/tailwind-design-system/SKILL.md"
    }
]

headers = {"User-Agent": "Mozilla/5.0"}

for skill in skills_to_fetch:
    target_dir = os.path.join(".agents", "skills", skill["name"])
    os.makedirs(target_dir, exist_ok=True)
    target_file = os.path.join(target_dir, "SKILL.md")
    
    print(f"Fetching {skill['name']} from {skill['url']} ...")
    try:
        req = urllib.request.Request(skill["url"], headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode("utf-8")
            with open(target_file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"  SUCCESS: Installed {skill['name']} ({len(content)} bytes)")
    except Exception as e:
        print(f"  Failed direct fetch for {skill['name']}: {e}")
        # Try finding raw github repo content
        # If specific path failed, search repo tree
