from django.contrib import admin
from django.urls import include, path
from api.views import RegisterView, MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    
    path('admin/', admin.site.urls),
    path("api/user/register/", RegisterView.as_view(), name="register"),
    
    path("api/token/", MyTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    
    path('api/', include('api.urls')),
]
