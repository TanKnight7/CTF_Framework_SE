from django.db import models

class Submission(models.Model):
    """
    Logs each flag submission attempt for a challenge.
    - challenge.submissions.all() gives all logs related to a challenge
    - user.submissions.all() gives all logs submitted by a user
    """
    challenge = models.ForeignKey('challenge.Challenge', on_delete=models.CASCADE, related_name='submissions')
    flag = models.CharField(max_length=255)
    status = models.CharField(max_length=30, choices=(('correct', 'Correct'), ('incorrect', 'Incorrect')))
    submitted_by = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='submissions')
    submittion_time = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.submitted_by} - {self.challenge} - {self.status} at {self.submission_time}"
