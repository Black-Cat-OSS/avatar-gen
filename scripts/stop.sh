#!/bin/bash

# Stop script for Avatar Generator
# Usage: ./stop.sh [options]
# options: -v | --volumes (remove volumes and data)

set -e

REMOVE_VOLUMES=""

# Parse options
while [ $# -gt 0 ]; do
    case "$1" in
        -v|--volumes)
            REMOVE_VOLUMES="-v"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "🛑 Stopping Avatar Generator..."

# Change to project root
cd "$(dirname "$0")/.."

# Stop and remove containers
if [ -n "$REMOVE_VOLUMES" ]; then
    echo "🧹 Stopping services and removing volumes..."
    docker-compose -f docker/docker-compose.yml down $REMOVE_VOLUMES
    echo "⚠️  All data volumes have been removed!"
else
    echo "🔨 Stopping services..."
    docker-compose -f docker/docker-compose.yml down
fi

echo ""
echo "✅ Services stopped successfully!"
echo ""
echo "💡 To also remove volumes and data, use: ./stop.sh --volumes"
