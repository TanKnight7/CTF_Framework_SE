from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # fields = "__all__"
        fields = ['id', 'username', 'password', 'email', 'role', 'bio', 'country', 'team']
        extra_kwargs = {
            'password': {'write_only':True} # Bikin passwordnya writeonly, jadi ga bakalan dishow passwordnya
        }

class PublicUserSerializer(serializers.ModelSerializer):
    team = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'bio', 'country', 'team']
    
    def get_team(self, obj):
        from team.serializers import TeamSerializer
        if obj.team:
            data = TeamSerializer(obj.team).data
            return {"id": data['id'], 'name': data['name']}
        return None



class PublicTeamUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']