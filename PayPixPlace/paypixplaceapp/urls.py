from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.home, name='paypixplace-home'),
    path('create_canvas/', views.createCanvas, name='paypixplace-createcanvas'),
    path('canvas/public/', views.publicCanvas, name='paypixplace-publiccanvas'),
    path('canvas/community/', views.communityCanvas, name='paypixplace-communitycanvas'),
    path('canvas/private/', views.privateCanvas, name='paypixplace-privatecanvas'),
    path('purchase_pix/', views.purchasePix, name='paypixplace-purchasepix'),
]