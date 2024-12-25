from django.urls import path
from . import views

urlpatterns = [
    path('question/list', views.QuestionViewList.as_view(), name="question-list"),
    path('pack/create/<int:pk>', views.QuestionCreate.as_view(), name="create-question"),
    path('question/delete/<int:pk>', views.QuestionDelete.as_view(), name="delete-question"),
    path('question/update/<int:pk>', views.QuestionUpdate.as_view(), name="update-question"),
    path('question/<int:pk>', views.QuestionView.as_view(), name="view-question"),
    
    path('pack/list', views.PackViewList.as_view(), name="pack-list"),
    path('pack/create/<int:pk>', views.PackCreate.as_view(), name="create-pack"),
    path('pack/delete/<int:pk>', views.PackDelete.as_view(), name="delete-pack"),
    path('pack/update/<int:pk>', views.PackUpdate.as_view(), name="update-pack"),
    path('question/<int:pk>', views.PackView.as_view(), name="view-question"),
    
    path('pack/question/<int:pk>', views.AddQuestionToPack.as_view({'get' : 'list'}), name="add-q-to-pack"),
    
    path('team/<int:pk>', views.TeamView.as_view(), name="view-team"),
    path('team/list', views.TeamViewList.as_view(), name="team-list"),
    path('team/create/<int:pk>', views.TeamCreate.as_view(), name="team-pack"),
    path('team/update/<int:pk>', views.TeamDelete.as_view(), name="delete-team"),
    path('team/delete/<int:pk>', views.TeamDelete.as_view(), name="delete-team"),
    
    path('user/<int:pk>', views.UserView.as_view(), name="view-user"),
    path('user/list', views.UserViewList.as_view(), name="user-list"),
    path('user/delete/<int:pk>', views.UserDelete.as_view(), name="delete-user"),
    
    
]