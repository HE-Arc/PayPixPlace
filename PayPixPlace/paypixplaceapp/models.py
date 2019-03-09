from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.Model):
    name = models.CharField(max_length=30)

class Color(models.Model):
    hex = models.CharField(max_length=9)

class User(AbstractUser):
    email = models.CharField(max_length=255)
    pseudo = models.CharField(max_length=30)
    password = models.CharField(max_length=255)
    pix = models.IntegerField(default=200)
    max_ammo = models.IntegerField(default=3)
    ammo = models.IntegerField(default=3)
    last_ammo_usage = models.IntegerField(null=True)
    ammo_reloading_seconds = models.IntegerField(default=60)   
    role = models.ForeignKey(Role, on_delete=models.CASCADE, null=True) 
    owns = models.ManyToManyField(Color)

class Pixie(models.Model):
    title = models.CharField(max_length=30)
    price = models.IntegerField()
    number = models.IntegerField()
    bonus = models.IntegerField()

class Purchase(models.Model):
    pixie = models.ForeignKey(Pixie, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    purchase_date = models.DateField()

class Canvas(models.Model):
    name = models.CharField(max_length=50)
    theme = models.CharField(max_length=50)
    place = models.SmallIntegerField()
    width = models.IntegerField()
    height = models.IntegerField()
    is_profit_on = models.BooleanField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)

class Pixel(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()
    hex = models.CharField(max_length=9)
    end_protection_date = models.DateField(null=True)
    canvas = models.ForeignKey(Canvas, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True) 

class Colors_pack(models.Model):
    name = models.CharField(max_length=50)
    price = models.IntegerField()
    contains = models.ManyToManyField(Color)

class Slot(models.Model):
    place_num = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    color = models.ForeignKey(Color, on_delete=models.CASCADE)

