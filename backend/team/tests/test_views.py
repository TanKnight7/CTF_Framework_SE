from .test_setup import TestSetUp
from knox.models import AuthToken
from django.urls import reverse

        # team_data = self.team_data
        # team_data['name'] = 'testteam1'
        # team_data['institute'] = 'institut1'
        # res = self.client.post(self.create_team_url, team_data, format="json")
        
        # self.assertEqual(res.status_code, 400)

class CreateTeamTest(TestSetUp):
    def test_user_cannot_create_team_with_no_data(self):
        res = self.client.post(self.create_team_url)
        self.assertEqual(res.status_code, 401)
    
    def test_user_can_create_team_correctly(self):
        res = self.client.post(self.create_team_url, self.team_data, format="json")
        self.assertEqual(res.status_code, 401)
    
    # def test_user_cannot_create_team_with_existing_teamname(self):
    #     res = self.client.post(self.create_team_url, self.team_data,format="json")
    #     team_data = self.team_data
    #     team_data['name'] = 
    
    



class AccessControlTest(TestSetUp):
    def test_anonymous_user_cannot_access_endpoints_that_needs_authorization(self):
        self.get_update_team_url = reverse('get_update_team', kwargs={'pk': 1})
        
        res = self.client.get(self.get_update_team_url)
        self.assertEqual(res.status_code, 401)
        
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, 401)
        
        res = self.client.post(self.create_team_url)
        self.assertEqual(res.status_code, 401)
        
        self.join_team_url = reverse('join_team', kwargs={'pk': 1})
        
        res = self.client.get(self.join_team_url)
        self.assertEqual(res.status_code, 401)
        
        res = self.client.get(self.leave_team_url)
        self.assertEqual(res.status_code, 401)
        
        