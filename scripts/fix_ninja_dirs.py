import os
import re

cxx_dir = r"D:\DDDNT\android\app\.cxx\Debug\3x365u68\armeabi-v7a"
ninja_file = os.path.join(cxx_dir, "build.ninja")

if os.path.isfile(ninja_file):
    with open(ninja_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Matches: build <target>: ...
    matches = re.findall(r"^build\s+([^:]+\.o):", content, re.MULTILINE)
    count = 0
    for target in matches:
        full_path = os.path.join(cxx_dir, target.strip())
        parent_dir = os.path.dirname(full_path)
        if not os.path.exists(parent_dir):
            os.makedirs(parent_dir, exist_ok=True)
            count += 1
            print(f"Created: {parent_dir}")
    print(f"Done! Created {count} missing directories.")
else:
    print(f"File not found: {ninja_file}")

