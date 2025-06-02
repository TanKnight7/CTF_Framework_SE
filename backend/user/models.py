from django.db import models
from django.contrib.auth.models import AbstractUser

from team.models import Team

class User(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    role = models.CharField(max_length=25, null=False, default='player', choices=[('player', 'Player'), ('admin', 'Admin')],)
    bio = models.CharField(max_length=250, null=True, blank=True)
    country = models.CharField(max_length=50, null=True, blank=True)
    
    # One-to-many: one team, many users
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, related_name='members')
    
    # USERNAME_FIELD = 'email' # if we want to login with email and password, use username_field = 'email'
    
    def __str__(self):
        return self.username