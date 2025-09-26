#!/bin/sh

# Always create a fresh database in container
echo "Creating fresh database..."
npx prisma migrate deploy

# Start the application
echo "Starting avatar generator application..."
exec node dist/main.js
