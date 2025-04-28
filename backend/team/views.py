from rest_framework import status
from rest_framework.response import Response
from knox.models import AuthToken
from rest_framework.decorators import api_view
from .models import Team
from .serializers import TeamSerializer, PublicTeamSerializer
import uuid


from rest_framework.decorators import authentication_classes, permission_classes
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


@api_view(['GET'])
def get_all_teams(request):
    team = Team.objects.all()
    serializer = PublicTeamSerializer(team, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_update_team(request, pk):
    try:
        team = Team.objects.get(pk=pk)
    except Team.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = PublicTeamSerializer(team)
        return Response(serializer.data)
    
    if team.leader != request.user:
        return Response({"error": "You do not have permission to modify this team's profile."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        allowed_fields = ['institute']
        updated_data = {key: value for key, value in request.data.items() if key in allowed_fields}
        
        serializer = TeamSerializer(team, data=updated_data, partial=True)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save()
        return Response({"success": "Team Profile updated.", "team_data": serializer.data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({"me": TeamSerializer(request.user.team).data}, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_team(request):
    if request.user.team is not None:
        return Response({"error": "You have joined a team."}, status=status.HTTP_400_BAD_REQUEST)
    
    data = request.data.copy()
    data['leader'] = request.user.id
    data['token'] = str(uuid.uuid4())
    serializer = TeamSerializer(data=data)
    if not serializer.is_valid():
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    team = serializer.save()
    request.user.team = team
    request.user.save()
    return Response(TeamSerializer(team).data, status=status.HTTP_201_CREATED)
    

@api_view(['GET'])
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
    
    return Response({"success": "Successfully joining a team", "team": PublicTeamSerializer(team).data}, status=status.HTTP_200_OK)

@api_view(['GET'])
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
        
    
    
    
    
    
    
    