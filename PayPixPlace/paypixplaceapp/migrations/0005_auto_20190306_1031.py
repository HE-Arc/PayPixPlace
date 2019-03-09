# Generated by Django 2.1.7 on 2019-03-06 09:31

from django.db import migrations


def create_colors(apps, schema_editor):
    Color = apps.get_model('paypixplaceapp', 'Color')

    c1 = Color(hex="#fbae00")
    c1.save() 
    c2 = Color(hex="#da5353")
    c2.save() 
    c3 = Color(hex="#693f7b")
    c3.save() 
    c4 = Color(hex="#39589a")
    c4.save() 
    c5 = Color(hex="#338984")
    c5.save() 

def create_roles(apps, schema_editor):
    Role = apps.get_model('paypixplaceapp', 'Role')

    user = Role(name="user")
    user.save()
    admin = Role(name="admin")
    admin.save()


class Migration(migrations.Migration):

    dependencies = [
        ('paypixplaceapp', '0004_auto_20190306_1025'),
    ]

    operations = [
        migrations.RunPython(create_colors),
        migrations.RunPython(create_roles),
    ]
