#!/bin/bash

# Start script for Avatar Generator
# Usage: ./start.sh [profile] [options]
# profile: sqlite (default) | postgresql
# options: --build | -b (rebuild images before starting)

set -e

PROFILE="${1:-sqlite}"
BUILD_FLAG=""

# Parse options
shift || true
while [ $# -gt 0 ]; do
    case "$1" in
        --build|-b)
            BUILD_FLAG="--build"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "🚀 Starting Avatar Generator..."
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

# Start services based on profile
if [ "$PROFILE" = "sqlite" ]; then
    echo "🔨 Starting services with SQLite..."
    docker-compose -f docker/docker-compose.yml -f docker/docker-compose.sqlite.yml up $BUILD_FLAG
elif [ "$PROFILE" = "postgresql" ]; then
    echo "🔨 Starting services with PostgreSQL..."
    docker-compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql up $BUILD_FLAG
else
    echo "❌ Invalid profile: $PROFILE"
    echo "Valid profiles: sqlite, postgresql"
    exit 1
fi

echo ""
echo "✅ Services started!"
echo "🌐 Gateway (HTTPS): https://localhost:12745"
echo "🌐 Gateway (HTTP): http://localhost"
echo "🌐 Frontend: https://localhost:12745/"
echo "🌐 Backend API: https://localhost:12745/api"
echo "📚 Swagger docs: https://localhost:12745/api/swagger"
echo "📊 Health check: https://localhost:12745/api/health"
