const form = document.querySelector('#patient-enquiry-form');

if (form) {
  const locale = document.documentElement.lang === 'es' ? 'es' : 'en';
  const text = {
    en: {
      errors: {
        first_name: 'First name must contain only letters and be at least 2 characters',
        last_name: 'Last name must contain only letters and be at least 2 characters',
        date_of_birth: 'Enter a valid date of birth. Patient must be between 0 and 120 years old',
        email: 'Enter a valid email address (example: name@provider.com)',
        phone: 'Phone must include a country code (example: +1 305 555 0191)',
        preferred_language: 'Select your preferred language',
        preferred_clinic: 'Select the clinic you would like to visit',
        preferred_date: 'Select a date at least 1 business day from today and no more than 60 days ahead',
        preferred_time: 'Select your preferred time of day',
        service_type: 'Select the type of care you are looking for',
        paediatric: 'Paediatric Care is available for patients under 18. Please check the date of birth or select a different service.',
        new_patient: 'Please indicate whether this is your first visit to HealthCore',
        has_insurance: 'Please indicate whether you have health insurance',
        insurance_provider: 'Please enter your insurance provider name',
        insurance_member_id: 'Member ID must be between 6 and 20 alphanumeric characters',
        patient_id: 'Patient ID must match the format HC- followed by 6 letters or numbers',
        consent: 'You must consent to being contacted before submitting this form'
      },
      healthConcern: (remaining) => `Please describe your health concern in at least 20 characters (${remaining} characters remaining)`,
      warning: (clinic, closeLabel) => `Evening requests at ${clinic} may be limited because the clinic closes at ${closeLabel}. Our front desk will confirm the closest available time.`,
      success: `
        <h3 class="text-lg font-semibold">Thank you for reaching out to HealthCore.</h3>
        <p class="mt-3">We have received your enquiry. A member of our front desk team will contact you within 1 business day to confirm your appointment details and answer any questions.</p>
        <p class="mt-3">If you need urgent assistance, please call your preferred clinic directly using the numbers listed on our website.</p>
        <p class="mt-3">We look forward to caring for you.</p>
      `
    },
    es: {
      errors: {
        first_name: 'El nombre debe contener solo letras y tener al menos 2 caracteres',
        last_name: 'El apellido debe contener solo letras y tener al menos 2 caracteres',
        date_of_birth: 'Ingresa una fecha de nacimiento valida. El paciente debe tener entre 0 y 120 anos',
        email: 'Ingresa un correo electronico valido (ejemplo: name@provider.com)',
        phone: 'El telefono debe incluir un codigo de pais (ejemplo: +34 612 345 678)',
        preferred_language: 'Selecciona tu idioma preferido',
        preferred_clinic: 'Selecciona la clinica que deseas visitar',
        preferred_date: 'Selecciona una fecha con al menos 1 dia habil desde hoy y no mas de 60 dias hacia adelante',
        preferred_time: 'Selecciona el horario preferido',
        service_type: 'Selecciona el tipo de atencion que buscas',
        paediatric: 'La atencion pediatrica esta disponible para pacientes menores de 18 anos. Verifica la fecha de nacimiento o selecciona otro servicio.',
        new_patient: 'Indica si esta es tu primera visita a HealthCore',
        has_insurance: 'Indica si tienes seguro medico',
        insurance_provider: 'Ingresa el nombre de tu proveedor de seguro',
        insurance_member_id: 'El numero de miembro debe tener entre 6 y 20 caracteres alfanumericos',
        patient_id: 'El ID del paciente debe seguir el formato HC- seguido de 6 letras o numeros',
        consent: 'Debes dar tu consentimiento para ser contactado antes de enviar el formulario'
      },
      healthConcern: (remaining) => `Describe tu preocupacion de salud con al menos 20 caracteres (${remaining} caracteres faltantes)`,
      warning: (clinic, closeLabel) => `Las solicitudes nocturnas en ${clinic} pueden tener disponibilidad limitada porque la clinica cierra a las ${closeLabel}. Nuestro equipo confirmara el horario mas cercano disponible.`,
      success: `
        <h3 class="text-lg font-semibold">Gracias por comunicarte con HealthCore.</h3>
        <p class="mt-3">Hemos recibido tu consulta. Un miembro de nuestro equipo de recepcion se comunicara contigo dentro de 1 dia habil para confirmar los detalles de tu cita y responder cualquier pregunta.</p>
        <p class="mt-3">Si necesitas ayuda urgente, llama directamente a tu clinica preferida usando los numeros publicados en nuestro sitio web.</p>
        <p class="mt-3">Esperamos poder atenderte pronto.</p>
      `
    }
  }[locale];

  const clinicHours = {
    'HealthCore Austin Central': { closeHour: 20, closeLabel: locale === 'es' ? '8pm' : '8pm' },
    'HealthCore Austin North': { closeHour: 19, closeLabel: locale === 'es' ? '7pm' : '7pm' },
    'HealthCore San Antonio': { closeHour: 18, closeLabel: locale === 'es' ? '6pm' : '6pm' },
    'HealthCore Miami': { closeHour: 20, closeLabel: locale === 'es' ? '8pm' : '8pm' },
    'HealthCore Orlando': { closeHour: 18, closeLabel: locale === 'es' ? '6pm' : '6pm' },
    'HealthCore Atlanta': { closeHour: 19, closeLabel: locale === 'es' ? '7pm' : '7pm' }
  };

  const elements = {
    first_name: form.elements.first_name,
    last_name: form.elements.last_name,
    date_of_birth: form.elements.date_of_birth,
    email: form.elements.email,
    phone: form.elements.phone,
    preferred_language: form.elements.preferred_language,
    preferred_clinic: form.elements.preferred_clinic,
    preferred_date: form.elements.preferred_date,
    preferred_time: form.elements.preferred_time,
    service_type: form.elements.service_type,
    insurance_provider: form.elements.insurance_provider,
    insurance_member_id: form.elements.insurance_member_id,
    patient_id: form.elements.patient_id,
    health_concern: form.elements.health_concern,
    contact_consent: form.elements.contact_consent
  };

  const patientIdWrapper = document.querySelector('#patient-id-wrapper');
  const insuranceFields = document.querySelector('#insurance-fields');
  const counter = document.querySelector('#health-concern-counter');
  const successMessage = document.querySelector('#success-message');
  const availabilityWarning = document.querySelector('#availability-warning');
  const letterPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ]{2,50}$/u;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\+\d[\d\s]{6,}$/;
  const memberIdPattern = /^[A-Za-z0-9]{6,20}$/;
  const patientIdPattern = /^HC-[A-Za-z0-9]{6}$/;
  const fieldNames = [
    'first_name',
    'last_name',
    'date_of_birth',
    'email',
    'phone',
    'preferred_language',
    'preferred_clinic',
    'preferred_date',
    'preferred_time',
    'service_type',
    'new_patient',
    'has_insurance',
    'insurance_provider',
    'insurance_member_id',
    'patient_id',
    'health_concern',
    'contact_consent'
  ];

  const parseDateInput = (value) => {
    if (!value) {
      return null;
    }

    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const startOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const addDays = (date, days) => {
    const clone = new Date(date);
    clone.setDate(clone.getDate() + days);
    return clone;
  };

  const nextBusinessDay = (date) => {
    const next = addDays(date, 1);
    const day = next.getDay();

    if (day === 6) {
      return addDays(next, 2);
    }

    if (day === 0) {
      return addDays(next, 1);
    }

    return next;
  };

  const calculateAge = (birthDate) => {
    const today = startOfToday();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const beforeBirthday = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate());

    if (beforeBirthday) {
      age -= 1;
    }

    return age;
  };

  const getRadioValue = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value || '';

  const setError = (name, message) => {
    const errorNode = document.querySelector(`[data-error-for="${name}"]`);
    if (errorNode) {
      errorNode.textContent = message;
    }

    const field = form.elements[name];
    if (field instanceof RadioNodeList) {
      Array.from(field).forEach((input) => {
        input.setAttribute('aria-invalid', 'true');
      });
      return;
    }

    if (field) {
      field.setAttribute('aria-invalid', 'true');
    }
  };

  const clearError = (name) => {
    const errorNode = document.querySelector(`[data-error-for="${name}"]`);
    if (errorNode) {
      errorNode.textContent = '';
    }

    const field = form.elements[name];
    if (field instanceof RadioNodeList) {
      Array.from(field).forEach((input) => {
        input.removeAttribute('aria-invalid');
      });
      return;
    }

    if (field) {
      field.removeAttribute('aria-invalid');
    }
  };

  const updateCounter = () => {
    const count = elements.health_concern.value.trim().length;
    counter.textContent = `${count} / 500`;
  };

  const updateConditionalSections = () => {
    const isReturningPatient = getRadioValue('new_patient') === 'No';
    const hasInsurance = getRadioValue('has_insurance') === 'Yes';

    patientIdWrapper.classList.toggle('hidden', !isReturningPatient);
    insuranceFields.classList.toggle('hidden', !hasInsurance);

    elements.insurance_provider.required = hasInsurance;
    elements.insurance_member_id.required = hasInsurance;

    if (!hasInsurance) {
      elements.insurance_provider.value = '';
      elements.insurance_member_id.value = '';
      clearError('insurance_provider');
      clearError('insurance_member_id');
    }

    if (!isReturningPatient) {
      elements.patient_id.value = '';
      clearError('patient_id');
    }
  };

  const updateAvailabilityWarning = () => {
    const preferredTime = elements.preferred_time.value;
    const clinic = elements.preferred_clinic.value;

    availabilityWarning.classList.add('hidden');
    availabilityWarning.textContent = '';

    if (preferredTime !== 'Evening (5pm–8pm)' || !clinic || !clinicHours[clinic]) {
      return;
    }

    const details = clinicHours[clinic];
    if (details.closeHour < 20) {
      availabilityWarning.textContent = text.warning(clinic, details.closeLabel);
      availabilityWarning.classList.remove('hidden');
    }
  };

  const validateDateOfBirth = () => {
    const birthDate = parseDateInput(elements.date_of_birth.value);
    if (!birthDate) {
      setError('date_of_birth', text.errors.date_of_birth);
      return false;
    }

    const today = startOfToday();
    const age = calculateAge(birthDate);

    if (birthDate > today || age < 0 || age > 120) {
      setError('date_of_birth', text.errors.date_of_birth);
      return false;
    }

    clearError('date_of_birth');
    return true;
  };

  const validators = {
    first_name: () => {
      if (!letterPattern.test(elements.first_name.value.trim())) {
        setError('first_name', text.errors.first_name);
        return false;
      }
      clearError('first_name');
      return true;
    },
    last_name: () => {
      if (!letterPattern.test(elements.last_name.value.trim())) {
        setError('last_name', text.errors.last_name);
        return false;
      }
      clearError('last_name');
      return true;
    },
    date_of_birth: validateDateOfBirth,
    email: () => {
      if (!emailPattern.test(elements.email.value.trim())) {
        setError('email', text.errors.email);
        return false;
      }
      clearError('email');
      return true;
    },
    phone: () => {
      if (!phonePattern.test(elements.phone.value.trim())) {
        setError('phone', text.errors.phone);
        return false;
      }
      clearError('phone');
      return true;
    },
    preferred_language: () => {
      if (!elements.preferred_language.value) {
        setError('preferred_language', text.errors.preferred_language);
        return false;
      }
      clearError('preferred_language');
      return true;
    },
    preferred_clinic: () => {
      if (!elements.preferred_clinic.value) {
        setError('preferred_clinic', text.errors.preferred_clinic);
        return false;
      }
      clearError('preferred_clinic');
      return true;
    },
    preferred_date: () => {
      const preferredDate = parseDateInput(elements.preferred_date.value);
      if (!preferredDate) {
        setError('preferred_date', text.errors.preferred_date);
        return false;
      }

      const today = startOfToday();
      const earliestDate = nextBusinessDay(today);
      const latestDate = addDays(today, 60);

      if (preferredDate < earliestDate || preferredDate > latestDate) {
        setError('preferred_date', text.errors.preferred_date);
        return false;
      }

      clearError('preferred_date');
      return true;
    },
    preferred_time: () => {
      if (!elements.preferred_time.value) {
        setError('preferred_time', text.errors.preferred_time);
        return false;
      }
      clearError('preferred_time');
      return true;
    },
    service_type: () => {
      if (!elements.service_type.value) {
        setError('service_type', text.errors.service_type);
        return false;
      }

      const birthDate = parseDateInput(elements.date_of_birth.value);
      if (elements.service_type.value === 'Paediatric Care' && birthDate && calculateAge(birthDate) >= 18) {
        setError('service_type', text.errors.paediatric);
        return false;
      }

      clearError('service_type');
      return true;
    },
    new_patient: () => {
      if (!getRadioValue('new_patient')) {
        setError('new_patient', text.errors.new_patient);
        return false;
      }
      clearError('new_patient');
      return true;
    },
    has_insurance: () => {
      if (!getRadioValue('has_insurance')) {
        setError('has_insurance', text.errors.has_insurance);
        return false;
      }
      clearError('has_insurance');
      return true;
    },
    insurance_provider: () => {
      if (getRadioValue('has_insurance') === 'Yes' && !elements.insurance_provider.value.trim()) {
        setError('insurance_provider', text.errors.insurance_provider);
        return false;
      }
      clearError('insurance_provider');
      return true;
    },
    insurance_member_id: () => {
      if (getRadioValue('has_insurance') === 'Yes' && !memberIdPattern.test(elements.insurance_member_id.value.trim())) {
        setError('insurance_member_id', text.errors.insurance_member_id);
        return false;
      }
      clearError('insurance_member_id');
      return true;
    },
    patient_id: () => {
      const value = elements.patient_id.value.trim();
      if (getRadioValue('new_patient') === 'No' && value && !patientIdPattern.test(value)) {
        setError('patient_id', text.errors.patient_id);
        return false;
      }
      clearError('patient_id');
      return true;
    },
    health_concern: () => {
      const value = elements.health_concern.value.trim();
      const remaining = Math.max(0, 20 - value.length);

      if (value.length < 20 || value.length > 500) {
        setError('health_concern', text.healthConcern(remaining));
        return false;
      }
      clearError('health_concern');
      return true;
    },
    contact_consent: () => {
      if (!elements.contact_consent.checked) {
        setError('contact_consent', text.errors.consent);
        return false;
      }
      clearError('contact_consent');
      return true;
    }
  };

  const validateField = (name) => {
    if (!validators[name]) {
      return true;
    }

    if (name === 'service_type' && elements.service_type.value === 'Paediatric Care') {
      validateDateOfBirth();
    }

    return validators[name]();
  };

  const validateForm = () => fieldNames.every((name) => validateField(name));

  fieldNames.forEach((name) => {
    const field = form.elements[name];

    if (field instanceof RadioNodeList) {
      Array.from(field).forEach((input) => {
        input.addEventListener('change', () => {
          updateConditionalSections();
          validateField(name);
        });
      });
      return;
    }

    if (!field) {
      return;
    }

    const eventName = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(eventName, () => {
      if (name === 'health_concern') {
        updateCounter();
      }

      if (name === 'preferred_clinic' || name === 'preferred_time') {
        updateAvailabilityWarning();
      }

      if (name === 'date_of_birth' || name === 'service_type') {
        validateField('date_of_birth');
        validateField('service_type');
      } else {
        validateField(name);
      }
    });

    field.addEventListener('blur', () => {
      validateField(name);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    successMessage.classList.add('hidden');
    successMessage.innerHTML = '';
    updateConditionalSections();
    updateAvailabilityWarning();

    if (!validateForm()) {
      return;
    }

    successMessage.innerHTML = text.success;
    successMessage.classList.remove('hidden');
    form.reset();
    updateConditionalSections();
    updateCounter();
    updateAvailabilityWarning();
    fieldNames.forEach(clearError);
  });

  form.addEventListener('reset', () => {
    successMessage.classList.add('hidden');
    successMessage.innerHTML = '';
    setTimeout(() => {
      updateConditionalSections();
      updateCounter();
      updateAvailabilityWarning();
      fieldNames.forEach(clearError);
    }, 0);
  });

  updateConditionalSections();
  updateCounter();
  updateAvailabilityWarning();
}