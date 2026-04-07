import os
import json
import hashlib

data_dir = "/Volumes/LizsDisk/mythos/apps/web/src/data"
public_dir = "/Volumes/LizsDisk/mythos/apps/web/public"

placeholders = {
    "a351188eb76973ab1e0a27ca2d9dfad8",
    "9a12f34ec4b9cf62e2f1cb4eb05a8e05", 
    "0168f6adb8c0d2940a3bdce6f4dd769e"
}

files_to_check = ["locations.json", "stories.json", "branching-stories.json", "journeys.json", "creatures.json", "artifacts.json"]

queue = []

def get_hash(url):
    clean_url = url.lstrip("/")
    full_path = os.path.join(public_dir, clean_url)
    if not os.path.exists(full_path):
        return None
    with open(full_path, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()

def needs_generation(url):
    h = get_hash(url)
    if h is None or h in placeholders:
        return True
    return False

# Recheck all types
for file_name in files_to_check:
    file_path = os.path.join(data_dir, file_name)
    if not os.path.exists(file_path):
        continue
    with open(file_path) as f:
        data = json.load(f)
    for item in data:
        if "imageUrl" in item and needs_generation(item["imageUrl"]):
            name = item.get("name", item.get("title", item["id"]))
            desc = item.get("shortDescription", item.get("description", item.get("summary", item.get("content", ""))))
            kind = file_name.replace(".json", "")
            
            prompt = f"Professional, beautiful, and dramatic illustration of the mythological {kind} {name}. {desc[:200]}. Epic scene, highly detailed, dark mode friendly, dynamic lighting, no text."
            queue.append({"type": kind, "id": item["id"], "url": item["imageUrl"], "prompt": prompt})

print(f"Total remaining: {len(queue)}")
for item in queue[:5]:
    print(f"Next: {item['id']}")
    print(item['prompt'].replace('\n', ' '))
    print("---")

with open("/tmp/queue_phase2.txt", "w") as f:
    for item in queue:
        f.write(f"{item['type']}|{item['id']}|{item['url']}|{item['prompt'].replace(chr(10), ' ')}\n")
