from django.db import models

# Create your models here.
class Writeup(models.Model):
    team = models.ForeignKey('team.Team', on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, null=True, blank=True)
    path = models.FileField(upload_to='wu/', null=True, blank=True)
    submission_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.team:
            return f"Writeup by Team {self.team} submitted at {self.submission_time}"
        elif self.user:
            return f"Writeup by User {self.user.username} submitted at {self.submission_time}"
        return f"Writeup submitted at {self.submission_time}"
