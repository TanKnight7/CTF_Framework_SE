from rest_framework import serializers
from .models import Team
from user.serializers import UserListSerializer
import uuid

class TeamRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'institute', 'token', 'leader']
        read_only_fields = ['id', 'token', 'leader']
    
    def validate_name(self, value):
        if Team.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("A team with this name already exists.")
        return value.lower()
    
    def validate(self, attrs):
        user = self.context.get('request').user
        if hasattr(user, 'leader'):
            raise serializers.ValidationError({"leader":"User already leads a team."})
        if user.team:
            raise serializers.ValidationError({"leader":"User already joined a team."})
        return attrs
    
    def create(self, validated_data):
        user = self.context.get('request').user
        validated_data['leader'] = user
        validated_data['token'] = str(uuid.uuid4())
        team = Team.objects.create(**validated_data)
        
        user.team = team
        user.save()
        
        return team

class TeamListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'total_point']

class TeamDetailSerializer(serializers.ModelSerializer):
    members = UserListSerializer(many=True, read_only=True)
    leader = UserListSerializer()
    class Meta:
        model = Team
        fields = ['id', 'name', 'institute', 'total_point', 'leader', 'token', 'members']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request', None)
        
        if request:
            team = request.user.team
            if not team or team != instance and request.user.role != 'admin':
                data.pop('token', None)
        else:
            data.pop('token', None)

        return data

class TeamUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['institute']