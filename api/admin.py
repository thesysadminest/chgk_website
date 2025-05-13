from django.contrib import admin
from .models import Question, Pack, Team, CustomUser, GameSession

admin.site.register(Question)
admin.site.register(Pack)
admin.site.register(Team)
admin.site.register(CustomUser)
admin.site.register(GameSession)