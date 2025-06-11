## Masuk ke postgresqlnya

docker exec -it softeng_db psql -U myuser -d mydb

## CREATE USER WITH ADMIN ROLE

docker exec -it softeng_backend python3 manage.py shell

from user.models import User
user = User.objects.create_user(
username='admin',
email='admin@gmail.com',
password='adminpassword123',
role='admin'
)
user.save()

## RUN TEST CASES

docker exec -it softeng_backend python3 manage.py test

## List all databases

\l

## Change db

\c mydb

## List tables of db

\dt

## Quit

\q

## debugging tips (interactive terminal for testing)

import pdb
pdb.set_trace()
