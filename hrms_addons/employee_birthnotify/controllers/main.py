# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request


class BirthdayController(http.Controller):

    @http.route('/hr_birthday_notification/today_birthdays', type='json',
                auth='user', methods=['POST'])
    def get_today_birthdays(self):
        employees = request.env['hr.employee'].get_today_birthdays()
        return {'employees': employees}
