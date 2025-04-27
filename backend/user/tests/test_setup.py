from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from knox.models import AuthToken

class TestSetUp(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        
        self.user_data = {
            'username': 'test',
            'email': 'test@test.com',
            'password': 'Test123@#!user'
        }
        return super().setUp()
    
    def tearDown(self):
        return super().tearDown()