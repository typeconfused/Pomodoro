#!/bin/bash

# start.sh
echo "Starting Pomodoro Application..."

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start backend
echo "Installing backend dependencies..."
cd "$SCRIPT_DIR/backend"
npm install

echo "Starting backend server..."
node server.js &
BACKEND_PID=$!

# Start frontend
echo "Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"

# Update package.json with browserslist before npm install
cat > package.json << EOL
{
  "name": "pomodoro-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "axios": "^1.6.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.3.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
EOL

npm install

echo "Starting frontend development server..."
# Run React Scripts without interactive prompt
BROWSER=none CI=true npm start &
FRONTEND_PID=$!

echo "Application is starting..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API is running at: http://localhost:3001"

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID
