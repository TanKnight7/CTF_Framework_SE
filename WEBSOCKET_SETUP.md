# WebSocket Real-time Chat Setup

This document explains the WebSocket implementation for real-time chat functionality in the CTF Framework.

## Backend Setup

### Dependencies

Add the following to `backend/requirements.txt`:

```
channels
channels-redis
daphne
```

### Installation

```bash
cd backend
pip install channels channels-redis daphne
```

### Configuration

1. **Settings (`backend/settings.py`)**:

   - Added `'channels'` to `INSTALLED_APPS`
   - Added `ASGI_APPLICATION = 'backend.asgi.application'`
   - Added `CHANNEL_LAYERS` configuration for in-memory channel layer

2. **ASGI Configuration (`backend/asgi.py`)**:

   - Configured to handle both HTTP and WebSocket protocols
   - Uses custom `TokenAuthMiddleware` for WebSocket authentication

3. **WebSocket Consumer (`backend/ticket/consumers.py`)**:

   - Handles real-time message sending and receiving
   - Supports typing indicators
   - Saves messages to database

4. **Routing (`backend/ticket/routing.py`)**:

   - Defines WebSocket URL patterns

5. **Authentication Middleware (`backend/ticket/middleware.py`)**:
   - Handles token-based authentication for WebSocket connections

## Frontend Setup

### WebSocket Service (`frontend/client/src/services/websocketService.js`)

- Manages WebSocket connections
- Handles reconnection logic
- Provides event-based messaging system
- Supports typing indicators

### Integration with TicketChat Component

- Automatically connects to WebSocket when entering a ticket
- Sends messages via WebSocket when connected
- Falls back to REST API if WebSocket is unavailable
- Shows real-time connection status
- Displays typing indicators

## Nginx Configuration

### Updated Nginx Config (`nginx/nginx.conf`)

The Nginx configuration has been updated to support WebSocket connections:

```nginx
events {}

http {
    client_max_body_size 30M;

    # WebSocket support
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    server {
        listen 80;

        # WebSocket connections for ticket chat
        location /ws/ {
            proxy_pass http://softeng_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket specific settings
            proxy_read_timeout 86400;
            proxy_send_timeout 86400;
            proxy_connect_timeout 60;

            # Disable buffering for real-time communication
            proxy_buffering off;
            proxy_cache off;
        }

        # ... other location blocks
    }
}
```

### Key Nginx WebSocket Settings:

- **Upgrade Headers**: Properly handles WebSocket upgrade requests
- **Connection Mapping**: Maps HTTP upgrade to WebSocket connection
- **Timeouts**: Extended timeouts for long-lived WebSocket connections
- **Buffering**: Disabled buffering for real-time communication

## Docker Configuration

### Updated Docker Compose (`docker-compose.yml`)

The backend service now runs with Daphne ASGI server:

```yaml
backend:
  build: ./backend
  container_name: softeng_backend
  command: daphne -b 0.0.0.0 -p 80 backend.asgi:application
  # ... other settings
```

### Updated Backend Run Script (`backend/run.sh`)

```bash
#!/bin/bash

python3 manage.py makemigrations
python3 manage.py migrate
daphne -b 0.0.0.0 -p 80 backend.asgi:application
```

## Usage

### Starting with Docker

```bash
docker-compose up --build
```

### Starting the Backend Manually

```bash
cd backend
python manage.py runserver  # For development
# OR
daphne -b 0.0.0.0 -p 8000 backend.asgi:application  # For production
```

The server will now support both HTTP and WebSocket connections.

### WebSocket URL Format

```
ws://localhost:9999/ws/tickets/{ticket_id}/?token={auth_token}
```

### Message Format

```json
{
  "type": "message",
  "content": "Hello, this is a message"
}
```

### Typing Indicator

```json
{
  "type": "typing"
}
```

## Features

1. **Real-time Messaging**: Messages appear instantly without page refresh
2. **Typing Indicators**: Shows when other users are typing
3. **Connection Status**: Visual indicator of WebSocket connection status
4. **Auto-reconnection**: Automatically reconnects if connection is lost
5. **Fallback Support**: Falls back to REST API if WebSocket is unavailable
6. **Authentication**: Uses token-based authentication for secure connections
7. **Production Ready**: Configured for Docker and Nginx deployment

## Testing

A WebSocket test panel is available in development mode on the TicketChat page. It allows you to:

- Test WebSocket connection
- Send test messages
- Test typing indicators
- Monitor connection status

## Troubleshooting

1. **Connection Failed**:

   - Check if the backend is running with Daphne
   - Verify Nginx configuration is loaded
   - Check Docker containers are running

2. **Authentication Error**:

   - Ensure the token is valid and not expired
   - Check token is being passed correctly in WebSocket URL

3. **Messages Not Appearing**:

   - Check browser console for WebSocket errors
   - Verify Nginx is properly routing WebSocket requests

4. **Typing Indicators Not Working**:
   - Verify the WebSocket connection is active
   - Check channel layer configuration

## Production Considerations

1. **Redis Backend**: For production, use Redis as the channel layer backend instead of in-memory
2. **Load Balancing**: Ensure WebSocket connections work with your load balancer
3. **SSL/TLS**: Use WSS (WebSocket Secure) for HTTPS sites
4. **Connection Limits**: Monitor and limit the number of concurrent WebSocket connections
5. **Health Checks**: Add health checks for WebSocket endpoints
6. **Logging**: Implement proper logging for WebSocket connections and errors
