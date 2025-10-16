#!/bin/bash

# Start script for Avatar Generator
# 
# Usage: ./start.sh [options]
#
# Options: 
#   --db TYPE           Database type: sqlite (default) | postgresql | postgresql-external
#   --storage TYPE      Storage type: local (default) | s3
#   --build | -b        Rebuild images before starting
#   --dev | -d          Start in development mode (detached)
#   --logs              Show logs after starting
#
# Examples:
#   ./start.sh                                      # SQLite + local storage
#   ./start.sh --db postgresql                      # PostgreSQL (container) + local storage
#   ./start.sh --db postgresql-external             # PostgreSQL (external) + local storage
#   ./start.sh --storage s3                         # SQLite + S3 storage
#   ./start.sh --db postgresql --storage s3         # PostgreSQL + S3 storage
#   ./start.sh --db postgresql --storage s3 -b      # PostgreSQL + S3 + rebuild
#   ./start.sh --dev                                # Development mode (detached)
#   ./start.sh --dev --logs                         # Dev mode + show logs
#
# Note: For postgresql-external, set DATABASE_URL environment variable first:
#   export DATABASE_URL=postgresql://user:password@host:5432/dbname
#   ./start.sh --db postgresql-external

set -e

DB_TYPE="sqlite"
BUILD_FLAG=""
STORAGE_TYPE="local"
DEV_MODE=""
SHOW_LOGS=""

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
        --dev|-d)
            DEV_MODE="true"
            shift
            ;;
        --logs)
            SHOW_LOGS="true"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo ""
            echo "Usage: ./start.sh [options]"
            echo ""
            echo "Options:"
            echo "  --db TYPE        Database type: sqlite (default) | postgresql | postgresql-external"
            echo "  --storage TYPE   Storage type: local (default) | s3"
            echo "  --build | -b     Rebuild images before starting"
            echo "  --dev | -d       Start in development mode (detached)"
            echo "  --logs           Show logs after starting"
            echo ""
            echo "Note: For postgresql-external, set DATABASE_URL first:"
            echo "  export DATABASE_URL=postgresql://user:password@host:5432/dbname"
            exit 1
            ;;
    esac
done

echo "🚀 Starting Avatar Generator..."
echo "📦 Database: $DB_TYPE"
echo "💾 Storage: $STORAGE_TYPE"
if [ "$DEV_MODE" = "true" ]; then
    echo "🔧 Development mode: detached"
fi

# Validate database type
if [ "$DB_TYPE" != "sqlite" ] && [ "$DB_TYPE" != "postgresql" ] && [ "$DB_TYPE" != "postgresql-external" ]; then
    echo "❌ Invalid database type: $DB_TYPE"
    echo "Valid database types: sqlite, postgresql, postgresql-external"
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
export STORAGE_TYPE=$STORAGE_TYPE

# Setup database configuration based on type
if [ "$DB_TYPE" = "sqlite" ]; then
    echo "🔨 Using SQLite database..."
    export DATABASE_PROVIDER="sqlite"
    export DATABASE_URL="file:./storage/database/database.sqlite"
    PROFILE_FLAG=""
elif [ "$DB_TYPE" = "postgresql" ]; then
    echo "🔨 Using PostgreSQL database (container)..."
    export DATABASE_PROVIDER="postgresql"
    export DATABASE_URL="postgresql://postgres:password@postgres:5432/avatar_gen"
    PROFILE_FLAG="--profile postgresql"
elif [ "$DB_TYPE" = "postgresql-external" ]; then
    echo "🔨 Using PostgreSQL database (external)..."
    export DATABASE_PROVIDER="postgresql"
    
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ ERROR: DATABASE_URL environment variable is not set!"
        echo "   Please set it before running this script:"
        echo "   export DATABASE_URL=postgresql://user:password@host:5432/dbname"
        exit 1
    fi
    
    echo "   Connection: $DATABASE_URL"
    PROFILE_FLAG=""
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

# Determine startup mode
START_MODE=""
if [ "$DEV_MODE" = "true" ]; then
    START_MODE="-d"
fi

docker-compose -f docker/docker-compose.yml $PROFILE_FLAG up $BUILD_FLAG $START_MODE

echo ""
echo "✅ Services started!"
echo "🌐 Gateway (HTTPS): https://localhost:12745"
echo "🌐 Gateway (HTTP): http://localhost"
echo "🌐 Frontend: https://localhost:12745/"
echo "🌐 Backend API: https://localhost:12745/api"
echo "📚 Swagger docs: https://localhost:12745/api/swagger"
echo "📊 Health check: https://localhost:12745/api/health"

# Show logs if requested
if [ "$SHOW_LOGS" = "true" ]; then
    echo ""
    echo "📋 Showing logs..."
    docker-compose -f docker/docker-compose.yml $PROFILE_FLAG logs -f --timestamps
fi
