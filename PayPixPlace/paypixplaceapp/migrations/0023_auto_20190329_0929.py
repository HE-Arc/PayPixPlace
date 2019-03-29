# Generated by Django 2.1.7 on 2019-03-29 08:29

from django.db import migrations

def create_pix_price(apps, schema_editor):
        PixPrice = apps.get_model('paypixplaceapp', 'PixPrice')

        p1 = PixPrice(num_type=10, name="Lock Pixel for 5 minutes", price=10)
        p1.save()
        
        p2 = PixPrice(num_type=11, name="Lock Pixel for 1 hour", price=12)
        p2.save()
        
        p3 = PixPrice(num_type=12, name="Lock Pixel for 6 hours", price=15)
        p3.save()
        
        p4 = PixPrice(num_type=13, name="Lock Pixel for 12 hours", price=18)
        p4.save()
        
        p5 = PixPrice(num_type=14, name="Lock Pixel for 24 hours", price=20)
        p5.save()

class Migration(migrations.Migration):

    dependencies = [
        ('paypixplaceapp', '0022_auto_20190328_1707'),
    ]

    operations = [
        migrations.RunPython(create_pix_price),
    ]
