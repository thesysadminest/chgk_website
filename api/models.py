import datetime
from django.db import models
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth.models import User

class Question(models.Model):

    question_text = models.CharField(max_length = 200, default="")
    answer_text = models.CharField(max_length = 200, default="")

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="questions", default=None)
    
    def get_question(self):
        return self.question_text

    def get_answer(self):
        return self.get_answer

    def get_absolute_url(self):
        return reverse('question-detail', args=[str(self.id)])

class Pack(models.Model):
    name = models.TextField(default='Name')
    questions = models.ManyToManyField(Question)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="packs", default=None)
    description = models.TextField(default=' ')
    
    def get_author(self):
        return self.author
    
    def get_questions(self):
        return self.questions.all()
    
    def get_absolute_url(self):
        return reverse('question-detail', args=[str(self.id)])
    
    