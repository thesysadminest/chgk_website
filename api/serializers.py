from django.contrib.auth.models import AbstractUser
from rest_framework import serializers
from .models import Question, Pack, Team, CustomUser, GameAttempt

from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.validators import UniqueValidator
from django.core.validators import FileExtensionValidator

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'bio')
        extra_kwargs = {"password": {"write_only" : True}}
    
    def to_internal_value(self, data):
        cleaned_data = {}
        for key, value in data.items():
            if isinstance(value, bytes):
                cleaned_data[key] = value.decode('utf-8', errors='replace')
            else:
                cleaned_data[key] = value
        return super().to_internal_value(cleaned_data)
      

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ('id', 'name', 'team_score', 'pub_date_t', 'captain')
        extra_kwargs = {"captain": {"write_only" : True}}
        
class QuestionSerializer(serializers.ModelSerializer):
    author_q = serializers.StringRelatedField()  
    class Meta:
        model = Question
        fields = ('id', 'question_text', 'answer_text', 'question_note', 'author_q', 'pub_date_q')
        extra_kwargs = {"author_q" : {"read_only" : True}}
        depth = 1

class PackSerializer(serializers.ModelSerializer):
    author_p = serializers.StringRelatedField()   
    class Meta:
        
        model = Pack
        fields = ('id', 'name', 'questions', 'author_p', 'description', 'pub_date_p')
        extra_kwargs = {"author_p" : {"read_only" : True}}
        depth = 1
        
###

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        # ...

        return token

"""
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'bio')

    def create(self, validated_data):
      if CustomUser.objects.filter(username=validated_data['username']).exists():
          raise serializers.ValidationError("existing username")
      if CustomUser.objects.filter(email=validated_data['email']).exists():
          raise serializers.ValidationError("existing email")

      user = CustomUser.objects.create(
          username=validated_data['username'],
          email=validated_data['email'],
          bio=validated_data.get('bio', ''),
      )
      user.set_password(validated_data['password'])
      user.save()
      return user
"""

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'bio')

    def create(self, validated_data):
        validated_data['password'] = validated_data['password'].strip() 
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

        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User with this username does not exist.")

        if not user.check_password(password):
            raise serializers.ValidationError("Incorrect password.")

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),  
            'refresh_token': str(refresh.refresh_token),
            'access_token': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'bio': user.bio,
            }
        }

    

class GameAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameAttempt
        fields = ['id', 'user', 'pack', 'question', 'is_correct', 'timestamp', 'correct_answers']
        extra_kwargs = {
            'user': {'queryset': CustomUser.objects.all()},
            'pack': {'queryset': Pack.objects.all()},
            'question': {'queryset': Question.objects.all()},
        }
