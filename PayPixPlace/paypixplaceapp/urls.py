from django.urls import path, include
from .views import CanvasView, CanvasDetailsView
from . import views

urlpatterns = [
    path('', views.home, name='paypixplace-home'),
    path('canvas/create/', views.createCanvas, name='canvas-create'),
    path('canvas/public/', views.publicCanvas, name='canvas-public'),
    path('canvas/community/', CanvasView.as_view(), name='canvas-community'),
    path('canvas/private/', views.privateCanvas, name='canvas-private'),
    path('canvas/<int:pk>/', CanvasDetailsView.as_view(), name='canvas-detail'),
    path('canvas/<int:id>/json/', views.get_json, name='canvas-json'),
    path('canvas/<int:id>/img/', views.get_img, name='canvas-img'),
    path('purchase_pix/', views.purchasePix, name='purchasepix'),
    path('change_pixel_color/', views.change_pixel_color, name='change-pixel-color'),
]