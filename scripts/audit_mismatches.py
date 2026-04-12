import os, json, glob
data_dir = "/Volumes/LizsDisk/mythos/apps/web/src/data"
json_files = glob.glob(os.path.join(data_dir, "*.json"))

fields = ["imageUrl", "image", "iconUrl", "icon", "coverImage", "coverImageUrl"]
mismatches = []

for fp in json_files:
    cat = os.path.basename(fp).split(".")[0]
    try:
        with open(fp) as f:
            data = json.load(f)
    except: continue
    if not isinstance(data, list): continue
    for item in data:
        if not isinstance(item, dict): continue
        cid = item.get("id", "")
        for f in fields:
            if item.get(f):
                val = item[f]
                if val.startswith("/"): # it's a file
                    basename = os.path.basename(val).split(".")[0] # remove extension
                    # Basic check: is the cid generally matching the basename?
                    # Allowing for underscores instead of hyphens
                    cid_norm = cid.replace('-', '_').lower()
                    base_norm = basename.replace('-', '_').lower()
                    if cid_norm != base_norm:
                        # Sometimes image has _1234 on it... check if it starts with it
                        if not base_norm.startswith(cid_norm):
                            mismatches.append(f"{cat}:{cid} has image {val}")

print(f"Total Mismatches Found: {len(mismatches)}")
for m in mismatches:
    print(" - " + m)
