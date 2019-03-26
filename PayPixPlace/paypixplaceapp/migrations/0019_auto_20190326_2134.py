# Generated by Django 2.1.7 on 2019-03-26 20:34

from django.db import migrations, models

def update_pixies(apps, schema_editor):
    Pixie = apps.get_model('paypixplaceapp', 'Pixie')

    p1 = Pixie.objects.get(title="Commoner")
    p1.num_type = 1
    p1.save()

    p2 = Pixie.objects.get(title="Merchant")
    p2.num_type = 2
    p2.save()

    p3 = Pixie.objects.get(title="Pixel Lord")
    p3.num_type = 3
    p3.save()

    p4 = Pixie.objects.get(title="Pixel Legend")
    p4.num_type = 4
    p4.save()

class Migration(migrations.Migration):

    dependencies = [
        ('paypixplaceapp', '0018_pixie_num_type'),
    ]

    operations = [
        migrations.RunPython(update_pixies),
        migrations.AlterField(
            model_name='pixie',
            name='num_type',
            field=models.IntegerField(unique=True),
        ),
    ]