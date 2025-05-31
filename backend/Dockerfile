FROM python:3.11-slim

WORKDIR /app

COPY ./requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .
RUN chmod +x ./run.sh

RUN useradd -m ctf
RUN chown -R ctf:ctf /app
USER ctf

CMD ["./run.sh"]