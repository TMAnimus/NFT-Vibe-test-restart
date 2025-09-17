# Environment Variables Documentation

## Overview
This document lists all environment variables used in the NFT Trading Game, including their purpose, default values, and configuration options.

## Required Variables

### Server Configuration
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | 3000 | No |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | Secret for JWT token signing | - | Yes |

### Socket.IO Configuration
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SOCKET_PING_TIMEOUT` | Socket ping timeout in ms | 5000 | No |
| `SOCKET_PING_INTERVAL` | Socket ping interval in ms | 10000 | No |

### Game Mechanics
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|

### Development and Testing
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode (development/production) | 'development' | No |
| `LOG_LEVEL` | Logging verbosity | 'info' | No |
| `DISABLE_REAL_TIME` | Disable real-time updates for testing | false | No |

# Example Configuration
```env
# Server
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nft_game
JWT_SECRET=your-secret-key

# Socket.IO
SOCKET_PING_TIMEOUT=5000
SOCKET_PING_INTERVAL=10000

# Development
NODE_ENV=development
LOG_LEVEL=debug
```

## Notes
- For development, you can use shorter tick intervals by adjusting `DEVELOPMENT_TICK_SPEED`
- In production, make sure to set secure values for `JWT_SECRET`
- Use `DISABLE_REAL_TIME=true` when running certain tests that don't require Socket.IO
