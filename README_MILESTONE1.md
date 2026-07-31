# Milestone 1: HealthCore Public Website

## HealthCore Summary

HealthCore is an outpatient healthcare company founded in 2011 in Austin, Texas. It operates 12 clinics across the United States and the United Kingdom, offering primary care, specialist consultations, chronic disease management, and preventive health programmes. Its main differentiator is accessibility: same-day appointments, extended hours, and bilingual staff at US locations.

For this milestone, the goal was to create HealthCore's first credible public digital presence: a bilingual website that explains its services and locations, and a structured patient enquiry form that helps the front desk collect complete information before following up with patients.

---

## Milestone Goal

Build a professional, responsive, and accessible public website for HealthCore with two core parts:

1. A landing page that presents the company, services, locations, and contact details.
2. A patient enquiry form that validates structured information before simulated submission.

This milestone follows the requirements defined in [CONTEXT.en.md](./CONTEXT.en.md) and [PROMPTS.txt](./PROMPTS.txt).

---

## Deliverables

The following files were created at the repository root:

- [index.html](./index.html): English landing page
- [index.es.html](./index.es.html): Spanish landing page
- [application.html](./application.html): English patient enquiry form
- [application.es.html](./application.es.html): Spanish patient enquiry form
- [validation.js](./validation.js): Shared client-side validation logic for both form pages

No custom stylesheet was added because the implementation is fully handled with Tailwind CSS via CDN, which matches the prompt requirements.

---

## What The Landing Pages Cover

Both landing pages include:

- Semantic HTML5 structure with `header`, `nav`, `main`, `section`, `article`, and `footer`
- Responsive Tailwind layout built mobile-first and scaled with `sm`, `md`, and `lg` breakpoints
- Language toggle between English and Spanish pages
- Hero section with the required headline, subheadline, and call to action
- Services section with the three required service groups
- Why HealthCore section with the required differentiators
- US clinic locations table using the exact clinic data from the context
- Contact section with the specified contact details
- Footer with copyright and social links
- Schema.org structured data for `MedicalOrganization`
- Schema.org `MedicalClinic` entries for each US location

---

## What The Form Pages Cover

Both patient enquiry pages include:

- All required fields and exact `name` attributes from the project brief
- Proper labels connected through `for` and `id`
- Logical grouping with `fieldset` and `legend`
- Required markers and accessible error display areas
- Submit and reset actions
- A visible partnership note for healthcare providers and organisations
- Responsive form layout using Tailwind utility classes only

The form is designed as a patient enquiry form, not a direct booking system.

---

## Validation Implemented In `validation.js`

The shared validation script covers the business rules requested in the context:

- First and last name: letters only, including accented characters, minimum 2 characters
- Date of birth: valid date, not in the future, maximum age 120
- Email: valid email format
- Phone: must begin with `+` and include country code
- Preferred language: required selection
- Preferred clinic: required selection from the provided clinic list
- Preferred date: at least 1 business day from today and no more than 60 days ahead
- Preferred time: required selection
- Service type: required selection
- Paediatric Care rule: only valid for patients under 18
- New patient radio group: required
- Returning patient logic: shows optional `patient_id` field with format validation
- Insurance radio group: required
- Insurance conditional logic: if insurance is `Yes`, provider and member ID become required
- Health concern: 20 to 500 characters with a live counter
- Contact consent: required before submission
- Evening clinic warning: shows a notice when evening selection may not fit clinic hours
- Success state: simulated submission with localized confirmation message
- Real-time validation: triggered on input, change, and blur where appropriate

Both English and Spanish form pages use the same validation file, with localized messages selected from the page language.

---

## Accessibility And UX Notes

The implementation includes:

- Semantic page structure for better navigation and SEO
- ARIA labels on navigation and interactive areas where useful
- `aria-live` regions for validation messages and success feedback
- High-contrast content sections and visible error states
- Mobile-first spacing and layout decisions to support smaller screens first

There are no decorative images in the current implementation, so no image `alt` text was required.

---

## Design Direction

The visual direction follows the prompt guidance for a traditional healthcare brand. The palette uses the requested blue range:

- `#92eaff`
- `#75d4ff`
- `#0069ff`
- `#0031c4`
- `#0016a2`

The resulting interface aims to feel clinical, trustworthy, modern, and professional without introducing custom CSS beyond Tailwind configuration.

---

## How To Run Locally

From the repository root, run:

```bash
npx --yes http-server . -p 3000 -a 0.0.0.0
```

Then open:

- `http://127.0.0.1:3000/index.html`
- `http://127.0.0.1:3000/index.es.html`
- `http://127.0.0.1:3000/application.html`
- `http://127.0.0.1:3000/application.es.html`

---

## Validation Performed

The implementation was checked with:

```bash
npx --yes htmlhint index.html index.es.html application.html application.es.html
node --check validation.js
```

The pages and script also returned successfully when served through the local HTTP server.

---

## Milestone Outcome

Milestone 1 now provides HealthCore with a bilingual public-facing website and a structured intake form that supports a more efficient front-desk follow-up process. This establishes the first digital touchpoint for the company while aligning with the content, validation, accessibility, SEO, and responsive design requirements from the brief.