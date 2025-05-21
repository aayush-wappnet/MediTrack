# Medical Record and Prescription Fulfillment System

A comprehensive medical management system that handles patient records, appointments, prescriptions,lab reports and patient management.

## Project Structure

The project is split into two main components:
- `Backend`: NestJS-based backend API
- `Frontend`: React-based user interface

## Features

- Patient Management
- Appointment Scheduling (for both doctors and nurses)
- Prescription Management (with multiple medications support)
- Nurse-Patient Assignment
- Role-based Access Control
- Dashboard with Patient Statistics

## Prerequisites

### Backend
- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (v14 or higher)
- Docker (optional, for containerization)

### Frontend
- Node.js (v18 or higher)
- npm (v9 or higher)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3.Make .env file 
add the following variables
```
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=medical_system

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1d
# Application Configuration
PORT=3000
NODE_ENV=development
```

4. Run migrations:
```bash
npm run migrate:run
```

5. Start the development server:
```bash
npm run start:dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:5173`

## Project Architecture

### Backend Architecture
- Modular design using NestJS
- TypeORM for database operations
- Role-based authentication and authorization
- RESTful API endpoints


### Frontend Architecture
- React with TypeScript
- TailwindCSS for styling
- Axios for API calls
- Redux for state management
- Role-based UI components ,navigation and pages

## API Documentation

API documentation is available at:
- Swagger UI: `http://localhost:3000/api/docs`


MediTrack - A Medical Record and Prescription Fulfillment System
Watch the demo of the **MediTrack**:  
🔗 **[Click here to watch the demo](https://drive.google.com/file/d/1tMtErH091nQ5cECcMp6iIVaDFrpC26Yg/view?usp=sharing)** 
