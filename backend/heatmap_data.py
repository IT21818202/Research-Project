# Simulated known fixed device locations (example)
DEVICE_LOCATIONS = {
    "esp32_gate_a": [6.9271, 79.8612],
    "esp32_stage": [6.9280, 79.8645],
    "esp32_food": [6.9265, 79.8620],
    "esp32_exit": [6.9255, 79.8608]
}

# Simulated risk levels (1.0 = high, 0.3 = low)
RISK_LEVELS = {
    "esp32_gate_a": 0.9,
    "esp32_stage": 0.4,
    "esp32_food": 0.6,
    "esp32_exit": 0.3
}

def get_heatmap_points():
    heatmap = []
    for device_id, coords in DEVICE_LOCATIONS.items():
        intensity = RISK_LEVELS.get(device_id, 0.5)
        heatmap.append([coords[0], coords[1], intensity])
    return heatmap
