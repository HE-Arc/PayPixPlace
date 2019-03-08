from django.shortcuts import render, redirect
from .forms import SignUpForm
from django.contrib import messages

def signup(request):
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, f'Account created for {user.username}!')
            return redirect('paypixplace-home')
    else:
        form = SignUpForm()

    return render(request, 'users/signup.html', {'form': form})