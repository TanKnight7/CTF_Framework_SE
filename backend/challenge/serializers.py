from rest_framework import serializers
from .models import Category, Challenge

# Basic Challenge Serializer - for listing challenges without nesting
class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        exclude = ['flag']

class CreateChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        exclude = ['rating', 'point', 'solve_count']
    
    def create(self, validated_data):
        user = self.context.get('request').user
        validated_data['author'] = user
        challenge = Challenge.objects.create(**validated_data)
        return challenge

# Basic Category Serializer - for simple category listings
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['name']

# Detailed Category Serializer - includes challenges related to this category
class CategoryDetailSerializer(serializers.ModelSerializer):
    challenges = ChallengeSerializer(source='challenge', many=True, read_only=True)
    
    class Meta:
        model = Challenge
        fields = ['id', 'title', 'difficutly', 'point']
