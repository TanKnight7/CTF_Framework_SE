from rest_framework import serializers
from .models import Writeup

class WriteupSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    team = serializers.CharField(source='team.name', read_only=True)
    
    class Meta:
        model = Writeup
        fields = "__all__"
        read_only_fields = ['user', 'team', 'submission_time', 'title']

    def create(self, validated_data):
        # If the file is uploaded under the key 'attachment'
        uploaded_file = validated_data.get('attachment')

        if uploaded_file and 'title' not in validated_data:
            # Extract the filename without extension
            filename = uploaded_file.name
            title = filename
            validated_data['title'] = title

        return super().create(validated_data)