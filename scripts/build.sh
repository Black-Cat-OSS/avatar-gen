#!/bin/bash

# Build script for Docker images
# Usage: ./build.sh [profile]
# profile: sqlite (default) | postgresql

set -e

PROFILE="${1:-sqlite}"

echo "🚀 Building Docker images..."
echo "📦 Profile: $PROFILE"

# Validate profile
if [ "$PROFILE" != "sqlite" ] && [ "$PROFILE" != "postgresql" ]; then
    echo "❌ Invalid profile: $PROFILE"
    echo "Valid profiles: sqlite, postgresql"
    exit 1
fi

# Change to project root
cd "$(dirname "$0")/.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Set environment variables for BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Build with docker-compose in parallel
if [ "$PROFILE" = "sqlite" ]; then
    echo "🔨 Building with default profile (SQLite + local storage)..."
    docker-compose -f docker/docker-compose.yml build --parallel
elif [ "$PROFILE" = "postgresql" ]; then
    echo "🔨 Building with PostgreSQL profile..."
    docker-compose -f docker/docker-compose.yml --profile postgresql build --parallel
fi

# Show image sizes
echo ""
echo "📊 Built images:"
docker images | grep -E "avatar-gen|REPOSITORY"

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "To start services:"
if [ "$PROFILE" = "sqlite" ]; then
    echo "  ./scripts/start.sh"
    echo "  # or"
    echo "  docker-compose -f docker/docker-compose.yml up"
else
    echo "  ./scripts/start.sh --db postgresql"
    echo "  # or"
    echo "  docker-compose -f docker/docker-compose.yml --profile postgresql up"
fi
