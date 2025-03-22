from django.shortcuts import render
from rest_framework import generics, viewsets, status
from rest_framework.views import APIView

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import make_password

from rest_framework.response import Response
from rest_framework.decorators import action, APIView, api_view, permission_classes

from django.http import JsonResponse

from api.serializers import MyTokenObtainPairSerializer, RegisterSerializer, LoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate

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

###     USER      ###

#Login User
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

#Register User
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'bio': user.bio,
                    },
                    'token': str(refresh.access_token),
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(email=serializer.validated_data['email'], password=serializer.validated_data['password'])
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'bio': user.bio,
                    },
                    'token': str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            #return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewList(generics.ListCreateAPIView):
    
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      queryset = CustomUser.objects.all()
      return queryset
    
class UserView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      queryset = CustomUser.objects.all().filter(id=self.kwargs['pk'])
      return queryset
    
class UserUpdate(generics.UpdateAPIView):
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()
    permission_classes = [AllowAny]
    #lookup_field = "id"
    
    def update(self, request):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if (serializer.is_valid()):
          serializer.save()
          return Response({"message": "pack updated successfully"})
        else:
          return  Response({"message": "update failed"})
        
class UserDelete(generics.DestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    queryset = CustomUser.objects.all()
        