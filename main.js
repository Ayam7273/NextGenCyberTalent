/* GCTI — main.js */

// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
}, { passive: true });

// ── Hamburger / Mobile menu ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('.mobile-link, .btn-mobile-apply').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ── Scroll reveal ──
const revealEls = document.querySelectorAll('.reveal, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

// ── Phase accordion (programme page) ──
const phases = document.querySelectorAll('.programme-phase');
phases.forEach(phase => {
  const header = phase.querySelector('.phase-header');
  if (!header) return;
  header.addEventListener('click', () => {
    const isOpen = phase.classList.contains('open');
    // Close all
    phases.forEach(p => p.classList.remove('open'));
    // Toggle clicked
    if (!isOpen) phase.classList.add('open');
  });
});

// ── Policy tabs (policies page) ──
const tabs = document.querySelectorAll('.policy-tab');
const panels = document.querySelectorAll('.policy-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(target);
    if (panel) {
      panel.classList.add('active');
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Hash-based tab on policies page ──
if (window.location.hash && document.querySelector('.policy-tab')) {
  const hash = window.location.hash.replace('#', '');
  const matchTab = document.querySelector(`[data-tab="${hash}"]`);
  if (matchTab) {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    matchTab.classList.add('active');
    const panel = document.getElementById(hash);
    if (panel) panel.classList.add('active');
  }
}

// ── Contact form ──
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector(".btn-submit");
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending...";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: contactForm.firstName.value,
          lastName: contactForm.lastName.value,
          email: contactForm.email.value,
          enquiryType: contactForm.enquiryType.value,
          message: contactForm.message.value,
          "g-recaptcha-response": grecaptcha.getResponse(),
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to send"
        );
      }

      submitBtn.innerHTML = "✓ Message Sent";
      contactForm.reset();
    } catch (error) {
      console.error(error);
      submitBtn.innerHTML = "Failed. Try Again";
    } finally {
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }, 2500);
    }
  });
}

// ── Animate stat numbers on scroll ──
const statNums = document.querySelectorAll('.stat-num');
const numObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const raw = el.textContent.replace(/[^0-9]/g, '');
    if (!raw) return;
    const target = parseInt(raw);
    const suffix = el.textContent.replace(raw, '');
    let start = 0;
    const duration = 1200;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    numObserver.unobserve(el);
  });
}, { threshold: 0.5 });

statNums.forEach(el => numObserver.observe(el));

// ── Active nav link detection ──
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});

// ── Apply modal multi-step form (all pages) ──
const ensureApplyModal = () => {
  const existing = document.getElementById('applyModal');
  if (existing) return existing;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="modal" id="applyModal" aria-hidden="true">
      <div class="modal-overlay" onclick="closeApplyModal()"></div>
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="applyModalTitle">
        <button class="modal-close" onclick="closeApplyModal()" aria-label="Close modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6L18 18"/>
          </svg>
        </button>

        <div class="modal-header">
          <h2 id="applyModalTitle">Global Cyber Talent Application Form</h2>
          <p>Complete this short application so we can understand your readiness, motivation, and fit for the programme.</p>
        </div>

        <form action="/api/apply" method="POST" enctype="multipart/form-data" id="applyForm">
          <div class="apply-progress">
            <div class="apply-progress-track">
              <div class="apply-progress-line" aria-hidden="true">
                <div class="apply-progress-line-fill" id="applyProgressBarFill"></div>
              </div>
              <div class="apply-progress-steps">
                <span class="apply-progress-dot" data-step="0"><span class="apply-progress-num">1</span></span>
                <span class="apply-progress-dot" data-step="1"><span class="apply-progress-num">2</span></span>
                <span class="apply-progress-dot" data-step="2"><span class="apply-progress-num">3</span></span>
                <span class="apply-progress-dot" data-step="3"><span class="apply-progress-num">4</span></span>
              </div>
            </div>
            <p class="apply-progress-label" id="applyProgressLabel" aria-live="polite">Step 1 of 4 - Programme Introduction & Personal Details</p>
          </div>

          <div class="apply-form-message" id="applyFormMessage" role="alert" aria-live="assertive" hidden></div>

          <div class="apply-steps">
            <div class="apply-step" data-step-index="0" data-step-title="Programme Introduction & Personal Details">
              <div class="apply-step-header">
                <span class="apply-step-pill">Step 1</span>
                <h3>Programme Introduction</h3>
                <p>The Global Cyber Talent Initiative is a high-quality skills programme designed to develop a diverse, industry-ready pipeline of future cybersecurity professionals. Please complete all required fields accurately.</p>
              </div>

              <div class="apply-step-grid">
                <div class="form-group">
                  <label for="fullName">Full Name <em>*</em></label>
                  <input type="text" id="fullName" name="fullName" required placeholder="John Doe">
                </div>

                <div class="form-group">
                  <label for="email">Email Address <em>*</em></label>
                  <input type="email" id="email" name="email" required placeholder="john@example.com">
                </div>

                <div class="form-group">
                  <label for="phone">Phone Number <em>*</em></label>
                  <input type="tel" id="phone" name="phone" required placeholder="+44 7123 456 789">
                  <small class="field-help">Include country code if outside the UK.</small>
                </div>
              </div>

              <div class="apply-step-actions">
                <button type="button" class="btn btn-secondary apply-back" data-step="0" disabled>Back</button>
                <button type="button" class="btn btn-primary apply-next" data-step="0">Next</button>
              </div>
            </div>

            <div class="apply-step" data-step-index="1" data-step-title="Experience & Motivation">
              <div class="apply-step-header">
                <span class="apply-step-pill">Step 2</span>
                <h3>Experience & Motivation</h3>
                <p>Tell us where you are today and why this programme is the right next step for you.</p>
              </div>

              <div class="apply-step-grid">
                <div class="form-group">
                  <label for="experienceLevel">Current Experience Level <em>*</em></label>
                  <select id="experienceLevel" name="experienceLevel" required>
                    <option value="">Select your experience level</option>
                    <option value="beginner">Beginner (0-1 year)</option>
                    <option value="intermediate">Intermediate (1-3 years)</option>
                    <option value="advanced">Advanced (3+ years)</option>
                    <option value="career-changer">Career-changer (no prior experience but motivated)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="motivation">Why do you want to join this programme? <em>*</em></label>
                  <textarea id="motivation" name="motivation" rows="5" required placeholder="Tell us about your motivation, interest in cybersecurity, and how this programme supports your goals..."></textarea>
                  <small class="field-help">Minimum 50 characters.</small>
                </div>

                <div class="form-group">
                  <label for="startTimeframe">When can you start? <em>*</em></label>
                  <select id="startTimeframe" name="startTimeframe" required>
                    <option value="">Select your availability</option>
                    <option value="immediately">Immediately</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="3-months">Within 3 months</option>
                    <option value="specific-date">On a specific date (please specify)</option>
                  </select>
                </div>

                <div class="form-group hidden" id="startDateRow">
                  <label for="startDateSpecific">Preferred start date</label>
                  <input type="date" id="startDateSpecific" name="startDateSpecific">
                </div>
              </div>

              <div class="apply-step-actions">
                <button type="button" class="btn btn-secondary apply-back" data-step="1">Back</button>
                <button type="button" class="btn btn-primary apply-next" data-step="1">Next</button>
              </div>
            </div>

            <div class="apply-step" data-step-index="2" data-step-title="Funding & Sponsorship">
              <div class="apply-step-header">
                <span class="apply-step-pill">Step 3</span>
                <h3>Funding & Sponsorship</h3>
                <p>Let us know how you plan to fund your participation and whether any sponsorship is in place or being explored.</p>
              </div>

              <div class="apply-step-grid">
                <div class="form-group">
                  <label for="fundingStatus">Funding Status <em>*</em></label>
                  <select id="fundingStatus" name="fundingStatus" required>
                    <option value="">How will your participation be funded?</option>
                    <option value="self-funded">Self-funded (I will cover my own training costs)</option>
                    <option value="employer-sponsored">Employer-sponsored</option>
                    <option value="other-sponsored">Sponsored by another organisation</option>
                    <option value="not-confirmed">Not yet confirmed (I am exploring funding options)</option>
                  </select>
                </div>

                <div class="form-group hidden" id="sponsorshipDetailsRow">
                  <label for="sponsorshipDetails">Sponsorship Details <em>*</em></label>
                  <textarea id="sponsorshipDetails" name="sponsorshipDetails" rows="4" placeholder="Please provide the name of the sponsoring organisation and the primary contact person (if known)."></textarea>
                </div>

                <div class="form-group">
                  <label>Affordability Considerations <em>*</em></label>
                  <div class="affordability-grid" role="group" aria-label="Affordability considerations">
                    <label class="affordability-option">
                      <input type="checkbox" name="affordability" value="payment-plan" data-label="I may require a payment plan">
                      <span class="affordability-card">
                        <span class="affordability-text">
                          <span class="affordability-desc">I may require a payment plan.</span>
                        </span>
                      </span>
                    </label>
                    <label class="affordability-option">
                      <input type="checkbox" name="affordability" value="partial-sponsorship" data-label="I may require partial sponsorship">
                      <span class="affordability-card">
                        <span class="affordability-text">
                          <span class="affordability-desc">I may require partial sponsorship.</span>
                        </span>
                      </span>
                    </label>
                    <label class="affordability-option">
                      <input type="checkbox" name="affordability" value="external-funding" data-label="I am exploring external funding options">
                      <span class="affordability-card">
                        <span class="affordability-text">
                          <span class="affordability-desc">I am exploring external funding options.</span>
                        </span>
                      </span>
                    </label>
                    <label class="affordability-option affordability-option-neutral">
                      <input type="checkbox" name="affordability" value="no-concerns" data-label="I have no affordability concerns">
                      <span class="affordability-card">
                        <span class="affordability-text">
                          <span class="affordability-desc">I have no affordability concerns.</span>
                        </span>
                      </span>
                    </label>
                    <label class="affordability-option affordability-option-neutral">
                      <input type="checkbox" name="affordability" value="prefer-not-to-say" data-label="Prefer not to say">
                      <span class="affordability-card">
                        <span class="affordability-text">
                          <span class="affordability-desc">Prefer not to say.</span>
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <label for="sponsorshipFile">Sponsorship Documentation</label>
                  <input type="file" id="sponsorshipFile" name="sponsorshipFile" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                  <small class="field-help">Upload up to 1 file (PDF or DOCX) if you already have sponsorship confirmation or supporting documentation (Optional).</small>
                </div>
              </div>

              <div class="apply-step-actions">
                <button type="button" class="btn btn-secondary apply-back" data-step="2">Back</button>
                <button type="button" class="btn btn-primary apply-next" data-step="2">Next</button>
              </div>
            </div>

            <div class="apply-step" data-step-index="3" data-step-title="Review & Submit">
              <div class="apply-step-header">
                <span class="apply-step-pill">Step 4</span>
                <h3>Review & Submit</h3>
                <p>Please review your responses before submitting. Once submitted, you will receive a confirmation email and details about next steps.</p>
              </div>

              <div class="apply-review-card">
                <h4>Your Details</h4>
                <div class="apply-review-grid">
                  <div><span class="review-label">Full Name</span><span class="review-value" id="reviewFullName"></span></div>
                  <div><span class="review-label">Email</span><span class="review-value" id="reviewEmail"></span></div>
                  <div><span class="review-label">Phone</span><span class="review-value" id="reviewPhone"></span></div>
                  <div><span class="review-label">Experience Level</span><span class="review-value" id="reviewExperience"></span></div>
                  <div><span class="review-label">Start Timeline</span><span class="review-value" id="reviewStart"></span></div>
                  <div><span class="review-label">Funding Status</span><span class="review-value" id="reviewFunding"></span></div>
                  <div><span class="review-label">Affordability</span><span class="review-value" id="reviewAffordability"></span></div>
                  <div><span class="review-label">Sponsorship</span><span class="review-value" id="reviewSponsorship"></span></div>
                </div>
                <div class="apply-review-motivation">
                  <span class="review-label">Your Motivation</span>
                  <p id="reviewMotivation"></p>
                </div>
              </div>

              <div class="form-checkbox">
                <input type="checkbox" id="consent" name="consent" required>
                <label for="consent">I agree to receive communications about the programme and confirm that I understand the time commitment and participation requirements. *</label>
              </div>
              <div class="form-checkbox">
                <input type="checkbox" id="declaration" name="declaration" required>
                <label for="declaration">I confirm that the information provided in this application is accurate to the best of my knowledge. *</label>
              </div>

              <div class="apply-step-actions">
                <button type="button" class="btn btn-secondary apply-back" data-step="3">Back</button>
                <button type="submit" class="btn btn-primary btn-large">Submit Application</button>
              </div>
              <p class="form-note">Your information is secure and will never be shared. We'll review your application and get back to you within 48 hours.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
  const modal = wrapper.firstElementChild;
  if (modal) document.body.appendChild(modal);
  return modal;
};

const ensureApplySuccessModal = () => {
  const existing = document.getElementById('applySuccessModal');
  if (existing) return existing;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="modal" id="applySuccessModal" aria-hidden="true">
      <div class="modal-overlay" onclick="closeApplySuccessModal()"></div>
      <div class="modal-content apply-success-content" role="dialog" aria-modal="true" aria-labelledby="applySuccessTitle">
        <button class="modal-close" onclick="closeApplySuccessModal()" aria-label="Close success modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6L18 18"/>
          </svg>
        </button>

        <div class="apply-success-badge" aria-hidden="true">✓</div>
        <div class="apply-success-orbs" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>

        <h3 id="applySuccessTitle">Application Received</h3>
        <p id="applySuccessText">Thanks! Your application has been submitted successfully.</p>
        <p class="apply-success-subtext">Our admissions team will review your details and contact you within 48 hours with the next steps.</p>
      </div>
    </div>
  `;
  const modal = wrapper.firstElementChild;
  if (modal) document.body.appendChild(modal);
  return modal;
};

const applyModal = ensureApplyModal();
const applySuccessModal = ensureApplySuccessModal();
const applyForm = document.getElementById('applyForm');
const applyOpenButtons = document.querySelectorAll('[data-open-apply-modal]');

if (applyModal && applyForm) {
  const applyEndpoint = '/api/apply';
  applyForm.setAttribute('action', applyEndpoint);
  applyForm.setAttribute('method', 'POST');

  let currentApplyStep = 0;
  const applySteps = Array.from(applyForm.querySelectorAll('.apply-step'));
  const progressDots = Array.from(applyForm.querySelectorAll('.apply-progress-dot'));
  const progressFill = document.getElementById('applyProgressBarFill');
  const progressLabel = document.getElementById('applyProgressLabel');
  const formMessage = document.getElementById('applyFormMessage');
  const startTimeframe = document.getElementById('startTimeframe');
  const startDateRow = document.getElementById('startDateRow');
  const startDateSpecific = document.getElementById('startDateSpecific');
  const fundingStatus = document.getElementById('fundingStatus');
  const sponsorshipDetailsRow = document.getElementById('sponsorshipDetailsRow');
  const sponsorshipDetails = document.getElementById('sponsorshipDetails');
  const motivation = document.getElementById('motivation');

  const reviewTargets = {
    reviewFullName: document.getElementById('reviewFullName'),
    reviewEmail: document.getElementById('reviewEmail'),
    reviewPhone: document.getElementById('reviewPhone'),
    reviewExperience: document.getElementById('reviewExperience'),
    reviewStart: document.getElementById('reviewStart'),
    reviewFunding: document.getElementById('reviewFunding'),
    reviewAffordability: document.getElementById('reviewAffordability'),
    reviewSponsorship: document.getElementById('reviewSponsorship'),
    reviewMotivation: document.getElementById('reviewMotivation')
  };

  const resolveText = (id, fallback = 'Not provided') => {
    const el = document.getElementById(id);
    if (!el) return fallback;
    if (el.tagName === 'SELECT') {
      return el.options[el.selectedIndex]?.text || fallback;
    }
    return (el.value || '').trim() || fallback;
  };

  const showApplyMessage = (message) => {
    if (!formMessage) return;
    formMessage.hidden = false;
    formMessage.textContent = message;
  };

  const clearApplyMessage = () => {
    if (!formMessage) return;
    formMessage.hidden = true;
    formMessage.textContent = '';
  };

  const updateProgress = () => {
    const total = applySteps.length;
    const percentage = total > 1 ? (currentApplyStep / (total - 1)) * 100 : 0;
    if (progressFill) progressFill.style.width = `${percentage}%`;

    progressDots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === currentApplyStep);
      dot.classList.toggle('is-complete', index < currentApplyStep);
    });

    const title = applySteps[currentApplyStep]?.dataset.stepTitle || 'Application';
    if (progressLabel) progressLabel.textContent = `Step ${currentApplyStep + 1} of ${total} - ${title}`;
  };

  const syncConditionalFields = () => {
    const startSpecific = startTimeframe?.value === 'specific-date';
    if (startDateRow) startDateRow.classList.toggle('hidden', !startSpecific);
    if (startDateSpecific) startDateSpecific.required = startSpecific;

    const sponsored = fundingStatus?.value === 'employer-sponsored' || fundingStatus?.value === 'other-sponsored';
    if (sponsorshipDetailsRow) sponsorshipDetailsRow.classList.toggle('hidden', !sponsored);
    if (sponsorshipDetails) sponsorshipDetails.required = sponsored;
  };

  const updateReview = () => {
    if (reviewTargets.reviewFullName) reviewTargets.reviewFullName.textContent = resolveText('fullName');
    if (reviewTargets.reviewEmail) reviewTargets.reviewEmail.textContent = resolveText('email');
    if (reviewTargets.reviewPhone) reviewTargets.reviewPhone.textContent = resolveText('phone', 'Not provided');
    if (reviewTargets.reviewExperience) reviewTargets.reviewExperience.textContent = resolveText('experienceLevel');
    if (reviewTargets.reviewStart) {
      const start = resolveText('startTimeframe');
      const specificDate = resolveText('startDateSpecific', '');
      reviewTargets.reviewStart.textContent = specificDate ? `${start} (${specificDate})` : start;
    }
    if (reviewTargets.reviewFunding) reviewTargets.reviewFunding.textContent = resolveText('fundingStatus');

    const affordability = Array.from(applyForm.querySelectorAll('input[name="affordability"]:checked'))
      .map((input) => input.dataset.label || input.value);
    if (reviewTargets.reviewAffordability) {
      reviewTargets.reviewAffordability.textContent = affordability.length ? affordability.join(', ') : 'None selected';
    }

    if (reviewTargets.reviewSponsorship) {
      reviewTargets.reviewSponsorship.textContent = (sponsorshipDetails?.value || '').trim() || 'Not provided';
    }
    if (reviewTargets.reviewMotivation) {
      reviewTargets.reviewMotivation.textContent = (motivation?.value || '').trim() || 'Not provided';
    }
  };

  const setApplyStep = (targetStep) => {
    currentApplyStep = Math.max(0, Math.min(targetStep, applySteps.length - 1));
    applySteps.forEach((step, index) => {
      step.classList.toggle('is-active', index === currentApplyStep);
    });
    if (currentApplyStep === applySteps.length - 1) {
      updateReview();
    }
    updateProgress();
    clearApplyMessage();
  };

  const validateStep = (stepIndex) => {
    const step = applySteps[stepIndex];
    if (!step) return true;
    const fields = Array.from(step.querySelectorAll('input, select, textarea')).filter((field) => {
      if (field.type === 'button' || field.type === 'submit') return false;
      return field.offsetParent !== null;
    });

    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        showApplyMessage('Please complete all required fields before continuing.');
        return false;
      }
    }

    const motivationValue = (motivation?.value || '').trim();
    if (stepIndex === 1 && motivationValue.length < 50) {
      showApplyMessage('Your motivation response must be at least 50 characters.');
      motivation?.focus();
      return false;
    }

    return true;
  };

  const openApplyModal = () => {
    applyModal.classList.add('is-open');
    applyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    syncConditionalFields();
    setApplyStep(0);
  };

  const closeModal = () => {
    applyModal.classList.remove('is-open');
    applyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const openApplySuccessModal = (name = 'there') => {
    const successText = document.getElementById('applySuccessText');
    if (successText) {
      successText.textContent = `Thanks ${name}! Your application has been submitted successfully.`;
    }
    if (!applySuccessModal) return;
    applySuccessModal.classList.add('is-open');
    applySuccessModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeApplySuccessModal = () => {
    if (!applySuccessModal) return;
    applySuccessModal.classList.remove('is-open');
    applySuccessModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  window.closeApplyModal = closeModal;
  window.openApplyModal = openApplyModal;
  window.closeApplySuccessModal = closeApplySuccessModal;

  applyOpenButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openApplyModal();
      mobileMenu?.classList.remove('open');
      hamburger?.classList.remove('open');
    });
  });

  applyForm.querySelectorAll('.apply-next').forEach((button) => {
    button.addEventListener('click', () => {
      if (!validateStep(currentApplyStep)) return;
      setApplyStep(currentApplyStep + 1);
    });
  });

  applyForm.querySelectorAll('.apply-back').forEach((button) => {
    button.addEventListener('click', () => setApplyStep(currentApplyStep - 1));
  });

  startTimeframe?.addEventListener('change', syncConditionalFields);
  fundingStatus?.addEventListener('change', syncConditionalFields);

  applyModal.addEventListener('click', (event) => {
    if (event.target === applyModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && applyModal.classList.contains('is-open')) {
      closeModal();
    }
    if (event.key === 'Escape' && applySuccessModal?.classList.contains('is-open')) {
      closeApplySuccessModal();
    }
  });

  applyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateStep(currentApplyStep)) return;

    const submitBtn = applyForm.querySelector('button[type="submit"]');
    const originalSubmitText = submitBtn?.textContent || 'Submit Application';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    clearApplyMessage();

    try {
      // ── FIXED: Safely drop empty file element from FormData payload generation ──
      const fileInput = document.getElementById('sponsorshipFile');
      if (fileInput && fileInput.files.length === 0) {
        fileInput.removeAttribute('name');
      }

      const formData = new FormData(applyForm);

      // Restore attribute layout completely right after generation
      if (fileInput) {
        fileInput.setAttribute('name', 'sponsorshipFile');
      }

      const response = await fetch(applyEndpoint, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit application.');
      }

      closeModal();
      openApplySuccessModal(formData.get('fullName') || 'there');
      applyForm.reset();
    } catch (error) {
      console.error(error);
      showApplyMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalSubmitText;
      }
    }
  });
}