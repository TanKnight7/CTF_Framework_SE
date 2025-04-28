from django.db import models
from challenge.models import Challenge

# Create your models here.
class Review(models.Model):
    rating = models.PositiveSmallIntegerField(null=False)
    comment = models.TextField(max_length=2000, null=True)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name="review")

    def __str__(self):
        return self.challenge.title
