from django.contrib import admin
from django.urls import path, re_path
from rest_framework import routers
from . import admin
from . import views

''' heyyy experimenting a little bit uncomment for previous version
urlpatterns = [
    path("", views.index, name="index"),
    path('questions/', views.QuestionListView.as_view(), name='questions'),
    #path("<int:question_id>/", views.detail, name="detail"),
    #path("<int:question_id>/vote", views.vote, name="vote"),
    #path("<int:question_id>/results", views.results, name="results")
] 
'''

urlpatterns = [
    path("", views.index, name="index"),
    path('questions/', views.QuestionListView.as_view(), name='questions'),
    re_path(r'^questions/(?P<pk>\d+)', views.QuestionDetailView.as_view(template_name="question_detail.html"), name='question-detail'),
    #re_path(r'^question/(?P<pk>\d+)$', views.QuestionDetailView.as_view(), name='question-detail'),
    #path('/admin/', admin, name = 'admin'),
    #path("<int:question_id>/", views.detail, name="detail"),
    #path("<int:question_id>/vote", views.vote, name="vote"),
    #path("<int:question_id>/results", views.results, name="results"),
]
