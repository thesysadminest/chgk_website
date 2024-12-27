import datetime
from django.db import models
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth.models import User

class Team(models.Model):
    name = models.TextField(default="", unique=True)
    team_score = models.IntegerField(default=0)
    
    pub_date_t = models.DateTimeField("date published")
    
    def get_name(self):
      return self.name
    
    def get_team_score(self):
        return self.team_score

class Question(models.Model):
    question_text = models.CharField(max_length = 200, default="")
    answer_text = models.CharField(max_length = 200, default="")

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="questions", default='None')

    pub_date_q = models.DateTimeField("date published")
    
    def get_question(self):
        return self.question_text

    def get_answer(self):
        return self.get_answer

class Pack(models.Model):
    name = models.TextField(default='Name')
    questions = models.ManyToManyField(Question)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="packs", default=None)
    description = models.TextField(default=' ')
    
    pub_date_p = models.DateTimeField("date published")
    
    def get_author(self):
        return self.author
    
    def get_questions(self):
        return self.questions.all()
    