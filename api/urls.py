from django.urls import path
from . import views

urlpatterns = [
    path('question/list', views.QuestionViewList.as_view(), name="question-list"),
    path('question/delete/<int:pk>', views.QuestionDelete.as_view(), name="delete-question"),
    path('question/update/<int:pk>', views.QuestionUpdate.as_view(), name="update-question"),
    path('question/<int:pk>', views.QuestionView.as_view(), name="view-question"),
    path('pack/list', views.PackView.as_view(), name="pack-list"),
    path('pack/create/<int:pk>', views.PackCreate.as_view(), name="create-pack"),
    path('pack/delete/<int:pk>', views.PackDelete.as_view(), name="delete-pack"),
    path('pack/update/<int:pk>', views.PackUpdate.as_view(), name="update-pack"),
    path('pack/update/<int:pk>', views.PackUpdate.as_view(), name="update-pack"),
    path('pack/question/<int:pk>', views.AddQuestionToPack.as_view({'get' : 'list'}), name="add-q-to-pack"),
    
    
]