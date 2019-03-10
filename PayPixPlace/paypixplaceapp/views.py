from django.shortcuts import render, redirect
from django.views.generic import ListView, DetailView
from .models import User, Canvas, Pixel
from .forms import CreateCanvas

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
            # process the data in form.cleaned_data as required
            # ...
            # redirect to a new URL:
            create_canvas_in_db(request)
            return redirect('paypixplace-communitycanvas')

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