from django.urls import path, include
from .views import CommunityCanvasView, OfficialCanvasView, CanvasDetailsView
from . import views

urlpatterns = [
    path('', views.home, name='paypixplace-home'),
    path('canvas/create/', views.createCanvas, name='canvas-create'),
    path('canvas/official/', OfficialCanvasView.as_view(), name='canvas-official'),
    path('canvas/community/', CommunityCanvasView.as_view(), name='canvas-community'),
    path('canvas/user/', views.userCanvas, name='canvas-user'),
    path('canvas/<int:pk>/', CanvasDetailsView.as_view(), name='canvas-detail'),
    path('canvas/<int:id>/json/', views.get_json, name='canvas-json'),
    path('canvas/<int:id>/img/', views.get_img, name='canvas-img'),
    path('change_pixel_color/', views.change_pixel_color, name='change-pixel-color'),
    path('change_user_slot_color/', views.change_user_slot_color, name='change_user_slot_color'),
    path('pix/purchase/', views.purchase, name='pix-purchase'),
    path('pix/purchase/<int:id>/', views.payment, name='pix-payment'),
    path('buy/<int:id>', views.buy_with_pix, name='buy-element'),
    path('ammo/', views.get_user_ammo, name='ammo'),
    path('cursor/<str:hex>/', views.get_cursor, name='cursor'),
    path('lock_pixel/', views.lock_pixel, name='lock-pixel'),
    path('prices/', views.get_pix_prices_json, name='prices'),
    path('colors/', views.get_colors_json, name='colors'),
]