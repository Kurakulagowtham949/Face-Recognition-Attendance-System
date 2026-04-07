import base64
import os
import pickle
from io import BytesIO

import cv2
import face_recognition
import numpy as np
from flask import Flask, jsonify, request
from PIL import Image

app = Flask(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
ENCODINGS_FILE = os.path.join(DATA_DIR, "encodings.pkl")
DISTANCE_THRESHOLD = float(os.getenv("DISTANCE_THRESHOLD", "0.48"))

os.makedirs(DATA_DIR, exist_ok=True)

face_cascade = cv2.CascadeClassifier(
    os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
)


def load_store():
    if not os.path.exists(ENCODINGS_FILE):
        return {}

    with open(ENCODINGS_FILE, "rb") as file:
        return pickle.load(file)


def save_store(store):
    with open(ENCODINGS_FILE, "wb") as file:
        pickle.dump(store, file)


def parse_base64_image(image_base64: str) -> np.ndarray:
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    raw = base64.b64decode(image_base64)
    image = Image.open(BytesIO(raw)).convert("RGB")
    return np.array(image)


def ensure_face_present(rgb_image: np.ndarray) -> bool:
    gray = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
    return len(faces) > 0


def extract_face_encoding(rgb_image: np.ndarray) -> np.ndarray | None:
    encodings = face_recognition.face_encodings(rgb_image)
    if not encodings:
        return None
    return encodings[0]


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "ml-service"})


@app.post("/register-face")
def register_face():
    payload = request.get_json(force=True)
    user_id = payload.get("userId")
    image_base64 = payload.get("imageBase64")

    if not user_id or not image_base64:
        return jsonify({"message": "userId and imageBase64 are required"}), 400

    try:
        image = parse_base64_image(image_base64)
    except Exception:
        return jsonify({"message": "Invalid image payload"}), 400

    if not ensure_face_present(image):
        return jsonify({"message": "No face detected"}), 400

    encoding = extract_face_encoding(image)
    if encoding is None:
        return jsonify({"message": "Could not encode face"}), 400

    store = load_store()
    existing = store.get(user_id, [])
    existing.append(encoding.astype(np.float32))
    store[user_id] = existing
    save_store(store)

    return jsonify({"message": "Face registered", "faceSamples": len(existing)})


@app.post("/recognize")
def recognize():
    payload = request.get_json(force=True)
    image_base64 = payload.get("imageBase64")

    if not image_base64:
        return jsonify({"message": "imageBase64 is required"}), 400

    try:
        image = parse_base64_image(image_base64)
    except Exception:
        return jsonify({"message": "Invalid image payload"}), 400

    encoding = extract_face_encoding(image)
    if encoding is None:
        return jsonify({"matched": False, "message": "No face detected"}), 404

    store = load_store()
    if not store:
        return jsonify({"matched": False, "message": "No registered faces"}), 404

    best_user_id = None
    best_distance = 999.0

    for user_id, vectors in store.items():
        vectors_np = np.array(vectors)
        centroid = np.mean(vectors_np, axis=0)
        distance = float(np.linalg.norm(encoding - centroid))
        if distance < best_distance:
            best_distance = distance
            best_user_id = user_id

    if best_user_id is None or best_distance > DISTANCE_THRESHOLD:
        return jsonify({"matched": False, "distance": best_distance}), 404

    confidence = max(0.0, 1.0 - best_distance)
    return jsonify(
        {
            "matched": True,
            "userId": best_user_id,
            "distance": best_distance,
            "confidence": confidence,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
