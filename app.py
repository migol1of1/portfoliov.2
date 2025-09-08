from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import re
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, 
           template_folder='public', 
           static_folder='static',   
           static_url_path='')      
CORS(app, origins=["https://miguel-san-pedro-portfolio.onrender.com"])

MANILA_OFFSET = timedelta(hours=8)

try:
    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client[os.getenv('DATABASE_NAME', 'contact_form_db')]
    contacts_collection = db.contacts
    
    client.admin.command('ping')
    print("✅ Connected to MongoDB Atlas successfully!")
except Exception as e:
    print(f"❌ MongoDB connection error: {e}")

EMAIL_PATTERN = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
PHONE_PATTERN = re.compile(r'^\+63\d{10}$')

def get_manila_time():
    """Get current time in Manila timezone (UTC+8)"""
    utc_time = datetime.utcnow()
    manila_time = utc_time + MANILA_OFFSET
    return manila_time

def format_manila_time(dt):
    """Format datetime with Manila timezone info"""
    return dt.strftime('%Y-%m-%dT%H:%M:%S+08:00')

def validate_contact_data(data):
    errors = {}
    
    if not data.get('name', '').strip():
        errors['name'] = 'Name is required'
    
    if not data.get('email', '').strip():
        errors['email'] = 'Email is required'
    elif not EMAIL_PATTERN.match(data['email'].strip()):
        errors['email'] = 'Please enter a valid email address'
    
    if not data.get('message', '').strip():
        errors['message'] = 'Message is required'
    elif len(data['message'].strip()) > 200:
        errors['message'] = 'Message must be 200 characters or less'
    
    phone = data.get('phone', '').strip()
    if phone and not PHONE_PATTERN.match(phone):
        errors['phone'] = 'Phone number must be in format +63XXXXXXXXXX (11 digits total)'
    
    return errors

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        validation_errors = validate_contact_data(data)
        if validation_errors:
            return jsonify({'error': 'Validation failed', 'details': validation_errors}), 400
        
        # Get Manila time
        manila_time = get_manila_time()
        utc_time = datetime.utcnow()
        
        contact_doc = {
            'name': data['name'].strip(),
            'email': data['email'].strip().lower(),
            'phone': data.get('phone', '').strip() or None,
            'message': data['message'].strip(),
            'created_at': manila_time,
            'created_at_utc': utc_time,
            'timezone': 'Asia/Manila (+08:00)',
            'ip_address': request.remote_addr
        }
        
        result = contacts_collection.insert_one(contact_doc)
        
        return jsonify({
            'message': 'Contact form submitted successfully!',
            'id': str(result.inserted_id),
            'timestamp': format_manila_time(manila_time)
        }), 200
        
    except Exception as e:
        print(f"Error processing contact form: {e}")
        return jsonify({'error': 'Internal server error. Please try again later.'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        manila_time = get_manila_time()
        return jsonify({
            'status': 'OK',
            'timestamp': format_manila_time(manila_time),
            'database': 'Connected',
            'timezone': 'Asia/Manila (+08:00)'
        }), 200
    except Exception as e:
        manila_time = get_manila_time()
        return jsonify({
            'status': 'ERROR',
            'timestamp': format_manila_time(manila_time),
            'database': 'Disconnected',
            'error': str(e)
        }), 500

@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    try:
        limit = int(request.args.get('limit', 10))
        skip = int(request.args.get('skip', 0))
        
        contacts = list(contacts_collection.find({}, {'_id': 0}).sort('created_at', -1).skip(skip).limit(limit))
        
        for contact in contacts:
            if 'created_at' in contact:
                if isinstance(contact['created_at'], datetime):
                    contact['created_at'] = format_manila_time(contact['created_at'])
            
            if 'created_at_utc' in contact and isinstance(contact['created_at_utc'], datetime):
                contact['created_at_utc'] = contact['created_at_utc'].isoformat()
        
        return jsonify({
            'contacts': contacts,
            'total': contacts_collection.count_documents({}),
            'timezone': 'Asia/Manila (+08:00)'
        }), 200
        
    except Exception as e:
        print(f"Error fetching contacts: {e}")
        return jsonify({'error': 'Failed to fetch contacts'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

@app.route('/output.css')
def serve_css():
    return send_from_directory('public', 'output.css')

@app.route('/script.js')  
def serve_js():
    return send_from_directory('public', 'script.js')

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

    
    app.run(host='0.0.0.0', port=port, debug=debug)