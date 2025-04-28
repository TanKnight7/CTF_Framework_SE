from .test_setup import TestSetUp
from knox.models import AuthToken
from django.urls import reverse


class AccessControlTest(TestSetUp):
    # def test_anonymous_user_cannot_access_endpoints_that_needs_authorization(self):
        ...