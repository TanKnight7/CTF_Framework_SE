from rest_framework import serializers
from .models import Team
from user.serializers import PublicTeamUserSerializer

class TeamSerializer(serializers.ModelSerializer):
    members = PublicTeamUserSerializer(many=True, read_only=True)
    class Meta:
        model = Team
        fields = '__all__'

class PublicTeamSerializer(serializers.ModelSerializer):
    members = PublicTeamUserSerializer(many=True, read_only=True)
    class Meta:
        model = Team
        exclude = ['token']

class PublicTeamLeaderboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['total_point', 'name']