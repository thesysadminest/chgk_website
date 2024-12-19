from django.urls import path
from . import views

urlpatterns = [
    path('question/', views.QuestionListCreate.as_view(), name="question-list"),
    path('question/delete/<int:pk>', views.QuestionDelete.as_view(), name="delete-question"),
    path('pack/', views.PackListCreate.as_view(), name="pack-list"),
    path('pack/delete/<int:pk>', views.PackDelete.as_view(), name="delete-pack"),
]