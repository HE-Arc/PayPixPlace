from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator


class Role(models.Model):
    name = models.CharField(max_length=30, unique=True)

class Color(models.Model):
    hex = models.CharField(max_length=9, unique=True)

class User(AbstractUser):
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    pix = models.IntegerField(default=200)
    max_ammo = models.IntegerField(default=3)
    ammo = models.IntegerField(default=3)
    last_ammo_usage = models.DateTimeField(blank=True, null=True)
    ammo_reloading_seconds = models.IntegerField(default=60)   
    role = models.ForeignKey(Role, on_delete=models.CASCADE, blank=True, null=True) 
    owns = models.ManyToManyField(Color)

class Pixie(models.Model):
    title = models.CharField(max_length=30)
    num_type = models.IntegerField(unique=True)
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
    width = models.IntegerField(default=20, validators=[ MaxValueValidator(300), MinValueValidator(10) ])
    is_profit_on = models.BooleanField()
    is_modified = models.BooleanField(default=True)
    interactions = models.IntegerField(default=0)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    class Meta:
        ordering = ['-interactions']

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

class PixPrice(models.Model):
    num_type = models.IntegerField(unique=True)
    name = models.CharField(max_length=30)
    price = models.IntegerField()

