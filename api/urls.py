from django.urls import path
from . import views

urlpatterns = [
   
    path('question/list/', views.QuestionViewList.as_view(), name="question-list"),
    path('question/<int:pk>/', views.QuestionView.as_view(), name="view-question"),
    path('question/create/', views.QuestionCreate.as_view(), name="create-question"),
    path('question/delete/<int:pk>/', views.QuestionDelete.as_view(), name="delete-question"),
    path('question/update/<int:pk>/', views.QuestionUpdate.as_view(), name="update-question"),
    path('question/list/<int:pk>/', views.QuestionViewListAuthor.as_view(), name="question-list-author"),
    

    path('pack/list/', views.PackViewList.as_view(), name="pack-list"),
    path('pack/<int:pk>/', views.PackView.as_view(), name="view-pack"),
    path('pack/create/', views.PackCreate.as_view(), name="create-pack"),
    path('pack/delete/<int:pk>/', views.PackDelete.as_view(), name="delete-pack"),
    path('pack/update/<int:pk>/', views.PackUpdate.as_view(), name="update-pack"),
    path('pack/question/<int:pk>/', views.AddQuestionToPack.as_view({'post': 'update'}), name="add-q-to-pack"),
    path('pack/list/<int:pk>/', views.PackViewListAuthor.as_view(), name="pack-list-author"),
    

    path('team/<int:pk>/', views.TeamView.as_view(), name="view-team"),
    path('team/list/', views.TeamViewList.as_view(), name="team-list"),
    path('team/create/', views.TeamCreate.as_view(), name="create-team"),
    path('team/update/<int:pk>/', views.TeamUpdate.as_view(), name="update-team"),
    path('team/delete/<int:pk>/', views.TeamDelete.as_view(), name="delete-team"),
    path('team/<int:pk>/invite/', views.InvitationView.as_view(), name='team-invite'),
    path('team/<int:pk>/leave/', views.TeamLeave.as_view(), name='team-leave'),
    
    path('user/<int:pk>/', views.UserView.as_view(), name="view-user"),
    path('user/list/', views.UserViewList.as_view(), name="user-list"),
    path('user/update/<int:pk>/', views.UserUpdate.as_view(),name="update-profile"),
    path('user/delete/<int:pk>/', views.UserDelete.as_view(), name="delete-user"),
    path('user/me/', views.CurrentUserView.as_view(), name='current-user'),
    path('user/<int:pk>/invitations/', views.InvitationViewList.as_view(), name='invitation-list'),
    path('user/<int:pk>/invitations/<int:invitation_id>/respond/', views.InvitationResponseView.as_view(), name='invitation-respond'),
    path('user/rating-history/', views.UserRatingHistoryView.as_view(), name='rating-history'),
    
    path('game/<int:pack_id>/start/', views.GameStartView.as_view(), name='start-game'),
    path('game/<int:pack_id>/questions/', views.PackQuestionViewList.as_view(), name='pack-questions'),
    
    path('game/<int:pack_id>/questions/<int:question_id>/', views.PackQuestionView.as_view(), name='question-detail'),
    path('game/<int:pack_id>/questions/<int:question_id>/next/', views.NextQuestionView.as_view(), name='next-question'),
    path('game/<int:pack_id>/questions/<int:question_id>/submit/', views.SubmitAnswerView.as_view(), name='submit-answer'),
    path('game/<int:pack_id>/results/', views.GameResultsView.as_view(), name='game-results'),

    path('threads/', views.ThreadViewList.as_view(), name='thread-list'),
    path('threads/<int:pk>/messages/', views.ThreadMessagesViewList.as_view(), name='thread-detail'),
    path('threads/<int:thread_id>/messages/create/', views.MessageCreateView.as_view(), name='message-create'),
    path('messages/<int:message_id>/vote/', views.MessageVoteView.as_view(), name='message-vote'),
    
]