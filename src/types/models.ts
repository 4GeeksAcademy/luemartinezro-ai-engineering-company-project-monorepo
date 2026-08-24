/**
 * HealthCore — Domain Models
 *
 * TypeScript interfaces and types representing the main business entities
 * for the HealthCore outpatient healthcare network.
 *
 * Context: HealthCore operates 12 outpatient clinics across the US and UK,
 * offering primary care, specialist consultations, chronic disease management,
 * and preventive health programmes.
 *
 * @package @repo/shared-types
 */

// ──────────────────────────────────────────────
// Enums & Literal Types
// ──────────────────────────────────────────────

/** Countries where HealthCore operates */
export type Country = 'US' | 'GB';

/** US States where HealthCore has clinics */
export type UsState = 'TX' | 'FL' | 'GA';

/** UK Cities where HealthCore has clinics */
export type UkCity = 'London' | 'Manchester';

/** Languages supported by HealthCore */
export type SupportedLanguage = 'English' | 'Spanish';

/** Time-of-day slots for appointments */
export type TimeOfDay = 'Morning (7am–12pm)' | 'Afternoon (12pm–5pm)' | 'Evening (5pm–8pm)';

/** Types of medical services HealthCore offers */
export type ServiceType =
  | 'Primary Care'
  | 'Chronic Disease Management'
  | 'Specialist Consultation'
  | 'Preventive Health'
  | "Women's Health"
  | 'Paediatric Care'
  | 'Mental Health';

/** Insurance status */
export type InsuranceStatus = 'Yes' | 'No';

/** New or returning patient */
export type NewPatientStatus = 'Yes' | 'No';

// ──────────────────────────────────────────────
// Core Business Entities
// ──────────────────────────────────────────────

/** Operating hours for a specific day or range */
export interface BusinessHours {
  /** Days of the week (e.g., "Mon–Fri", "Sat") */
  days: string;
  /** Opening time in 12h format (e.g., "7am") */
  open: string;
  /** Closing time in 12h format (e.g., "8pm") */
  close: string;
  /** Whether the clinic is closed on these days */
  isClosed?: boolean;
}

/** A physical HealthCore clinic location */
export interface Clinic {
  /** Unique identifier (e.g., "austincentral") */
  id: string;
  /** Full clinic name (e.g., "HealthCore Austin Central") */
  name: string;
  /** City where the clinic is located */
  city: string;
  /** State or region abbreviation */
  state: UsState | string;
  /** Country code */
  country: Country;
  /** Primary phone number */
  phone: string;
  /** Street address */
  address?: string;
  /** Operating hours schedule */
  hours: BusinessHours[];
  /** Whether this clinic appears on the public website */
  isPublicOnWebsite: boolean;
  /** Languages available at this location */
  availableLanguages: SupportedLanguage[];
}

/** Insurance information provided by the patient */
export interface InsuranceInfo {
  /** Name of the insurance provider */
  provider: string;
  /** Member/Policy ID (6–20 alphanumeric characters) */
  memberId: string;
}

/** A patient enquiry submitted through the website form */
export interface PatientEnquiry {
  /** Patient's first name (2–50 letters only) */
  firstName: string;
  /** Patient's last name (2–50 letters only) */
  lastName: string;
  /** Date of birth (ISO format YYYY-MM-DD) */
  dateOfBirth: string;
  /** Email address */
  email: string;
  /** Phone number with country code (e.g., +1 305 555 0191) */
  phone: string;
  /** Preferred consultation language */
  preferredLanguage: SupportedLanguage;
  /** Preferred clinic ID */
  preferredClinic: string;
  /** Preferred appointment date (ISO format YYYY-MM-DD) */
  preferredDate: string;
  /** Preferred time of day */
  preferredTime: TimeOfDay;
  /** Type of medical service needed */
  serviceType: ServiceType;
  /** Whether this is the patient's first visit */
  isNewPatient: NewPatientStatus;
  /** Patient ID (for returning patients, format HC-XXXXXX) */
  patientId?: string;
  /** Whether the patient has health insurance */
  hasInsurance: InsuranceStatus;
  /** Insurance details (required if hasInsurance === 'Yes') */
  insurance?: InsuranceInfo;
  /** Description of the health concern (20–500 characters) */
  healthConcern: string;
  /** Consent to be contacted */
  contactConsent: boolean;
}

/** A patient profile stored in the system */
export interface Patient {
  /** Unique patient identifier (format HC-XXXXXX) */
  id: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Date of birth (ISO format YYYY-MM-DD) */
  dateOfBirth: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone: string;
  /** Preferred language */
  preferredLanguage: SupportedLanguage;
  /** Primary clinic assignment */
  primaryClinic: string;
  /** Insurance information (if applicable) */
  insurance?: InsuranceInfo;
  /** Date the patient profile was created */
  createdAt: string;
  /** Date of last update */
  updatedAt: string;
}

/** A medical service offered by HealthCore */
export interface MedicalService {
  /** Unique identifier */
  id: string;
  /** Service type category */
  type: ServiceType;
  /** Short display name */
  name: string;
  /** Brief description of the service */
  description: string;
  /** Whether this service is available for new patients */
  availableForNewPatients: boolean;
  /** Minimum age requirement (0 if no minimum) */
  minAge: number;
  /** Maximum age requirement (undefined if no upper limit) */
  maxAge?: number;
}

// ──────────────────────────────────────────────
// Aggregation / Report Types
// ──────────────────────────────────────────────

/** Result of counting elements by category */
export interface CategoryCount {
  category: string;
  count: number;
}

/** A generic summary report for numeric aggregations */
export interface NumericSummary {
  /** Name of the metric or category */
  label: string;
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
}

/** Result of a validation check */
export interface ValidationResult {
  valid: boolean;
  field?: string;
  message?: string;
}

/** A collection of validation errors */
export interface ValidationErrors {
  valid: boolean;
  errors: ValidationResult[];
}

// ──────────────────────────────────────────────
// Concrete Instances (Literal Objects)
// ──────────────────────────────────────────────

/** HealthCore's US clinic locations (public-facing) */
export const US_CLINICS: Clinic[] = [
  {
    id: 'austincentral',
    name: 'HealthCore Austin Central',
    city: 'Austin',
    state: 'TX',
    country: 'US',
    phone: '(512) 340-8800',
    hours: [
      { days: 'Mon–Fri', open: '7am', close: '8pm' },
      { days: 'Sat', open: '9am', close: '3pm' },
    ],
    isPublicOnWebsite: true,
    availableLanguages: ['English', 'Spanish'],
  },
  {
    id: 'austinnorth',
    name: 'HealthCore Austin North',
    city: 'Austin',
    state: 'TX',
    country: 'US',
    phone: '(512) 340-8810',
    hours: [
      { days: 'Mon–Fri', open: '8am', close: '7pm' },
    ],
    isPublicOnWebsite: true,
    availableLanguages: ['English', 'Spanish'],
  },
  {
    id: 'sanantonio',
    name: 'HealthCore San Antonio',
    city: 'San Antonio',
    state: 'TX',
    country: 'US',
    phone: '(210) 720-4400',
    hours: [
      { days: 'Mon–Fri', open: '8am', close: '6pm' },
      { days: 'Sat', open: '9am', close: '1pm' },
    ],
    isPublicOnWebsite: true,
    availableLanguages: ['English', 'Spanish'],
  },
  {
    id: 'miami',
    name: 'HealthCore Miami',
    city: 'Miami',
    state: 'FL',
    country: 'US',
    phone: '(305) 510-7700',
    hours: [
      { days: 'Mon–Fri', open: '7am', close: '8pm' },
      { days: 'Sat', open: '9am', close: '4pm' },
    ],
    isPublicOnWebsite: true,
    availableLanguages: ['English', 'Spanish'],
  },
  {
    id: 'orlando',
    name: 'HealthCore Orlando',
    city: 'Orlando',
    state: 'FL',
    country: 'US',
    phone: '(407) 892-6600',
    hours: [
      { days: 'Mon–Fri', open: '8am', close: '6pm' },
    ],
    isPublicOnWebsite: true,
    availableLanguages: ['English', 'Spanish'],
  },
  {
    id: 'atlanta',
    name: 'HealthCore Atlanta',
    city: 'Atlanta',
    state: 'GA',
    country: 'US',
    phone: '(404) 330-9900',
    hours: [
      { days: 'Mon–Fri', open: '8am', close: '7pm' },
    ],
    isPublicOnWebsite: true,
    availableLanguages: ['English', 'Spanish'],
  },
];

/** UK clinics (not public on website per context) */
export const UK_CLINICS: Clinic[] = [
  {
    id: 'londoncentral',
    name: 'HealthCore London Central',
    city: 'London',
    state: 'London',
    country: 'GB',
    phone: '+44 20 7946 0100',
    hours: [
      { days: 'Mon–Fri', open: '8am', close: '7pm' },
    ],
    isPublicOnWebsite: false,
    availableLanguages: ['English'],
  },
];

/** All clinics combined */
export const ALL_CLINICS: Clinic[] = [...US_CLINICS, ...UK_CLINICS];

/** Medical services offered by HealthCore */
export const MEDICAL_SERVICES: MedicalService[] = [
  {
    id: 'primary-care',
    type: 'Primary Care',
    name: 'Primary Care & Chronic Disease',
    description: 'Same-day appointments with primary care physicians. Ongoing management of diabetes, hypertension, and asthma.',
    availableForNewPatients: true,
    minAge: 0,
  },
  {
    id: 'chronic-disease',
    type: 'Chronic Disease Management',
    name: 'Chronic Disease Management',
    description: 'Ongoing management of diabetes, hypertension, and asthma.',
    availableForNewPatients: true,
    minAge: 0,
  },
  {
    id: 'specialist',
    type: 'Specialist Consultation',
    name: 'Specialist Consultations',
    description: 'Cardiology, endocrinology, pulmonology, and women\'s health. Referrals coordinated within the HealthCore network.',
    availableForNewPatients: true,
    minAge: 0,
  },
  {
    id: 'preventive',
    type: 'Preventive Health',
    name: 'Preventive Health & Wellbeing',
    description: 'Screenings, vaccinations, and annual check-ups. Mental health counselling and psychiatry referrals.',
    availableForNewPatients: true,
    minAge: 0,
  },
  {
    id: 'womens-health',
    type: "Women's Health",
    name: "Women's Health",
    description: 'Comprehensive women\'s health services including annual exams, family planning, and menopause management.',
    availableForNewPatients: true,
    minAge: 12,
  },
  {
    id: 'paediatric',
    type: 'Paediatric Care',
    name: 'Paediatric Care',
    description: 'Specialised healthcare for children and adolescents.',
    availableForNewPatients: true,
    minAge: 0,
    maxAge: 17,
  },
  {
    id: 'mental-health',
    type: 'Mental Health',
    name: 'Mental Health',
    description: 'Mental health counselling and psychiatry referrals.',
    availableForNewPatients: true,
    minAge: 0,
  },
];

/** Time-of-day options for the enquiry form */
export const TIME_OF_DAY_OPTIONS: TimeOfDay[] = [
  'Morning (7am–12pm)',
  'Afternoon (12pm–5pm)',
  'Evening (5pm–8pm)',
];

// ──────────────────────────────────────────────
// Helper / Utility Methods
// ──────────────────────────────────────────────

/** Get a clinic by its ID */
export function getClinicById(clinicId: string): Clinic | undefined {
  return ALL_CLINICS.find((c) => c.id === clinicId);
}

/** Get public US clinics only */
export function getPublicClinics(): Clinic[] {
  return US_CLINICS.filter((c) => c.isPublicOnWebsite);
}

/** Get a medical service by its type */
export function getServiceByType(type: ServiceType): MedicalService | undefined {
  return MEDICAL_SERVICES.find((s) => s.type === type);
}

/** Calculate age from a date-of-birth string */
export function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Format a clinic's hours into a readable string */
export function formatClinicHours(clinic: Clinic): string {
  return clinic.hours
    .map((h) => (h.isClosed ? `${h.days}: Closed` : `${h.days} ${h.open}–${h.close}`))
    .join(' · ');
}

/** Get the latest closing time for a clinic */
export function getLatestClosingTime(clinic: Clinic): string {
  return clinic.hours.reduce((latest, h) => {
    if (h.isClosed) return latest;
    return h.close > latest ? h.close : latest;
  }, '');
}

/** Create a patient enquiry object from form data */
export function createPatientEnquiry(data: Omit<PatientEnquiry, 'contactConsent'> & { contactConsent: boolean }): PatientEnquiry {
  return { ...data };
}