from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os
import re
from bson import ObjectId

app = Flask(__name__)
CORS(app)

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

try: 
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    client.admin.command('ping')
    print("Connected to MongoDB successfully!")
    print(f"using database: {DATABASE_NAME}, collection: {COLLECTION_NAME}")

except Exception as e:
    print("Error connecting to MongoDB: {e}")
    client = None

def validate_email(email):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None
def validate_phone(phone):
    if not phone:
        return True
    clean_phone = re.sub(r'[\s\-\(\)]', '', phone)
    return 11<=len(clean_phone)<=12 and clean_phone.isdigit()
def validate_message(message):
    return 10 <= len(message) <= 200

@app.route('/api/contact', methods=['POST'])
def contact():
    try:
        if client is None:
            return jsonify({'error': 'Database connection failed'}), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()
        phone = data.get('phone', '').strip()
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if phone and not validate_phone(phone):
            return jsonify({'error': 'Invalid phone number format'}), 400
        
        if len(name) > 20:
            return jsonify({'error': 'Name must be less than 20 characters'}), 400
        
        if len(email) > 240:
            return jsonify({'error': 'Email must be less than 240 characters'}), 400
        
        if len(message) > 200:
            return jsonify({'error': 'Message must be less than 200 characters'}), 400
        
        if phone and len(phone) > 12:
            return jsonify({'error': 'Phone number must be less than 12 characters'}), 400
        
        contact_message = {
            'name': name,
            'email': email,
            'phone': phone if phone else None,
            'message': message,
            'timestamp': datetime.utcnow(),
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', ''),
            'status': 'unread'
        }

        result = collection.insert_one(contact_message)

        if result.inserted_id:
            print(f"\n--- New Message Saved to MongoDB ---")
            print(f"ID: {result.inserted_id}")
            print(f"Name: {name}")
            print(f"Email: {email}")
            print(f"Phone: {phone if phone else 'Not provided'}")
            print(f"Message: {message}")
            print(f"Time: {contact_message['timestamp']}")
            
            return jsonify({
                'message': 'Message sent successfully! I\'ll get back to you soon.',
                'id': str(result.inserted_id)
            }), 200
        else:
            return jsonify({'error': 'Failed to save message'}), 500
            
    except Exception as e:
        print(f"Error processing contact form: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/messages', methods=['GET'])
def get_messages():
    try:
        if client is None:
            return jsonify({'error': 'Database connection failed'}), 500
        
        limit = request.args.get('limit', 50, type=int)
        skip = request.args.get('skip', 0, type=int)
        status = request.args.get('status')

        query = {}

        if status:
            query['status'] = status
        
        messages = list(collection.find(query)
                        .sort('timestamp', -1)
                        .skip(skip)
                        .limit(limit))

        for message in messages:
            message['_id'] = str(message['_id'])
            message['formatted_timestamp'] = message['timestamp'].strftime('%Y-%m-%d %H:%M:%S UTC')

        total_count = collection.count_documents(query)

        return jsonify({
            'messages': messages,
            'count': len(messages),
            'total': total_count
        }), 200

    except Exception as e:
        print(f"Error retrieving messages: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/messages/<message_id>', methods=['PATCH'])
def mark_as_read(message_id):
    try:
        if client is None:
            return jsonify({'error': 'database connection failed'}), 500
        
        try:
            obj_id = ObjectId(message_id)
        except Exception:
            return jsonify({'error': 'Invalid message ID'}), 400
        
        result = collection.update.one(
            {'_id': obj_id},
            {'$set': {'status': 'read', 'read_at': datetime.utcnow()}}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'message not found'}), 404
        
        return jsonify({'message': 'message marked as read'}), 200

    except Exception as e:
        print(f"error updating message status: {e}")
        return jsonify({'error': 'internal server error'}), 500


@app.route('/health', methods=['GET'])
def health_check():
    try:
        if client is None:
            return jsonify({'status': 'database connection failed'}), 500
        
        client.admin.command('ping')
        return jsonify({'status': 'ok'}), 200
    
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/')
def index():

    db_status = 'connected' if client else 'disconnected'
    return f"""
    <h1">Contact Form Backend - MongoDB Atlas</h1>
    <p><strong>Database Status:</strong> {db_status}</p>
    <p>Server is running! Your contact form should work now.</p>
    <p><a href="/api/messages">View all messages</a></p>
    <p><a href="/health">Health check</a></p>
    """

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)