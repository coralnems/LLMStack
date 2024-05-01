# Generated by Django 4.2.11 on 2024-04-30 19:16

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('datasources', '0003_datasourceentryfiles'),
    ]

    operations = [
        migrations.AlterField(
            model_name='datasource',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, help_text='UUID of the data source', unique=True),
        ),
        migrations.AlterField(
            model_name='datasourceentry',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, help_text='UUID of the data source file', unique=True),
        ),
        migrations.AlterField(
            model_name='datasourceentryfiles',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, help_text='UUID of the asset', unique=True),
        ),
    ]