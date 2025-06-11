from rest_framework import serializers
from .models import Category, Challenge, ChallengeSolve, ChallengeAttachment
from user.serializers import UserListSerializer

# Basic Category Serializer - for simple category listings
class CategorySerializer(serializers.ModelSerializer):
    total_chall = serializers.SerializerMethodField()
    total_solved_by_team = serializers.SerializerMethodField()
    class Meta:
        model = Category
        fields = ['name', 'total_chall', 'total_solved_by_team', 'id']
    
    def get_total_solved_by_team(self, instance):
        # Count solves where the challenge belongs to this category
        request = self.context.get('request')
        if not request or not hasattr(request.user, 'team'):
            return 0
        
        
        team = request.user.team
        if not team:
            return 0
        
        return ChallengeSolve.objects.filter(challenge__category=instance, user__in=team.members.all()).count()
    
    def get_total_chall(self, instance):
        return Challenge.objects.filter(category=instance).count()


class ChallengeAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeAttachment
        fields = ['id', 'name', 'file']


class ChallengeListSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    solved_by = UserListSerializer(many=True)
    attachments = ChallengeAttachmentSerializer(many=True, read_only=True)
    class Meta:
        model = Challenge
        fields = ['id', 'title', 'category', 'difficulty', 'point', 'rating', 'solved_by', 'description', 'attachments']


class ChallengeSolveSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    challenge = serializers.SerializerMethodField()
    class Meta:
        model = ChallengeSolve
        fields = ['id', 'user', 'username', 'challenge', 'solved_at']
    
    def get_challenge(self, instance):
        return {
            'id': instance.challenge.id,
            'title': instance.challenge.title,
            'point': instance.challenge.point,
            'category': instance.challenge.category.name
        }

class ChallengeSerializer(serializers.ModelSerializer):
    solved_by = UserListSerializer(many=True, read_only=True)
    class Meta:
        model = Challenge
        exclude = ['flag']


class CreateChallengeSerializer(serializers.ModelSerializer):
    attachments = ChallengeAttachmentSerializer(many=True, required=False)
    class Meta:
        model = Challenge
        exclude = ['rating', 'solved_by']
        read_only_fields = ['author']
    
    def create(self, validated_data):
        user = self.context.get('request').user
        validated_data['author'] = user
        challenge = Challenge.objects.create(**validated_data)
        return challenge

# Detailed Category Serializer - includes challenges related to this category
class CategoryDetailSerializer(serializers.ModelSerializer):
    challenges = ChallengeSerializer(source='challenge', many=True, read_only=True)
    
    class Meta:
        model = Challenge
        fields = ['id', 'title', 'difficutly', 'point']

class AdminChallengeDetailSerializer(serializers.ModelSerializer):
    attachments = ChallengeAttachmentSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Challenge
        fields = ['id', 'title', 'category', 'category_name', 'difficulty', 'point', 'description', 'flag', 'attachments']
