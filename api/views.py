from django.shortcuts import render
from rest_framework import generics, viewsets, status

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import make_password

from rest_framework.response import Response
from rest_framework.decorators import action, APIView, api_view, permission_classes

from django.http import JsonResponse

from api.serializers import MyTokenObtainPairSerializer, RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from django.contrib.auth.models import AbstractUser

from .serializers import QuestionSerializer, PackSerializer, UserSerializer, TeamSerializer
from .models import Question, Pack, Team, CustomUser

###     QUESTION      ###

class QuestionViewList(generics.ListCreateAPIView):
    
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      queryset = Question.objects.all()
      return queryset

class QuestionView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      queryset = Question.objects.all().filter(id=self.kwargs['pk'])
      return queryset
    
class QuestionCreate(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]
    queryset = Question.objects.all()
    
class QuestionDelete(generics.DestroyAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]
    queryset = Question.objects.all()

class QuestionUpdate(generics.UpdateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]

    def update_text(self, request):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if (serializer.is_valid()):
            serializer.save()
            return Response({"message" : "Data updated successfully!"})
        else:
            return Response({"message" : "Data update failed."})


###     PACK      ###

class PackCreate(generics.ListCreateAPIView):
    serializer_class = PackSerializer
    permission_classes = [AllowAny]
    queryset = Pack.objects.all()

class PackDelete(generics.DestroyAPIView):  
    serializer_class = PackSerializer  
    queryset = Pack.objects.all()
    permission_classes = [AllowAny]

class PackUpdate(generics.UpdateAPIView):
    serializer_class = PackSerializer
    queryset = Pack.objects.all()
    permission_classes = [AllowAny]
    
    def update_pack(self, request):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if (serializer.is_valid()):
          serializer.save()
          return Response({"message": "pack updated successfully"})
        else:
          return  Response({"message": "update failed"})
 
class PackView(generics.ListCreateAPIView):
    serializer_class = PackSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      queryset = Pack.objects.all().filter(id=self.kwargs['pk'])
      return queryset
    
class PackViewList(generics.ListCreateAPIView):
    serializer_class = PackSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      queryset = Pack.objects.all()
      return queryset
    
class AddQuestionToPack(viewsets.ModelViewSet):
    query_set = Pack.objects.all()
    serializer_class = PackSerializer
    permission_classes = [AllowAny]
  
    @action(detail=True,
              methods=['POST'])
    def update(self, request):
        q = get_object_or_404(klass=Question, question=kwargs.get('question'))
        pack = self.get_object()
        pack.questions.add(q)
        return Response({"message": "question added successfully"})
  

###     TEAM      ###

class TeamView(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      queryset = Team.objects.all().filter(id=self.kwargs['pk'])
      return queryset
    
class TeamViewList(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
      queryset = Team.objects.all()
      return queryset
    
class TeamCreate(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [AllowAny]
    queryset = Team.objects.all()

class TeamDelete(generics.DestroyAPIView):
    serializer_class = TeamSerializer
    permission_classes = [AllowAny]
    queryset = Team.objects.all()
    
class TeamUpdate(generics.UpdateAPIView):
    serializer_class = TeamSerializer
    queryset = Team.objects.all()
    permission_classes = [AllowAny]
    
    def update_team(self, request):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if (serializer.is_valid()):
          serializer.save()
          return Response({"message": "pack updated successfully"})
        else:
          return  Response({"message": "update failed"})

@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token/',
        '/api/user/register/',
        '/api/token/refresh/',
        '/api/prediction/'
        'api/profile/',
        'api/profile/update/',

    ]

###     USER      ###

#Login User
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

#Register User
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny, )
    serializer_class = RegisterSerializer
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getProfile(request):
    user = request.user
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def updateProfile(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)

class UserViewList(generics.ListCreateAPIView):
    
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      queryset = CustomUser.objects.all()
      return queryset