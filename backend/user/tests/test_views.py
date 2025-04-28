from .test_setup import TestSetUp
from knox.models import AuthToken
from django.urls import reverse

class RegisterTest(TestSetUp):
    def test_user_cannot_register_with_no_data(self):
        res = self.client.post(self.register_url)
        self.assertEqual(res.status_code, 400)
    
    def test_user_can_register_correctly(self):
        res = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(res.status_code, 201)
    
    def test_user_cannot_register_with_existing_username(self):
        self.client.post(self.register_url, self.user_data, format="json")
        user_data = self.user_data
        user_data['email'] = 'anotheremail@test.com'
        res = self.client.post(self.register_url, user_data, format="json")
        self.assertEqual(res.status_code, 400)
    
    def test_user_cannot_register_with_existing_email(self):
        self.client.post(self.register_url, self.user_data, format="json")
        user_data = self.user_data
        user_data['username'] = 'anotherusername'
        res = self.client.post(self.register_url, user_data, format="json")
        self.assertEqual(res.status_code, 400)
    
    def test_user_cannot_register_with_role_other_than_player(self):
        user_data = self.user_data
        user_data['role'] = 'admin'
        res = self.client.post(self.register_url, self.user_data, format="json")
        role_registered = res.json().get('user').get('role')
        self.assertEqual(role_registered, 'player')
        
    

class LoginTest(TestSetUp):
    def test_login_and_token_creation(self):
        self.client.post(self.register_url, self.user_data, format="json")
        res = self.client.post(self.login_url, self.user_data, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertIn('token', res.data)
    
    def test_login_and_old_token_invalidated(self):
        self.client.post(self.register_url, self.user_data, format="json")
        old_token = self.client.post(self.login_url, self.user_data, format='json').json().get('token')
        new_token = self.client.post(self.login_url, self.user_data, format='json').json().get('token')
        
        # Assert that the new token is different from the old token
        self.assertNotEqual(old_token, new_token)
        
        # Verify that the old token is no longer in the database
        token_count = AuthToken.objects.all().count()
        self.assertEqual(token_count, 1) # should be 1 token left in the database.

class AccessControlTest(TestSetUp):
    def test_anonymous_user_cannot_access_endpoints_that_needs_authorization(self):
        self.get_update_delete_user_url = reverse('get_update_delete_user', kwargs={'pk': 1})
        
        res = self.client.get(self.get_all_users_url)
        self.assertEqual(res.status_code, 401)
        
        res = self.client.get(self.get_update_delete_user_url)
        self.assertEqual(res.status_code, 401)
        
        res = self.client.delete(self.get_update_delete_user_url)
        self.assertEqual(res.status_code, 401)
        
        res = self.client.put(self.get_update_delete_user_url, self.user_data, format="json")
        self.assertEqual(res.status_code, 401)
        
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, 401)
        
    def test_user_cannot_change_another_user_data(self):
        # Register accounts
        self.client.post(self.register_url, self.user_data_attacker, format="json")
        self.client.post(self.register_url, self.user_data_victim, format="json")
        
        user_attacker_token = self.client.post(self.login_url, self.user_data_attacker, format="json").json().get('token')
        user_victim_id = self.client.post(self.login_url, self.user_data_victim, format="json").json().get('user').get('id')
        
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + user_attacker_token)
        self.get_update_delete_user_url = reverse('get_update_delete_user', kwargs={'pk': user_victim_id})
        
        res = self.client.delete(self.get_update_delete_user_url)
        self.assertEqual(res.status_code, 403)
        
        res = self.client.put(self.get_update_delete_user_url, self.user_data, format="json")
        self.assertEqual(res.status_code, 403)
        