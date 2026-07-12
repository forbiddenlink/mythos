import os
import json
import hashlib
import sys
import time
import urllib.request
import urllib.error

data_dir = "/Volumes/LizsDisk/mythos/apps/web/src/data"
public_dir = "/Volumes/LizsDisk/mythos/apps/web/public"

# --- Magica image generation (flux_2_max). Requires MAGICA_KEY in env. ---
MAGICA_BASE = "https://api.magica.com/api/v1"


def _magica_post(path, payload):
    req = urllib.request.Request(
        f"{MAGICA_BASE}{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={
            "Authorization": f"Bearer {os.environ['MAGICA_KEY']}",
            "Content-Type": "application/json",
        },
        method="POST" if payload is not None else "GET",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def _magica_get(path):
    req = urllib.request.Request(
        f"{MAGICA_BASE}{path}",
        headers={"Authorization": f"Bearer {os.environ['MAGICA_KEY']}"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def generate_image(prompt, out_path, image_size="1:1"):
    """Generate one image via Magica and save it to out_path. Returns True on success."""
    run_id = _magica_post(
        "/nodes/flux_2_max/run",
        {"input": {"prompt": prompt, "image_size": image_size, "output_format": "PNG"}},
    )["runId"]
    for _ in range(45):
        run = _magica_get(f"/nodes/runs/{run_id}")
        status = run.get("status")
        if status not in ("RUNNING", "PENDING", "QUEUED"):
            if status != "COMPLETED":
                print(f"  ! run {run_id} ended {status}: {run.get('error')}")
                return False
            url = (run.get("output") or {}).get("result", [None])[0]
            if not url:
                print(f"  ! no image url for {run_id}")
                return False
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            urllib.request.urlretrieve(url, out_path)
            return True
        time.sleep(4)
    print(f"  ! run {run_id} timed out")
    return False

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

# Pass --generate to actually create the missing images via Magica.
# Each image is saved to a UNIQUE canonical path /{type}/{id}.png (many items share the
# generic /placeholder.png as their imageUrl, so we must not write back to item["url"] or
# they'd collide). The item's imageUrl in the source JSON is then patched to the new path.
# Idempotent: needs_generation() skips items whose real image is already in place.
if "--generate" in sys.argv:
    if not os.environ.get("MAGICA_KEY"):
        sys.exit("MAGICA_KEY not set in env. Aborting generation.")
    ok = 0
    generated = {}  # kind -> {id: "/kind/id.png"}
    for i, item in enumerate(queue, 1):
        rel = f"/{item['type']}/{item['id']}.png"
        out_path = os.path.join(public_dir, rel.lstrip("/"))
        print(f"[{i}/{len(queue)}] {item['type']}/{item['id']} -> {rel}", flush=True)
        try:
            if generate_image(item["prompt"], out_path):
                ok += 1
                generated.setdefault(item["type"], {})[item["id"]] = rel
        except (urllib.error.URLError, KeyError, OSError) as e:
            print(f"  ! failed: {e}", flush=True)

    # Patch imageUrl in the source JSON for anything whose path changed.
    for kind, id_to_path in generated.items():
        fp = os.path.join(data_dir, f"{kind}.json")
        with open(fp) as f:
            data = json.load(f)
        changed = False
        for record in data:
            new_url = id_to_path.get(record.get("id"))
            if new_url and record.get("imageUrl") != new_url:
                record["imageUrl"] = new_url
                changed = True
        if changed:
            with open(fp, "w") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.write("\n")
            print(f"  patched {kind}.json", flush=True)

    print(f"Generated {ok}/{len(queue)} images.", flush=True)
