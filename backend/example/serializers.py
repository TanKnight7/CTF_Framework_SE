from rest_framework import serializers
from .models import BlogPost

# ini basically ngubah model yang awalnya class menjadi json
class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ["id", "title", "content", "published_date"]