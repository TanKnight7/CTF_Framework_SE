from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from knox.models import AuthToken

# https://www.youtube.com/watch?v=17KdirMbmHY
class TestSetUp(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        
        # fields = ['username', 'password', 'email', 'roles', 'bio', 'country', 'team']
        self.user_data = {
            'username': 'test',
            'email': 'test@test.com',
            'password': 'Test123@#!user'
        }
        return super().setUp()
    
    def tearDown(self):
        return super().tearDown()