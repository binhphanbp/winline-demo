import urllib.request
import os
import json

skills = [
    {
        "name": "frontend-ui-engineering",
        "url": "https://raw.githubusercontent.com/addyosmani/agent-skills/main/skills/frontend-ui-engineering/SKILL.md",
        "desc": "Component architecture, design systems, state management, responsive design, and WCAG accessibility"
    },
    {
        "name": "ui-design",
        "url": "https://raw.githubusercontent.com/mblode/agent-skills/main/skills/ui-design/SKILL.md",
        "desc": "Production-grade UI design guidelines: layout, typography, cards, buttons, color harmony, and responsiveness"
    },
    {
        "name": "ui-animation",
        "url": "https://raw.githubusercontent.com/mblode/agent-skills/main/skills/ui-animation/SKILL.md",
        "desc": "Micro-interactions, transform/opacity animations, easing curves, and UI motion choreography"
    },
    {
        "name": "typography-audit",
        "url": "https://raw.githubusercontent.com/mblode/agent-skills/main/skills/typography-audit/SKILL.md",
        "desc": "Typography hierarchy, readable scale, letter-spacing, and line-height audit"
    },
    {
        "name": "tailwind-design-system",
        "url": "https://raw.githubusercontent.com/wshobson/agents/main/plugins/frontend-mobile-development/skills/tailwind-design-system/SKILL.md",
        "desc": "Tailwind CSS design system rules, utility tokens, and component patterns"
    }
]

headers = {"User-Agent": "Mozilla/5.0"}

base_dir = os.path.join(".agents", "skills")
os.makedirs(base_dir, exist_ok=True)

for s in skills:
    s_dir = os.path.join(base_dir, s["name"])
    os.makedirs(s_dir, exist_ok=True)
    target_file = os.path.join(s_dir, "SKILL.md")
    
    print(f"Downloading {s['name']} ...")
    try:
        req = urllib.request.Request(s["url"], headers=headers)
        with urllib.request.urlopen(req, timeout=12) as resp:
            content = resp.read().decode("utf-8")
            with open(target_file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"  INSTALLED {s['name']} -> {target_file} ({len(content)} bytes)")
    except Exception as e:
        print(f"  Error {s['name']}: {e}")

print("\nInstalled Skills List in .agents/skills:")
for item in os.listdir(base_dir):
    p = os.path.join(base_dir, item, "SKILL.md")
    if os.path.exists(p):
        print(f"  - {item} ({os.path.getsize(p)} bytes)")
