import datetime

from django.db import models
from django.utils import timezone


class Question(models.Model):

    question_text = models.CharField(max_length = 200, default="")
    answer_text = models.CharField(max_length = 200, default="")
    correct_answers = models.IntegerField(default=0)
    date_created = models.DateTimeField(auto_now_add=True)


