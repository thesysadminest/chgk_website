#from django.contrib.auth.models import AbstractUser
from rest_framework import serializers
from .models import Question, Pack, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('user_id','username','email','password','date_created')
        extra_kwargs = {"password": {"write_only" : True}}


        def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            return user

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
        
