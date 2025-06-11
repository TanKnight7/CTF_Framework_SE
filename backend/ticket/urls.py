from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_tickets, name='get_tickets'),
    path('create/', views.create_ticket, name='create_ticket'),
    path('<int:ticket_id>/', views.get_ticket, name='get_ticket'),
    path('<int:ticket_id>/close/', views.close_ticket, name='close_ticket'),
    path('<int:ticket_id>/messages/', views.get_messages, name='get_messages'),
    path('<int:ticket_id>/messages/create/', views.create_message, name='create_message'),
    path('test-websocket/', views.test_websocket, name='test_websocket'),
]

'''
CREATE
READ
UPDATE
DELETE

'''
