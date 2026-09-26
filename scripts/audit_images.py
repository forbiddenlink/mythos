import os, json, glob
from collections import defaultdict

from _repo_paths import DATA_DIR, WEB_PUBLIC

data_dir = str(DATA_DIR)
json_files = glob.glob(os.path.join(data_dir, "*.json"))

image_usage = defaultdict(list)
fields = ["imageUrl", "image", "iconUrl", "icon", "coverImage", "coverImageUrl"]

for fp in json_files:
    cat = os.path.basename(fp).split(".")[0]
    try:
        with open(fp) as f:
            data = json.load(f)
    except: continue
    if not isinstance(data, list): continue
    for item in data:
        if not isinstance(item, dict): continue
        cid = item.get("id", "UNK")
        for f in fields:
            if item.get(f):
                img = item[f]
                image_usage[img.lower()].append(f"{cat}:{cid}:{f}")

duplicates = {k: v for k, v in image_usage.items() if len(v) > 1}

print("Duplicate image analysis complete.")
if duplicates:
    for k, v in duplicates.items():
        print(f"DUP: {k} used by {len(v)} times:")
        for x in v:
            print(f"  - {x}")
else:
    print("No duplicates found.")
