from rest_framework import serializers
from .models import Writeup

class WriteupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Writeup
        fields = "__all__"
