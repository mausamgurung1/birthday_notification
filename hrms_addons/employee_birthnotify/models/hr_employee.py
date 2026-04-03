# -*- coding: utf-8 -*-
from odoo import models, fields, api
from datetime import date

import logging
_logger = logging.getLogger(__name__)


class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    @api.model
    def get_today_birthdays(self):

        today = date.today()
        employees = self.search([
            ('birthday', '!=', False),
            ('active', '=', True),
        ])

        birthday_employees = []
        for emp in employees:
            if emp.birthday.month == today.month and emp.birthday.day == today.day:
                image_url = '/web/image/hr.employee/%d/avatar_128' % emp.id
                birthday_employees.append({
                    'id': emp.id,
                    'name': emp.name,
                    'job_title': emp.job_title or emp.job_id.name or '',
                    'department': emp.department_id.name if emp.department_id else '',
                    'image_url': image_url,
                })

        return birthday_employees


    def cron_send_birthday_wishes(self):
        today = date.today()
        _logger.info("Running Birthday Cron for date: %s", today)

        employees = self.sudo().search([
            ('birthday', '!=', False),
            ('work_email', '!=', False),
        ])

        _logger.info("Total Employees Found: %s", len(employees))

        template = self.env.ref(
            'hr_birthday_notification.email_template_employee_birthday',
            raise_if_not_found=False
        )

        if not template:
            _logger.warning("Email template not found!")
            return

        for emp in employees:
            _logger.info("Checking Employee: %s | Birthday: %s", emp.name, emp.birthday)

            if (
                emp.birthday
                and emp.birthday.month == today.month
                and emp.birthday.day == today.day
            ):
                _logger.info("Sending birthday email to: %s", emp.name)
                template.send_mail(emp.id, force_send=True)