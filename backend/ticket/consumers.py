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
        self.typing_throttle = 1.0  

    async def connect(self):
        self.ticket_id = self.scope['url_route']['kwargs']['ticket_id']
        self.room_group_name = f'ticket_{self.ticket_id}'

        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        
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
            
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'clear_typing',
                    'username': user.username
                }
            )
            
            
            message = await self.save_message(content, user)
            
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message
                }
            )
        elif message_type == 'typing':
           
            current_time = time.time()
            if current_time - self.last_typing_time > self.typing_throttle:
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_typing',
                        'username': self.scope['user'].username,
                        'sender_channel': self.channel_name  
                    }
                )
                self.last_typing_time = current_time

    async def chat_message(self, event):
        message = event['message']
        
        
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message
        }))

    async def user_typing(self, event):
        username = event['username']
        sender_channel = event.get('sender_channel')
        
        
        if sender_channel != self.channel_name:
            
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'username': username
            }))

    async def clear_typing(self, event):
        username = event['username']
        
        
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
            
            
            serializer = MessageSerializer(message)
            return serializer.data
        except Ticket.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error saving message: {e}")
            return None 