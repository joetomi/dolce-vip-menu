/**
 * Dolce Sky - نظام تقييم تجربة الزبائن المتسلسل
 * عرض كل سؤال على حدة - راديو SVG مخصص - أنيميشن اختفاء وظهور تدريجي ناعم
 */

(function () {
  function initFeedback() {
    const form = document.getElementById('feedback-form');
    if (!form) return;

    const progressWrapper = document.getElementById('survey-progress-wrapper');
    const progressFill = document.getElementById('survey-progress-fill');
    const stepCounter = document.getElementById('survey-step-counter');
    const backBtn = document.getElementById('survey-back-btn');
    const dots = document.querySelectorAll('.survey-dot');
    const commentInput = document.getElementById('feedbackComment');
    const charCounter = document.getElementById('char-current');
    const submitBtn = document.getElementById('submit-feedback-btn');
    const alertBox = document.getElementById('feedback-alert');
    const successCard = document.getElementById('feedback-success-state');
    const resetBtn = document.getElementById('reset-feedback-btn');

    const totalSteps = 5;
    let currentStep = 1;
    let isTransitioning = false;

    // ربط خيارات الأسئلة
    const options = form.querySelectorAll('.survey-option');
    options.forEach(option => {
      const radio = option.querySelector('input[type="radio"]');
      if (!radio) return;

      option.addEventListener('click', (e) => {
        e.preventDefault();
        if (isTransitioning) return;

        // إزالة التحديد من باقي خيارات هذا السؤال
        const groupName = radio.name;
        form.querySelectorAll(`input[name="${groupName}"]`).forEach(otherRadio => {
          const parent = otherRadio.closest('.survey-option');
          if (parent) parent.classList.remove('selected');
          otherRadio.checked = false;
        });

        // 1. أكشن الاختيار البصري الفوري
        radio.checked = true;
        option.classList.add('selected');

        // 2. بعد أن يرى الزبون اختياره بوضوح (300ms)، يبدأ انتقال السؤال والتقدم
        if (currentStep < totalSteps) {
          setTimeout(() => {
            goToStep(currentStep + 1, 'forward');
          }, 300);
        }
      });
    });

    // تحديث خط ونقاط التقدم بسلاسة
    function updateProgress(step) {
      // يبدأ من النقطة الأولى (0%) وينتقل تدريجياً عبر 25%، 50%، 75%، 100%
      const percentage = ((step - 1) / (totalSteps - 1)) * 100;
      if (progressFill) {
        progressFill.style.width = `${percentage}%`;
      }

      if (stepCounter) {
        if (step < totalSteps) {
          stepCounter.textContent = `السؤال ${step} من ${totalSteps}`;
        } else {
          stepCounter.textContent = `الخطوة 5 من 5 (تفاصيل إضافية)`;
        }
      }

      dots.forEach((dot, idx) => {
        const dotStep = idx + 1;
        dot.classList.toggle('completed', dotStep < step);
        dot.classList.toggle('active', dotStep === step);
      });

      if (backBtn) {
        backBtn.style.display = step > 1 ? 'inline-flex' : 'none';
      }
    }

    // الانتقال بين الأسئلة بأنيميشن اختفاء وظهور تدريجي
    function goToStep(targetStep, direction = 'forward') {
      if (targetStep < 1 || targetStep > totalSteps || targetStep === currentStep || isTransitioning) {
        return;
      }

      isTransitioning = true;
      const currentElem = document.getElementById(`survey-step-${currentStep}`);
      const nextElem = document.getElementById(`survey-step-${targetStep}`);

      if (!currentElem || !nextElem) {
        isTransitioning = false;
        return;
      }

      // تحريك خط التقدم في نفس وقت بدء الانتقال لتناغم بصري كامل
      updateProgress(targetStep);

      // 1. اختفاء السؤال الحالي تدريجياً (Fade Out)
      currentElem.classList.remove('active');
      currentElem.classList.add(direction === 'forward' ? 'fade-out-up' : 'fade-out-down');

      setTimeout(() => {
        currentElem.style.display = 'none';
        currentElem.classList.remove('fade-out-up', 'fade-out-down');

        // 2. ظهور السؤال التالي تدريجياً (Fade In)
        nextElem.style.display = 'block';
        nextElem.classList.add(direction === 'forward' ? 'fade-in-from-down' : 'fade-in-from-up');

        void nextElem.offsetHeight; // Reflow

        nextElem.classList.remove('fade-in-from-down', 'fade-in-from-up');
        nextElem.classList.add('active');

        currentStep = targetStep;

        if (progressWrapper) {
          progressWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        isTransitioning = false;
      }, 240);
    }

    // زر العودة للسؤال السابق
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep > 1) {
          goToStep(currentStep - 1, 'backward');
        }
      });
    }

    // عداد الحروف للملاحظات
    if (commentInput && charCounter) {
      commentInput.addEventListener('input', () => {
        charCounter.textContent = commentInput.value.length;
      });
    }

    function showError(message) {
      if (!alertBox) return;
      alertBox.textContent = message;
      alertBox.className = 'feedback-alert feedback-alert--error';
      alertBox.style.display = 'block';
    }

    function hideAlert() {
      if (!alertBox) return;
      alertBox.style.display = 'none';
      alertBox.textContent = '';
    }

    // إرسال التقييم
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const comment = commentInput ? commentInput.value.trim() : '';
      if (comment.length > 500) {
        showError('الملاحظات يجب ألا تتجاوز 500 حرف.');
        return;
      }

      const getVal = (name) => {
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : 'غير محدد';
      };

      const tableInput = document.getElementById('tableNumber');
      const nameInput = document.getElementById('customerName');

      const payload = {
        serviceSpeed: getVal('serviceSpeed'),
        foodQuality: getVal('foodQuality'),
        staffService: getVal('staffService'),
        cleanliness: getVal('cleanliness'),
        tableNumber: tableInput ? tableInput.value.trim() : '',
        name: nameInput ? nameInput.value.trim() : '',
        comment: comment
      };

      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.ok) {
          form.style.display = 'none';
          if (progressWrapper) progressWrapper.style.display = 'none';
          if (successCard) {
            successCard.style.display = 'block';
            successCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else {
          showError(data.error || 'تعذر إرسال التقييم حالياً، يرجى المحاولة بعد قليل.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        showError('تعذر الاتصال بالسيرفر. يرجى التأكد من اتصالك بالإنترنت والمحاولة مجدداً.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
      }
    });

    // زر إرسال تقييم جديد
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        if (charCounter) charCounter.textContent = '0';

        // إلغاء تحديد كافة الخيارات
        form.querySelectorAll('.survey-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        form.querySelectorAll('input[type="radio"]').forEach(r => {
          r.checked = false;
        });

        for (let i = 1; i <= totalSteps; i++) {
          const s = document.getElementById(`survey-step-${i}`);
          if (s) {
            s.style.display = i === 1 ? 'block' : 'none';
            s.classList.toggle('active', i === 1);
            s.classList.remove('fade-out-up', 'fade-out-down', 'fade-in-from-down', 'fade-in-from-up');
          }
        }

        currentStep = 1;
        updateProgress(1);
        hideAlert();

        if (progressWrapper) progressWrapper.style.display = 'block';
        if (successCard) successCard.style.display = 'none';
        form.style.display = 'block';
      });
    }

    // الحالة الابتدائية: النقطة الأولى فقط مضيئة وبداية الخط عند 0%
    updateProgress(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeedback);
  } else {
    initFeedback();
  }
})();
