from django.shortcuts import render
from rest_framework import generics

from .serializers import QuestionSerializer
from .models import Question

class QuestionView(generics.CreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

