from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.get_user, name='get_user'),
    path('users/createe/', views.create_user, name='create_user'),
    path('users/<int:pk>/', views.user_detail, name='user_detail'),
    
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('test_token/', views.test_token, name='test_token'),
]
