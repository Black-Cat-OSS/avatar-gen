# Changelog

Все значимые изменения в этом проекте будут документированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), и
этот проект придерживается
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Major Changes

- **Migration from Prisma to TypeORM**
  - Replaced Prisma ORM with TypeORM for better multi-database support
  - Removed dependency on .env files for database configuration
  - Simplified database setup and configuration
  - Added automatic schema synchronization in development mode
  - Maintained full API compatibility with existing code

### Added

- **TypeORM Integration**
  - Added @nestjs/typeorm package for NestJS integration
  - Added PostgreSQL (pg) and SQLite (sqlite3) drivers
  - Created Avatar entity with TypeORM decorators
  - Implemented automatic database schema synchronization
  - Added TypeORM migration support

- **Enhanced Database Module**
  - Simplified DatabaseService with TypeORM Repository pattern
  - Added automatic connection management
  - Improved health check functionality
  - Better error handling and logging

- **New Scripts**
  - `typeorm:generate` - Generate database migrations
  - `typeorm:run` - Run pending migrations
  - `typeorm:revert` - Revert last migration
  - `typeorm:create` - Create new migration file

### Removed

- **Prisma Dependencies**
  - Removed @prisma/client and prisma packages
  - Deleted prisma/ directory with schema and migrations
  - Removed prisma-runner.js script
  - Eliminated Prisma-specific npm scripts

- **Complex Configuration**
  - Removed need for .env files
  - Simplified start.sh script
  - Eliminated complex Prisma client generation
  - Removed .env file generation from Docker pipeline
  - Cleaned up .gitignore from .env file references
  - Simplified Docker Compose environment configurations

### Changed

- **Database Configuration**
  - Database configuration now handled entirely through YAML files
  - Automatic schema synchronization replaces manual migrations in development
  - Simplified connection setup for both PostgreSQL and SQLite

- **Startup Process**
  - Simplified start.sh script removes Prisma-specific commands
  - TypeORM handles database initialization automatically
  - Faster application startup time

### Fixed

- **PostgreSQL DATABASE_URL Issue Resolution**
  - Fixed Prisma schema provider mismatch (changed from sqlite to postgresql)
  - Resolved "Environment variable not found: DATABASE_URL" error
  - Eliminated dependency on .env files for database configuration

### Documentation

- **Updated Documentation**
  - Updated Database Module README with TypeORM information
  - Updated main README with new tech stack
  - Added TypeORM migration documentation
  - Updated API examples for new database service

## [0.0.2] - 2025-10-07

### Added

- **Enhanced Logging System**
  - Implemented Pino logging with structured logging
  - Added file rotation with pino-roll
  - Enhanced log formatting and levels
  - Added request/response logging middleware

- **Production Configuration**
  - Added production-specific configuration scripts
  - Enhanced Docker deployment configuration
  - Added environment-specific logging settings

- **Documentation Improvements**
  - Added comprehensive deployment guide
  - Enhanced logging documentation
  - Updated configuration examples

### Fixed

- **Configuration Issues**
  - Fixed PostgreSQL connection parameters
  - Resolved configuration validation issues
  - Improved error handling in configuration loading

## [0.0.1] - 2025-10-02

### Added

- **Initial Release**
  - Avatar generation service with NestJS
  - Support for multiple image sizes (16x16 to 512x512)
  - Color customization and filtering options
  - SQLite and PostgreSQL database support
  - Docker containerization
  - Comprehensive test coverage
  - OpenAPI/Swagger documentation
  - YAML-based configuration system

- **Core Features**
  - Avatar generation with custom colors
  - File-based storage system
  - Database persistence with ORM
  - Health check endpoints
  - Request validation and error handling
