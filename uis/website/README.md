# HealthCore — Public Website

Next.js App Router public website in English and Spanish, with an interactive patient enquiry demo and the Milestone 2 domain utilities showcase.

## Routes

| Route | Content |
| --- | --- |
| `/` | English landing page |
| `/es` | Spanish landing page |
| `/application` | English patient enquiry demo |
| `/es/application` | Spanish patient enquiry demo |
| `/utilities` | English Milestone 2 utilities demo |
| `/es/utilities` | Spanish Milestone 2 utilities demo |

## Run

```bash
cd uis/website
npm install
npm run dev
```

The website's dev/start scripts use port 3002. Root scripts delegate to this Next.js app. The Careers link targets the talent tracker on port 3003; start that app separately with `npm run dev -- --port 3003` from `uis/talent-pipeline-tracker` (its default port 3000 is also used by the backoffice).

## Form and data limitations

The patient enquiry form validates values in the browser, shows conditional insurance and returning-patient fields, checks patient age and pediatric eligibility, constrains preferred dates to business days 1–60 days out, warns about some evening clinic closing times, and includes a character counter. It has no API or persistence integration. Its success screen clearly states that no information was sent or saved and no enquiry was received or appointment booked.

The utilities route imports the existing domain models and pure functions from the repository's `src/` directory and uses their sample data. It does not mutate or change those utility modules. The former root HTML entry pages have been removed; equivalent Next.js routes are now the supported public website.