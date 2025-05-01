from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name

# Create your models here.
class Challenge(models.Model):
    title = models.CharField(max_length=150)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="challenge")
    flag = models.CharField(max_length=500)
    difficulty = models.IntegerField()
    description = models.CharField(max_length=2000)
    solve_count = models.IntegerField(default=0)
    attachment = models.FileField() # file path
    point = models.IntegerField(default=501)
    author = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name="challenge")
    rating = models.FloatField(default=0.0)

    def update_average_rating(self):
        self.rating = (self.review.aggregate(avg_rating=models.Avg('rating'))['avg_rating'])
        self.save()

    def __str__(self):
        return self.title
