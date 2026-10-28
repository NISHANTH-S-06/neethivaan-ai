import urllib.request, json
resp = urllib.request.urlopen("http://localhost:8000/openapi.json")
d = json.loads(resp.read())
print("=== Neethivaan AI Backend - Route Inventory ===")
print(f"Title: {d['info']['title']}")
print(f"Total routes: {len(d['paths'])}")
print("\nAll routes:")
for path in sorted(d['paths']):
    methods = list(d['paths'][path].keys())
    print(f"  {', '.join(m.upper() for m in methods):20s}  {path}")
