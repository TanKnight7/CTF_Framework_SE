from rest_framework import serializers
from .models import Category, Challenge, ChallengeSolve, ChallengeAttachment, ChallengeReview
from user.serializers import UserListSerializer


class ChallengeReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ChallengeReview
        fields = ['id', 'user', 'rating', 'feedback', 'created_at']
        read_only_fields = ['user', 'created_at']
        
    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class CategorySerializer(serializers.ModelSerializer):
    total_chall = serializers.SerializerMethodField()
    total_solved_by_team = serializers.SerializerMethodField()
    class Meta:
        model = Category
        fields = ['name', 'total_chall', 'total_solved_by_team', 'id']
    
    def get_total_solved_by_team(self, instance):
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
    reviews = ChallengeReviewSerializer(many=True, read_only=True)
    class Meta:
        model = Challenge
        fields = ['id', 'title', 'category', 'difficulty', 'point', 'rating', 'solved_by', 'description', 'attachments', 'reviews']


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
    reviews = ChallengeReviewSerializer(many=True, read_only=True)
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
