#!/bin/bash
python3 manage.py makemigrations
python3 manage.py migrate

# Execute the default command to start the Django server
python3 manage.py runserver 0.0.0.0:80
