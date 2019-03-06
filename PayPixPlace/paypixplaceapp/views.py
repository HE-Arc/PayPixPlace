from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    return HttpResponse('<h1>PayPixPlay Home</h1>')

def createCanvas(request):
    return HttpResponse('<h1>PayPixPlay Create Canvas</h1>')