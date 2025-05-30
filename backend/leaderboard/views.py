from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.utils import timezone

## Import models and serializers
from team.models import Team
from team.serializers import TeamListSerializer

## Imports authorization mechanism
from rest_framework.decorators import authentication_classes, permission_classes
from knox.auth import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    teams = Team.objects.order_by('-total_point')
    serializer = TeamListSerializer(teams, many=True)
    
    leaderboard_with_ranks = [
        {
            "rank": index + 1,
            **team_data
        }
        for index, team_data in enumerate(serializer.data)
    ]
    
    return Response({"teams": leaderboard_with_ranks}, status=status.HTTP_200_OK)
