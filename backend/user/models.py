from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    
    # USERNAME_FIELD = 'email' # if we want to login with email and password, use username_field = 'email'
    
    def __str__(self):
        return self.username