# Mealzi - Custom Recipe Manager

A web-based recipe manager built with py4web that allows users to create, browse, and share recipes. This is a database-driven application with user accounts and support for searching and managing shared ingredients and recipes.

## Features

### Core Features
- 🍳 Recipe Management
  - Create, browse, and share recipes
  - Search recipes by name and type
  - Edit your own recipes
  - View recipe details including ingredients and instructions
- 📊 Ingredient Management
  - Search ingredients by name
  - Add new ingredients
  - Shared ingredient database
- 🔒 User Authentication
  - Secure user accounts
  - Author-only recipe editing
- 🖼️ Recipe Details
  - Recipe images
  - Step-by-step instructions
  - Servings management
  - Ingredient quantities per serving

### Advanced Features
- 📥 TheMealDB Integration
  - Import recipes from TheMealDB API
  - One-time import functionality included
- 🧮 Automatic Calculations
  - Total calories per recipe based on ingredients
  - Nutritional information tracking
- 🔍 Search Capabilities
  - Public search API for recipes (JSON format)
  - Ingredient search functionality
- 🎨 Professional UI
  - Intuitive user interface
  - Self-documenting design

## Getting Started

### Prerequisites

- Python 3.8+
- py4web (included in class environment)

### Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd project-1-main
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the server using one of these methods:

   **Method 1 - Using the start script (Recommended):**
   ```bash
   ./start-server.sh
   ```
   This script will:
   - Start the py4web server
   - Open your browser automatically
   - Show helpful URLs and instructions

   **Method 2 - Manual start:**
   ```bash
   cd backend
   py4web run apps
   ```

   The application will be available at:
   - Frontend: `http://127.0.0.1:8000/CustomRecipeManager/static/`
   - API: `http://127.0.0.1:8000/CustomRecipeManager/api/`
   - Root redirect: `http://127.0.0.1:8000/` → `/CustomRecipeManager/static/`

### Project Structure

The project follows the standard py4web application structure:

```
├── apps/
│   └── CustomRecipeManager/    # Main application directory
│       ├── controllers.py      # API endpoints and page routes
│       ├── models.py          # Database models
│       ├── common.py          # App configuration
│       ├── settings.py        # Application settings
│       ├── __init__.py        # Package initialization
│       ├── init_db.py         # Database initialization
│       ├── import_mealdb.py   # MealDB data import
│       ├── databases/         # Database files
│       ├── translations/      # Language translations
│       ├── uploads/          # User uploaded files
│       └── static/           # Frontend static files
│           ├── assets/       # Static assets
│           ├── index.html    # Main HTML file
│           └── vite.svg      # Vite logo
└── README.md
```

### Frontend Development

The frontend is served directly by py4web from the `static/` directory. This ensures:
- Single process deployment
- No need for separate frontend servers
- Works in the standard class environment
- Easy deployment and testing

## Database Schema

### Ingredients Table
- name
- unit
- calories_per_unit
- description

### Recipes Table
- name
- type
- description
- image
- author
- instruction_steps
- servings

### Recipe-Ingredients Linking Table
- recipe_id
- ingredient_id
- quantity_per_serving

## API Endpoints

### Recipe Management
- `GET /CustomRecipeManager/api/recipes` - List all recipes
- `GET /CustomRecipeManager/api/recipes/{id}` - Get recipe details
- `POST /CustomRecipeManager/api/recipes` - Create new recipe
- `PUT /CustomRecipeManager/api/recipes/{id}` - Update recipe (author only)
- `DELETE /CustomRecipeManager/api/recipes/{id}` - Delete recipe (author only)

### Ingredient Management
- `GET /CustomRecipeManager/api/ingredients_search` - Search ingredients
- `POST /CustomRecipeManager/api/ingredients` - Add new ingredient

## Security Features

- User authentication and authorization
- Secure recipe editing (author-only)
- Protected API endpoints
- Input validation and sanitization

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
