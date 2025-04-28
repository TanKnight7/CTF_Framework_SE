from .test_setup import TestSetUp
from knox.models import AuthToken
from django.urls import reverse


class CreateTeamTest(TestSetUp):
    def test_user_cannot_create_team_with_no_data(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res = self.client.post(self.create_team_url)
        self.assertEqual(res.status_code, 400)
        self.assertIn('error', res.json())
    
    def test_user_can_create_team_correctly(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res = self.client.post(self.create_team_url, self.team_data, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertIn('id', res.json())
    
    def test_user_cannot_create_team_with_existing_teamname(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res1 = self.client.post(self.create_team_url, self.team_data,format="json")
        self.assertEqual(res1.status_code, 201)
        self.assertIn('id', res1.json())
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user2_token)
        res2 = self.client.post(self.create_team_url, self.team_data,format="json")
        self.assertEqual(res2.status_code, 400)
        self.assertIn("error", res2.json())
        self.assertIn("name", res2.json()['error'])
        self.assertIn("team with this name already exists.", res2.json()['error']['name'])
        

class AccessControlTest(TestSetUp):
    def test_anonymous_user_cannot_access_endpoints_that_needs_authorization(self):
        self.get_update_team_url = reverse('get_update_team', kwargs={'pk': 1})
        
        res = self.client.get(self.get_update_team_url)
        self.assertEqual(res.status_code, 401)
        
        res = self.client.put(self.get_update_team_url, {'institution':'gacorrr'},format="json")
        self.assertEqual(res.status_code, 401)
        
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, 401)
        
        res = self.client.post(self.create_team_url)
        self.assertEqual(res.status_code, 401)
        
        self.join_team_url = reverse('join_team', kwargs={'pk': 1, 'token':'123'})
        
        res = self.client.get(self.join_team_url)
        self.assertEqual(res.status_code, 401)

        res = self.client.get(self.leave_team_url)
        self.assertEqual(res.status_code, 401)
        
        