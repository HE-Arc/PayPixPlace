from django.shortcuts import render

from .models import User

def home(request):
    context = {
        'users': User.objects.all()
    }
    return render(request, 'paypixplaceapp/home.html', context)

def createCanvas(request):
    context = {
        'title': 'Create Canvas'
    }
    return render(request, 'paypixplaceapp/create_canvas.html', context)

def publicCanvas(request):
    context = {
        'title': 'Public Canvas'
    }
    return render(request, 'paypixplaceapp/public_canvas.html', context)

def communityCanvas(request):
    context = {
        'title': 'Community Canvas'
    }
    return render(request, 'paypixplaceapp/community_canvas.html', context)

def privateCanvas(request):
    context = {
        'title': 'Private Canvas'
    }
    return render(request, 'paypixplaceapp/private_canvas.html', context)

def purchasePix(request):
    context = {
        'title': 'Purchase PIX'
    }
    return render(request, 'paypixplaceapp/purchase_pix.html', context)
