from django.db import models
from django.db.models import Q

class Leaderboard(models.Model):
    name = models.CharField(max_length=100)  # Name of the leaderboard (e.g., "Daily", "Weekly", etc.)
    created_at = models.DateTimeField(auto_now_add=True)  # Date when the leaderboard was created
    updated_at = models.DateTimeField(auto_now=True)  # Date when the leaderboard was last updated

    def __str__(self):
        return self.name

class LeaderboardEntry(models.Model):
    # This model stores each user's score in the leaderboard
    leaderboard = models.ForeignKey(Leaderboard, related_name='entries', on_delete=models.CASCADE)
    user = models.ForeignKey('user.User', null=True, blank=True, on_delete=models.CASCADE)  # If entry type is 'user'
    team = models.ForeignKey('team.Team', null=True, blank=True, on_delete=models.CASCADE)  # If entry type is 'team'
    score = models.IntegerField()  # The score the user achieved
    rank = models.PositiveIntegerField()  # Rank of the user in the leaderboard
    created_at = models.DateTimeField(auto_now_add=True)  # When the score was submitted
    updated_at = models.DateTimeField(auto_now=True)  # When the score was last updated

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['leaderboard', 'user'], condition=Q(user__isnull=False), name='unique_user_per_leaderboard'),
            models.UniqueConstraint(fields=['leaderboard', 'team'], condition=Q(team__isnull=False), name='unique_team_per_leaderboard'),
        ]

    def __str__(self):
        if self.entry_type == 'user':
            return f"{self.user.username} - {self.score} ({self.rank} rank)"
        return f"{self.team.name} - {self.score} ({self.rank} rank)"
