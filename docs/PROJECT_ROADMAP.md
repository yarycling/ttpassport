# TTPASSPORT Project Roadmap

**Source:** Root `AGENTS.md`, Section 16, human-approved 18-stage roadmap and owner-approved package titles in TTP-01A-01H-R1.
**Baseline date:** 22 November 2026

The stable roadmap contains 150 lettered work-package IDs across 18 stages. The approved titles below preserve those IDs and describe planning scope only; titles do not authorize implementation. Later stages are not authorised by project setup alone.

| Stage | Approved scope | Stable IDs | Packages |
|---:|---|---|---:|
| 1 | Governance and Requirements | 1A–1H | 8 |
| 2 | Architecture and Core Infrastructure | 2A–2H | 8 |
| 3 | Reusable eKYC Platform | 3A–3L | 12 |
| 4 | Citizen Registration and Accounts | 4A–4G | 7 |
| 5 | First-Time Passport Application | 5A–5K | 11 |
| 6 | Geographic Routing and Offices | 6A–6G | 7 |
| 7 | Immigration Back Office | 7A–7J | 10 |
| 8 | Payments and Reconciliation | 8A–8H | 8 |
| 9 | Production and Issuance | 9A–9H | 8 |
| 10 | Fulfilment and Logistics | 10A–10K | 11 |
| 11 | Tracking and Notifications | 11A–11F | 6 |
| 12 | Reporting and Analytics | 12A–12F | 6 |
| 13 | Passport Renewals (later release) | 13A–13I | 9 |
| 14 | External Integrations | 14A–14G | 7 |
| 15 | Security and Compliance | 15A–15H | 8 |
| 16 | Testing and Acceptance | 16A–16I | 9 |
| 17 | Deployment and Rollout | 17A–17H | 8 |
| 18 | Standalone eKYC Readiness (later release) | 18A–18G | 7 |
| | **Total** | | **150** |

## Package titles

### Stage 1 — Governance and Requirements

| Package | Owner-approved title |
|---|---|
| 1A | Project Initiation |
| 1B | Business Requirements |
| 1C | Official Application Form Mapping |
| 1D | Business Workflows |
| 1E | Legal and Policy Dependencies |
| 1F | External Dependencies |
| 1G | Technical Architecture |
| 1H | Master Development Register |

### Stage 2 — Architecture and Core Infrastructure

| Package | Owner-approved title |
|---|---|
| 2A | Project Repository and Code Structure |
| 2B | Development Environments |
| 2C | Database Foundation |
| 2D | Authentication and Authorisation Foundation |
| 2E | Workflow and Policy Engine |
| 2F | Secure Evidence and Document Storage |
| 2G | Background Processing and System Events |
| 2H | DevOps and Infrastructure Foundation |

### Stage 3 — Reusable eKYC Platform

| Package | Owner-approved title |
|---|---|
| 3A | eKYC Tenant and Client Management |
| 3B | Verification Policies and Sessions |
| 3C | Identity Profile and Evidence Model |
| 3D | Document Capture Interface |
| 3E | OCR and Document Data Extraction |
| 3F | Document Validation |
| 3G | Facial Capture and Comparison |
| 3H | Liveness and Anti-Spoofing |
| 3I | Authoritative Identity Verification |
| 3J | Identity Verification Decision Engine |
| 3K | eKYC Manual Review and Remote-Assisted Verification |
| 3L | eKYC API, Signed Results and Audit |

### Stage 4 — Citizen Registration and Accounts

| Package | Owner-approved title |
|---|---|
| 4A | Citizen Account Registration |
| 4B | Email Verification and Authentication |
| 4C | Citizen Profile Management |
| 4D | Citizen Dashboard |
| 4E | Draft and Session Management |
| 4F | eKYC Integration into Citizen Account |
| 4G | Citizen Accessibility and Support |

### Stage 5 — First-Time Passport Application

| Package | Owner-approved title |
|---|---|
| 5A | Eligibility and Application-Type Screening |
| 5B | Personal Information Form |
| 5C | Citizenship and Family Information |
| 5D | Guardian Consent Workflow |
| 5E | Recommender Workflow |
| 5F | Personal References |
| 5G | Supporting Documents |
| 5H | Passport Photograph Module |
| 5I | Application Preview and Validation |
| 5J | Electronic Declarations and Submission |
| 5K | Citizen Corrections and Resubmission |

### Stage 6 — Geographic Routing and Offices

| Package | Owner-approved title |
|---|---|
| 6A | Geographic Master Data |
| 6B | Passport Office and Mission Management |
| 6C | Office Capabilities and Jurisdictions |
| 6D | Citizen Preferred-Office Selection |
| 6E | Application Routing Engine |
| 6F | Overseas Mission Processing |
| 6G | Office Transfer and Workload Distribution |

### Stage 7 — Immigration Back Office

| Package | Owner-approved title |
|---|---|
| 7A | National Administration Dashboard |
| 7B | Back-Office User, Role and Permission Management |
| 7C | Supervisor Dashboard and Application Queues |
| 7D | Application Assignment and Workload Management |
| 7E | Staff Application Review Workspace |
| 7F | Document and Identity Review |
| 7G | Correction and Information-Request Workflow |
| 7H | Risk-Based Review and Escalation |
| 7I | Approval, Rejection and Reconsideration |
| 7J | SLA, Case History and Operational Audit |

### Stage 8 — Payments and Reconciliation

| Package | Owner-approved title |
|---|---|
| 8A | Fee Schedule Management |
| 8B | Payment Policy Engine |
| 8C | Payment Gateway Integration Layer |
| 8D | Citizen Payment Checkout |
| 8E | Payment Callbacks and Verification |
| 8F | Receipts and Transaction History |
| 8G | Refunds, Reversals, Exemptions and Adjustments |
| 8H | Financial Reconciliation and Reporting |

### Stage 9 — Production and Issuance

| Package | Owner-approved title |
|---|---|
| 9A | Approved Applications Production Queue |
| 9B | Passport Production Authorisation |
| 9C | Production Recording |
| 9D | Passport Quality Assurance |
| 9E | Production Defects and Rework |
| 9F | Official Passport Issuance |
| 9G | Passport Release Authorisation |
| 9H | Physical Passport Inventory and Security |

### Stage 10 — Fulfilment and Logistics

| Package | Owner-approved title |
|---|---|
| 10A | Fulfilment Policy and Service Selection |
| 10B | Recipient Authorisation |
| 10C | Domestic Office Collection |
| 10D | Overseas Mission Collection |
| 10E | TTPost Integration Module |
| 10F | International Courier Management |
| 10G | Dispatch Batching and Manifests |
| 10H | Chain-of-Custody Management |
| 10I | Shipment Tracking and Proof of Delivery |
| 10J | Failed Deliveries, Returns and Incidents |
| 10K | Logistics Reconciliation and Closure |

### Stage 11 — Tracking and Notifications

| Package | Owner-approved title |
|---|---|
| 11A | Application Tracking Portal |
| 11B | Citizen-Friendly Application Timeline |
| 11C | Email and Optional SMS Notifications |
| 11D | Citizen Action Centre |
| 11E | Collection and Delivery Notifications |
| 11F | Notification Audit and Support |

### Stage 12 — Reporting and Analytics

| Package | Owner-approved title |
|---|---|
| 12A | National Executive Dashboard |
| 12B | Office and Supervisor Reporting |
| 12C | Financial Reporting |
| 12D | Passport Issuance Reporting |
| 12E | Courier and Fulfilment Reporting |
| 12F | Compliance and Authorised Data Exports |

### Stage 13 — Passport Renewals (later release)

| Package | Owner-approved title |
|---|---|
| 13A | Renewal Eligibility and Policy Rules |
| 13B | Existing Passport Identification |
| 13C | Renewal Application Form |
| 13D | Identity Reverification |
| 13E | Updated Documents and Photograph |
| 13F | Renewal Approval Workflow |
| 13G | Renewal Fees and Payment |
| 13H | Previous Passport Lifecycle |
| 13I | Renewal Acceptance and Integration |

### Stage 14 — External Integrations

| Package | Owner-approved title |
|---|---|
| 14A | Government Identity-Record Integration |
| 14B | Existing Immigration Passport Records |
| 14C | Biometric Provider Integration |
| 14D | Payment Provider Certification |
| 14E | TTPost API Integration Acceptance |
| 14F | Overseas Mission and Courier Integrations |
| 14G | Integration Monitoring and Recovery |

### Stage 15 — Security and Compliance

| Package | Owner-approved title |
|---|---|
| 15A | Threat Modelling and Security Architecture |
| 15B | Identity and Access Security |
| 15C | Data Encryption and Secrets Management |
| 15D | Biometric and Document Privacy |
| 15E | National and International Data Governance |
| 15F | Security Auditing and Monitoring |
| 15G | Application and Infrastructure Hardening |
| 15H | Security and Compliance Acceptance |

### Stage 16 — Testing and Acceptance

| Package | Owner-approved title |
|---|---|
| 16A | Unit and Component Tests |
| 16B | API and Integration Contract Tests |
| 16C | Database and Migration Tests |
| 16D | Citizen Browser and Mobile Tests |
| 16E | Back-Office Functional Tests |
| 16F | eKYC Performance and Biometric Evaluation |
| 16G | Security and Negative Tests |
| 16H | Performance, Resilience and Recovery |
| 16I | End-to-End UAT and Acceptance |

### Stage 17 — Deployment and Rollout

| Package | Owner-approved title |
|---|---|
| 17A | Production Infrastructure |
| 17B | Production Configuration and Migration |
| 17C | Operational Procedures and Training |
| 17D | Domestic Pilot |
| 17E | Overseas Pilot |
| 17F | Courier and Payment Operational Validation |
| 17G | National Production Rollout |
| 17H | Production Handover and Support |

### Stage 18 — Standalone eKYC Readiness (later release)

| Package | Owner-approved title |
|---|---|
| 18A | eKYC Independence Audit |
| 18B | Standalone Deployment |
| 18C | External API and Developer Documentation |
| 18D | Multi-Organisation Provisioning |
| 18E | Commercial and Usage Management |
| 18F | Independent Product Security and Compliance |
| 18G | Standalone Product Acceptance |

Use [`project/MASTER_DEVELOPMENT_REGISTER.md`](project/MASTER_DEVELOPMENT_REGISTER.md) for work-package tracking and [`project/PROJECT_STATUS.md`](project/PROJECT_STATUS.md) for the current package status snapshot. The GUI baseline is tracked as a separate cross-cutting acceptance record, not as a new roadmap ID.
