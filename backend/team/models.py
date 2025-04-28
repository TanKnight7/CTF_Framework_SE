from django.db import models

# Create your models here.
class Team(models.Model):
    name = models.CharField(max_length=50, unique=True)
    institute = models.TextField(max_length=50, null=True)
    token = models.CharField(max_length=100, null=False)
    total_point = models.IntegerField(default=0)
    leader = models.OneToOneField('user.User', on_delete=models.CASCADE, related_name='leader', null=False)

    def __str__(self):
        return self.name