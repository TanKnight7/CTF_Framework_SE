from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_ticket, name='create_ticket'),
    path('<int:pk>/', views.get_update_delete_ticket, name='get_update_delete_ticket'),
    
    path('', views.get_all_tickets, name='get_all_tickets'),
    
    path('<int:ticket_id>/message/create/', views.create_message, name='create_message'),
    path('<int:ticket_id>/message/<int:message_id>/', views.get_update_delete_message, name='get_update_delete_message'),
    path('<int:ticket_id>/message/', views.get_all_messages, name='get_all_messages'),
]

'''
CREATE
READ
UPDATE
DELETE

'''
