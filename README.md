# React BlogSpace

A full-stack React application with a BlogSpace, featuring JWT authentication and MongoDB integration.

## Project Structure

```
react-md-editor/
├── backend/          # Express.js API server
├── frontend/         # React + Vite client
├── package.json      # Root package.json for running both services
└── README.md         # This file
```

## Quick Start

### Install Dependencies

```bash
npm run install:all
```

This will install dependencies for the root project, backend, and frontend.

### Run Development Environment

```bash
npm run dev
```

This single command will start both:
- **Backend**: Express server with nodemon (usually on port 5000)
- **Frontend**: Vite development server (usually on port 5173)

## Available Scripts

From the root directory:

- `npm run dev` - Start both frontend and backend in development mode
- `npm run start` - Start both frontend and backend in production mode
- `npm run install:all` - Install dependencies for all projects
- `npm run build` - Build the frontend for production
- `npm run backend` - Start only the backend development server
- `npm run frontend` - Start only the frontend development server

## Individual Project Commands

### Backend (from `/backend` directory)
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend (from `/frontend` directory)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- **Frontend**: React with TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js with JWT authentication, MongoDB
- **Editor**: Markdown editing with live preview
- **File System**: Virtual file system for organizing documents
- **Authentication**: JWT-based user authentication

## Development

1. Make sure you have Node.js installed
2. Run `npm run install:all` to install all dependencies
3. Set up your environment variables for the backend (MongoDB connection, JWT secret, etc.)
4. Run `npm run dev` to start both services
5. Open your browser to the frontend URL (typically http://localhost:5173)

The backend and frontend will run simultaneously and reload automatically when you make changes. 