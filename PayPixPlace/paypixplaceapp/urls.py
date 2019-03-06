from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='paypixplace-home'),
    path('create_canvas/', views.createCanvas, name='paypixplace-createcanvas'),
]