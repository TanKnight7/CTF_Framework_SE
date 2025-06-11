import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Ticket, Message
from .serializers import MessageSerializer
import time

User = get_user_model()

class TicketChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.last_typing_time = 0
        self.typing_throttle = 1.0  # 1 second between typing indicators (reduced from 2)

    async def connect(self):
        self.ticket_id = self.scope['url_route']['kwargs']['ticket_id']
        self.room_group_name = f'ticket_{self.ticket_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'message')
        
        if message_type == 'message':
            content = text_data_json['content']
            user = self.scope['user']
            
            # Clear typing indicator for this user when they send a message
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'clear_typing',
                    'username': user.username
                }
            )
            
            # Save message to database
            message = await self.save_message(content, user)
            
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message
                }
            )
        elif message_type == 'typing':
            # Throttle typing indicators
            current_time = time.time()
            if current_time - self.last_typing_time > self.typing_throttle:
                # Broadcast typing indicator to everyone except the sender
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_typing',
                        'username': self.scope['user'].username,
                        'sender_channel': self.channel_name  # Include sender's channel to exclude them
                    }
                )
                self.last_typing_time = current_time

    async def chat_message(self, event):
        message = event['message']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message
        }))

    async def user_typing(self, event):
        username = event['username']
        sender_channel = event.get('sender_channel')
        
        # Don't send typing indicator to the sender
        if sender_channel != self.channel_name:
            # Send typing indicator to WebSocket
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'username': username
            }))

    async def clear_typing(self, event):
        username = event['username']
        
        # Send clear typing indicator to all users
        await self.send(text_data=json.dumps({
            'type': 'clear_typing',
            'username': username
        }))

    @database_sync_to_async
    def save_message(self, content, user):
        try:
            ticket = Ticket.objects.get(id=self.ticket_id)
            message = Message.objects.create(
                ticket=ticket,
                author=user,
                content=content
            )
            
            # Serialize the message
            serializer = MessageSerializer(message)
            return serializer.data
        except Ticket.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error saving message: {e}")
            return None 