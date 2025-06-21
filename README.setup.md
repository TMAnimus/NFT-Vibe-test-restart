# Installation and Setup

## Overview
This guide provides step-by-step instructions to set up the *NFT Trading Game* locally for development or testing. It assumes you have completed Milestones 1–3 (Project Setup, User Authentication, NFT Creation System). See [README.md](README.md) for project details.

## Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: v6 or higher (running locally or via a cloud provider)
- **Git**: For cloning the repository
- **NPM**: Comes with Node.js

## Installation Steps
1. **Clone the Repository**  
   ```bash
   git clone <repo-url>
   cd nft-trading-game
   ```

2. **Install Dependencies**  
   Install Node.js packages:
   ```bash
   npm install
   ```

3. **Set Up MongoDB**  
   - Ensure MongoDB is running locally (`mongod`) or provide a connection string for a remote instance.
   - Create a database named `nft-game` (or update the connection string accordingly).

4. **Configure Environment Variables**  
   Create a `.env` file in the project root:
   ```env
   MONGO_URI=mongodb://localhost:27017/nft-game
   JWT_SECRET=your-super-secret-key
   PORT=3000
   ```
   - Replace `your-super-secret-key` with a random string for JWT signing.
   - Adjust `MONGO_URI` if using a remote MongoDB instance.

5. **Run the Server**  
   Start the Node.js server:
   ```bash
   npm start
   ```

6. **Access the Application**  
   Open a browser and navigate to `http://localhost:3000`. You should see the front-end page with options to register, log in, and create NFTs.

## Troubleshooting
- **MongoDB Connection Error**: Ensure MongoDB is running and `MONGO_URI` is correct. Check `mongod` logs for issues.
- **Port Conflict**: If port 3000 is in use, update `PORT` in `.env` or kill the conflicting process.
- **Missing Dependencies**: Run `npm install` again or check `package.json` for missing packages.
- **JWT Errors**: Verify `JWT_SECRET` is set and matches across server restarts.

## Testing
To run Jest unit tests (e.g., for NFT Creation System):
```bash
npm test
```
Tests are located in the `tests/` directory.

## Notes
- The 4-digit PIN authentication is intentionally simplistic for satirical purposes. Do not use this setup for production systems requiring real security.
- Ensure your MongoDB instance is secure (e.g., no public access) during development.