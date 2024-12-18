from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Question, Pack

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password" : {"write_only" : True}}

        def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            return user

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'question_text', 'answer_text', 'author', 'date_created')
        extra_kwargs = {"author" : {"read_only" : True}}

class PackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pack
        fields = ('id', 'author', 'description')
        extra_kwargs = {"author" : {"read_only" : True}}
