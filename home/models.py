import datetime

from django.db import models
from django.utils import timezone
from django.urls import reverse


class Question(models.Model):

    question_text = models.CharField(max_length = 200)
    answer_text = models.CharField(max_length = 200, default=' ')

    pub_date = models.DateTimeField("date published")

    def __str__(self):
        return self.question_text

    def was_published_recently(self):
        return self.pub_date >= timezone.now() - datetime.timedelta(days=1)
    
    def get_absolute_url(self):
        return reverse('model-detail-view', args=[str(self.id)])

class Packs(models.Model):
    question = models.ManyToManyField(Question)
    author = models.CharField(max_length = 200)
    description = models.TextField(default=' ')
    

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete = models.CASCADE)
    choice_text = models.CharField(max_length = 200)
    votes = models.IntegerField(default = 0)

    def __str__(self):
        return self.choice_text

