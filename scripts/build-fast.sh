#!/bin/bash

# Fast build script with maximum parallelization and caching
# Usage: ./build-fast.sh [profile]
# profile: sqlite (default) | postgresql

set -e

PROFILE="${1:-sqlite}"

echo "⚡ Fast building with maximum parallelization..."
echo "📦 Profile: $PROFILE"

# Change to project root
cd "$(dirname "$0")/.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Set environment variables for maximum parallel processing
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export BUILDKIT_PROGRESS=plain

# Build with maximum parallelization (WITH cache for speed)
if [ "$PROFILE" = "sqlite" ]; then
    echo "🔨 Building with SQLite profile and parallel processing..."
    docker-compose -f docker/docker-compose.yml -f docker/docker-compose.sqlite.yml build --parallel
elif [ "$PROFILE" = "postgresql" ]; then
    echo "🔨 Building with PostgreSQL profile and parallel processing..."
    docker-compose -f docker/docker-compose.yml -f docker/docker-compose.postgresql.yml --profile postgresql build --parallel
else
    echo "❌ Invalid profile: $PROFILE"
    echo "Valid profiles: sqlite, postgresql"
    exit 1
fi

# Show image sizes
echo ""
echo "📊 Built images:"
docker images | grep -E "avatar-gen|REPOSITORY"

echo ""
echo "✅ Fast build completed successfully!"
echo ""
echo "💡 Tip: Use './build.sh' for a clean build without cache"
