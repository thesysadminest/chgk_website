import datetime
import uuid
from django.db import models
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    USERNAME_FIELD = 'username'
    email = models.EmailField(unique=True, blank=True, null=True)
    REQUIRED_FIELDS = ['email']  
    
    bio = models.TextField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True) 
    personal_score = models.IntegerField(default=0)

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
    #author_q = models.PrimaryKeyRelatedField(CustomUser, on_delete=models.CASCADE, related_name="questions", null=True, blank=True)
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
    
###class GameAttempt(models.Model):
###   user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="game_attempts")
###    pack = models.ForeignKey(Pack, on_delete=models.CASCADE, related_name="pack_attempts")
###    questions = models.ManyToManyField(Question, related_name="game_attempts")  
###    is_correct = models.BooleanField(default=False)
###    correct_answers = models.IntegerField(default=0)
###    timestamp = models.DateTimeField(auto_now_add=True)
    
###    def __str__(self):
###        return f"User: {self.user.username} | Question: {self.question.id} | Correct: {self.is_correct}"

class GameSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    pack_id = models.IntegerField()  # 0 для кастомных пакетов
    attempt_id = models.IntegerField()  # Номер попытки
    questions = models.ManyToManyField(Question)
    current_question_index = models.IntegerField(default=0)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'pack_id', 'attempt_id')

    def save(self, *args, **kwargs):
        if not self.attempt_id:
            last_attempt = GameSession.objects.filter(
                user=self.user, 
                pack_id=self.pack_id
            ).order_by('-attempt_id').first()
            self.attempt_id = (last_attempt.attempt_id + 1) if last_attempt else 1
        super().save(*args, **kwargs)

    def get_current_question(self):
        questions = list(self.questions.order_by('id'))
        if 0 <= self.current_question_index < len(questions):
            return questions[self.current_question_index]
        return None
    
class Answer(models.Model):
    session = models.ForeignKey(
        GameSession, 
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user_answer = models.TextField()
    is_correct = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'question')
        ordering = ['timestamp']