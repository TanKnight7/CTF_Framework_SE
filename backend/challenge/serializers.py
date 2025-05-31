from rest_framework import serializers
from .models import Category, Challenge, ChallengeSolve
from user.serializers import UserListSerializer

# Basic Category Serializer - for simple category listings
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name']

class ChallengeListSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    solved_by = UserListSerializer(many=True)
    class Meta:
        model = Challenge
        fields = ['id', 'title', 'category', 'difficulty', 'point', 'rating', 'solved_by']

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

# Basic Challenge Serializer - for listing challenges without nesting
class ChallengeSerializer(serializers.ModelSerializer):
    solved_by = UserListSerializer(many=True, read_only=True)
    class Meta:
        model = Challenge
        exclude = ['flag']

class CreateChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        exclude = ['rating', 'point', 'solved_by']
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
