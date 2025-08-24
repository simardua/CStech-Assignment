# Agent Management System - MERN Stack

A comprehensive web application for managing agents and distributing CSV/Excel lists among them. Built with MongoDB, Express.js, React.js, and Node.js.


## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- CSV-Parser & XLSX for file processing
- Bcryptjs for password hashing

**Frontend:**
- React.js
- React Router for navigation
- Axios for API calls
- React-Toastify for notifications
- Context API for state management

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd agent-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agent-management
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Database Setup

Start MongoDB service on your system, then create an admin user:

```bash
# Connect to MongoDB
mongo

# Switch to the agent-management database
use agent-management

# Create an admin user (replace with your desired credentials)
db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$10$8K1p/a0drtIzq.z2W0sEUeXvuXkGGrMpvV1o2f3QzjEzX4YgHv6g2", // password: "admin123"
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000





