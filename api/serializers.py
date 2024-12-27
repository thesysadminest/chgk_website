from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Question, Pack, Team

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username','password')
        extra_kwargs = {"password": {"write_only" : True}}


        def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            return user

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ('id', 'name', 'team_score', 'pub_date_t')

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
        
