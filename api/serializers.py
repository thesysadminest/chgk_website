from django.contrib.auth.models import AbstractUser
from rest_framework import serializers
from .models import Question, Pack, Team, CustomUser, GameSession, ForumThread, ForumMessage, MessageVote, Invitation
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.validators import UniqueValidator
from django.core.validators import FileExtensionValidator

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'bio', 'date_joined', 'elo_rating')
        extra_kwargs = {"password": {"write_only": True}}
    
    def to_internal_value(self, data):
        cleaned_data = {}
        for key, value in data.items():
            if isinstance(value, bytes):
                cleaned_data[key] = value.decode('utf-8', errors='replace')
            else:
                cleaned_data[key] = value
        return super().to_internal_value(cleaned_data)


class TeamSerializer(serializers.ModelSerializer):
    captain_username = serializers.CharField(source='get_captain_username', read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    description = serializers.CharField()
    active_members = UserSerializer(many=True, read_only=True)
    pending_members = UserSerializer(many=True, read_only=True)
    members_count = serializers.SerializerMethodField()
    pending_members_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = (
            'id', 'name', 'description', 'team_score', 'captain', 'captain_username',
            'created_at', 'active_members', 'pending_members',
            'members_count', 'pending_members_count'
        )
        read_only_fields = (
            'id', 'created_at', 'captain', 'active_members',
            'pending_members', 'members_count', 'pending_members_count'
        )

    def get_members_count(self, obj):
        """Количество активных участников"""
        return obj.active_members.count()

    def get_pending_members_count(self, obj):
        """Количество ожидающих приглашений"""
        return obj.pending_members.count()

    def create(self, validated_data):
        """Создание команды с автоматическим назначением капитана"""
        user = self.context['request'].user
        team = Team.objects.create(**validated_data)
        
        # Добавляем создателя как активного участника и капитана
        team.active_members.add(user)
        team.captain = user
        team.save()
        
        return team

    def update(self, instance, validated_data):
        """Обновление команды с защитой от изменения капитана напрямую"""
        if 'captain' in validated_data:
            # Проверяем, что новый капитан есть в active_members
            new_captain = validated_data['captain']
            if not instance.active_members.filter(id=new_captain.id).exists():
                raise serializers.ValidationError(
                    "Капитаном может быть только активный участник команды"
                )
        return super().update(instance, validated_data)
    
    
class QuestionSerializer(serializers.ModelSerializer):
    author_q = UserSerializer(read_only=True)
    image_attached = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ('id', 'question_text', 'answer_text', 'question_note', 'image_attached', 'author_q', 'pub_date_q', 'difficulty')
        #extra_kwargs = {"author_q": {"read_only": True}}
        depth = 1
        
    def get_author_q(self, obj):
        return {
            'id': obj.author_q.id if obj.author_q else None,
            'username': obj.author_q.username if obj.author_q else 'Неизвестно'
        }
    
    def get_image_attached(self, obj):
        return bool(obj.image)
    
    def create(self, validated_data):
        questions = validated_data.pop('questions', [])
        question = Question.objects.create(**validated_data)
        question.questions.set(questions)
        return question

    def update(self, instance, validated_data):
        questions = validated_data.pop('questions', None)
        if questions is not None:
            instance.questions.set(questions)
        return super().update(instance, validated_data)

class PackSerializer(serializers.ModelSerializer):
    author_p = UserSerializer(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Pack
        fields = ('id', 'name', 'questions', 'author_p', 'description', 'pub_date_p')
        extra_kwargs = {"author_p": {"read_only": True}}
        depth = 1

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all())]
    )
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'confirm_password', 'bio')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')  # Удаляем confirm_password
        user = CustomUser.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            bio=validated_data.get('bio', ''),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            raise serializers.ValidationError({
                'error': 'Both username and password are required.'
            })

        user = CustomUser.objects.filter(username=username).first()
        
        if not user:
            raise serializers.ValidationError({
                'error': 'Invalid username or password.'
            })

        if not user.check_password(password):
            raise serializers.ValidationError({
                'error': 'Invalid username or password.'
            })

        refresh = RefreshToken.for_user(user)
        
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'bio': user.bio,
        }
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        return data

'''
class GameSessionSerializer(serializers.ModelSerializer):
    pack = PackSerializer(read_only=True)  
    current_question = serializers.SerializerMethodField()
    class Meta:
        model = GameSession
        fields = ['id', 'user', 'pack', 'question', 'timestamp', 'correct_answers']
        extra_kwargs = {
            'user': {'queryset': CustomUser.objects.all()},
            'pack': {'queryset': Pack.objects.all()},
            'question': {'queryset': Question.objects.all()},
        }
'''

class GameSessionSerializer(serializers.ModelSerializer):
    questions_count = serializers.SerializerMethodField()
    current_question = serializers.SerializerMethodField()

    class Meta:
        model = GameSession
        fields = ['id', 'user', 'pack', 'current_question_index', 
                 'current_question', 'is_completed', 'correct_answers',
                 'created_at', 'questions_count']

    def get_questions_count(self, obj):
        return obj.questions.count()

    def get_current_question(self, obj):
        question = obj.get_current_question()
        if question:
            return {
                "id": question.id,
                "question_text": question.question_text
            }
        return None
    

class ForumMessageSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField()
    replies = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = ForumMessage
        fields = [
            'id', 'content', 'created_at', 'author',
            'parent_message', 'replies', 'user_vote',
            'upvotes_count', 'downvotes_count'
        ]
        extra_kwargs = {
            'parent_message': {'required': False, 'allow_null': True}
        }
        depth = 1

    def validate(self, data):
        if len(data.get('content', '').strip()) < 1:
            raise serializers.ValidationError("Сообщение не может быть пустым")
        return data

    def get_replies(self, obj):
        replies = obj.replies.all().order_by('created_at')
        return ForumMessageSerializer(replies, many=True, context=self.context).data

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.get_user_vote(request.user)
        return None

#порядок не менять!
class ForumThreadSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    messages = ForumMessageSerializer(many=True, read_only=True)
    created_at = serializers.DateTimeField(read_only=True)  # Добавлено read_only
    updated_at = serializers.DateTimeField(read_only=True)  # Добавлено read_only
    message_count = serializers.SerializerMethodField() 
    
    class Meta:
        model = ForumThread
        fields = [
            'id', 'title', 'created_by', 'is_closed', 
            'messages', 'created_at', 'updated_at', 'message_count'
        ] 
        
    def get_message_count(self, obj):
        return obj.calculated_message_count if hasattr(obj, 'calculated_message_count') else obj.message_count
    
class MessageVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageVote
        fields = ['vote']  
        read_only_fields = ['user', 'message']

    def validate_vote(self, value):
        if value not in [-1, 1]: 
            raise serializers.ValidationError("Vote must be -1 or 1")
        return value
    

class InvitationSerializer(serializers.ModelSerializer):
    team = TeamSerializer() 
    
    class Meta:
        model = Invitation
        fields = ('id', 'user', 'message', 'created_at', 'team', 'status')
        read_only_fields = ('id', 'created_at', 'user', 'message')
