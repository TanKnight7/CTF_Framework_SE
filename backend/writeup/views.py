from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import status

### ==== Authentication & Authorization
from rest_framework.decorators import authentication_classes, permission_classes
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from .models import Writeup
from .serializers import WriteupSerializer
from django.shortcuts import get_object_or_404

def get_user_team(user):
    from team.models import Team
    try:
        return Team.objects.get(members=user)
    except Team.DoesNotExist:
        return None

# 1. Submit a writeup (auto assign team)
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def submit_writeup(request):
    serializer = WriteupSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    serializer.save(user=request.user)
    team = get_user_team(request.user)
    if team:
        serializer.save(team=team)
    

    return Response(serializer.data, status=status.HTTP_201_CREATED)

# 2. Get all writeups
@api_view(['GET'])
# @authentication_classes([TokenAuthentication])
# @permission_classes([IsAuthenticated])
def get_all_writeups(request):
    writeups = Writeup.objects.all()
    serializer = WriteupSerializer(writeups, many=True)

    return Response(serializer.data)

# 3. Get, update, or delete a writeup by ID
@api_view(['GET', 'PUT', 'DELETE'])
# @authentication_classes([TokenAuthentication])
# @permission_classes([IsAuthenticated])
def get_update_delete_writeup(request, pk):
    writeup = get_object_or_404(Writeup, pk=pk)

    if request.method == 'GET':
        serializer = WriteupSerializer(writeup)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = WriteupSerializer(writeup, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        writeup.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)