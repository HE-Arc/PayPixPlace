from django.shortcuts import render

posts = [
    {
        'user': 'SpicyPaper',
        'pix_number': '3500'
    },
    {
        'user': 'Kurokabe',
        'pix_number': '200'
    },
    {
        'user': 'Lorkii',
        'pix_number': '1080'
    }
]

def home(request):
    context = {
        'posts': posts
    }
    return render(request, 'paypixplaceapp/home.html', context)

def createCanvas(request):
    return render(request, 'paypixplaceapp/create_canvas.html')