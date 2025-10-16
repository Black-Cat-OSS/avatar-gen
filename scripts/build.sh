#!/bin/bash

# Build script for Docker images
# Usage: ./build.sh [options] [profile]
# profile: sqlite (default) | postgresql
# options: --cache (use cache for faster build)

set -e

PROFILE="sqlite"
USE_CACHE=""

# Parse options
while [ $# -gt 0 ]; do
    case "$1" in
        --cache)
            USE_CACHE="true"
            shift
            ;;
        sqlite|postgresql)
            PROFILE="$1"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo ""
            echo "Usage: ./build.sh [options] [profile]"
            echo ""
            echo "Options:"
            echo "  --cache     Use cache for faster build"
            echo ""
            echo "Profiles:"
            echo "  sqlite      SQLite database (default)"
            echo "  postgresql  PostgreSQL database"
            exit 1
            ;;
    esac
done

echo "🚀 Building Docker images..."
echo "📦 Profile: $PROFILE"
if [ "$USE_CACHE" = "true" ]; then
    echo "⚡ Using cache for faster build..."
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

# Set cache options
CACHE_FLAG=""
if [ "$USE_CACHE" != "true" ]; then
    CACHE_FLAG="--no-cache"
fi

# Build with docker-compose in parallel
if [ "$PROFILE" = "sqlite" ]; then
    echo "🔨 Building with default profile (SQLite + local storage)..."
    docker-compose -f docker/docker-compose.yml build --parallel $CACHE_FLAG
elif [ "$PROFILE" = "postgresql" ]; then
    echo "🔨 Building with PostgreSQL profile..."
    docker-compose -f docker/docker-compose.yml --profile postgresql build --parallel $CACHE_FLAG
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
