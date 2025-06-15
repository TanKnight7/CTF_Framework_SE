from rest_framework import serializers
from .models import Ticket, Message

class MessageSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'sent_time', 'edit_time', 'author_username']
        read_only_fields = ['sent_time', 'edit_time', 'author_username']

class TicketSerializer(serializers.ModelSerializer):
    challenge_name = serializers.CharField(source='challenge.title', read_only=True)
    challenge_id = serializers.IntegerField(source='challenge.id', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    ticket_id = serializers.SerializerMethodField()
    last_updated = serializers.SerializerMethodField()
    
    class Meta:
        model = Ticket
        fields = ['id', 'ticket_id', 'status', 'challenge', 'challenge_id', 'challenge_name', 'created_by_username', 'created_time', 'last_updated', 'messages']
        read_only_fields = ['created_time', 'created_by', 'ticket_id', 'last_updated', 'messages', 'challenge_id', 'challenge_name']
    
    def get_ticket_id(self, obj):
        return f"TKT-{str(obj.id).zfill(3)}"
    
    def get_last_updated(self, obj):
      
        latest_message = obj.messages.order_by('-sent_time').first()
        if latest_message:
            return latest_message.sent_time
        return obj.created_time

class TicketDetailSerializer(serializers.ModelSerializer):
    challenge_name = serializers.CharField(source='challenge.title', read_only=True)
    challenge_id = serializers.IntegerField(source='challenge.id', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    ticket_id = serializers.SerializerMethodField()
    last_updated = serializers.SerializerMethodField()
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_id', 'title', 'description', 'priority', 'status', 
            'challenge', 'challenge_id', 'challenge_name', 
            'created_by', 'created_by_username', 'assigned_to', 'assigned_to_username',
            'created_time', 'closed_time', 'last_updated', 'messages'
        ]
        read_only_fields = [
            'created_time', 'created_by', 'ticket_id', 'last_updated', 'messages', 
            'challenge_id', 'challenge_name', 'closed_time'
        ]
    
    def get_ticket_id(self, obj):
        return f"TKT-{str(obj.id).zfill(3)}"
    
    def get_last_updated(self, obj):
        
        latest_message = obj.messages.order_by('-sent_time').first()
        if latest_message:
            return latest_message.sent_time
        return obj.created_time
        