from django.shortcuts import render

from rest_framework import generics
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import action

from .serializers import QuestionSerializer, PackSerializer, UserSerializer
from .models import Question, Pack


class QuestionListCreate(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer

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

    def get_queryset(self):
        user = self.request.user
        return Question.objects.filter(author=user)

class QuestionUpdate(generics.UpdateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def update_text(self, request):

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if (serializer.is_valid()):
            serializer.save()
            return Response({"message" : "Data updated successfully!"})
        else:
            return Response({"message" : "Data update failed."})



class QuestionView(generics.CreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class PackCreate(generics.ListCreateAPIView):
    serializer_class = PackSerializer
    
    def try_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class PackDelete(generics.DestroyAPIView):  
    serializer_class = PackSerializer  

class PackUpdate(generics.UpdateAPIView):
    serializer_class = PackSerializer
    queryset = Pack.objects.all()
    
    def update_pack(self, request):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if (serializer.is_valid()):
          serializer.save()
          return Response({"message": "pack updated successfully"})
        else:
          return  Response({"message": "update failed"})
 
class CreatePackView(generics.CreateAPIView):
    query_set = Pack.objects.all()
    serializer_class = Pack
    
class AddQuestionToPack(viewsets.ModelViewSet):
  query_set = Pack.objects.all()
  serializer_class = PackSerializer
  
  @action(detail=True,
            methods=['POST'])
  def update(self, request):
      q = get_object_or_404(klass=Question, question=kwargs.get('question'))
      pack = self.get_object()
      pack.questions.add(q)
      return Response({"message": "question added successfully"})

''' TODO
class DeleteQuestionToPack(generics.ModelViewSet):
'''
