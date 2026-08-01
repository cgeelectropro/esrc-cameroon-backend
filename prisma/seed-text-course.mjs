/**
 * Minimal seed script for the text-based Entrepreneurship Masterclass course.
 * Uses raw pg client (single connection) to avoid pgBouncer session pool exhaustion.
 * Run: node prisma/seed-text-course.mjs
 */
import pg from 'pg';
import { randomUUID } from 'crypto';

const { Client } = pg;

const DB_URL = process.env.DATABASE_URL || 'postgres://postgres.rohatzmiqhczybfbgjhj:uWPGDOd9feu91gcv@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';

const client = new Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
console.log('Connected to database.');

async function q(sql, params = []) {
  const res = await client.query(sql, params);
  return res.rows;
}

// ── 1. Find Amina's instructor profile ──────────────────────────────────────
const instructors = await q(`
  SELECT ip.id as profile_id, u.email
  FROM instructor_profiles ip
  JOIN users u ON u.id = ip."userId"
  WHERE u.email = 'amina.ngozi@nextgen.africa'
  LIMIT 1
`);

if (instructors.length === 0) {
  console.error('Amina instructor profile not found. Run the main seed first.');
  await client.end();
  process.exit(1);
}
const instructorProfileId = instructors[0].profile_id;
console.log('Found instructor profile:', instructorProfileId);

// ── 2. Check if course already exists ───────────────────────────────────────
const existing = await q(`
  SELECT id FROM courses WHERE title = 'Entrepreneurship Masterclass: Build Your Business in Africa' LIMIT 1
`);

if (existing.length > 0) {
  console.log('Course already exists:', existing[0].id);
  await client.end();
  process.exit(0);
}

// ── 3. Create the course ─────────────────────────────────────────────────────
const courseId = randomUUID();
const now = new Date().toISOString();

await q(`
  INSERT INTO courses (
    id, title, "titleFr", description, "descriptionFr",
    "instructorId", price, "isFree", level, category, language,
    thumbnail, "isFeatured", "isPublished", "publishedAt",
    tags, requirements, outcomes,
    "avgRating", "reviewCount", "studentCount",
    "createdAt", "updatedAt"
  ) VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9::text, $10::text, $11::text,
    $12, $13, $14, $15,
    $16, $17, $18,
    $19, $20, $21,
    $22, $23
  )
`, [
  courseId,
  'Entrepreneurship Masterclass: Build Your Business in Africa',
  'Masterclass Entrepreneuriat : Construire Votre Entreprise en Afrique',
  'A complete, text-based entrepreneurship course designed for African entrepreneurs. From idea to launch — including business planning, funding, marketing, legal setup, and scaling. Each lesson is a deep-dive article with practical frameworks, checklists, and real case studies from Cameroon and Central Africa.',
  "Un cours complet basé sur des articles pour entrepreneurs africains. De l'idée au lancement — planification, financement, marketing, cadre légal et croissance.",
  instructorProfileId,
  0, true, 'BEGINNER', 'ENTREPRENEURSHIP', 'EN',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  true, true, now,
  ['entrepreneurship', 'business plan', 'startup', 'africa', 'masterclass'],
  ['No prior business experience needed', 'Willingness to learn and take action', 'A business idea (or openness to find one)'],
  ['Validate a business idea using lean startup methods', 'Write a professional business plan', 'Understand funding options available in Cameroon', 'Set up your business legally', 'Build a go-to-market strategy', 'Scale from 0 to 100 customers'],
  4.8, 312, 1840,
  now, now,
]);

console.log('Created course:', courseId);

// ── 4. Sections & lessons ────────────────────────────────────────────────────
const sections = [
  {
    title: 'Module 1: The Entrepreneurial Mindset',
    lessons: [
      {
        title: 'Welcome & How to Use This Course',
        type: 'ASSIGNMENT',
        duration: 5,
        isPreview: true,
        content: {
          estimatedReadTime: 5,
          body: `# Welcome to the Entrepreneurship Masterclass

> *"The secret of getting ahead is getting started."* — Mark Twain

Welcome to **Entrepreneurship Masterclass: Build Your Business in Africa** — a fully text-based, self-paced course designed for the African entrepreneur of today.

## What You Will Learn

This course takes you from **zero to launch** across 5 core modules:

1. **Mindset** — Thinking like an entrepreneur
2. **Idea & Validation** — Finding and testing your idea
3. **Business Planning** — Building a solid foundation
4. **Funding & Legal** — Money and compliance in Cameroon
5. **Growth** — Marketing and scaling your business

## How to Use This Course

Each lesson is a **deep-dive article** — not a video. Here's how to get the most from it:

- **Read actively**: Take notes as you go. Use the **My Notes** tab.
- **Do the exercises**: Every lesson ends with a practical task.
- **Apply immediately**: Each concept should be applied to *your* business idea.
- **Mark lessons complete**: Track your progress to unlock your certificate.

## Your First Task

Before you move on, answer this question in your notes:

> *What problem do you want to solve, and for whom?*

Write one sentence. Don't overthink it. We'll refine it throughout the course.

---

Ready? Let's build something extraordinary.`,
          resources: [
            { type: 'link', label: 'Community Forum: Introduce Yourself', url: 'https://nextgen-en.com/en/community' },
          ],
        },
      },
      {
        title: 'The African Entrepreneurial Mindset',
        type: 'ASSIGNMENT',
        duration: 12,
        isPreview: false,
        content: {
          estimatedReadTime: 12,
          body: `# The African Entrepreneurial Mindset

## Why Mindset Comes First

Before business models, before funding, before marketing — **mindset** is your most important asset.

Research consistently shows that the difference between entrepreneurs who succeed and those who quit isn't intelligence, capital, or luck. It's **how they think** about challenges, failure, and growth.

## The 5 Pillars of Entrepreneurial Thinking

### 1. Problem-First Thinking

Most people see problems as obstacles. Entrepreneurs see them as **opportunities**.

When Vanessa Tchuente noticed that Yaoundé's market vendors were losing 30% of produce to spoilage, she didn't complain — she built a cold-chain logistics startup that now serves 200 vendors.

**Exercise**: List 5 problems you experience daily. Circle the ones that frustrate *many people*, not just you.

### 2. Resilience Over Perfectionism

Perfectionism kills startups. The fear of launching before everything is "ready" keeps most ideas trapped in notebooks.

The lean startup principle: **build, measure, learn** — ship a rough version, get feedback, improve.

> *"Your first version will embarrass you. Ship it anyway."* — Reid Hoffman

### 3. Long-Term Thinking

African markets reward patience. Infrastructure challenges, long sales cycles, and regulatory complexity mean overnight success is rare. But **decade-long businesses** are built here every day.

Think in **3-year horizons**, not 3-month ones.

### 4. Community Before Competition

In Central Africa, relationships are infrastructure. Your network — advisors, suppliers, customers, fellow founders — is worth more than any marketing budget.

### 5. Resourcefulness

Constraints are not excuses — they're design parameters.

Many of Africa's most innovative companies were built with **no capital**, **no electricity**, **no 4G** — because their founders refused to let constraints stop them.

## Mindset Traps to Avoid

| Trap | Antidote |
|------|----------|
| "I need more money before I start" | Start with what you have. Validate first, fund later. |
| "The market isn't ready" | Markets are never ready. Readiness is built by early movers. |
| "I'm not educated enough" | Expertise is earned through action, not credentials. |
| "Someone already did this" | Competition validates demand. Do it better. |

## This Week's Action

**Mindset Audit** — Score yourself honestly (1–5) on each pillar and write one concrete action to improve your lowest score.`,
        },
      },
      {
        title: 'Finding Your Purpose & Ikigai',
        type: 'ASSIGNMENT',
        duration: 10,
        isPreview: false,
        content: {
          estimatedReadTime: 10,
          body: `# Finding Your Purpose & Ikigai

## What is Ikigai?

**Ikigai** (生き甲斐) is a Japanese concept meaning "reason for being." It sits at the intersection of four questions:

1. **What do you LOVE?** — Activities that energize you
2. **What are you GOOD AT?** — Your skills and strengths
3. **What does the WORLD NEED?** — Real problems to solve
4. **What can you be PAID FOR?** — Market demand

The sweet spot where all four overlap is your **entrepreneurial purpose**.

## Why Purpose Matters for Business

Purpose is not just philosophy — it's a **business advantage**:

- Purpose-driven founders persist through failure (because it's not just about money)
- Purpose attracts like-minded team members and customers
- Purpose gives clarity when making hard decisions

## Building Your Ikigai Map

Draw four overlapping circles. Label each with your answers above. The overlap is your starting point.

You don't need 100% overlap on Day 1. Many great businesses start with 2 or 3 overlaps and grow into the fourth.

**Task for this lesson**: Complete your Ikigai map in My Notes.`,
        },
      },
    ],
  },
  {
    title: 'Module 2: Idea Validation',
    lessons: [
      {
        title: 'How to Generate & Filter Business Ideas',
        type: 'ASSIGNMENT',
        duration: 15,
        isPreview: false,
        content: {
          estimatedReadTime: 15,
          body: `# How to Generate & Filter Business Ideas

## The Idea Myth

Most people believe great entrepreneurs had one brilliant idea that changed everything. The reality? Most successful businesses are **iterations** on existing ideas, applied in new contexts.

## Idea Generation Methods

### Method 1: Problem Journaling

For the next 7 days, carry a notebook. Every time you feel frustrated or think "why isn't there a solution for this?" — write it down.

### Method 2: Copy + Localize

What works in Lagos, Nairobi, or Johannesburg but doesn't exist in Yaoundé or Douala?

Many successful Central African businesses are **localized versions** of proven models.

### Method 3: Ask Your Community

Interview 20 people in your target market. Ask one question:

> *"What's the most frustrating part of [activity] for you?"*

Don't propose solutions yet. Just listen.

## The Idea Filter: 5 Questions

| Question | What You're Testing |
|----------|---------------------|
| Is the problem real and painful? | Market demand |
| Can I reach the customer? | Distribution |
| Is the solution 10x better? | Competitive advantage |
| Can this be profitable? | Business model |
| Do I have an unfair advantage here? | Founder-market fit |

## The One-Sentence Business Concept

> **"[Product/Service] helps [target customer] solve [specific problem] by [unique mechanism]."**

Write yours in My Notes before moving to the next lesson.`,
        },
      },
      {
        title: 'Market Research: Knowing Your Customer',
        type: 'ASSIGNMENT',
        duration: 18,
        isPreview: false,
        content: {
          estimatedReadTime: 18,
          body: `# Market Research: Knowing Your Customer

## Why Customer Research Is Non-Negotiable

The #1 reason startups fail: **building something nobody wants**.

Market research is how you avoid this. It's not optional — it's survival.

## The Customer Interview Method

### What to Ask

**Opening**:
> "Tell me about the last time you experienced [problem]. What happened?"

**Deep dive**:
> "How do you currently handle [problem]?"
> "What do you dislike most about how you handle it now?"
> "How much does this problem cost you — in time, money, stress?"

**NEVER ask**: "Would you use a product that does X?" — people always say yes. Behavior, not intention, is the signal.

## Market Sizing: TAM, SAM, SOM

| Term | Meaning |
|------|---------|
| TAM | Total Addressable Market — All potential customers |
| SAM | Serviceable Addressable Market — Customers you can reach |
| SOM | Serviceable Obtainable Market — Customers in Year 1 |

## Deliverable

Create a **Customer Persona** with name, age, location, profession, daily challenges, current workarounds, and what success looks like for them. Save in My Notes.`,
        },
      },
      {
        title: 'Validating Your Idea with an MVP',
        type: 'ASSIGNMENT',
        duration: 14,
        isPreview: false,
        content: {
          estimatedReadTime: 14,
          body: `# Validating Your Idea with an MVP

## What is an MVP?

A **Minimum Viable Product** is the simplest version of your product that allows you to test your core assumption with real customers.

## MVP Types (No-Code First)

### The Landing Page MVP
Build a simple webpage describing your product. Drive traffic. Measure signups.

### The Concierge MVP
Do the service manually for 5–10 early customers. Don't automate yet.

### The Pre-Sale MVP
Sell the product before it exists. If customers pay, you've validated.

## The Validation Sprint

**Week 1**: Define hypothesis and MVP type
**Week 2**: Build MVP (max 7 days — no longer)
**Week 3**: Get first 10 users/customers
**Week 4**: Interview every single one of them

**Success signals**:
- Customers found you without referrals
- Customers paid (or committed to pay)
- Customers told others unprompted

**Your task**: Write your hypothesis:

> *"We believe [customer type] will [action] because [reason]. We'll know we're right if [measurable outcome]."*`,
          resources: [
            { type: 'link', label: 'Free Tool: Carrd.co (Landing Page Builder)', url: 'https://carrd.co' },
          ],
        },
      },
    ],
  },
  {
    title: 'Module 3: Business Planning',
    lessons: [
      {
        title: 'The One-Page Business Plan',
        type: 'ASSIGNMENT',
        duration: 20,
        isPreview: false,
        content: {
          estimatedReadTime: 20,
          body: `# The One-Page Business Plan

## Why One Page?

Traditional business plans are 30-page documents that take months to write and are obsolete before they're finished.

Modern entrepreneurs use a **one-page plan** — a living document updated weekly.

## The Lean Canvas

9 blocks that define your entire business:

### Block 1: Problem
List the top 3 problems your customers have.

### Block 2: Customer Segments
Who exactly are you building for? Define your **early adopters**.

### Block 3: Unique Value Proposition
One clear sentence: *"We help [X] do [Y] by [Z]."*

### Block 4: Solution
The top 3 features of your MVP.

### Block 5: Channels
How will you reach customers?
- Direct sales, Social media, WhatsApp, Referrals, Events

### Block 6: Revenue Streams
How do you make money?
- One-time sale, Subscription, Commission, Freemium

### Block 7: Cost Structure
Fixed costs (rent, salaries) + Variable costs (cost per customer)

### Block 8: Key Metrics
3–5 numbers that tell you if the business is working:
- Monthly Revenue, Customer Acquisition Cost (CAC), Retention Rate

### Block 9: Unfair Advantage
What do you have that competitors can't easily copy?
- Exclusive partnerships, Community relationships, Unique expertise

## Financial Projections

For your first year, estimate monthly Revenue, Costs, and Net profit.

**Key formulas**:
- **Break-even** = Fixed Costs ÷ (Price – Variable Cost per Unit)
- **CAC** = Marketing Spend ÷ New Customers
- **LTV** = Average Revenue per Customer × Customer Lifetime

**Task**: Build your Lean Canvas in My Notes using all 9 blocks.`,
          resources: [
            { type: 'link', label: 'Lean Canvas Template (Free)', url: 'https://leanstack.com/lean-canvas' },
          ],
        },
      },
      {
        title: 'Legal Setup in Cameroon',
        type: 'ASSIGNMENT',
        duration: 16,
        isPreview: false,
        content: {
          estimatedReadTime: 16,
          body: `# Legal Setup in Cameroon: What Every Entrepreneur Needs to Know

## Business Structures in Cameroon

### 1. Sole Trader (Entrepreneur Individuel)

**Best for**: Service businesses, freelancers
- Simplest and cheapest to register
- No legal separation between you and business
- Registration at CFCE: ~20,000–50,000 XAF

### 2. SARL (Société à Responsabilité Limitée)

**Best for**: Small businesses with 1–50 partners
- Limited liability — personal assets protected
- Minimum capital: 1,000,000 XAF
- Registration: 150,000–300,000 XAF

## Step-by-Step SARL Registration

1. Choose your company name — check RCCM for availability
2. Draft statutes with a notary
3. Open a blocked bank account — deposit capital
4. Visit CFCE with all documents
5. Receive your RCCM number
6. Register with CAMINFOTAX for tax ID
7. Register employees with CNPS

## Tax Obligations

| Tax | Rate | Frequency |
|-----|------|-----------|
| Corporate Income Tax (IS) | 30% of profit | Annual |
| Value Added Tax (TVA) | 19.25% | Monthly |
| Payroll Tax (IRPP) | Progressive 10–38.5% | Monthly |

## Practical Tips

- Open a dedicated **business bank account** from Day 1
- Keep all **receipts and invoices**
- Find a **local accountant** (comptable agrée)
- Join **GICAMu** for advocacy and legal support`,
          resources: [
            { type: 'link', label: 'CFCE Official Portal — Business Registration', url: 'https://www.cfce.cm' },
          ],
        },
      },
    ],
  },
  {
    title: 'Module 4: Funding Your Business',
    lessons: [
      {
        title: 'Funding Options for Cameroonian Entrepreneurs',
        type: 'ASSIGNMENT',
        duration: 18,
        isPreview: false,
        content: {
          estimatedReadTime: 18,
          body: `# Funding Options for Cameroonian Entrepreneurs

## Stage 1: Pre-Revenue (0–12 months)

### Bootstrapping
The most common and underrated funding source. Use personal savings, take a part-time job while building, start small and reinvest every franc of profit.

### Tontines & Njangi
Cameroon's traditional rotating savings associations. A group of 10 people each contributes 50,000 XAF/month — one member receives the full 500,000 XAF pot each month. **Powerful** for lump-sum capital needs.

## Stage 2: Early Revenue (6–24 months)

### Microfinance Institutions (MFIs)

| Institution | Max Loan | Rate |
|------------|----------|------|
| Advans Cameroun | 50M XAF | 20–28% |
| MC² | 10M XAF | 15–22% |

### Government Programs

- **MINPMEESA**: Ministry of Small and Medium Enterprises — regular entrepreneur support
- **APME**: Technical and financial support, incubation

## Stage 3: Growth (2+ years)

### Grants & Competitions

- **Tony Elumelu Foundation**: $5,000 grant + mentorship (annual, pan-African)
- **Orange Social Entrepreneur Prize**: €25,000 for impact businesses
- **Chivas Venture**: Up to $500,000 for social impact startups

## The Golden Rule of Funding

**Revenue is the best funding.**

Before chasing grants or investors — focus on getting your first paying customer. Revenue validates your model, preserves your equity, and funds your next step.

**Task**: Map your funding roadmap for the next 2 years in My Notes.`,
          resources: [
            { type: 'link', label: 'Tony Elumelu Foundation Application Portal', url: 'https://tefconnect.com' },
          ],
        },
      },
    ],
  },
  {
    title: 'Module 5: Marketing & Growth',
    lessons: [
      {
        title: 'Your First 100 Customers: A Step-by-Step Playbook',
        type: 'ASSIGNMENT',
        duration: 20,
        isPreview: false,
        content: {
          estimatedReadTime: 20,
          body: `# Your First 100 Customers: A Step-by-Step Playbook

## The 0–10 Customers Phase: Do Things That Don't Scale

Your job in this phase is NOT marketing. It's **sales**.

### Start with Your Network

Make a list of every person you know. Reach out personally:

> *"Hi [Name], I'm building [product] to help [problem]. Can I tell you more?"*

### Go Where Your Customers Are

- **Physical markets**: Set up a table. Talk to vendors and buyers.
- **WhatsApp groups**: Provide value first, then mention your product.
- **Events**: Attend industry gatherings. Collect contacts.

## The 10–50 Customers Phase: Build Your Marketing Engine

### WhatsApp Marketing

The most powerful marketing channel in Cameroon.

- Set up WhatsApp Business with catalogue and quick replies
- Broadcast lists: Send updates to 256 customers at once
- **Rule**: Provide 10 value messages for every 1 promotional message

### Referral Programs

> *"Refer a friend and get 1 month free / 10% commission"*

Referral programs can drive 30–50% of new customers for B2C businesses.

## The 50–100 Customers Phase: Systematize

### Measuring What Matters

| Metric | Target (Year 1) |
|--------|-----------------|
| New customers | 10/month → 50/month |
| Retention rate | >70% |
| Referral rate | >20% |
| NPS | >50 |

**Final Task**: Write your 90-day growth plan in My Notes:
- Month 1: Getting to 10 customers
- Month 2: Reaching 50 customers
- Month 3: Hitting 100 customers`,
          resources: [
            { type: 'link', label: 'WhatsApp Business — Getting Started Guide', url: 'https://business.whatsapp.com' },
          ],
        },
      },
      {
        title: 'Scaling Your Business: From 100 to 1,000 Customers',
        type: 'ASSIGNMENT',
        duration: 14,
        isPreview: false,
        content: {
          estimatedReadTime: 14,
          body: `# Scaling Your Business: From 100 to 1,000 Customers

## The 4 Pillars of Scale

### Pillar 1: Systems & Automation

| Process | Manual Version | Systematized Version |
|---------|----------------|---------------------|
| Customer onboarding | Personal call | WhatsApp autoresponder |
| Order tracking | Spreadsheet | Simple CRM (Hubspot Free) |
| Payments | Cash collection | Mobile money (MTN API) |

**Tools for African SMEs** (mostly free):
- **Hubspot CRM**: Customer management
- **Wave Accounting**: Free bookkeeping
- **Trello/Notion**: Team operations

### Pillar 2: Team Building

**First hires** (in order of importance):
1. Sales/operations person
2. Finance/admin
3. Marketing

### Pillar 3: Unit Economics at Scale

Before scaling, confirm:
- **CAC** (Customer Acquisition Cost) < **LTV** (Lifetime Value)
- **Gross margin** > 40%
- **Payback period** < 12 months

If unit economics are negative, scaling = losing money faster.

### Pillar 4: Capital for Scale

Options at scale stage:
- Revenue-based financing
- Bank loans (with track record)
- Angel investment or VC
- Strategic partnerships

---

## Congratulations — Course Complete!

You've reached the end of the **Entrepreneurship Masterclass**.

Here's what you've built:
- An entrepreneurial mindset
- A validated business idea
- A one-page business plan
- Legal + funding knowledge for Cameroon
- A 100-customer growth playbook
- A scaling framework

**Mark this lesson as complete** to receive your certificate of completion.

*Thank you for learning with NextGen — ESRC Cameroon. Now go build something amazing.*`,
        },
      },
    ],
  },
];

let sectionOrder = 0;
for (const sec of sections) {
  const sectionId = randomUUID();
  await q(`
    INSERT INTO sections (id, "courseId", title, "order")
    VALUES ($1, $2, $3, $4)
  `, [sectionId, courseId, sec.title, sectionOrder++]);

  let lessonOrder = 0;
  for (const les of sec.lessons) {
    const lessonId = randomUUID();
    const contentJson = les.content ? JSON.stringify(les.content) : null;
    await q(`
      INSERT INTO lessons (id, "sectionId", title, type, duration, "order", "isPreview", content)
      VALUES ($1, $2, $3, $4::text, $5, $6, $7, $8::jsonb)
    `, [lessonId, sectionId, les.title, les.type, les.duration ?? 10, lessonOrder++, les.isPreview, contentJson]);
    console.log(`  + Lesson: ${les.title}`);
  }
  console.log(`Section created: ${sec.title}`);
}

console.log('\nText-based course seeded successfully!');
console.log('Course ID:', courseId);

await client.end();
