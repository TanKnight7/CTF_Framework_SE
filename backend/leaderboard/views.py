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
    teams = Team.objects.all()
    serializer = TeamListSerializer(teams, many=True)
    
    # Sort serialized data in Python
    sorted_data = sorted(serializer.data, key=lambda x: x['total_point'], reverse=True)

    return Response(sorted_data, status=status.HTTP_200_OK)
