from django.urls import path
from . import views

urlpatterns = [
    path("blogposts/", views.BlogPostListCreate.as_view(), name="blogpost-view-create"),
    path("blogposts/<int:pk>/", views.BlogPostRetrieveUpdateDestroy.as_view(), name="update"),
    path('users/', views.get_user, name='get_user'),
    path('users/createe/', views.create_user, name='create_user'),
    path('users/<int:pk>/', views.user_detail, name='user_detail'),
    
    
    path('login/', views.login, name='login'),
    path('signup/', views.signup, name='signup'),
    path('test_token/', views.signup, name='test_token'),
    
]