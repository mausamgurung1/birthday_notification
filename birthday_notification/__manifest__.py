# -*- coding: utf-8 -*-
# Part of Mausam Gurung. See LICENSE file for full copyright and licensing details.
{
    'name': 'Employee Birthday Notification',
    'version' : "19.0.0.0",
    'category' : "Extra Tools",
    'summary': 'Show animated birthday popup & bar notification for employee birthdays',
    'description' : '''
            Shows an animated top bar when any employee has a birthday today
             Displays a beautiful popup notification with balloon animations for 5-10 seconds
    ''',
    "author": "Mausam Gurung",
    'website': '',
    'depends': ['hr', 'mail'],
    'data': [
        'security/ir.model.access.csv',
        'views/hr_employee_views.xml',
        'data/corn.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'hr_birthday_notification/static/src/css/birthday_notification.css',
            'hr_birthday_notification/static/src/js/birthday_notification.js',
        ],
    },
    'installable': True,
    'auto_install': False,
	"images":['static/description/banner.gif'],
}