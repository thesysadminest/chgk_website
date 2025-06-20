from django.shortcuts import render
from rest_framework import generics, viewsets, status, permissions

import random

from django.db import transaction
from django.db.models import Sum, Count, Max

from django.core.exceptions import ValidationError

from django.shortcuts import get_object_or_404
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
    GameSessionSerializer,
    ForumThreadSerializer, ForumMessageSerializer, 
    MessageVoteSerializer,
    NotificationSerializer
)

from django.contrib.auth.models import AbstractUser
from .models import Question, Pack, Team, CustomUser, GameSession, ForumThread, ForumMessage, MessageVote, Notification

import uuid

# will delete if no errors happen
#from rest_framework.views import APIView
#from rest_framework.decorators import api_view
#from django.http import JsonResponse

###     QUESTION      ###

class QuestionViewList(generics.ListCreateAPIView):
    
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
      queryset = Question.objects.all()
      return queryset
     

class QuestionView(generics.RetrieveAPIView):
    queryset = Question.objects.all()  
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
   
    
class QuestionCreate(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
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
    permission_classes = [permissions.IsAuthenticated]
    queryset = Question.objects.all()

class QuestionUpdate(generics.UpdateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]
    queryset = Pack.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(author_p=self.request.user)

class PackDelete(generics.DestroyAPIView):  
    serializer_class = PackSerializer  
    queryset = Pack.objects.all()
    permission_classes = [permissions.IsAuthenticated]

class PackUpdate(generics.UpdateAPIView):
    serializer_class = PackSerializer
    queryset = Pack.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
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
    permission_classes = [permissions.AllowAny]
    queryset = Pack.objects.all()

    
class PackViewList(generics.ListCreateAPIView):
    serializer_class = PackSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
      queryset = Pack.objects.all()
      return queryset
    
class AddQuestionToPack(viewsets.ModelViewSet):
    queryset = Pack.objects.all()
    serializer_class = PackSerializer
    permission_classes = [permissions.IsAuthenticated]
  
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

class TeamView(generics.RetrieveAPIView):
    serializer_class = TeamSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Team.objects.all()
   
    
class TeamViewList(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
      queryset = Team.objects.all()
      return queryset
    
class TeamCreate(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Team.objects.all()

    def perform_create(self, serializer):
        serializer.save()

class TeamDelete(generics.DestroyAPIView):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Team.objects.all()
    
class TeamUpdate(generics.UpdateAPIView):
    serializer_class = TeamSerializer
    queryset = Team.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def update_team(self, request):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if (serializer.is_valid()):
          serializer.save()
          return Response({"message": "pack updated successfully"})
        else:
          return  Response({"message": "update failed"})

###     USER      ###

#Login CustomUser
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

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
    permission_classes = [permissions.AllowAny]

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
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
      return CustomUser.objects.all()
    
class UserView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
      queryset = CustomUser.objects.all().filter(id=self.kwargs['pk'])
      return queryset
    
class UserUpdate(generics.UpdateAPIView):
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAuthenticated]
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
    permission_classes = [permissions.IsAuthenticated]
    queryset = CustomUser.objects.all()

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
   
    def get(self, request):
        try:
            user = request.user
            print(f"Current user: {user.username}, auth: {request.auth}")
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            print(f"Error in /api/user/me/: {str(e)}")
            return Response(
                {"error": "Не удалось получить данные пользователя", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
  
 
###     GAME INTERFACE      ###     
class GameStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
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
    permission_classes = [permissions.IsAuthenticated]

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

            rating_change = question.difficulty * 10

            if is_correct:
                session.correct_answers += 1
                request.user.elo_rating += rating_change
            else:
                request.user.elo_rating = max(500, request.user.elo_rating - rating_change) # минимум ело: 500
            
            request.user.save()
            session.save()

            return Response({
                "is_correct": is_correct,
                "correct_answer": correct_answer,
                "current_score": session.correct_answers,
                "rating_change": rating_change,
                "new_rating": request.user.elo_rating,
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
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.AllowAny]
    
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
    permission_classes = [permissions.IsAuthenticated]  
    def get(self, request, pack_id):
        pack = get_object_or_404(Pack, id=pack_id)
        attempt = GameSession.objects.filter(user=request.user, pack=pack).first()
        return Response({
            "correct_answers": attempt.correct_answers if attempt else 0,
            "total_questions": pack.questions.count()
        })
    

###     FORUM INTERFACE      ###   

class ThreadViewList(generics.ListCreateAPIView):
    serializer_class = ForumThreadSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = ForumThread.objects.annotate(
            calculated_message_count=Count('messages'), 
            last_activity=Max('messages__created_at')
        ).select_related('created_by').prefetch_related('messages')
        
        # Сортировка по дате обновления (новые сначала)
        queryset = queryset.order_by('-updated_at')
        
        # Фильтрация
        is_closed = self.request.query_params.get('is_closed')
        if is_closed is not None:
            queryset = queryset.filter(is_closed=is_closed.lower() == 'true')
            
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)      
 

class ThreadMessagesViewList(generics.ListAPIView):
    serializer_class = ForumMessageSerializer
    
    def get_queryset(self):
        # Теперь используем self.kwargs['pk'] вместо thread_id
        thread = get_object_or_404(ForumThread, pk=self.kwargs['pk'])
        
        # Получаем сообщения с предзагрузкой связанных данных
        return thread.messages.filter(
            parent_message__isnull=True
        ).select_related(
            'author'
        ).prefetch_related(
            'replies',
            'replies__author'
        ).order_by('created_at')


class MessageCreateView(generics.CreateAPIView):
    serializer_class = ForumMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        thread_id = kwargs.get('thread_id')
        thread = get_object_or_404(ForumThread, id=thread_id)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            message = serializer.save(
                author=request.user,
                thread=thread,
                parent_message_id=request.data.get('parent_message')
            )
            
            thread.save()
            
            return Response(
                ForumMessageSerializer(message, context=self.get_serializer_context()).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class MessageVoteView(generics.CreateAPIView):
    queryset = MessageVote.objects.all()
    serializer_class = MessageVoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        message_id = kwargs['message_id']
        message = get_object_or_404(ForumMessage, id=message_id)
        user = request.user
        vote_value = serializer.validated_data['vote']

        with transaction.atomic():
            vote, created = MessageVote.objects.update_or_create(
                user=user,
                message=message,
                defaults={'vote': vote_value}
            )
            
            # Обновляем рейтинг и счетчики
            message.rating = message.votes.aggregate(Sum('vote'))['vote__sum'] or 0
            message.upvotes_count = message.votes.filter(vote=1).count()
            message.downvotes_count = message.votes.filter(vote=-1).count()
            message.save()

        return Response({
            'id': vote.id,
            'vote': vote.vote,
            'current_rating': message.rating,
            'upvotes_count': message.upvotes_count,
            'downvotes_count': message.downvotes_count,
            'message_id': message.id
        }, status=status.HTTP_201_CREATED)
    
class TeamInvitationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):  # Изменяем team_id на pk
        try:
            team = Team.objects.get(id=pk)  # Используем pk вместо team_id
            if team.captain != request.user:
                return Response({"error": "Only team captain can send invitations"}, 
                              status=status.HTTP_403_FORBIDDEN)
                
            user_ids = request.data.get('user_ids', [])
            if not user_ids:
                return Response({"error": "No users specified"}, 
                              status=status.HTTP_400_BAD_REQUEST)
                
            invitations = []
            for user_id in user_ids:
                try:
                    user = CustomUser.objects.get(id=user_id)
                    
                    # Проверяем, не является ли пользователь уже членом команды
                    if TeamMember.objects.filter(team=team, user=user, is_active=True).exists():
                        continue
                        
                    # Создаем или обновляем приглашение
                    team_member, created = TeamMember.objects.get_or_create(
                        team=team,
                        user=user,
                        defaults={'role': 'MEMBER', 'is_active': False}
                    )
                    
                    # Создаем уведомление
                    notification = Notification.objects.create(
                        user=user,
                        notification_type='TEAM_INVITE',
                        message=f"You've been invited to join team {team.name}",
                        related_team=team
                    )
                    
                    invitations.append({
                        'user_id': user.id,
                        'username': user.username,
                        'invitation_id': team_member.id,
                        'notification_id': notification.id
                    })
                except CustomUser.DoesNotExist:
                    continue
                    
            return Response({"invitations": invitations}, 
                          status=status.HTTP_201_CREATED)
            
        except Team.DoesNotExist:
            return Response({"error": "Team not found"}, 
                          status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InvitationResponseView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, invitation_id):
        try:
            team_member = TeamMember.objects.get(id=invitation_id, user=request.user, is_active=False)
            response = request.data.get('response')
            
            if response == 'accept':
                team_member.is_active = True
                team_member.save()
                
                # Создаем уведомление для капитана
                Notification.objects.create(
                    user=team_member.team.captain,
                    notification_type='TEAM_JOIN',
                    message=f"{request.user.username} has accepted your invitation to join {team_member.team.name}",
                    related_team=team_member.team
                )
                
                return Response({"message": "Invitation accepted"}, status=200)
            elif response == 'reject':
                team_member.delete()
                return Response({"message": "Invitation rejected"}, status=200)
            else:
                return Response({"error": "Invalid response"}, status=400)
                
        except TeamMember.DoesNotExist:
            return Response({"error": "Invitation not found"}, status=404)


class NotificationViewList(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

