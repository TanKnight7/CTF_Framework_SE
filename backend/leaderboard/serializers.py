from rest_framework import serializers
from team.serializers import PublicTeamSerializer
from .models import LeaderboardEntry, Leaderboard

class LeaderboardEntrySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # Display username for user entries
    team = PublicTeamSerializer(read_only=True)  # Include the team data for team entries
    
    class Meta:
        model = LeaderboardEntry
        fields = ['id', 'leaderboard', 'user', 'team', 'score', 'rank', 'entry_type', 'created_at', 'updated_at']

class LeaderboardSerializer(serializers.ModelSerializer):
    entries = LeaderboardEntrySerializer(many=True, read_only=True)  # Include entries in the leaderboard
    
    class Meta:
        model = Leaderboard
        fields = ['id', 'name', 'created_at', 'updated_at', 'entries']
