from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Leaderboard, LeaderboardEntry
from django.contrib.auth.models import User
from .models import Team  # Assuming you have a Team model defined

# Signal to create or update leaderboard entries when a new leaderboard is created
@receiver(post_save, sender=Leaderboard)
def create_leaderboard_entries(sender, instance, created, **kwargs):
    if created:
        # Automatically create leaderboard entries for teams or users
        # Example: You might want to create leaderboard entries for each team here
        # (we can modify this part to suit your logic)
        for team in Team.objects.all():  # Example: Create leaderboard entries for all existing teams
            LeaderboardEntry.objects.create(
                leaderboard=instance,
                team_name=team.name,
                score=0,  # Set score to 0 or whatever logic you want
                entry_type='team'
            )
        print(f"Leaderboard entries created for leaderboard '{instance.name}'.")


# Signal to update leaderboard entries when a user's score is changed
@receiver(post_save, sender=User)  # Assuming the User model has a `score` field or you can link it with game results
def update_user_leaderboard_entry(sender, instance, created, **kwargs):
    if created:
        # When a new user is created, add them to the leaderboard (you can adjust this logic)
        for leaderboard in Leaderboard.objects.all():
            LeaderboardEntry.objects.create(
                leaderboard=leaderboard,
                user=instance,
                score=0,  # Set the initial score
                entry_type='user'
            )
        print(f"Leaderboard entries created for user '{instance.username}'.")

    else:
        # If the user score has changed, you might want to update the leaderboard entry
        # Example: If a score field exists
        leaderboard_entry = LeaderboardEntry.objects.get(leaderboard__name='Default Leaderboard', user=instance)
        leaderboard_entry.score = instance.score  # Update the score
        leaderboard_entry.save()
        print(f"Leaderboard entry for user '{instance.username}' updated with new score.")
