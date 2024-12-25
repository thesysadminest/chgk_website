from django.contrib.auth.models import AbstractUser
from rest_framework import serializers
from .models import Question, Pack, CustomUser

from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator
from django.core.validators import FileExtensionValidator

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'bio')

    def to_internal_value(self, data):
        cleaned_data = {}
        for key, value in data.items():
            if isinstance(value, bytes):
                cleaned_data[key] = value.decode('utf-8', errors='replace')
            else:
                cleaned_data[key] = value
        return super().to_internal_value(cleaned_data)

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'question_text', 'answer_text', 'author')
        extra_kwargs = {"author" : {"read_only" : True}}

class PackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pack
        fields = ('id', 'name', 'questions', 'author', 'description')
        
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
    password = serializers.CharField(
        write_only=True, required=True)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all())]
    )
    
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'bio')

    def create(self, validated_data):
        user = CustomUser.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            bio=validated_data['bio'],
    )
        user.set_password(validated_data['password'])
        user.save()
        
        return user
