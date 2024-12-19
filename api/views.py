from django.shortcuts import render

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User

from .serializers import QuestionSerializer, PackSerializer, UserSerializer
from .models import Question, Pack


class QuestionListCreate(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Question.objects.filter(author=user)

    def try_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class QuestionDelete(generics.DestroyAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Question.objects.filter(author=user)


class QuestionView(generics.CreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]


class PackListCreate(generics.ListCreateAPIView):
    serializer_class = PackSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Pack.objects.filter(author=user)

    def try_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class PackDelete(generics.CreateAPIView):
    queryset = Pack.objects.all()
    serializer_class = PackSerializer
    permission_classes = [AllowAny]


class UserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
