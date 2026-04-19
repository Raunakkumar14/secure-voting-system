# 🗳️ Secure Voting System

A full-stack voting application with email-based OTP verification, secure authentication, and voting management.

## 📋 Features

### Authentication & Security
- ✅ User registration with OTP email verification
- ✅ Password hashing with bcrypt
- ✅ Email validation (prevent duplicate registrations)
- ✅ OTP expiration (10 minutes)
- ✅ Forgot password with OTP verification
- ✅ Role-based access (Voter/Admin)

### Voting Features
- ✅ View candidates
- ✅ Cast votes (one vote per user)
- ✅ View voting results
- ✅ Voting statistics

### Email System
- ✅ Gmail SMTP integration
- ✅ HTML formatted OTP emails
- ✅ Password reset emails

## 🛠️ Tech Stack

### Backend
- FastAPI (Python)
- SQLAlchemy (ORM)
- PostgreSQL (Database)
- fastapi-mail (Email)
- python-jose (JWT)
- passlib (Password hashing)

### Frontend
- React.js
- CSS (Custom styling)
- Axios (API calls)

## 🚀 Setup Instructions

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd Backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values:
   # - PostgreSQL connection string
   # - Gmail credentials (get app password from https://myaccount.google.com/apppasswords)
   # - Secret key for JWT
   ```

3. **Start the server:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   Backend runs on: `http://127.0.0.1:8000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd Frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   Frontend runs on: `http://localhost:3000`

## 📧 Gmail Setup for Email Sending

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" → "Windows Computer"
5. Copy the 16-character app password
6. Add to `.env`:
   ```
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=xxxx xxxx xxxx xxxx
   MAIL_FROM=your_email@gmail.com
   ```

## 🗄️ Database Setup

Create PostgreSQL database:
```sql
CREATE DATABASE voting_db;
```

Update `.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost/voting_db
```

The tables will be created automatically on first run.

## 📚 API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /send-otp` - Send registration OTP
- `POST /verify-otp` - Verify registration OTP
- `POST /check-email` - Check if email exists

### Password Reset
- `POST /forgot-password` - Send password reset OTP
- `POST /verify-reset-otp` - Verify reset OTP
- `POST /reset-password` - Complete password reset

### Voting
- `GET /candidates` - Get all candidates
- `POST /vote` - Cast a vote
- `GET /results` - Get voting results
- `GET /stats` - Get voting statistics

## 👥 User Roles

- **Voter**: Can register, login, view candidates, cast votes, view results
- **Admin**: Can manage candidates, view statistics, manage users (future feature)

## 🔒 Security Notes

- Never commit `.env` file - use `.env.example` instead
- OTP expires after 10 minutes
- Passwords are hashed with bcrypt
- Email verification prevents duplicate registrations
- One vote per user enforcement

## 📝 Contributing

1. Clone the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License

## 🤝 Team Members

- Add team member names here

---

**Last Updated:** 2026-04-19
