/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, onMounted, useState, xml } from "@odoo/owl";

const SESSION_KEY = "bday_notification_shown";

function makeBalloon(color, x, animDuration, size = 36) {
  return `
    <svg class="bday-balloon" style="left:${x}%;animation-duration:${animDuration}s;width:${size}px;height:${size * 1.4}px;" viewBox="0 0 60 84" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="30" rx="28" ry="30" fill="${color}" opacity="0.92"/>
      <ellipse cx="22" cy="18" rx="8" ry="6" fill="white" opacity="0.25"/>
      <polygon points="30,60 26,68 34,68" fill="${color}" opacity="0.85"/>
      <line x1="30" y1="68" x2="28" y2="84" stroke="#aaa" stroke-width="1.5"/>
    </svg>`;
}

function makeConfetti(i) {
  const colors = [
    "#ff6b6b",
    "#ffd93d",
    "#6bcb77",
    "#4d96ff",
    "#ff6bff",
    "#ff9f43",
  ];
  const color = colors[i % colors.length];
  const x = Math.random() * 100;
  const delay = Math.random() * 3;
  const dur = 3 + Math.random() * 3;
  const size = 6 + Math.random() * 8;
  const shape = i % 3 === 0 ? "circle" : i % 3 === 1 ? "2px" : "0";
  return `<div class="bday-confetti" style="
        left:${x}%;
        background:${color};
        width:${size}px;height:${size}px;
        border-radius:${shape};
        animation-delay:${delay}s;
        animation-duration:${dur}s;
    "></div>`;
}

class BirthdayNotificationService {
  constructor(env, { orm, notification }) {
    this.env = env;
    this.orm = orm;
    this.notification = notification;
    this._init();
  }

  async _init() {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    await new Promise((r) => setTimeout(r, 2000));
    await this._checkBirthdays();
  }

  async _checkBirthdays() {
    try {
      const result = await this.orm.call(
        "hr.employee",
        "get_today_birthdays",
        [],
        {},
      );

      if (!result || result.length === 0) return;

      sessionStorage.setItem(SESSION_KEY, "1");

      this._showBar(result);
      setTimeout(() => this._showPopup(result), 100);
    } catch (e) {
      console.warn("[BirthdayNotification] Could not fetch birthdays:", e);
    }
  }

  _showBar(employees) {
    const names = employees.map((e) => e.name).join(", ");
    const msg =
      employees.length === 1
        ? `🎂 Today is ${names}'s Birthday! Wish them well! 🎉`
        : `🎂 Today's Birthdays: ${names} — Wish them well! 🎉`;

    let bar = document.getElementById("bday-global-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "bday-global-bar";
      bar.className = "bday-bar";
      document.body.prepend(bar);
    }

    bar.innerHTML = `
            <span class="bday-bar-icon">🎂</span>
            <span class="bday-bar-text">${msg}</span>
            <span class="bday-bar-icon">🎉</span>
            <button class="bday-bar-close" id="bday-bar-close-btn">✕</button>
        `;

    setTimeout(() => bar.classList.add("bday-bar-visible"), 100);

    document
      .getElementById("bday-bar-close-btn")
      .addEventListener("click", () => {
        bar.classList.remove("bday-bar-visible");
        setTimeout(() => bar.remove(), 500);
      });
  }

  _showPopup(employees) {
    const old = document.getElementById("bday-popup-root");
    if (old) old.remove();

    const container = document.createElement("div");
    container.id = "bday-popup-root";
    document.body.appendChild(container);

    const DURATION = 8000;

    const loginEmployee = employees.find((emp) => emp.is_login_user);
    const isLoginUserBirthday = Boolean(loginEmployee);
    const otherBirthdayEmployees = employees.filter((emp) => !emp.is_login_user);

    let titleHtml = "";
    let subtitleHtml = "";

    if (isLoginUserBirthday && otherBirthdayEmployees.length === 0) {
      titleHtml = `<h2 class="bday-popup-title">Happy Birthday!</h2>`;
      subtitleHtml = `<p class="bday-popup-subtitle">🎊 Wishing you a wonderful day! 🎊</p>`;
    } else if (isLoginUserBirthday && otherBirthdayEmployees.length > 0) {
      const otherNames = otherBirthdayEmployees.map((e) => e.name).join(", ");
      titleHtml = `<h2 class="bday-popup-title">Happy Birthday!</h2>`;
      subtitleHtml = `
        <p class="bday-popup-subtitle">
          🎊 Wishing you a wonderful day! 🎊<br/>
          Also celebrating today: <strong>${otherNames}</strong> 🎉
        </p>`;
    } else {
      const otherNames = otherBirthdayEmployees.map((e) => e.name).join(", ");
      titleHtml = `<h2 class="bday-popup-title">Birthday Reminder!</h2>`;
      subtitleHtml = `
        <p class="bday-popup-subtitle">
          🎊 ${otherNames}'s Birthday Today 🎊<br/>
          Share Some Love ❤️
        </p>`;
    }

    container.innerHTML = `
        <div class="bday-overlay bday-overlay-active" id="bday-overlay">
            <div class="bday-popup bday-popup-active" id="bday-popup">
                <div class="bday-confetti-layer" id="bday-confetti-layer"></div>
                <div class="bday-balloon-layer" id="bday-balloon-layer"></div>

                <div class="bday-popup-header">
                    <div class="bday-cake-wrap">
                        <span class="bday-cake-emoji">🎂</span>
                        <div class="bday-sparkle-ring"></div>
                    </div>

                    ${titleHtml}
                    ${subtitleHtml}
                </div>

                <div class="bday-employees">
                    ${employees
                      .map(
                        (emp) => `
                        <div class="bday-emp-card">
                            <div class="bday-emp-avatar-wrap">
                                <img class="bday-emp-avatar"
                                    src="${emp.image_url}"
                                    alt="${emp.name}"
                                    onerror="this.src='/web/static/img/user.svg'"/>
                                <span class="bday-emp-badge">🎈</span>
                            </div>
                            <div class="bday-emp-info">
                                <div class="bday-emp-name">${emp.name}</div>
                                <div class="bday-emp-role">${emp.job_title || emp.department || ""}</div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>

                <div class="bday-progress-wrap">
                    <div class="bday-progress-bar" id="bday-progress-bar" style="width:100%"></div>
                </div>

                <button class="bday-close-btn" id="bday-close-btn">✕</button>
            </div>
        </div>`;

    this._injectParticles();

    const pb = document.getElementById("bday-progress-bar");
    if (pb) {
      pb.style.transition = `width ${DURATION}ms linear`;
      setTimeout(() => {
        pb.style.width = "0%";
      }, 100);
    }

    const closeTimer = setTimeout(() => this._closePopup(), DURATION);

    const closeBtn = document.getElementById("bday-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        clearTimeout(closeTimer);
        this._closePopup();
      });
    }
  }

  _injectParticles() {
    const confettiLayer = document.getElementById("bday-confetti-layer");
    if (confettiLayer) {
      let html = "";
      for (let i = 0; i < 50; i++) html += makeConfetti(i);
      confettiLayer.innerHTML = html;
    }

    const balloonColors = [
      "#ff6b6b",
      "#ffd93d",
      "#6bcb77",
      "#4d96ff",
      "#c77dff",
      "#ff9f43",
      "#ff6bff",
      "#43aa8b",
    ];
    const bl = document.getElementById("bday-balloon-layer");
    if (bl) {
      let html = "";
      for (let i = 0; i < 10; i++) {
        const color = balloonColors[i % balloonColors.length];
        const x = 2 + i * 10 + Math.random() * 5;
        const dur = 4 + Math.random() * 5;
        const size = 28 + Math.random() * 22;
        html += makeBalloon(color, x, dur, size);
      }
      bl.innerHTML = html;
    }
  }

  _closePopup() {
    const overlay = document.getElementById("bday-overlay");
    const popup = document.getElementById("bday-popup");
    if (popup) popup.classList.remove("bday-popup-active");
    if (overlay) {
      overlay.classList.remove("bday-overlay-active");
      setTimeout(() => {
        const root = document.getElementById("bday-popup-root");
        if (root) root.remove();
      }, 600);
    }
  }
}

export const birthdayNotificationService = {
  name: "birthday_notification",
  dependencies: ["orm", "notification"],
  start(env, deps) {
    return new BirthdayNotificationService(env, deps);
  },
};

registry
  .category("services")
  .add("birthday_notification", birthdayNotificationService);