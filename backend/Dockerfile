FROM python:3.11-slim

WORKDIR /app

COPY . .
RUN chmod +x run.sh
RUN pip install --upgrade pip && pip install -r requirements.txt


RUN useradd -m ctf
RUN chown -R ctf:ctf /app
USER ctf

CMD ["./run.sh"]