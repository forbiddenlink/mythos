import os, json, glob
from collections import defaultdict

data_dir = "/Volumes/LizsDisk/mythos/apps/web/src/data"
public_dir = "/Volumes/LizsDisk/mythos/apps/web/public"
json_files = glob.glob(os.path.join(data_dir, "*.json"))

missing = []
missing_on_disk = []
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
        
        has_img = False
        for f in fields:
            if item.get(f):
                has_img = True
                val = item[f]
                if val.startswith("/"):
                    # Check if actual file exists
                    local_path = os.path.join(public_dir, val.lstrip("/"))
                    if not os.path.exists(local_path):
                        missing_on_disk.append(f"{cat}:{cid}:{f} -> {val}")
        
        if not has_img:
            # We skip files like relationships, events, and tours where images are maybe not expected?
            if cat not in ["relationships", "events", "tours", "mythology-facts"]:
                missing.append(f"{cat}:{cid}")

print("Items completely missing images:")
for m in missing:
    print(f"  - {m}")

print("\nLinked images that don't exist on disk:")
for m in missing_on_disk:
    print(f"  - {m}")
