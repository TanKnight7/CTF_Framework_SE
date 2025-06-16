import os
import django
import time

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings") 
django.setup()


import yaml
from user.models import User

with open("config.yml", "r") as f:
    config = yaml.safe_load(f)

username = config['credentials']['admin_username']
email = config['credentials']['admin_email']
password = config['credentials']['admin_password']

while True:
    try:
        User.objects.get(username=username)
        print(f"User '{username}' already exists.")
        break
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='admin',
            is_staff=True
        )
        user.save()
        print(f"User '{username}' created successfully.")
    time.sleep(2)
