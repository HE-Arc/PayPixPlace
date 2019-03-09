from django.shortcuts import render
from django.http import HttpResponse
from django.http import HttpResponseRedirect

from .models import Canvas, Pixel

from .forms import CreateCanvas

def home(request):
    return HttpResponse('<h1>PayPixPlay Home</h1>')

def createCanvas(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = CreateCanvas(request.POST)
        # check whether it's valid:
        if form.is_valid():
            # process the data in form.cleaned_data as required
            # ...
            # redirect to a new URL:
            create_canvas_in_db(request)
            return HttpResponseRedirect('/')

    # if a GET (or any other method) we'll create a blank form
    else:
        form = CreateCanvas()

    return render(request, 'create_canvas.html', {'form': form})

def create_canvas_in_db(request):

    width = 10
    height = 10

    newCanvas = Canvas()
    newCanvas.name = request.POST['canvas_name']
    # TODO change the default parameters when the form will be completed
    newCanvas.theme = ""
    newCanvas.place = 0
    newCanvas.width = width
    newCanvas.height = height
    newCanvas.is_profit_on = False
    newCanvas.save()

    canvas_id = Canvas.objects.latest('id').id

    instances = [create_pixel(x, y, "#FFFFFF", canvas_id) for x in range(width) for y in range(height)]
    Pixel.objects.bulk_create(instances)            
            

def create_pixel(x, y, hex, canvas_id):
    p = Pixel()
    p.x = x
    p.y = y
    p.hex = hex
    p.canvas_id = canvas_id
    return p


