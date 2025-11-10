# Acad AI Backend API

Secure FastAPI backend for Acad AI platform handling authentication, AI-powered roadmap customization, and payment processing.

## Features

- **Firebase Admin SDK Authentication**: Secure token verification
- **Google Gemini AI Integration**: Personalized roadmap customization
- **Razorpay Payment Processing**: Subscription management with signature verification
- **RESTful API**: Clean, documented endpoints
- **CORS Support**: Configured for frontend communication
- **Error Handling**: Comprehensive logging and error responses

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration and settings
│   ├── models.py               # Pydantic models for validation
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── roadmap.py          # Roadmap customization endpoints
│   │   └── payment.py          # Payment processing endpoints
│   └── services/
│       ├── __init__.py
│       ├── firebase_service.py  # Firebase Admin SDK operations
│       ├── gemini_service.py    # Google Gemini AI integration
│       └── payment_service.py   # Razorpay payment operations
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
├── .gitignore
└── README.md
```

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required environment variables:
- `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to Firebase service account JSON
- `GOOGLE_GEMINI_API_KEY`: Google Gemini API key
- `RAZORPAY_KEY_ID`: Razorpay key ID
- `RAZORPAY_KEY_SECRET`: Razorpay key secret
- `JWT_SECRET_KEY`: Secret key for JWT (min 32 characters)

### 3. Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file as `firebase-service-account.json` in the backend directory

### 4. Run the Server

**Development:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Authentication

#### POST `/api/auth/verify-token`
Verify Firebase ID token and get user profile
```json
{
  "idToken": "firebase_id_token"
}
```

#### GET `/api/auth/me`
Get current authenticated user profile (requires Authorization header)

### Roadmap

#### POST `/api/roadmap/customize`
Customize roadmap with AI based on user profile
```json
{
  "domain": "frontend",
  "userId": "user_uid"
}
```

#### GET `/api/roadmap/domains`
Get list of available roadmap domains

### Payment

#### POST `/api/payment/create-subscription`
Create new subscription
```json
{
  "userId": "user_uid",
  "planId": "monthly",
  "currency": "INR"
}
```

#### POST `/api/payment/verify-payment`
Verify Razorpay payment signature
```json
{
  "razorpay_subscription_id": "sub_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature",
  "userId": "user_uid"
}
```

#### POST `/api/payment/cancel-subscription`
Cancel active subscription
```json
{
  "userId": "user_uid",
  "subscriptionId": "sub_xxx"
}
```

#### POST `/api/payment/webhook`
Handle Razorpay webhooks (configure in Razorpay dashboard)

## Security Features

1. **Firebase Token Verification**: All protected endpoints verify Firebase ID tokens
2. **Payment Signature Verification**: All payment transactions verified using HMAC-SHA256
3. **CORS Protection**: Configured allowed origins
4. **Environment Variables**: Sensitive data stored securely
5. **Input Validation**: Pydantic models validate all inputs
6. **Error Handling**: Secure error messages (no sensitive data leakage)

## Testing

### Health Checks

```bash
# Main health check
curl http://localhost:8000/health

# Service-specific health checks
curl http://localhost:8000/api/auth/health
curl http://localhost:8000/api/roadmap/health
curl http://localhost:8000/api/payment/health
```

### API Documentation

FastAPI provides automatic interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Deployment

### Using Docker (Recommended)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t acadai-backend .
docker run -p 8000:8000 --env-file .env acadai-backend
```

### Using systemd (Linux)

Create `/etc/systemd/system/acadai-backend.service`:

```ini
[Unit]
Description=Acad AI Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/acadai-backend
Environment="PATH=/var/www/acadai-backend/venv/bin"
ExecStart=/var/www/acadai-backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable acadai-backend
sudo systemctl start acadai-backend
```

## Monitoring & Logging

Logs are output to stdout/stderr in JSON format. Configure log level in `.env`:

```env
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
```

## Troubleshooting

### Firebase Connection Issues
- Verify service account JSON path is correct
- Ensure Firebase project ID matches frontend configuration

### Gemini API Errors
- Check API key is valid
- Verify API is enabled in Google Cloud Console
- Check quota limits

### Razorpay Issues
- Verify key ID and secret are correct
- Ensure webhook signature verification is configured
- Check subscription plan configuration

## Contributing

1. Follow PEP 8 style guide
2. Add type hints to all functions
3. Write docstrings for all public functions
4. Add logging for important operations
5. Handle errors gracefully

## License

MIT License - See main project repository
