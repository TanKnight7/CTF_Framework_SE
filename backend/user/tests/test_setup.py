from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from knox.models import AuthToken

# https://www.youtube.com/watch?v=17KdirMbmHY
class TestSetUp(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        
        self.get_all_users_url = reverse('get_all_users')
        self.get_update_delete_user_url = None
        self.me_url = reverse('me')
        # fields = ['username', 'password', 'email', 'roles', 'bio', 'country', 'team']
        self.user_data = {
            'username': 'test',
            'email': 'test@test.com',
            'password': 'Test123@#!user'
        }
        
        self.user_data_attacker = {
            'username': 'attacker',
            'email': 'attacker@test.com',
            'password': 'Test123@#!user'
        }
        
        self.user_data_victim = {
            'username': 'victim',
            'email': 'victim@test.com',
            'password': 'Test123@#!user'
        }
        
        return super().setUp()
    
    def tearDown(self):
        return super().tearDown()