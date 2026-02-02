#!/bin/bash
set -e

echo "=== Starting Django Application ==="
echo "PORT: ${PORT:-8000}"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."

echo "=== Running Migrations ==="
python manage.py migrate

echo "=== Starting Gunicorn ==="
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers 2 \
    --log-level debug \
    --access-logfile - \
    --error-logfile - \
    --capture-output \
    --enable-stdio-inheritance
