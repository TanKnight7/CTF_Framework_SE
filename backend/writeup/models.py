from django.db import models

# Create your models here.
class Writeup(models.Model):
    team_id = models.ForeignKey('team.Team', on_delete=models.CASCADE)
    path = models.FileField() 
    submision_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Writeup by {self.team} submited at {self.submision_time}"
