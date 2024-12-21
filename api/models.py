import datetime
from django.db import models
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth.models import AbstractUser

class Question(models.Model):

    question_text = models.CharField(max_length = 200, default="")
    answer_text = models.CharField(max_length = 200, default="")

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="questions", default='None')
    


    def get_question(self):
        return self.question_text

    def get_answer(self):
        return self.get_answer

class Pack(models.Model):
    name = models.TextField(default='Name')
    questions = models.ManyToManyField(Question)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="packs", default=None)
    description = models.TextField(default=' ')
    
    def get_author(self):
        return self.author
    
    def get_questions(self):
        return self.questions.all()
    
    
class Team(models.Model):
    score = models.IntegerField(default="")
    name = models.TextField(default="", unique=True)

class User(AbstractUser):
  name = models.TextField(default="Name", unique=True)
  team =  models.ForeignKey(Team, default="") 
  score = models.IntegerField(default="")
  

