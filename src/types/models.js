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
// Concrete Instances (Literal Objects)
// ──────────────────────────────────────────────
/** HealthCore's US clinic locations (public-facing) */
export const US_CLINICS = [
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
export const UK_CLINICS = [
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
export const ALL_CLINICS = [...US_CLINICS, ...UK_CLINICS];
/** Medical services offered by HealthCore */
export const MEDICAL_SERVICES = [
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
export const TIME_OF_DAY_OPTIONS = [
    'Morning (7am–12pm)',
    'Afternoon (12pm–5pm)',
    'Evening (5pm–8pm)',
];
// ──────────────────────────────────────────────
// Helper / Utility Methods
// ──────────────────────────────────────────────
/** Get a clinic by its ID */
export function getClinicById(clinicId) {
    return ALL_CLINICS.find((c) => c.id === clinicId);
}
/** Get public US clinics only */
export function getPublicClinics() {
    return US_CLINICS.filter((c) => c.isPublicOnWebsite);
}
/** Get a medical service by its type */
export function getServiceByType(type) {
    return MEDICAL_SERVICES.find((s) => s.type === type);
}
/** Calculate age from a date-of-birth string */
export function calculateAge(dateOfBirth) {
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
export function formatClinicHours(clinic) {
    return clinic.hours
        .map((h) => (h.isClosed ? `${h.days}: Closed` : `${h.days} ${h.open}–${h.close}`))
        .join(' · ');
}
/** Get the latest closing time for a clinic */
export function getLatestClosingTime(clinic) {
    return clinic.hours.reduce((latest, h) => {
        if (h.isClosed)
            return latest;
        return h.close > latest ? h.close : latest;
    }, '');
}
/** Create a patient enquiry object from form data */
export function createPatientEnquiry(data) {
    return { ...data };
}
