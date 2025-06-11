from django.urls import path
from . import views

urlpatterns = [
    path('submissions/', views.submissions, name='submissions'),
]
