from django.shortcuts import render
from rest_framework import generics, viewsets, status

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.hashers import make_password

from rest_framework.response import Response
from rest_framework.decorators import action, APIView, action, permission_classes

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.contrib.auth import authenticate

from .serializers import ( 
    QuestionSerializer, PackSerializer, 
    UserSerializer, TeamSerializer, 
    AnswerSerializer, SubmitAnswerSerializer,
    MyTokenObtainPairSerializer, 
    RegisterSerializer, LoginSerializer,
    GameSessionSerializer, StartGameSerializer
)

from django.contrib.auth.models import AbstractUser
from .models import Question, Pack, Team, CustomUser, GameSession, Answer

import uuid

# will delete if no errors happen
#from rest_framework.views import APIView
#from rest_framework.decorators import api_view
#from django.http import JsonResponse

###     QUESTION      ###

class QuestionViewList(generics.ListCreateAPIView):
    
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
      queryset = Question.objects.all()
      return queryset
     

class QuestionView(generics.RetrieveAPIView):
    queryset = Question.objects.all()  
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]
   
    
class QuestionCreate(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
    queryset = Question.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(author_q=self.request.user if self.request.user.is_authenticated else None)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201 and not response.data.get('author_q'):
            question = Question.objects.get(id=response.data['id'])
            response.data['author_q'] = question.author_q.username if question.author_q else None
        return response
    
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
  
    @action(detail=True, methods=['POST'])
    def update(self, request):
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
class GameStartView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pack_id):
        pack = get_object_or_404(Pack, id=pack_id)
        questions = pack.questions.all()
        
        if not questions.exists():
            return Response(
                {"error": "This pack has no questions"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Создаем или обновляем попытку игры
        attempt, created = GameAttempt.objects.get_or_create(
            user=request.user,
            pack=pack,
            defaults={'current_question': questions.first()}
        )
        
        return Response({
            "pack_id": pack.id,
            "first_question_id": questions.first().id,
            "total_questions": questions.count()
        })
   
class RandomPackView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        random_pack = Pack.objects.order_by('?').first()
        if not random_pack:
            return Response({"error": "No packs available"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PackSerializer(random_pack)
        return Response(serializer.data)
    
class PackQuestionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pack_id, question_id):
        pack = get_object_or_404(Pack, id=pack_id)
        question = get_object_or_404(pack.questions, id=question_id)
        
        serializer = QuestionSerializer(question)
        return Response(serializer.data)
    
class PackQuestionViewList(generics.ListAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        pack_id = self.kwargs['pack_id']
        pack = get_object_or_404(Pack, id=pack_id)
        return pack.questions.all()
    
class NextQuestionView(APIView):
    permission_classes = [IsAuthenticated]
    
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
 

class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class StartGameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = StartGameSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            if serializer.validated_data.get('pack_id'):
                pack = Pack.objects.get(id=serializer.validated_data['pack_id'])
                questions = pack.questions.all()
                pack_id = pack.id
            else:
                questions = Question.objects.filter(
                    id__in=serializer.validated_data['question_ids']
                )
                pack_id = 0

            if not questions.exists():
                return Response(
                    {"error": "No valid questions provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            session = GameSession.objects.create(
                user=request.user,
                pack_id=pack_id
            )
            session.questions.set(questions)

            return Response({
                "pack_id": session.pack_id,
                "user_id": request.user.id,
                "attempt_id": session.attempt_id,
                "first_question_id": questions.first().id,
                "total_questions": questions.count()
            }, status=status.HTTP_201_CREATED)

        except Pack.DoesNotExist:
            return Response(
                {"error": "Pack not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pack_id, user_id, attempt_id):
        try:
            session = GameSession.objects.get(
                user_id=user_id,
                pack_id=pack_id,
                attempt_id=attempt_id,
                is_completed=False
            )
            current_question = session.get_current_question()
            
            if not current_question:
                return Response(
                    {"error": "No active question in session"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = SubmitAnswerSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            is_correct = (
                serializer.validated_data['answer'].strip().lower() == 
                current_question.answer_text.strip().lower()
            )

            if is_correct:
                session.score += 1

            # Переход к следующему вопросу
            next_index = session.current_question_index + 1
            questions_count = session.questions.count()
            
            if next_index < questions_count:
                session.current_question_index = next_index
                next_question = session.get_current_question()
                session.save()
                return Response({
                    "is_correct": is_correct,
                    "correct_answer": current_question.answer_text,
                    "next_question_id": next_question.id,
                    "score": session.score,
                    "progress": {
                        "current": next_index,
                        "total": questions_count
                    }
                })
            else:
                session.is_completed = True
                session.end_time = timezone.now()
                session.save()
                return Response({
                    "is_correct": is_correct,
                    "correct_answer": current_question.answer_text,
                    "next_question_id": None,
                    "score": session.score,
                    "progress": {
                        "current": questions_count,
                        "total": questions_count
                    },
                    "completed": True
                })

        except GameSession.DoesNotExist:
            return Response(
                {"error": "Game session not found or already completed"},
                status=status.HTTP_404_NOT_FOUND
            )

class GameResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = GameSession.objects.get(
                id=session_id,
                user=request.user
            )
            answers = Answer.objects.filter(session=session).select_related('question')
            
            results = {
                'session_id': session.id,
                'start_time': session.start_time,
                'end_time': session.end_time,
                'score': session.score,
                'total_questions': session.questions.count(),
                'answers': []
            }

            for answer in answers:
                results['answers'].append({
                    'question_id': answer.question.id,
                    'question_text': answer.question.question_text,
                    'user_answer': answer.user_answer,
                    'correct_answer': answer.question.answer_text,
                    'is_correct': answer.is_correct,
                    'timestamp': answer.timestamp
                })

            return Response(results)

        except GameSession.DoesNotExist:
            return Response(
                {"error": "Game session not found"},
                status=status.HTTP_404_NOT_FOUND
            )