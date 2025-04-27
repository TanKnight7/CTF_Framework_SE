FROM python:3.11-slim

WORKDIR /app

COPY . .
RUN pip install --upgrade pip && pip install -r requirements.txt

RUN useradd -m ctf
RUN chown -R ctf:ctf /app
USER ctf

CMD ["python3", "manage.py", "runserver", "0.0.0.0:80"]