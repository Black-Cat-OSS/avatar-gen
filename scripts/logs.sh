#!/bin/bash

# Simple logs script for Avatar Generator
# Usage: ./logs.sh [options]
# options: --follow | -f (follow logs)

set -e

FOLLOW_FLAG=""

# Parse options
while [ $# -gt 0 ]; do
    case "$1" in
        --follow|-f)
            FOLLOW_FLAG="-f"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo ""
            echo "Usage: ./logs.sh [options]"
            echo ""
            echo "Options:"
            echo "  --follow | -f  Follow logs (default)"
            exit 1
            ;;
    esac
done

# Change to project root
cd "$(dirname "$0")/.."

echo "📋 Showing Avatar Generator logs..."

# Show logs with timestamps (follow by default)
docker-compose -f docker/docker-compose.yml logs $FOLLOW_FLAG --timestamps
