from django.shortcuts import render
from rest_framework import generics, viewsets, status

import random

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
    MyTokenObtainPairSerializer, 
    RegisterSerializer, LoginSerializer,
    GameSessionSerializer
)

from django.contrib.auth.models import AbstractUser
from .models import Question, Pack, Team, CustomUser, GameSession

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
        print("Received data:", request.data)
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
    
    def perform_create(self, serializer):
        serializer.save(author_p=self.request.user)

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
    def update(self, request, pk=None):
        pack = self.get_object()
        question_id = request.data.get('question_id')
        
        if not question_id:
            return Response({"error": "question_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            question = Question.objects.get(id=question_id)
            pack.questions.add(question)
            return Response({"message": "Question added successfully"}, status=status.HTTP_200_OK)
        except Question.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['POST'])
    def add_questions(self, request, pk=None):
        pack = self.get_object()
        question_ids = request.data.get('question_ids', [])
    
        if not question_ids:
            return Response({"error": "question_ids array is required"}, status=status.HTTP_400_BAD_REQUEST)
    
        questions = Question.objects.filter(id__in=question_ids)
        pack.questions.add(*questions)
        return Response({"message": f"{len(questions)} questions added"}, status=status.HTTP_200_OK)


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
    
    def get(self, request, pack_id):
        try:
            if (pack_id == 0):
                while (True):
                  pack_id = random.randint(1, Pack.objects.count() + 1)
                  pack = Pack.objects.get(id=pack_id)
                  questions = pack.questions.all().order_by('id')
                  if questions.count() != 0:
                      break
            print(f"Starting game for pack {pack_id}, user {request.user.id}")  # Логирование
            pack = Pack.objects.get(id=pack_id)
            questions = pack.questions.all().order_by('id')
            print(pack_id)
            if not questions.exists():
                print("Pack has no questions")  # Логирование
                return Response({"error": "This pack has no questions"}, status=400)
            
            session = GameSession.objects.create(
                user=request.user,
                pack=pack,
                correct_answers=0,
                current_question_index=0
            )
            session.questions.set(questions)
            
            print(f"Session created: {session.id}")  # Логирование
            return Response({
                "real_pack_id" : pack_id, 
                "first_question": {
                    "id": questions.first().id,
                    "question_text": questions.first().question_text
                },
                "session": {
                    "id": session.id,
                    "current_question_index": 0,
                    "questions_count": questions.count()
                }
            })
            
        except Pack.DoesNotExist:
            print("Pack not found")  # Логирование
            return Response({"error": "Pack not found"}, status=404)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")  # Логирование
            return Response({"error": str(e)}, status=500)

class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pack_id, question_id):
        try:
            pack = Pack.objects.get(id=pack_id)
            question = Question.objects.get(id=question_id)

            session = GameSession.objects.filter(
                user=request.user,
                pack=pack,
                is_completed=False
            ).latest('created_at')

            current_question = session.get_current_question()
            if not current_question or current_question.id != question.id:
                return Response(
                    {"error": "This is not the current question."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user_answer = (request.data.get("answer") or "").strip().lower()
            correct_answer = (question.answer_text or "").strip().lower()
            is_correct = user_answer == correct_answer

            if is_correct:
                session.correct_answers += 1
                session.save()

            return Response({
                "is_correct": is_correct,
                "correct_answer": correct_answer,
                "current_score": session.correct_answers,
                "session": GameSessionSerializer(session).data
            })

        except (Pack.DoesNotExist, Question.DoesNotExist):
            return Response(
                {"error": "Pack or question not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except GameSession.DoesNotExist:
            return Response(
                {"error": "No active game session found"},
                status=status.HTTP_404_NOT_FOUND
            )


class NextQuestionView(APIView):
    def get(self, request, pack_id, question_id):
        try:
            session = GameSession.objects.filter(
                user=request.user,
                pack_id=pack_id,
                is_completed=False
            ).latest('created_at')
            
            next_question = session.move_to_next_question()
            
            if next_question:
                return Response({
                    "question": {
                        "id": next_question.id,
                        "question_text": next_question.question_text
                    },
                    "session": {
                        "id": session.id,
                        "current_question_index": session.current_question_index,
                        "questions_count": session.questions.count()
                    }
                })
            else:
                return Response({
                    "message": "Game completed",
                    "final_score": session.correct_answers,
                    "total_questions": session.questions.count()
                })
                
        except GameSession.DoesNotExist:
            return Response(
                {"error": "No active game session found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
class PackQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pack_id, question_id):
        try:
            pack = Pack.objects.get(id=pack_id)
            question = Question.objects.get(id=question_id)

            session = GameSession.objects.filter(
                user=request.user,
                pack=pack,
                is_completed=False
            ).latest('created_at')

            current_question = session.get_current_question()
            if current_question.id != question.id:
                return Response(
                    {"error": "Это не текущий вопрос."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response({
                "question": {
                    "id": question.id,
                    "question_text": question.question_text
                },
                "session": GameSessionSerializer(session).data
            })
        except (Pack.DoesNotExist, Question.DoesNotExist):
            return Response({"error": "Пак или вопрос не найдены"}, status=404)
        except GameSession.DoesNotExist:
            return Response({"error": "Нет активной игровой сессии"}, status=404)

    
class PackQuestionViewList(generics.ListAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        pack_id = self.kwargs['pack_id']
        pack = get_object_or_404(Pack, id=pack_id)
        return pack.questions.all()

class QuestionDetailView(APIView):
    def get(self, request, pack_id, question_id):
        pack = get_object_or_404(Pack, id=pack_id)
        question = get_object_or_404(pack.questions, id=question_id)
        
        serializer = QuestionSerializer(question)
        return Response(serializer.data)
 

class GameResultsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]  
    def get(self, request, pack_id):
        pack = get_object_or_404(Pack, id=pack_id)
        attempt = GameSession.objects.filter(user=request.user, pack=pack).first()
        return Response({
            "correct_answers": attempt.correct_answers if attempt else 0,
            "total_questions": pack.questions.count()
        })