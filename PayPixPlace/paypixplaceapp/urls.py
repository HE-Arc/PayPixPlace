from django.urls import path, include
from .views import CanvasView, CanvasDetailsView
from . import views

urlpatterns = [
    path('', views.home, name='paypixplace-home'),
    path('create_canvas/', views.createCanvas, name='canvas-create'),
    path('canvas/public/', views.publicCanvas, name='canvas-public'),
    path('canvas/community/', CanvasView.as_view(), name='canvas-community'),
    path('canvas/private/', views.privateCanvas, name='canvas-private'),
    path('canvas/<int:pk>/', CanvasDetailsView.as_view(), name='canvas-detail'),
    path('purchase_pix/', views.purchasePix, name='purchasepix'),
]