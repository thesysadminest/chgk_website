from django.shortcuts import render
from rest_framework import generics, viewsets, status
from rest_framework.views import APIView

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import make_password

from rest_framework.response import Response
from rest_framework.decorators import action, APIView, api_view, permission_classes

from django.http import JsonResponse

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
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )
        
        if not user:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
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
        }, status=status.HTTP_200_OK)

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
    
###     GAME INTERFACE      ###


#class GameViewSet(viewsets.ViewSet):
    
#   @action(detail=True, methods=['get'])
#    def start(self, request, pk=None):
#        pack = get_object_or_404(Pack, pk=pk)
#        questions = pack.questions.all()
#        if not questions.exists():
#            return Response({"message": "no questions"}, status=status.HTTP_400_BAD_REQUEST)
#        
#        request.session[f'game_{pk}'] = {"index": 0, "correct": 0, "incorrect": 0}
#        return Response(QuestionSerializer(questions.first()).data)
#    
#    @action(detail=True, methods=['post'])
#    def check(self, request, pk=None):
#       session_key = f'game_{pk}'
#        game_data = request.session.get(session_key)
#        if not game_data:
#            return Response({"message": "game did not start"}, status=status.HTTP_400_BAD_REQUEST)
#        
#        pack = get_object_or_404(Pack, pk=pk)
#        questions = pack.questions.all()
#        index = game_data["index"]
#        if index >= len(questions):
#            return Response({"message": "game over"}, status=status.HTTP_400_BAD_REQUEST)
#        
#        question = questions[index]
#        user_answer = request.data.get("answer", "").strip().lower()
#        correct_answer = question.answer.strip().lower()
#        
#        if user_answer == correct_answer:
#            game_data["correct"] += 1
#            is_correct = True
#        else:
#            game_data["incorrect"] += 1
#            is_correct = False
#        
#        game_data["index"] += 1
#        request.session[session_key] = game_data
#        
#        return Response({
#            "is_correct": is_correct,
#            "correct_answer": correct_answer,
#            "next_question": QuestionSerializer(questions[game_data["index"]]).data if game_data["index"] < len(questions) else None
#        })
#    
#    @action(detail=True, methods=['get'])
#    def result(self, request, pk=None):
#        session_key = f'game_{pk}'
#        game_data = request.session.pop(session_key, None)
#        if not game_data:
#            return Response({"message": "game not found"}, status=status.HTTP_400_BAD_REQUEST)
#        
#        return Response({
#            "correct": game_data["correct"],
#            "incorrect": game_data["incorrect"]
#        })
#      

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
        question = get_object_or_404(pack.questions, id=question_id, pack = pack)
        
        serializer = QuestionSerializer(question)
        return Response(serializer.data)
    
class SubmitAnswerView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]  
    
    def post(self, request, pack_id, question_id):
        pack = get_object_or_404(Pack, id=pack_id)
        question = get_object_or_404(Question.objects.filter(pack=pack), id=question_id)
        
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
