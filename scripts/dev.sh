#!/bin/bash

# Development script for Avatar Generator

echo "🔧 Starting Avatar Generator in development mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start services in detached mode for development
echo "🔨 Starting services in background..."
docker-compose up --build -d

echo "✅ Services started in background!"
echo "🌐 Backend API: http://localhost:3000"
echo "📊 Health check: http://localhost:3000/api/health"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: ./scripts/stop.sh"
echo "  Rebuild: docker-compose up --build"
