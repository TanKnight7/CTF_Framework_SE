from rest_framework import serializers
from .models import Submission
from challenge.serializers import ChallengeListSerializer
from user.serializers import UserListSerializer

class SubmissionSerlializers(serializers.ModelSerializer):
    challenge = ChallengeListSerializer()
    submitted_by = UserListSerializer()
    class Meta:
        model = Submission
        fields = '__all__'