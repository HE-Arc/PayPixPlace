# Generated by Django 2.1.7 on 2019-03-06 12:23

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('paypixplaceapp', '0005_auto_20190306_1031'),
    ]

    operations = [
        migrations.RenameField(
            model_name='pixel',
            old_name='user_id',
            new_name='user',
        ),
        migrations.RenameField(
            model_name='purchase',
            old_name='pixie_id',
            new_name='pixie',
        ),
        migrations.RenameField(
            model_name='purchase',
            old_name='user_id',
            new_name='user',
        ),
        migrations.RenameField(
            model_name='slot',
            old_name='color_id',
            new_name='color',
        ),
        migrations.RenameField(
            model_name='slot',
            old_name='user_id',
            new_name='user',
        ),
        migrations.RenameField(
            model_name='user',
            old_name='role_id',
            new_name='role',
        ),
        migrations.RemoveField(
            model_name='canvas',
            name='user_id',
        ),
        migrations.AddField(
            model_name='canvas',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
