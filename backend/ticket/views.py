from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Ticket, Message
from .serializers import TicketSerializer, MessageSerializer, TicketDetailSerializer
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

### ==== Authentication & Authorization
from rest_framework.decorators import authentication_classes, permission_classes
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_tickets(request):
    """Get all tickets for the current user"""
    try:
        
        if request.user.role == 'admin':
            tickets = Ticket.objects.all().order_by('-created_time')
        else:
            
            tickets = Ticket.objects.filter(
                Q(created_by=request.user) | Q(assigned_to=request.user)
            ).order_by('-created_time')
        
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_ticket(request, ticket_id):
    """Get a specific ticket by ID"""
    try:
        ticket = Ticket.objects.get(id=ticket_id)
       
        if request.user.role != 'admin' and ticket.created_by != request.user and ticket.assigned_to != request.user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TicketDetailSerializer(ticket)
        return Response(serializer.data)
    except Ticket.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_ticket(request):
    """Create a new ticket"""
    try:
        
        challenge_id = request.data.get('challenge_id')
        if not challenge_id:
            return Response({
                'error': 'challenge_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        
        try:
            from challenge.models import Challenge
            challenge = Challenge.objects.get(id=challenge_id)
        except Challenge.DoesNotExist:
            return Response({
                'error': 'Challenge not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        
        existing_ticket = Ticket.objects.filter(
            created_by=request.user,
            challenge_id=challenge_id,
            status='open'
        ).first()
        
        if existing_ticket:
            return Response({
                'error': 'You already have an open ticket for this challenge',
                'ticket_id': existing_ticket.id
            }, status=status.HTTP_400_BAD_REQUEST)
        
        
        ticket_data = {
            'created_by': request.user,
            'challenge': challenge, 
            'title': request.data.get('title', ''),
            'description': request.data.get('description', ''),
            'priority': request.data.get('priority', 'medium'),
            'status': 'open'
        }
        
        ticket = Ticket.objects.create(**ticket_data)
        
        
        initial_message = request.data.get('initial_message')
        if initial_message:
            Message.objects.create(
                ticket=ticket,
                author=request.user,
                content=initial_message
            )
        
        serializer = TicketDetailSerializer(ticket)
        return Response({"success": f"Ticket Created.", "data": serializer.data}, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def close_ticket(request, ticket_id):
    """Close a ticket"""
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        
        if request.user.role == 'admin':
            pass  
        elif ticket.created_by != request.user and ticket.assigned_to != request.user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        ticket.status = 'closed'
        ticket.closed_time = timezone.now()
        ticket.save()
        
        serializer = TicketDetailSerializer(ticket)
        return Response({"success":"Ticket closed", "data": serializer.data})
        
    except Ticket.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_messages(request, ticket_id):
    """Get all messages for a ticket"""
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        
        
        if request.user.role != 'admin' and ticket.created_by != request.user and ticket.assigned_to != request.user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        messages = Message.objects.filter(ticket=ticket).order_by('sent_time')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
        
    except Ticket.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_message(request, ticket_id):
    """Create a new message for a ticket"""
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        
        if request.user.role != 'admin' and ticket.created_by != request.user and ticket.assigned_to != request.user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        
        if ticket.status == 'closed' and request.user.role != 'admin':
            return Response({'error': 'Cannot send messages to a closed ticket'}, status=status.HTTP_400_BAD_REQUEST)
        
        message = Message.objects.create(
            ticket=ticket,
            author=request.user,
            content=request.data.get('content', '')
        )
        
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Ticket.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)