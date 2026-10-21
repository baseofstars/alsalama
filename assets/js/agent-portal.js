/**
 * Alsalama B2B Agent Portal - Interactive Mockup Logic
 * Features: Dynamic Canvas Captcha, Device Trust Selection, 
 * Mock Authentication, Announcements Filter & Reader, Modals & Live Dubai Clock
 */

(function () {
  'use strict';

  // State
  let currentCaptchaCode = '';

  // DOM Elements
  const captchaCanvas = document.getElementById('captchaCanvas');
  const btnRefreshCaptcha = document.getElementById('btnRefreshCaptcha');
  const captchaInput = document.getElementById('captchaInput');
  const userIdInput = document.getElementById('userIdInput');
  const passwordInput = document.getElementById('passwordInput');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const agentLoginForm = document.getElementById('agentLoginForm');
  const btnLoginSubmit = document.getElementById('btnLoginSubmit');
  const deviceCards = document.querySelectorAll('.device-card-option');
  const trustHint = document.getElementById('deviceTrustHint');
  const btnDemoAutofill = document.getElementById('btnDemoAutofill');

  // Modals
  const successModal = document.getElementById('agentSuccessModal');
  const forgotModal = document.getElementById('agentForgotModal');
  const termsModal = document.getElementById('agentTermsModal');
  const bulletinModal = document.getElementById('agentBulletinModal');
  const liveClockEl = document.getElementById('liveClock');

  /* ==========================================================================
     1. Live Dubai Clock (UTC+4)
     ========================================================================== */
  function updateDubaiClock() {
    if (!liveClockEl) return;
    const now = new Date();
    // Format in Dubai Time (GST, UTC+4)
    const options = {
      timeZone: 'Asia/Dubai',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    liveClockEl.textContent = now.toLocaleTimeString('en-US', options) + ' (GST)';
  }
  setInterval(updateDubaiClock, 1000);
  updateDubaiClock();

  /* ==========================================================================
     2. Canvas Captcha Generator (Distorted styled text + Noise like original)
     ========================================================================== */
  function generateCaptcha() {
    if (!captchaCanvas) return;
    const ctx = captchaCanvas.getContext('2d');
    const width = captchaCanvas.width;
    const height = captchaCanvas.height;

    // Generate 4-character code (mix of digits and uppercase letters, similar to legacy "6 5 9")
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptchaCode = code;

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Random noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = ['#cbd5e1', '#94a3b8', '#38bdf8', '#fb923c', '#a855f7'][i % 5];
      ctx.lineWidth = Math.random() * 1.5 + 0.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = ['#64748b', '#cbd5e1', '#0ea5e9', '#ec4899'][i % 4];
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render characters with varying angles, colors, and fonts
    const colors = ['#0f766e', '#0369a1', '#7c3aed', '#b91c1c', '#c2410c'];
    ctx.font = 'bold 22px "Inter", "Courier New", monospace';
    ctx.textBaseline = 'middle';

    const charSpacing = width / (code.length + 1);
    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = (i + 1) * charSpacing;
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 20 - 10) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 2;
      ctx.fillText(code[i], -8, 0);
      ctx.restore();
    }

    // Cross strikethrough line (just like in the reference image)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, height * 0.7);
    ctx.lineTo(width - 10, height * 0.3);
    ctx.stroke();
  }

  // Refresh trigger
  if (btnRefreshCaptcha) {
    btnRefreshCaptcha.addEventListener('click', function (e) {
      e.preventDefault();
      generateCaptcha();
      if (captchaInput) {
        captchaInput.value = '';
        captchaInput.focus();
      }
      showToast('Captcha refreshed with new security code', 'info');
    });
  }
  if (captchaCanvas) {
    captchaCanvas.addEventListener('click', generateCaptcha);
  }

  // Initialize first captcha
  generateCaptcha();

  /* ==========================================================================
     3. Password Reveal / Hide Toggle
     ========================================================================== */
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      const icon = togglePasswordBtn.querySelector('i');
      if (icon) {
        if (type === 'text') {
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      }
    });
  }

  /* ==========================================================================
     4. Device Trust Selection (4 interactive options from image)
     ========================================================================== */
  const trustHints = {
    'nochange': 'Keep the previous setting as it is. If you have not set any, it will be treated as <em>Public or Shared Device</em>.',
    'public': '<strong>Public Device Selected:</strong> Session will strictly terminate after 15 minutes of idle time. Never save cookies or cache on shared cafe/airport terminals.',
    'trusted': '<strong>Trusted Office Device:</strong> Session remains authorized for 12 hours. Multi-factor checks are optimized for registered agency IP addresses.',
    'personal': '<strong>Personal Device:</strong> Fast 30-day token persistence for private agency laptops. Biometric/passkey quick login enabled.'
  };

  deviceCards.forEach(card => {
    card.addEventListener('click', function () {
      deviceCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const radio = this.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        const val = radio.value;
        if (trustHint && trustHints[val]) {
          trustHint.innerHTML = trustHints[val];
        }
      }
    });
  });

  /* ==========================================================================
     5. Quick Demo Credentials Autofill
     ========================================================================== */
  if (btnDemoAutofill) {
    btnDemoAutofill.addEventListener('click', function () {
      if (userIdInput) userIdInput.value = 'alsalama.agent@travelgds.ae';
      if (passwordInput) passwordInput.value = 'Alsalama#B2B2026';
      if (captchaInput) captchaInput.value = currentCaptchaCode;

      // Select Trusted Device
      const trustedOption = document.querySelector('.option-trusted');
      if (trustedOption) {
        trustedOption.click();
      }

      showToast('Demo agent credentials applied! Ready to login.', 'success');
    });
  }

  /* ==========================================================================
     6. Toast Notification Helper
     ========================================================================== */
  function showToast(message, type = 'info') {
    let toast = document.querySelector('.portal-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'portal-toast';
      document.body.appendChild(toast);
    }

    toast.className = 'portal-toast';
    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'error') {
      toast.classList.add('toast-error');
      iconClass = 'fa-solid fa-circle-exclamation';
    } else if (type === 'success') {
      toast.classList.add('toast-success');
      iconClass = 'fa-solid fa-circle-check';
    }

    toast.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  /* ==========================================================================
     7. Form Validation & Login Submission - Show Invalid Credentials
     ========================================================================== */
  const loginAlertBox = document.getElementById('loginAlertBox');

  if (agentLoginForm) {
    agentLoginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Enter Authenticating State
      if (btnLoginSubmit) {
        btnLoginSubmit.classList.add('loading');
        btnLoginSubmit.disabled = true;
        btnLoginSubmit.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...`;
      }

      // Hide any previous alert while checking
      if (loginAlertBox) {
        loginAlertBox.classList.remove('show');
      }

      setTimeout(() => {
        // Reset Login Button
        if (btnLoginSubmit) {
          btnLoginSubmit.classList.remove('loading');
          btnLoginSubmit.disabled = false;
          btnLoginSubmit.innerHTML = `LOGIN <i class="fa-solid fa-arrow-right ms-2"></i>`;
        }

        // Display Inline Invalid Credentials Alert Box
        if (loginAlertBox) {
          loginAlertBox.classList.remove('show');
          void loginAlertBox.offsetWidth; // Trigger reflow for shake animation
          loginAlertBox.classList.add('show');
        }

        // Highlight inputs with error state
        if (userIdInput) userIdInput.classList.add('portal-input-error');
        if (passwordInput) {
          passwordInput.classList.add('portal-input-error');
          passwordInput.value = '';
          passwordInput.focus();
        }

        // Refresh captcha code for security
        generateCaptcha();
        if (captchaInput) {
          captchaInput.value = '';
        }

        // Display Toast Notification
        showToast('Invalid credentials. Please verify your User ID and Password.', 'error');
      }, 700);
    });

    // Remove error highlight on typing
    [userIdInput, passwordInput, captchaInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', function () {
          this.classList.remove('portal-input-error');
        });
      }
    });
  }

  /* ==========================================================================
     8. Modal Handling (Open, Close, Click Outside)
     ========================================================================== */
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('show');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', function () {
      const modal = this.closest('.portal-modal-backdrop');
      closeModal(modal);
    });
  });

  document.querySelectorAll('.portal-modal-backdrop').forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === this) {
        closeModal(this);
      }
    });
  });

  // Forgot Password Link Trigger
  const forgotTrigger = document.getElementById('forgotPasswordTrigger');
  if (forgotTrigger) {
    forgotTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(forgotModal);
    });
  }

  // Terms Link Trigger
  const termsTrigger = document.getElementById('termsModalTrigger');
  if (termsTrigger) {
    termsTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(termsModal);
    });
  }

  // Forgot Form Submit Simulation
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('forgotEmailInput').value.trim();
      if (!email) {
        showToast('Please enter your registered agent email', 'error');
        return;
      }
      closeModal(forgotModal);
      showToast(`Password reset link & OTP sent to ${email}`, 'success');
    });
  }

  /* ==========================================================================
     9. Notice Bulletin Reader & Filtering
     ========================================================================== */
  const bulletinData = {
    '1': {
      category: 'General',
      badgeClass: 'tag-general',
      title: 'Our Contact Information and office timing',
      date: '22 Jul 2023 11:10',
      ref: 'ALS/CIR/2023-07/44',
      content: `
        <p>Dear Valued Travel Partners,</p>
        <p>Please note our updated business hours and direct emergency escalations for the B2B ticketing and inbound visa processing desk:</p>
        <ul>
          <li><strong>Office Timing:</strong> Sunday to Friday: 8:00 AM – 7:00 PM (GST)</li>
          <li><strong>Saturday:</strong> Skeleton Support Desk (10:00 AM – 4:00 PM)</li>
          <li><strong>Visa Emergency Escalations:</strong> +971 55 246 5030 (WhatsApp 24/7)</li>
          <li><strong>General Enquiries:</strong> alsalamatourism@gmail.com</li>
          <li><strong>Physical Address:</strong> Office 304, Al Wahda Bldg, Port Saeed, Deira, Dubai, UAE</li>
        </ul>
        <p>Thank you for your continuous support and cooperation.</p>
      `
    },
    '2': {
      category: 'Visa',
      badgeClass: 'tag-visa',
      title: 'UAE VISA EXTENSION UPDATE',
      date: '24 Dec 2022 12:53',
      ref: 'ALS/VISA/REG-901',
      content: `
        <p>Attention All B2B Travel Agencies & Visa Coordinators,</p>
        <p>In accordance with the latest directives issued by the Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) and GDRFA Dubai:</p>
        <div class="alert alert-warning p-3 mb-3" style="font-size: 13.5px;">
          <strong>Critical Notice:</strong> In-country visit visa extensions must be submitted at least 48 hours prior to the expiry of the current entry permit to avoid overstay penalty fines.
        </div>
        <ul>
          <li><strong>30-Day Extension:</strong> Available directly via Alsalama B2B Portal with instant quota approval.</li>
          <li><strong>60-Day Extension:</strong> Requires passport copy with minimum 6-month validity and applicant return ticket booking.</li>
          <li><strong>Airport-to-Airport (A2A) Change:</strong> Daily chartered seats operating to Muscat (MCT) and Kish Island (KIH).</li>
        </ul>
        <p>Kindly verify client passport validity and UID numbers before submitting new requests.</p>
      `
    },
    '3': {
      category: 'Tourism',
      badgeClass: 'tag-tourism',
      title: 'New Umrah & Dubai Combo B2B Net Rates Released',
      date: '18 Oct 2026 14:20',
      ref: 'ALS/PKG/2026-Q4-08',
      content: `
        <p>Respected Partner Agents,</p>
        <p>We are delighted to introduce exclusive subsidized B2B Net Rates for combined Dubai Stopover + Umrah Packages for the upcoming season:</p>
        <ul>
          <li><strong>Dubai City Discovery (3N/4D):</strong> 4-Star Downtown Accommodation, Desert Safari with BBQ Dinner, Burj Khalifa 124th Floor At The Top ticket, and Luxury Marina Dhow Cruise.</li>
          <li><strong>Makkah & Madinah Premium Shuttles:</strong> Direct VIP bus transfers and 5-star hotel options facing Haram Sharif.</li>
          <li><strong>Instant Confirmation:</strong> Real-time room inventory holds available through your Agent Portal Wallet.</li>
        </ul>
      `
    },
    '4': {
      category: 'System',
      badgeClass: 'tag-system',
      title: 'Fast-track E-Visa Portal API v3.2 Available',
      date: '02 Oct 2026 09:15',
      ref: 'TECH/BOS/v3.2',
      content: `
        <p>Notice to Agency IT Administrators,</p>
        <p>Base of Stars Portal Engine has upgraded the B2B Gateway to v3.2 with high-throughput asynchronous document processing:</p>
        <ul>
          <li>Passport MRZ auto-scan accuracy enhanced to 99.8%.</li>
          <li>Instant SMS & WhatsApp delivery of approved e-visas directly to passenger contact numbers.</li>
          <li>Webhook callbacks enabled for automated ERP and accounting reconciliation.</li>
        </ul>
      `
    }
  };

  // Click on any bulletin item to view details
  document.querySelectorAll('.bulletin-item').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const id = this.getAttribute('data-bulletin-id');
      const data = bulletinData[id];
      if (!data) return;

      const titleEl = document.getElementById('bulletinModalTitle');
      const badgeEl = document.getElementById('bulletinModalTag');
      const dateEl = document.getElementById('bulletinModalDate');
      const refEl = document.getElementById('bulletinModalRef');
      const bodyEl = document.getElementById('bulletinModalBody');

      if (titleEl) titleEl.textContent = data.title;
      if (badgeEl) {
        badgeEl.textContent = data.category;
        badgeEl.className = `bulletin-tag ${data.badgeClass}`;
      }
      if (dateEl) dateEl.textContent = data.date;
      if (refEl) refEl.textContent = 'Ref: ' + data.ref;
      if (bodyEl) bodyEl.innerHTML = data.content;

      openModal(bulletinModal);
    });
  });

  // Filter tabs for bulletins
  const filterBtns = document.querySelectorAll('.bulletin-tab-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.getAttribute('data-filter');
      document.querySelectorAll('.bulletin-item').forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

})();
