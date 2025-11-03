# TaskFlow Backend

## Overview
This is the backend service for the TaskFlow, a platform designed to help users manage their tasks and projects.

## Tech Stack
- **Django**: Web framework for database models and admin interface
- **FastAPI**: API framework for high-performance endpoints
- **PostgreSQL**: Database for storing application data
- **Pydantic**: Data validation and settings management

## Environment Setup

### Prerequisites
- Python 3.13+
- PostgreSQL
- uv (Python package manager)

### Environment Variables
The application uses environment variables for configuration. Copy the `.env.example` file to create your own `.env` file:

```bash
cp .env.example .env
```

Adjust the values in the `.env` file according to your local setup.

### Key Environment Variables
- `DEBUG`: Set to `True` for development, `False` for production
- `SECRET_KEY`: Django secret key (change for production)
- `DB_*`: Database connection parameters
- `ALLOWED_HOSTS`: List of allowed hosts for Django

## Installation

1. Clone the repository
2. Set up your environment variables (see above)
3. Install dependencies:
   ```bash
   uv sync
   ```
4. Run migrations:
   ```bash
   uv run python manage.py migrate
   ```

## API Endpoints

### Health Check
To verify the API is running properly:
```
GET http://localhost:8000/health/
```
Returns a 200 OK response when the service is operational.

## Running the Application

### FastAPI Development Server
```bash
uv run uvicorn api.main:app --reload
```

## API Documentation
When running the FastAPI server, API documentation is available at:
- Swagger UI: `/docs`
- ReDoc: `/redoc`

## Security Notes
- The `.env` file contains sensitive information and is excluded from version control
- Always use environment variables for secrets and configuration
- Change the `SECRET_KEY` in production environments

## Docker Setup

### Prerequisites
- Docker
- Docker Compose

### Running with Docker

The backend and database can be run using Docker Compose:

```bash
# From the project root directory
docker-compose up
```

This will start:
- PostgreSQL database on port 5433 (mapped to internal port 5432)
- Backend service on port 8000

### Development with Docker

The Docker setup includes volume mounts for the backend code, enabling hot-reloading during development. Changes made to your local files will be reflected in the running container.

### Environment Variables in Docker

Environment variables are defined in the `docker-compose.yml` file. For local development, these values are set directly in the compose file. For production, you should use environment-specific configuration.