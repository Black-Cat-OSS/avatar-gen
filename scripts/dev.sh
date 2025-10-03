#!/bin/bash

# Development script for Avatar Generator
# Usage: ./dev.sh [profile]
# profile: sqlite (default) | postgresql

set -e

PROFILE="${1:-sqlite}"

echo "🔧 Starting Avatar Generator in development mode..."
echo "📦 Profile: $PROFILE"

# Change to project root
cd "$(dirname "$0")/.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create external network if it doesn't exist
echo "🌐 Checking external network..."
if ! docker network ls | grep -q "avatar-gen-external"; then
    echo "📡 Creating external network 'avatar-gen-external'..."
    docker network create avatar-gen-external
    echo "✅ External network created"
else
    echo "✅ External network already exists"
fi

# Start services in detached mode for development
if [ "$PROFILE" = "sqlite" ]; then
    echo "🔨 Starting services with SQLite in background..."
    docker-compose -f docker/docker-compose.yml -f docker/docker-compose.sqlite.yml up -d
elif [ "$PROFILE" = "postgresql" ]; then
    echo "🔨 Starting services with PostgreSQL in background..."
    docker-compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql up -d
else
    echo "❌ Invalid profile: $PROFILE"
    echo "Valid profiles: sqlite, postgresql"
    exit 1
fi

echo ""
echo "✅ Services started in background!"
echo "🌐 Gateway (HTTPS): https://localhost:12745"
echo "🌐 Gateway (HTTP): http://localhost"
echo "🌐 Frontend: https://localhost:12745/"
echo "🌐 Backend API: https://localhost:12745/api"
echo "📚 Swagger docs: https://localhost:12745/api/swagger"
echo "📊 Health check: https://localhost:12745/api/health"
echo ""
echo "📋 Useful commands:"
if [ "$PROFILE" = "sqlite" ]; then
    echo "  View logs: docker-compose -f docker/docker-compose.yml -f docker/docker-compose.sqlite.yml logs -f"
else
    echo "  View logs: docker-compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql logs -f"
fi
echo "  Stop services: ./scripts/stop.sh"
echo "  Restart: ./scripts/dev.sh $PROFILE"
