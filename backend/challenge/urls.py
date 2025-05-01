from django.urls import path
from . import views

urlpatterns = [
    # CRUD OPERATION FOR CATEGORY
    path('challenge/', views.get_categories, name='get-categories'),
    path('challenge/create/', views.create_category, name='create-category'),
    path('challenge/<str:category_name>/edit/', views.edit_categories, name='edit-category'),
    path('challenge/<str:category_name>/delete/', views.delete_category, name='delete-category'),

    # VIEW CHALLENGE BY CATEGORY
    path('challenge/<str:category_name>/', views.get_challenges_by_categories, name='challenge-by-category'),
    
    # CRUD CHALLENGE
    path('challenge/<str:category_name>/<int:challenge_id>/', views.get_challenge_details, name='get-challenge-detail'),
    path('admin/challenge/create/', views.create_challenge, name='create-challenge'),
    # tba
]
