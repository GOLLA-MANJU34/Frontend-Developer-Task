Task Manager App with User Authentication
Project Overview

This is a full-stack task management application built with Node.js, Express, SQLite, and optionally a React frontend. Users can register, login, and manage tasks. Admin users can delete tasks. Authentication is handled using JWT, and passwords are securely stored with bcrypt.

Features

User registration and login

Password hashing with bcrypt

JWT-based authentication

Role-based authorization (user vs admin)

CRUD operations for tasks

SQLite database with two tables: user and task

Input validation with Joi

Admin-only delete functionality

CORS ready for frontend integration

Technologies Used

Node.js

Express.js

SQLite3

bcrypt

JSON Web Token (JWT)

Joi (validation)

CORS (for frontend connectivity)

Optional: React (frontend)

Backend Setup
1. Clone the Repository
git clone <your-repo-url>
cd <repo-folder>

2. Install Dependencies
npm install express sqlite3 sqlite bcrypt jsonwebtoken joi cors

3. Run the Backend Server
node index.js


Server runs on: http://localhost:3000

Database goodreads.db will be automatically created.

4. API Endpoints
User Routes
Method	Endpoint	Description	Body Example
POST	/users/	Register a new user	{ "username": "john", "name": "John Doe", "password": "12345", "role": "user" }
POST	/login	Login user	{ "username": "john", "password": "12345" }
Task Routes
Method	Endpoint	Description	Notes
GET	/tasks/	Get all tasks	Auth required
POST	/tasks/	Add a new task	Auth required
PUT	/tasks/:id/	Update a task	Auth required
DELETE	/tasks/:id/	Delete a task	Admin only, Auth required

Auth: Include JWT in headers

Authorization: Bearer <token>

Frontend Setup (React Example)

Create a React app (if not done):

npx create-react-app frontend
cd frontend
npm start


Install Axios (for API requests):

npm install axios


Example API Call with JWT:

import axios from "axios";

const token = localStorage.getItem("jwtToken");

axios.get("http://localhost:3000/tasks", {
  headers: { Authorization: `Bearer ${token}` },
})
.then(res => console.log(res.data))
.catch(err => console.error(err));

Notes / Best Practices

Ensure CORS is enabled in backend if frontend is on a different port:

const cors = require("cors");
app.use(cors());


Always store JWT safely in localStorage or sessionStorage.

Test API endpoints with Postman before integrating frontend.

Admin role required for deleting tasks.

Project Structure
project-root/
├─ index.js             # Backend server
├─ goodreads.db         # SQLite database (auto-created)
├─ package.json
├─ frontend/            # React frontend (optional)
└─ README.md

License

This project is open source and available under the MIT License.
