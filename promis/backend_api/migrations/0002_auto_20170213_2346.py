# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2017-02-13 23:46
from __future__ import unicode_literals

import django.contrib.gis.db.models.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend_api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sessions',
            name='geo_line',
            field=django.contrib.gis.db.models.fields.LineStringField(srid=4326),
        ),
        migrations.AlterModelTable(
            name='channels',
            table='channels',
        ),
        migrations.AlterModelTable(
            name='devices',
            table='devices',
        ),
        migrations.AlterModelTable(
            name='documents',
            table='documents',
        ),
        migrations.AlterModelTable(
            name='functions',
            table='functions',
        ),
        migrations.AlterModelTable(
            name='measurements',
            table='measurements',
        ),
        migrations.AlterModelTable(
            name='parameters',
            table='parameters',
        ),
        migrations.AlterModelTable(
            name='sessions',
            table='sessions',
        ),
        migrations.AlterModelTable(
            name='space_projects',
            table='space_projects',
        ),
        migrations.AlterModelTable(
            name='translations',
            table='translations',
        ),
        migrations.AlterModelTable(
            name='units',
            table='units',
        ),
        migrations.AlterModelTable(
            name='values',
            table='values',
        ),
    ]
