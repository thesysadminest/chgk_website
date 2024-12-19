
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('', include('front_end.urls')),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls'))
    
]
