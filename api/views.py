from django.shortcuts import render
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action, APIView

from .serializers import QuestionSerializer, PackSerializer, UserSerializer
from .models import Question, Pack


class QuestionViewList(generics.ListCreateAPIView):
    
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      queryset = Question.objects.all()
      return queryset

    def try_create(self, serializer):
      if serializer.is_valid():
        serializer.save(author=self.request.user)
      else:
        print(serializer.errors)

class QuestionView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
      queryset = Question.objects.all().filter(id=self.kwargs['pk'])
      return queryset

class QuestionDelete(generics.DestroyAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        return Question.objects.filter(author=user)

class QuestionUpdate(generics.UpdateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]

    def update_text(self, request):

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if (serializer.is_valid()):
            serializer.save()
            return Response({"message" : "Data updated successfully!"})
        else:
            return Response({"message" : "Data update failed."})


class PackCreate(generics.ListCreateAPIView):
    serializer_class = PackSerializer
    permission_classes = [AllowAny]
    
    def try_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class PackDelete(generics.DestroyAPIView):  
    serializer_class = PackSerializer  
    permission_classes = [AllowAny]

class PackUpdate(generics.UpdateAPIView):
    serializer_class = PackSerializer
    queryset = Pack.objects.all()
    permission_classes = [AllowAny]
    
    def update_pack(self, request):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if (serializer.is_valid()):
          serializer.save()
          return Response({"message": "pack updated successfully"})
        else:
          return  Response({"message": "update failed"})
 
class PackView(generics.ListAPIView):
    query_set = Pack.objects.all()
    serializer_class = Pack
    permission_classes = [AllowAny]
    
class AddQuestionToPack(viewsets.ModelViewSet):
  query_set = Pack.objects.all()
  serializer_class = PackSerializer
  permission_classes = [AllowAny]
  
  @action(detail=True,
            methods=['POST'])
  def update(self, request):
      q = get_object_or_404(klass=Question, question=kwargs.get('question'))
      pack = self.get_object()
      pack.questions.add(q)
      return Response({"message": "question added successfully"})
  

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    

'''
class LoginAPIView(generics.GenericAPIView):
    permission_classes = ()
    authentication_classes = ()
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
      '''  
      
class UserRegister(APIView):
    def post(self, request):
        user = request.data
        serializer = UserSerializer(data=user, context = {'request':request})
        if serializer.is_valid():
            user_saved = serializer.save(password=make_password(user['password']))
            return Response(user_saved,
                status=200)
        return Response({
            "error" : "Error encountered"},
            status=406)