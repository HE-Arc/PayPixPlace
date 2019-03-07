from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.home, name='paypixplace-home'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('create_canvas/', views.createCanvas, name='paypixplace-createcanvas'),
]