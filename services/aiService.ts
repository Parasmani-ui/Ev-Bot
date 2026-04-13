import { checkRateLimit } from "./rateLimitService";
import { runAI, type OpenAIMessage } from "./openaiService";

/**
 * Load Jharkhand EV Policy context from environment variables
 * This keeps the sensitive knowledge base private and secure
 */
const EV_POLICY_CONTEXT =
  import.meta.env.VITE_EV_POLICY_CONTEXT ||
  "Jharkhand Electric Vehicle Policy 2022 - Comprehensive Knowledge Base (See fallback responses for full details)";

function sanitizeResponse(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/please refer to (the )?(official )?policy (documents?|documentation)\.?/gi, '')
    .replace(/please refer to (the )?official (jharkhand )?ev (policy )?documents?\.?/gi, '')
    .replace(/please (check|consult) (with )?local authorities\.?/gi, '')
    .replace(/please contact (the )?relevant authorities\.?/gi, '')
    .replace(/contact (the )?relevant authorities (for|to).*?[.\n]/gi, '')
    .replace(/for (precise|detailed|specific|exact) (details?|information|figures?|amounts?|eligibility)[^.]*\./gi, '')
    .replace(/authorized dealers?/gi, 'EV dealers')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const getAIResponse = async (
  userPrompt: string,
  clientId?: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<string> => {
  // Validate input
  if (!userPrompt || userPrompt.trim().length === 0) {
    return "Please enter a question about the Jharkhand EV Policy.";
  }

  // Check rate limit
  const rateLimitCheck = checkRateLimit(clientId);

  if (!rateLimitCheck.allowed) {
    const retryAfter = rateLimitCheck.retryAfter || 900;
    return `⏳   Rate limit exceeded.   Please try again in ${retryAfter} seconds.\n\nReminder: You can ask up to 100 questions every 15 minutes. Thank you for your patience!`;
  }

  const systemPrompt = `You are the Jharkhand EV Policy Bot. You answer questions ONLY based on the Jharkhand Electric Vehicle Policy 2022 provided below.

STRICT RULES:
1. ALWAYS answer from the policy context below. Never say "refer to the policy document" or "contact authorities" if the answer exists in the context.
2. If the exact answer IS in the policy, state it directly with the specific numbers, dates, and sections.
3. If the answer is genuinely NOT in the policy, say: "This specific detail is not mentioned in the Jharkhand EV Policy 2022." Do NOT redirect to authorities.
4. NEVER hallucinate facts, dates, or numbers not present in the policy.
5. NEVER say "please refer to official policy documentation" or "contact relevant authorities" or "authorized dealers".
6. When the user asks for exact policy language, reproduce it faithfully.
7. Answer in the same language the user writes in (Hindi, Hinglish, or English).
8. If the user states something INCORRECT about the policy (e.g., "the policy does not mention X"), CORRECT them immediately using the actual policy details. Never agree with a false statement. Example: If user says "the policy has no EV target for 2027", respond: "Actually, the policy does set a target — 10% share of EVs in overall new vehicle registration by 2027, with 3-wheelers at 20%, and 2-wheelers and 4-wheelers at 10% each (Section 3.2g)."
9. If the user asks what you are, what this bot is, or what they can ask you (in any language),
   respond with: "I am the Jharkhand EV Policy Bot. I can answer questions about the 
   Jharkhand Electric Vehicle Policy 2022 — including EV subsidies, buyer incentives, 
   charging infrastructure, manufacturer benefits, road tax exemptions, eligible vehicles, 
   and policy objectives. How can I help you?"

10. If the user asks to repeat, clarify, or translate the previous answer into another language
    (e.g., "shudh hindi me bataiye", "in English please", "dobara batao"), 
    use the conversation history to find the last bot response and restate it 
    in the requested language. Do not say "not mentioned in the policy."

Policy Context:
${EV_POLICY_CONTEXT}`;

  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...((conversationHistory || []) as OpenAIMessage[]),
    { role: 'user', content: userPrompt }
  ];

  try {
    const aiResponse = await runAI(messages, 2000);
    if (aiResponse && aiResponse.trim().length > 0) {
      return sanitizeResponse(aiResponse.trim());
    }

    console.warn('AI response empty, using local fallback.');
    return getFallbackResponse(userPrompt);
  } catch (error) {
    console.error('AI error, using local fallback:', error);
    return getFallbackResponse(userPrompt);
  }
};

/**
 * COMPREHENSIVE FALLBACK RESPONSE SYSTEM
 * Contains full Jharkhand EV Policy 2022 details
 */
const getFallbackResponse = (userPrompt: string): string => {
  const query = userPrompt.toLowerCase().trim();
  
  // Early return for greetings and general inquiries
  if (['hello', 'hi', 'hey', 'help'].some(word => query === word)) {
    return sanitizeResponse(`Hello! Welcome to the  Jharkhand Policy Bot 

I'm your official guide to the Jharkhand Electric Vehicle Policy 2022* and state industrial policies.

 I can help you with:

 For EV Buyers:
• Purchase subsidies & benefits (2W, 3W, 4W, e-buses, goods carriers)
• Road tax waivers & registration exemptions
• Scrappage incentives for old vehicle replacement
• Application process & documentation

 For Manufacturers:
• MSME incentives & support
• Capital subsidies, interest subsidies
• Tax exemptions & SGST reimbursement
• Land allotment & infrastructure

 For Charging Stations:
• Equipment subsidies & setup support
• Land & electricity concessions
• Eligibility criteria & application

 General Information:
• Policy vision & objectives
• Timelines & validity
• Contact information

 Try asking:
• "What are 2-wheeler subsidies?"
• "How to apply for manufacturing incentives?"
• "Charging infrastructure benefits?"
• "Road tax waiver details?"

How may I assist you today?`);
  }
  
  // Comprehensive keyword-based responses covering ALL aspects of the policy
  const keywordResponses: { keywords: RegExp; response: string }[] = [
    // ==================== ROAD TAX & REGISTRATION ====================
    {
      keywords: /road\s*tax|tax.*waiver|waiver|registration.*fee|exemption|motor.*vehicle.*tax/i,
      response: `  📋 Road Tax & Registration Fee Waivers   (Jharkhand EV Policy 2022)

The state provides   100% Road Tax and Registration Fee exemptions  :

 Consumer Vehicles:
•   2-Wheelers:   First 10,000 units - 100% waiver
•   3-Wheelers:   First 10,000 units - 100% waiver
•   4-Wheelers:   First 10,000 units - 100% waiver
•   E-Buses:   First 1,000 units - 100% waiver
•   Goods Carriers:   As per category limits

 Eligibility:
✓ NEW electric vehicles only
✓ Must be registered in Jharkhand
✓ Purchase from authorized dealers
✓ First-come, first-served basis
✓ Valid from Oct 2022 to Oct 2027

 Manufacturing Units:
• 100% Stamp Duty reimbursement on land
• 100% Registration Fee reimbursement
• 100% Electricity Duty exemption for 5 years

 How to Avail:
Visit your nearest RTO during vehicle registration with:
- Purchase invoice
- Dealer certificate
- Identity proof

 Typical Savings:
• 2W: Rs 2,000-5,000
• 3W: Rs 5,000-15,000
• 4W: Rs 20,000-2,00,000
• E-Bus: Rs 10,00,000+

Need details on purchase subsidies or manufacturing incentives?`
    },
    
    // ==================== PURCHASE SUBSIDIES (DETAILED) ====================
    {
      keywords: /subsidy|subsidies|incentive|discount|purchase.*benefit|buyer|consumer|demand.*side|2.*wheel|3.*wheel|4.*wheel|scooter|car/i,
      response: ` EV Purchase Subsidies (Jharkhand EV Policy 2022)

  Attractive consumer incentives   to make EVs affordable:

---

 2-WHEELERS (Electric Scooters/Bikes):
•   Subsidy:   Rs 5,000 per kWh battery capacity
•   Maximum:   Rs 10,000 per vehicle
•   Road Tax Waiver:   100% (additional benefit)
•   Target:   First 10,000 units
•   Estimated Total Benefit:   Rs 12,000-15,000

  Example:   For a scooter with 2.5 kWh battery:
- Subsidy: 2.5 × Rs 5,000 = Rs 10,000 (capped)
- Road Tax Saving: ~Rs 3,000
-   Total Savings: Rs 13,000  

---

 3-WHEELERS (Auto-Rickshaws):
•   Subsidy:   Rs 5,000 per kWh battery capacity
•   Maximum:   Rs 30,000 per vehicle
•   Road Tax Waiver:   100%
•   Target:   First 10,000 units
•   Estimated Total Benefit:   Rs 35,000-45,000

---

 4-WHEELERS (Passenger Cars):
•   Subsidy:   Rs 5,000 per kWh battery capacity
•   Maximum:   Rs 1,50,000 per vehicle
•   Road Tax Waiver:   100%
•   Target:   First 10,000 units
•   Estimated Total Benefit:   Rs 1,70,000-3,50,000

  Example:   For an EV with 40 kWh battery:
- Subsidy: 40 × Rs 5,000 = Rs 2,00,000 → Capped at Rs 1,50,000
- Road Tax Saving: Rs 1,00,000-2,00,000
-   Total Savings: Rs 2,50,000-3,50,000  

---

 E-BUSES (Public Transport):
•   Subsidy:   10% of ex-showroom cost
•   Maximum:   Rs 20,00,000 per bus
•   Road Tax Waiver:   100%
•   Target:   First 1,000 units
•   Ideal for:   STUs, private operators, corporates

---

 ELECTRIC GOODS CARRIERS:

SCRAPPAGE BONUS (Extra Incentive):  
Replace your old ICE vehicle & get additional:
•   2W/3W:   Extra Rs 5,000
•   4W:   Extra Rs 25,000
(Old vehicle must be 10-15 years old & scrapped at authorized center)

---

 ELIGIBILITY:
✓ Buyer must be Jharkhand resident (individuals)
✓ Vehicle must be FAME-II approved model
✓ NEW vehicle only (not pre-owned)
✓ Must register in Jharkhand
✓ Valid KYC documents

---

 HOW TO APPLY:
1.   Purchase EV   from authorized dealer
2.   Register   at Jharkhand RTO (avail road tax waiver automatically)
3.   Apply online   at State EV Portal within 30 days
4.   Submit docs:   Invoice, RC, Aadhaar, Bank details
5.   Get subsidy   in bank within 60-90 days

---

  ⏱ Valid Till:   October 5, 2027 (or until unit caps are reached)

   Pro Tip:   Apply early! Incentives are first-come, first-served.

Want info on manufacturing incentives, charging infrastructure, or the application process?`
    },
    
    // ==================== MANUFACTURING INCENTIVES (COMPREHENSIVE) ====================
    {
      keywords: /manufactur|msme|industry|factory|production|supply.*side|plant|capital|interest.*subsidy|sgst|unit|investment/i,
      response: ` Manufacturing Incentives (Jharkhand EV Policy 2022)

  Comprehensive support   to establish Jharkhand as EV manufacturing hub:

---

   UNIT CLASSIFICATION:  
•   Micro:   Investment up to Rs 1 Cr
•   Small:   Rs 1-10 Cr
•   Medium:   Rs 10-50 Cr
•   Large:   Rs 50-500 Cr
•   Mega:   Above Rs 500 Cr

---

   KEY FINANCIAL INCENTIVES:  

  1. CAPITAL INTEREST SUBSIDY:  
•   Rate:   6% per annum on term loan principal
•   Duration:   5 years from production start
•   Maximum:  
  - Large Units: Rs 15 Crore
  - Mega Units: Rs 30 Crore
  - Others: Pro-rated
•   Estimated Savings:   Rs 3-30 Crore over 5 years

  2. STAMP DUTY & REGISTRATION FEE:  
•   Reimbursement:   100% (one-time)
•   For:   Land purchase/lease
•   No Cap:   Full amount refunded
•   Savings:   5-7% of land cost

  3. ELECTRICITY DUTY EXEMPTION:  
•   Exemption:   100%
•   Duration:   5 years from production
•   Savings:   5-8% of power cost
•   Benefit:   Rs 10-100 Lakhs/year (depending on unit size)

  4. SGST REIMBURSEMENT:  
*(On intra-state sales of manufactured goods)*
•   Micro/Small:   100% for 7 years
•   Medium:   100% for 10 years
•   Large:   75% for 7 years
•   Mega:   75% for 10 years
•   Impact:   Significant cash flow improvement

---

 WORKFORCE SUPPORT:

5. SKILL TRAINING SUBSIDY:
•   Amount:   Rs 5,000 per employee per month
•   Duration:   6 months
•   Max Employees:  
  - Micro/Small: 100
  - Medium: 500
  - Large: 1,000
  - Mega: Unlimited
•   Total Benefit:   Up to Rs 30 Lakhs (for 100 employees)

6. EPF REIMBURSEMENT:
*(Employer's contribution only)*
•   Reimbursement:   100%
•   Duration:   5 years
•   Max:   500-1000 employees (Large/Mega)
•   Savings:   ~13% of salary cost

---

 R&D & INNOVATION:

  7. R&D GRANT:  
•   Support:   50% of R&D expenditure
•   Maximum:   Rs 50 Lakhs per annum
•   Duration:   3 years
•   Focus:   Battery tech, motors, power electronics

  8. PATENT FILING SUPPORT:  
•   Reimbursement:   50%
•   Maximum:   Rs 2 Lakhs per patent
•   Limit:   Up to 5 patents

---

 QUALITY & MARKETING:

9. QUALITY CERTIFICATION:
•   Subsidy:   50% of certification cost
•   Maximum:   Rs 5 Lakhs
•   Covers:   ISO, automotive standards (TS 16949, etc.)

10. TRADE FAIR SUPPORT:
•   Subsidy:   50% of participation cost
•   Maximum:   Rs 3 Lakhs per year
•   For:   National/international trade shows

---

 SPECIAL BENEFITS FOR MSME:
•   Cluster Development:   Support for component clusters
•   Priority Land Allotment:   Fast-track approvals
•   Marketing Assistance:   B2B connections
•   Technology Upgradation:   Subsidized tech adoption

---

 MANUFACTURING SCOPE:
✓ Electric 2W, 3W, 4W, buses, trucks
✓ Lithium-ion batteries & battery packs
✓ Electric motors & controllers
✓ Battery Management Systems (BMS)
✓ Power electronics & inverters
✓ Charging equipment
✓ Components (cables, connectors, etc.)

---

 ELIGIBILITY CONDITIONS:
✓ Commence production within 3 years of land allotment
✓ Employ 50%+ workforce from Jharkhand
✓ Comply with pollution & labor laws
✓ Achieve investment target within 2 years
✓ Maintain production for incentive duration

---

 APPLICATION PROCESS:
  Phase 1:   Submit project DPR to Dept. of Industries
  Phase 2:   Get in-principle approval (30 days)
  Phase 3:   Land allotment & factory setup
  Phase 4:   Start production & apply for incentives
  Phase 5:   Receive quarterly/annual disbursements

---

 TIMELINES:
• In-principle approval: 30 days
• Land allotment: 60 days
• Production must start: Within 3 years
• Incentive claims: Post-production commencement

---

 EXPECTED RETURNS:
For a   Rs 50 Cr Large Unit:  
- Capital Interest Subsidy: Rs 15 Cr
- SGST Reimbursement: Rs 20-30 Cr
- Electricity Duty: Rs 2-3 Cr
- EPF Reimbursement: Rs 3-4 Cr
-   Total: Rs 40-52 Crore over incentive period  

  ROI Enhancement:   25-40% improvement in project IRR

---

Need specific info on MSME benefits, application docs, or other incentives?`
    },
    
    // ==================== CHARGING INFRASTRUCTURE (DETAILED) ====================
    {
      keywords: /charging|charger|station|infrastructure|equipment|battery.*swap|connector|facilities|power|electric.*supply/i,
      response: ` Charging Infrastructure Development (Jharkhand EV Policy 2022)

  Building a robust EV charging network   across the state:

---

 VISION & TARGETS:
•   Urban Areas:   1 station every 3 km
•   Highways:   1 fast charger every 25 km
•   Overall:   50 stations per million population
•   Target by 2027:   2,500+ public charging stations
•   Investment Potential:   Rs 200-300 Crore

---

 FINANCIAL INCENTIVES:

1. PUBLIC CHARGING STATIONS:
•   Equipment Subsidy:   25% of total cost
•   Maximum:   Rs 10,00,000 per station
•   Applicable for:   First 50 stations
•   Coverage:   Chargers, civil works, safety systems, metering

Example Calculation:
- Total setup cost: Rs 30 Lakhs
- Subsidy (25%): Rs 7.5 Lakhs
- Your investment: Rs 22.5 Lakhs

2. BATTERY SWAPPING STATIONS:
•   Subsidy:   25% of infrastructure cost
•   Maximum:   Rs 5,00,000 per station
•   Target:   First 25 stations
•   Focus:   2W & 3W segments

---

 OPERATIONAL BENEFITS:

3. CONCESSIONAL ELECTRICITY TARIFF:
•   Discount:   15% below industrial rate
•   Savings:   Rs 1-1.5 per unit
•   Impact:   20-25% reduction in operating cost

4. DEMAND CHARGE REDUCTION:
•   Reduction:   50% of demand charges
•   Benefit:   Lower fixed costs

5. OPEN ACCESS:
• Simplified process for bulk power procurement
• Wheeling charges waived for first 3 years

---

 LAND ALLOTMENT:
•   Source:   Government land on lease
•   Rate:   50% of circle rate (highly subsidized)
•   Lease Period:   30 years (renewable)
•   Plot Size:   100-500 sq. meters
•   Locations:   As per site feasibility

---

 PRIORITY LOCATIONS:
1.   Government Buildings:   Secretariat, offices, public parking
2.   Transit Hubs:   Bus/railway stations, airport
3.   Commercial:   Malls, hotels, restaurants, petrol pumps
4.   Highways:   NH-33, NH-22, NH-143, NH-20
5.   Residential:   Societies with 100+ units

---

 TECHNICAL SPECIFICATIONS:

Charger Types:
•   AC Slow (3.3 kW):   Overnight charging (6-8 hrs)
•   AC Moderate (7.4 kW):   3-4 hours
•   DC Fast (30-50 kW):   < 1 hour
•   Ultra-Fast (100-150 kW):   < 30 mins (highways)

Connector Standards (Must Support):
• Bharat AC-001 (Type-2)
• Bharat DC-001 (CCS)
• CHAdeMO (optional)
• GB/T (optional)

Safety Requirements:
• BIS-certified equipment
• Earth leakage protection
• Fire safety systems
• Emergency stop mechanism
• CCTV surveillance

---

 WHO CAN SET UP?
✓ Private companies (Indian/foreign)
✓ PSUs & state agencies
✓ Electricity distribution companies
✓ Fuel retail companies (petrol pumps - great opportunity!)
✓ Real estate developers
✓ Individual entrepreneurs

---

 ELIGIBILITY FOR SUBSIDIES:
✓ Station must be PUBLIC (open 16+ hrs/day)
✓ Real-time data sharing with state portal
✓ Transparent, non-discriminatory pricing
✓ Multiple payment options (Cash, UPI, cards)
✓ Minimum 90% uptime
✓ BIS-certified equipment only

---

 WHO CANNOT AVAIL:
✗ Stations set up before Oct 6, 2022
✗ Captive stations (not open to public)
✗ Stations without state portal integration
✗ Non-compliant with safety norms

---

 APPLICATION PROCESS:

Step 1: Expression of Interest (EOI)
Submit to Department of Energy with:
- Company/individual registration
- Proposed location (coordinates, photos)
- Technical plan (charger types, capacity)
- Financial plan (investment, pricing)

Step 2: Site Approval
- Dept. conducts site inspection
- Feasibility assessment
-   Timeline:   Approval in 30 days

Step 3: Installation
- Procure BIS-certified equipment
- Complete civil works & electrical
- Install safety & metering systems
-   Deadline:   6 months from approval

Step 4: Commissioning
- Electrical safety inspection
- DISCOM connection approval
- Testing & certification
- Register on state EV portal

Step 5: Subsidy Claim
Submit with:
- Equipment invoices
- Installation bills
- Commissioning certificate
- Bank details
-   Subsidy credit:   Within 90 days

---

 BUSINESS MODEL:

Revenue Streams:
1.   Charging Fees:   Rs 15-25 per unit
2.   Parking Fees:   If applicable
3.   Advertising:   On-site displays
4.   Retail:   Convenience store, cafe

Operating Costs:
- Electricity: Rs 6-8 per unit
- Maintenance: 5-8% of capex/year
- Land lease: Rs 20,000-50,000/month
- Staff: 1-2 persons

  Payback Period:   3-5 years (with subsidy)

  Expected ROI:   15-25% annually

---

 MARKET OPPORTUNITY:

By 2027 (estimated):
-   EVs in Jharkhand:   1,00,000+
-   Daily Charging Need:   50-75 MWh
-   Market Size:   Rs 100-150 Crore/year
-   Station Requirement:   2,500-3,000 stations

  Your Opportunity:  
- Secure prime locations NOW
- Be among first 50 to get subsidy
- Establish brand in nascent market
- Scale to multiple stations

---

 CONTACT & SUPPORT:
•   Nodal Agency:   Department of Energy, Govt. of Jharkhand
•   Technical Support:   JREDA (Jharkhand Renewable Energy Development Agency)
•   Phone:   0651-XXXX (to be announced)
•   Email:   [To be notified]

Want details on manufacturing, consumer subsidies, or the complete policy overview?`
    },
    
    // ==================== SCRAPPAGE SCHEME ====================
    {
      keywords: /scrap|old.*vehicle|replace|retire|end.*of.*life|exchange|junk/i,
      response: `  🔄 Vehicle Scrappage Incentives   (Jharkhand EV Policy 2022)

  Extra benefits   when replacing old polluting vehicles with clean EVs:

---

SCRAPPAGE BONUS (Additional to EV Subsidy):

2-Wheelers & 3-Wheelers:
•   Extra Cash:   Rs 5,000
•   Plus:   Standard EV purchase subsidy (Rs 10K or 30K)
•   Plus:   100% road tax waiver
•   Total Benefit:   Rs 15,000-40,000+

4-Wheelers:
•   Extra Cash:   Rs 25,000
•   Plus:   Standard EV purchase subsidy (up to Rs 1.5 L)
•   Plus:   100% road tax waiver
•   Total Benefit:   Rs 1,75,000-3,75,000+

---

ELIGIBILITY CONDITIONS:
✓ Old vehicle must be registered in Jharkhand
✓   Age Requirement:  
  - 2W/3W: At least 10 years old
  - 4W: At least 15 years old
✓ Vehicle must be in your name for 1+ year
✓ Must be scrapped at authorized facility
✓ Valid scrappage certificate required
✓ New EV must be purchased within 6 months of scrapping

---

AUTHORIZED SCRAPPAGE CENTERS:
Currently operational/planned in:
•   Ranchi  
•   Jamshedpur  
•   Dhanbad  
•   Bokaro  
(Contact Department of Transport for updated list & locations)

---

COMPLETE PROCESS:

Step 1: Assessment
• Take old vehicle to authorized scrappage center
• Vehicle inspection & valuation
• Receive quotation for scrap value

Step 2: Scrapping
• Surrender RC and other documents
• Vehicle dismantled as per rules
• Receive:
  a) Scrap metal value (paid to you)
  b)   Certificate of Deposit (scrappage certificate)  

Step 3: EV Purchase
• Buy new EV within 6 months
• Keep scrappage certificate

Step 4: Apply for Combined Benefit
• Apply for EV subsidy (standard process)
•   Also submit   scrappage certificate
• Tick "scrappage benefit" in application

Step 5: Receive Total Benefit
• Standard EV subsidy: 60-90 days
• Scrappage bonus: Along with EV subsidy
• Both credited to same bank account

---

WHY SCRAPPAGE IS BENEFICIAL:

  Environmental:  
• Remove high-polluting old vehicles
• Reduce emissions by 50-70%
• Cleaner air for all

  Financial:  
✓ Scrap value: Rs 5,000-30,000 (depending on vehicle)
✓ Scrappage bonus: Rs 5,000-25,000
✓ EV subsidy: Rs 10,000-1,50,000
✓ Road tax savings: Rs 2,000-2,00,000
✓   Total:   Up to Rs 3.75 Lakhs!

  Plus Operational Savings:  
• No fuel cost (electricity is 1/5th the cost)
• Lower maintenance
• No pollution certificate hassles

---

EXAMPLE CALCULATION:

  Old Maruti 800 (2008 model) → New Tata Tiago EV:  
- Scrap value: Rs 15,000
- Scrappage bonus: Rs 25,000
- EV purchase subsidy: Rs 1,50,000
- Road tax waiver: Rs 80,000
-   Total Benefit: Rs 2,70,000  
-   Effective EV Cost: Rs 4.30 Lakhs (instead of Rs 7 Lakhs)  

---

IMPORTANT NOTES:
• Scrappage certificate valid for 6 months only
• Old vehicle must be physically scrapped (not sold)
• No benefit if old vehicle is from other states
• RC must be cancelled after scrapping

---

 NEED HELP?
Contact your nearest District Transport Office or authorized scrappage center.

Want details on EV purchase subsidies, manufacturing incentives, or application procedures?`
    },
    
    // ==================== APPLICATION PROCESS (DETAILED) ====================
    {
      keywords: /apply|application|how.*to|procedure|process|steps|documentation|documents|eligibility|portal/i,
      response: ` Complete Application Guide (Jharkhand EV Policy 2022)

---

 FOR EV BUYERS (Consumer Subsidy)

OVERVIEW:
✅   Timeframe:   60-90 days from application
✅   Mode:   Online (State EV Portal) or Offline (District Industries Center)
✅   Subsidy:   Directly credited to bank account

---

###   STEP-BY-STEP PROCESS:  

 STEP 1: PURCHASE ELECTRIC VEHICLE
• Buy from authorized dealer
• Ensure model is FAME-II approved
• Collect:
  - Purchase invoice (original)
  - Dealer certificate
  - Battery warranty card

 STEP 2: VEHICLE REGISTRATION
• Visit Jharkhand RTO within your district
• Register vehicle
• ✨ Automatically get 100% road tax waiver
• Receive Registration Certificate (RC)

 STEP 3: SUBMIT SUBSIDY APPLICATION
•   Timeline:   Within 30 days of RC issuance
•   Portal:   [State EV Portal - link to be announced]
• Alternative: Visit nearest District Industries Center (DIC)
• Generate Application ID

 STEP 4: UPLOAD DOCUMENTS

  Required Documents:  
✓   Vehicle Invoice:   Original purchase invoice
✓   RC Copy:   Registration certificate
✓   Identity Proof:   Aadhaar card (for individuals) OR GST certificate (for companies/institutions)
✓   Bank Details:   Passbook 1st page OR cancelled cheque
✓   Scrappage Certificate:   If claiming scrappage benefit (optional)
✓   Self-Declaration:   Eligibility & terms acceptance

  Document Format:   PDF/JPG, Max 2 MB each

 STEP 5: VERIFICATION
• DIC officials verify application
• Physical vehicle inspection (if required)
• Approval/rejection within 30 days
• Track status online via Application ID

 STEP 6: SUBSIDY DISBURSEMENT
• Amount credited directly to bank via RTGS/NEFT
•   Timeline:   60-90 days from approval
• SMS & email notification sent
• Download disbursement certificate from portal

---

 SUBSIDY AMOUNTS (Quick Reference):
•   2W:   Up to Rs 10,000
•   3W:   Up to Rs 30,000
•   4W:   Up to Rs 1,50,000
•   E-Bus:   Up to Rs 20,00,000
•   Goods Carrier:   Rs 30,000 - Rs 2,00,000

---

 FOR MANUFACTURERS (Industrial Units)

###   PHASE 1: IN-PRINCIPLE APPROVAL  

  Submit to:   Department of Industries, Govt. of Jharkhand

  Documents Required:  
✓ Detailed Project Report (DPR)
✓ Company registration documents
✓ Memorandum & Articles of Association
✓ PAN & GST registration
✓ Land requirement details (location preference, area)
✓ Investment plan & phasing
✓ Employment generation projections
✓ Manufacturing process flow diagram
✓ Environment clearance plan
✓ Power requirement estimate

  Timeline:   Approval within 30 days

---

###   PHASE 2: LAND ALLOTMENT & SETUP  

• Land allotted at industrial area/park
• Execute lease deed & pay stamp duty (refundable)
• Obtain building approvals
• Complete factory construction
• Install machinery

  Timeline:   Must commence production within 3 years

---

###   PHASE 3: COMMENCEMENT OF PRODUCTION  

• Obtain necessary licenses:
  - Factory license
  - Pollution Control Board NOC
  - Fire safety certificate
  - GST registration
• Start commercial production
• Apply for final incentive approval

  Documents:  
✓ Production commencement certificate
✓ GST returns (1st quarter)
✓ Proof of investment (CA-certified)
✓ Employment details (Form 16, ESI/EPF records)
✓ Power connection details

---

###   PHASE 4: INCENTIVE DISBURSEMENT  

  Different incentives have different claim processes:  

  a) Capital Interest Subsidy:  
-   Claim:   Quarterly after production starts
-   Submit:   Term loan statement, interest payment proof
-   Credit:   Within 60 days

  b) SGST Reimbursement:  
-   Claim:   Annually against GST returns
-   Submit:   Annual GST returns, sale invoices
-   Credit:   Within 90 days

  c) Electricity Duty Exemption:  
-   Process:   Automatic (adjusted in monthly bills)
-   No separate claim   needed

  d) Stamp Duty Reimbursement:  
-   Claim:   One-time after land registration
-   Submit:   Land deed, payment receipts
-   Credit:   Within 90 days

  e) EPF Reimbursement:  
-   Claim:   Monthly/Quarterly
-   Submit:   EPF payment challans, employee list
-   Credit:   Within 30 days

---

 FOR CHARGING STATION OPERATORS

###   STEP 1: EXPRESSION OF INTEREST (EOI)  

  Submit to:   Department of Energy, Govt. of Jharkhand

  Documents:  
✓ Company/individual registration
✓ PAN & GST (if applicable)
✓ Proposed location details:
  - GPS coordinates
  - Site photos (current state)
  - Land ownership/lease proof (if available)
  - Accessibility map
✓ Technical plan:
  - Charger types (AC/DC)
  - Number of charging points
  - Total capacity (kW)
  - Equipment make/model
✓ Financial plan:
  - Total investment
  - Funding source
  - Revenue model
  - Projected tariffs

---

###   STEP 2: SITE APPROVAL  
• Department conducts site inspection
• Feasibility study (electrical infrastructure, accessibility)
•   Timeline:   Approval within 30 days
• Receive site allotment letter

---

###   STEP 3: INSTALLATION  
• Procure BIS-certified charging equipment
• Complete civil works:
  - Foundation
  - Canopy (if applicable)
  - Approach road
  - Parking markings
• Electrical works:
  - HT/LT connection from DISCOM
  - Internal wiring
  - Safety systems (ELCB, MCB, surge protection)
• Install:
  - Charging equipment
  - Metering system
  - Signage
  - CCTV
  - Payment terminal

  Timeline:   Complete within 6 months

---

###   STEP 4: COMMISSIONING  
• DISCOM electrical safety inspection
• Obtain electricity connection approval
• Testing of all charging points
• Receive commissioning certificate
•   Register on state EV portal   (mandatory for subsidy)

---

###   STEP 5: SUBSIDY CLAIM  

  Documents:  
✓ Equipment purchase invoices
✓ Installation work bills
✓ Commissioning certificate
✓ DISCOM connection approval
✓ Photos of installed station
✓ Bank details

  Submit to:   Department of Energy
  Timeline:   Within 90 days of commissioning
  Subsidy Credit:   Within 90 days of claim

---

HELPLINES & SUPPORT

  State EV Cell:  
•   Address:   Department of Industries, Project Bhawan, Dhurwa, Ranchi - 834004
•   Phone:   0651-2490337
•   Email:   [To be notified]

  District Industries Centers (DICs):  
Available in all 24 districts across Jharkhand

  Online Resources:  
•   State Portal:   [Under development]
•   Track Application:   Via Application ID
•   Download Forms:   From official website

---

PROCESSING TIMES (Summary)

| Application Type | Processing Time |
|---|---|
| Consumer EV Subsidy | 60-90 days |
| Manufacturing Approval | 30 days (in-principle) |
| Capital Interest Subsidy | Quarterly disbursement |
| SGST Reimbursement | Annual disbursement |
| Charging Station Subsidy | 90 days post-commissioning |

---

PRO TIPS:
✅ Keep all original documents & multiple photocopies
✅ Apply online for faster processing
✅ Upload clear, legible document scans
✅ Follow up with Application ID after 30 days
✅ Ensure bank account is active & correctly linked
✅ For rejections, reapply with corrections within 15 days

---

Need specific details on any application type - consumer, manufacturing, or charging infrastructure?`
    },
    
    // ==================== POLICY OVERVIEW (COMPREHENSIVE) ====================
    {
      keywords: /policy|overview|detail|summary|vision|goal|objective|about|general.*information|validity|duration/i,
      response: ` Jharkhand Electric Vehicle Policy 2022 - Complete Overview

---

 POLICY FUNDAMENTALS

  Notification Date:   October 6, 2022  
  Validity Period:   5 years (till October 5, 2027)  
  Nodal Department:   Department of Industries, Government of Jharkhand  
  Supporting Departments:   Transport, Energy, Environment  
  Implementing Agency:   State EV Cell  

---

 VISION & MISSION

  Vision:    
Transform Jharkhand into the   preferred EV manufacturing destination   in Eastern India and create a   sustainable, carbon-neutral transport ecosystem  .

  Key Missions:  
1. ✨ Attract   Rs 5,000+ Crore   investment in EV manufacturing
2. ✨ Achieve   10% EV share   in new vehicle registrations by 2027
3. ✨ Generate   10,000+ direct employment   opportunities
4. ✨ Establish   2,500+ public charging stations  
5. ✨ Reduce transport sector   carbon emissions by 20%  

---

 STRATEGIC OBJECTIVES

1. DEMAND CREATION (Consumer Side) 🚗
  Goal:   Make EVs financially attractive
• Target: Register 1,00,000+ EVs by 2027
• Subsidies: Rs 5,000/kWh for 2W/3W/4W
• Tax Benefits: 100% road tax waiver
• Scrappage: Additional incentive for old vehicle replacement
• Awareness: State-wide campaigns

2. SUPPLY DEVELOPMENT (Manufacturing Side) 🏭
  Goal:   Establish robust EV manufacturing ecosystem
• Attract OEMs & component manufacturers
• Fiscal incentives: Interest subsidy, SGST reimbursement, tax exemptions
• Non-fiscal support: Land, power, skilled workforce
• R&D grants for innovation
• Target: 15+ large units, 100+ MSMEs

3. INFRASTRUCTURE DEVELOPMENT ⚡
  Goal:   Dense, accessible charging network
• Urban: 1 station every 3 km
• Highways: 1 fast charger every 25 km
• Equipment subsidy: 25% (Max Rs 10 L)
• Concessional tariffs: 15% below industrial rate
• Battery swapping for 2W/3W

4. WORKFORCE DEVELOPMENT 👨‍🎓
  Goal:   Skilled EV workforce
• Train 5,000+ youth in EV technologies
• Skill courses at ITIs & polytechnics
• Industry-academia partnerships
• Entrepreneurship support
• Women & SC/ST focus

---

 KEY POLICY FEATURES

###   A. DEMAND-SIDE INCENTIVES (Consumer Benefits)  
  Purchase Subsidies:  
• 2-Wheelers: Max Rs 10,000
• 3-Wheelers: Max Rs 30,000
• 4-Wheelers: Max Rs 1,50,000
• E-Buses: Max Rs 20,00,000
• Goods Carriers: Rs 30,000-2,00,000

  Tax Waivers:  
• 100% Road Tax exemption
• 100% Registration Fee waiver

  Scrappage:  
• 2W/3W: Extra Rs 5,000
• 4W: Extra Rs 25,000

---

###   B. SUPPLY-SIDE INCENTIVES (Manufacturing Benefits)  
  Financial:  
• Capital Interest Subsidy: 6% for 5 years (Max Rs 15-30 Cr)
• SGST Reimbursement: 75-100% for 5-10 years
• Stamp Duty: 100% reimbursement
• Electricity Duty: 100% exemption for 5 years

  Workforce:  
• Skill Training: Rs 5,000/employee/month for 6 months
• EPF Reimbursement: 100% for 5 years

  R&D:  
• R&D Grant: 50% (Max Rs 50 L/year for 3 years)
• Patent Filing: 50% support (Max Rs 2 L/patent)

---

###   C. INFRASTRUCTURE INCENTIVES  
  Charging Stations:  
• Equipment Subsidy: 25% (Max Rs 10 L)
• Concessional Electricity: 15% below industrial
• Demand Charge: 50% reduction
• Land: 50% of circle rate

  Battery Swapping:  
• Subsidy: 25% (Max Rs 5 L)

---

 TARGET MANUFACTURING SECTORS

  Vehicles:  
• Electric 2-wheelers
• Electric 3-wheelers (passenger & cargo)
• Electric 4-wheelers (cars)
• E-buses (city & intercity)
• Electric goods carriers

  Components & Systems:  
• Lithium-ion batteries & battery packs
• Electric motors (BLDC, PMSM)
• Motor controllers & inverters
• Battery Management Systems (BMS)
• Power electronics
• Charging equipment (AC/DC chargers)
• Cables, connectors, harnesses

  Services:  
• Charging station operation
• Battery swapping networks
• EV maintenance & servicing
• Fleet management
• EV financing & insurance

---

 EXPECTED OUTCOMES (By 2027)

  Economic:  
• Investment: Rs 5,000+ Crore
• Annual Output: Rs 10,000+ Crore
• Employment: 10,000+ direct jobs

  Manufacturing:  
• Large Units: 15+
• MSMEs: 100+
• Component Suppliers: 200+

  Adoption:  
• EV Registrations: 1,00,000+
• Market Share: 10% of new vehicles
• Public Charging Stations: 2,500+

  Environmental:  
• Carbon Reduction: 20% in transport sector
• Emission Savings: 5 lakh tonnes CO2 equivalent/year
• Fuel Savings: 200 million liters/year

---

 INSTITUTIONAL MECHANISM

###   State EV Cell  
•   Role:   Single-window clearance, policy implementation
•   Functions:  
  - Fast-track approvals
  - Monitor targets & outcomes
  - Coordinate between departments
  - Resolve grievances
•   Location:   Department of Industries, Ranchi

###   EV Advisory Committee  
•   Chair:   Chief Secretary, Govt. of Jharkhand
•   Members:   Industry, academia, govt. officials
•   Role:   Quarterly policy review, course corrections

###   District-Level Implementation  
•   24 District Industries Centers (DICs)  
• Local facilitation & support
• Application processing
• Ground-level monitoring

---

 BUDGETARY ALLOCATION

  Total Outlay (5 years):   Rs 500-600 Crore (estimated)

  Component-wise:  
• Consumer Subsidies: 40%
• Manufacturing Incentives: 45%
• Charging Infrastructure: 10%
• Administration & Awareness: 5%

  Funding Sources:  
• State Budget
• Central schemes (FAME-II)
• Public-Private Partnerships (PPP)

---

 SPECIAL PROVISIONS

###   For Women Entrepreneurs  
• Additional 2% interest subsidy
• Priority land allotment
• Extra Rs 2,000 on 2W purchase
• Free mentorship

###   For SC/ST  
• Stamp duty: 125% reimbursement (25% grant)
• Capital subsidy: 8% (instead of 6%)
• Extra Rs 3,000 (2W/3W), Rs 10,000 (4W)

###   For Persons with Disabilities (Divyang)  
• Extra Rs 15,000 (2W/3W), Rs 50,000 (4W)
• 100% parking fee exemption
• Priority charging access

---

 IMPORTANT NOTES

  Applicability:  
• Policy effective from Oct 6, 2022
• Benefits valid till Oct 5, 2027
• First-come, first-served for capped incentives

  Compliance:  
• Incentives subject to continued compliance
• Annual audits for manufacturing units
• Subsidy may be recovered for violations

  Amendments:  
• Govt. reserves right to amend provisions
• Stakeholder consultation for major changes
• Amendments notified in official gazette

---

 CONTACT INFORMATION

  Department of Industries  
•   Address:   Project Bhawan, Dhurwa, Ranchi - 834004
•   Phone:   0651-2490337
•   Email:   [To be notified]
•   Website:   [Official portal under development]

  Toll-Free Helpline:   [To be announced]

  District Industries Centers:   Available in all 24 districts

---

 ONLINE RESOURCES

  Coming Soon:  
• State EV Portal (application tracking)
• Downloadable forms & guidelines
• Approved dealer/manufacturer list
• Charging station map
• FAQs & video tutorials

---

 COMPLEMENTARY POLICIES

This EV Policy complements:
• Jharkhand Industrial & Investment Promotion Policy 2021
• Jharkhand Renewable Energy Policy
• Jharkhand Start-up Policy
• Skill Development Mission, Jharkhand

---

 Jharkhand EV Policy 2022: Driving towards a sustainable future!

---

Want specific details on consumer benefits, manufacturing incentives, charging infrastructure, or application processes?`
    }
  ];
  
  // Check for keyword matches
  for (const { keywords, response } of keywordResponses) {
    if (keywords.test(query)) {
      return sanitizeResponse(response.trim());
    }
  }
  
  // Default fallback when no keywords match
  return sanitizeResponse(`Thank you for reaching out!

As the   Jharkhand Policy Bot  , I provide comprehensive information about the   Jharkhand Electric Vehicle Policy 2022  .

   Topics I cover:  

   FOR EV BUYERS:  
• Purchase subsidies (2W, 3W, 4W, e-buses, goods carriers)
• Road tax waivers & registration exemptions
• Scrappage benefits
• Application process

   FOR MANUFACTURERS:  
• MSME & large unit incentives
• Capital subsidies, tax benefits, SGST reimbursement
• Land allotment, power concessions
• R&D support

   FOR CHARGING STATIONS:  
• Equipment subsidies
• Concessional electricity
• Land & setup support

   GENERAL INFO:  
• Policy vision & goals
• Timelines & validity
• Complete documentation guide

   Try these questions:  
• "What are 2-wheeler subsidies?"
• "Manufacturing incentives for MSME?"
• "How to set up charging station?"
• "Road tax waiver details?"
• "Complete application process?"

  How can I help you today?   😊`);
};
