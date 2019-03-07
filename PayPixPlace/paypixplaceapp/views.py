from django.shortcuts import render

from .models import User

def home(request):
    context = {
        'users': User.objects.all()
    }
    return render(request, 'paypixplaceapp/home.html', context)

def createCanvas(request):
    return render(request, 'paypixplaceapp/create_canvas.html')


