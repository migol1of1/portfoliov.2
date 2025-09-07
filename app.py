from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import re
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

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
        errors['phone'] = 'Must be 11 digits!'
    
    return errors

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        validation_errors = validate_contact_data(data)
        if validation_errors:
            return jsonify({'error': 'Validation failed', 'details': validation_errors}), 400
        
        contact_doc = {
            'name': data['name'].strip(),
            'email': data['email'].strip().lower(),
            'phone': data.get('phone', '').strip() or None,
            'message': data['message'].strip(),
            'created_at': datetime.utcnow(),
            'ip_address': request.remote_addr
        }
        
        result = contacts_collection.insert_one(contact_doc)
        
        return jsonify({
            'message': 'Contact form submitted successfully!',
            'id': str(result.inserted_id)
        }), 200
        
    except Exception as e:
        print(f"Error processing contact form: {e}")
        return jsonify({'error': 'Internal server error. Please try again later.'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        return jsonify({
            'status': 'OK',
            'timestamp': datetime.utcnow().isoformat(),
            'database': 'Connected'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'ERROR',
            'timestamp': datetime.utcnow().isoformat(),
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
                contact['created_at'] = contact['created_at'].isoformat()
        
        return jsonify({
            'contacts': contacts,
            'total': contacts_collection.count_documents({})
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

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"🚀 Starting Flask server on port {port}")
    print(f"📝 Contact endpoint: http://localhost:{port}/api/contact")
    print(f"💊 Health check: http://localhost:{port}/api/health")
    
    app.run(host='0.0.0.0', port=port, debug=debug)