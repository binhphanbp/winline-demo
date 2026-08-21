import urllib.request
import json
import os

headers = {"User-Agent": "Mozilla/5.0"}

def get_repo_tree(owner_repo):
    url = f"https://api.github.com/repos/{owner_repo}/git/trees/main?recursive=1"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8"))
            return [item["path"] for item in data.get("tree", []) if "SKILL.md" in item["path"] or "skill" in item["path"].lower()]
    except Exception as e:
        print(f"Error tree for {owner_repo}: {e}")
        return []

repos = [
    "nextlevelbuilder/ui-ux-pro-max-skill",
    "pbakaus/impeccable",
    "wshobson/agents",
    "addyosmani/agent-skills",
    "mblode/agent-skills"
]

for r in repos:
    tree = get_repo_tree(r)
    print(f"\nRepo {r}:")
    for item in tree:
        print(f"  {item}")
