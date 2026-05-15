# Installation and Setup

## Prerequisites
- **Node.js v18+** (with npm 11.6.2+)
- **MongoDB v6+** (local or cloud instance)
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## Quick Start

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd NFT_test_3

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Setup
```bash
# Backend environment (server/.env)
cd server
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret

# Frontend automatically connects to localhost:3000
```

### 3. Start the Application
```bash
# Terminal 1: Start backend server
cd server
npm run build  # Build TypeScript
npm start      # Start server on http://localhost:3000

# Terminal 2: Start frontend development server
cd client
npm run dev    # Start Vite dev server on http://localhost:5173
```

### 4. Access the Application
- **Frontend**: http://localhost:5173 (React + Tailwind CSS interface)
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api-docs (Swagger UI)

## Production Build
```bash
# Build frontend for production
cd client
npm run build

# Build backend for production
cd server
npm run build
npm start
```

## Development Features
- **Hot Reload**: Frontend updates automatically during development
- **TypeScript**: Full type checking for both frontend and backend
- **Tailwind CSS**: Utility-first styling with custom component classes
- **Real-time Updates**: Socket.IO for live marketplace and auction updates
- **Comprehensive Testing**: 104/104 tests passing

## Available Collections
The game includes 15 NFT collections:
- Apathetic Axolotls, Crypto Bananas, Cynical Capybaras
- Distracted Degenerates, Disinterested Ducks, Crypto Lamps
- Crypto Mugs, Crypto Clips, Crypto Pencils, Crypto Plants
- Crypto Potatoes, Sleepy Sloths, Crypto Socks, Crypto Toast, Crypto Toasters

## Notes
- **4-digit PIN**: For satirical purposes, not real security!
- **TypeScript**: Used throughout for type safety and maintainability
- **Testing**: Run `npm test` in server directory for full test suite
- **Documentation**: See README.Milestones.md for development progress