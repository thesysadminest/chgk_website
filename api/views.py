from django.shortcuts import render
from rest_framework import generics, viewsets
from rest_framework import viewsets
#from rest_framework import status
#from rest_framework.views import APIView

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import make_password

from rest_framework.response import Response
#from rest_framework.decorators import action
from rest_framework.decorators import APIView
from rest_framework.decorators import action
#from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes

#from django.http import JsonResponse

from .serializers import MyTokenObtainPairSerializer, RegisterSerializer, LoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.contrib.auth import authenticate

from django.contrib.auth.models import AbstractUser

from .serializers import QuestionSerializer, PackSerializer, UserSerializer, TeamSerializer, GameAttemptSerializer
from .models import Question, Pack, Team, CustomUser, GameAttempt

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
    permission_classes = [IsAuthenticated]
    queryset = Question.objects.all()
    
class QuestionDelete(generics.DestroyAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
    queryset = Question.objects.all()

class QuestionUpdate(generics.UpdateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]
    queryset = Pack.objects.all()

class PackDelete(generics.DestroyAPIView):  
    serializer_class = PackSerializer  
    queryset = Pack.objects.all()
    permission_classes = [IsAuthenticated]

class PackUpdate(generics.UpdateAPIView):
    serializer_class = PackSerializer
    queryset = Pack.objects.all()
    permission_classes = [IsAuthenticated]
    
    def update_pack(self, request):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if (serializer.is_valid()):
          serializer.save()
          return Response({"message": "pack updated successfully"})
        else:
          return  Response({"message": "update failed"})
 
class PackView(generics.RetrieveAPIView): 
    serializer_class = PackSerializer
    permission_classes = [AllowAny]
    queryset = Pack.objects.all()

    
class PackViewList(generics.ListCreateAPIView):
    serializer_class = PackSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
      queryset = Pack.objects.all()
      return queryset
    
class AddQuestionToPack(viewsets.ModelViewSet):
    queryset = Pack.objects.all()
    serializer_class = PackSerializer
    permission_classes = [IsAuthenticated]
  
    @action(detail=True,
              methods=['POST'])
    def update(self, request):
        #q = get_object_or_404(klass=Question, question=kwargs.get('question'))
        q = get_object_or_404(klass=Question, id=request.data.get('question_id'))
        pack = self.get_object()
        pack.questions.add(q)
        return Response({"message": "question added successfully"})
  

###     TEAM      ###

class TeamView(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Team.objects.filter(id=self.kwargs['pk']) 
    
class TeamViewList(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
      queryset = Team.objects.all()
      return queryset
    
class TeamCreate(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]
    queryset = Team.objects.all()

class TeamDelete(generics.DestroyAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]
    queryset = Team.objects.all()
    
class TeamUpdate(generics.UpdateAPIView):
    serializer_class = TeamSerializer
    queryset = Team.objects.all()
    permission_classes = [IsAuthenticated]
    
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

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'bio': user.bio,
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({
            'success': True,
            'user': serializer.validated_data['user'],
            'refresh': serializer.validated_data['refresh'],
            'access': serializer.validated_data['access']
        }, status=status.HTTP_200_OK)

class UserViewList(generics.ListCreateAPIView):
    
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      return CustomUser.objects.all()
    
class UserView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      queryset = CustomUser.objects.all().filter(id=self.kwargs['pk'])
      return queryset
    
class UserUpdate(generics.UpdateAPIView):
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()
    permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]
    queryset = CustomUser.objects.all()


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Получение данных текущего авторизованного пользователя
        """
        try:
            user = request.user
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Не удалось получить данные пользователя", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
###     GAME INTERFACE      ###     

class GameStart(APIView):
    # authentication_classes = [JWTAuthentication]  
    permission_classes = [IsAuthenticated]

    def get(self, request, pack_id):
        print("Headers:", request.headers)

        if request.user.is_anonymous or not request.user:
            return Response({"error": "Authentication required"}, status=401)
        
        pack = get_object_or_404(Pack, id=pack_id)
        questions = pack.questions.all().order_by('id')
        
        if not questions.exists():
            return Response({"error": "No questions available"}, status=status.HTTP_400_BAD_REQUEST)

        attempt = GameAttempt.objects.create(user=request.user, pack=pack, is_correct=False)

        first_question = questions.first()

        return Response({"message": "Game started", "first_question_id": first_question.id, "attempt_id": attempt.id})

    
class QuestionDetailView(APIView):
    def get(self, request, pack_id, question_id):
        pack = get_object_or_404(Pack, id=pack_id)
        question = get_object_or_404(pack.questions, id=question_id)
        
        serializer = QuestionSerializer(question)
        return Response(serializer.data)
    
class SubmitAnswerView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]  
    
    def post(self, request, pack_id, question_id):
        pack = get_object_or_404(Pack, id=pack_id)
        question = question = get_object_or_404(pack.questions, id=question_id)
        
        user_answer = (request.data.get("answer") or "").strip().lower()
        correct_answer = (question.answer_text or "").strip().lower()
        is_correct = user_answer == correct_answer

        attempt, created = GameAttempt.objects.get_or_create(user=request.user, pack=pack)
        if is_correct:
            attempt.correct_answers += 1
        attempt.save()

        return Response({"is_correct": is_correct})


class NextQuestionView(APIView):
    def get(self, request, pack_id, question_id):
        pack = get_object_or_404(Pack, id=pack_id)
        questions = list(pack.questions.all().order_by('id'))
        current_question = get_object_or_404(Question, id=question_id)

        try:
            current_index = questions.index(current_question)
            next_question = questions[current_index + 1] if current_index + 1 < len(questions) else None
        except ValueError:
            return Response({"error": "Question not found in this pack"}, status=status.HTTP_400_BAD_REQUEST)

        if next_question:
            return Response({"next_question_id": next_question.id})
        return Response({"message": "Game over"})




class QuizResultsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]  
    def get(self, request, pack_id):
        pack = get_object_or_404(Pack, id=pack_id)
        attempt = GameAttempt.objects.filter(user=request.user, pack=pack).first()
        return Response({
            "correct_answers": attempt.correct_answers if attempt else 0,
            "total_questions": pack.questions.count()
        })
