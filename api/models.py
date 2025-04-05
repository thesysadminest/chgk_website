import datetime
from django.db import models
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    
    USERNAME_FIELD = 'username'
    email = models.EmailField(unique=True, blank=True, null=True)
    REQUIRED_FIELDS = ['email']
    date_joined = models.DateTimeField(auto_now_add=True) 



class Team(models.Model):
    name = models.TextField(default="", unique=True)
    team_score = models.IntegerField(default=0)
    
    captain = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="users", null=True, blank=True)
    
    pub_date_t = models.DateTimeField("date published",auto_now_add=True)
    
    def get_name(self):
      return self.name
    
    def get_team_score(self):
        return self.team_score

class Question(models.Model):
    question_text = models.TextField(default="")
    answer_text = models.TextField(default="")
    question_note = models.TextField(blank=True, null=True)

    author_q = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="questions", null=True, blank=True)

    pub_date_q = models.DateTimeField("date published", auto_now_add=True)
    
    def get_question(self):
        return self.question_text

    def get_answer(self):
        return self.answer_text
    
    def get_authorq(self):
        return self.author_q.username if self.author_q else "Unknown"

    
    def get_dateq(self):
      return self.pub_date_q  
    
    def get_note(self):
      return self.question_note  

class Pack(models.Model):
    name = models.TextField(default="Name")
    questions = models.ManyToManyField(Question, related_name="questions")
    author_p = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="packs", null=True, blank=True)
    
    description = models.TextField(default="")
    
    pub_date_p = models.DateTimeField("date published", auto_now_add=True)
    
    def get_authorp(self):
        return self.author_p.username if self.author_p else "Unknown"
    
    def get_datep(self):
      return self.pub_date_p  
    
    def get_questions(self):
        return self.questions.all()
    
    def get_description(self):
        return self.description 
    

class GameAttempt(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="game_attempts")
    pack = models.ForeignKey(Pack, on_delete=models.CASCADE, related_name="pack_attempts")
    questions = models.ManyToManyField(Question, related_name="game_attempts")  
    is_correct = models.BooleanField(default=False)
    correct_answers = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"User: {self.user.username} | Question: {self.question.id} | Correct: {self.is_correct}"

    