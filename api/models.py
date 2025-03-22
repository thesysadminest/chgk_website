import datetime
from django.db import models
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    bio = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.username

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

    author_q = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="questions", default='None')

    pub_date_q = models.DateTimeField("date published")
    
    def get_question(self):
        return self.question_text

    def get_answer(self):
        return self.get_answer
    
    def get_authorq(self):
        return self.User.author_q.username
    
    def get_dateq(self):
      return self.pub_date_q  

class Pack(models.Model):
    name = models.TextField(default='Name')
    questions = models.ManyToManyField(Question)
    #author_p = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="packs", default='None')
    description = models.TextField(default=' ')
    
    pub_date_p = models.DateTimeField("date published")
    
    def get_authorp(self):
        return self.User.author_p.username
    
    def get_datep(self):
      return self.pub_date_p  
    
    def get_questions(self):
        return self.questions.all()
    