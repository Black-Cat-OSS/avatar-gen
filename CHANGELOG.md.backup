# Changelog

Все значимые изменения в этом проекте будут документированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), и
этот проект придерживается
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Color scheme synchronization between frontend and backend**
  - Added all 8 frontend color palettes to backend generator
  - Fixed 400 error for 'forest' and other color schemes
  - Unified field naming: frontend sends 'type', backend saves to
    'generatorType'
  - Removed duplicate generatorType field from DTO
  - Updated API interfaces for consistency

### Changed

- **Field naming standardization**
  - Frontend now sends 'type' instead of 'generatorType'
  - Backend receives 'type' and saves to 'generatorType' in database
  - Cleaner architecture without duplicate fields

## [0.0.3] - 2025-01-XX

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

- **Configuration System Improvements**
  - Added comprehensive YAML configuration unit tests
  - Implemented network schema separation for better configuration management
  - Enhanced configuration validation and error handling

- **Frontend UI Enhancements**
  - Replaced error messages with modern Callout components
  - Refactored Input component to InputField for better reusability
  - Improved user experience with better component organization

- **Development Infrastructure**
  - Added development-specific Docker Compose configuration
  - Implemented comprehensive E2E testing profiles
  - Enhanced testing system with improved Jest configuration

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

- **Workflow Simplification**
  - Removed all GitHub workflows with migration to new system
  - Cleaned up unused Docker configurations
  - Removed deprecated settings and docker-compose files

### Changed

- **Database Configuration**
  - Database configuration now handled entirely through YAML files
  - Automatic schema synchronization replaces manual migrations in development
  - Simplified connection setup for both PostgreSQL and SQLite

- **Startup Process**
  - Simplified start.sh script removes Prisma-specific commands
  - TypeORM handles database initialization automatically
  - Faster application startup time

- **Docker Configuration**
  - Streamlined Dockerfile for backend services
  - Optimized Docker configurations for better performance
  - Improved container build process

- **Testing Infrastructure**
  - Updated Jest CLI options to use testPathPatterns
  - Enhanced testing configuration for better coverage
  - Improved integration test setup

### Fixed

- **PostgreSQL DATABASE_URL Issue Resolution**
  - Fixed Prisma schema provider mismatch (changed from sqlite to postgresql)
  - Resolved "Environment variable not found: DATABASE_URL" error
  - Eliminated dependency on .env files for database configuration

- **Configuration and Build Issues**
  - Added proper type casting for TypeORM configuration
  - Resolved linter and lockfile compatibility issues
  - Fixed integration configuration in TypeScript config
  - Restored original Dockerfile functionality

- **Development Environment**
  - Fixed start.sh script compatibility with Prisma runner
  - Resolved Docker configuration conflicts
  - Improved development environment stability

### Documentation

- **Updated Documentation**
  - Updated Database Module README with TypeORM information
  - Updated main README with new tech stack
  - Added TypeORM migration documentation
  - Updated API examples for new database service
  - Added E2E test profiles and comprehensive testing reports

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
