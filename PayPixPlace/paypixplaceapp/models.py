from django.db import models

class Role(models.Model):
    name = models.CharField(max_length=30)

class Color(models.Model):
    hex = models.CharField(max_length=9)

class User(models.Model):
    email = models.CharField(max_length=255)
    pseudo = models.CharField(max_length=30)
    password = models.CharField(max_length=255)
    pix = models.IntegerField()
    max_ammo = models.IntegerField()
    ammo = models.IntegerField()
    last_ammo_usage = models.IntegerField()
    ammo_reloading_seconds = models.IntegerField()   
    role_id = models.ForeignKey(Role, on_delete=models.CASCADE) 
    owns = models.ManyToManyField(Color)

class Pixie(models.Model):
    title = models.CharField(max_length=30)
    price = models.IntegerField()
    number = models.IntegerField()
    bonus = models.IntegerField()

class Purchase(models.Model):
    pixie_id = models.ForeignKey(Pixie, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    purchase_date = models.DateField()

class Canvas(models.Model):
    name = models.CharField(max_length=50)
    theme = models.CharField(max_length=50)
    place = models.SmallIntegerField()
    width = models.IntegerField()
    height = models.IntegerField()
    is_profit_on = models.BooleanField()
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

class Pixel(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()
    hex = models.CharField(max_length=9)
    end_protection_date = models.DateField()
    canvas_id = models.ForeignKey(Canvas, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

class Colors_pack(models.Model):
    name = models.CharField(max_length=50)
    price = models.IntegerField()
    contains = models.ManyToManyField(Color)

class Slot(models.Model):
    place_num = models.IntegerField()
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    color_id = models.ForeignKey(Color, on_delete=models.CASCADE)

