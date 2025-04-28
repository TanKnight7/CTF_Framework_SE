from django.urls import reverse
from rest_framework.test import APITestCase

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
        return super().setUp()
        
     
        
    def tearDown(self):
        
        return super().tearDown()