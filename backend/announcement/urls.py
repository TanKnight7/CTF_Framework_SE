from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_announcements, name='get_announcements'),
    path('create/', views.create_announcement, name='create_announcement'),
    path('<int:announcement_id>/edit/', views.edit_announcement, name='edit_announcement'),
    path('<int:announcement_id>/delete/', views.delete_announcement, name='delete_announcement'),
]
