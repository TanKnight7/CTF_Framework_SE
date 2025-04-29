from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.utils import timezone

## Import models and serializers
from .models import Ticket, Message
from .serializers import TicketSerializer, MessageSerializer

## Imports authorization mechanism
from rest_framework.decorators import authentication_classes, permission_classes
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_ticket(request):
    serializer = TicketSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # overriding user input status to "open"
    serializer.save(created_by=request.user, status='open')
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_update_delete_ticket(request, pk):
    try:
        ticket = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.user.role == "player" and ticket.created_by != request.user:
        return Response({"error":"You are not authorized to view this ticket."}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.method == "GET":
        return Response(TicketSerializer(ticket).data , status=status.HTTP_200_OK)
    
    if request.user.role == "player":
        return Response({"success":"User with role 'Player' cannot update or delete tickets."}, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == "DELETE":
        ticket.delete()
        return Response({"success":"Ticket deleted."}, status=status.HTTP_200_OK)
    
    if request.method == "PUT":
        serializers = TicketSerializer(ticket, data=request.data)
        if not serializers.is_valid():
            return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializers.save()
        return Response(serializers.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_tickets(request):
    tickets = Ticket.objects.all()
    
    if request.user.role == "player":
        tickets = tickets.filter(created_by=request.user)
    
    serializer = TicketSerializer(tickets, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_message(request, ticket_id):
    try:
        ticket = Ticket.objects.get(pk=ticket_id)
    except Ticket.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.user.role == "player" and ticket.created_by != request.user:
        return Response({"error":"You are not authorized to create messages in this ticket"}, status=status.HTTP_401_UNAUTHORIZED)
    
    serializers = MessageSerializer(data=request.data)
    if not serializers.is_valid():
        return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
    
    serializers.save(ticket=ticket, author=request.user)
    return Response(serializers.data, status=status.HTTP_201_CREATED)
    

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_update_delete_message(request, ticket_id, message_id):
    try:
        message = Message.objects.get(pk=message_id)
    except Message.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.user.role == "player" and message.author != request.user:
        return Response({"error":"You are not authorized to access this message"}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.method == 'GET':
        return Response(MessageSerializer(message).data, status=status.HTTP_200_OK)
    
    if request.method == 'DELETE':
        message.delete()
        return Response({"success":"Message deleted."}, status=status.HTTP_200_OK)
    
    if request.method == 'PUT':
        if request.user != message.author:
            return Response({"error":"You are not authorized to update this message"}, status=status.HTTP_401_UNAUTHORIZED)
        serializers = MessageSerializer(message, data=request.data)
        if not serializers.is_valid():
            return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
        serializers.save(edit_time=timezone.now())
        return Response(serializers.data, status=status.HTTP_200_OK)

        
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_all_messages(request, ticket_id):
    try:
        ticket = Ticket.objects.get(pk=ticket_id)
    except Ticket.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.user.role == "player" and ticket.created_by != request.user:
        return Response({"error":"You are not authorized to create messages in this ticket"}, status=status.HTTP_401_UNAUTHORIZED)
    
    messages = ticket.messages.all()
    serializers = MessageSerializer(messages, many=True)
    return Response(serializers.data, status=status.HTTP_200_OK)