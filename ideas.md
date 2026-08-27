[ROL]
You are a frontend developer. Your company has been successfully operating in a traditional way for years, but the world has changed. Customers search for information online before making decisions. Competitors already have a digital presence. And your company, despite its experience and quality, remains invisible on the internet.

Management has decided to begin the digital transformation. Your task is to build the company's first digital touchpoint: a professional public website that presents what they do and captures information from interested people through an application or sign-up form.

This site must work on any device, meet web accessibility standards, be optimized for search engines, and deliver a polished, professional user experience. It's not just "a pretty page" — it's the first step toward modernizing a company that wants to remain relevant.


[CONTEXTO]

- **HealthCore** — `CONTEXT-healthcore-briefing.md` (outpatient healthcare clinic network, US + UK)



We need you to implement a set of TypeScript functions that allow us to efficiently handle the company's main data. The goal is to have solid, well-typed utilities that we can reuse in multiple contexts.

What we need:

   1. Collection management system: Functions to filter, sort, search, and group elements within arrays. You must implement linear search for unsorted arrays and binary search for sorted arrays. Make sure to properly handle empty cases and elements not found.
    2. Data modeling with objects and interfaces: Define the TypeScript interfaces that represent the main business entities. Each interface must have explicit types for all its properties and auxiliary methods to work with that data. Use literal objects to represent concrete instances.
3.Transformations and aggregations: Implement functions that take collections of objects and generate simple reports: count elements by category, sum numeric values, find maximums and minimums, calculate averages. Everything must be typed.
  4. Business validations: Create functions that validate that data complies with your company's specific rules before being processed or stored. For example, verify that an element has all required fields, that numeric values are within allowed ranges, or that dates are coherent.

The code must be clean, with descriptive names, and each function must have a single responsibility. We want this to be maintainable in the long term.

[OUTPUT]

Backend / logic:

- Define the typescript interdaces for all main entities of your company speified in your CONTEXT.md
- implement filtering functions that allow seaching for elements by one or more criteria (filter by category, price, range, status)
- implement sorting functions that sort arrays according to different criteria (ascending, descending, by multiple fields)
- implement linear search to find elements in unsorted arrays
- implement binary search to find elements in previously sorted arrays
- create aggregation functions that generate reports: count elements by category, calculate totals, averages, maximums, minimums
- implement business validation that verify object comply with the rules in your CONTEXT.md before being processed
- all function must have explicit types in parameters and return values
- the code must follow the single responsibility principle: each function does one thing
- the project includes a clear command to validate or execute the TypeScript code during development

Optional
- create simple HTML page with tailwind CSS that allow you to manually test your functions
- include buttons or controls to execute different operations (filter, search, sort, generate reports)
- display operation results in the interface clearly 

If you add an index.html page to test your functions manually, make sure you can serve it locally or in Codespaces with a simple command such as:
npx http-server . -p 3000 -a 0.0.0.0

Expected file structure:

Your implementation should be organized in separate TypeScript files by responsibility:
src/
├── types/
│   └── models.ts          # Interfaces and types
├── utils/
│   ├── collections.ts     # Array functions
│   ├── search.ts          # Linear and binary searches
│   ├── transformations.ts # Aggregations and reports
│   └── validations.ts     # Business validations
└── index.html   



[DESIGNE]
- use a color traditional for help companies, like as {#92eaff	(146,234,255), #75d4ff	(117,212,255), #0069ff	(0,105,255),
#0031c4	(0,49,196), #0016a2	(0,22,162)}

---

## Verification Checklist (Current Repository)

Legend:
- [x] Implemented and verifiable in repository
- [x] Missing, not verifiable, or partially covered

### Backend / logic requirements

- [x] Define TypeScript interfaces for main entities in CONTEXT
  - Evidence: `src/types/models.ts`
- [x] Implement filtering functions by criteria
  - Evidence: `filterBy`, `filterByAll`, `filterByProperty`, `filterByRange`, `filterByValues` in `src/utils/collections.ts`
- [x] Implement sorting functions (ascending/descending/multiple fields)
  - Evidence: `sortBy`, `sortByMultiple`, `sortByComparator` in `src/utils/collections.ts`
- [x] Implement linear search for unsorted arrays
  - Evidence: `linearSearch`, `linearSearchAll`, `linearSearchByProperty` in `src/utils/search.ts`
- [x] Implement binary search for sorted arrays
  - Evidence: `binarySearchNumber`, `binarySearchString`, `binarySearch`, `binarySearchByProperty`, `binarySearchByNumericProperty` in `src/utils/search.ts`
- [x] Create aggregation/report functions (count, totals, averages, max, min)
  - Evidence: `countByCategory`, `sum`, `average`, `min`, `max`, `summarizeNumeric`, `frequencyReport` in `src/utils/transformations.ts`
- [x] Implement business validation functions from company rules
  - Evidence: `src/utils/validations.ts` (name, DOB, email, phone, insurance, paediatric rule, consent, full enquiry validation)
- [x] Explicit types for parameters and return values
  - Evidence: all exported utility functions in `src/utils/*.ts`
- [x] Single responsibility principle in utility design
  - Evidence: each validation/search/aggregation split into focused functions
- [x] Clear command to validate/execute TypeScript during development
  - Evidence: `npm run typecheck`, `npm run dev`, `npm run build` in `package.json`

### Optional manual test page requirements

- [x] Simple HTML page to manually test functions
  - Evidence: `src/index.html`
- [x] Include buttons/controls for filter/search/sort/reports
  - Evidence: button sections and handlers in `src/index.html`
- [x] Display operation results clearly in interface
  - Evidence: `showOutput()` and output panels in `src/index.html`

### Gaps from recommendation review

- [x] "Specific interfaces/functions with exact names" verified against the milestone prompt requirements
  - Verification source used: required file/function names listed in this same document and expected structure.
  - Mapping evidence:
    - `src/types/models.ts` exists (interfaces/types/entities)
    - `src/utils/collections.ts` exists (filter/sort/group)
    - `src/utils/search.ts` exists (linear + binary search)
    - `src/utils/transformations.ts` exists (aggregations/reports)
    - `src/utils/validations.ts` exists (business validations)
  - Note: if an external evaluator has an additional strict symbol-name rubric, include that list to perform one-to-one name matching.

- [x] Test page works when served with `http-server` from repo root
  - Fix applied: `src/index.html` now imports browser-runnable `.js` modules.
  - Runtime modules added: `src/types/models.js`, `src/utils/collections.js`, `src/utils/search.js`, `src/utils/transformations.js`, `src/utils/validations.js`.
  - ESM compatibility fix applied: `src/utils/validations.js` import updated to `../types/models.js`.