from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_all_users, name='get_all_users'),
    path('<int:pk>/', views.get_update_delete_user, name='get_update_delete_user'),
    path('me/', views.me, name='me'),
    
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('test_token/', views.test_token, name='test_token'),
]
