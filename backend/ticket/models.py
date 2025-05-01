from django.db import models

# Create your models here.
'''
related_name biar bisa kek gini:
challenge.tickets.all()
user.tickets_created.all()
'''
class Ticket(models.Model):
    challenge = models.ForeignKey('challenge.Challenge', on_delete=models.CASCADE, related_name='tickets')
    status = models.CharField(max_length=30,default='open', choices=(('open', 'Open'), ('closed', 'Closed')))
    created_by = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='tickets_created')
    created_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('created_by', 'challenge', 'status')  # Optional: Ensure only one open ticket per user per challenge
    
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