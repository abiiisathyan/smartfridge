from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

DATA_FILE = os.path.join("data", "foods.json")


# -----------------------------
# Load food data
# -----------------------------
def load_foods():
    if not os.path.exists(DATA_FILE):
        return []

    with open(DATA_FILE, "r") as file:
        return json.load(file)


# -----------------------------
# Save food data
# -----------------------------
def save_foods(foods):
    with open(DATA_FILE, "w") as file:
        json.dump(foods, file, indent=4)


# -----------------------------
# Priority Queue
# Earliest expiry = highest priority
# -----------------------------
def priority_queue(foods):
    return sorted(
        foods,
        key=lambda food: datetime.strptime(
            food["expiry_date"], "%Y-%m-%d"
        )
    )


# -----------------------------
# Home page
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# Get all foods
# -----------------------------
@app.route("/api/foods", methods=["GET"])
def get_foods():
    foods = load_foods()
    return jsonify(foods)


# -----------------------------
# Add new food
# -----------------------------
@app.route("/api/foods", methods=["POST"])
def add_food():

    data = request.get_json()

    name = data.get("name")
    category = data.get("category")
    bought_date = data.get("bought_date")
    expiry_date = data.get("expiry_date")

    if not name or not category or not bought_date or not expiry_date:
        return jsonify({
            "error": "All fields are required"
        }), 400

    try:
        bought = datetime.strptime(bought_date, "%Y-%m-%d")
        expiry = datetime.strptime(expiry_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({
            "error": "Invalid date format"
        }), 400

    if expiry < bought:
        return jsonify({
            "error": "Expiry date cannot be before bought date"
        }), 400

    foods = load_foods()

    new_id = max(
        [food["id"] for food in foods],
        default=0
    ) + 1

    new_food = {
        "id": new_id,
        "name": name,
        "category": category,
        "bought_date": bought_date,
        "expiry_date": expiry_date
    }

    foods.append(new_food)

    save_foods(foods)

    return jsonify(new_food), 201


# -----------------------------
# Mark food as used
# -----------------------------
@app.route("/api/foods/<int:food_id>", methods=["DELETE"])
def delete_food(food_id):

    foods = load_foods()

    updated_foods = [
        food for food in foods
        if food["id"] != food_id
    ]

    if len(updated_foods) == len(foods):
        return jsonify({
            "error": "Food not found"
        }), 404

    save_foods(updated_foods)

    return jsonify({
        "message": "Food marked as used"
    })


# -----------------------------
# Priority Queue API
# -----------------------------
@app.route("/api/priority", methods=["GET"])
def get_priority():

    foods = load_foods()

    sorted_foods = priority_queue(foods)

    return jsonify(sorted_foods)


# -----------------------------
# Run application
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)