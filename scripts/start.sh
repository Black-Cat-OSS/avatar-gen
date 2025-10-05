#!/bin/bash

# Start script for Avatar Generator
# 
# Usage: ./start.sh [options]
#
# Options: 
#   --db TYPE           Database type: sqlite (default) | postgresql
#   --storage TYPE      Storage type: local (default) | s3
#   --build | -b        Rebuild images before starting
#
# Examples:
#   ./start.sh                                      # SQLite + local storage
#   ./start.sh --db postgresql                      # PostgreSQL + local storage
#   ./start.sh --storage s3                         # SQLite + S3 storage
#   ./start.sh --db postgresql --storage s3         # PostgreSQL + S3 storage
#   ./start.sh --db postgresql --storage s3 -b      # PostgreSQL + S3 + rebuild

set -e

DB_TYPE="sqlite"
BUILD_FLAG=""
STORAGE_TYPE="local"

# Parse options
while [ $# -gt 0 ]; do
    case "$1" in
        --db)
            DB_TYPE="$2"
            shift 2
            ;;
        --storage)
            STORAGE_TYPE="$2"
            shift 2
            ;;
        --build|-b)
            BUILD_FLAG="--build"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo ""
            echo "Usage: ./start.sh [options]"
            echo ""
            echo "Options:"
            echo "  --db TYPE        Database type: sqlite (default) | postgresql"
            echo "  --storage TYPE   Storage type: local (default) | s3"
            echo "  --build | -b     Rebuild images before starting"
            exit 1
            ;;
    esac
done

echo "🚀 Starting Avatar Generator..."
echo "📦 Database: $DB_TYPE"
echo "💾 Storage: $STORAGE_TYPE"

# Validate database type
if [ "$DB_TYPE" != "sqlite" ] && [ "$DB_TYPE" != "postgresql" ]; then
    echo "❌ Invalid database type: $DB_TYPE"
    echo "Valid database types: sqlite, postgresql"
    exit 1
fi

# Validate storage type
if [ "$STORAGE_TYPE" != "local" ] && [ "$STORAGE_TYPE" != "s3" ]; then
    echo "❌ Invalid storage type: $STORAGE_TYPE"
    echo "Valid storage types: local, s3"
    exit 1
fi

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

# Setup environment variables for docker-compose
export DATABASE_PROVIDER=$DB_TYPE
export STORAGE_TYPE=$STORAGE_TYPE

# Setup database URL based on type
if [ "$DB_TYPE" = "sqlite" ]; then
    echo "🔨 Using SQLite database..."
    export DATABASE_URL="file:./storage/database/database.sqlite"
    PROFILE_FLAG=""
elif [ "$DB_TYPE" = "postgresql" ]; then
    echo "🔨 Using PostgreSQL database..."
    export DATABASE_URL="postgresql://postgres:password@postgres:5432/avatar_gen"
    PROFILE_FLAG="--profile postgresql"
fi

# Setup storage configuration
if [ "$STORAGE_TYPE" = "s3" ]; then
    echo "💾 Using S3 storage..."
    
    # Warn if S3 credentials are not set
    if [ -z "$S3_BUCKET" ] || [ -z "$S3_ACCESS_KEY" ] || [ -z "$S3_SECRET_KEY" ]; then
        echo "⚠️  WARNING: S3 credentials not found in environment variables!"
        echo "   Make sure to set: S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY"
        echo "   Or configure them in backend/settings.yaml"
    fi
else
    echo "💾 Using local storage..."
fi

# Start services
echo ""
echo "🚀 Starting services..."
echo "🏷️  Profile: ${PROFILE_FLAG:-default}"
echo "🌍 Environment:"
echo "   DATABASE_PROVIDER=$DATABASE_PROVIDER"
echo "   DATABASE_URL=$DATABASE_URL"
echo "   STORAGE_TYPE=$STORAGE_TYPE"
echo ""

docker-compose -f docker/docker-compose.yml $PROFILE_FLAG up $BUILD_FLAG

echo ""
echo "✅ Services started!"
echo "🌐 Gateway (HTTPS): https://localhost:12745"
echo "🌐 Gateway (HTTP): http://localhost"
echo "🌐 Frontend: https://localhost:12745/"
echo "🌐 Backend API: https://localhost:12745/api"
echo "📚 Swagger docs: https://localhost:12745/api/swagger"
echo "📊 Health check: https://localhost:12745/api/health"
