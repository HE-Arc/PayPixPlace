from django.contrib import messages
from django.contrib.auth import authenticate, login as django_login
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from .forms import RegisterForm, UpdateForm, LoginForm

def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Thank you for registering. You are now logged in.")
            new_user = authenticate(username=form.cleaned_data['username'],
                                    password=form.cleaned_data['password1'],
                                    )
            django_login(request, new_user)
            return redirect('paypixplace-home')
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
        'form': form
    }
    return render(request, 'users/profile.html', context)

def login(request):
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        if form.is_valid():
            messages.success(request, "You are now logged in!")
            user = authenticate(username=form.cleaned_data['username'],
                                password=form.cleaned_data['password'],
                                )
            django_login(request, user)
            return redirect('paypixplace-home')
    else:
        form = LoginForm()

    return render(request, 'users/login.html', {'form': form})
