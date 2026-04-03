# -*- coding: utf-8 -*-
{
    'name': 'HR Birthday Notification',
    'version': '18.0.1.0.0',
    'category': 'Human Resources',
    'summary': 'Show animated birthday popup & bar notification for employee birthdays',
    'description': """
        HR Birthday Notification
        ========================
        - Shows an animated top bar when any employee has a birthday today
        - Displays a beautiful popup notification with balloon animations for 5-10 seconds
        - Works for all logged-in Odoo users
        - Fetches today's birthday employees from the backend
    """,
    'author': 'Mausam Gurung',
    'depends': ['hr', 'web', 'mail'],
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
    'application': False,
    'license': 'LGPL-3',
    "images":['static/src/image/banner.gif']
}
