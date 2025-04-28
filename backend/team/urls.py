from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_all_teams, name='get_all_teams'),
    path('<int:pk>/', views.get_update_team, name='get_update_team'),
    path('me/', views.me, name='me'),
    
    path('create/', views.create_team, name='create_team'),
    path('join/<int:pk>/<str:token>/', views.join_team, name='join_team'),
    path('leave/', views.leave_team, name='leave_team'),
]