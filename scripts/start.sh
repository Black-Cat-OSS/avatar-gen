#!/bin/bash

# Start script for Avatar Generator

echo "🚀 Starting Avatar Generator..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start services
echo "🔨 Starting services with docker-compose..."
docker-compose up --build

echo "✅ Services started!"
echo "🌐 Backend API: http://localhost:3000"
echo "📊 Health check: http://localhost:3000/api/health"
