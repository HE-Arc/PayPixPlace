from django.shortcuts import render, redirect
from django.views.generic import ListView, DetailView
from django.contrib import messages
from .models import User, Canvas, Pixel
from .forms import CreateCanvas
from datetime import datetime
from django.http import JsonResponse
from django.http.response import Http404
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist

def home(request):
    context = {
        'title': 'Home',
    }
    return render(request, 'paypixplaceapp/home.html', context)

class CanvasView(ListView):
    model = Canvas
    template_name = 'paypixplaceapp/canvas/community_canvas.html'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        # Add in a QuerySet of all the books
        context['title'] = 'Community Canvas'
        context['canvas'] = getCanvas()
        return context

class CanvasDetailsView(DetailView):
    model = Canvas
    template_name = 'paypixplaceapp/canvas/canvas_detail.html'

def getCanvas():
    canvas = Canvas.objects.all()
    for c in canvas:
        c.pixels = Pixel.objects.filter(canvas=c.id)
    return canvas

def createCanvas(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = CreateCanvas(request.POST)
        # check whether it's valid:
        if form.is_valid():
            canvas = form.save(commit=False)
            canvas.user = request.user

            # Check if the given place is a valid one
            if canvas.place >= 0 and canvas.place <= 2:
                canvas.save()

                instances = [create_pixel(x, y, "#FFFFFF", canvas.id) for x in range(canvas.width) for y in range(canvas.width)]
                Pixel.objects.bulk_create(instances)  

                messages.success(request, f'You create a new canvas successfully!')
                return redirect('canvas-community')
            else:
                messages.error(request, f'The place is invalid!')

    # if a GET (or any other method) we'll create a blank form
    else:
        form = CreateCanvas()

    context = {
        'title': 'Create Canvas',
        'form': form
    }

    return render(request, 'paypixplaceapp/canvas/create_canvas.html', context)

def publicCanvas(request):
    context = {
        'title': 'Public Canvas',
    }
    return render(request, 'paypixplaceapp/canvas/public_canvas.html', context)

def privateCanvas(request):
    context = {
        'title': 'Private Canvas'
    }
    return render(request, 'paypixplaceapp/canvas/private_canvas.html', context)

def purchasePix(request):
    context = {
        'title': 'Purchase PIX'
    }
    return render(request, 'paypixplaceapp/purchase_pix.html', context)        
      
def create_pixel(x, y, hex, canvas_id):
    p = Pixel()
    p.x = x
    p.y = y
    p.hex = hex
    p.canvas_id = canvas_id
    return p

def change_pixel_color(request):
    canvas_id = request.GET.get('canvas_id')
    x = request.GET.get('x')
    y = request.GET.get('y')
    hex = request.GET.get('hex')
    user = request.user

    current_date = datetime.now()

    modification_valid = False

    pixel = Pixel.objects.get(canvas=canvas_id, x=x, y=y)
    if can_modify_pixel(pixel, user):
        pixel.hex = hex
        pixel.user = user
        pixel.save()
        # user.ammo -= 1 TODO remove after enabling ammo recuperation
        # user.save()
        modification_valid = True

    # TODO send user confirmation
    data = {
        'is_valid': modification_valid,
    }
    return JsonResponse(data)

def can_modify_pixel(pixel, user):
    return (pixel.end_protection_date is None or current_date > pixel.end_protection_date) and (user.ammo > 0)

def get_json(request):
    id = request.GET.get('id')
    if not id:
        raise Http404()

    try:
        canvas = Canvas.objects.get(id=id)
    except ObjectDoesNotExist:
        raise Http404()

    pixels = canvas.pixel_set.all()
    pixels_obj = serializers.serialize('json', list(pixels), fields=('x','y', 'hex', 'user'))
    return JsonResponse(pixels_obj, safe=False)
