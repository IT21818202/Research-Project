from flask import Blueprint, request, jsonify
from bson import ObjectId
from pymongo import MongoClient
from datetime import datetime
import requests
import os
from flask import Blueprint

from dotenv import load_dotenv
load_dotenv()
# Define the blueprint
location_bp = Blueprint("locations", __name__)

# MongoDB connection
client = MongoClient("mongodb+srv://dbUser:PjgloDbTT3BlOjsE@cluster0.iqc12.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["Event"]
locations_collection = db["locations"]

# Google API Key (store in .env for security)
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

def reverse_geocode(lat, lng):
    """Fetch a human-readable address from Google Maps API"""
    try:
        url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={GOOGLE_MAPS_API_KEY}"
        resp = requests.get(url)
        if resp.status_code == 200:
            data = resp.json()
            if data["results"]:
                return data["results"][0]["formatted_address"]
    except Exception as e:
        print(f"Reverse geocode failed: {e}")
    return None


# ---------------- GET All ---------------- #
@location_bp.route('/api/locations', methods=['GET'])
def get_locations():
    try:
        locations = list(locations_collection.find({}))
        for location in locations:
            location["_id"] = str(location["_id"])
            if "subLocations" not in location:
                location["subLocations"] = []
            if "coordinates" not in location:
                location["coordinates"] = {"lat": 6.9271, "lng": 79.8612}  # default Colombo
        return jsonify(locations)
    except Exception as e:
        print(f"Error fetching locations: {e}")
        return jsonify([])


# ---------------- CREATE Main Location ---------------- #
@location_bp.route('/api/locations', methods=['POST'])
def create_location():
    try:
        data = request.json
        coordinates = data.get("coordinates", {"lat": 6.9271, "lng": 79.8612})

        # Reverse geocode to get address
        address = reverse_geocode(coordinates["lat"], coordinates["lng"])

        location = {
            "name": data["name"],
            "fireDevicesCount": data["fireDevicesCount"],
            "cameraAreasCount": data["cameraAreasCount"],
            "subLocations": data.get("subLocations", []),
            "coordinates": coordinates,
            "address": address,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        result = locations_collection.insert_one(location)
        location["_id"] = str(result.inserted_id)
        return jsonify(location), 201
    except Exception as e:
        print(f"Error creating location: {e}")
        return jsonify({"error": "Failed to create location"}), 500


# ---------------- Add Sub-Location ---------------- #
@location_bp.route('/api/locations/<location_id>/sublocations', methods=['POST'])
def add_sublocation(location_id):
    try:
        data = request.json
        coordinates = data.get("coordinates", {})

        # Reverse geocode for sub-location
        address = None
        if "lat" in coordinates and "lng" in coordinates:
            address = reverse_geocode(coordinates["lat"], coordinates["lng"])

        sublocation = {
            "id": str(ObjectId()),
            "name": data["name"],
            "deviceAssignments": data.get("deviceAssignments", []),
            "coordinates": coordinates,
            "address": address,
            "createdAt": datetime.utcnow()
        }

        result = locations_collection.update_one(
            {"_id": ObjectId(location_id)},
            {"$push": {"subLocations": sublocation}, "$set": {"updatedAt": datetime.utcnow()}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Location not found"}), 404

        updated_location = locations_collection.find_one({"_id": ObjectId(location_id)})
        updated_location["_id"] = str(updated_location["_id"])
        return jsonify(updated_location), 201
    except Exception as e:
        print(f"Error adding sub-location: {e}")
        return jsonify({"error": "Failed to add sub-location"}), 500