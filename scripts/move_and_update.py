import os
import glob
import json
import shutil

from _repo_paths import DATA_DIR, WEB_PUBLIC

# Folders where an external AI image tool saved its renders. They were once
# hard-coded to one developer's machine; pass them through the environment.
artifact_dir = os.environ.get("MYTHOS_AI_RENDER_DIR", "")
fallback_dir = os.environ.get("MYTHOS_AI_RENDER_FALLBACK_DIR", artifact_dir)
public_path = str(WEB_PUBLIC)
data_dir = str(DATA_DIR)

if not artifact_dir:
    print("Set MYTHOS_AI_RENDER_DIR to the folder holding generated renders.")
    exit(1)

queue_file = "/tmp/queue_phase2.txt"

if not os.path.exists(queue_file):
    print("Queue empty")
    exit(0)

with open(queue_file, "r") as f:
    lines = f.readlines()

new_queue = []
moved_count = 0
data_cache = {}

for line in lines:
    line = line.strip()
    if not line: continue
    
    parts = line.split("|")
    ctype, cid, curl, cprompt = parts

    cid_safe = cid.replace('-', '_')
    png_files = glob.glob(os.path.join(artifact_dir, f"*{cid_safe}*.png"))
    if not png_files:
        png_files = glob.glob(os.path.join(fallback_dir, "**", f"*{cid_safe}*.png"), recursive=True)
    
    if len(png_files) > 0:
        file_path = png_files[0]
        # move it
        target_dir = os.path.join(public_path, ctype)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            
        target_file = os.path.join(target_dir, f"{cid}.png")
        shutil.move(file_path, target_file)
        print(f"Moved {file_path} -> {target_file}")
        moved_count += 1
        
        json_file = os.path.join(data_dir, f"{ctype}.json")
        if json_file not in data_cache:
            with open(json_file, "r") as f:
                data_cache[json_file] = json.load(f)
                
        data = data_cache[json_file]
        for item in data:
            if item.get("id") == cid:
                if "imageUrl" in item: item["imageUrl"] = f"/{ctype}/{cid}.png"
                elif "image" in item: item["image"] = f"/{ctype}/{cid}.png"
                elif "iconUrl" in item: item["iconUrl"] = f"/{ctype}/{cid}.png"
                elif "icon" in item: item["icon"] = f"/{ctype}/{cid}.png"
                elif "coverImage" in item: item["coverImage"] = f"/{ctype}/{cid}.png"
                elif "coverImageUrl" in item: item["coverImageUrl"] = f"/{ctype}/{cid}.png"
    else:
        new_queue.append(line)

for jf, jdata in data_cache.items():
    with open(jf, "w") as f:
        json.dump(jdata, f, indent=2)
    print(f"Updated {os.path.basename(jf)}")

with open(queue_file, "w") as f:
    for nq in new_queue:
        f.write(nq + "\n")

print(f"Total moved this batch: {moved_count}")
print(f"Remaining to generate: {len(new_queue)}")
