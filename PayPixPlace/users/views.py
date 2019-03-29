from django.contrib import messages
from django.contrib.auth import authenticate, login as django_login
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.utils.http import is_safe_url

from .forms import RegisterForm, UpdateForm, LoginForm
from paypixplaceapp.models import Color, Slot, Colors_pack, Role
from paypixplaceapp.views import get_pix_price

def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():

            new_user = form.save()

            colors = [
                '#fbae00',
                '#da5353',
                '#693f7b',
                '#39589a',
                '#338984'
            ]
            colors = list(Color.objects.filter(hex__in=colors))

            new_user.owns.add(*colors)
            new_user.role = Role.objects.get(name="user")
            new_user.save()

            Slot.objects.create(place_num=1, user=new_user, color=colors[0])

            new_user = authenticate(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password1'],
            )
            django_login(request, new_user)

            messages.success(request, "Thank you for registering. You are now logged in.")

            #return redirect('paypixplace-home')
    else:
        form = RegisterForm()

    return render(request, 'users/register.html', {'form': form})

@login_required
def profile(request):
    if request.method == 'POST':
        form = UpdateForm(request.POST, instance=request.user)
        
        if form.is_valid():
            form.save()
            messages.success(request, f'Your account has been updated!')
            return redirect('profile')
    else:
        form = UpdateForm(instance=request.user)

    context = {
        'title': 'Profile',
        'form': form,
        'prices': get_pix_price(),
        'colors_pack': Colors_pack.objects.all().prefetch_related('contains'),
    }
    return render(request, 'users/profile.html', context)

def login(request):
    if request.method == 'POST':
        form = LoginForm(data=request.POST)

        if form.is_valid():
            user = authenticate(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password'],
            )
            django_login(request, user)

            # get the redirect location
            redirect_to = request.GET.get('next', '')
            url_is_safe = is_safe_url(redirect_to, request.get_host())

            if redirect_to and url_is_safe:
                messages.success(request, "You are now logged in! You have been redirected!")
                return redirect(redirect_to)

            messages.success(request, "You are now logged in!")
            return redirect('paypixplace-home')
    else:
        form = LoginForm()

    return render(request, 'users/login.html', {'form': form})
