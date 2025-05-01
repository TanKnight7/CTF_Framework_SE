from rest_framework import serializers
from .models import Category, Challenges

# Basic Challenge Serializer - for listing challenges without nesting
class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenges
        exclude = ['flag']

class CreateChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenges
        fields = '__all__'

# Basic Category Serializer - for simple category listings
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

# Detailed Category Serializer - includes challenges related to this category
class CategoryDetailSerializer(serializers.ModelSerializer):
    challenges = ChallengeSerializer(source='challenge', many=True, read_only=True)
    
    class Meta:
        model = Challenge
        fields = ['title', 'difficutly', 'point']
