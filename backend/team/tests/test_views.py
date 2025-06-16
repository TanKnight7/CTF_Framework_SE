from .test_setup import TestSetUp
from knox.models import AuthToken
from django.urls import reverse
from team.models import Team

# TODO
# - add testing for get_update_team(request, pk)
# - add more security testing for broken access control

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
        # Team name 1: testingteam
        # Team name 2: testingteam
        # Output: should be error.
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
    
    def test_user_cannot_create_team_with_duplicate_name_case_insensitive(self):
        # Team name 1: testingteam
        # Team name 2: Testingteam
        # Output: should be error.
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res1 = self.client.post(self.create_team_url, self.team_data,format="json")
        self.assertEqual(res1.status_code, 201)
        self.assertIn('id', res1.json())
        
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user2_token)
        team_data = self.team_data
        team_data['name'] = 'Testingteam'
        res2 = self.client.post(self.create_team_url, team_data,format="json")
        self.assertEqual(res2.status_code, 400)
        self.assertIn("team with this name already exists.", str(res2.json()))
    
    def test_user_cannot_create_team_if_already_member_of_a_team(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res1 = self.client.post(self.create_team_url, self.team_data,format="json")
        self.assertEqual(res1.status_code, 201)
        self.assertIn('id', res1.json())

        team_data = self.team_data
        team_data['name'] = 'DifferentName'
        res2 = self.client.post(self.create_team_url, team_data, format="json")
        self.assertEqual(res2.status_code, 400)
        self.assertIn("User already", str(res2.json()))
        
        
        

class JoinTeamTest(TestSetUp):
    def test_user_can_join_existing_team(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res1 = self.client.post(self.create_team_url, self.team_data,format="json")
        self.assertEqual(res1.status_code, 201)
        self.assertIn('id', res1.json())
        
        id, token = res1.json()['id'], res1.json()['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user2_token)
        self.join_team_url = reverse('join_team', kwargs={'token': token})
        res2 = self.client.post(self.join_team_url, format="json")
        self.assertEqual(res2.status_code, 200)
        
        
    def test_cannot_join_existing_team_if_already_a_member_of_a_team(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res1 = self.client.post(self.create_team_url, self.team_data,format="json")
        self.assertEqual(res1.status_code, 201)
        self.assertIn('id', res1.json())
        
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user2_token)
        team_data = self.team_data
        team_data['name'] = 'DifferentName'
        res2 = self.client.post(self.create_team_url, team_data,format="json")
        self.assertEqual(res2.status_code, 201)
        self.assertIn('id', res2.json())
        
        id, token = res2.json()['id'], res2.json()['token']
        self.join_team_url = reverse('join_team', kwargs={'token': token})
        res3 = self.client.post(self.join_team_url, format="json")
        self.assertEqual(res3.status_code, 400)
        self.assertIn("error", res3.json())
        self.assertIn("You have joined a team.", res3.json()['error'])
        
class LeaveTeamTest(TestSetUp):
    def test_user_cannot_leave_team_if_not_a_member(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res = self.client.post(self.leave_team_url, format="json")
        self.assertEqual(res.status_code, 400)
        self.assertIn("message", res.json())
        self.assertIn("You haven't joined a team", res.json()['message'])
    
    def test_leader_can_leave_team_if_they_are_the_only_member(self):
        # Make sure to delete the team object
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res1 = self.client.post(self.create_team_url, self.team_data,format="json")
        self.assertEqual(res1.status_code, 201)
        
        team = Team.objects.filter(name=self.team_data['name']).first()
        self.assertIsInstance(team, Team)
        
        res2 = self.client.post(self.leave_team_url, format="json")
        self.assertEqual(res2.status_code, 200)
        
        team = Team.objects.filter(name=self.team_data['name']).first()
        self.assertIsNone(team) # team should no longer exists

    
    def test_leader_can_leave_team_if_multiple_members_exist(self):
        # make sure to change the leader to another member of the team
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res1 = self.client.post(self.create_team_url, self.team_data,format="json")
        self.assertEqual(res1.status_code, 201)
        
        id, token = res1.json()['id'], res1.json()['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user2_token)
        self.join_team_url = reverse('join_team', kwargs={'token': token})
        res2 = self.client.post(self.join_team_url, format="json")
        self.assertEqual(res2.status_code, 200)

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res3 = self.client.post(self.leave_team_url, format="json")
        self.assertEqual(res3.status_code, 200)
        
        team = Team.objects.filter(pk=id).first()
        self.assertEqual(team.leader.id, self.user2.id) # Leadership changes to user2
        
        

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
        
        self.join_team_url = reverse('join_team', kwargs={ 'token':'123'})
        
        res = self.client.post(self.join_team_url)
        self.assertEqual(res.status_code, 401)

        res = self.client.post(self.leave_team_url)
        self.assertEqual(res.status_code, 401)
        
    def test_user_cannot_join_team_without_valid_token(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user1_token)
        res1 = self.client.post(self.create_team_url, self.team_data,format="json")
        self.assertEqual(res1.status_code, 201)
        
        id, token = res1.json()['id'], res1.json()['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.user2_token)
        self.join_team_url = reverse('join_team', kwargs={'token': '123'}) # invalid token
        res2 = self.client.post(self.join_team_url, format="json")
        self.assertEqual(res2.status_code, 404)
        self.assertIn("error", res2.json())
        self.assertIn("Invalid token.", res2.json()['error'])
        
        