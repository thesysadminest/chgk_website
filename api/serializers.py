#from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Question, Pack, User, Team

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password" : {"write_only" : True}}

        def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password", "team", "score"]
        extra_kwargs = {"password" : {"write_only" : True}}

        def create(self, validated_data):
            user = User.objects.create_user(**validated_data)
            return user
        
class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ('id', 'name', 'score')
        extra_kwargs = {"author" : {"read_only" : True}}

class PackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pack
        fields = ('id', 'name', 'questions', 'author', 'description')
        extra_kwargs = {"author" : {"read_only" : True}}
