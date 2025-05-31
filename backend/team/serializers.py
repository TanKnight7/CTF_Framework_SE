from rest_framework import serializers
from .models import Team
from challenge.models import ChallengeSolve
from challenge.serializers import ChallengeSolveSerializer
from user.serializers import UserListSerializer
from django.db.models import Sum
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
    solve_count = serializers.SerializerMethodField()
    total_point = serializers.SerializerMethodField()
    rank = serializers.SerializerMethodField()
    class Meta:
        model = Team
        fields = ['id', 'name', 'total_point', 'solve_count', 'rank']
    
    def get_solve_count(self, instance):
        return ChallengeSolve.objects.filter(user__in=instance.members.all()).count()
    
    def get_total_point(self, instance):
        return (
            ChallengeSolve.objects
            .filter(user__in=instance.members.all())
            .aggregate(total=Sum('challenge__point'))['total'] or 0
        )
    
    def get_rank(self, instance):
        teams = list(Team.objects.order_by('-total_point').values_list('id', flat=True))
        try:
            # Find the position (index) of the team instance in this ordered list
            rank = teams.index(instance.id) + 1  # +1 because index is zero-based
        except ValueError:
            # If the team is not found in the list, return None or some default value
            return None
        return rank

class TeamDetailSerializer(serializers.ModelSerializer):
    members = UserListSerializer(many=True, read_only=True)
    solve_count = serializers.SerializerMethodField()
    total_point = serializers.SerializerMethodField()
    rank = serializers.SerializerMethodField()
    solves = serializers.SerializerMethodField()
    class Meta:
        model = Team
        fields = ['id', 'name', 'institute', 'total_point', 'solve_count', 'rank',  'leader', 'token', 'members', 'solves']
    
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

    def get_solve_count(self, instance):
        return ChallengeSolve.objects.filter(user__in=instance.members.all()).count()
    
    def get_total_point(self, instance):
        return (
            ChallengeSolve.objects
            .filter(user__in=instance.members.all())
            .aggregate(total=Sum('challenge__point'))['total'] or 0
        )
    
    def get_rank(self, instance):
        teams = list(Team.objects.order_by('-total_point').values_list('id', flat=True))
        try:
            # Find the position (index) of the team instance in this ordered list
            rank = teams.index(instance.id) + 1  # +1 because index is zero-based
        except ValueError:
            # If the team is not found in the list, return None or some default value
            return None
        return rank
    
    def get_solves(self, instance):
        return ChallengeSolveSerializer(ChallengeSolve.objects.filter(user__in=instance.members.all()), many=True).data

class TeamUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['institute']