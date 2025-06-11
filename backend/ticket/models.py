from django.db import models

# Create your models here.
'''
related_name biar bisa kek gini:
challenge.tickets.all()
user.tickets_created.all()
'''
class Ticket(models.Model):
    challenge = models.ForeignKey('challenge.Challenge', on_delete=models.CASCADE, related_name='tickets')
    title = models.CharField(max_length=200, default='')
    description = models.TextField(default='')
    priority = models.CharField(max_length=20, default='medium', choices=(
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ))
    status = models.CharField(max_length=30, default='open', choices=(('open', 'Open'), ('closed', 'Closed')))
    created_by = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='tickets_created')
    assigned_to = models.ForeignKey('user.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_assigned')
    created_time = models.DateTimeField(auto_now_add=True)
    closed_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Ticket by {self.created_by} for Challenge {self.challenge}"

    
class Message(models.Model):
    ticket = models.ForeignKey('Ticket', on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='sent_messages')
    content = models.CharField(max_length=4000)
    sent_time = models.DateTimeField(auto_now_add=True)
    edit_time = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"Message from {self.author} on Ticket {self.ticket.id}"