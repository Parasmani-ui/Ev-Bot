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

  // If a keyword matched locally, return it immediately — no API quota used
  const localResponse = getFallbackResponse(userPrompt);
  if (!localResponse.startsWith('I can help you with questions about the Jharkhand Electric Vehicle Policy 2022.')) {
    return localResponse;
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
function getFallbackResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  // Greeting
  if (/^(hello|hi|hey|help|namaste|namaskar)$/i.test(msg.trim())) {
    return `Hello! I am the Jharkhand EV Policy Bot.

I can answer your questions about the Jharkhand Electric Vehicle Policy 2022. Here are some topics you can ask about:

- EV buyer subsidies and incentives
- Road tax and registration fee exemptions
- Charging infrastructure plans
- Manufacturer incentives (MSME and large units)
- Eligible vehicles and organizations
- Policy objectives and vision
- Government employee benefits

How can I help you today?`;
  }

  // Bot identity
  if (/what (is|are) (you|this bot|jharkhand policy bot)|what can (you|i) (do|ask|help)/i.test(msg)) {
    return `I am the Jharkhand EV Policy Bot — an official AI assistant for the Jharkhand Electric Vehicle Policy 2022, published by the Department of Industries, Government of Jharkhand on 7th October 2022.

I can answer questions about:
- EV buyer incentives and subsidies
- Charging infrastructure targets and incentives
- Manufacturer fiscal benefits
- Road tax and registration exemptions
- Eligible vehicles, sectors, and organizations
- Policy objectives, vision, and validity`;
  }

  // Vehicle types
  if (/vehicle.*type|type.*vehicle|which.*vehicle|vehicle.*cover|cover.*vehicle|eligible.*vehicle/i.test(msg)) {
    return `The following vehicle types are covered under the Jharkhand EV Policy 2022 (Section 5.1):

- Buses (Electric Vehicle technology only)
- Four Wheelers: Electric (EV), Plug-in Hybrid (PHEV), Strong Hybrid (SHEV)
- Three Wheelers (Electric) including Registered E-Rickshaws
- Two Wheelers (Electric)

Note: The policy also covers related sectors such as EV battery manufacturers, auto-component units, ancillary units, and charging station infrastructure — but these are eligible sectors, not vehicle types.`;
  }

  // Demand side incentives / buyer subsidies
  if (/subsid|incentive|discount|benefit.*buy|buyer|purchase|demand.*side|2.*wheel|3.*wheel|4.*wheel|scooter|car.*incentive|electric.*car|electric.*bike|electric.*auto|electric.*bus/i.test(msg)) {
    return `The Jharkhand EV Policy 2022 provides the following demand-side incentives (Section 7.3.1) for FAME II approved vehicles, in addition to central FAME II incentives:

- e-2W (L1 & L2): INR 5,000/kWh, maximum INR 10,000 per vehicle, up to 1,00,000 vehicles
- e-3W autos (L5M): INR 5,000/kWh, maximum INR 30,000 per vehicle, up to 15,000 vehicles
- e-3W goods carrier (L5N): INR 5,000/kWh, maximum INR 30,000 per vehicle, up to 10,000 vehicles
- e-4W cars (M1): INR 5,000/kWh, maximum INR 1,50,000 per vehicle, up to 10,000 vehicles
- e-4W goods carrier (N1): INR 5,000/kWh, maximum INR 1,00,000 per vehicle, up to 10,000 vehicles
- e-buses: 10% of ex-factory cost, maximum INR 20,00,000 per bus, up to 1,000 buses (for State Transport Undertaking buses only)

Additionally, State Government employees of Jharkhand can avail a 100% interest-free loan for the purchase of their FIRST electric vehicle (2-wheeler or 4-wheeler only) — Section 7.3.2.`;
  }

  // Road tax / registration
  if (/road.*tax|tax.*waiver|registration.*fee|fee.*exemption|motor.*vehicle.*tax|tax.*exempt/i.test(msg)) {
    return `Road Tax and Registration Fee Exemptions under the Jharkhand EV Policy 2022 (Section 7.3.4):

Vehicles manufactured WITHIN Jharkhand:
- 100% exemption for the first 10,000 buyers
- 75% exemption for buyers 10,001 to 15,000
- 25% exemption after 15,000 buyers up to the policy period

Vehicles manufactured OUTSIDE Jharkhand:
- 25% exemption on road tax up to the policy period
- 25% exemption on vehicle registration fees up to the policy period`;
  }

  // Charging infrastructure
  if (/charg|station|infrastructure|battery.*swap|connector|charger/i.test(msg)) {
    return `EV Charging Infrastructure under the Jharkhand EV Policy 2022:

Targets (Section 3.2):
- At least one public charging station per 3 km x 3 km grid OR minimum 50 charging stations per million population, whichever is higher
- Charging stations every 25 km on both sides of all National Highways and major State Highways

Incentives for Charging Stations (Section 7.3.6):
- Slow chargers: 60% of cost, maximum INR 10,000 per station, up to 15,000 stations
- Moderate/Fast chargers: 50% of cost, maximum INR 5,00,000 per station, up to 500 stations
- Solar-based fast chargers (≥75% solar energy): 70% of cost, maximum INR 7,00,000 per station, up to 500 stations

Note: Stations already availing FAME II charging infrastructure incentive are NOT eligible for these state incentives. Petrol pumps are allowed to set up charging stations subject to fire and safety norms.`;
  }

  // Manufacturing incentives
  if (/manufactur|msme|industry|factory|production|supply.*side|plant|capital|investment|unit.*set.*up/i.test(msg)) {
    return `Manufacturing Incentives under the Jharkhand EV Policy 2022 (Section 7.1):

1. CPIS (Comprehensive Project Investment Subsidy):
   - MSME: 30% of Fixed Capital Investment
   - Micro units: max Rs. 2 Crore
   - Small units: max Rs. 7 Crore
   - Medium units: max Rs. 15 Crore
   - Non-MSME units: max Rs. 30 Crore
   - SC/ST/Women/Differently-abled (Jharkhand residents): additional 5%

2. Stamp Duty & Registration: 100% reimbursement for land purchased from raiyats

3. Land Cost: 50% rebate on land lease premium (for units allotted land within 2 years of notification, commencing production within 15 months)

4. Quality Certification: 100% of expenditure up to Rs. 10 lakh

5. Patent Registration: 50% of expenditure up to Rs. 10 lakhs per patent

6. Interest Subsidy: 6% per annum for 5 years
   - Micro: max Rs. 15 Lakhs
   - Small: max Rs. 50 Lakhs
   - Medium: max Rs. 1 Crore
   - Non-MSME: max Rs. 3 Crores

7. Anchor Unit Subsidy: Additional 5% capital subsidy (first 2 anchor units per district)

8. Early Bird Subsidy: Additional 5% capital subsidy for units set up within 2 years of notification`;
  }

  // Government employees
  if (/govt.*employ|government.*employ|employ.*govern|sarkari.*naukar|state.*employ/i.test(msg)) {
    return `Yes, State Government employees of Jharkhand have a specific benefit under the policy (Section 7.3.2):

100% interest-free advance/loan for the purchase of the FIRST Electric Vehicle.

This benefit is applicable for:
- Electric 2-wheelers
- Electric 4-wheelers

This is available only to Government employees of the State of Jharkhand.`;
  }

  // Vision
  if (/vision|mission/i.test(msg)) {
    return `The Vision of the Jharkhand Electric Vehicle Policy 2022 (Section 3.1):

"To ensure balanced economic development of the state by favoring Electric Vehicle manufacturing sector and to provide maximum benefits to all stakeholders by establishing Jharkhand as an EV hub in India."`;
  }

  // Objectives / targets
  if (/objective|target|goal|aim|2027|2030/i.test(msg)) {
    return `Main Objectives of the Jharkhand EV Policy 2022 (Section 3.2):

a) Make Jharkhand the most preferred destination for EV manufacturing in Eastern India
b) Faster adoption of EVs with a carbon-neutral transport vision
c) Identify and address key infrastructure gaps
d) Phase-wise shift from ICE to EVs by 2030
e) Establish ACC battery manufacturing projects by 2027
f) Establish a Centre of Excellence for EV in partnership with Industry and Academia by 2027
g) Target 10% share of EVs in new vehicle registration by 2027:
   - All vehicles: 10%
   - 2-wheelers: 10%
   - 3-wheelers: 20%
   - 4-wheelers: 10%
h) At least one public charging station per 3 km x 3 km grid OR minimum 50 per million population
i) Charging stations every 25 km on both sides of all National Highways and State Highways
j) Convert 15-year-old Government owned/leased vehicles to EVs`;
  }

  // Validity / duration
  if (/valid|validity|duration|how long|period|till when/i.test(msg)) {
    return `The Jharkhand Electric Vehicle Policy 2022 is valid for 5 years from the date of gazette notification (Section 4).

The notification was published on 7th October 2022.`;
  }

  // Nodal agency / department / implementation
  if (/nodal|department|implement|agency|who.*implement|which.*department/i.test(msg)) {
    return `The Department of Industries, Government of Jharkhand is the nodal agency responsible for implementation of the Jharkhand EV Policy 2022 (Section 6).

Applications for incentives are submitted on the Single Window Clearance (SWC) portal of the Department of Industries. The department also provides hand-holding support for land allotment through JIADA and other applicable clearances.`;
  }

  // Eligible organizations
  if (/organization|organisation|eligible.*org|who.*eligible|proprietor|partnership|pvt|private.*limited|public.*limited|psu|joint.*venture/i.test(msg)) {
    return `The following types of organizations are eligible for benefits under the Jharkhand EV Policy 2022 (Section 5.2):

- Proprietorship firm
- Registered partnership firm
- Private Limited Company
- Limited Liability Registered Partnership firm
- Public Limited Company
- Government Company
- State/Central Public Sector Undertaking
- Joint Venture`;
  }

  // EV definition
  if (/definition|what.*is.*ev|ev.*mean|electric.*vehicle.*mean|define.*ev/i.test(msg)) {
    return `As per Section 9.4 of the Jharkhand EV Policy 2022:

Electric Vehicle (EV) refers to all automobiles using an electric motor driven by batteries, ultra-capacitors, or fuel cells.

This includes:
- Hybrid Electric Vehicles (HEV)
- Plug-in Hybrid Electric Vehicles (PHEV)
- Battery Electric Vehicles (BEV)
- Fuel Cell Electric Vehicles (FCEV)

Across 2-wheeler, 3-wheeler, and 4-wheeler categories.`;
  }

  // Battery warranty / buyback
  if (/warranty|buyback|buy.*back|battery.*warrant/i.test(msg)) {
    return `Battery Warranty and Buyback Incentives under Section 7.3.5 (applicable for 2-wheelers and 3-wheelers only):

1. Assured Buyback (vehicle up to 5 years old, value reduced by not more than 7.5% per year):
   - 6% of total vehicle cost, capped at INR 10,000

2. Battery warranty of at least 5 years:
   - 4% of total vehicle cost, capped at INR 6,000

Both incentives can be availed simultaneously, but the total is capped at INR 12,000.`;
  }

  // Non-fiscal benefits / parking
  if (/parking|lane|non.*fiscal|residential|park.*free/i.test(msg)) {
    return `Non-Fiscal Benefits under Section 8 of the Jharkhand EV Policy 2022:

- Urban local bodies are encouraged to provide lane and parking preferences to EVs
- Developers of new residential projects are encouraged to provide EV-ready parking options from 2022 onwards
- All future public parking spaces allotted by bidding process shall provide FREE parking to EVs`;
  }

  // Out of scope / unrelated
  if (/prime.*minister|president|cricket|weather|film|movie|capital.*jharkhand|ranchi/i.test(msg)) {
    return `This specific detail is not mentioned in the Jharkhand EV Policy 2022. I can only answer questions related to the Jharkhand Electric Vehicle Policy 2022.`;
  }

  // Default fallback
  return `I can help you with questions about the Jharkhand Electric Vehicle Policy 2022. Here are some topics you can ask about:

- Vehicle types covered under the policy
- EV buyer subsidies (2W, 3W, 4W, buses)
- Road tax and registration fee exemptions
- Charging station targets and incentives
- Manufacturing incentives for MSME and large units
- Government employee benefits
- Policy vision, objectives, and validity
- Eligible organizations and sectors

Please rephrase your question or choose one of the topics above.`;
}
