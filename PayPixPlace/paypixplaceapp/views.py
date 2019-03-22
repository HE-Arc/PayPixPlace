from datetime import datetime
from enum import IntEnum

from django.contrib import messages
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.forms import model_to_dict
from django.http import HttpResponse, JsonResponse
from django.http.response import Http404
from django.shortcuts import redirect, render
from django.views.generic import DetailView, ListView
from django.core.paginator import Paginator
from django.db.models import Prefetch
from django.template.defaulttags import register
from PIL import Image, ImageDraw

from .forms import CreateCanvas
from .models import Canvas, Pixel, Pixie, User, Slot, Color, PixPrice, Colors_pack, Purchase

from datetime import datetime
import stripe 
import random

stripe.api_key = "sk_test_4eC39HqLyjWDarjtT1zdp7dc"

@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)

@register.filter
def get_enum_value(value):
    return int(value)

class Place(IntEnum):
    OFFICIAL = 0
    COMMUNITY = 1

class PixPriceNumType(IntEnum):
    FIX_COLOR = 0
    COLOR_PACK = 1
    RANDOM_COLOR = 2
    UNLOCK_SLOT = 3
    CANVAS_COLOR_PACK = 4

def get_pix_price():
    pix_prices = PixPrice.objects.all()
    prices = {}
    for price in pix_prices:
        prices[price.num_type] = price
    return prices


def home(request):
    context = {
        'title': 'Home',
        'prices': get_pix_price,
        'colors_pack': Colors_pack.objects.all()

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
        context['canvas'] = getCanvas(self.request.GET.get('page'), Place.COMMUNITY)
        return context

class CanvasDetailsView(DetailView):
    model = Canvas
    template_name = 'paypixplaceapp/canvas/canvas_detail.html'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        # Add in a QuerySet of all the books
        context['slots'] = Slot.objects.filter(user=self.request.user.id)

        place_text = "Invalid"
        if self.object.place == 0:
            place_text = "Official"
        elif self.object.place == 1:
            place_text = "Community"

        context['place_text'] = place_text
        return context

def getCanvas(page, place):
    canvas_list = Canvas.objects.filter(place=int(place))
    paginator = Paginator(canvas_list, 6)
    canvas = paginator.get_page(page)
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
            if canvas.place >= 0 and canvas.place <= 1:
                canvas.save()

                instances = [create_pixel(x, y, "#FFFFFF", canvas.id) for x in range(canvas.width) for y in range(canvas.width)]
                Pixel.objects.bulk_create(instances)  

                messages.success(request, f'You create a new canvas successfully!')

                if canvas.place == int(Place.COMMUNITY):
                    return redirect('canvas-community')
                else:
                    return redirect('canvas-official')
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

def officialCanvas(request):
    context = {
        'title': 'Official Canvas',
        'canvas': getCanvas(request.GET.get('page'), Place.OFFICIAL)
    }
    return render(request, 'paypixplaceapp/canvas/official_canvas.html', context)

def userCanvas(request):
    canvas_list = Canvas.objects.filter(user=request.user)
    paginator = Paginator(canvas_list, 6)
    canvas = paginator.get_page(request.GET.get('page'))

    context = {
        'title': 'User\'s Canvas',
        'canvas': canvas
    }
    return render(request, 'paypixplaceapp/canvas/user_canvas.html', context)

def get_pixies_info():
    pixies = Pixie.objects.all()
    return pixies

def purchase(request):
    context = {
        'title': 'Purchase PIX',
        'pixies': get_pixies_info()
    }
    return render(request, 'paypixplaceapp/purchase_pix.html', context)
      
def create_pixel(x, y, hex, canvas_id):
    p = Pixel()
    p.x = x
    p.y = y
    p.hex = hex
    p.canvas_id = canvas_id
    return p

def change_user_slot_color(request):
    if request.is_ajax():
        if request.method == 'POST':

            user = User.objects.get(id=request.POST.get('userId'))
            slotId = request.POST.get('slot')
            color = Color.objects.get(hex=request.POST.get('color'))

            slot = Slot.objects.filter(
                user=user,
                place_num=slotId
            ).first()
            
            if(slot == None):
                slot = Slot()
                slot.user = user
                slot.place_num = slotId
                
            slot.color = color
            slot.save()
            
            return JsonResponse({
                'is_valid': True,
            })

def change_pixel_color(request):
    canvas_id = request.POST['canvas_id']
    x = request.POST['x']
    y = request.POST['y']
    hex = request.POST['hex']
    user = request.user

    current_date = datetime.now()

    modification_valid = False

    pixel = Pixel.objects.get(canvas=canvas_id, x=x, y=y)
    if can_modify_pixel(pixel, user, current_date):
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

def can_modify_pixel(pixel, user, current_date):
    return (pixel.end_protection_date is None or current_date > pixel.end_protection_date) and (user.ammo > 0)

def get_json(request, id):
    """returns the canvas and all its pixels by its id in a json format"""
    if not id:
        raise Http404()

    try:
        canvas = Canvas.objects.get(id=id)
    except ObjectDoesNotExist:
        raise Http404()
    
    pixels = list(Pixel.objects.filter(canvas=id).values('x', 'y', 'hex', 'user__username'))
    pixels2Darray = [list(range(canvas.width)) for p in pixels if p["x"] == 0]
    for pixel in pixels:
        pixels2Darray[pixel["x"]][pixel["y"]] = {
            "hex" : pixel["hex"],
            "username" : pixel["user__username"] 
        }
    data = {
        'canvas': model_to_dict(canvas),
        'pixels': pixels2Darray
    }
    return JsonResponse(data, safe=False)

def get_img(request, id):
    """returns the canvas by its id, as an PNG img"""
    if not id:
        raise Http404()

    try:
        canvas = Canvas.objects.get(id=id)
    except ObjectDoesNotExist:
        raise Http404()

    pixels = [model_to_dict(pixel) for pixel in canvas.pixel_set.all()]
    imgSize = 1000
    img = Image.new('RGB', (imgSize, imgSize))
    pixelSize = imgSize // model_to_dict(canvas)["width"]

    draw = ImageDraw.Draw(img)
    for pixel in pixels:
        draw.rectangle(
            (
                pixel["x"] * pixelSize,
                pixel["y"] * pixelSize,
                pixel["x"] * pixelSize + pixelSize,
                pixel["y"] * pixelSize + pixelSize
            ), fill=pixel["hex"]
        )
    del draw

    response = HttpResponse(content_type="image/png")
    img.save(response, "PNG")
    return response

def buy(request, id):
    pixie = Pixie.objects.filter(id=id).first()
    token = request.POST['stripeToken']
    price = pixie.price * 100
    totalPix = pixie.number + pixie.bonus

    charge = stripe.Charge.create(
        amount=price,
        currency='chf',
        description='Buying ' + str(totalPix) + ' PIX',
        source=token,
    )

    request.user.pix += totalPix
    request.user.save()

    purchase = Purchase(pixie=pixie, user=request.user, purchase_date=datetime.now())
    purchase.save()
    
    messages.success(request, f'You received {totalPix} PIX. Thank you for you purchase!')

def payment(request, id):
    buy(request, id)
    return JsonResponse("OK", safe=False)

def user_has_enough_pix(user, price):
    return user.pix >= price

def add_color_to_user(hex, user):
    try:
        color = Color.objects.get(hex=hex)
        user.owns.add(color)
    except Color.DoesNotExist:
        user.owns.create(hex=hex)   

def buy_fix_color(hex, user):
    result_message = ""
    transaction_success = False
    
    try:
        color = user.owns.all().get(hex=hex)
        # The user already owns the color
        result_message = "You already own this color!"
    except Color.DoesNotExist:
        # The user does not own the color
        add_color_to_user(hex, user)
        result_message = "Color successfuly added!"
        transaction_success = True

    return transaction_success, result_message

def buy_random_color(user):
    result_message = ""
    transaction_success = False
    
    while not transaction_success:
        r = lambda: random.randint(0,255)
        hex = ('#%02X%02X%02X' % (r(),r(),r()))
    
        try:
            color = user.owns.all().get(hex=hex)
            # The user already owns the color
            result_message = "You already own this color!"
        except Color.DoesNotExist:
            add_color_to_user(hex, user)
            result_message = "Color successfuly added! (" + hex + ")"
            transaction_success = True

    return transaction_success, result_message

def buy_color_pack(color_pack, user):
    result_message = ""
    transaction_success = False

    for color in color_pack.contains.all():
        add_color_to_user(color.hex, user)
    
    result_message = "Colors successfuly added!"
    transaction_success = True

    return transaction_success, result_message

def buy_with_pix(request, id):
    user = request.user
    price = PixPrice.objects.get(num_type=id).price

    result_message = ""
    transaction_success = False

    if user_has_enough_pix(user, price):
    
        if id == int(PixPriceNumType.FIX_COLOR):
            transaction_success, result_message = buy_fix_color(request.POST["hex"], user)
        elif id == int(PixPriceNumType.COLOR_PACK):
            transaction_success, result_message = buy_color_pack(Colors_pack.objects.get(id=request.POST["pack_id"]), user)
        elif id == int(PixPriceNumType.RANDOM_COLOR):
            transaction_success, result_message = buy_random_color(user)

    else:
        result_message = "You do not have enough pix!"

    if transaction_success:
        user.pix -= price
        user.save()
    
    return JsonResponse({'Result' : result_message, 'UserPix' : user.pix}, safe=False)