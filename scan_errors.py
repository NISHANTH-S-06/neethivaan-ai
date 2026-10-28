import os
import glob

base_dir = r"d:\Neethivaan\frontend\src\app"
pages = []
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f == "page.tsx":
            pages.append(os.path.join(root, f))

missing = []
for p in pages:
    with open(p, "r", encoding="utf-8") as file:
        content = file.read()
        
        # Check if they fetch data
        if "useEffect(" not in content and ".get(" not in content and ".post(" not in content and "useQuery" not in content and "useSWR(" not in content:
            continue
            
        has_loading = "setLoading" in content or "isLoading" in content
        has_error = "setError" in content or "isError" in content or ".catch(" in content
        
        if not has_loading or not has_error:
            missing.append(f"{os.path.relpath(p, base_dir)}: Loading={has_loading}, Error={has_error}")

for m in missing:
    print(m)
