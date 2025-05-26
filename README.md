# Mealzi - Custom Recipe Manager

A modern recipe management platform built with React frontend and py4web backend.

## Features

- 🍳 Smart Recipe Management
- 📊 Nutrition Tracking
- 🛒 Automatic Grocery Lists
- ⏱️ Meal Planning
- 💬 Contact Form for User Feedback
- 📱 Responsive Design

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup (py4web)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the py4web server:
   ```bash
   py4web run apps
   ```

   The backend will be available at `http://127.0.0.1:8000`

### Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## API Endpoints

- `GET /CustomRecipeManager/api/ingredients_search` - Search ingredients
- `POST /CustomRecipeManager/api/contact` - Submit contact form
- `POST /CustomRecipeManager/api/recipes` - Create recipes (coming soon)

## Project Structure

```
├── backend/
│   └── apps/
│       └── CustomRecipeManager/
│           ├── controllers.py    # API endpoints
│           ├── models.py        # Database models
│           └── common.py        # App configuration
├── frontend/
│   └── src/
│       ├── components/          # React components
│       ├── pages/              # Page components
│       └── App.jsx             # Main app component
└── README.md
```

## Contact

Use the contact form in the application to send feedback or questions!

## Email Configuration

To receive email notifications when users submit the contact form, set these environment variables:

```bash
# SMTP Server Settings (Gmail example)
export SMTP_SERVER="smtp.gmail.com:587"
export SMTP_SENDER="noreply@yourdomain.com" 
export SMTP_LOGIN="your-email@gmail.com:your-app-password"
export CONTACT_NOTIFICATION_EMAIL="your-admin@email.com"
```

### Gmail Setup Instructions:
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" for py4web:
   - Go to Google Account Settings > Security > 2-Step Verification > App Passwords
   - Generate a password for "py4web" or "custom app"
3. Use the app password (not your regular password) in `SMTP_LOGIN`

### Testing Email (Optional):
If you don't configure email, the contact form will still work and save messages to the database - you just won't get email notifications.

You can view submitted messages by accessing the py4web admin interface or directly querying the database.