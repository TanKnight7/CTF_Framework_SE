#!/bin/bash
# docker-entrypoint.sh

# Run Django migrations and makemigrations
python3 manage.py makemigrations
python3 manage.py migrate

# Execute the default command to start the Django server
exec "$@"
