# Use Node.js LTS base image
FROM node:18-alpine

# Install bash (needed by startup script)
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
RUN cd backend && npm install
# Install frontend dependencies
RUN cd frontend && npm install

# Copy all source code
COPY . .

# Expose the ports used by the app
EXPOSE 3000 3001

# Run the startup script to start both frontend and backend
CMD ["./startup-script.sh"]