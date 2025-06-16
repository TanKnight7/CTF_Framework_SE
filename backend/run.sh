#!/bin/bash

python3 manage.py makemigrations
python3 manage.py migrate
daphne -b 0.0.0.0 -p 80 backend.asgi:application &

python3 config.py
wait