/**
 * HealthCore — Business Validations
 *
 * Functions that validate data complies with HealthCore's specific business rules
 * before being processed or stored. Covers patient enquiries, clinic data,
 * and entity integrity checks.
 *
 * @package @repo/shared-types
 */
import { calculateAge } from '../types/models.js';
// ──────────────────────────────────────────────
// Name Validation
// ──────────────────────────────────────────────
/**
 * Validate a person's name (first or last).
 * Rules: 2–50 characters, letters only (including accented: áéíóúñü).
 */
export function validateName(name, fieldName) {
    if (!name || name.trim().length < 2 || name.trim().length > 50) {
        return {
            valid: false,
            field: fieldName,
            message: fieldName === 'first_name'
                ? 'First name must contain only letters and be at least 2 characters'
                : 'Last name must contain only letters and be at least 2 characters',
        };
    }
    const lettersOnlyRegex = /^[A-Za-zÀ-ÿÑñÜü\s'-]+$/;
    if (!lettersOnlyRegex.test(name.trim())) {
        return {
            valid: false,
            field: fieldName,
            message: fieldName === 'first_name'
                ? 'First name must contain only letters and be at least 2 characters'
                : 'Last name must contain only letters and be at least 2 characters',
        };
    }
    return { valid: true, field: fieldName };
}
// ──────────────────────────────────────────────
// Date of Birth Validation
// ──────────────────────────────────────────────
/**
 * Validate date of birth.
 * Rules: Cannot be a future date. Patient must be between 0 and 120 years old.
 */
export function validateDateOfBirth(dateOfBirth) {
    if (!dateOfBirth) {
        return {
            valid: false,
            field: 'date_of_birth',
            message: 'Enter a valid date of birth. Patient must be between 0 and 120 years old',
        };
    }
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    if (isNaN(birthDate.getTime())) {
        return {
            valid: false,
            field: 'date_of_birth',
            message: 'Enter a valid date of birth. Patient must be between 0 and 120 years old',
        };
    }
    if (birthDate > today) {
        return {
            valid: false,
            field: 'date_of_birth',
            message: 'Enter a valid date of birth. Patient must be between 0 and 120 years old',
        };
    }
    const age = calculateAge(dateOfBirth);
    if (age < 0 || age > 120) {
        return {
            valid: false,
            field: 'date_of_birth',
            message: 'Enter a valid date of birth. Patient must be between 0 and 120 years old',
        };
    }
    return { valid: true, field: 'date_of_birth' };
}
// ──────────────────────────────────────────────
// Email Validation
// ──────────────────────────────────────────────
/**
 * Validate email address format.
 */
export function validateEmail(email) {
    if (!email) {
        return {
            valid: false,
            field: 'email',
            message: 'Enter a valid email address (example: name@provider.com)',
        };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return {
            valid: false,
            field: 'email',
            message: 'Enter a valid email address (example: name@provider.com)',
        };
    }
    return { valid: true, field: 'email' };
}
// ──────────────────────────────────────────────
// Phone Validation
// ──────────────────────────────────────────────
/**
 * Validate phone number.
 * Rules: Must start with country code (e.g., +1 305 555 0191 or +34 612 345 678).
 */
export function validatePhone(phone) {
    if (!phone) {
        return {
            valid: false,
            field: 'phone',
            message: 'Phone must include a country code (example: +1 305 555 0191)',
        };
    }
    const phoneRegex = /^\+\d{1,3}\s?\d{1,4}\s?\d{3,4}\s?\d{3,4}$/;
    if (!phoneRegex.test(phone.trim())) {
        return {
            valid: false,
            field: 'phone',
            message: 'Phone must include a country code (example: +1 305 555 0191)',
        };
    }
    return { valid: true, field: 'phone' };
}
// ──────────────────────────────────────────────
// Preferred Date Validation
// ──────────────────────────────────────────────
/**
 * Check if a date is at least 1 business day from today.
 * Business days exclude weekends (Saturday, Sunday).
 */
export function isAtLeastOneBusinessDayFromToday(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    if (targetDate <= today)
        return false;
    // Count business days between today+1 and targetDate
    let businessDays = 0;
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() + 1);
    while (checkDate <= targetDate) {
        const dayOfWeek = checkDate.getDay();
        // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            businessDays++;
        }
        checkDate.setDate(checkDate.getDate() + 1);
    }
    return businessDays >= 1;
}
/**
 * Validate preferred appointment date.
 * Rules: At least 1 business day from today. No more than 60 days ahead.
 */
export function validatePreferredDate(dateStr) {
    if (!dateStr) {
        return {
            valid: false,
            field: 'preferred_date',
            message: 'Select a date at least 1 business day from today and no more than 60 days ahead',
        };
    }
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(targetDate.getTime())) {
        return {
            valid: false,
            field: 'preferred_date',
            message: 'Select a date at least 1 business day from today and no more than 60 days ahead',
        };
    }
    // Check not in the past
    if (targetDate <= today) {
        return {
            valid: false,
            field: 'preferred_date',
            message: 'Select a date at least 1 business day from today and no more than 60 days ahead',
        };
    }
    // Check at least 1 business day
    if (!isAtLeastOneBusinessDayFromToday(dateStr)) {
        return {
            valid: false,
            field: 'preferred_date',
            message: 'Select a date at least 1 business day from today and no more than 60 days ahead',
        };
    }
    // Check no more than 60 days ahead
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 60);
    if (targetDate > maxDate) {
        return {
            valid: false,
            field: 'preferred_date',
            message: 'Select a date at least 1 business day from today and no more than 60 days ahead',
        };
    }
    return { valid: true, field: 'preferred_date' };
}
// ──────────────────────────────────────────────
// Service Type + Age Validation (Paediatric Care)
// ──────────────────────────────────────────────
/**
 * Validate that Paediatric Care is only available for patients under 18.
 */
export function validatePaediatricCare(serviceType, dateOfBirth) {
    if (serviceType !== 'Paediatric Care') {
        return { valid: true, field: 'service_type' };
    }
    const age = calculateAge(dateOfBirth);
    if (age >= 18) {
        return {
            valid: false,
            field: 'service_type',
            message: 'Paediatric Care is available for patients under 18. Please check the date of birth or select a different service.',
        };
    }
    return { valid: true, field: 'service_type' };
}
// ──────────────────────────────────────────────
// Insurance Validation
// ──────────────────────────────────────────────
/**
 * Validate insurance provider name.
 * Rules: Required if hasInsurance is Yes. Max 100 characters.
 */
export function validateInsuranceProvider(provider) {
    if (!provider || provider.trim().length === 0) {
        return {
            valid: false,
            field: 'insurance_provider',
            message: 'Please enter your insurance provider name',
        };
    }
    if (provider.trim().length > 100) {
        return {
            valid: false,
            field: 'insurance_provider',
            message: 'Insurance provider name must not exceed 100 characters',
        };
    }
    return { valid: true, field: 'insurance_provider' };
}
/**
 * Validate insurance member ID.
 * Rules: 6–20 alphanumeric characters.
 */
export function validateInsuranceMemberId(memberId) {
    if (!memberId || memberId.trim().length === 0) {
        return {
            valid: false,
            field: 'insurance_member_id',
            message: 'Member ID must be between 6 and 20 alphanumeric characters',
        };
    }
    const memberIdRegex = /^[A-Za-z0-9]{6,20}$/;
    if (!memberIdRegex.test(memberId.trim())) {
        return {
            valid: false,
            field: 'insurance_member_id',
            message: 'Member ID must be between 6 and 20 alphanumeric characters',
        };
    }
    return { valid: true, field: 'insurance_member_id' };
}
/**
 * Validate all insurance fields together.
 */
export function validateInsurance(hasInsurance, provider, memberId) {
    const errors = [];
    if (hasInsurance !== 'Yes') {
        return errors;
    }
    const providerResult = validateInsuranceProvider(provider ?? '');
    if (!providerResult.valid)
        errors.push(providerResult);
    const memberIdResult = validateInsuranceMemberId(memberId ?? '');
    if (!memberIdResult.valid)
        errors.push(memberIdResult);
    return errors;
}
// ──────────────────────────────────────────────
// Health Concern Validation
// ──────────────────────────────────────────────
/**
 * Validate health concern description.
 * Rules: 20–500 characters.
 */
export function validateHealthConcern(concern) {
    if (!concern) {
        return {
            valid: false,
            field: 'health_concern',
            message: 'Please describe your health concern in at least 20 characters',
        };
    }
    const trimmed = concern.trim();
    if (trimmed.length < 20) {
        return {
            valid: false,
            field: 'health_concern',
            message: `Please describe your health concern in at least 20 characters (${20 - trimmed.length} characters remaining)`,
        };
    }
    if (trimmed.length > 500) {
        return {
            valid: false,
            field: 'health_concern',
            message: 'Health concern description must not exceed 500 characters',
        };
    }
    return { valid: true, field: 'health_concern' };
}
// ──────────────────────────────────────────────
// Consent Validation
// ──────────────────────────────────────────────
/**
 * Validate contact consent checkbox.
 */
export function validateConsent(consented) {
    if (!consented) {
        return {
            valid: false,
            field: 'contact_consent',
            message: 'You must consent to being contacted before submitting this form',
        };
    }
    return { valid: true, field: 'contact_consent' };
}
// ──────────────────────────────────────────────
// Returning Patient Validation
// ──────────────────────────────────────────────
/**
 * Validate Patient ID for returning patients.
 * Format: HC- followed by 6 alphanumeric characters (e.g., HC-A3F291).
 */
export function validatePatientId(patientId) {
    if (!patientId || patientId.trim().length === 0) {
        return { valid: false, field: 'patient_id', message: 'Please enter your Patient ID' };
    }
    const patientIdRegex = /^HC-[A-Za-z0-9]{6}$/;
    if (!patientIdRegex.test(patientId.trim())) {
        return {
            valid: false,
            field: 'patient_id',
            message: 'Patient ID must follow the format HC-XXXXXX (e.g., HC-A3F291)',
        };
    }
    return { valid: true, field: 'patient_id' };
}
// ──────────────────────────────────────────────
// Evening Time + Clinic Hours Warning
// ──────────────────────────────────────────────
/**
 * Check if a clinic is open during the evening (past 5pm).
 * Returns a warning if the clinic closes at or before 6pm.
 */
export function checkEveningClinicAvailability(preferredTime, clinic) {
    if (!preferredTime.includes('Evening') || !clinic) {
        return null;
    }
    // Check the latest closing time across all hours
    const latestClose = clinic.hours.reduce((latest, h) => {
        if (h.isClosed)
            return latest;
        // Parse closing time (e.g., "8pm", "6pm", "1pm")
        const closeHour = parseInt(h.close.replace(/(\d+)(am|pm)/i, '$1'), 10);
        const isPM = h.close.toLowerCase().includes('pm');
        const hour24 = isPM && closeHour !== 12 ? closeHour + 12 : closeHour;
        return Math.max(latest, hour24);
    }, 0);
    // If the clinic closes at or before 6pm (18:00), it's unlikely to accommodate evening visits
    if (latestClose <= 18) {
        return {
            valid: true,
            field: 'preferred_time',
            message: `Warning: ${clinic.name} closes at ${latestClose > 12 ? latestClose - 12 : latestClose}pm on most days. Evening availability may be limited.`,
        };
    }
    if (latestClose <= 19) {
        return {
            valid: true,
            field: 'preferred_time',
            message: `Note: ${clinic.name} closes at ${latestClose > 12 ? latestClose - 12 : latestClose}pm. Please verify evening appointment availability.`,
        };
    }
    return null;
}
// ──────────────────────────────────────────────
// Full Patient Enquiry Validation
// ──────────────────────────────────────────────
/**
 * Validate all fields of a patient enquiry.
 * Returns a ValidationErrors object with all field-level errors.
 */
export function validatePatientEnquiry(data) {
    const errors = [];
    // Required field checks
    if (!data.firstName) {
        errors.push(validateName('', 'first_name'));
    }
    else {
        errors.push(validateName(data.firstName, 'first_name'));
    }
    if (!data.lastName) {
        errors.push(validateName('', 'last_name'));
    }
    else {
        errors.push(validateName(data.lastName, 'last_name'));
    }
    // Date of birth
    if (!data.dateOfBirth) {
        errors.push({
            valid: false,
            field: 'date_of_birth',
            message: 'Enter a valid date of birth. Patient must be between 0 and 120 years old',
        });
    }
    else {
        errors.push(validateDateOfBirth(data.dateOfBirth));
    }
    // Email
    if (!data.email) {
        errors.push({
            valid: false,
            field: 'email',
            message: 'Enter a valid email address (example: name@provider.com)',
        });
    }
    else {
        errors.push(validateEmail(data.email));
    }
    // Phone
    if (!data.phone) {
        errors.push({
            valid: false,
            field: 'phone',
            message: 'Phone must include a country code (example: +1 305 555 0191)',
        });
    }
    else {
        errors.push(validatePhone(data.phone));
    }
    // Preferred language
    if (!data.preferredLanguage) {
        errors.push({
            valid: false,
            field: 'preferred_language',
            message: 'Select your preferred language',
        });
    }
    // Preferred clinic
    if (!data.preferredClinic) {
        errors.push({
            valid: false,
            field: 'preferred_clinic',
            message: 'Select the clinic you would like to visit',
        });
    }
    // Preferred date
    if (!data.preferredDate) {
        errors.push({
            valid: false,
            field: 'preferred_date',
            message: 'Select a date at least 1 business day from today and no more than 60 days ahead',
        });
    }
    else {
        errors.push(validatePreferredDate(data.preferredDate));
    }
    // Preferred time
    if (!data.preferredTime) {
        errors.push({
            valid: false,
            field: 'preferred_time',
            message: 'Select your preferred time of day',
        });
    }
    // Service type
    if (!data.serviceType) {
        errors.push({
            valid: false,
            field: 'service_type',
            message: 'Select the type of care you are looking for',
        });
    }
    else if (data.dateOfBirth) {
        errors.push(validatePaediatricCare(data.serviceType, data.dateOfBirth));
    }
    // New patient status
    if (!data.isNewPatient) {
        errors.push({
            valid: false,
            field: 'new_patient',
            message: 'Please indicate whether this is your first visit to HealthCore',
        });
    }
    // Insurance
    if (!data.hasInsurance) {
        errors.push({
            valid: false,
            field: 'has_insurance',
            message: 'Please indicate whether you have health insurance',
        });
    }
    else if (data.hasInsurance === 'Yes') {
        errors.push(...validateInsurance('Yes', data.insurance?.provider, data.insurance?.memberId));
    }
    // Health concern
    if (!data.healthConcern) {
        errors.push({
            valid: false,
            field: 'health_concern',
            message: 'Please describe your health concern in at least 20 characters',
        });
    }
    else {
        errors.push(validateHealthConcern(data.healthConcern));
    }
    // Contact consent
    if (!data.contactConsent) {
        errors.push({
            valid: false,
            field: 'contact_consent',
            message: 'You must consent to being contacted before submitting this form',
        });
    }
    const validErrors = errors.filter((e) => !e.valid);
    return {
        valid: validErrors.length === 0,
        errors: validErrors,
    };
}
// ──────────────────────────────────────────────
// General Entity Validation
// ──────────────────────────────────────────────
/**
 * Validate that a required string field is non-empty within length limits.
 */
export function validateRequiredString(value, fieldName, minLength, maxLength, message) {
    if (!value || value.trim().length < minLength || value.trim().length > maxLength) {
        return { valid: false, field: fieldName, message };
    }
    return { valid: true, field: fieldName };
}
/**
 * Validate that a clinic has all required fields.
 */
export function validateClinic(clinic) {
    const errors = [];
    if (!clinic.id) {
        errors.push({
            valid: false,
            field: 'id',
            message: 'Clinic must have an ID',
        });
    }
    if (!clinic.name || clinic.name.trim().length < 2) {
        errors.push({
            valid: false,
            field: 'name',
            message: 'Clinic must have a valid name',
        });
    }
    if (!clinic.phone) {
        errors.push({
            valid: false,
            field: 'phone',
            message: 'Clinic must have a phone number',
        });
    }
    if (!clinic.hours || clinic.hours.length === 0) {
        errors.push({
            valid: false,
            field: 'hours',
            message: 'Clinic must have operating hours',
        });
    }
    return errors;
}
/**
 * Validate that a patient object is complete and valid.
 */
export function validatePatient(patient) {
    const errors = [];
    // Patient ID
    if (!patient.id) {
        errors.push({
            valid: false,
            field: 'id',
            message: 'Patient must have an ID',
        });
    }
    // Name checks using existing validators
    if (patient.firstName) {
        errors.push(validateName(patient.firstName, 'first_name'));
    }
    else {
        errors.push({
            valid: false,
            field: 'first_name',
            message: 'First name is required',
        });
    }
    if (patient.lastName) {
        errors.push(validateName(patient.lastName, 'last_name'));
    }
    else {
        errors.push({
            valid: false,
            field: 'last_name',
            message: 'Last name is required',
        });
    }
    // DOB
    if (patient.dateOfBirth) {
        errors.push(validateDateOfBirth(patient.dateOfBirth));
    }
    // Email
    if (patient.email) {
        errors.push(validateEmail(patient.email));
    }
    // Phone
    if (patient.phone) {
        errors.push(validatePhone(patient.phone));
    }
    const validErrors = errors.filter((e) => !e.valid);
    return {
        valid: validErrors.length === 0,
        errors: validErrors,
    };
}
