﻿import datetime
import uuid
from django.db import models
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db.models import Sum, Count
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

class CustomUser(AbstractUser):
    USERNAME_FIELD = 'username'
    email = models.EmailField(unique=True, blank=True, null=True)
    REQUIRED_FIELDS = ['email']  
    
    bio = models.TextField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True) 
    elo_rating = models.IntegerField(default=1000)


class Team(models.Model):
    name = models.TextField(default="", unique=True)
    team_score = models.IntegerField(default=0)
    captain = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(default="")
    active_members = models.ManyToManyField(CustomUser, related_name='active_teams')
    pending_members = models.ManyToManyField(CustomUser, related_name='pending_teams')
    
    def __str__(self):
        return self.name
    
    def get_active_members(self):
        return self.active_members.all()
        
    def get_pending_members(self):
        return self.pending_members.all()
    
    def get_captain_username(self):
        return self.captain.username if self.captain else None

    def add_invitation(self, user):
        if not self.active_members.filter(id=user.id).exists() and \
           not self.pending_members.filter(id=user.id).exists():
            self.pending_members.add(user)
            return True
        return False

    def add_member(self, user):
        if self.pending_members.filter(id=user.id).exists() and \
           not self.active_members.filter(id=user.id).exists():
            self.pending_members.remove(user)
            self.active_members.add(user)
            return True
        return False
    

class Invitation(models.Model):
    user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    team = models.ForeignKey(
        Team, 
        on_delete=models.CASCADE, 
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=10, 
        choices=[
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('rejected', 'Rejected')
        ],
        default='pending'
    )

    def __str__(self):
        return f"{self.user.username} - {self.notification_type}"
    
class Question(models.Model):
    question_text = models.TextField(default="") # текст вопроса
    answer_text = models.TextField(default="") # текст ответа
    question_note = models.TextField(blank=True, null=True) # комментарий
    image = models.ImageField(upload_to='media/questions', null=True)
    author_q = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="questions", null=True, blank=True)
    pub_date_q = models.DateTimeField("date published", auto_now_add=True)

    DIFFICULTY_CHOICES = [
        (1, 'Очень просто'),
        (2, 'Просто'),
        (3, 'Стандарт'),
        (4, 'Сложно'),
        (5, 'Очень сложно'),
    ]

    difficulty = models.IntegerField(choices=DIFFICULTY_CHOICES, default=1)

    def save(self, *args, **kwargs):
        if self.pk:
            old = Question.objects.get(pk=self.pk)
            if old.image and old.image != self.image:
                old.image.delete(save=False)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)

    def delete_image(self):
        if self.image:
            self.image.delete(save=False)
            self.image = None
            self.save()


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
    description = models.TextField(default="", null=True, blank=True)
    pub_date_p = models.DateTimeField("date published", auto_now_add=True)
    
    def get_authorp(self):
        return self.author_p.username if self.author_p else "Unknown"
    
    def get_datep(self):
      return self.pub_date_p  
    
    def get_questions(self):
        return self.questions.all()
    
    def get_description(self):
        return self.description 
   
class GameSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="game_sessions")
    pack = models.ForeignKey(Pack, on_delete=models.CASCADE, related_name="game_sessions")
    questions = models.ManyToManyField(Question, related_name="game_sessions")
    current_question_index = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    correct_answers = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_current_question(self):
        questions = list(self.questions.all())
        if 0 <= self.current_question_index < len(questions):
            return questions[self.current_question_index]
        return None

    def move_to_next_question(self):
        if self.is_completed:
            return None

        questions = list(self.questions.all().order_by('id'))
        next_index = self.current_question_index + 1

        if next_index < len(questions):
            self.current_question_index = next_index
            self.save()
            return questions[self.current_question_index]
        else:
            self.is_completed = True
            self.save()
            return None

    def __str__(self):
        return f"{self.user.username} - {self.pack.name}"


class ForumThread(models.Model):
    title = models.CharField(max_length=200)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_closed = models.BooleanField(default=False)
    message_count = models.IntegerField(default=0)  

    def get_all_messages(self):
        return self.messages.select_related('author').prefetch_related('replies').all()

    def __str__(self):
        return self.title

class ForumMessage(models.Model):
    thread = models.ForeignKey(ForumThread, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent_message = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    upvotes_count = models.IntegerField(default=0)
    downvotes_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['created_at']

    def save(self, *args, **kwargs):
        is_new = not self.pk
        super().save(*args, **kwargs)
        
        if is_new:
            self.thread.message_count = self.thread.messages.count()
            self.thread.save(update_fields=['message_count'])

    def get_user_vote(self, user):
        
        if not user.is_authenticated:
            return None
        
        try:
            vote = self.votes.get(user=user)
            return vote.vote
        except MessageVote.DoesNotExist:
            return None

class MessageVote(models.Model):
    VOTE_CHOICES = (
        (1, 'Upvote'),
        (-1, 'Downvote'),
    )
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.ForeignKey(ForumMessage, on_delete=models.CASCADE, related_name='votes')
    vote = models.SmallIntegerField(choices=VOTE_CHOICES)
    
    class Meta:
        unique_together = ('user', 'message') 
        
    def __str__(self):
        return f"{self.user.username} voted {self.get_vote_display()} for message #{self.message.id}"
    
    def save(self, *args, **kwargs):                                                
        created = not self.pk
        old_vote = None
        if not created:
            old_vote = MessageVote.objects.get(pk=self.pk).vote
        
        super().save(*args, **kwargs)
      
        self.message.rating = self.message.votes.aggregate(
            Sum('vote')
        )['vote__sum'] or 0
        
        self.message.upvotes_count = self.message.votes.filter(vote=1).count()
        self.message.downvotes_count = self.message.votes.filter(vote=-1).count()
        self.message.save()
        
class TeamMember(models.Model):
    ROLES = [
        ('CAPTAIN', 'Captain'),
        ('MEMBER', 'Member'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    role = models.CharField(max_length=10, choices=ROLES, default='MEMBER')
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('user', 'team')

class UserRatingHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='rating_history')
    rating = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

@receiver(post_save, sender=CustomUser)
def save_rating_history(sender, instance, **kwargs):
    update_fields = kwargs.get('update_fields') or set()
    if kwargs.get('created', False) or 'elo_rating' in update_fields:
        UserRatingHistory.objects.create(user=instance, rating=instance.elo_rating)
       