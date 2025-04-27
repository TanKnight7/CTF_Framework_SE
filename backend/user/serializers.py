from rest_framework import serializers
from .models import User
        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # fields = "__all__"
        fields = ['id', 'username', 'password', 'email']
        extra_kwargs = {
            'password': {'write_only':True} # Bikin passwordnya writeonly, jadi ga bakalan dishow passwordnya
        }
