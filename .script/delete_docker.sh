#!/bin/bash
docker stop softeng_nginx softeng_backend softeng_db
docker rm softeng_nginx softeng_backend softeng_db
docker rmi softeng_backend
docker volume rm ctf_framework_se_postgres_data
