
from flask import Flask, request, jsonify, render_template
import cv2
import numpy as np
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_toast_rating(brightness):
    if brightness >= 200:
        return "Pale Bread"
    elif brightness >= 150:
        return "Perfectly Toasted"
    elif brightness >= 100:
        return "Slightly Burnt"
    else:
        return "Carbonized"


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/leaderboard')
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        # Read image with OpenCV
        img = cv2.imread(filepath)
        if img is None:
            return jsonify({'error': 'Invalid image'}), 400
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        avg_brightness = int(np.mean(gray))
        rating = get_toast_rating(avg_brightness)
        os.remove(filepath)
        return jsonify({'brightness': avg_brightness, 'rating': rating})
    else:
        return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True)
