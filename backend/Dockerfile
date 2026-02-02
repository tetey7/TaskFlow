FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv sync with system-wide installation
RUN uv sync && uv pip install --system -e .

# Copy project files
COPY . .

# Make startup script executable
RUN chmod +x start.sh

# Expose port for the application
EXPOSE 8000

# Run startup script
CMD ["./start.sh"]
