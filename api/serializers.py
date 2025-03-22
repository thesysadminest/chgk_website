from django.contrib.auth.models import AbstractUser
from rest_framework import serializers
from .models import Question, Pack, Team, CustomUser

from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
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
        fields = ('id', 'name', 'team_score', 'pub_date_t')
        extra_kwargs = {"captain": {"write_only" : True}}
        
class QuestionSerializer(serializers.ModelSerializer):
    author_q = serializers.StringRelatedField()  
    class Meta:
        model = Question
        fields = ('id', 'question_text', 'answer_text', 'author_q', 'pub_date_q')
        extra_kwargs = {"author" : {"read_only" : True}}

class PackSerializer(serializers.ModelSerializer):
    author_p = serializers.StringRelatedField()   
    class Meta:
        
        model = Pack
        fields = ('id', 'name', 'questions', 'author_p', 'description', 'pub_date_p')
        extra_kwargs = {"author" : {"read_only" : True}}
        
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

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'bio')

    def create(self, validated_data):
        try:
            user = CustomUser.objects.create(
                username=validated_data['username'],
                email=validated_data['email'],
                bio=validated_data.get('bio', ''),
            )
            user.set_password(validated_data['password'])
            user.save()
            return user
        except Exception as e:
            raise serializers.ValidationError(str(e))


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)