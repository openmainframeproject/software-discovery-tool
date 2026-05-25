import json
import os

CONFIG_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(CONFIG_DIR, 'distros.json')

with open(JSON_PATH, 'r') as f:
    SUPPORTED_DISTROS = json.load(f)
