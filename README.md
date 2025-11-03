# TaskFlow

Splitwise but better and no ads (for now)!

### Suggested Repo Structure
~~~
TaskFlow/
│── frontend/                 # React + Tailwind app
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
│

├── backend/                  # Backend services
│   ├── api/                  # FastAPI service
│   │   ├── main.py          # FastAPI entry point
│   │   └── routers/         # API route definitions
│   ├── config/              # Django configuration
│   │   ├── settings.py      # Django settings
│   │   ├── env_settings.py  # Environment-based settings
│   │   └── urls.py          # URL routing
│   ├── tasks/               # Django app for tasks
│   ├── manage.py            # Django management script
│   ├── main.py              # Application entry point
│   ├── pyproject.toml       # Python dependencies
│   ├── .env.example         # Example environment variables
│   └── README.md            # Backend documentation
│
│── infra/
│   ├── ecs-fargate/          # Terraform/CDK infra
│   ├── docker-compose.yml    # Local dev setup
│   └── nginx/                # Reverse proxy (optional)
│
│── .github/workflows/        # CI/CD pipelines
│── README.md
└── .gitignore               # Git ignore rules
~~~

## Technology Stack

### Backend
- **Django**: Web framework for models and admin interface
- **FastAPI**: High-performance API framework
- **PostgreSQL**: Database for persistent storage
- **Pydantic**: Data validation and settings management

### Frontend
- React
- NPM
- Tailwind v4 using Vite


## Getting Started

### Using Docker (Recommended)

#### Prerequisites
- Docker
- Docker Compose

1. Clone the repository:
   ```bash
   git clone git@github.com:FarmersClub/TaskFlow.git
   cd TaskFlow
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your database credentials and other settings.
   
   > **Note**: The application uses a root-level `.env` file for both backend and frontend services.

3. Build and start the containers:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

4. Access the API at http://localhost:8000
   - API documentation: http://localhost:8000/docs
   - API documentation (alternative): http://localhost:8000/redoc
   - Health check: http://localhost:8000/health/

5. To view logs:
   ```bash
   docker-compose logs backend  # Backend logs
   docker-compose logs db       # Database logs
   ```

6. To stop the containers:
   ```bash
   docker-compose down
   ```

### Development Workflow with Docker

1. **Code Changes**: The backend code is mounted as a volume, so changes will be automatically detected and the server will reload.

2. **Database Migrations**:
   ```bash
   # Run migrations inside the container
   docker-compose exec backend uv run python manage.py migrate
   
   # Create new migrations
   docker-compose exec backend uv run python manage.py makemigrations
   ```

3. **Creating a Superuser**:
   ```bash
   docker-compose exec backend uv run python manage.py createsuperuser
   ```

4. **Running Tests**:
   ```bash
   docker-compose exec backend uv run pytest
   ```

5. **Accessing PostgreSQL**:
   ```bash
   docker-compose exec db psql -U postgres -d tasks
   ```

### Manual Backend Setup

#### Prerequisites
- Python 3.13+
- PostgreSQL
- uv (Python package manager)

1. Set up environment variables (from project root):
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your database credentials and other settings.

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   uv sync
   ```

4. Run migrations:
   ```bash
   uv run python manage.py migrate
   ```

5. Start the FastAPI server:
   ```bash
   uv run uvicorn api.main:app --reload
   ```

6. Access the API documentation at http://localhost:8000/docs

### Manual Frontend Setup

#### Prerequisites
- Node.js
- NPM

1. Run inside `frontend` folder
```bash
npm install
```

2. For local HMR development
```bash
npm run dev
```
## Troubleshooting

### Docker Issues

1. **Container not starting**
   - Check if ports are already in use: `lsof -i :8000` or `lsof -i :5432`
   - Verify Docker daemon is running
   - Try rebuilding: `docker-compose build --no-cache`

2. **Database connection issues**
   - Check the health endpoint: `curl http://localhost:8000/health/`
   - Verify database credentials in the root `.env` file
   - Inspect database logs: `docker-compose logs db`

3. **Changes not reflecting**
   - Ensure your code is properly mounted as a volume in `docker-compose.yml`
   - Restart the container: `docker-compose restart backend`
   - Check logs for errors: `docker-compose logs backend`

4. **Permission issues**
   - If you encounter permission problems with mounted volumes:
     ```bash
     # Fix ownership issues
     sudo chown -R $(whoami) ./backend
     ```
