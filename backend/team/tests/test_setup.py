from django.urls import reverse
from rest_framework.test import APITestCase
from team.models import Team
from user.models import User

# https://www.youtube.com/watch?v=17KdirMbmHY
class TestSetUp(APITestCase):
    def setUp(self):
        self.me_url = reverse('me')
        self.create_team_url = reverse('create_team')
        self.leave_team_url = reverse('leave_team')
        self.team_data = {
            'name' : 'testingteam',
            'institution':'testinginsti'
        }
        
        
        self.user1_data = {
            'username':'testuser1',
            'email':'testuser1@example.com',
            'password':'Password123#!@',
        }
        
        self.user2_data = {
            'username':'testuser2',
            'email':'testuser2@example.com',
            'password':'Password123#!@',
        }
        
        # Registering user1 and user2
        self.client.post(reverse('register'), self.user1_data, format="json")
        self.client.post(reverse('register'), self.user2_data, format="json")
        
        self.user1 = User.objects.get(username=self.user1_data['username'])
        self.user2 = User.objects.get(username=self.user2_data['username'])
        
        self.user1_token = self.client.post(reverse('login'), self.user1_data, format="json").json().get('token')
        self.user2_token = self.client.post(reverse('login'), self.user2_data, format="json").json().get('token')
        
        return super().setUp()
        
     
        
    def tearDown(self):
        
        return super().tearDown()