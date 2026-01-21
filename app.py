import os
from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# CONFIGURATION
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

db = SQLAlchemy(app)

# --- DATABASE MODELS ---
class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))
    location = db.Column(db.String(100))
    description = db.Column(db.Text)

class Trip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.String(50))
    end_date = db.Column(db.String(50))
    status = db.Column(db.String(20), default='Upcoming')
    itinerary = db.Column(db.Text)

with app.app_context():
    db.create_all()

# --- ROUTES ---

@app.route('/')
def home():
    all_photos = Photo.query.order_by(Photo.id.desc()).limit(8).all()
    return render_template('index.html', photos=all_photos)

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        if 'image' in request.files and request.files['image'].filename != '':
            file = request.files['image']
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
            new_photo = Photo(
                url=file.filename,
                category=request.form.get('category'),
                location=request.form.get('location'),
                description=request.form.get('desc', '')
            )
            db.session.add(new_photo)
        elif 'trip_title' in request.form:
            new_trip = Trip(
                title=request.form.get('trip_title'),
                start_date=request.form.get('start_date'),
                end_date=request.form.get('end_date'),
                itinerary=request.form.get('itinerary'),
                status='Upcoming'
            )
            db.session.add(new_trip)
        db.session.commit()
        return redirect(url_for('upload'))
    photos = Photo.query.order_by(Photo.id.desc()).all()
    trips = Trip.query.order_by(Trip.id.desc()).all()
    return render_template('upload.html', photos=photos, trips=trips)

@app.route('/edit_photo/<int:id>', methods=['GET', 'POST'])
def edit_photo(id):
    photo = Photo.query.get_or_404(id)
    if request.method == 'POST':
        photo.category = request.form.get('category')
        photo.location = request.form.get('location')
        photo.description = request.form.get('desc')
        db.session.commit()
        return redirect(url_for('upload'))
    return render_template('edit.html', item=photo, type='photo')

@app.route('/edit_trip/<int:id>', methods=['GET', 'POST'])
def edit_trip(id):
    trip = Trip.query.get_or_404(id)
    if request.method == 'POST':
        trip.title = request.form.get('trip_title')
        trip.start_date = request.form.get('start_date')
        trip.end_date = request.form.get('end_date')
        trip.status = request.form.get('status')
        trip.itinerary = request.form.get('itinerary')
        db.session.commit()
        return redirect(url_for('upload'))
    return render_template('edit.html', item=trip, type='trip')

@app.route('/delete_photo/<int:id>')
def delete_photo(id):
    photo = Photo.query.get_or_404(id)
    db.session.delete(photo)
    db.session.commit()
    return redirect(url_for('upload'))

@app.route('/delete_trip/<int:id>')
def delete_trip(id):
    trip = Trip.query.get_or_404(id)
    db.session.delete(trip)
    db.session.commit()
    return redirect(url_for('upload'))

@app.route('/categories')
def categories_list():
    category_names = ['Wildlife', 'Astro', 'Landscape', 'Mountain','Abstract']
    category_data = []
    for name in category_names:
        latest = Photo.query.filter_by(category=name).order_by(Photo.id.desc()).first()
        category_data.append({'name': name, 'photo': latest})
    return render_template('categories_main.html', categories=category_data)

@app.route('/category/<name>')
def category_detail(name):
    photos = Photo.query.filter_by(category=name).order_by(Photo.id.desc()).all()
    return render_template('category_detail.html', category_name=name, photos=photos)

@app.route('/location')
def location_page():
    search_query = request.args.get('search')
    if search_query:
        photos = Photo.query.filter(Photo.location.icontains(search_query)).all()
    else:
        photos = Photo.query.all()
    return render_template('location.html', photos=photos)

@app.route('/trips')
def trips_page():
    all_trips = Trip.query.order_by(Trip.start_date.asc()).all()
    return render_template('trips.html', trips=all_trips)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/puzzle')
def puzzle():
    # Fetch all photos from the database to let the user choose one
    photos = Photo.query.all() 
    return render_template('puzzle.html', photos=photos)

if __name__ == '__main__':
    app.run(debug=True)