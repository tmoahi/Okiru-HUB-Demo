const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── Okiru LMS Data ──────────────────────────────────────────────────────────

const COURSES = [
  {
    id: 'bbbee-101',
    title: 'B-BBEE Scorecard Fundamentals',
    category: 'B-BBEE',
    level: 'Beginner',
    duration: '4h 30m',
    lessonCount: 9,
    description: "Master the B-BBEE Codes of Good Practice and learn how to accurately complete your organisation's scorecard across all seven elements.",
    instructor: { name: 'Sipho Dlamini', title: 'B-BBEE Advisory Lead, Okiru' },
    enrolled: 342, completionRate: 71, rating: 4.8, reviews: 124, color: '#06CDE1',
    modules: [
      {
        id: 'bbbee-101-m1', title: 'Understanding B-BBEE', order: 1,
        lessons: [
          { id: 'bbbee-101-m1-l1', title: 'What is Broad-Based Black Economic Empowerment?', type: 'reading', duration: '15 min', content: "B-BBEE (Broad-Based Black Economic Empowerment) is a South African government policy designed to redress the inequalities of Apartheid by giving previously disadvantaged groups economic opportunities previously not available to them.\n\nThe policy was formalised through the Broad-Based Black Economic Empowerment Act 53 of 2003, which created a legislative framework for the promotion of B-BBEE. This was followed by the Codes of Good Practice, gazetted in 2007 and revised in 2013, which provide the actual measurement framework that businesses use.\n\n**Why does B-BBEE matter for your business?**\n\nB-BBEE compliance affects your ability to do business with government entities, state-owned enterprises, and many large private-sector companies. A strong B-BBEE score can:\n\n- Unlock government tenders and contracts\n- Improve your standing as a supplier to JSE-listed companies\n- Attract BEE-compliant investment and funding\n- Strengthen your brand reputation in the South African market\n\n**Who must comply?**\n\nAll entities operating in South Africa are subject to B-BBEE compliance. Exempt Micro Enterprises (EMEs) with turnover below R10 million and Qualifying Small Enterprises (QSEs) with turnover between R10 and R50 million have simplified scorecards." },
          { id: 'bbbee-101-m1-l2', title: 'The Codes of Good Practice — Overview', type: 'video', duration: '22 min', content: 'This lesson covers the structure of the Amended Codes of Good Practice (2013), how they differ from the original 2007 Codes, and which sectors are covered by generic versus sector-specific charters.' },
          { id: 'bbbee-101-m1-l3', title: 'The Seven Elements of B-BBEE', type: 'reading', duration: '20 min', content: "The B-BBEE scorecard is made up of seven measurable elements:\n\n1. **Ownership (25 points)** — The extent to which black people own and control the enterprise. This is the highest-weighted element and includes voting rights, economic interest, and net value.\n\n2. **Management Control (15 points)** — The representation of black people and black women at board and senior management level.\n\n3. **Skills Development (20 points)** — Investment in the training and development of black employees, including learnerships and bursaries.\n\n4. **Enterprise & Supplier Development (40 points)** — The largest combined element, covering procurement from B-BBEE compliant suppliers, development of black-owned enterprises, and supplier development contributions.\n\n5. **Socio-Economic Development (5 points)** — Corporate social investment (CSI) contributions benefiting black communities.\n\n**Priority Elements**\n\nThree elements are designated priority elements: Ownership, Skills Development, and Enterprise & Supplier Development. Failure to achieve sub-minimum thresholds on these three elements results in your overall B-BBEE level being discounted by one level." },
        ],
        quiz: {
          id: 'bbbee-101-m1-q', title: 'Module 1 Assessment',
          questions: [
            { id: 'q1', question: 'Which Act formally legislated B-BBEE in South Africa?', options: ['The Constitution Act 108 of 1996', 'The Broad-Based Black Economic Empowerment Act 53 of 2003', 'The Labour Relations Act 66 of 1995', 'The Employment Equity Act 55 of 1998'], correct: 1 },
            { id: 'q2', question: 'What is the turnover threshold for an Exempt Micro Enterprise (EME)?', options: ['Below R5 million', 'Below R10 million', 'Below R50 million', 'Below R100 million'], correct: 1 },
            { id: 'q3', question: 'How many points is the Ownership element worth?', options: ['15', '20', '25', '40'], correct: 2 },
            { id: 'q4', question: 'What are the three B-BBEE priority elements?', options: ['Ownership, Management Control, Skills Development', 'Ownership, Skills Development, Enterprise & Supplier Development', 'Skills Development, ESD, Socio-Economic Development', 'Management Control, Skills Development, Ownership'], correct: 1 },
            { id: 'q5', question: 'What happens if a company fails the sub-minimum on a priority element?', options: ['They are disqualified entirely', 'Their B-BBEE level is discounted by one level', 'They receive a warning only', 'Their scorecard is recalculated'], correct: 1 },
          ],
        },
      },
      {
        id: 'bbbee-101-m2', title: 'Measuring Ownership & Management', order: 2,
        lessons: [
          { id: 'bbbee-101-m2-l1', title: 'Calculating Ownership Points', type: 'reading', duration: '25 min', content: 'Ownership measurement covers voting rights, economic interest, and net value. This lesson walks through the formula for each sub-element and common calculation pitfalls.' },
          { id: 'bbbee-101-m2-l2', title: 'Management Control Requirements', type: 'video', duration: '18 min', content: 'Covers board composition requirements, executive management thresholds, and how to document management control evidence for verification.' },
          { id: 'bbbee-101-m2-l3', title: 'Fronting vs Genuine Empowerment', type: 'reading', duration: '15 min', content: 'B-BBEE fronting is a criminal offence under the Act. This lesson clarifies the difference between legitimate empowerment structures and fronting practices, with real South African case examples.' },
        ],
        quiz: {
          id: 'bbbee-101-m2-q', title: 'Module 2 Assessment',
          questions: [
            { id: 'q1', question: 'Ownership on the B-BBEE scorecard includes which three sub-elements?', options: ['Voting rights, economic interest, net value', 'Shareholding, directors, employees', 'Black ownership, women ownership, youth ownership', 'Direct ownership, indirect ownership, BEE trust'], correct: 0 },
            { id: 'q2', question: 'B-BBEE fronting is classified as:', options: ['A regulatory infringement', 'A civil matter only', 'A criminal offence under the B-BBEE Act', 'An internal governance issue'], correct: 2 },
            { id: 'q3', question: 'Which body is responsible for B-BBEE verification?', options: ['SARS', 'The B-BBEE Commission', 'Accredited rating agencies', 'The Department of Trade and Industry'], correct: 2 },
            { id: 'q4', question: 'Management Control points are earned through representation at:', options: ['Operational level only', 'Board and senior management level', 'All employee levels equally', 'Junior management only'], correct: 1 },
            { id: 'q5', question: 'What is the maximum score for the Ownership element?', options: ['15', '20', '25', '30'], correct: 2 },
          ],
        },
      },
      {
        id: 'bbbee-101-m3', title: 'Skills Development & ESD', order: 3,
        lessons: [
          { id: 'bbbee-101-m3-l1', title: 'Skills Development Spend Requirements', type: 'reading', duration: '20 min', content: 'Skills Development requires a minimum annual spend of 6% of leviable amount on training for black employees. This lesson covers learnerships, internships, bursaries, and RPL programmes.' },
          { id: 'bbbee-101-m3-l2', title: 'Enterprise & Supplier Development', type: 'video', duration: '28 min', content: 'ESD is the highest-weighted element at 40 points combined. It covers preferential procurement, supplier development contributions (2% of NPAT), and enterprise development (1% of NPAT).' },
          { id: 'bbbee-101-m3-l3', title: 'Preparing for Verification', type: 'reading', duration: '22 min', content: 'A practical guide to document preparation for B-BBEE verification: what evidence each element requires, common audit findings, and how to work with your rating agency.' },
        ],
        quiz: {
          id: 'bbbee-101-m3-q', title: 'Module 3 Assessment',
          questions: [
            { id: 'q1', question: 'What is the minimum Skills Development spend as a % of leviable amount?', options: ['3%', '4%', '6%', '8%'], correct: 2 },
            { id: 'q2', question: 'Enterprise Development contributions must be at least what % of NPAT?', options: ['0.5%', '1%', '2%', '3%'], correct: 1 },
            { id: 'q3', question: 'What is the total combined points value of Enterprise & Supplier Development?', options: ['20', '30', '40', '50'], correct: 2 },
            { id: 'q4', question: 'Which of these is NOT a valid Skills Development programme?', options: ['Learnership', 'Bursary', 'Executive bonus scheme', 'Internship'], correct: 2 },
            { id: 'q5', question: 'Preferential Procurement falls under which element?', options: ['Skills Development', 'Management Control', 'Enterprise & Supplier Development', 'Socio-Economic Development'], correct: 2 },
          ],
        },
      },
    ],
  },
  {
    id: 'esg-201',
    title: 'ESG Reporting & Disclosure',
    category: 'ESG',
    level: 'Intermediate',
    duration: '5h',
    lessonCount: 9,
    description: 'Build a credible ESG reporting programme using global frameworks (GRI, TCFD, SASB) tailored to the South African regulatory landscape.',
    instructor: { name: 'Lerato Mokoena', title: 'ESG Strategy Director, Okiru' },
    enrolled: 218, completionRate: 64, rating: 4.7, reviews: 89, color: '#10e8a0',
    modules: [
      {
        id: 'esg-201-m1', title: 'ESG Fundamentals', order: 1,
        lessons: [
          { id: 'esg-201-m1-l1', title: 'What is ESG and Why It Matters in SA', type: 'reading', duration: '18 min', content: "Environmental, Social, and Governance (ESG) factors are non-financial criteria that investors and stakeholders use to evaluate a company's long-term sustainability. In South Africa, ESG is tied to King IV governance requirements, JSE Sustainability Disclosure Guidance, and international investor expectations.\n\n**The three pillars:**\n\n**Environmental** — Carbon emissions, water usage, waste management, biodiversity impact, climate risk.\n\n**Social** — Labour practices, B-BBEE compliance, community investment, supply chain ethics, employee wellbeing.\n\n**Governance** — Board composition, executive pay, anti-corruption, transparency, stakeholder engagement.\n\nFor South African companies, social factors are particularly prominent given the country's transformation agenda. ESG provides a structured framework to demonstrate progress on B-BBEE, community development, and environmental stewardship simultaneously." },
          { id: 'esg-201-m1-l2', title: 'Global ESG Frameworks — GRI, TCFD, SASB', type: 'video', duration: '25 min', content: 'An overview of the three major reporting frameworks: Global Reporting Initiative (GRI) for comprehensive sustainability disclosure, Task Force on Climate-related Financial Disclosures (TCFD) for climate risk, and Sustainability Accounting Standards Board (SASB) for industry-specific metrics.' },
          { id: 'esg-201-m1-l3', title: 'King IV and JSE Requirements', type: 'reading', duration: '20 min', content: 'King IV Report on Corporate Governance requires integrated reporting for JSE-listed companies. This lesson covers Principle 3 (responsible corporate citizenship), the role of the Social and Ethics Committee, and how ESG disclosure integrates with the Integrated Annual Report.' },
        ],
        quiz: {
          id: 'esg-201-m1-q', title: 'Module 1 Assessment',
          questions: [
            { id: 'q1', question: 'What does TCFD stand for?', options: ['Total Carbon Footprint Disclosure', 'Task Force on Climate-related Financial Disclosures', 'Transparency and Corporate Financial Disclosure', 'Transition to Carbon-Free Development'], correct: 1 },
            { id: 'q2', question: 'Which King Report introduced Integrated Reporting in South Africa?', options: ['King I', 'King II', 'King III', 'King IV'], correct: 2 },
            { id: 'q3', question: 'The "S" in ESG primarily covers:', options: ['Sales performance', 'Supply chain costs only', 'Labour practices, community investment, and social equity', 'Share price performance'], correct: 2 },
            { id: 'q4', question: 'GRI stands for:', options: ['Government Reporting Index', 'Global Reporting Initiative', 'General Risk Index', 'Green Revenue Indicator'], correct: 1 },
            { id: 'q5', question: 'King IV governance principles apply mandatorily to:', options: ['All South African companies', 'JSE-listed companies', 'Companies with more than 500 employees', 'State-owned entities only'], correct: 1 },
          ],
        },
      },
      {
        id: 'esg-201-m2', title: 'Materiality & Data Collection', order: 2,
        lessons: [
          { id: 'esg-201-m2-l1', title: 'Conducting a Materiality Assessment', type: 'reading', duration: '22 min', content: 'A materiality assessment identifies which ESG topics are most significant to your business and stakeholders. This lesson covers the double materiality concept, stakeholder mapping, and how to run a materiality workshop.' },
          { id: 'esg-201-m2-l2', title: 'ESG Data Collection Systems', type: 'video', duration: '20 min', content: 'Building reliable ESG data collection: which metrics to track, how to set up internal reporting systems, and how to manage data quality and assurance for external disclosure.' },
          { id: 'esg-201-m2-l3', title: 'Scope 1, 2 & 3 Emissions', type: 'reading', duration: '25 min', content: 'Understanding the GHG Protocol emissions scopes: Scope 1 (direct emissions), Scope 2 (purchased energy), and Scope 3 (value chain). This lesson covers calculation methodologies and how South African grid emission factors affect Scope 2 calculations.' },
        ],
        quiz: {
          id: 'esg-201-m2-q', title: 'Module 2 Assessment',
          questions: [
            { id: 'q1', question: 'Scope 2 emissions refer to:', options: ['Direct emissions from owned facilities', 'Emissions from purchased electricity and energy', 'All value chain emissions', 'Employee commuting emissions'], correct: 1 },
            { id: 'q2', question: 'A materiality assessment identifies:', options: ['Financial audit risks', 'ESG topics most significant to the business and stakeholders', 'Carbon offset opportunities only', 'Regulatory compliance gaps'], correct: 1 },
            { id: 'q3', question: '"Double materiality" means:', options: ['Reporting twice per year', 'Assessing both financial impact on the business AND business impact on society/environment', 'Using two different reporting frameworks', 'Requiring two independent auditors'], correct: 1 },
            { id: 'q4', question: 'Scope 3 emissions include:', options: ['Owned vehicle fleet only', 'On-site electricity use', 'Value chain emissions including suppliers and customers', 'Scope 1 emissions doubled'], correct: 2 },
            { id: 'q5', question: 'Which body developed the GHG Protocol?', options: ['United Nations', 'World Resources Institute and WBCSD', 'ISO', 'The World Bank'], correct: 1 },
          ],
        },
      },
      {
        id: 'esg-201-m3', title: 'Writing Your ESG Report', order: 3,
        lessons: [
          { id: 'esg-201-m3-l1', title: 'Report Structure and Narrative', type: 'reading', duration: '20 min', content: 'How to structure a compelling ESG report: executive summary, materiality matrix, performance data tables, forward-looking commitments, and stakeholder response sections.' },
          { id: 'esg-201-m3-l2', title: 'ESG Assurance and Verification', type: 'video', duration: '18 min', content: 'Third-party ESG assurance is increasingly required by investors. This lesson covers limited vs. reasonable assurance, how to select an assurance provider, and what auditors look for.' },
          { id: 'esg-201-m3-l3', title: 'Responding to ESG Ratings Agencies', type: 'reading', duration: '15 min', content: 'MSCI, Sustainalytics, and CDP are the main ESG ratings agencies. Learn how to respond to their questionnaires and improve your ESG ratings over time.' },
        ],
        quiz: {
          id: 'esg-201-m3-q', title: 'Module 3 Assessment',
          questions: [
            { id: 'q1', question: 'Which ESG ratings agency uses a letter grade system (AAA to CCC)?', options: ['Sustainalytics', 'CDP', 'MSCI ESG Ratings', 'Bloomberg ESG'], correct: 2 },
            { id: 'q2', question: 'CDP stands for:', options: ['Corporate Disclosure Programme', 'Carbon Disclosure Project', 'Climate Data Protocol', 'Corporate Development Plan'], correct: 1 },
            { id: 'q3', question: 'Limited assurance on an ESG report provides:', options: ['A guarantee that all data is correct', 'A lower level of confidence than reasonable assurance', 'No value to investors', 'The same as a financial audit'], correct: 1 },
            { id: 'q4', question: 'A materiality matrix plots ESG topics by:', options: ['Cost and timeline', 'Significance to stakeholders vs. significance to the business', 'Country and sector', 'Revenue impact and reputational impact'], correct: 1 },
            { id: 'q5', question: 'Which of these is NOT a standard ESG report section?', options: ['CEO message', 'Materiality assessment', 'Share price history', 'Performance data tables'], correct: 2 },
          ],
        },
      },
    ],
  },
  {
    id: 'ai-exec-301',
    title: 'AI Transformation for Executives',
    category: 'AI',
    level: 'Intermediate',
    duration: '3h 30m',
    lessonCount: 9,
    description: 'Equip your leadership team with a practical understanding of AI and how to drive an AI transformation strategy for your South African organisation.',
    instructor: { name: 'Andile Khumalo', title: 'AI Transformation Lead, Okiru' },
    enrolled: 184, completionRate: 58, rating: 4.9, reviews: 72, color: '#BA0DA7',
    modules: [
      {
        id: 'ai-exec-301-m1', title: 'AI Demystified', order: 1,
        lessons: [
          { id: 'ai-exec-301-m1-l1', title: 'What Executives Need to Know About AI', type: 'reading', duration: '18 min', content: "Artificial intelligence is not one technology — it is a family of techniques that enable machines to perform tasks that typically require human intelligence.\n\n**Key AI categories relevant to South African business:**\n\n- **Machine Learning** — Systems that learn patterns from data. Used in credit scoring, churn prediction, demand forecasting.\n- **Natural Language Processing** — AI that understands and generates text. Used in customer service chatbots, document analysis, compliance checks.\n- **Computer Vision** — AI that interprets images and video. Used in quality control, security, document scanning.\n- **Generative AI** — AI that creates content (text, images, code). Used in report drafting, marketing content, software development.\n\nThe critical executive question is not 'what can AI do?' but 'where does AI create enough value in our specific business to justify the investment?'" },
          { id: 'ai-exec-301-m1-l2', title: 'AI in the South African Context', type: 'video', duration: '20 min', content: 'How leading South African organisations are deploying AI, and what the implications are for transformation, employment, and the skills gap.' },
          { id: 'ai-exec-301-m1-l3', title: 'AI Risks and Governance', type: 'reading', duration: '18 min', content: 'AI introduces new risks: algorithmic bias, data privacy breaches (POPIA implications), explainability failures, and over-reliance on automated decisions. This lesson covers the governance structures executives need to manage AI responsibly.' },
        ],
        quiz: {
          id: 'ai-exec-301-m1-q', title: 'Module 1 Assessment',
          questions: [
            { id: 'q1', question: 'Which South African act governs the use of personal data in AI systems?', options: ['RICA', 'POPIA', 'FICA', 'ECTA'], correct: 1 },
            { id: 'q2', question: 'Generative AI primarily creates:', options: ['Physical products', 'New content such as text, images, and code', 'Database queries only', 'Financial forecasts exclusively'], correct: 1 },
            { id: 'q3', question: '"Narrow AI" refers to:', options: ['AI with limited computing power', 'AI designed for a specific task', 'AI that only works on small datasets', 'AI restricted to one country'], correct: 1 },
            { id: 'q4', question: 'Algorithmic bias occurs when:', options: ['The algorithm is too complex', 'Training data reflects historical inequalities, causing unfair outcomes', 'The AI runs too slowly', 'Cloud infrastructure fails'], correct: 1 },
            { id: 'q5', question: 'The primary governance concern when deploying AI for credit decisions is:', options: ['Cost of the AI model', 'Explainability and fairness of decisions', 'Speed of processing', 'Server location'], correct: 1 },
          ],
        },
      },
      {
        id: 'ai-exec-301-m2', title: 'Building an AI Strategy', order: 2,
        lessons: [
          { id: 'ai-exec-301-m2-l1', title: 'AI Readiness Assessment', type: 'reading', duration: '20 min', content: 'Before investing in AI, organisations must assess their readiness across four dimensions: data maturity, technology infrastructure, talent and skills, and organisational culture.' },
          { id: 'ai-exec-301-m2-l2', title: 'Prioritising AI Use Cases', type: 'video', duration: '22 min', content: 'How to evaluate and prioritise AI use cases using an impact-feasibility matrix. Covers quick wins, strategic bets, and which AI projects to avoid in the first phase.' },
          { id: 'ai-exec-301-m2-l3', title: 'AI Roadmap Development', type: 'reading', duration: '18 min', content: 'A step-by-step guide to building a 12-24 month AI transformation roadmap: governance setup, pilot selection, build vs. buy decisions, vendor evaluation, and change management.' },
        ],
        quiz: {
          id: 'ai-exec-301-m2-q', title: 'Module 2 Assessment',
          questions: [
            { id: 'q1', question: 'An AI readiness assessment evaluates:', options: ['Only IT infrastructure', 'Data, technology, talent, and culture', 'Financial capacity only', 'Regulatory compliance only'], correct: 1 },
            { id: 'q2', question: 'An impact-feasibility matrix helps:', options: ['Calculate ROI precisely', 'Prioritise AI use cases by value and implementation difficulty', 'Select AI vendors', 'Hire data scientists'], correct: 1 },
            { id: 'q3', question: 'In the "build vs. buy" AI decision, "buy" typically means:', options: ['Purchasing hardware', 'Using a pre-built AI service or API', 'Hiring more developers', 'Buying competitor companies'], correct: 1 },
            { id: 'q4', question: 'For a first AI pilot, the recommended approach is:', options: ['Start with highest-risk project', 'Select a quick win: high impact, low complexity', 'Automate the entire business at once', 'Begin with HR recruitment only'], correct: 1 },
            { id: 'q5', question: 'Change management in AI transformation primarily addresses:', options: ['Technical integration', 'Employee adoption, skill-building, and cultural readiness', 'Vendor negotiations', 'Data migration'], correct: 1 },
          ],
        },
      },
      {
        id: 'ai-exec-301-m3', title: 'Leading AI Change', order: 3,
        lessons: [
          { id: 'ai-exec-301-m3-l1', title: 'AI and the Future of Work in SA', type: 'reading', duration: '20 min', content: 'AI will automate approximately 25% of tasks across South African industries by 2030. This lesson addresses how to lead a workforce transition that is both productive and equitable, balancing automation with skills development and B-BBEE transformation commitments.' },
          { id: 'ai-exec-301-m3-l2', title: 'Communicating AI to Your Board', type: 'video', duration: '15 min', content: 'How to present an AI strategy to a board: framing business value, managing risk concerns, and getting buy-in for investment.' },
          { id: 'ai-exec-301-m3-l3', title: 'Measuring AI ROI', type: 'reading', duration: '15 min', content: 'Frameworks for measuring the return on AI investment: cost reduction metrics, revenue attribution, productivity gains, and qualitative benefits like improved decision quality.' },
        ],
        quiz: {
          id: 'ai-exec-301-m3-q', title: 'Module 3 Assessment',
          questions: [
            { id: 'q1', question: 'When presenting AI to a board, the primary focus should be on:', options: ['Technical architecture details', 'Business value and risk management', 'Data science methodology', 'Software licensing costs'], correct: 1 },
            { id: 'q2', question: 'AI ROI can be measured through:', options: ['Cost reduction only', 'Revenue attribution, productivity gains, and cost reduction', 'Share price movement only', 'Employee headcount reduction only'], correct: 1 },
            { id: 'q3', question: 'What % of tasks may AI automate in SA by 2030 (McKinsey estimate)?', options: ['5%', '10%', '25%', '75%'], correct: 2 },
            { id: 'q4', question: 'A responsible AI workforce transition should include:', options: ['Immediate mass retrenchment', 'Skills development and reskilling alongside automation', 'Freezing all hiring', 'Outsourcing all AI work offshore'], correct: 1 },
            { id: 'q5', question: 'Which of these is a qualitative AI benefit?', options: ['Cost per transaction', 'Improved decision quality', 'Time to process a claim', 'Revenue per sale'], correct: 1 },
          ],
        },
      },
    ],
  },
  {
    id: 'compliance-401',
    title: 'Compliance Training Bundle',
    category: 'Compliance',
    level: 'Beginner',
    duration: '6h',
    lessonCount: 9,
    description: 'A comprehensive compliance training programme covering POPIA, FICA, the Companies Act, and workplace safety requirements for South African organisations.',
    instructor: { name: 'Nomsa Vilakazi', title: 'Compliance Training Lead, Okiru' },
    enrolled: 401, completionRate: 79, rating: 4.6, reviews: 168, color: '#FF7512',
    modules: [
      {
        id: 'compliance-401-m1', title: 'POPIA — Data Protection', order: 1,
        lessons: [
          { id: 'compliance-401-m1-l1', title: 'POPIA Fundamentals', type: 'reading', duration: '25 min', content: "The Protection of Personal Information Act (POPIA, Act 4 of 2013) is South Africa's primary data protection law, fully in force since 1 July 2021.\n\n**The eight conditions for lawful processing:**\n\n1. **Accountability** — You must appoint an Information Officer\n2. **Processing limitation** — Collect only what you need\n3. **Purpose specification** — Be clear about why you collect data\n4. **Further processing limitation** — Don't use data beyond its original purpose\n5. **Information quality** — Keep data accurate and up to date\n6. **Openness** — Inform data subjects about processing\n7. **Security safeguards** — Protect data against loss or unauthorised access\n8. **Data subject participation** — Respect individuals' rights to access and correct their data\n\nNon-compliance with POPIA can result in fines of up to R10 million or imprisonment for up to 10 years." },
          { id: 'compliance-401-m1-l2', title: 'POPIA in Practice', type: 'video', duration: '20 min', content: 'Practical POPIA compliance: appointing an Information Officer, creating a PAIA manual, managing data subject requests, reporting breaches to the Information Regulator, and training staff.' },
          { id: 'compliance-401-m1-l3', title: 'AI and POPIA — Special Considerations', type: 'reading', duration: '18 min', content: 'Using AI with personal data creates specific POPIA risks: automated decision-making, profiling, cross-border data transfers, and consent management.' },
        ],
        quiz: {
          id: 'compliance-401-m1-q', title: 'Module 1 Assessment',
          questions: [
            { id: 'q1', question: 'When did POPIA come into full force in South Africa?', options: ['1 January 2020', '1 July 2021', '1 April 2022', '1 March 2023'], correct: 1 },
            { id: 'q2', question: 'The maximum fine for POPIA non-compliance is:', options: ['R1 million', 'R5 million', 'R10 million', 'R50 million'], correct: 2 },
            { id: 'q3', question: 'Which POPIA condition requires appointing an Information Officer?', options: ['Processing limitation', 'Accountability', 'Openness', 'Security safeguards'], correct: 1 },
            { id: 'q4', question: 'Under POPIA, a data breach must be reported to:', options: ['SARS', 'The Information Regulator', 'The Department of Justice', 'The South African Reserve Bank'], correct: 1 },
            { id: 'q5', question: 'POPIA applies to the processing of personal information of:', options: ['Employees only', 'South African citizens only', 'All data subjects whose information is processed in SA', 'Registered companies only'], correct: 2 },
          ],
        },
      },
      {
        id: 'compliance-401-m2', title: 'FICA & Anti-Money Laundering', order: 2,
        lessons: [
          { id: 'compliance-401-m2-l1', title: 'FICA Obligations for Accountable Institutions', type: 'reading', duration: '22 min', content: 'The Financial Intelligence Centre Act (FICA) requires accountable institutions — banks, attorneys, estate agents, accountants — to implement Know Your Customer (KYC) processes, monitor transactions, and report suspicious activities to the FIC.' },
          { id: 'compliance-401-m2-l2', title: 'Risk-Based Approach to AML', type: 'video', duration: '20 min', content: "FICA's risk-based approach requires institutions to assess their money laundering and terrorist financing risk and apply proportionate controls. Covers customer risk rating, enhanced due diligence, and transaction monitoring." },
          { id: 'compliance-401-m2-l3', title: 'Reporting Suspicious Transactions', type: 'reading', duration: '15 min', content: 'When and how to file Suspicious Transaction Reports (STRs) and Cash Threshold Reports (CTRs) with the FIC. Covers tipping-off prohibitions and staff obligations.' },
        ],
        quiz: {
          id: 'compliance-401-m2-q', title: 'Module 2 Assessment',
          questions: [
            { id: 'q1', question: 'FICA stands for:', options: ['Financial Integrity and Compliance Act', 'Financial Intelligence Centre Act', 'Financial Institution Credit Act', 'Fiscal Intelligence and Control Act'], correct: 1 },
            { id: 'q2', question: 'A Suspicious Transaction Report must be filed with:', options: ['SARS', 'The South African Police Service', 'The Financial Intelligence Centre', 'The Reserve Bank'], correct: 2 },
            { id: 'q3', question: '"Tipping off" under FICA means:', options: ['Paying informants', 'Alerting a client that they are under investigation — which is prohibited', 'Reporting above the threshold', 'Training staff on AML'], correct: 1 },
            { id: 'q4', question: 'Which of these is NOT an accountable institution under FICA?', options: ['Banks', 'Estate agents', 'Attorneys', 'Retail supermarkets'], correct: 3 },
            { id: 'q5', question: 'KYC stands for:', options: ['Keep Your Customers', 'Know Your Customer', 'Key Yield Calculation', 'Knowledge and Your Compliance'], correct: 1 },
          ],
        },
      },
      {
        id: 'compliance-401-m3', title: 'Workplace Compliance', order: 3,
        lessons: [
          { id: 'compliance-401-m3-l1', title: 'Employment Equity Act Requirements', type: 'reading', duration: '20 min', content: 'The Employment Equity Act 55 of 1998 requires designated employers to eliminate unfair discrimination and implement affirmative action. Covers the Employment Equity Plan and annual reporting to the Department of Labour.' },
          { id: 'compliance-401-m3-l2', title: 'Occupational Health & Safety', type: 'video', duration: '18 min', content: 'OHSA compliance: appointing a Health & Safety Representative, conducting risk assessments, incident reporting, and the legal duties of employers and employees.' },
          { id: 'compliance-401-m3-l3', title: 'Companies Act Compliance Essentials', type: 'reading', duration: '15 min', content: 'Key Companies Act 71 of 2008 requirements: annual returns, annual financial statements, director duties, and the role of the CIPC.' },
        ],
        quiz: {
          id: 'compliance-401-m3-q', title: 'Module 3 Assessment',
          questions: [
            { id: 'q1', question: 'The Employment Equity Act requires designated employers to submit annual reports to:', options: ['SARS', 'The Department of Employment and Labour', 'The B-BBEE Commission', 'The JSE'], correct: 1 },
            { id: 'q2', question: 'OHSA stands for:', options: ['Occupational Health and Safety Act', 'Organisational Hazard and Safety Assessment', 'Office Health Standards Authority', 'On-site Health and Safety Audit'], correct: 0 },
            { id: 'q3', question: 'The CIPC is responsible for:', options: ['Tax collection', 'Company registration and annual returns', 'B-BBEE verification', 'Banking regulation'], correct: 1 },
            { id: 'q4', question: 'An Employment Equity Plan must cover:', options: ['1 year', 'At least 1 year but not more than 5 years', '10 years', '6 months'], correct: 1 },
            { id: 'q5', question: 'Under the Companies Act, annual financial statements must be filed within:', options: ['30 days of year-end', '6 months of year-end', '9 months of year-end', '12 months of year-end'], correct: 1 },
          ],
        },
      },
    ],
  },
  {
    id: 'ed-strategy-501',
    title: 'Enterprise Development Strategy',
    category: 'B-BBEE',
    level: 'Advanced',
    duration: '4h',
    lessonCount: 9,
    description: 'Design and implement a high-impact Enterprise Development programme that maximises your B-BBEE points while genuinely developing South African small businesses.',
    instructor: { name: 'Kagiso Sithole', title: 'Enterprise Development Specialist, Okiru' },
    enrolled: 126, completionRate: 55, rating: 4.7, reviews: 48, color: '#60a5fa',
    modules: [
      {
        id: 'ed-strategy-501-m1', title: 'ED Fundamentals & Compliance', order: 1,
        lessons: [
          { id: 'ed-strategy-501-m1-l1', title: 'Enterprise Development vs Supplier Development', type: 'reading', duration: '20 min', content: 'Enterprise Development (ED) and Supplier Development (SD) are related but distinct elements. ED focuses on any black-owned businesses, while SD focuses specifically on developing black-owned businesses within your supply chain. Together they form the 40-point ESD element.' },
          { id: 'ed-strategy-501-m1-l2', title: 'Qualifying ED Contributions', type: 'video', duration: '22 min', content: 'What counts as an ED contribution: grants, loans, equity, mentorship, infrastructure, supplier credit, and in-kind support. How to value non-monetary contributions and maintain audit-ready records.' },
          { id: 'ed-strategy-501-m1-l3', title: 'Identifying ED Beneficiaries', type: 'reading', duration: '18 min', content: 'How to find, vet, and select appropriate ED beneficiary businesses. Due diligence requirements, ownership verification, and how to structure the relationship for maximum impact and B-BBEE compliance.' },
        ],
        quiz: {
          id: 'ed-strategy-501-m1-q', title: 'Module 1 Assessment',
          questions: [
            { id: 'q1', question: 'The combined ESD element on the generic scorecard is worth:', options: ['20 points', '30 points', '40 points', '50 points'], correct: 2 },
            { id: 'q2', question: 'Supplier Development focuses on:', options: ['Supporting larger companies', 'Developing suppliers within your value chain', 'Non-profit organisations', 'Government entities'], correct: 1 },
            { id: 'q3', question: 'ED contributions can include:', options: ['Cash grants only', 'Grants, loans, equity, mentorship, and in-kind support', 'Supplier discounts only', 'Employee training only'], correct: 1 },
            { id: 'q4', question: 'The minimum ED contribution target as a % of NPAT is:', options: ['0.5%', '1%', '2%', '3%'], correct: 1 },
            { id: 'q5', question: 'For an ED beneficiary to qualify, they must be:', options: ['A JSE-listed company', 'A black-owned business (51%+ black ownership)', 'A non-profit organisation', 'A government entity'], correct: 1 },
          ],
        },
      },
      {
        id: 'ed-strategy-501-m2', title: 'Designing Your ED Programme', order: 2,
        lessons: [
          { id: 'ed-strategy-501-m2-l1', title: 'Setting ED Programme Objectives', type: 'reading', duration: '18 min', content: 'Effective ED programmes balance B-BBEE compliance with genuine impact. This lesson covers how to set SMART objectives, align ED with your core business, and design programmes that create sustainable black businesses.' },
          { id: 'ed-strategy-501-m2-l2', title: 'Mentorship and Non-Financial Support', type: 'video', duration: '20 min', content: 'Research shows mentorship and business development support are often more valuable to small business beneficiaries than cash grants. How to structure a mentorship programme and measure non-financial support outcomes.' },
          { id: 'ed-strategy-501-m2-l3', title: 'ED Funding Structures', type: 'reading', duration: '22 min', content: 'Comparing grant, loan, and equity-based ED structures: tax implications, how to structure convertible loans, and when equity participation creates alignment.' },
        ],
        quiz: {
          id: 'ed-strategy-501-m2-q', title: 'Module 2 Assessment',
          questions: [
            { id: 'q1', question: 'What type of ED support is most valued by beneficiaries?', options: ['Cash grants', 'Mentorship and business development support', 'Equipment donations', 'Office space'], correct: 1 },
            { id: 'q2', question: 'ED grants are treated for tax purposes as:', options: ['A capital expense', 'Tax-deductible expenditure in the year incurred', 'A shareholder loan', 'Non-deductible'], correct: 1 },
            { id: 'q3', question: 'A convertible loan converts to equity when:', options: ['The loan is repaid early', 'Pre-agreed conditions or milestones are met', 'The beneficiary lists on the JSE', 'The B-BBEE certificate expires'], correct: 1 },
            { id: 'q4', question: 'Non-financial ED contributions include:', options: ['PAYE payments', 'Mentorship hours, equipment, and infrastructure', 'Dividend payments', 'Director fees'], correct: 1 },
            { id: 'q5', question: 'ED programme objectives should be:', options: ['Focused solely on B-BBEE points', 'SMART and aligned with your core business capabilities', 'Set by the B-BBEE Commission', 'Identical for all beneficiaries'], correct: 1 },
          ],
        },
      },
      {
        id: 'ed-strategy-501-m3', title: 'Monitoring & Reporting ED Impact', order: 3,
        lessons: [
          { id: 'ed-strategy-501-m3-l1', title: 'ED Monitoring Frameworks', type: 'reading', duration: '20 min', content: 'How to track and measure ED programme outcomes: financial performance of beneficiaries, jobs created, revenue growth, and sustainability indicators. Includes a monitoring template and recommended reporting cadence.' },
          { id: 'ed-strategy-501-m3-l2', title: 'Record-Keeping for Verification', type: 'video', duration: '15 min', content: 'The exact documentation required to claim ED points during B-BBEE verification: signed agreements, payment records, beneficiary confirmations, and proof of ownership.' },
          { id: 'ed-strategy-501-m3-l3', title: 'Reporting ED Impact to Stakeholders', type: 'reading', duration: '15 min', content: 'How to communicate your ED programme outcomes in your Integrated Annual Report, B-BBEE certificate, and ESG disclosure. Includes case study storytelling techniques.' },
        ],
        quiz: {
          id: 'ed-strategy-501-m3-q', title: 'Module 3 Assessment',
          questions: [
            { id: 'q1', question: 'Essential proof of an ED contribution for B-BBEE verification is:', options: ['An email correspondence', 'A signed agreement and payment record', 'A verbal commitment', 'A board minute'], correct: 1 },
            { id: 'q2', question: 'Key ED impact metrics include:', options: ['Share price of the beneficiary', 'Jobs created, revenue growth, and financial sustainability', 'Number of employees at your own company', 'Marketing spend'], correct: 1 },
            { id: 'q3', question: 'ED impact is typically reported in:', options: ["The company's tax return", 'The Integrated Annual Report and B-BBEE certificate', 'The payroll system', 'The IT audit report'], correct: 1 },
            { id: 'q4', question: 'How often should you monitor ED beneficiary progress?', options: ['Only at B-BBEE verification time', 'At least quarterly', 'Once every 3 years', "Never — it is the beneficiary's responsibility"], correct: 1 },
            { id: 'q5', question: 'A beneficiary confirmation letter must be signed by:', options: ['Your CEO only', 'The beneficiary entity confirming receipt of support', 'Your B-BBEE rating agency', 'The Department of Trade and Industry'], correct: 1 },
          ],
        },
      },
    ],
  },
];

const LEARNERS = [
  { id: 'l1', name: 'Andile Khumalo',  email: 'andile@thrivefg.co.za',  company: 'Thrive Financial Group', role: 'learner', avatar: 'AK', password: 'demo', enrolledCourses: ['bbbee-101','ai-exec-301'],    completedCourses: ['bbbee-101'],        lastActive: '2025-06-28' },
  { id: 'l2', name: 'Nomsa Vilakazi',  email: 'nomsa@sanlam-sme.co.za', company: 'Sanlam SME Division',    role: 'learner', avatar: 'NV', password: 'demo', enrolledCourses: ['compliance-401','esg-201'], completedCourses: [],                  lastActive: '2025-06-27' },
  { id: 'l3', name: 'Sipho Dlamini',   email: 'sipho@rml.co.za',        company: 'Rand Merchant Holdings', role: 'learner', avatar: 'SD', password: 'demo', enrolledCourses: ['bbbee-101','compliance-401'], completedCourses: ['compliance-401'], lastActive: '2025-06-26' },
  { id: 'l4', name: 'Lerato Mokoena',  email: 'lerato@ecowise.co.za',   company: 'Ecowise Construction',   role: 'learner', avatar: 'LM', password: 'demo', enrolledCourses: ['esg-201','bbbee-101'],      completedCourses: [],                  lastActive: '2025-06-25' },
  { id: 'admin', name: 'Okiru Admin',  email: 'admin@okiru.co.za',      company: 'Okiru',                  role: 'admin',   avatar: 'OK', password: 'admin', enrolledCourses: [], completedCourses: [] },
];

const ADMIN_STATS = {
  totalLearners: 342, activeCourses: 5, completionRate: '68%', certificatesIssued: 218,
  enrollmentsThisMonth: 47, avgRating: 4.74,
  courseStats: COURSES.map(c => ({ id: c.id, title: c.title, category: c.category, enrolled: c.enrolled, completionRate: c.completionRate, rating: c.rating, completed: Math.round(c.enrolled * c.completionRate / 100) })),
  recentLearners: LEARNERS.filter(l => l.role === 'learner').map(l => ({ name: l.name, company: l.company, enrolled: l.enrolledCourses.length, completed: l.completedCourses.length, lastActive: l.lastActive })),
};

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/courses', (req, res) => {
  const slim = COURSES.map(c => ({ ...c, modules: c.modules.map(m => ({ id: m.id, title: m.title, order: m.order, lessons: m.lessons.map(l => ({ id: l.id, title: l.title, type: l.type, duration: l.duration })) })) }));
  res.json({ success: true, data: slim });
});
app.get('/api/courses/:id', (req, res) => {
  const course = COURSES.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: course });
});
app.get('/api/admin/stats', (req, res) => res.json({ success: true, data: ADMIN_STATS }));
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = LEARNERS.find(l => l.email === email && l.password === password);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  const { password: _pw, ...safe } = user;
  res.json({ success: true, data: safe });
});
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
}

app.listen(PORT, () => console.log(`Okiru LMS running on port ${PORT}`));
module.exports = app;
