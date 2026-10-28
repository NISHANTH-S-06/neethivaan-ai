import os
import re

backend_dir = r"d:\Neethivaan\backend"
modules = ["database", "models", "routers", "services", "ai", "tasks", "main"]

pattern = re.compile(r"^(import |from )(" + "|".join(modules) + r")(\b|\.)", re.MULTILINE)

for root, _, files in os.walk(backend_dir):
    for f in files:
        if f.endswith(".py"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8") as file:
                content = file.read()
            
            new_content = pattern.sub(r"\1backend.\2\3", content)
            if new_content != content:
                with open(path, "w", encoding="utf-8") as file:
                    file.write(new_content)
                print(f"Updated {path}")
