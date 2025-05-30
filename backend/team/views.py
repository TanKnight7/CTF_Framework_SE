from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

### ==== Models & Serializers
from .models import Team
from .serializers import TeamRegistrationSerializer, TeamListSerializer, TeamDetailSerializer, TeamUpdateSerializer

### ==== Authentication & Authorization
from rest_framework.decorators import authentication_classes, permission_classes
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

# =====================
# ==== CREATE TEAM ====
# =====================
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_team(request):
    serializer = TeamRegistrationSerializer(data=request.data, context={'request':request})
    if not serializer.is_valid():
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    team = serializer.save()
    
    return Response(TeamRegistrationSerializer(team).data, status=status.HTTP_201_CREATED)

# ========================
# ====== TEAM LIST =======
# ========================
@api_view(['GET'])
def get_all_teams(request):
    try:
        team = Team.objects.all()
        serializer = TeamListSerializer(team, many=True)
        return Response(serializer.data)
    except Team.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

# ==============================
# ===== TEAM DETAILS BY ID =====
# ==============================
@api_view(['GET', 'PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_update_team(request, pk):
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response(TeamDetailSerializer(team, context={'request':request}).data)
    
    if team.leader != request.user:
        return Response({"error": "You do not have permission to modify this team's profile."}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        serializer = TeamUpdateSerializer(team, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        team = serializer.save()
        return Response({"success": "Team Profile updated.", "data": TeamDetailSerializer(team, context={'request':request}).data}, status=status.HTTP_200_OK)

# ===========================
# ===== MY TEAM DETAILS =====
# ===========================
@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    if request.user.team is None:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    return Response({"data": TeamDetailSerializer(request.user.team, context={'request':request}).data}, status=status.HTTP_200_OK)
    
# ===========================
# ======== JOIN TEAM ========
# ===========================
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def join_team(request, pk, token):
    if request.user.team is not None:
        return Response({"error": "You have joined a team."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        team = Team.objects.get(pk=pk, token=token)
    except Team.DoesNotExist:
        return Response({"error": "Team with this id or invalid token does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
    request.user.team = team
    request.user.save()
    
    return Response({"success": "Successfully joining a team", "team": TeamDetailSerializer(team, context={'request':request}).data}, status=status.HTTP_200_OK)

# ===========================
# ======== LEAVE TEAM =======
# ===========================
@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def leave_team(request):
    if request.user.team is None:
        return Response({"error": "You haven't joined a team"}, status=status.HTTP_400_BAD_REQUEST)
    
    team = request.user.team
    if team.leader == request.user:
        new_leader = team.members.exclude(id=request.user.id).first()
        if new_leader is None:
            team.delete()
        else:
            team.leader = new_leader
            team.save()
        
    request.user.team = None
    request.user.save()
    return Response({"message": "You have successfully left the team."}, status=status.HTTP_200_OK)
        
    
    
    
    
    
    
    
