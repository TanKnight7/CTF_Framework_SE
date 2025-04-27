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
