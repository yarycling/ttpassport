# Official First-Time Passport Form Mapping (Applicants 16+)

**Work package:** TTP-01C (Stage 1C)
**Version:** 1.0
**Baseline checked:** 22 November 2026
**Status:** Source reviewed; digital requiredness, validation and evidentiary equivalence require Immigration/legal approval

## Source and mapping rules

- Current form linked as **FIRST ISSUE 16 YEARS AND OVER** from the official [Immigration Division passport forms page](https://homelandsecurity.gov.tt/divisions/immigrationdivision/): [Application Form for Trinidad and Tobago Passport (Applicants 16 Years and Over)](https://homelandsecurity.gov.tt/wp-content/uploads/2022/11/PASSPORT-APPL-FORM-ADULT-12-inch-PDF.pdf) (4 pages). The PDF URL indicates upload path `2022/11`; a visible form revision/version was not found in the extracted page text.
- Current instructions linked alongside that form: [Passport Application Instructions — 1st Machine Readable Passport, citizens 16 years and over](https://homelandsecurity.gov.tt/wp-content/uploads/2026/01/First-Time-Passport-Instructions-Adult-16-2026.pdf) (2 pages; upload path `2026/01`). They state applicants must appear in person for their scheduled appointment and identify evidence requirements by citizenship basis.
- The [official Passport FAQs](https://homelandsecurity.gov.tt/divisions/immigrationdivision/faqs/) provide additional public guidance. FAQs and instructions may change; re-check the forms page and source files before an implementation package is baselined.
- The form says “completed Passport Application Form” is to be submitted. It does **not** consistently mark every individual blank as mandatory. Unless an explicit conditional is shown, field-level requiredness below is therefore `Not marked on paper form; digital rule pending`. Do not turn a paper blank into a new mandatory field without approval.
- Proposed data types and validation are implementation candidates only. Apply server-side validation after approved rules exist. Name limits, formats, allowed values, normalization and digital signature equivalence are not inferred from printed boxes.

## Form fields

“Evidence/check” identifies what the source form/instructions name and any distinct approved check still needed. An OCR match is extraction only; it does not establish authenticity, identity, citizenship or approval. Applicant-owned values remain attributed to the applicant unless the form explicitly assigns them to another person or to an officer.

### Cover, applicant identity and personal information (form pages 1–2)

| Official section / field | Proposed digital type | Required / conditional status | Proposed validation (pending approval) | Evidence / check and owner |
|---|---|---|---|---|
| Cover — specimen signature of applicant | Signature/evidence reference | Form includes a signature specimen; digital equivalent not approved | Preserve as immutable signature evidence with version, timestamp and signer binding only after legal approval | Applicant; signature/electronic evidence policy required |
| Official use — passport type | Text/approved enum | Official use only | Staff-select only from approved values | Immigration officer; no applicant edit |
| Official use — origin | Text/approved enum | Official use only | Approved source values | Immigration officer |
| Official use — receipt number | Opaque string | Official use only | Issued by approved receipt process; uniqueness | Immigration officer/system after approval |
| Official use — passport number | Opaque string | Official use only | Must come from approved official issuance process; never generated or guessed | Issuing authority; not collected from applicant as new passport number |
| Official use — expedited | Boolean/approved enum | Official use only | Policy-configured; no applicant-selected entitlement inferred | Officer; fee/policy approval required |
| Official use — pick up | Text/approved enum | Official use only | Approved handling location/method | Officer; release/fulfilment rules required |
| Official use — date | Date | Official use only | Valid date and official event timestamp | Officer |
| Official use — date of issue | Date | Official use only | Valid date consistent with issuance record | Issuing authority |
| Official use — pre-paid shipping | Text/approved enum | Official use only | Approved service and reconciliation evidence | Officer; no provider assumed |
| Official use — reason for application | Text/approved enum | Official use only | Approved categories; do not infer public choices from blank | Officer |
| Official use — valid to | Date | Official use only | Calculated/recorded only under approved issuance rule | Issuing authority |
| Section 1 — surname | String | Form field; individual mandatory status not stated | Preserve spelling and diacritics; approved length/character policy | Applicant; compare with evidence/source under approved identity policy |
| Section 1 — first name | String | Form field; individual mandatory status not stated | Preserve spelling and diacritics; approved length/character policy | Applicant; approved identity checks |
| Section 1 — middle name(s) | String/list of strings | Form field; individual mandatory status not stated | Preserve order, multiple names and diacritics; do not require if absent from source evidence | Applicant; approved identity checks |
| Section 1 — maiden name | String | Conditional by applicant history; form does not state field-level mandatory status | Preserve historical form; do not assume only one name change | Applicant; supporting name-history evidence if policy requires |
| Section 1 — former name, surname | String | Conditional if former name exists; form does not state field-level mandatory status | Store as historical name with type and dates only if approved | Applicant; evidence per approved name-history policy |
| Section 1 — former name, first name | String | Conditional if former name exists | Preserve historical spelling | Applicant; evidence per approved policy |
| Section 1 — mother’s maiden name, surname | String | Form field; requiredness not stated | Sensitive family attribute; minimum collection and retention review | Applicant; no automatic authoritative check assumed |
| Section 1 — father’s full name, surname | String | Form field; requiredness not stated | Preserve names; no forced binary parent model without policy | Applicant; evidence only where eligibility policy requires |
| Section 1 — father’s full name, first name | String | Form field; requiredness not stated | Preserve names and variants | Applicant; evidence only where policy requires |
| Section 2 — date of birth | Date | Form field; individual mandatory status not stated | Valid calendar date; age/service eligibility must use approved effective-date rule | Applicant; official identity/civil record check required under approved source policy |
| Section 2 — sex (form choices: Male / Female) | Approved value or source text pending policy | Form provides Male/Female choices; digital value set not approved | Do not infer or silently expand/restrict the legal field; obtain policy decision | Applicant; source value/identity-document matching only if approved |
| Section 2 — photograph | Private image/evidence reference | Photograph box on form; current instructions say photos are captured at appointment | Keep print-photo proposal separate from IVP selfie; photo specs/capture route require approval | Applicant/authorized capture process; current instruction says captured at in-person appointment |
| Section 2 — place of birth, town/city | String | Form field; requiredness not stated | Preserve historical name; country context required only if approved | Applicant; civil record check if authorized |
| Section 2 — place of birth, country | Country code/string | Form field; requiredness not stated | Use approved country list and historical aliases | Applicant; civil record check if authorized |
| Section 2 — height (cm) | Decimal/integer with unit | Form field; requiredness not stated | Units explicitly centimetres; accepted range/rounding requires policy | Applicant/appointment capture; not an identity or citizenship result |
| Section 2 — colour of eyes | String/approved enum | Form field; requiredness not stated | Accepted values need policy; no invented vocabulary | Applicant/authorized capture if required |
| Section 2 — hair colour | String/approved enum | Form field; requiredness not stated | Accepted values need policy; no invented vocabulary | Applicant/authorized capture if required |
| Section 2 — marital status | Enum: Single, Married, Widowed, Divorced, Separated, Other (as printed) | Form lists choices; field-level mandatory status not stated | Preserve provided choice; “Other” handling and downstream rules require policy | Applicant; evidence only for conditional name/citizenship rules |
| Section 2 — occupation/profession | String | Form field; requiredness not stated | Approved length; do not infer employment status from blank | Applicant |
| Section 2 — home address, street name | String | Form field; requiredness not stated | International address support; field structure/locality rules pending | Applicant; no address proof inferred |
| Section 2 — home address, town/city | String | Form field; requiredness not stated | International locality; no Trinidad-only constraint | Applicant |
| Section 2 — home address, postal/ZIP code | String | Form field; requiredness not stated | Preserve country-specific format; allow absent code if source permits | Applicant |
| Section 2 — home address, country | Country code/string | Form field; requiredness not stated | Approved international country list | Applicant |
| Section 2 — mailing address differs flag | Boolean | Conditional: mailing address if different from home address | If false, do not duplicate; if true, capture separately | Applicant |
| Section 2 — mailing address, street name | String | Conditional if mailing address differs | International address validation | Applicant |
| Section 2 — mailing address, town/city | String | Conditional if mailing address differs | International locality | Applicant |
| Section 2 — mailing address, postal/ZIP code | String | Conditional if mailing address differs | Country-specific format | Applicant |
| Section 2 — mailing address, country | Country code/string | Conditional if mailing address differs | Approved country list | Applicant |
| Section 2 — work address / local address if resident abroad, street name | String | Form specifies work address or, for overseas resident, local address | Context choice and requiredness need policy; do not infer that work address is always required | Applicant; private address access controls |
| Section 2 — work/local address, town/city | String | Conditional on address context | International locality | Applicant |
| Section 2 — work/local address, postal/ZIP code | String | Conditional on address context | Country-specific format | Applicant |
| Section 2 — work/local address, country | Country code/string | Conditional on address context | Approved country list | Applicant |
| Section 2 — name of firm/organization | String | Form field adjacent to work/local address; requiredness not stated | Do not require for unemployed/self-employed without approval | Applicant |
| Section 2 — home telephone number | String | Form field; requiredness not stated | E.164-compatible parsing where possible; preserve input safely | Applicant; contact verification only if approved |
| Section 2 — mobile number | String | Form field; requiredness not stated | E.164-compatible parsing where possible | Applicant; contact verification only if approved |
| Section 2 — office telephone number | String | Form field; requiredness not stated | Country code/extension support | Applicant |
| Section 2 — email address | String | Form field; requiredness not stated | Syntax check; account-channel verification is separate from identity proofing | Applicant; account control only |

### Married applicants, guardian and recommender (form page 2)

| Official section / field | Proposed digital type | Required / conditional status | Proposed validation (pending approval) | Evidence / check and owner |
|---|---|---|---|---|
| Married women — present marriage date | Date | Conditional section headed “Married Women” | Valid date; do not infer applicability from sex value without approved policy | Applicant; marriage certificate required by 2026 instructions for married applicants |
| Married women — place of marriage | String | Conditional on applicable marriage history | Preserve locality/country | Applicant; marriage certificate |
| Married women — husband’s surname | String | Conditional on applicable marriage history | Preserve names | Applicant; marriage certificate if policy requires |
| Married women — husband’s first name | String | Conditional on applicable marriage history | Preserve names | Applicant; marriage certificate if policy requires |
| Married women — husband’s nationality | Country/nationality value | Conditional on applicable marriage history | Approved country/nationality values | Applicant; not citizenship determination |
| Previous marriage(s) — date | Date | Conditional if prior marriage exists | Valid date; repeatable history | Applicant; prior marriage documents if required |
| Previous marriage(s) — husband’s full name | String | Conditional if prior marriage exists | Preserve name and variants | Applicant; supporting record per policy |
| Previous marriage(s) — place of marriage | String | Conditional if prior marriage exists | International locality | Applicant; supporting record per policy |
| Previous marriage(s) — husband’s nationality | Country/nationality value | Conditional if prior marriage exists | Approved list; repeatable history | Applicant |
| Section 3 — guardian first name | String | Conditional: applicant under 18 | Preserve names; guardian acts as self | Guardian; age 16–17 and guardian authority policy required |
| Section 3 — guardian surname | String | Conditional: applicant under 18 | Preserve names | Guardian; approved identity/authority check |
| Section 3 — guardian relationship to applicant | String/approved enum | Conditional: applicant under 18 | Do not assume relationship alone proves legal authority | Guardian; approved relationship/authority evidence |
| Section 3 — applicant first name repeated in consent | String/reference to applicant | Conditional: applicant under 18 | Bind to the current applicant, not free-text-only identity | Guardian; system links to applicant after verification |
| Section 3 — applicant surname repeated in consent | String/reference to applicant | Conditional: applicant under 18 | Bind to applicant record | Guardian |
| Section 3 — guardian permission declaration | Declaration/evidence reference | Conditional: applicant under 18 | Exact notice/text version, signer, timestamp and method require approval | Guardian; electronic signature equivalence pending |
| Section 3 — guardian date | Date | Conditional: guardian declaration is completed | Valid date and trusted timestamp | Guardian |
| Section 3 — guardian signature | Signature/evidence reference | Conditional: applicant under 18 | Signer binding and retention require legal approval | Guardian |
| Section 3 — guardian ID/passport number | Sensitive string | Conditional: printed in guardian portion | Encryption, minimum retention, format only if approved | Guardian; approved identity and authority checks |
| Section 3 — guardian ID/passport issue date | Date | Conditional: guardian ID evidence supplied | Valid date; compare with presented evidence under policy | Guardian |
| Section 4 — recommender first name | String | Form says recommender only completes section | Preserve names; recommender must authenticate as self | Recommender; citizenship/qualification checks pending approved process |
| Section 4 — recommender surname | String | Recommender-owned | Preserve names | Recommender |
| Section 4 — declaration of T&T citizenship / truth of application | Declaration/evidence reference | Recommender section | Exact wording, signer, version and legal effect require approval | Recommender; citizenship verification source unconfirmed |
| Section 4 — applicant first name referenced | Reference to applicant | Recommender section | Bind to applicant record; do not accept mismatched free-text link silently | Recommender |
| Section 4 — applicant surname referenced | Reference to applicant | Recommender section | Bind to applicant record | Recommender |
| Section 4 — years personally known applicant | Number/decimal | Form asks for duration | Non-negative number; approved minimum to be verified against current instructions | Recommender; 2026 instructions specify at least three years |
| Section 4 — recommender occupation | String | Recommender-owned; requiredness not marked | Approved length; role category policy pending | Recommender; qualification evidence where required |
| Section 4 — firm/organization name | String | Recommender-owned; conditional if applicable | Do not require retired recommender to provide firm | Recommender |
| Section 4 — recommender address, street | String | Recommender-owned | Full address; retired recommender uses home address per instructions | Recommender; sensitive address access control |
| Section 4 — recommender address, town/city | String | Recommender-owned | International locality | Recommender |
| Section 4 — recommender address, postal/ZIP code | String | Recommender-owned | Country-specific | Recommender |
| Section 4 — recommender address, country | Country code/string | Recommender-owned | Approved country list | Recommender |
| Section 4 — recommender office telephone | String | Recommender-owned | Phone parsing; safe verification policy | Recommender |
| Section 4 — recommender home telephone | String | Recommender-owned | Phone parsing; safe verification policy | Recommender |
| Section 4 — recommender declaration date | Date | Recommender-owned | Valid date and trusted event timestamp | Recommender |
| Section 4 — recommender ID/DP/passport number | Sensitive string | Recommender-owned | Preserve document type; encrypted storage; format rules pending | Recommender; identity/qualification checks under approved policy |
| Section 4 — recommender ID issue date | Date | Conditional on ID evidence | Valid date | Recommender |
| Section 4 — recommender ID expiry date | Date | Conditional on document having expiry | Valid date; do not assume all accepted documents expire | Recommender |
| Section 4 — recommender signature | Signature/evidence reference | Recommender-owned | Legal/electronic signature equivalence pending | Recommender |
| Section 4 — official firm/organization stamp | Image/evidence reference or witnessed event | “Where applicable” | Applicable categories and digital equivalent require approval | Recommender/authorized organization; no fabricated stamp |
| Section 4 — guardian ID/passport number and issue date on recommender/guardian portion | Sensitive string/date | Conditional where guardian details are required | Avoid duplicate collection; reconcile which printed fields apply after visual/form-owner validation | Guardian; exact digital field ownership requires Immigration confirmation |

### Citizenship, prior documents, references and applicant declaration (form page 3)

| Official section / field | Proposed digital type | Required / conditional status | Proposed validation (pending approval) | Evidence / check and owner |
|---|---|---|---|---|
| Section 5 — citizenship by Birth selection | Boolean/one-of category | Applicant selects one basis | Exactly one basis only if Immigration confirms mutually exclusive current rule | Applicant; birth certificate and PIN per instructions |
| Section 5 — birth certificate PIN | Sensitive string | Conditional: citizenship by Birth | Preserve leading zeros; format/rule needs Registry/Immigration confirmation | Applicant; computer-generated birth certificate with PIN per instructions |
| Section 5 — birth certificate number | String | Conditional: citizenship by Birth | Preserve source format | Applicant; civil record source only if authorized |
| Section 5 — birth registration date | Date | Conditional: citizenship by Birth | Valid date | Applicant; birth record |
| Section 5 — birth registration district | String/approved value | Conditional: citizenship by Birth | Historical district names may apply | Applicant; birth record |
| Section 5 — citizenship by Descent selection | Boolean/one-of category | Applicant selects one basis | Basis consistency with supporting evidence requires authorized human/policy check | Applicant; birth certificate, proof of parent/grandparent citizenship, and other conditional evidence per instructions |
| Section 5 — descent certificate number | String | Conditional: citizenship by Descent | Preserve source format | Applicant; supporting certificate |
| Section 5 — descent certificate issue date | Date | Conditional: citizenship by Descent | Valid date | Applicant; supporting certificate |
| Section 5 — citizenship by Adoption selection | Boolean/one-of category | Applicant selects one basis | Category choice per form | Applicant; adoption certificate/order and birth certificate where available per instructions |
| Section 5 — adoption certificate number | String | Conditional: citizenship by Adoption | Preserve source format | Applicant; computer-generated certificate with PIN where applicable per instructions |
| Section 5 — adoption certificate issue date | Date | Conditional: citizenship by Adoption | Valid date | Applicant; supporting record |
| Section 5 — citizenship by Registration selection | Boolean/one-of category | Applicant selects one basis | Distinct from naturalisation | Applicant; Certificate of Registration and birth certificate per instructions |
| Section 5 — registration certificate number | String | Conditional: citizenship by Registration | Preserve source format | Applicant; certificate |
| Section 5 — registration certificate issue date | Date | Conditional: citizenship by Registration | Valid date | Applicant; certificate |
| Section 5 — citizenship by Naturalisation selection | Boolean/one-of category | Applicant selects one basis | Distinct from registration | Applicant; Certificate of Naturalisation and birth certificate per instructions |
| Section 5 — naturalisation certificate number | String | Conditional: citizenship by Naturalisation | Preserve source format | Applicant; certificate |
| Section 5 — naturalisation certificate issue date | Date | Conditional: citizenship by Naturalisation | Valid date | Applicant; certificate |
| Section 5 — now or ever citizen of another country: Yes/No | Boolean | Form requests answer | Conditional follow-up if Yes; policy must define date/history scope | Applicant; no automated citizenship conclusion |
| Section 5 — other citizenship country | Country code/string | Conditional: Yes to other citizenship | Repeatable; preserve historical country names | Applicant; certificate/passport evidence per instructions where applicable |
| Section 5 — other citizenship acquired by | String/approved enum | Conditional: Yes to other citizenship | Do not invent allowable category values | Applicant; supporting evidence |
| Section 5 — other citizenship certificate number | String | Conditional: Yes and certificate exists | Preserve source format; repeatable | Applicant; citizenship certificate where required |
| Section 5 — other citizenship issue date | Date | Conditional: Yes and certificate exists | Valid date; repeatable | Applicant; 2026 instructions require certificate and coloured copy for acquired citizenship |
| Section 6 — ever applied for or issued TT passport/travel document: Yes/No | Boolean | Form asks; first-issue eligibility implications require review | Preserve an affirmative answer; do not auto-reject or treat as renewal | Applicant; authorized Immigration record check and human assessment |
| Section 6 — prior document passport number | String | Conditional: Yes; form instructs list in table | Sensitive; encrypt and restrict access | Applicant; prior document/evidence and authorized record search |
| Section 6 — prior document issue date | Date | Conditional: prior document is listed | Valid date | Applicant; prior document |
| Section 6 — prior document place of issue | String | Conditional: prior document is listed | Preserve source/locality | Applicant; prior document |
| Section 6 — most recently issued document evidence | Private file reference | Instructions say submit most recently issued document where applicable | File policy and accepted originals/copies require approval | Applicant; private evidence; official source check if authorized |
| Section 7 — reference 1 first name | String | Form asks for two references; field-level mandatory policy still to confirm | Bind distinct reference person; no relative per form instruction | Applicant supplies; reference identity/relationship policy pending |
| Section 7 — reference 1 surname | String | Form asks for two references | Preserve names | Applicant supplies |
| Section 7 — reference 1 full home/business address | Structured international address | Form asks full address | Fullness criteria and cross-border format require approval | Applicant supplies; reference data minimization/notice needed |
| Section 7 — reference 1 telephone contact | String | Form asks contact | Phone parsing; consent/notice and contact policy pending | Applicant supplies; do not contact without approved authority |
| Section 7 — reference 2 first name | String | Form asks for two references | Distinct person from reference 1 | Applicant supplies |
| Section 7 — reference 2 surname | String | Form asks for two references | Preserve names | Applicant supplies |
| Section 7 — reference 2 full home/business address | Structured international address | Form asks full address | International format; data minimization | Applicant supplies |
| Section 7 — reference 2 telephone contact | String | Form asks contact | Phone parsing; contact policy pending | Applicant supplies |
| Section 7 — reference relationship eligibility | Relationship/category metadata | Instructions on form: two non-relatives known at least 3 years | Confirm meaning and evidence; don't infer from applicant's unchecked relationship | Applicant asserts; human/source check per policy |
| Section 8 — applicant name for declaration | Reference to applicant/name snapshot | Declaration section | Bind to submitted name snapshot; preserve corrected versions | Applicant |
| Section 8 — T&T citizenship declaration | Declaration/evidence reference | Printed declaration | Exact legal text/version, signer and effect require approval | Applicant; distinct from citizenship evidence/decision |
| Section 8 — truth-of-statements declaration | Declaration/evidence reference | Printed declaration | Preserve displayed text/version and acknowledgment | Applicant; electronic signature policy pending |
| Section 8 — photographs true likeness declaration | Declaration/evidence reference | Printed declaration | Bind to official photograph/evidence version; current photo is captured at appointment | Applicant; no substitution by KYC selfie |
| Section 8 — no other T&T passport except section 6 declaration | Declaration/evidence reference | Printed declaration | Cross-check prior-document answer; no auto-clear on no-match | Applicant; authorized passport-record lookup pending |
| Section 8 — recommender known at least 3 years declaration | Declaration/evidence reference | Printed declaration | Consistency with recommender response; no invented evidence | Applicant and recommender separately |
| Section 8 — report future citizenship change declaration | Declaration/evidence reference | Printed declaration | Legal notice, duration and reporting channel need approval | Applicant; legal review |
| Section 8 — passport no / date / place of issue table | Repeatable record | Conditional if Section 6 Yes per printed instruction | Link each entry to prior document; preserve history | Applicant; prior documents and authorized records |
| Section 8 — applicant signature | Signature/evidence reference | Printed declaration | Digital method and signer binding need approval | Applicant |
| Section 8 — applicant declaration date | Date | Declaration signed | Valid date and trusted event timestamp | Applicant |
| Section 8 — applicant ID/passport number | Sensitive string | Printed near signature | Preserve type and source; minimum retention | Applicant; identity source check under approved policy |
| Section 8 — applicant ID issue date | Date | Conditional on ID evidence | Valid date | Applicant; presented ID |

### Official-use-only back-office fields (form page 4)

Every field below is **not** applicant editable. Access, authoring roles, authoritative source and event history must be approved by Immigration.

| Official section / field | Proposed digital type | Required / conditional status | Proposed validation (pending approval) | Evidence / check and owner |
|---|---|---|---|---|
| Prequalification officer | Staff reference | Official use only | Must resolve to authorized staff in current role/office | Immigration staff identity and audit |
| Prequalification date | Date/time | Official use only | Trusted timestamp | Immigration staff/system |
| Birth record type: computer-generated | Boolean/enum | Official use only | Source classification from evidence/official check | Immigration reviewer |
| Birth record type: manual | Boolean/enum | Official use only | Source classification; preserve even if current instruction excludes some forms | Immigration reviewer |
| Birth certificate PIN | Sensitive string | Official use only | Match source record; encryption and minimal display | Immigration reviewer; authoritative source unavailable until approved |
| Birth certificate number | String | Official use only | Match presented record/source | Immigration reviewer |
| Birth registration district | String | Official use only | Preserve historical value | Immigration reviewer |
| Birth registration date | Date | Official use only | Match source record | Immigration reviewer |
| Birth entry number | String | Official use only | Source format | Immigration reviewer |
| Manual birth certificate volume number | String | Official use only, conditional on manual certificate | Preserve leading zeros | Immigration reviewer |
| Manual birth certificate page number | String | Official use only, conditional on manual certificate | Preserve source format | Immigration reviewer |
| Manual birth certificate chapter | String | Official use only, conditional on manual certificate | Preserve source value | Immigration reviewer |
| Manual birth certificate section | String | Official use only, conditional on manual certificate | Preserve source value | Immigration reviewer |
| Descent certificate number | String | Official use only, conditional on descent | Match source record | Immigration reviewer |
| Descent certificate issue date | Date | Official use only, conditional on descent | Match source record | Immigration reviewer |
| Descent certificate chapter | String | Official use only, conditional on descent | Preserve source value | Immigration reviewer |
| Descent certificate section | String | Official use only, conditional on descent | Preserve source value | Immigration reviewer |
| Adoption certificate number | String | Official use only, conditional on adoption | Match source record | Immigration reviewer |
| Adoption entry number | String | Official use only, conditional on adoption | Preserve source value | Immigration reviewer |
| Adoption book number | String | Official use only, conditional on adoption | Preserve source value | Immigration reviewer |
| Adoption page number | String | Official use only, conditional on adoption | Preserve source value | Immigration reviewer |
| Marriage certificate number | String | Official use only, where necessary | Match supplied original/copy and approved source | Immigration reviewer |
| Marriage certificate issue date | Date | Official use only, where necessary | Valid date and evidence reference | Immigration reviewer |
| Marriage entry number | String | Official use only, where necessary | Preserve source value | Immigration reviewer |
| Marriage volume/book number | String | Official use only, where necessary | Preserve source value | Immigration reviewer |
| Marriage folio/page number | String | Official use only, where necessary | Preserve source value | Immigration reviewer |
| Registration/naturalisation certificate number | String | Official use only, conditional on basis | Match presented record/source | Immigration reviewer |
| Registration/naturalisation certificate issue date | Date | Official use only, conditional on basis | Match record | Immigration reviewer |
| Registration/naturalisation chapter | String | Official use only, where applicable | Preserve source value | Immigration reviewer |
| Registration/naturalisation section | String | Official use only, where applicable | Preserve source value | Immigration reviewer |
| Sworn declaration name | String | Official use only, where necessary; repeatable | Bind to evidence, do not treat as applicant-entered legal conclusion | Immigration reviewer |
| Sworn declaration date | Date | Official use only, where necessary; repeatable | Valid date | Immigration reviewer |
| Sworn declaration reference | String | Official use only, where necessary; repeatable | Preserve source value | Immigration reviewer |
| Deed poll number | String | Official use only, where necessary | Preserve source value | Immigration reviewer; supplied deed-poll evidence |
| Deed poll date | Date | Official use only, where necessary | Valid date | Immigration reviewer |
| Absolute decree reference | String | Official use only, where necessary | Preserve source value | Immigration reviewer; supplied decree evidence |
| Absolute decree date | Date | Official use only, where necessary | Valid date | Immigration reviewer |
| Other information | Text/evidence reference | Official use only, where necessary | Safe, structured reason; no sensitive details in generic logs | Immigration reviewer |
| Reception officer | Staff reference | Official use only | Authorized staff identity | Immigration staff identity and audit |
| Reception date | Date/time | Official use only | Trusted timestamp | Immigration staff/system |
| Officer stamp | Image/evidence reference or witnessed event | Official use only | Authorized stamp and immutable provenance; digital equivalent requires approval | Immigration officer |

## Supporting evidence checklist from 2026 instructions

The official instructions require a valid Trinidad and Tobago identification card or a passport issued by another country for first-time/handwritten-passport applicants; a scheduled appointment with in-person appearance; completed form; originals and copies of previous passport where applicable and other required documents; TTPost TrackPak; and Third Party Authorization Form. Foreign documents must be apostilled. Non-English documents must have an official translation endorsed by a registered Public Translator. The interviewer may request additional documents.

| Citizenship basis | Evidence identified by current instructions | Mapping status / check ownership |
|---|---|---|
| Birth | Computer-generated birth certificate with PIN; T&T national ID; marriage certificate(s), divorce decree(s) and/or death certificate(s) if applicable; statutory declaration(s)/deed poll(s) where applicable; citizenship certificate of another country plus coloured copy if applicant acquired another citizenship | Field/evidence mapping captured; accepted originals/copies, authoritative lookup and exception handling need Immigration approval |
| Descent | Birth certificate; valid ID/passport; parent’s or grandparent’s T&T citizenship evidence (birth/marriage certificates and T&T passports); Certificate of Immigration Status if applicable; marriage documents where applicable | Do not reduce to single-parent evidence; exact eligibility/adjudication and source checks pending |
| Registration | Certificate of Registration; birth certificate with coloured copy; marriage documents where applicable | Human adjudication and evidence acceptance pending |
| Naturalisation | Certificate of Naturalisation; birth certificate with coloured copy; marriage documents where applicable | Human adjudication and evidence acceptance pending |
| Adoption | Adoption Certificate (computer-generated with PIN); Adoption Order for foreign-jurisdiction adoptions; birth certificate where available; marriage documents where applicable | Foreign order recognition and source checks pending |

## Open validation points

1. Immigration must confirm this is still the governing first-time form and provide a version/effective-date identifier or change-control process.
2. Confirm individual field requiredness, accepted values, limits, conditional logic and whether any fields should be omitted or supplemented digitally.
3. Confirm whether the paper’s “married women” fields may be represented by a neutral and legally valid name-history model.
4. Confirm proof standards and authoritative source access for each citizenship basis and prior passport/travel-document search.
5. Confirm e-signature/declaration evidence, guardian and recommender identity/authentication, and overseas handling.
6. Confirm photo capture location/specification; current instructions say photos are captured at the passport appointment.
7. Confirm originals/copies, apostille/translation, TrackPak, and in-person appointment steps before describing any online flow as complete.
8. Confirm retention and access for family names, contact details, references, identity numbers, address and official-only fields.
