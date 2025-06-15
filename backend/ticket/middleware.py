from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from knox.auth import TokenAuthentication
from knox.models import AuthToken
from django.contrib.auth import get_user_model

User = get_user_model()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        
        query_string = scope.get('query_string', b'').decode()
        query_params = dict(x.split('=') for x in query_string.split('&') if x)
        token = query_params.get('token', None)
        
        if token:
            scope['user'] = await self.get_user(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        try:
            
            auth = TokenAuthentication()
            user, auth_token = auth.authenticate_credentials(token.encode())
            return user
        except Exception:
            return AnonymousUser() 