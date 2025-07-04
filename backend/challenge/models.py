from django.db import models
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.name

# Create your models here.
class Challenge(models.Model):
    title = models.CharField(max_length=150, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="challenge")
    flag = models.CharField(max_length=500, null=False, blank=False)
    difficulty = models.IntegerField()
    description = models.CharField(max_length=2000)
    point = models.IntegerField(default=501)
    author = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name="challenge")
    solved_by = models.ManyToManyField('user.User', through='ChallengeSolve', related_name="solved_challenges")
    rating = models.FloatField(default=0.0)

    def update_average_rating(self):
        avg = self.reviews.aggregate(avg_rating=models.Avg('rating'))['avg_rating']
        self.rating = avg if avg is not None else 0.0
        self.save()
    
    def solve_count(self):
        return self.solved_by.count()

    def __str__(self):
        return self.title

class ChallengeReview(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name="reviews")
    rating = models.IntegerField()
    feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'challenge')

    def __str__(self):
        return f"Review by {self.user.username} for {self.challenge.title}"

class ChallengeSolve(models.Model):
    user = models.ForeignKey('user.User', on_delete=models.CASCADE)
    challenge = models.ForeignKey('Challenge', on_delete=models.CASCADE)
    solved_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'challenge')
    
    def __str__(self):
        return f"{self.user.username} solved {self.challenge.title} at {self.solved_at}"

class ChallengeAttachment(models.Model):
    challenge = models.ForeignKey('Challenge', on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to='challenge_attachments/')
    name = models.CharField(max_length=255, help_text="Display name for the attachment")

    def __str__(self):
        return f"{self.challenge.title} - {self.name}"
