from rest_framework import generics, viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, APIView, action, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import exception_handler

import random
import os
import mimetypes
from PIL import Image
from io import BytesIO

from django.db import transaction
from django.db.models import Sum, Count, Max

from django.http import FileResponse
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from django.utils import timezone

from .serializers import ( 
    QuestionSerializer, PackSerializer, 
    UserSerializer, TeamSerializer, 
    MyTokenObtainPairSerializer, 
    RegisterSerializer, LoginSerializer,
    GameSessionSerializer,
    ForumThreadSerializer, ForumMessageSerializer, 
    MessageVoteSerializer,
    InvitationSerializer,
    UserRatingHistorySerializer
)

from django.contrib.auth.models import AbstractUser
from .models import Question, Pack, Team, CustomUser, GameSession, ForumThread, ForumMessage, MessageVote, Invitation, UserRatingHistory

import uuid

###     QUESTION      ###

class QuestionViewList(generics.ListCreateAPIView):
    
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
      queryset = Question.objects.all()
      return queryset

class QuestionViewListAuthor(generics.ListCreateAPIView):
    
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
      queryset = Question.objects.all()
      author_id = self.kwargs.get('pk')
      if author_id:
        queryset = queryset.filter(author_q__id=author_id)
      return queryset
     

class QuestionView(generics.RetrieveAPIView):
    queryset = Question.objects.all()  
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if request.query_params.get('image') == 'true':
            return self._return_image(instance)
        
        return self.retrieve(request, *args, **kwargs)

    def _return_image(self, instance):
        if not instance.image:
            return Response(
                {'error': 'This question has no image!'},
                status=404
            )
        
        try:
            image_file = instance.image.open('rb')
            content_type = mimetypes.guess_type(instance.image.name)[0] or 'application/octet-stream'
            
            return FileResponse(
                image_file,
                content_type=content_type,
                as_attachment=False
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=500
            )
   
    
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

    '''def delete(self, request, pk=None):
        if request.query_params.get('image') == 'true':
            instance = self.get_object()
            instance.delete_image()
        return Response({"message" : "Image removed successfully!"}, status=204)'''

class QuestionUpdate(generics.UpdateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, pk=None):
        if request.query_params.get('image') == 'true':
            return self.update_image(request, pk)
        
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if (serializer.is_valid()):
            serializer.save()
            return Response({"message" : "Data updated successfully!"})
        else:
            return Response({"message" : "Data update failed."})
        
    def update_image(self, request, pk=None):
        instance = self.get_object()
        if 'image' not in request.FILES:
            return Response(
                {'error': 'No image provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        try:
            # Валидация размера (макс 5MB)
            if image_file.size > 5 * 1024 * 1024:
                raise ValidationError("Максимальный размер файла - 5MB")
            
            # Валидация типа файла
            valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
            ext = os.path.splitext(image_file.name)[1].lower()
            if ext not in valid_extensions:
                raise ValidationError("Неподдерживаемый формат изображения")
            
            # Оптимизация изображения (если JPEG)
            if ext in ['.jpg', '.jpeg']:
                img = Image.open(image_file)
                output = BytesIO()
                img.save(output, format='JPEG', quality=85, optimize=True)
                output.seek(0)
                image_file.file = output
                image_file.size = output.getbuffer().nbytes
            
            instance.image = image_file
            instance.save()
            
            return Response({
                'status': 'Изображение обновлено',
            }, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Ошибка обработки изображения: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
    
class PackViewListAuthor(generics.ListCreateAPIView):
    serializer_class = PackSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
      queryset = Pack.objects.all()
      author_id = self.kwargs.get('pk')
      if author_id:
        queryset = queryset.filter(author_p__id=author_id)
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
 
    
class TeamLeave(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            with transaction.atomic():
                team = Team.objects.get(id=pk)
                
                if not team.active_members.filter(id=request.user.id).exists():
                    return Response(
                        {"error": "User is not a member of this team"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                team.active_members.remove(request.user)
                
                if team.pending_members.filter(id=request.user.id).exists():
                    team.pending_members.remove(request.user)
                
                Invitation.objects.filter(
                    user=request.user,
                    team=team,
                    status='pending'
                ).update(status='canceled')
                
                return Response(
                    {"message": "Successfully left the team"},
                    status=status.HTTP_200_OK
                )
                
        except Team.DoesNotExist:
            return Response(
                {"error": "Team not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TeamUpdate(generics.UpdateAPIView):
    serializer_class = TeamSerializer
    queryset = Team.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def update_team(self, request):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if (serializer.is_valid()):
          serializer.save()
          return Response({"message": "team updated successfully"})
        else:
          return  Response({"message": "update failed"})

class InvitationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            team = Team.objects.get(id=pk)
            
            if team.captain != request.user:
                return Response(
                    {"error": "Only team captain can send invitations"}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            user_ids = request.data.get('user_ids', [])
            if not user_ids:
                return Response(
                    {"error": "No users specified"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            users = CustomUser.objects.filter(id__in=user_ids)
            existing_user_ids = set(users.values_list('id', flat=True))
            
            invalid_ids = set(user_ids) - existing_user_ids
            if invalid_ids:
                return Response(
                    {"error": f"Invalid user IDs: {invalid_ids}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            valid_users = []
            errors = []
            
            for user in users:
                if team.active_members.filter(id=user.id).exists():
                    errors.append(f"User {user.username} is already a team member")
                elif team.pending_members.filter(id=user.id).exists():
                    errors.append(f"Invitation already sent to {user.username}")
                elif Invitation.objects.filter(user=user, team=team, status='pending').exists():
                    errors.append(f"Pending invitation already exists for {user.username}")
                else:
                    valid_users.append(user)
            
            if errors and not valid_users:
                return Response(
                    {"errors": errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            team.pending_members.add(*valid_users)
            
            invitations = []
            for user in valid_users:
                invitations.append(
                    Invitation(
                        user=user,
                        team=team,
                        status='pending'
                    )
                )
            
            Invitation.objects.bulk_create(invitations)
            
            response_data = {
                "message": f"Invitations created for {len(valid_users)} users",
                "invited_count": len(valid_users),
            }
            
            if errors:
                response_data["errors"] = errors
                response_data["partial_success"] = True
            
            return Response(
                response_data,
                status=status.HTTP_201_CREATED
            )
            
        except Team.DoesNotExist:
            return Response(
                {"error": "Team not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class InvitationResponseView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk, invitation_id):  # Изменено здесь
        try:
            if request.user.id != pk:
                return Response(
                    {"error": "You can only respond to your own invitations"},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            invitation = Invitation.objects.get(
                id=invitation_id,
                user=request.user,
                status='pending'
            )
            
            team = invitation.team
            response = request.data.get('response')
            
            if response == 'accept':
                if team.pending_members.filter(id=request.user.id).exists():
                    team.pending_members.remove(request.user)
                    team.active_members.add(request.user)
                
                invitation.status = 'accepted'
                invitation.save()
                
                return Response(
                    {"message": "Invitation accepted"}, 
                    status=status.HTTP_200_OK
                )
                
            elif response == 'reject':
                if team.pending_members.filter(id=request.user.id).exists():
                    team.pending_members.remove(request.user)
                
                invitation.status = 'rejected'
                invitation.save()
                
                return Response(
                    {"message": "Invitation rejected"}, 
                    status=status.HTTP_200_OK
                )
                
            else:
                return Response(
                    {"error": "Invalid response. Use 'accept' or 'reject'"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Invitation.DoesNotExist:
            return Response(
                {"error": "Invitation not found or already processed"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class InvitationViewList(generics.ListAPIView):
    serializer_class = InvitationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Invitation.objects.filter(
            user=self.request.user,
        ).order_by('-created_at')
    

###     USER      ###


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def handle_exception(self, exc):
        # Переопределяем обработку исключений для возврата JSON
        response = exception_handler(exc, self.request)
        
        if response is not None:
            return response
            
        # Для всех остальных исключений возвращаем JSON
        return Response(
            {'error': str(exc)},
            status=status.HTTP_400_BAD_REQUEST
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
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
            
        except Exception as e:
            # Логируем ошибку для отладки
            print(f"Registration error: {str(e)}")
            return self.handle_exception(e)

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

      @action(detail=True, methods=['GET'])
      def user_resources(self, request, pk=None):
        user = self.get_object()
        
        user_questions = Question.objects.filter(author_q=user)
        questions_serializer = QuestionSerializer(user_questions, many=True)
        
        user_packs = Pack.objects.filter(author_p=user)
        packs_serializer = PackSerializer(user_packs, many=True)
        
        user_teams = Team.objects.filter(active_members.contains(user))
        teams_serializer = TeamSerializer(user_teams, many=True)
        
        user_invitations = Invitation.objects.filter(user=user, status='pending')
        invitations_serializer = InvitationSerializer(user_invitations, many=True)
        
        return Response({
            'questions': questions_serializer.data,
            'packs': packs_serializer.data,
            'teams': teams_serializer.data,
            'pending_invitations': invitations_serializer.data
        })
    
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
                    "question_text": question.question_text,
                    "image_attached": bool(question.image)
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
        
        # Получаем последнюю завершенную сессию
        session = GameSession.objects.filter(
            user=request.user,
            pack=pack,
            is_completed=True
        ).order_by('-created_at').first()
        
        if not session:
            return Response({
                "correct_answers": 0,
                "total_questions": pack.questions.count(),
                "previous_rating": request.user.elo_rating,
                "current_rating": request.user.elo_rating,
                "rating_change": 0,
                "pack": {
                    "id": pack.id,
                    "name": pack.name
                }
            })
        
        # Вычисляем изменение рейтинга
        rating_change = 0
        questions = session.questions.all().order_by('id')
        
        for i in range(session.current_question_index + 1):
            question = questions[i]
            is_correct = i < session.correct_answers
            question_diff = question.difficulty * 10
            rating_change += question_diff if is_correct else -question_diff
        
        previous_rating = request.user.elo_rating - rating_change
        
        return Response({
            "correct_answers": session.correct_answers,
            "total_questions": session.questions.count(),
            "previous_rating": max(500, previous_rating),
            "current_rating": request.user.elo_rating,
            "rating_change": rating_change,
            "pack": {
                "id": pack.id,
                "name": pack.name
            }
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
        
        queryset = queryset.order_by('-updated_at')
        
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
        thread = get_object_or_404(ForumThread, pk=self.kwargs['pk'])
        
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


###     РЕЙТИНГ     ###


class UserRatingHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        three_days_ago = timezone.now() - timezone.timedelta(days=30)
        history = UserRatingHistory.objects.filter(
            user=request.user,
            date__gte=three_days_ago
        ).order_by('date')
        serializer = UserRatingHistorySerializer(history, many=True)
        return Response(serializer.data)
