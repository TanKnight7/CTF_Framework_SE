## Masuk ke postgresqlnya

docker exec -it softeng_db psql -U myuser -d mydb

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
