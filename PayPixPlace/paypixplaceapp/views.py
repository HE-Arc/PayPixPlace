import random
from datetime import datetime, timedelta
from enum import IntEnum

import pytz
import stripe
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator
from django.db import connection
from django.db.models import Prefetch, Max
from django.forms import model_to_dict
from django.http import HttpResponse, JsonResponse
from django.http.response import Http404
from django.shortcuts import redirect, render
from django.template.defaulttags import register
from django.utils import timezone
from django.views.generic import DetailView, ListView
from PIL import Image, ImageDraw

from .forms import CreateCanvas
from .models import (Canvas, Color, Colors_pack, Pixel, Pixie, PixPrice,
                     Purchase, Slot, User)

stripe.api_key = "sk_test_4eC39HqLyjWDarjtT1zdp7dc"
MAX_PLAYER_SLOT = 4
MAX_PLAYER_AMMO = 20
MIN_REFILL_TIME = 10
REDUCE_REFILL_TIME = 5

PROFIT_POURCENT = 0.1

@register.filter
def div( value, arg ):
    '''
    Divides the value; argument is the divisor.
    Returns empty string on any error.
    Source : https://stackoverflow.com/questions/5848967/django-how-to-do-calculation-inside-the-template-html-page
    '''
    try:
        value = int( value )
        arg = int( arg )
        if arg: return int(value / arg)
    except: pass
    return ''

@register.filter
def get_item(dictionary, key):
    """Used to get a dictionary value based on its key on the template"""
    return dictionary.get(key)

@register.filter
def get_pix_price():
    """Return a dictionary containing the prices"""
    pix_prices = PixPrice.objects.all()
    prices = {}
    for price in pix_prices:
        prices[price.num_type] = price
    return prices

def get_pix_prices_json(request):
    if request.is_ajax():
        prices = {}
        for key, price in get_pix_price().items():
            prices[key] = {
                "name" : price.name,
                "price" : price.price
            }

        return JsonResponse(prices, safe=False)
    else:
        raise Http404()

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
    LOCK5MINS = 10
    LOCK1HOUR = 11
    LOCK6HOURS = 12
    LOCK12HOURS = 13
    LOCK24HOURS = 14

def get_highest_title_num(user):
    """Return the highest title of the player"""
    
    purchases = Purchase.objects.filter(user=user).select_related('pixie')
    num = 0
    max_id = 0
    pixie = None

    for purchase in purchases:
        if purchase.pixie.id > max_id:
            num = purchase.pixie.num_type
            max_id = purchase.pixie.id
            pixie = purchase.pixie
    
    return num, pixie

def home(request):
    """Get values and return the homepage"""
    try:
        pixie_num, user_title = get_highest_title_num(request.user)

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
        'colors_pack': Colors_pack.objects.all().prefetch_related('contains'),
        'user_title_num': pixie_num,
        'user_title': user_title
    }
    return render(request, 'paypixplaceapp/home.html', context)

class CommunityCanvasView(ListView):
    """Get the comunity canvas"""
    model = Canvas
    template_name = 'paypixplaceapp/canvas/community_canvas.html'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        # Add in a QuerySet of all the books

        canvas = Canvas.objects.filter(place=Place.COMMUNITY)

        context['title'] = 'Community Canvas'
        context['prices'] = get_pix_price()
        context['colors_pack'] = Colors_pack.objects.all().prefetch_related('contains')
        context['canvas'] = getPaginatedCanvas(self.request.GET.get('page'), canvas)
        context['canvas_count'] = len(canvas)
        context['place'] = Place.COMMUNITY
        return context

class OfficialCanvasView(ListView):
    """Get the official canvas"""
    model = Canvas
    template_name = 'paypixplaceapp/canvas/official_canvas.html'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        # Add in a QuerySet of all the books

        canvas = Canvas.objects.filter(place=Place.OFFICIAL)

        context['title'] = 'Official Canvas'
        context['prices'] = get_pix_price()
        context['colors_pack'] = Colors_pack.objects.all().prefetch_related('contains')
        context['canvas'] = getPaginatedCanvas(self.request.GET.get('page'), canvas)
        context['canvas_count'] = len(canvas)
        context['place'] = Place.OFFICIAL
        return context

class CanvasDetailsView(DetailView):
    """Display the detail of a canvas"""
    model = Canvas
    template_name = 'paypixplaceapp/canvas/canvas_detail.html'

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        # Add in a QuerySet of all the books
        context['slots'] = Slot.objects.filter(user=self.request.user.id).select_related('color')

        place_text = "Invalid"
        if self.object.place == Place.OFFICIAL:
            place_text = "Official"
        elif self.object.place == Place.COMMUNITY:
            place_text = "Community"

        context['place_text'] = place_text
        context['prices'] = get_pix_price()
        context['colors_pack'] = Colors_pack.objects.all().prefetch_related('contains')
        return context

def getPaginatedCanvas(page, canvas):
    """Return canvas list on the specified page for the specified place (community or official)"""
    paginator = Paginator(canvas, 3)
    return paginator.get_page(page)

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
            if canvas.place == Place.OFFICIAL or canvas.place == Place.COMMUNITY:

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

                    messages.success(
                        request,
                        f"You created a new canvas successfully! <a href='" +
                            f"/canvas/{canvas.id}/" +
                            f"'>Go to your new canvas!</a>",
                        extra_tags='safe')

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
        'colors_pack': Colors_pack.objects.all().prefetch_related('contains'),
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
        'colors_pack': Colors_pack.objects.all().prefetch_related('contains'),
        'canvas_count': len(canvas)
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
        'colors_pack': Colors_pack.objects.all().prefetch_related('contains'),
    }
    return render(request, 'paypixplaceapp/purchase_pix.html', context)
      
def create_pixel(x, y, hex, canvas_id):
    """Create a pixel (used for the bulk creation)"""
    p = Pixel()
    p.x = x
    p.y = y
    p.hex = hex
    p.canvas_id = canvas_id
    return p

def change_user_slot_color(request):
    if request.is_ajax():
        if request.method == 'POST':

            slotId = request.POST.get('slot')
            color = Color.objects.get(hex=request.POST.get('color'))

            slot = Slot.objects.filter(
                user=request.user,
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
    result_message = "Request Invalid"
    if request.user.is_authenticated:
        if request.is_ajax():
            if request.method == 'POST':
                canvas_id = request.POST['canvas_id']
                x = request.POST['x']
                y = request.POST['y']
                duration_id = int(request.POST['duration_id'])
                if duration_id < 10 or duration_id > 14:
                    duration_id = 11
                user = request.user
                pixel = Pixel.objects.select_related('canvas').get(canvas=canvas_id, x=x, y=y)
                transaction_success, result_message, minutes, hours = lock_with_pix(user, duration_id, pixel.canvas) # duration_id from 10 to 14
                
                if is_pixel_locked(pixel):
                    transaction_success = False
                    result_message = "Pixel already locked"

                if transaction_success:
                    pixel.user = user
                    pixel.end_protection_date = timezone.now() + timedelta(minutes=minutes, hours=hours)
                    pixel.save()
                    modification_valid = True
    data = {
        'is_valid' : modification_valid,
        'result_message' : result_message
    }
    return JsonResponse(data)

def change_pixel_color(request):
    """Changes the color of one pixel of a canvas, if the user have the rights to do so"""
    modification_valid = False
    pixel_locked = False
    if request.user.is_authenticated:
        if request.is_ajax():
            if request.method == 'POST':
                canvas_id = request.POST['canvas_id']
                x = request.POST['x']
                y = request.POST['y']
                hex = request.POST['hex']
                user = request.user

                current_date = timezone.now()

                pixel = Pixel.objects.select_related('canvas').get(canvas=canvas_id, x=x, y=y)
                print(pixel.canvas, flush=True)
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
                    canvas = pixel.canvas
                    canvas.is_modified = True
                    canvas.interactions += 1
                    canvas.save()
                
                pixel_locked = is_pixel_locked(pixel) and (pixel.user != user)
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
    returnBool &= user.owns.filter(hex=color).exists()
    
    return returnBool

def is_pixel_locked(pixel):
    return (pixel.end_protection_date is not None and timezone.now() < pixel.end_protection_date)

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
        canvas = Canvas.objects.filter(id=id).values("width")[0]
    except:
        raise Http404()

    pixels = [pixel for pixel in Pixel.objects.filter(canvas=id).values('x', 'y', 'hex') if pixel["hex"] != "#FFFFFF"]
    imgSize = 1000
    img = Image.new(mode="RGB", size=(imgSize, imgSize), color="#FFFFFF")
    pixelSize = imgSize / canvas["width"]

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
    """ Create a stripe charge, the amount depends on the id"""
    pixie = Pixie.objects.get(id=id)
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
    """Check if the user has enough pix"""
    return user.pix >= price

def add_color_to_user(hex, user):
    """Check if the user has a color, if not, add it"""
    try:
        color = Color.objects.get(hex=hex)
        user.owns.add(color)
    except Color.DoesNotExist:
        user.owns.create(hex=hex)   

def buy_fix_color(hex, user):
    """Handle the fix color purchase"""
    result_message = ""
    transaction_success = False
    
    try:
        user.owns.get(hex__iexact=hex)
        # The user already owns the color
        result_message = "You already own this color!"
    except Color.DoesNotExist:
        # The user does not own the color
        add_color_to_user(hex, user)
        result_message = ["Color successfuly added!", hex]
        transaction_success = True

    return transaction_success, result_message

def buy_random_color(user):
    """Handle the random color purchase"""
    result_message = ""
    transaction_success = False

    # Not optimal, but will only cause trouble if the user owns a massive amout of colors
    while not transaction_success:
        r = lambda: random.randint(0,255)
        hex = ('#%02X%02X%02X' % (r(),r(),r()))
    
        try:
            user.owns.get(hex__iexact=hex)
            # The user already owns the color
            result_message = "You already own this color!"
        except Color.DoesNotExist:
            add_color_to_user(hex, user)
            result_message = ["Color successfully added!", hex]
            transaction_success = True

    return transaction_success, result_message

def buy_slot(user):
    """Handle the slot purchase"""
    result_message = ""
    transaction_success = False

    player_slots = Slot.objects.filter(user=user).order_by('-place_num')
    
    if len(player_slots) < MAX_PLAYER_SLOT:
        last_slot_number = player_slots[0].place_num
        Slot.objects.create(place_num= last_slot_number + 1, user=user, color=user.owns.first())
        result_message = "Slot successfully added"
        transaction_success = True
    else:
         result_message = "You can't buy anymore slots!"

    return transaction_success, result_message

def buy_color_pack(id, user):
    """Handle the color pack purchase"""
    result_message = "You already possess one or more colors from this pack"
    addedColor = []
    transaction_success = False
    color_pack = Colors_pack.objects.prefetch_related('contains').get(id=id)

    for color in color_pack.contains.all():
        try:
            user.owns.get(hex__iexact=color.hex)
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
    """Handle the max ammo increase purchase"""
    result_message = "You already have the max ammo possible!"
    transaction_success = False

    if user.max_ammo < MAX_PLAYER_AMMO:
        user.max_ammo += 1
        user.ammo += 1
        transaction_success = True
        result_message = "Max ammo increased!"

    return transaction_success, result_message

def reduce_refill_time(user):
    """Handle the refill time decrease purchase"""
    result_message = "You already have the lowest refill time possible!"
    transaction_success = False

    if user.ammo_reloading_seconds > MIN_REFILL_TIME:
        user.ammo_reloading_seconds -= REDUCE_REFILL_TIME
        transaction_success = True
        result_message = "Refill time decreased!"

    return transaction_success, result_message

def get_instant_ammo(user):
    """Handle the instant ammo purchase"""
    user.ammo += 1
    transaction_success = True
    result_message = "Received an ammo!"

    return transaction_success, result_message

def activate_profit(canvas_id):
    """Activate the profit on a canvas"""
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
    """Handle the purchase with pix"""
    user = request.user
    price = PixPrice.objects.get(num_type=id).price

    result_message = ""
    transaction_success = False

    if user_has_enough_pix(user, price):
    
        if id == int(PixPriceNumType.FIX_COLOR):
            transaction_success, result_message = buy_fix_color(request.POST["hex"], user)
        elif id == int(PixPriceNumType.COLOR_PACK):
            transaction_success, result_message = buy_color_pack(request.POST["pack_id"], user)
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

def lock_with_pix(user, id, canvas):
    """Makes a user pay a price for locking a pixel"""
    price = PixPrice.objects.get(num_type=id).price

    result_message = ""
    transaction_success = False
    minutes = 0
    hours = 0

    if user_has_enough_pix(user, price):
        transaction_success = True
        if id == int(PixPriceNumType.LOCK5MINS):
            result_message = "Pixel locked for 5 minutes" 
            minutes = 5
        elif id == int(PixPriceNumType.LOCK1HOUR):
            result_message = "Pixel locked for 1 hour"
            hours = 1
        elif id == int(PixPriceNumType.LOCK6HOURS):
            result_message = "Pixel locked for 6 hours"
            hours = 6
        elif id == int(PixPriceNumType.LOCK12HOURS):
            result_message = "Pixel locked for 12 hours"
            hours = 12
        elif id == int(PixPriceNumType.LOCK24HOURS):
            result_message = "Pixel locked for 24 hours"
            hours = 24
        else:
            transaction_success = False
    else:
        result_message = "You do not have enough pix!"
    
    if transaction_success:
        user.pix -= price
        user.save()
        if canvas.is_profit_on and user != canvas.user:
            canvas.user.pix += int(price * PROFIT_POURCENT)
            canvas.user.save()

    return transaction_success, result_message, minutes, hours
