from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_all_writeups, name='get_all_writeups'),
    path('submit/', views.submit_writeup, name='submit_writeup'),
    path('<int:pk>/', views.get_update_delete_writeup, name='get_update_delete_writeup'),
]
