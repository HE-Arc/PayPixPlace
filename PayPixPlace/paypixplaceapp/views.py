from datetime import datetime, timedelta
import pytz
from django.utils import timezone
from enum import IntEnum

from django.contrib import messages
from django.contrib.auth.decorators import login_required
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

import stripe 
import random

stripe.api_key = "sk_test_4eC39HqLyjWDarjtT1zdp7dc"
MAX_PLAYER_SLOT = 4
MAX_PLAYER_AMMO = 20
MIN_REFILL_TIME = 10
REDUCE_REFILL_TIME = 5

@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)

@register.filter
def get_pix_price():
    pix_prices = PixPrice.objects.all()
    prices = {}
    for price in pix_prices:
        prices[price.num_type] = price
    return prices

class Place(IntEnum):
    OFFICIAL = 0
    COMMUNITY = 1

class PixPriceNumType(IntEnum):
    FIX_COLOR = 0
    COLOR_PACK = 1
    RANDOM_COLOR = 2
    UNLOCK_SLOT = 3
    MAX_AMMO = 5
    REFILL_TIME = 6
    INSTANT_AMMO = 7
    CANVAS_PROFIT_CREATION = 8
    CANVAS_PROFIT_ACTIVATION = 9

def get_highest_title_num(user):
    purchases = Purchase.objects.filter(user=user)
    num = 0
    max_id = 0

    for purchase in purchases:
        if purchase.pixie.id > max_id:
            num = purchase.pixie.num_type
            max_id = purchase.pixie.id
    
    return num

def home(request):
    try:
        pixie_num = get_highest_title_num(request.user)
        user_title = Pixie.objects.filter(num_type=pixie_num).first()

        if(user_title == None):
            user_title = "Pixer"
        else:
            user_title = user_title.title
    except:
        pixie_num = -1
        user_title = "Anonymous"

    context = {
        'title': 'Home',
        'prices': get_pix_price(),
        'colors_pack': Colors_pack.objects.all(),
        'user_title_num': pixie_num,
        'user_title': user_title
    }
    return render(request, 'paypixplaceapp/home.html', context)

class CommunityCanvasView(ListView):
    model = Canvas
    template_name = 'paypixplaceapp/canvas/community_canvas.html'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        # Add in a QuerySet of all the books
        context['title'] = 'Community Canvas'
        context['prices'] = get_pix_price()
        context['colors_pack'] = Colors_pack.objects.all()
        context['canvas'] = getCanvas(self.request.GET.get('page'), Place.COMMUNITY)
        return context

class OfficialCanvasView(ListView):
    model = Canvas
    template_name = 'paypixplaceapp/canvas/official_canvas.html'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        # Add in a QuerySet of all the books
        context['title'] = 'Official Canvas'
        context['prices'] = get_pix_price()
        context['colors_pack'] = Colors_pack.objects.all()
        context['canvas'] = getCanvas(self.request.GET.get('page'), Place.OFFICIAL)
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
        if self.object.place == Place.OFFICIAL:
            place_text = "Official"
        elif self.object.place == Place.COMMUNITY:
            place_text = "Community"

        context['place_text'] = place_text
        context['prices'] = get_pix_price()
        context['colors_pack'] = Colors_pack.objects.all()
        return context

def getCanvas(page, place):
    canvas_list = Canvas.objects.filter(place=int(place))
    paginator = Paginator(canvas_list, 3)
    canvas = paginator.get_page(page)
    for c in canvas:
        c.pixels = Pixel.objects.filter(canvas=c.id)
    return canvas

@login_required
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
            if canvas.place >= Place.OFFICIAL and canvas.place <= Place.COMMUNITY:

                if request.user.role.name == "admin" or (request.user.role.name == "user" and canvas.place == Place.COMMUNITY):
                    canvas.save()

                    instances = [create_pixel(x, y, "#FFFFFF", canvas.id) for x in range(canvas.width) for y in range(canvas.width)]
                    Pixel.objects.bulk_create(instances)

                    if canvas.is_profit_on:
                        price = PixPrice.objects.get(num_type=int(PixPriceNumType.CANVAS_PROFIT_CREATION)).price
                        if canvas.user.pix >= price:
                            canvas.user.pix -= price
                            canvas.user.save()
                        else:
                            messages.error(request, f"You don't have enough pix to enable the profit!")

                    messages.success(request, f'You created a new canvas successfully!')

                    if canvas.place == int(Place.COMMUNITY):
                        return redirect('canvas-community')
                    else:
                        return redirect('canvas-official')

            messages.error(request, f'The place is invalid!')

    # if a GET (or any other method) we'll create a blank form
    else:
        form = CreateCanvas()

    context = {
        'title': 'Create Canvas',
        'form': form,
        'prices': get_pix_price(),
        'colors_pack': Colors_pack.objects.all(),
    }

    return render(request, 'paypixplaceapp/canvas/create_canvas.html', context)

@login_required
def userCanvas(request):
    canvas_list = Canvas.objects.filter(user=request.user)
    paginator = Paginator(canvas_list, 3)
    canvas = paginator.get_page(request.GET.get('page'))

    context = {
        'title': 'User\'s Canvas',
        'canvas': canvas,
        'prices': get_pix_price(),
        'colors_pack': Colors_pack.objects.all(),
    }
    return render(request, 'paypixplaceapp/canvas/user_canvas.html', context)

def get_pixies_info():
    pixies = Pixie.objects.all()
    return pixies

@login_required
def purchase(request):
    context = {
        'title': 'Purchase PIX',
        'pixies': get_pixies_info(),
        'prices': get_pix_price(),
        'colors_pack': Colors_pack.objects.all(),
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
                return JsonResponse({
                    'is_valid': False,
                })
                
            slot.color = color
            slot.save()
            
            return JsonResponse({
                'is_valid': True,
            })

def lock_pixel(request):
    """Locks a pixel for a given time, becoming only modifiable by the owner"""
    modification_valid = False
    if request.user.is_authenticated:
        if request.is_ajax():
            if request.method == 'POST':
                canvas_id = request.POST['canvas_id']
                x = request.POST['x']
                y = request.POST['y']
                user = request.user
                #TODO make the user pay the price

                pixel = Pixel.objects.get(canvas=canvas_id, x=x, y=y)
                pixel.user = user
                pixel.end_protection_date = timezone.now() + timedelta(hours=1)
                pixel.save()
                modification_valid = True
    data = {
        'is_valid' : modification_valid
    }
    return JsonResponse(data)

def change_pixel_color(request):
    """Changes the color of one pixel of a canvas, if the user have the rights to do so"""
    modification_valid = False
    if request.user.is_authenticated:
        if request.is_ajax():
            if request.method == 'POST':
                canvas_id = request.POST['canvas_id']
                x = request.POST['x']
                y = request.POST['y']
                hex = request.POST['hex']
                user = request.user

                current_date = timezone.now()

                pixel = Pixel.objects.get(canvas=canvas_id, x=x, y=y)
                if can_modify_pixel(pixel, hex, user, current_date):
                    pixel.hex = hex
                    pixel.user = user
                    pixel.save()

                    if user.ammo == user.max_ammo:
                        user.last_ammo_usage = current_date
                    user.ammo -= 1
                    user.pix += 1
                    user.save()
                    modification_valid = True
                    canvas = Canvas.objects.get(id=canvas_id)
                    canvas.is_modified = True
                    canvas.interactions += 1
                    canvas.save()
                
                pixel_locked = (
                    pixel.end_protection_date is not None and 
                    current_date < pixel.end_protection_date
                    ) and (pixel.user != user)
    data = {
        'is_valid' : modification_valid,
        'user_authenticated' : request.user.is_authenticated,
        'pixel_locked' : pixel_locked
    }
    return JsonResponse(data)

def can_modify_pixel(pixel, color, user, current_date):
    """Test if the user can modify a pixel"""
    returnBool = True
    returnBool &= (
        pixel.end_protection_date is None or
        current_date > pixel.end_protection_date
        ) or (pixel.user == user)
    returnBool &= user.ammo > 0
    returnBool &= color in [color.hex for color in user.owns.all()]
    
    return returnBool

@login_required
def get_user_ammo(request):
    """Returns informations about the user's ammunitions"""
    if request.is_ajax():
        user = request.user

        timeBeforeReload = 0
        if user.last_ammo_usage:
            timeBeforeReload = (timezone.now() - user.last_ammo_usage).total_seconds()
            while timeBeforeReload > user.ammo_reloading_seconds:
                timeBeforeReload -= user.ammo_reloading_seconds
                if user.ammo < user.max_ammo:
                    user.ammo += 1
                    user.last_ammo_usage = timezone.now()
            
            timeBeforeReload = user.ammo_reloading_seconds - abs(int(timeBeforeReload))
        user.save()

        data = {
            'ammo' : user.ammo,
            'maxAmmo' : user.max_ammo,
            'reloadTime' : user.ammo_reloading_seconds,
            'timeBeforeReload' : timeBeforeReload
        }
        return JsonResponse(data)
    else:
        raise Http404()


def get_cursor(request, hex):
    """Returns a img a a paintBrush with the given hex color"""
    img = Image.new('RGBA', (32, 32))
    draw = ImageDraw.Draw(img)
    draw.line(
        [(20,20),(10,10)],
        width=7,
        fill="#AAAAAA",
    )
    draw.ellipse(
        [(18,18),(24,24)],
        fill="#AAAAAA"
    )
    draw.line(
        [(20,20),(10,10)],
        width=6,
        fill="#000000",
    )
    draw.ellipse(
        [(18,18),(22,22)],
        fill="#000000"
    )

    draw.rectangle(
        [(0,0),(8,8)],
        fill= "#" + hex
    )
    draw.ellipse(
        [(3,3),(14,14)],
        fill= "#" + hex
    )
    draw.ellipse(
        [(1,1),(12,12)],
        fill= "#" + hex
    )
    del draw

    response = HttpResponse(content_type="image/png")
    img.save(response, "png")
    return response

def get_json(request, id):
    """returns the canvas and all its pixels (and bonus infos) in a json format"""
    if not id:
        raise Http404()

    try:
        canvas = Canvas.objects.get(id=id)
    except ObjectDoesNotExist:
        raise Http404()
    
    pixels = list(Pixel.objects.filter(canvas=id).values('x', 'y', 'hex', 'user__username', 'end_protection_date'))
    pixels2Darray = [list(range(canvas.width)) for p in pixels if p["x"] == 0]
    for pixel in pixels:
        try:
            timeLeft = int((pixel['end_protection_date'] - timezone.now()).total_seconds())
            if timeLeft < 0:
                timeLeft = 0
        except:
            timeLeft = 0

        pixels2Darray[pixel["x"]][pixel["y"]] = {
            "hex" : pixel["hex"],
            "username" : pixel["user__username"],
            "timeLeft" : timeLeft
        }
    
    try:
        pix = request.user.pix
    except:
        pix = -1
    data = {
        'canvas': model_to_dict(canvas),
        'pixels': pixels2Darray,
        'pix' : pix
    }
    return JsonResponse(data)


def get_img(request, id):
    """returns the canvas by its id, as a PNG img"""
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

# Dict to store imgs already generated
get_img.images = {}


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
        result_message = ["Color successfuly added!", hex]
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
            result_message = ["Color successfully added!", hex]
            transaction_success = True

    return transaction_success, result_message

def buy_slot(user):
    result_message = ""
    transaction_success = False

    player_slots = Slot.objects.filter(user=user).order_by('-place_num')
    
    if player_slots.count() < MAX_PLAYER_SLOT:
        last_slot_number = player_slots.first().place_num
        Slot.objects.create(place_num= last_slot_number + 1, user=user, color=user.owns.first())
        result_message = "Slot successfully added"
        transaction_success = True

    else:
         result_message = "You can't buy anymore slots!"

    return transaction_success, result_message

def buy_color_pack(color_pack, user):
    result_message = "You already possess one or more colors from this pack"
    addedColor = []
    transaction_success = False

    for color in color_pack.contains.all():
        try:
            user.owns.all().get(hex=color.hex)
            break
            # The user already owns the color
        except Color.DoesNotExist:
            add_color_to_user(color.hex, user)
            transaction_success = True
            addedColor.append(color.hex)
            result_message = ["Colors successfully added!"]

    if isinstance(result_message, (list,)):
        result_message.append(addedColor)

    return transaction_success, result_message

def increase_max_ammo(user):
    result_message = "You already have the max ammo possible!"
    transaction_success = False

    if user.max_ammo < MAX_PLAYER_AMMO:
        user.max_ammo += 1
        user.ammo += 1
        transaction_success = True
        result_message = "Max ammo increased!"

    return transaction_success, result_message

def reduce_refill_time(user):
    result_message = "You already have the lowest refill time possible!"
    transaction_success = False

    if user.ammo_reloading_seconds > MIN_REFILL_TIME:
        user.ammo_reloading_seconds -= REDUCE_REFILL_TIME
        transaction_success = True
        result_message = "Refill time decreased!"

    return transaction_success, result_message

def get_instant_ammo(user):
    user.ammo += 1
    transaction_success = True
    result_message = "Received an ammo!"

    return transaction_success, result_message

def activate_profit(canvas_id):
    transaction_success = False
    result_message = ""
    try:
        canvas = Canvas.objects.get(id=canvas_id)
        if not canvas.is_profit_on:
            canvas.is_profit_on = True
            canvas.save()
            transaction_success = True
            result_message = "Profit successfully enabled!"
        else:
            transaction_success = False
            result_message = "The profit is already enabled"
    except:
        result_message = "Don't try to modify the html, you little b*stard"
        transaction_success = False

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
        elif id == int(PixPriceNumType.UNLOCK_SLOT):
            transaction_success, result_message = buy_slot(user)
        elif id == int(PixPriceNumType.MAX_AMMO):
            transaction_success, result_message = increase_max_ammo(user)
        elif id == int(PixPriceNumType.REFILL_TIME):
            transaction_success, result_message = reduce_refill_time(user)
        elif id == int(PixPriceNumType.INSTANT_AMMO):
            transaction_success, result_message = get_instant_ammo(user)
        elif id == int(PixPriceNumType.CANVAS_PROFIT_ACTIVATION):
            transaction_success, result_message = activate_profit(request.POST["canvas_id"])

    else:
        result_message = "You do not have enough pix!"

    res = [id]
    if isinstance(result_message, (list,) ):
        res.extend(result_message)
    else:
        res.append(result_message)

    result_message = res

    if transaction_success:
        user.pix -= price
        user.save()
    
    return JsonResponse({'Result' : result_message, "TransactionSuccess" : transaction_success, 'UserPix' : user.pix, "Ammo" : user.ammo}, safe=False)