from django.contrib import admin
from .models import Question, Pack, User
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

admin.site.register(Question)
admin.site.register(Pack)