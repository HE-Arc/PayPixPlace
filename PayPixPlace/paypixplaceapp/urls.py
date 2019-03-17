from django.urls import path, include
from .views import CanvasView, CanvasDetailsView
from . import views

urlpatterns = [
    path('', views.home, name='paypixplace-home'),
    path('canvas/create/', views.createCanvas, name='canvas-create'),
    path('canvas/public/', views.publicCanvas, name='canvas-public'),
    path('canvas/community/', CanvasView.as_view(), name='canvas-community'),
    path('canvas/<int:pk>/', CanvasDetailsView.as_view(), name='canvas-detail'),
    path('canvas/<int:id>/json/', views.get_json, name='canvas-json'),
    path('canvas/<int:id>/img/', views.get_img, name='canvas-img'),
    path('change_pixel_color/', views.change_pixel_color, name='change-pixel-color'),
    path('change_user_slot_color/', views.change_user_slot_color, name='change_user_slot_color'),
    path('pix/purchase/', views.purchasePix, name='pix-purchase'),
    path('pix/purchase/buy200', views.buy200, name='pix-purchase-200'),
    path('pix/purchase/buy400', views.buy400, name='pix-purchase-400'),
    path('pix/purchase/buy1100', views.buy1100, name='pix-purchase-1100'),
    path('pix/purchase/buy6000', views.buy6000, name='pix-purchase-6000'),
    path('pix/add/<int:id>/', views.addPix, name='pix-add'),
]