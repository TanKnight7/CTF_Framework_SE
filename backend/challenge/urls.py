from django.urls import path
from . import views

urlpatterns = [
    # =================================================
    # CRUD Category Endpoints
    # =================================================
    # GET all categories
    path('categories/', views.get_categories, name='get_categories'),
    # POST create a new category
    path('categories/create/', views.create_category, name='create_category'),
    # PUT edit a specific category by its name
    path('categories/<str:category_name>/edit/', views.edit_categories, name='edit_category'),
    # DELETE a specific category by its name
    path('categories/<str:category_name>/delete/', views.delete_categories, name='delete_category'),

    # =================================================
    # Challenges by Category Endpoints
    # =================================================
    # GET challenges for a specific category by its name
    path('categories/<str:category_name>/', views.get_challenges_by_categories, name='get_challenges_by_category'),

    # =================================================
    # CRUD Challenge Endpoints
    # =================================================
    # GET all challenges
    path('', views.get_all_challenges, name='get_all_challenges'),
    # POST create a new challenge
    path('create/', views.create_challenge, name='create_challenge'),
    # GET details for a specific challenge by its ID
    path('<int:challenge_id>/', views.get_challenge_detail, name='get_challenge_detail'),
    # PUT edit a specific challenge by its ID
    path('<int:challenge_id>/edit/', views.edit_challenge, name='edit_challenge'),
    # DELETE a specific challenge by its ID
    path('<int:challenge_id>/delete/', views.delete_challenge, name='delete_challenge'),
]

