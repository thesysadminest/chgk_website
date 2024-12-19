from django.urls import path, re_path
from rest_framework import routers
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
    re_path(r'^question/(?P<pk>\d+)$', views.QuestionDetailView.as_view(), name='question-detail'),
    #path("<int:question_id>/", views.detail, name="detail"),
    #path("<int:question_id>/vote", views.vote, name="vote"),
    #path("<int:question_id>/results", views.results, name="results"),
]
