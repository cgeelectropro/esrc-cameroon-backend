import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ─── Course Categories ──────────────────────────────────────────────────────
  const categories = [
    { slug: 'business-entrepreneurship', nameEn: 'Business & Entrepreneurship', nameFr: 'Affaires et Entrepreneuriat', order: 1 },
    { slug: 'techpreneurship', nameEn: 'Techpreneurship', nameFr: 'Techpreneurship', order: 2 },
    { slug: 'entrepreneurship-dev-300', nameEn: 'Entrepreneurship Development Level 300', nameFr: 'Développement Entrepreneurial Niveau 300', order: 3 },
    { slug: 'entrepreneurship-theory-400', nameEn: 'Entrepreneurship Theory and Practice Level 400', nameFr: 'Théorie et Pratique Entrepreneuriale Niveau 400', order: 4 },
    { slug: 'advanced-entrepreneurship', nameEn: 'Advanced Entrepreneurship Theory and Practice', nameFr: 'Théorie et Pratique Entrepreneuriale Avancée', order: 5 },
    { slug: 'islamic-entrepreneurship', nameEn: 'Islamic Entrepreneurship', nameFr: 'Entrepreneuriat Islamique', order: 6 },
    { slug: 'tourism-entrepreneurship', nameEn: 'Tourism Entrepreneurship', nameFr: 'Entrepreneuriat Touristique', order: 7 },
    { slug: 'cultural-entrepreneurship', nameEn: 'Cultural Entrepreneurship', nameFr: 'Entrepreneuriat Culturel', order: 8 },
    { slug: 'kingdom-entrepreneurship', nameEn: 'Kingdom Entrepreneurship', nameFr: 'Entrepreneuriat du Royaume', order: 9 },
    { slug: 'ageing-entrepreneurship', nameEn: 'Ageing Entrepreneurship', nameFr: 'Entrepreneuriat du Vieillissement', order: 10 },
    { slug: 'sports-entrepreneurship', nameEn: 'Sports Entrepreneurship', nameFr: 'Entrepreneuriat Sportif', order: 11 },
    { slug: 'teacherpreneurship', nameEn: 'Teacherpreneurship', nameFr: 'Teacherpreneurship', order: 12 },
    { slug: 'innovation-business', nameEn: 'Innovation for Business Growth', nameFr: 'Innovation pour la Croissance', order: 13 },
    { slug: 'researchpreneurship', nameEn: 'Researchpreneurship', nameFr: 'Researchpreneurship', order: 14 },
  ];
  for (const cat of categories) {
    await (prisma as any).courseCategory.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: { nameEn: cat.nameEn, nameFr: cat.nameFr, order: cat.order },
    });
  }

  // ─── Testimonials ──────────────────────────────────────────────────────────
  await prisma.testimonial.createMany({
    data: [
      { quote: 'NextGen transformed my business approach. The mentorship and courses gave me the confidence to scale.', name: 'Marie Nguemo', title: 'Founder, Green Agro', location: 'Douala, Cameroon', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie', order: 0 },
      { quote: 'The research methodology course helped me publish my first policy brief. Game-changer for my career.', name: 'Jean Fotso', title: 'Policy Analyst', location: 'Yaoundé, Cameroon', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jean', order: 1 },
      { quote: 'Connecting with fellow entrepreneurs and advisors through NextGen opened doors I never imagined.', name: 'Alice Abwe', title: 'Tech Entrepreneur', location: 'Buea, Cameroon', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', order: 2 },
      { quote: 'The bilingual content made all the difference. I could learn in French and apply immediately in my community.', name: 'Fatou Diallo', title: 'Community Development Officer', location: 'Dakar, Senegal', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatou', order: 3 },
      { quote: 'The research hub changed how I publish. Open access means my work reaches policymakers across Africa.', name: 'Dr. Prosper Biyong', title: 'Development Economist', location: 'Yaoundé, Cameroon', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=prosper', order: 4 },
      { quote: 'I found my first investor through the NextGen network. The community here is genuinely invested in your success.', name: 'Amara Kamara', title: 'Startup Founder', location: 'Conakry, Guinea', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amara', order: 5 },
      { quote: 'Advisory sessions saved my business plan. My advisor saw gaps I had missed for two years.', name: 'Cécile Mbarga', title: 'SME Owner', location: 'Douala, Cameroon', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cecile', order: 6 },
      { quote: 'MTN MoMo payment made enrollment seamless. No need for a bank card — just my phone. Excellent platform.', name: 'Ibrahim Ouédraogo', title: 'Agricultural Entrepreneur', location: 'Ouagadougou, Burkina Faso', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ibrahim', order: 7 },
    ],
    skipDuplicates: true,
  });

  // ─── Impact Metrics ─────────────────────────────────────────────────────────
  // Clear existing metrics so we can update values on re-seed
  const existingMetricCount = await prisma.impactMetric.count();
  if (existingMetricCount === 0) {
    await prisma.impactMetric.createMany({
      data: [
        { label: 'Learners Trained', value: 10247, icon: 'Users', color: '#065f46', sdgGoals: [4, 8], order: 0 },
        { label: 'Certificates Issued', value: 3412, icon: 'BookOpen', color: '#b45309', sdgGoals: [4], order: 1 },
        { label: 'Countries Reached', value: 18, icon: 'TrendingUp', color: '#2563eb', sdgGoals: [17], order: 2 },
        { label: 'Entrepreneurs Supported', value: 847, icon: 'Briefcase', color: '#9333ea', sdgGoals: [8, 9], order: 3 },
        { label: 'Partners & Networks', value: 34, icon: 'Globe', color: '#0891b2', sdgGoals: [17], order: 4 },
      ],
    });
  }

  // ─── Success Stories ────────────────────────────────────────────────────────
  await prisma.successStory.createMany({
    data: [
      { name: 'Marie Nguemo', title: 'Agribusiness Founder', story: 'Started a sustainable agro-processing venture after completing the Agribusiness course.', impact: 'Created 15 jobs, supplies 200+ retailers.', image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400', quote: 'NextGen gave me the roadmap.', year: 2024, order: 0 },
    ],
    skipDuplicates: true,
  });

  // ─── Funding Sources ─────────────────────────────────────────────────────────
  await prisma.fundingSource.createMany({
    data: [
      { name: 'African Development Bank', description: 'Loans for SMEs and infrastructure.', type: 'Loan', url: 'https://www.afdb.org', eligibility: ['SMEs', 'Infrastructure'], order: 0 },
      { name: 'AGRA', description: 'Agriculture and food security grants.', type: 'Grant', url: 'https://agra.org', eligibility: ['Agriculture', 'Food security'], order: 1 },
    ],
    skipDuplicates: true,
  });

  // ─── Blog Posts ──────────────────────────────────────────────────────────────
  await prisma.blogPost.createMany({
    data: [
      { slug: 'announcing-nextgen-2025-programs', title: 'Announcing NextGen 2025 Programs', excerpt: 'New courses, fellowships, and partnerships for African entrepreneurs and learners.', author: 'NextGen Team', publishedAt: new Date('2025-01-15'), isPublished: true },
      { slug: 'climate-entrepreneurship-in-africa', title: 'Climate Entrepreneurship in Africa', excerpt: 'How green business models are shaping the future of African economies.', author: 'Dr. Kofi Mensah', publishedAt: new Date('2024-11-20'), isPublished: true },
      { slug: 'women-in-tech-success-stories', title: 'Women in Tech: Success Stories from Cameroon', excerpt: 'Three founders share their journeys and lessons from the NextGen platform.', author: 'Nneka Okoye', publishedAt: new Date('2024-10-05'), isPublished: true },
    ],
    skipDuplicates: true,
  });

  // ─── Regional Impact ─────────────────────────────────────────────────────────
  await prisma.regionalImpact.createMany({
    data: [
      { regionId: 'nw', name: 'North-West', learners: 1240, posX: 45, posY: 25, order: 0 },
      { regionId: 'sw', name: 'South-West', learners: 980, posX: 35, posY: 75, order: 1 },
      { regionId: 'littoral', name: 'Littoral', learners: 3120, posX: 55, posY: 55, order: 2 },
      { regionId: 'centre', name: 'Centre', learners: 2870, posX: 60, posY: 45, order: 3 },
      { regionId: 'extreme-nord', name: 'Extreme North', learners: 560, posX: 70, posY: 10, order: 4 },
    ],
    skipDuplicates: true,
  });

  // ─── Timeline Milestones ──────────────────────────────────────────────────────
  await prisma.timelineMilestone.createMany({
    data: [
      { year: 2019, event: 'NextGen Founded in Yaoundé, Cameroon', order: 0 },
      { year: 2020, event: 'First Online Courses Launched (50+ enrolled)', order: 1 },
      { year: 2021, event: '5,000 Learners Reached Across Central Africa', order: 2 },
      { year: 2022, event: 'Regional Expansion to CAR, Chad & Gabon', order: 3 },
      { year: 2023, event: '10,000+ Learners, $5M Economic Impact', order: 4 },
      { year: 2024, event: '25,000 Learners, 847 Entrepreneurs Supported', order: 5 },
    ],
    skipDuplicates: true,
  });

  // ─── SDGs ─────────────────────────────────────────────────────────────────────
  await prisma.sdg.createMany({
    data: [
      { number: 1, title: 'No Poverty', color: '#e11d48', order: 0 },
      { number: 3, title: 'Good Health', color: '#22c55e', order: 1 },
      { number: 4, title: 'Quality Education', color: '#dc2626', order: 2 },
      { number: 5, title: 'Gender Equality', color: '#b91c1c', order: 3 },
      { number: 8, title: 'Decent Work', color: '#991b1b', order: 4 },
      { number: 9, title: 'Industry Innovation', color: '#f97316', order: 5 },
      { number: 10, title: 'Reduce Inequality', color: '#7f1d1d', order: 6 },
      { number: 17, title: 'Partnerships', color: '#2563eb', order: 7 },
    ],
    skipDuplicates: true,
  });

  // ─── Platform Info ────────────────────────────────────────────────────────────
  await prisma.platformInfo.upsert({ where: { key: 'foundedYear' }, create: { key: 'foundedYear', value: '2019' }, update: { value: '2019' } });
  await prisma.platformInfo.upsert({ where: { key: 'teamMembers' }, create: { key: 'teamMembers', value: '52' }, update: { value: '52' } });

  // ─── Admin Users ───────────────────────────────────────────────────────────────
  const adminPassword1 = await bcrypt.hash('William@2026.', 12);
  const adminPassword2 = await bcrypt.hash('Good,2005', 12);

  await prisma.user.upsert({
    where: { email: 'mfondoumwilliam@gmail.com' },
    create: {
      email: 'mfondoumwilliam@gmail.com',
      passwordHash: adminPassword1,
      firstName: 'William',
      lastName: 'Mfondoum',
      role: 'ADMIN',
      country: 'CM',
      isEmailVerified: true,
      preferredLanguage: 'EN' as never,
    },
    update: { role: 'ADMIN', isEmailVerified: true },
  });

  await prisma.user.upsert({
    where: { email: 'goodnessemma05@gmail.com' },
    create: {
      email: 'goodnessemma05@gmail.com',
      passwordHash: adminPassword2,
      firstName: 'Goodness',
      lastName: 'Emmanuel',
      role: 'ADMIN',
      country: 'CM',
      isEmailVerified: true,
      preferredLanguage: 'EN' as never,
    },
    update: { role: 'ADMIN', isEmailVerified: true },
  });

  console.log('Admin users upserted.');

  // ─── Instructor Users ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('NextGen2026!', 10);

  const aminaUser = await prisma.user.upsert({
    where: { email: 'amina.ngozi@nextgen.africa' },
    create: {
      email: 'amina.ngozi@nextgen.africa',
      passwordHash,
      firstName: 'Amina',
      lastName: 'Ngozi',
      role: 'INSTRUCTOR',
      country: 'Cameroon',
      city: 'Yaoundé',
      bio: 'Business strategist and entrepreneur with 15 years of experience building SMEs across Central Africa.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amina-ngozi',
      isEmailVerified: true,
      preferredLanguage: 'BOTH' as never,
    },
    update: {},
  });

  const emmanuelUser = await prisma.user.upsert({
    where: { email: 'emmanuel.tchoupo@nextgen.africa' },
    create: {
      email: 'emmanuel.tchoupo@nextgen.africa',
      passwordHash,
      firstName: 'Emmanuel',
      lastName: 'Tchoupo',
      role: 'INSTRUCTOR',
      country: 'Cameroon',
      city: 'Douala',
      bio: 'Development economist and public policy expert. Former World Bank consultant and author of three policy books.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emmanuel-tchoupo',
      isEmailVerified: true,
      preferredLanguage: 'BOTH' as never,
    },
    update: {},
  });

  const fatimaUser = await prisma.user.upsert({
    where: { email: 'fatima.aliou@nextgen.africa' },
    create: {
      email: 'fatima.aliou@nextgen.africa',
      passwordHash,
      firstName: 'Fatima',
      lastName: 'Aliou',
      role: 'INSTRUCTOR',
      country: 'Cameroon',
      city: 'Garoua',
      bio: 'Gender studies researcher and social scientist. PhD from University of Yaoundé I. Specialist in women and development in the Sahel.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima-aliou',
      isEmailVerified: true,
      preferredLanguage: 'FR' as never,
    },
    update: {},
  });

  const kevinUser = await prisma.user.upsert({
    where: { email: 'kevin.nkrumah@nextgen.africa' },
    create: {
      email: 'kevin.nkrumah@nextgen.africa',
      passwordHash,
      firstName: 'Kevin',
      lastName: 'Nkrumah',
      role: 'INSTRUCTOR',
      country: 'Cameroon',
      city: 'Buea',
      bio: 'Software engineer and digital entrepreneur. Founder of two tech startups. Passionate about bridging Africa\'s digital skills gap.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin-nkrumah',
      isEmailVerified: true,
      preferredLanguage: 'EN' as never,
    },
    update: {},
  });

  // ─── Instructor Profiles ───────────────────────────────────────────────────────
  const aminaProfile = await prisma.instructorProfile.upsert({
    where: { userId: aminaUser.id },
    create: {
      userId: aminaUser.id,
      title: 'Business Strategy & Entrepreneurship Expert',
      organization: 'NextGen Business School',
      expertise: ['Entrepreneurship', 'Business Strategy', 'Women in Business', 'SME Development'],
      isVerified: true,
    },
    update: {},
  });

  const emmanuelProfile = await prisma.instructorProfile.upsert({
    where: { userId: emmanuelUser.id },
    create: {
      userId: emmanuelUser.id,
      title: 'Professor of Development Economics',
      organization: 'University of Douala',
      expertise: ['Development Policy', 'Public Finance', 'Urban Planning', 'Economic Research'],
      isVerified: true,
    },
    update: {},
  });

  const fatimaProfile = await prisma.instructorProfile.upsert({
    where: { userId: fatimaUser.id },
    create: {
      userId: fatimaUser.id,
      title: 'Senior Research Scientist & Gender Specialist',
      organization: 'University of Yaoundé I',
      expertise: ['Social Research', 'Gender Studies', 'Development Studies', 'Qualitative Methods'],
      isVerified: true,
    },
    update: {},
  });

  const kevinProfile = await prisma.instructorProfile.upsert({
    where: { userId: kevinUser.id },
    create: {
      userId: kevinUser.id,
      title: 'Digital Entrepreneur & Tech Educator',
      organization: 'Silicon Mountain, Buea',
      expertise: ['Technology', 'Digital Marketing', 'Fintech', 'Data Analysis'],
      isVerified: true,
    },
    update: {},
  });

  // ─── Courses ───────────────────────────────────────────────────────────────────
  // Clear all existing course data first (delete test/fictive courses)
  await prisma.lessonCompletion.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.review.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  console.log('Cleared existing courses, enrollments, and completions.');

  // Helper to create a course with sections and lessons
  async function createCourse(data: {
    title: string;
    titleFr: string;
    description: string;
    descriptionFr: string;
    instructorId: string;
    price: number;
    isFree: boolean;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    category: string;
    language: 'EN' | 'FR' | 'BOTH';
    thumbnail: string;
    isFeatured: boolean;
    tags: string[];
    requirements: string[];
    outcomes: string[];
    sections: { title: string; lessons: { title: string; type: 'VIDEO' | 'PDF' | 'QUIZ'; duration?: number; isPreview?: boolean }[] }[];
  }) {
    const existing = await prisma.course.findFirst({ where: { title: data.title } });
    if (existing) return existing;

    const course = await prisma.course.create({
      data: {
        title: data.title,
        titleFr: data.titleFr,
        description: data.description,
        descriptionFr: data.descriptionFr,
        instructorId: data.instructorId,
        price: data.price,
        isFree: data.isFree,
        level: data.level as never,
        category: data.category,
        language: data.language as never,
        thumbnail: data.thumbnail,
        isFeatured: data.isFeatured,
        status: 'PUBLISHED' as never,
        publishedAt: new Date(),
        tags: data.tags,
        requirements: data.requirements,
        outcomes: data.outcomes,
        avgRating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
        reviewCount: Math.floor(20 + Math.random() * 180),
        studentCount: Math.floor(50 + Math.random() * 950),
      },
    });

    let sectionOrder = 0;
    for (const sec of data.sections) {
      const section = await prisma.section.create({ data: { courseId: course.id, title: sec.title, order: sectionOrder++ } });
      let lessonOrder = 0;
      for (const les of sec.lessons) {
        await prisma.lesson.create({
          data: {
            sectionId: section.id,
            title: les.title,
            type: les.type as never,
            duration: les.duration ?? (les.type === 'VIDEO' ? 15 : les.type === 'QUIZ' ? 5 : 10),
            order: lessonOrder++,
            isPreview: les.isPreview ?? lessonOrder === 1,
          },
        });
      }
    }
    return course;
  }

  // Amina's courses (Entrepreneurship & Women in Business)
  await createCourse({
    title: 'Fundamentals of African Entrepreneurship',
    titleFr: 'Fondamentaux de l\'Entrepreneuriat Africain',
    description: 'Master the core principles of building a successful business in Africa. From idea validation to market entry, this course covers everything a first-time entrepreneur needs to launch with confidence.',
    descriptionFr: 'Maîtrisez les principes fondamentaux pour créer une entreprise prospère en Afrique. De la validation d\'idée à l\'entrée sur le marché, ce cours couvre tout ce dont un entrepreneur a besoin.',
    instructorId: aminaProfile.id,
    price: 0,
    isFree: true,
    level: 'BEGINNER',
    category: 'business-entrepreneurship',
    language: 'EN',
    thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
    isFeatured: true,
    tags: ['entrepreneurship', 'startup', 'africa', 'business'],
    requirements: ['No prior experience needed', 'Pen and notebook for exercises'],
    outcomes: ['Validate your business idea', 'Build a basic business model', 'Understand the African market context', 'Create a simple launch plan'],
    sections: [
      { title: 'Introduction to Entrepreneurship', lessons: [
        { title: 'Welcome & Course Overview', type: 'VIDEO', duration: 8, isPreview: true },
        { title: 'What Makes African Entrepreneurship Unique', type: 'VIDEO', duration: 18 },
        { title: 'The Entrepreneurial Mindset', type: 'VIDEO', duration: 14 },
      ]},
      { title: 'Idea Validation', lessons: [
        { title: 'Finding Problems Worth Solving', type: 'VIDEO', duration: 20 },
        { title: 'Customer Discovery Interviews', type: 'PDF', duration: 15 },
        { title: 'Validation Quiz', type: 'QUIZ', duration: 10 },
      ]},
      { title: 'Business Model Basics', lessons: [
        { title: 'Revenue Streams in African Markets', type: 'VIDEO', duration: 22 },
        { title: 'Cost Structure & Pricing', type: 'VIDEO', duration: 18 },
        { title: 'Your First Business Plan', type: 'PDF', duration: 25 },
      ]},
    ],
  });

  await createCourse({
    title: 'Business Model Canvas for Central Africa',
    titleFr: 'Business Model Canvas pour l\'Afrique Centrale',
    description: 'A hands-on workshop-style course teaching you to design, test, and iterate on your business model using the Business Model Canvas, adapted for the realities of Central African markets.',
    descriptionFr: 'Un cours pratique de type atelier vous enseignant à concevoir, tester et itérer votre modèle commercial en utilisant le Business Model Canvas adapté aux marchés d\'Afrique centrale.',
    instructorId: aminaProfile.id,
    price: 15000,
    isFree: false,
    level: 'INTERMEDIATE',
    category: 'business-entrepreneurship',
    language: 'BOTH',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    isFeatured: true,
    tags: ['business model', 'canvas', 'strategy', 'entrepreneurship'],
    requirements: ['Basic understanding of business concepts', 'Completed a business idea or have one in mind'],
    outcomes: ['Complete a Business Model Canvas for your venture', 'Identify key partners and resources in Central Africa', 'Design customer segments and value propositions', 'Build sustainable revenue models'],
    sections: [
      { title: 'BMC Fundamentals', lessons: [
        { title: 'The Business Model Canvas Explained', type: 'VIDEO', duration: 20, isPreview: true },
        { title: 'BMC in African Context', type: 'VIDEO', duration: 16 },
      ]},
      { title: 'Customer & Value', lessons: [
        { title: 'Defining Your Customer Segments', type: 'VIDEO', duration: 18 },
        { title: 'Crafting Your Value Proposition', type: 'VIDEO', duration: 22 },
        { title: 'Customer Relationships in African Culture', type: 'VIDEO', duration: 14 },
      ]},
      { title: 'Operations & Finance', lessons: [
        { title: 'Key Activities, Resources & Partners', type: 'VIDEO', duration: 20 },
        { title: 'Revenue & Cost Structures', type: 'VIDEO', duration: 18 },
        { title: 'Final Canvas Review & Submission', type: 'QUIZ', duration: 30 },
      ]},
    ],
  });

  await createCourse({
    title: 'Women Entrepreneurs Accelerator',
    titleFr: 'Accélérateur pour Femmes Entrepreneures',
    description: 'An advanced program designed for ambitious women entrepreneurs ready to scale. Covers fundraising, leadership, building systems, and navigating the unique challenges women face in African business.',
    descriptionFr: 'Un programme avancé conçu pour les femmes entrepreneures ambitieuses prêtes à croître. Couvre la levée de fonds, le leadership et la navigation des défis uniques pour les femmes en affaires en Afrique.',
    instructorId: aminaProfile.id,
    price: 25000,
    isFree: false,
    level: 'ADVANCED',
    category: 'business-entrepreneurship',
    language: 'BOTH',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
    isFeatured: true,
    tags: ['women', 'leadership', 'fundraising', 'scale'],
    requirements: ['Running a business for at least 1 year', 'Basic financial literacy'],
    outcomes: ['Develop a growth strategy', 'Prepare a fundraising pitch', 'Build leadership and team management skills', 'Access a network of women investors and mentors'],
    sections: [
      { title: 'Leadership & Identity', lessons: [
        { title: 'The Woman Entrepreneur in Africa — Realities & Opportunities', type: 'VIDEO', duration: 25, isPreview: true },
        { title: 'Developing Your Leadership Style', type: 'VIDEO', duration: 22 },
      ]},
      { title: 'Growth Strategy', lessons: [
        { title: 'Scaling Operations Without Losing Quality', type: 'VIDEO', duration: 28 },
        { title: 'Hiring and Building Your Team', type: 'VIDEO', duration: 20 },
        { title: 'Systems and Processes for Growth', type: 'PDF', duration: 15 },
      ]},
      { title: 'Funding & Networks', lessons: [
        { title: 'Fundraising for African Women Entrepreneurs', type: 'VIDEO', duration: 30 },
        { title: 'Pitching to Investors — Live Demo', type: 'VIDEO', duration: 35 },
        { title: 'Building Your Advisory Network', type: 'VIDEO', duration: 18 },
        { title: 'Final Assessment', type: 'QUIZ', duration: 20 },
      ]},
    ],
  });

  // Emmanuel's courses (Development Policy)
  await createCourse({
    title: 'Introduction to Development Policy',
    titleFr: 'Introduction aux Politiques de Développement',
    description: 'Understand how development policies are designed, implemented, and evaluated across Africa. This foundational course introduces key frameworks used by governments, NGOs, and international organizations.',
    descriptionFr: 'Comprenez comment les politiques de développement sont conçues, mises en œuvre et évaluées en Afrique. Ce cours fondamental présente les cadres clés utilisés par les gouvernements, ONG et organisations internationales.',
    instructorId: emmanuelProfile.id,
    price: 0,
    isFree: true,
    level: 'BEGINNER',
    category: 'innovation-business',
    language: 'FR',
    thumbnail: 'https://images.unsplash.com/photo-1529088746738-c4c0a152fb2c?w=800&q=80',
    isFeatured: true,
    tags: ['policy', 'development', 'africa', 'governance'],
    requirements: ['No prior experience required', 'Interest in public policy and governance'],
    outcomes: ['Understand major development policy frameworks', 'Analyze policy documents critically', 'Distinguish between different aid modalities', 'Write a basic policy brief'],
    sections: [
      { title: 'Development Policy Foundations', lessons: [
        { title: 'What is Development Policy?', type: 'VIDEO', duration: 18, isPreview: true },
        { title: 'Historical Overview — From Structural Adjustment to SDGs', type: 'VIDEO', duration: 25 },
        { title: 'Key Actors: Governments, IFIs, NGOs', type: 'VIDEO', duration: 20 },
      ]},
      { title: 'Policy Frameworks', lessons: [
        { title: 'The SDGs and Africa\'s Agenda 2063', type: 'VIDEO', duration: 22 },
        { title: 'PRSP, NDPIII and National Planning Frameworks', type: 'PDF', duration: 20 },
        { title: 'Policy Analysis Quiz', type: 'QUIZ', duration: 12 },
      ]},
      { title: 'Applied Policy Writing', lessons: [
        { title: 'How to Read a Policy Brief', type: 'VIDEO', duration: 16 },
        { title: 'Writing Your First Policy Brief', type: 'PDF', duration: 30 },
        { title: 'Peer Review Exercise', type: 'QUIZ', duration: 20 },
      ]},
    ],
  });

  await createCourse({
    title: 'Public Finance & Budget Analysis',
    titleFr: 'Finances Publiques et Analyse Budgétaire',
    description: 'Dive into the mechanics of public budgets in African countries. Learn how national budgets are structured, how to read fiscal data, and how to assess the social impact of government spending decisions.',
    descriptionFr: 'Plongez dans les mécanismes des budgets publics en Afrique. Apprenez comment les budgets nationaux sont structurés, comment lire les données fiscales et évaluer l\'impact social des décisions de dépenses gouvernementales.',
    instructorId: emmanuelProfile.id,
    price: 18000,
    isFree: false,
    level: 'INTERMEDIATE',
    category: 'innovation-business',
    language: 'BOTH',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    isFeatured: false,
    tags: ['public finance', 'budget', 'fiscal policy', 'government'],
    requirements: ['Introductory economics knowledge', 'Basic spreadsheet skills'],
    outcomes: ['Read and interpret government budget documents', 'Conduct basic budget analysis', 'Understand revenue collection and debt management', 'Assess pro-poor spending priorities'],
    sections: [
      { title: 'Budget Fundamentals', lessons: [
        { title: 'National Budget Cycle in Africa', type: 'VIDEO', duration: 22, isPreview: true },
        { title: 'Revenue, Expenditure and Deficits', type: 'VIDEO', duration: 20 },
        { title: 'Reading Cameroon\'s National Budget', type: 'PDF', duration: 25 },
      ]},
      { title: 'Analysis Techniques', lessons: [
        { title: 'Budget Tracking with Spreadsheets', type: 'VIDEO', duration: 30 },
        { title: 'Identifying Pro-Poor Spending', type: 'VIDEO', duration: 18 },
        { title: 'Budget Analysis Quiz', type: 'QUIZ', duration: 15 },
      ]},
    ],
  });

  await createCourse({
    title: 'Urban Planning in African Cities',
    titleFr: 'Urbanisme dans les Villes Africaines',
    description: 'Explore urban development challenges and opportunities in rapidly growing African cities. This advanced course covers spatial planning, housing policy, infrastructure financing, and inclusive urban design.',
    descriptionFr: 'Explorez les défis et opportunités du développement urbain dans les villes africaines en rapide croissance. Ce cours couvre la planification spatiale, la politique du logement et le financement des infrastructures.',
    instructorId: emmanuelProfile.id,
    price: 22000,
    isFree: false,
    level: 'ADVANCED',
    category: 'innovation-business',
    language: 'EN',
    thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
    isFeatured: false,
    tags: ['urban planning', 'cities', 'infrastructure', 'housing'],
    requirements: ['Background in policy or urban studies', 'Familiarity with GIS concepts is a plus'],
    outcomes: ['Understand African urbanization dynamics', 'Apply spatial planning frameworks', 'Evaluate housing and transport policies', 'Develop an urban development proposal'],
    sections: [
      { title: 'Africa\'s Urban Revolution', lessons: [
        { title: 'Urbanization Trends in Sub-Saharan Africa', type: 'VIDEO', duration: 25, isPreview: true },
        { title: 'Douala and Yaoundé as Case Studies', type: 'VIDEO', duration: 30 },
      ]},
      { title: 'Planning Frameworks', lessons: [
        { title: 'Spatial Planning Legislation in Cameroon', type: 'PDF', duration: 20 },
        { title: 'Informal Settlements — Challenges and Upgrades', type: 'VIDEO', duration: 28 },
        { title: 'Infrastructure Financing Models', type: 'VIDEO', duration: 24 },
      ]},
      { title: 'Applied Urban Design', lessons: [
        { title: 'Inclusive Urban Design Principles', type: 'VIDEO', duration: 22 },
        { title: 'Urban Development Proposal Workshop', type: 'PDF', duration: 40 },
        { title: 'Final Assessment', type: 'QUIZ', duration: 20 },
      ]},
    ],
  });

  // Fatima's courses (Social Research)
  await createCourse({
    title: 'Research Methodology for Social Scientists',
    titleFr: 'Méthodologie de Recherche pour Sciences Sociales',
    description: 'A practical introduction to research design, data collection, and analysis for social scientists in Africa. Covers both quantitative and qualitative methods with African field research examples.',
    descriptionFr: 'Une introduction pratique à la conception de recherche, la collecte et l\'analyse de données pour les chercheurs en sciences sociales en Afrique. Couvre les méthodes quantitatives et qualitatives.',
    instructorId: fatimaProfile.id,
    price: 0,
    isFree: true,
    level: 'BEGINNER',
    category: 'researchpreneurship',
    language: 'BOTH',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    isFeatured: false,
    tags: ['research', 'methodology', 'qualitative', 'quantitative'],
    requirements: ['No prior research experience required', 'Basic literacy in statistics helpful but not mandatory'],
    outcomes: ['Design a research question and methodology', 'Conduct interviews and focus groups', 'Analyze qualitative and quantitative data', 'Write a research report'],
    sections: [
      { title: 'Research Design', lessons: [
        { title: 'Introduction to Social Research', type: 'VIDEO', duration: 16, isPreview: true },
        { title: 'Formulating Research Questions', type: 'VIDEO', duration: 18 },
        { title: 'Quantitative vs Qualitative Approaches', type: 'VIDEO', duration: 20 },
      ]},
      { title: 'Data Collection', lessons: [
        { title: 'Survey Design and Questionnaires', type: 'VIDEO', duration: 22 },
        { title: 'Conducting Interviews and Focus Groups', type: 'VIDEO', duration: 25 },
        { title: 'Ethical Considerations in African Research', type: 'PDF', duration: 15 },
      ]},
      { title: 'Analysis & Writing', lessons: [
        { title: 'Qualitative Data Analysis', type: 'VIDEO', duration: 28 },
        { title: 'Basic Statistical Analysis', type: 'VIDEO', duration: 30 },
        { title: 'Writing Your Research Report', type: 'PDF', duration: 20 },
        { title: 'Final Quiz', type: 'QUIZ', duration: 15 },
      ]},
    ],
  });

  await createCourse({
    title: 'Gender & Development in Central Africa',
    titleFr: 'Genre et Développement en Afrique Centrale',
    description: 'An in-depth exploration of gender dynamics and their intersection with development outcomes in Central Africa. Covers feminist theory, gender-responsive programming, and case studies from the field.',
    descriptionFr: 'Une exploration approfondie des dynamiques de genre et leur intersection avec les résultats de développement en Afrique centrale. Couvre la théorie féministe et la programmation sensible au genre.',
    instructorId: fatimaProfile.id,
    price: 12000,
    isFree: false,
    level: 'INTERMEDIATE',
    category: 'researchpreneurship',
    language: 'FR',
    thumbnail: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80',
    isFeatured: false,
    tags: ['gender', 'development', 'women', 'social science'],
    requirements: ['Basic social sciences background', 'Interest in gender and development issues'],
    outcomes: ['Apply gender analysis frameworks', 'Design gender-responsive programs', 'Understand intersectionality in African contexts', 'Write a gender analysis report'],
    sections: [
      { title: 'Gender Theory', lessons: [
        { title: 'Feminist Perspectives in African Development', type: 'VIDEO', duration: 25, isPreview: true },
        { title: 'Gender Gaps in Education and Health', type: 'VIDEO', duration: 22 },
        { title: 'Intersectionality — Race, Class and Gender in Cameroon', type: 'VIDEO', duration: 20 },
      ]},
      { title: 'Applied Gender Analysis', lessons: [
        { title: 'Gender Analysis Frameworks (GAD, WID, GEM)', type: 'PDF', duration: 20 },
        { title: 'Field Case Study — Women Farmers in the North', type: 'VIDEO', duration: 28 },
        { title: 'Designing Gender-Responsive Programs', type: 'VIDEO', duration: 24 },
        { title: 'Assessment Quiz', type: 'QUIZ', duration: 15 },
      ]},
    ],
  });

  // Kevin's courses (Technology)
  await createCourse({
    title: 'Sustainable Agriculture & Agribusiness',
    titleFr: 'Agriculture Durable et Agrobusiness',
    description: 'Discover how to build a profitable agribusiness using sustainable farming practices. Learn about value chains, post-harvest management, and accessing agricultural finance in Cameroon and Central Africa.',
    descriptionFr: 'Découvrez comment construire un agrobusiness rentable en utilisant des pratiques agricoles durables. Apprenez les chaînes de valeur, la gestion post-récolte et l\'accès au financement agricole.',
    instructorId: kevinProfile.id,
    price: 0,
    isFree: true,
    level: 'BEGINNER',
    category: 'business-entrepreneurship',
    language: 'EN',
    thumbnail: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    isFeatured: false,
    tags: ['agriculture', 'agribusiness', 'sustainability', 'farming'],
    requirements: ['No prior experience required', 'Open to learners in rural and urban areas'],
    outcomes: ['Understand agricultural value chains in Cameroon', 'Apply sustainable farming principles', 'Access agricultural finance and grants', 'Build a basic agribusiness plan'],
    sections: [
      { title: 'Agriculture in Africa Today', lessons: [
        { title: 'The Agribusiness Opportunity in Central Africa', type: 'VIDEO', duration: 18, isPreview: true },
        { title: 'Sustainable Farming Principles', type: 'VIDEO', duration: 20 },
        { title: 'Climate-Smart Agriculture', type: 'PDF', duration: 15 },
      ]},
      { title: 'Value Chains', lessons: [
        { title: 'Understanding Agricultural Value Chains', type: 'VIDEO', duration: 22 },
        { title: 'Post-Harvest Management', type: 'VIDEO', duration: 18 },
        { title: 'Getting Your Products to Market', type: 'VIDEO', duration: 20 },
      ]},
      { title: 'Agribusiness Finance', lessons: [
        { title: 'Agricultural Loans and Grants in Cameroon', type: 'VIDEO', duration: 16 },
        { title: 'Writing an Agribusiness Plan', type: 'PDF', duration: 25 },
        { title: 'Final Quiz', type: 'QUIZ', duration: 12 },
      ]},
    ],
  });

  await createCourse({
    title: 'Digital Marketing for African Businesses',
    titleFr: 'Marketing Digital pour les Entreprises Africaines',
    description: 'Learn to grow your business online using social media, SEO, email marketing, and paid advertising — with strategies tailored for African audiences and the platforms they actually use.',
    descriptionFr: 'Apprenez à développer votre entreprise en ligne grâce aux réseaux sociaux, au SEO, au marketing par e-mail et à la publicité payante — avec des stratégies adaptées aux audiences africaines.',
    instructorId: kevinProfile.id,
    price: 10000,
    isFree: false,
    level: 'BEGINNER',
    category: 'techpreneurship',
    language: 'BOTH',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    isFeatured: false,
    tags: ['digital marketing', 'social media', 'SEO', 'growth'],
    requirements: ['Smartphone or computer with internet access', 'A business or business idea to apply strategies to'],
    outcomes: ['Build a digital marketing strategy', 'Grow social media presence organically', 'Run effective WhatsApp and Facebook marketing', 'Measure and optimize campaign performance'],
    sections: [
      { title: 'Digital Marketing Foundations', lessons: [
        { title: 'Digital Marketing in Africa — What Works', type: 'VIDEO', duration: 18, isPreview: true },
        { title: 'Setting Marketing Goals and KPIs', type: 'VIDEO', duration: 15 },
      ]},
      { title: 'Social Media & Content', lessons: [
        { title: 'WhatsApp Business for Sales', type: 'VIDEO', duration: 20 },
        { title: 'Facebook and Instagram Strategies', type: 'VIDEO', duration: 22 },
        { title: 'Content Creation on a Budget', type: 'VIDEO', duration: 18 },
      ]},
      { title: 'Paid & Earned Media', lessons: [
        { title: 'Facebook Ads for Small Budgets', type: 'VIDEO', duration: 25 },
        { title: 'Google My Business and Local SEO', type: 'VIDEO', duration: 20 },
        { title: 'Email Marketing with Free Tools', type: 'PDF', duration: 15 },
        { title: 'Final Assessment', type: 'QUIZ', duration: 15 },
      ]},
    ],
  });

  await createCourse({
    title: 'Mobile Money & Fintech in Africa',
    titleFr: 'Mobile Money et Fintech en Afrique',
    description: 'A deep dive into Africa\'s fintech revolution. From mobile money basics to building fintech products, this course covers MTN MoMo, Orange Money, regulatory frameworks, and the future of African financial services.',
    descriptionFr: 'Une plongée dans la révolution fintech africaine. Des bases du mobile money à la construction de produits fintech, ce cours couvre MTN MoMo, Orange Money et l\'avenir des services financiers africains.',
    instructorId: kevinProfile.id,
    price: 15000,
    isFree: false,
    level: 'INTERMEDIATE',
    category: 'techpreneurship',
    language: 'EN',
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
    isFeatured: false,
    tags: ['fintech', 'mobile money', 'MTN', 'Orange Money', 'payments'],
    requirements: ['Basic understanding of finance or technology', 'Smartphone with mobile money account recommended'],
    outcomes: ['Understand the African fintech ecosystem', 'Integrate mobile money APIs in products', 'Navigate fintech regulation in CEMAC', 'Design a fintech product concept'],
    sections: [
      { title: 'Africa\'s Fintech Landscape', lessons: [
        { title: 'Mobile Money Revolution in Africa', type: 'VIDEO', duration: 20, isPreview: true },
        { title: 'Key Players — MTN, Orange, Wave, Flutterwave', type: 'VIDEO', duration: 18 },
        { title: 'The CEMAC Regulatory Framework', type: 'PDF', duration: 20 },
      ]},
      { title: 'Technical Foundations', lessons: [
        { title: 'MTN MoMo API Integration', type: 'VIDEO', duration: 35 },
        { title: 'Orange Money API Walkthrough', type: 'VIDEO', duration: 30 },
        { title: 'Building a Payment Integration Demo', type: 'VIDEO', duration: 40 },
      ]},
      { title: 'Product & Business', lessons: [
        { title: 'Fintech Business Models in Africa', type: 'VIDEO', duration: 22 },
        { title: 'Your Fintech Product Concept', type: 'PDF', duration: 25 },
        { title: 'Final Quiz', type: 'QUIZ', duration: 15 },
      ]},
    ],
  });

  await createCourse({
    title: 'Data Analysis for Non-Programmers',
    titleFr: 'Analyse de Données pour Non-Programmeurs',
    description: 'Learn to make data-driven decisions without writing a single line of code. This practical course uses Google Sheets, Looker Studio, and free tools to teach data analysis, visualization, and storytelling.',
    descriptionFr: 'Apprenez à prendre des décisions basées sur les données sans écrire de code. Ce cours pratique utilise Google Sheets, Looker Studio et des outils gratuits pour enseigner l\'analyse de données.',
    instructorId: kevinProfile.id,
    price: 0,
    isFree: true,
    level: 'BEGINNER',
    category: 'techpreneurship',
    language: 'EN',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    isFeatured: false,
    tags: ['data', 'analytics', 'google sheets', 'visualization'],
    requirements: ['No coding experience required', 'Google account for Sheets and Looker Studio'],
    outcomes: ['Clean and analyze datasets in Google Sheets', 'Create compelling data visualizations', 'Build interactive dashboards', 'Tell stories with data'],
    sections: [
      { title: 'Data Fundamentals', lessons: [
        { title: 'Why Data Matters for Your Organization', type: 'VIDEO', duration: 14, isPreview: true },
        { title: 'Data Types and Data Quality', type: 'VIDEO', duration: 16 },
        { title: 'Google Sheets Essentials', type: 'VIDEO', duration: 25 },
      ]},
      { title: 'Analysis & Visualization', lessons: [
        { title: 'Formulas and Pivot Tables', type: 'VIDEO', duration: 30 },
        { title: 'Creating Charts That Tell Stories', type: 'VIDEO', duration: 22 },
        { title: 'Building Dashboards with Looker Studio', type: 'VIDEO', duration: 35 },
      ]},
      { title: 'Applied Projects', lessons: [
        { title: 'Analyzing Sales Data — Real Dataset', type: 'VIDEO', duration: 28 },
        { title: 'NGO Programme Data Analysis', type: 'PDF', duration: 20 },
        { title: 'Final Quiz', type: 'QUIZ', duration: 12 },
      ]},
    ],
  });

  // ─── Text-Based Course (with article content for LessonContent system) ──────────
  async function createTextCourse(data: {
    title: string;
    titleFr: string;
    description: string;
    descriptionFr: string;
    instructorId: string;
    price: number;
    isFree: boolean;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    category: string;
    language: 'EN' | 'FR' | 'BOTH';
    thumbnail: string;
    isFeatured: boolean;
    tags: string[];
    requirements: string[];
    outcomes: string[];
    sections: {
      title: string;
      lessons: {
        title: string;
        type: 'VIDEO' | 'PDF' | 'QUIZ' | 'ASSIGNMENT';
        duration?: number;
        isPreview?: boolean;
        content?: Record<string, unknown>;
      }[];
    }[];
  }) {
    const existing = await prisma.course.findFirst({ where: { title: data.title } });
    if (existing) return existing;

    const course = await prisma.course.create({
      data: {
        title: data.title,
        titleFr: data.titleFr,
        description: data.description,
        descriptionFr: data.descriptionFr,
        instructorId: data.instructorId,
        price: data.price,
        isFree: data.isFree,
        level: data.level as never,
        category: data.category,
        language: data.language as never,
        thumbnail: data.thumbnail,
        isFeatured: data.isFeatured,
        status: 'PUBLISHED' as never,
        publishedAt: new Date(),
        tags: data.tags,
        requirements: data.requirements,
        outcomes: data.outcomes,
        avgRating: 4.8,
        reviewCount: 312,
        studentCount: 1840,
      },
    });

    let sectionOrder = 0;
    for (const sec of data.sections) {
      const section = await prisma.section.create({ data: { courseId: course.id, title: sec.title, order: sectionOrder++ } });
      let lessonOrder = 0;
      for (const les of sec.lessons) {
        await prisma.lesson.create({
          data: {
            sectionId: section.id,
            title: les.title,
            type: les.type as never,
            duration: les.duration ?? 10,
            order: lessonOrder++,
            isPreview: les.isPreview ?? lessonOrder === 1,
            ...(les.content !== undefined && { content: les.content as never }),
          },
        });
      }
    }
    return course;
  }

  await createTextCourse({
    title: 'Entrepreneurship Masterclass: Build Your Business in Africa',
    titleFr: 'Masterclass Entrepreneuriat : Construire Votre Entreprise en Afrique',
    description: 'A complete, text-based entrepreneurship course designed for African entrepreneurs. From idea to launch — including business planning, funding, marketing, legal setup, and scaling. Each lesson is a deep-dive article with practical frameworks, checklists, and real case studies from Cameroon and Central Africa.',
    descriptionFr: 'Un cours complet basé sur des articles pour entrepreneurs africains. De l\'idée au lancement — planification, financement, marketing, cadre légal et croissance.',
    instructorId: aminaProfile.id,
    price: 0,
    isFree: true,
    level: 'BEGINNER',
    category: 'business-entrepreneurship',
    language: 'EN',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    isFeatured: true,
    tags: ['entrepreneurship', 'business plan', 'startup', 'africa', 'masterclass'],
    requirements: ['No prior business experience needed', 'Willingness to learn and take action', 'A business idea (or openness to find one)'],
    outcomes: [
      'Validate a business idea using lean startup methods',
      'Write a professional business plan',
      'Understand funding options available in Cameroon',
      'Set up your business legally',
      'Build a go-to-market strategy',
      'Scale from 0 to 100 customers',
    ],
    sections: [
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

Ready? Let's build something extraordinary. 🌍`,
              resources: [
                { type: 'link', label: 'Download: Course Workbook (PDF)', url: 'https://esrccameroon.org' },
                { type: 'link', label: 'Community Forum: Introduce Yourself', url: 'https://esrccameroon.org/community' },
              ],
            },
          },
          {
            title: 'The African Entrepreneurial Mindset',
            type: 'ASSIGNMENT',
            duration: 12,
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

Join entrepreneur communities. Share knowledge. Collaborate before you compete.

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

**Mindset Audit** — Score yourself honestly (1–5) on each pillar:
- Problem-first thinking: ___
- Resilience: ___
- Long-term orientation: ___
- Community investment: ___
- Resourcefulness: ___

Your lowest score is your first growth area. Write one concrete action to improve it.`,
              resources: [
                { type: 'link', label: 'Book Summary: The Lean Startup by Eric Ries', url: 'https://leanstartup.co' },
              ],
            },
          },
          {
            title: 'Finding Your Purpose & Ikigai',
            type: 'ASSIGNMENT',
            duration: 10,
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

## The Ikigai Framework Applied

### Step 1: What Do You Love?

Write down activities where you lose track of time. What topics could you discuss for hours? What did you love doing as a child?

*Examples from Cameroonian entrepreneurs:*
- Teaching and explaining complex ideas simply
- Solving logistics puzzles
- Cooking and creating new recipes
- Designing and making things beautiful

### Step 2: What Are You Good At?

List your top 5 skills — not just professional ones. Include soft skills, local knowledge, and life experience.

*Don't be modest here. Include:*
- Languages you speak fluently
- Communities you have deep access to
- Technical skills
- People skills

### Step 3: What Does Your World Need?

Look at your city, your community, your industry. What is broken? What do people complain about? What's inefficient?

Think **local first** — problems in Douala, Bafoussam, or Bamenda don't need Silicon Valley solutions. They need **local solutions built by people who understand the context**.

### Step 4: What Can You Be Paid For?

Which of your skills and interests could solve a problem that people would pay to have solved?

This is where market research begins. Don't assume — **ask real people**.

## Building Your Ikigai Map

Draw four overlapping circles. Label each with your answers above. The overlap is your starting point.

You don't need 100% overlap on Day 1. Many great businesses start with 2 or 3 overlaps and grow into the fourth.

---

**Task for this lesson**: Complete your Ikigai map in My Notes. Take a photo of it if you draw it on paper.`,
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
            content: {
              estimatedReadTime: 15,
              body: `# How to Generate & Filter Business Ideas

## The Idea Myth

Most people believe great entrepreneurs had one brilliant idea that changed everything. The reality? Most successful businesses are **iterations** on existing ideas, applied in new contexts.

You don't need a unique idea. You need an idea that **fits your context** and that you can **execute better than alternatives**.

## Idea Generation Methods

### Method 1: Problem Journaling

For the next 7 days, carry a notebook. Every time you feel frustrated, inconvenienced, or think "why isn't there a solution for this?" — write it down.

At the end of 7 days, you'll have 20–50 real problems worth investigating.

### Method 2: Industry SWOT

Pick an industry you know well. Map out:

- **S**trengths of current players
- **W**eaknesses and gaps
- **O**pportunities no one is serving
- **T**hreats and constraints

Opportunities = your business ideas.

### Method 3: Copy + Localize

What works in Lagos, Nairobi, or Johannesburg but doesn't exist in Yaoundé or Douala?

Many successful Central African businesses are **localized versions** of proven models:
- Jumia (Africa's Amazon)
- PayDunya (Stripe for West Africa)
- Cammerce (local e-commerce)

### Method 4: Ask Your Community

Interview 20 people in your target market. Ask one question:

> *"What's the most frustrating part of [activity] for you?"*

Don't propose solutions yet. Just listen.

## The Idea Filter: 5 Questions

Once you have a list of ideas, run each through this filter:

| Question | What You're Testing |
|----------|---------------------|
| Is the problem real and painful? | Market demand |
| Can I reach the customer? | Distribution |
| Is the solution 10x better than alternatives? | Competitive advantage |
| Can this be profitable? | Business model |
| Do I have an unfair advantage here? | Founder-market fit |

Ideas that score 4–5 "yes" answers are worth pursuing.

## The One-Sentence Business Concept

A validated idea should fit into this template:

> **"[Product/Service] helps [target customer] solve [specific problem] by [unique mechanism], unlike [alternative] which [current frustration]."**

**Example**: *"MarketLink helps Douala market vendors sell remaining produce before close of business by connecting them with last-minute buyers via WhatsApp, unlike throwing it away which costs them 30% of daily revenue."*

Write yours in My Notes before moving to the next lesson.`,
              resources: [
                { type: 'link', label: 'Template: Idea Scoring Matrix', url: 'https://esrccameroon.org' },
              ],
            },
          },
          {
            title: 'Market Research: Knowing Your Customer',
            type: 'ASSIGNMENT',
            duration: 18,
            content: {
              estimatedReadTime: 18,
              body: `# Market Research: Knowing Your Customer

## Why Customer Research Is Non-Negotiable

The #1 reason startups fail: **building something nobody wants**.

Not poor execution. Not bad timing. Not lack of funding.

Building for imaginary customers.

Market research is how you avoid this. It's not optional — it's survival.

## The Customer Interview Method

### Who to Interview

Find 10–20 people who:
- Experience the problem you identified
- Are in your target demographic
- Have tried existing solutions (even imperfect ones)

### How to Find Them

- Personal network: friends, family, colleagues
- Market visits: go where your customers are
- Facebook/WhatsApp groups in your industry
- University campuses
- Professional associations

### What to Ask

**Opening** (3 min):
> "Tell me about the last time you experienced [problem]. What happened?"

**Deep dive** (15 min):
> "How do you currently handle [problem]?"
> "What do you dislike most about how you handle it now?"
> "Have you tried any tools or services to solve this?"
> "How much does this problem cost you — in time, money, stress?"

**Closing** (2 min):
> "Is there anything I should have asked that I didn't?"

**NEVER ask**: "Would you use a product that does X?" — people always say yes. Behavior, not intention, is the signal.

## Analyzing Your Interviews

After 10 interviews, look for patterns:

1. **Common pain points** — What frustrations appear most often?
2. **Workarounds** — What hacks do people use? These reveal pain intensity.
3. **Language** — How do customers *describe* the problem? Use their words in your marketing.
4. **Willingness to pay** — Did anyone mention money? Did they mention budget?

## Market Sizing: TAM, SAM, SOM

| Term | Meaning | Example |
|------|---------|---------|
| TAM | Total Addressable Market | All small businesses in Cameroon |
| SAM | Serviceable Addressable Market | SMEs in Douala + Yaoundé |
| SOM | Serviceable Obtainable Market | SMEs you can realistically reach in Year 1 |

Investors want SOM to be realistic, not inflated.

**Rule of thumb**: If you can't name 100 specific potential customers today, your market definition is too vague.

## Deliverable

Create a **Customer Persona** with:
- Name (fictional)
- Age, location, profession
- Daily challenges related to your solution
- Current workarounds
- What success looks like for them

Save this in My Notes. You'll refer to it throughout the course.`,
            },
          },
          {
            title: 'Validating Your Idea with an MVP',
            type: 'ASSIGNMENT',
            duration: 14,
            content: {
              estimatedReadTime: 14,
              body: `# Validating Your Idea with an MVP

## What is an MVP?

A **Minimum Viable Product** is the simplest version of your product that allows you to test your core assumption with real customers.

Note: "minimum" doesn't mean broken or ugly. It means **minimum features** to test your hypothesis.

## The Core Assumption Test

Every business idea rests on a core assumption. Before building anything, identify yours:

> *"Our business only works if [assumption] is true."*

Examples:
- "Our business only works if market vendors will pay to list unsold produce"
- "Our business only works if women in Bafoussam will buy beauty products online"
- "Our business only works if NGOs need external data analysis support"

Your MVP must test this specific assumption.

## MVP Types (No-Code First)

### The Landing Page MVP
Build a simple webpage describing your product. Add a "Register" or "Pre-order" button. Drive traffic. Measure signups.

**Tools**: Carrd.co, Notion, Vercel (free)
**Tests**: Is there demand?

### The Concierge MVP
Do the service manually for 5–10 early customers. Don't automate yet.

**Example**: Before building a logistics app, be the logistics coordinator yourself. Call vendors, call buyers, coordinate delivery via WhatsApp.

**Tests**: Will customers use + pay for this?

### The Wizard of Oz MVP
The customer thinks it's automated — but you're doing it manually behind the scenes.

**Tests**: Does the automated experience work for users?

### The Pre-Sale MVP
Sell the product before it exists. If customers pay, you've validated.

**Example**: Take payment for 10 orders of your food product before preparing anything.

**Tests**: Real willingness to pay (not hypothetical).

## The Validation Sprint

**Week 1**: Define hypothesis and MVP type
**Week 2**: Build MVP (max 7 days — no longer)
**Week 3**: Get first 10 users/customers
**Week 4**: Interview every single one of them

**Success signals**:
- ✅ Customers found you without referrals
- ✅ Customers paid (or committed to pay)
- ✅ Customers told others unprompted
- ✅ Customers came back

**Pivot signals**:
- ❌ Traffic but no signups
- ❌ Signups but no usage
- ❌ Users but no payment
- ❌ Payment but constant refund requests

---

**Your task**: Define your MVP type and write a 2-sentence hypothesis:

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
            content: {
              estimatedReadTime: 20,
              body: `# The One-Page Business Plan

## Why One Page?

Traditional business plans are 30-page documents that take months to write and are obsolete before they're finished.

Modern entrepreneurs use a **one-page plan** — a living document updated weekly.

The goal: force clarity, not create paperwork.

## The Lean Canvas

The **Lean Canvas** (adapted from Alexander Osterwalder's Business Model Canvas) has 9 blocks:

### Block 1: Problem
List the top 3 problems your customers have.

*Ask: What keeps them up at night?*

### Block 2: Customer Segments
Who exactly are you building for?

Define your **early adopters** — the first 100 customers who will use an imperfect v1.

### Block 3: Unique Value Proposition
One clear sentence: *"We help [X] do [Y] by [Z]."*

This is your elevator pitch.

### Block 4: Solution
The top 3 features of your MVP.

**Not** a full product spec. Just the core functionality.

### Block 5: Channels
How will you reach customers?

- Direct sales
- Social media
- Partnerships
- WhatsApp groups
- Referral programs
- Events and markets

### Block 6: Revenue Streams
How do you make money?

- One-time sale
- Subscription (monthly/annual)
- Commission
- Freemium (free + paid premium)
- Service fees

### Block 7: Cost Structure
Your main expenses:

- Fixed costs (rent, salaries, software)
- Variable costs (cost per unit/customer)

### Block 8: Key Metrics
The 3–5 numbers that tell you if the business is working:

- Daily Active Users
- Monthly Revenue
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Conversion rate

### Block 9: Unfair Advantage
What do you have that competitors can't easily copy?

- Exclusive partnerships
- Deep community relationships
- Proprietary data
- Unique expertise
- First-mover advantage in a specific market

## Financial Projections (Simple Version)

For your first year, estimate:

| Month | Revenue | Costs | Net |
|-------|---------|-------|-----|
| 1     | 0       | 50,000 XAF | -50,000 |
| 3     | 150,000 | 80,000 | +70,000 |
| 6     | 500,000 | 200,000 | +300,000 |
| 12    | 2,000,000 | 600,000 | +1,400,000 |

These are rough estimates. The discipline of making them forces you to think about unit economics.

**Key formulas**:
- **Break-even** = Fixed Costs ÷ (Price – Variable Cost per Unit)
- **CAC** = Marketing Spend ÷ New Customers
- **LTV** = Average Revenue per Customer × Customer Lifetime

---

**Task**: Build your Lean Canvas in My Notes using the 9 blocks above. Be specific. Don't leave any block blank.`,
              resources: [
                { type: 'link', label: 'Lean Canvas Template (Free)', url: 'https://leanstack.com/lean-canvas' },
              ],
            },
          },
          {
            title: 'Legal Setup in Cameroon: What Every Entrepreneur Needs to Know',
            type: 'ASSIGNMENT',
            duration: 16,
            content: {
              estimatedReadTime: 16,
              body: `# Legal Setup in Cameroon: What Every Entrepreneur Needs to Know

## Why Legal Structure Matters

Choosing the right legal structure affects:

- **Taxes**: How much you pay and when
- **Liability**: Whether personal assets are protected
- **Funding**: Whether you can raise investment
- **Contracts**: Your ability to sign formal agreements

Many Cameroonian entrepreneurs operate informally for years — and get stuck when they want to grow, open a bank account, or win a corporate contract.

## Business Structures in Cameroon

### 1. Sole Trader (Entrepreneur Individuel)

**Best for**: Service businesses, freelancers, market vendors

- Simplest and cheapest to register
- No legal separation between you and business
- Taxed as personal income
- Cannot take investors

**Registration**: Centre de Formalités de Création d'Entreprises (CFCE)
**Cost**: ~20,000–50,000 XAF
**Time**: 72 hours (officially)

### 2. SARL (Société à Responsabilité Limitée)

**Best for**: Small businesses with 1–50 partners

Equivalent to an LLC. Limited liability — personal assets protected.

- Minimum capital: 1,000,000 XAF (can be contributed over time)
- 1–50 shareholders
- Annual financial statements required
- Can take investors

**Registration**: CFCE + notary
**Cost**: 150,000–300,000 XAF
**Time**: 2–4 weeks

### 3. SA (Société Anonyme)

**Best for**: Large companies, those seeking major investment

- Minimum capital: 10,000,000 XAF
- Can list on stock exchange
- Board of directors required
- Heavy compliance requirements

**Not recommended** for early-stage startups.

## Step-by-Step SARL Registration

1. **Choose your company name** — Search RCCM (Registre du Commerce) to confirm availability
2. **Draft statutes** — Articles of incorporation (hire a notary)
3. **Open a blocked bank account** — Deposit minimum capital
4. **Get a bank certificate** — Proof of capital deposit
5. **Visit CFCE** — Submit documents (identification, statutes, bank certificate)
6. **Receive your RCCM number** — Your official business registration
7. **Register with CAMINFOTAX** — Tax identification number
8. **Register employees with CNPS** — If you have staff

## Tax Obligations

| Tax | Rate | Frequency |
|-----|------|-----------|
| Corporate Income Tax (IS) | 30% of profit | Annual |
| Value Added Tax (TVA) | 19.25% | Monthly |
| Payroll Tax (IRPP) | Progressive 10–38.5% | Monthly |
| Simplified Tax (TP) | Fixed amounts | Annual |

**Startups tip**: Revenue under 10M XAF/year qualifies for the **Simplified Tax Regime** — significantly less paperwork.

## Intellectual Property

Protect your brand and innovations:

- **Trademark**: Register at OAPI (Organisation Africaine de la Propriété Intellectuelle) for 16 OHADA countries — ~100,000 XAF
- **Patents**: For technical inventions — through OAPI
- **Copyright**: Automatic for creative works — no registration needed

## Practical Tips

✅ Open a dedicated **business bank account** from Day 1 — don't mix personal and business finances

✅ Keep all **receipts and invoices** — you'll need them at tax time

✅ Use a **simple bookkeeping tool** (even a spreadsheet) from the start

✅ Find a **local accountant** (comptable agrée) — worth 50,000 XAF/month

✅ Join **GICAMu** (Groupement Inter-Patronal du Cameroun) for advocacy and legal support`,
              resources: [
                { type: 'link', label: 'CFCE Official Portal — Business Registration', url: 'https://www.cfce.cm' },
                { type: 'link', label: 'OAPI — Intellectual Property Registration', url: 'https://www.oapi.int' },
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
            content: {
              estimatedReadTime: 18,
              body: `# Funding Options for Cameroonian Entrepreneurs

## The Funding Landscape in Cameroon

Funding a business in Cameroon requires understanding both **formal** (banks, investors) and **informal** (family, tontines, grants) sources — because both play essential roles.

## Stage 1: Pre-Revenue (0–12 months)

### Bootstrapping
The most common and underrated funding source.

- Use personal savings
- Take a part-time job while building
- Start small and reinvest every franc of profit

*95% of African businesses are bootstrapped.* There is no shame in this — it forces discipline and customer focus.

### Friends & Family
Informal investment from people who believe in you.

**Important**: Always put it in writing. Even a simple signed letter stating the amount, terms (loan vs gift vs equity), and repayment timeline prevents relationship damage.

### Tontines & Njangi
Cameroon's traditional rotating savings and credit associations.

A group of 10 people each contributes 50,000 XAF/month. Each month, one member receives the full 500,000 XAF pot.

This is **powerful** for lump-sum capital needs. Find or form a tontine with other entrepreneurs in your industry.

## Stage 2: Early Revenue (6–24 months)

### Microfinance Institutions (MFIs)

| Institution | Max Loan | Rate | Notes |
|------------|----------|------|-------|
| CamPost MFI | 5M XAF | 18–24% | Postal service, wide reach |
| Advans Cameroun | 50M XAF | 20–28% | SME-focused |
| MC² | 10M XAF | 15–22% | Rural focus |
| SOCFIN | 30M XAF | 18–25% | Agricultural sector |

**Requirements typically**: 6+ months of business activity, collateral or guarantor, financial statements.

### Government Programs

**BTP (Budget de Transfert aux PME)**: Government grants of up to 5M XAF for registered SMEs.

**MINPMEESA**: Ministry of Small and Medium Enterprises — runs regular entrepreneur support programs.

**APME (Agence de Promotion des PME)**: Technical and financial support, incubation.

Apply early and apply often. Success rates are low but costs are zero.

### Development Finance Institutions

- **AFD (Agence Française de Développement)**: Loans for social impact businesses
- **IFC (International Finance Corporation)**: World Bank's private sector arm
- **BDEAC**: Development Bank of Central African States

These are usually for businesses with 2+ years of track record.

## Stage 3: Growth (2+ years)

### Angel Investors

Individual investors who provide 10M–200M XAF in exchange for equity (ownership stake).

**Where to find them**:
- BACE (Business Angels Cameroun et Ecosystèmes)
- CTIC Dakar (connects across West Africa)
- African Business Angel Network (ABAN)
- NextGen Advisory Program

**What they look for**: Strong team, validated model, large market, clear path to return.

### Venture Capital (VC)

Institutional funds investing 500M XAF+ for equity.

Active in Central Africa:
- Orange Ventures (Telecom-adjacent businesses)
- Goodwell Investments (impact focus)
- Investisseurs & Partenaires (I&P) — SMEs in Francophone Africa

### Grants & Competitions

Free money — but competitive. Apply to:

- **Tony Elumelu Foundation**: $5,000 grant + mentorship (annual, pan-African)
- **Orange Social Entrepreneur Prize**: €25,000 for impact businesses
- **Chivas Venture**: Up to $500,000 for social impact startups
- **MIT Solve**: US-based but accepts African applicants
- **GSMA Innovation Fund**: For mobile technology ventures

**Grant writing tip**: Align your application language with the funder's stated priorities. Read their past winners.

## The Golden Rule of Funding

**Revenue is the best funding.**

Before chasing grants, investors, or loans — focus on getting your first paying customer. Revenue:
- Validates your business model
- Preserves your equity
- Builds your track record for future funding
- Funds your next step without dilution

---

**Task**: Map your funding roadmap — what source will you use for each 6-month period over the next 2 years? Save in My Notes.`,
              resources: [
                { type: 'link', label: 'Tony Elumelu Foundation Application Portal', url: 'https://tefconnect.com' },
                { type: 'link', label: 'I&P — Investors in Francophone African SMEs', url: 'https://www.ietp.com' },
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
            content: {
              estimatedReadTime: 20,
              body: `# Your First 100 Customers: A Step-by-Step Playbook

## Why 100?

The first 100 customers are the hardest — and the most valuable. They teach you:

- Who *actually* wants your product (vs who you assumed)
- Why they buy (your real value proposition)
- How they talk about you (your word-of-mouth message)
- What almost made them leave (your churn risks)

Get to 100 customers. Study them. Everything else follows.

## The 0–10 Customers Phase: Do Things That Don't Scale

Your job in this phase is NOT marketing. It's **sales**.

### 1. Start with Your Network

Make a list of every person you know — family, friends, former colleagues, classmates, church members, neighbours. Do any of them (or anyone they know) experience your target problem?

Reach out personally. Not a mass email — a personal message:

> *"Hi [Name], I'm building [product] to help [problem]. I think you or someone you know might benefit. Can I tell you more?"*

**Target**: 10 conversations → 3–5 first customers.

### 2. Go Where Your Customers Are

Don't wait for customers to find you. Go to them:

- **Physical markets**: Set up a table. Talk to vendors and buyers.
- **WhatsApp groups**: Find groups where your customers hang out. Provide value. Then mention your product.
- **Events and conferences**: Attend industry gatherings. Collect contacts.
- **Partner locations**: Can a business that serves your customers recommend you?

### 3. Offer a Free Trial or Pilot

Reduce the risk of the first purchase:

> *"Try it free for 30 days. If it doesn't solve [problem], you pay nothing."*

This objection-killer converts fence-sitters.

## The 10–50 Customers Phase: Build Your Marketing Engine

Once you have testimonials and case studies, shift from direct sales to scalable marketing.

### WhatsApp Marketing

The most powerful marketing channel in Cameroon.

- **WhatsApp Business**: Set up a catalogue, quick replies, and away messages
- **Broadcast lists**: Send updates to 256 customers at once (non-intrusive)
- **Groups**: Create a customer community (builds loyalty + referrals)
- **Status updates**: Daily value posts seen by all your contacts

**Rule**: Provide 10 value messages for every 1 promotional message.

### Facebook & Instagram

- Post consistently (5x/week minimum)
- Use local language (Français + English)
- Show behind-the-scenes, customer stories, before/after results
- Engage with comments within 1 hour
- Run targeted ads (starting from 1,000 XAF/day)

### Referral Programs

Your best customers are your best salespeople.

> *"Refer a friend and get 1 month free / 10% commission / a free gift"*

Structured referral programs can drive 30–50% of new customer acquisition for B2C businesses in Cameroon.

## The 50–100 Customers Phase: Systematize

### Customer Onboarding

Create a simple process for welcoming new customers:
1. Welcome message (WhatsApp or email)
2. Tutorial or guide (video or PDF)
3. Check-in at Day 7 and Day 30
4. Collect feedback and testimonial

### Retention Over Acquisition

It costs 5–7x more to acquire a new customer than retain an existing one.

Focus on:
- Exceptional customer service (respond within 4 hours)
- Surprise and delight (unexpected gifts, discounts)
- Regular check-ins
- Feedback loops

### Measuring What Matters

Track these weekly:

| Metric | Formula | Target (Year 1) |
|--------|---------|-----------------|
| New customers | Count | 10/month → 50/month |
| Retention rate | Returning ÷ Total | >70% |
| Referral rate | Referred ÷ Total New | >20% |
| Avg revenue/customer | Revenue ÷ Customers | Growing each month |
| NPS | % Promoters - % Detractors | >50 |

---

**Congratulations — you're almost at the end of the course!**

Your final task: Write your 90-day growth plan in My Notes:
- Month 1: Getting to 10 customers
- Month 2: Reaching 50 customers
- Month 3: Hitting 100 customers

Include which channels you'll use, what your offer will be, and how you'll measure success.`,
              resources: [
                { type: 'link', label: 'WhatsApp Business — Getting Started Guide', url: 'https://business.whatsapp.com' },
                { type: 'link', label: 'Facebook Ads for Small Budgets (Meta Guide)', url: 'https://www.facebook.com/business' },
              ],
            },
          },
          {
            title: 'Scaling Your Business: From 100 Customers to 1,000',
            type: 'ASSIGNMENT',
            duration: 14,
            content: {
              estimatedReadTime: 14,
              body: `# Scaling Your Business: From 100 to 1,000 Customers

## The Scaling Trap

Most entrepreneurs think scaling = doing more of what got you to 100 customers — just faster.

Wrong. Scaling requires **different systems**, **different hires**, and **different thinking**.

What worked at 10 customers (personal selling) breaks at 100. What works at 100 (manual operations) breaks at 1,000.

## The 4 Pillars of Scale

### Pillar 1: Systems & Automation

Document every process. Then ask: *can this be systematized or automated?*

| Process | Manual Version | Systematized Version |
|---------|----------------|---------------------|
| Customer onboarding | Personal call | WhatsApp autoresponder |
| Order tracking | Spreadsheet | Simple CRM (Hubspot Free) |
| Payments | Cash collection | Mobile money (MTN API) |
| Financial reporting | Monthly panic | Weekly automated report |

**Tools for African SMEs** (mostly free):
- **Hubspot CRM**: Customer management
- **Wave Accounting**: Free bookkeeping
- **Trello/Notion**: Team operations
- **Zapier**: Connect tools without code

### Pillar 2: Team Building

You cannot scale alone. But hiring wrong people is worse than not hiring.

**First hires** (in order of importance):
1. Sales/operations person — someone who can do what you do
2. Finance/admin — someone who is better with numbers than you
3. Marketing — someone who understands digital + local channels

**Hiring in Cameroon**:
- University partnerships (University of Douala, ESSEC)
- Online job boards: Jobberman Cameroon, NextGen Opportunities Board
- Personal referrals (most reliable)

**Critical**: Start with part-time or commission-based arrangements before full-time.

### Pillar 3: Unit Economics at Scale

Before scaling, confirm your **unit economics are positive**:

- **CAC** (Customer Acquisition Cost) < **LTV** (Lifetime Value)
- **Gross margin** > 40% (ideally 60%+)
- **Payback period** < 12 months (you recover CAC in less than a year)

If unit economics are negative, scaling = losing money faster.

### Pillar 4: Capital for Scale

Scaling typically requires capital for:
- Inventory buildup
- Team expansion
- Marketing investment
- Technology infrastructure

**Funding options at scale stage** (2+ years, 100+ customers):
- Revenue-based financing (borrow against future revenue)
- Bank loans (with track record)
- Angel investment or VC
- Strategic partnerships with larger companies

## The Expansion Checklist

Before scaling to a new city or region:

✅ The business is profitable (or on clear path to profitability)
✅ Operations run without you for 30 days
✅ You have a repeatable playbook for acquiring customers
✅ Your team can execute the playbook
✅ You have 3–6 months of operating capital
✅ You understand the new market's specific dynamics

## Congratulations — Course Complete! 🎉

You've reached the end of the **Entrepreneurship Masterclass**.

Here's what you've built:
- ✅ An entrepreneurial mindset
- ✅ A validated business idea
- ✅ A one-page business plan
- ✅ Legal + funding knowledge for Cameroon
- ✅ A 100-customer growth playbook
- ✅ A scaling framework

**Your certificate** is waiting — but only after you complete all lessons.

Mark this lesson as complete, and your certificate of completion will be generated automatically.

---

*Thank you for learning with NextGen — ESRC Cameroon. Now go build something amazing.* 🌍`,
            },
          },
        ],
      },
    ],
  });

  console.log('Courses seeded successfully.');

  // ─── Course 2: French Innovation Course ────────────────────────────────────────
  await createTextCourse({
    title: 'Innovation pour la Croissance des Entreprises',
    titleFr: 'Innovation pour la Croissance des Entreprises',
    description: 'Un parcours complet en français sur l\'innovation comme levier de croissance des entreprises africaines. De la conception de produits innovants à la mise en œuvre organisationnelle.',
    descriptionFr: 'Un parcours complet sur l\'innovation comme levier de croissance des entreprises africaines.',
    instructorId: emmanuelProfile.id,
    price: 5000,
    isFree: false,
    level: 'INTERMEDIATE',
    category: 'innovation-business',
    language: 'FR',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    isFeatured: true,
    tags: ['innovation', 'croissance', 'entreprise', 'stratégie'],
    requirements: ['Expérience basique en gestion d\'entreprise', 'Maîtrise du français'],
    outcomes: [
      'Définir et classifier les types d\'innovation',
      'Concevoir une stratégie d\'innovation produit',
      'Appliquer les méthodes agiles en contexte africain',
      'Identifier les sources de financement de l\'innovation au Cameroun',
    ],
    sections: [
      {
        title: 'Introduction à l\'Innovation',
        lessons: [
          {
            title: 'Définition et Concepts Clés de l\'Innovation',
            type: 'ASSIGNMENT',
            duration: 10,
            isPreview: true,
            content: {
              body: `# Définition et Concepts Clés de l'Innovation

## Qu'est-ce que l'Innovation?

L'**innovation** est la mise en œuvre réussie d'une idée nouvelle — qu'il s'agisse d'un produit, d'un service, d'un procédé ou d'un modèle organisationnel — qui crée de la valeur pour le marché.

À ne pas confondre avec la simple **invention** (une idée non encore commercialisée) ou la **créativité** (la capacité de générer des idées). L'innovation est l'étape où une idée devient réalité économique.

## Les 4 Types d'Innovation

### 1. Innovation de Produit
Création ou amélioration significative d'un bien ou service.
**Exemple africain** : M-Pesa au Kenya — transformé la simple transaction bancaire en un service accessible depuis un téléphone basique.

### 2. Innovation de Procédé
Amélioration des méthodes de production ou de distribution.
**Exemple** : Les marchands de Douala utilisant WhatsApp Business pour gérer leurs commandes et paiements, réduisant de 40% le temps de traitement.

### 3. Innovation de Marché
Accès à de nouveaux marchés ou nouvelle façon de positionner un produit existant.
**Exemple** : Jumia adaptant le e-commerce à la réalité africaine (livraison à domicile, paiement à la livraison, points relais).

### 4. Innovation Organisationnelle
Nouvelles méthodes de gestion, d'organisation du travail ou de partenariats externes.
**Exemple** : Une PME camerounaise adoptant le management horizontal pour réduire les délais de décision.

## Pourquoi Innover en Afrique?

L'Afrique présente des **contraintes uniques** qui nécessitent des solutions innovantes :
- Infrastructures limitées → opportunités pour l'innovation frugale
- Marchés fragmentés → opportunités pour des plateformes agrégateurs
- Populations jeunes et connectées → marchés pour le numérique
- Ressources naturelles abondantes → opportunités pour la chaîne de valeur locale

## Exercice Pratique

Identifiez une entreprise que vous connaissez dans votre secteur. Classifiez sa principale innovation parmi les 4 types ci-dessus et expliquez pourquoi.`,
            },
          },
          {
            title: 'Les 4 Types d\'Innovation en Détail',
            type: 'ASSIGNMENT',
            duration: 12,
            content: {
              body: `# Les 4 Types d'Innovation — Approfondissement

## L'Innovation Frugale: L'Atout de l'Afrique

L'Afrique a développé un type d'innovation particulièrement pertinent pour les marchés émergents : l'**innovation frugale** (ou *Jugaad* en hindi). Il s'agit de créer plus de valeur avec moins de ressources.

### Caractéristiques de l'Innovation Frugale
- Simplicité maximale
- Prix accessible
- Fonctionnalité ciblée sur l'essentiel
- Résilience face aux conditions difficiles

**Exemple** : Le réfrigérateur Zeer Pot (argile + sable humide) — aucune électricité nécessaire, maintient les légumes frais 3x plus longtemps.

## La Matrice d'Innovation

Pour choisir le type d'innovation le plus pertinent pour votre entreprise, évaluez:

| Dimension | Question clé |
|-----------|-------------|
| Impact marché | Cherchez-vous un nouveau marché ou améliorez-vous votre position actuelle? |
| Impact technologique | Utilisez-vous une technologie existante ou nouvellement développée? |
| Ressources | Quel est votre budget R&D réel? |
| Horizon temporel | Court terme (< 1 an) ou long terme (> 3 ans)? |

## Cas d'Étude: Cameroun

**Wave Mobile Money** a combiné deux types d'innovation:
1. **Innovation de produit**: Frais de transfert quasi nuls (vs 2-3% chez les concurrents)
2. **Innovation de procédé**: Agents en temps réel géo-localisés via une app

Résultat: 1 million d'utilisateurs en 6 mois au Sénégal et expansion rapide en Afrique francophone.

## À Retenir

L'innovation n'est pas réservée aux grandes entreprises ni aux secteurs technologiques. Une simple boutique peut innover en:
- Personnalisant le service client (innovation organisationnelle)
- Offrant la livraison via moto-taxi (innovation de procédé)
- Créant un groupage d'achats pour réduire les coûts (innovation de modèle d'affaires)`,
            },
          },
        ],
      },
      {
        title: 'Stratégies d\'Innovation',
        lessons: [
          {
            title: 'Innovation de Produit pour les Marchés Africains',
            type: 'ASSIGNMENT',
            duration: 14,
            content: {
              body: `# Innovation de Produit pour les Marchés Africains

## Le Design Centré Utilisateur en Contexte Africain

La création d'un produit innovant commence par une **compréhension profonde de l'utilisateur**. En Afrique, cela signifie aller au-delà des études de marché conventionnelles.

### Méthodes d'Immersion Terrain

**1. L'Observation Directe (Shadowing)**
Suivez vos clients potentiels pendant leur journée. Où rencontrent-ils des frictions? Qu'est-ce qui leur prend plus de temps que prévu?

**2. Entretiens Contextuels**
Menez vos entretiens sur le lieu d'usage du produit — pas dans un bureau climatisé déconnecté de la réalité.

**3. Le Prototype Papier**
Avant tout développement numérique, dessinez votre solution sur papier et montrez-la à 10 personnes. Cette étape coûte zéro franc et élimine 80% des erreurs de conception.

## Framework JTBD (Jobs-to-be-Done)

Les clients n'achètent pas des produits — ils "engagent" des solutions pour accomplir un "travail".

**Exemple**: Quand un vendeur de Bafoussam achète un smartphone basique, son "job" n'est pas d'avoir un téléphone — c'est de **ne pas rater de commandes clients quand il est au marché**.

### Application Pratique
1. Listez les "jobs" que vos clients cherchent à accomplir
2. Pour chaque job, identifiez les solutions actuelles (même imparfaites)
3. Trouvez les lacunes — votre innovation comble l'écart entre le job et la meilleure solution disponible

## Roadmap Produit Simplifiée pour PME

| Phase | Durée | Livrables |
|-------|-------|-----------|
| Découverte | 2-4 sem | 20 entretiens clients, cartographie des jobs |
| Prototypage | 1-2 sem | Maquette papier ou MVP numérique |
| Test | 2-4 sem | 50 utilisateurs test, métriques de satisfaction |
| Lancement Beta | 1-2 mois | 200 utilisateurs, boucle de feedback |
| Lancement Public | — | Intégration des retours, scaling |`,
            },
          },
          {
            title: 'Innovation Organisationnelle et Méthodes Agiles',
            type: 'ASSIGNMENT',
            duration: 13,
            content: {
              body: `# Innovation Organisationnelle et Méthodes Agiles

## Pourquoi l'Organisation Est une Source d'Innovation

Beaucoup d'entreprises africaines cherchent à innover dans leurs produits alors que leur plus grand gain compétitif se trouve dans leur **organisation interne**.

Une PME avec une prise de décision rapide, une communication claire et des processus bien définis peut:
- Lancer des produits 3x plus vite
- Réduire les erreurs de 60%
- Fidéliser ses talents clés

## Les Méthodes Agiles Adaptées à l'Afrique

### Scrum Allégé (pour équipes de 3-7 personnes)

**Sprint**: Cycle de travail de 1-2 semaines avec un objectif précis
**Daily Stand-up**: Réunion debout de 15 min chaque matin (même en équipe de 3)
**Retrospective**: 30 min bi-hebdomadaires: "Qu'est-ce qui a bien marché? Qu'est-ce qu'on améliore?"

### Kanban Simple

Créez un tableau (même physique, sur un mur) avec 3 colonnes:
- **À faire** | **En cours** | **Terminé**

Règle d'or: Maximum 3 tâches "En cours" par personne à la fois.

## Cas Pratique: Cabinet de Formation à Yaoundé

Une petite structure de formation (8 employés) a adopté ces pratiques:
- **Avant**: Délai moyen de création d'une formation = 6 semaines
- **Après Agile**: Délai = 12 jours

Comment? Réunions quotidiennes, découpage des tâches en livrables de 2 jours, validation client à mi-parcours.

## Culture d'Innovation

L'innovation organisationnelle n'est pas seulement des outils — c'est une **culture**:

1. **Droit à l'erreur calculée**: Les équipes qui ne font jamais d'erreurs n'innovent pas
2. **Partage des apprentissages**: Créez un "journal des apprentissages" mensuel
3. **Autonomie cadrée**: Donnez aux équipes des objectifs clairs, pas des méthodes imposées
4. **Cycles de feedback courts**: Ne pas attendre 6 mois pour savoir si une idée fonctionne`,
            },
          },
          {
            title: 'Quiz: Stratégies d\'Innovation',
            type: 'QUIZ',
            duration: 8,
            content: {
              questions: [
                {
                  id: 'q1',
                  text: 'Une entreprise qui améliore significativement sa méthode de livraison pratique quel type d\'innovation?',
                  type: 'multiple_choice',
                  points: 25,
                  options: [
                    { id: 'a', text: 'Innovation de produit', isCorrect: false },
                    { id: 'b', text: 'Innovation de procédé', isCorrect: true },
                    { id: 'c', text: 'Innovation de marché', isCorrect: false },
                    { id: 'd', text: 'Innovation organisationnelle', isCorrect: false },
                  ],
                  explanation: 'L\'amélioration des méthodes de distribution est une innovation de procédé.',
                },
                {
                  id: 'q2',
                  text: 'L\'innovation frugale se caractérise par la création de valeur avec moins de ressources.',
                  type: 'true_false',
                  points: 25,
                  options: [
                    { id: 'true', text: 'Vrai', isCorrect: true },
                    { id: 'false', text: 'Faux', isCorrect: false },
                  ],
                  explanation: 'Correct. L\'innovation frugale maximise la valeur avec des ressources minimales.',
                },
                {
                  id: 'q3',
                  text: 'Selon le framework JTBD, qu\'est-ce que les clients achètent réellement?',
                  type: 'multiple_choice',
                  points: 25,
                  options: [
                    { id: 'a', text: 'Des produits physiques', isCorrect: false },
                    { id: 'b', text: 'Des solutions pour accomplir un travail', isCorrect: true },
                    { id: 'c', text: 'Des marques reconnues', isCorrect: false },
                    { id: 'd', text: 'Des expériences émotionnelles', isCorrect: false },
                  ],
                  explanation: 'Le JTBD stipule que les clients engagent des solutions pour accomplir un "travail" précis.',
                },
                {
                  id: 'q4',
                  text: 'Quelle est la durée recommandée d\'un sprint dans la méthode Scrum allégée pour PME?',
                  type: 'multiple_choice',
                  points: 25,
                  options: [
                    { id: 'a', text: '1 heure', isCorrect: false },
                    { id: 'b', text: '1 jour', isCorrect: false },
                    { id: 'c', text: '1-2 semaines', isCorrect: true },
                    { id: 'd', text: '1-2 mois', isCorrect: false },
                  ],
                  explanation: 'Un sprint de 1-2 semaines permet des cycles rapides d\'itération et d\'apprentissage.',
                },
              ],
              settings: {
                passingScore: 60,
                timeLimit: 0,
                randomize: false,
                showAnswers: true,
                attemptsAllowed: 3,
              },
            } as never,
          },
        ],
      },
      {
        title: 'Mise en Œuvre et Financement',
        lessons: [
          {
            title: 'Financement de l\'Innovation au Cameroun',
            type: 'ASSIGNMENT',
            duration: 12,
            content: {
              body: `# Financement de l'Innovation au Cameroun et en Afrique Centrale

## Le Paysage du Financement de l'Innovation

Innover coûte de l'argent — mais pas autant qu'on le pense si l'on connaît les bonnes sources.

### Sources Nationales au Cameroun

**1. BDEAC (Banque de Développement des États de l'Afrique Centrale)**
- Prêts à taux préférentiels pour PME innovantes dans la zone CEMAC
- Montants: 5M XAF – 500M XAF
- Priorité aux secteurs: agro-industrie, numérique, énergie renouvelable

**2. Fonds de Garantie PME (Cameroun)**
- Garantit jusqu'à 70% des prêts bancaires pour PME
- Permet d'accéder au crédit même sans garanties suffisantes

**3. MINPMEESA (Ministère des PME)**
- Programme d'appui aux jeunes entrepreneurs (subventions jusqu'à 2,5M XAF)
- Formation + financement combinés

### Sources Régionales et Internationales

**AFD (Agence Française de Développement)**
- Lignes de crédit via les banques locales partenaires (Bicec, Afriland)
- Focus: énergie verte, agriculture, habitat

**Tony Elumelu Foundation**
- Subvention de $5,000 USD + 12 semaines de formation
- 1,000 entrepreneurs africains sélectionnés/an
- Candidature en ligne: **www.tonyelumelufoundation.org**

**World Bank IFC**
- Financement d'entreprises à fort impact social ou environnemental
- Montants: $1M USD+
- Principalement pour les PME en expansion

### Financement Alternatif et Innovant

**Mobile Money Micro-crédit (MTN MoMo + CCA Bank)**
- Crédit instantané basé sur l'historique de transactions MoMo
- Montants: 50,000 – 2,000,000 XAF
- Taux: 3-5%/mois (à comparer avec les usuriers)

**Crowdfunding (Holo Africa, Wefund Africa)**
- Levée de fonds auprès de la communauté
- Idéal pour des projets avec fort ancrage local

## Préparer son Dossier de Financement

Un dossier solide comprend:
1. **Executive Summary** (1 page) — Ce qu'est votre innovation et pourquoi maintenant
2. **Analyse de marché** — Taille, segments, concurrence
3. **Modèle financier** (3 ans) — Revenus, charges, BFR, point mort
4. **Plan d'utilisation des fonds** — Détail précis sur 12 mois
5. **CV des fondateurs** — Expérience et légitimité`,
            },
          },
          {
            title: 'Projet Final: Plan d\'Innovation',
            type: 'ASSIGNMENT',
            duration: 15,
            content: {
              description: `## Projet Final: Votre Plan d'Innovation d'Entreprise

Félicitations! Vous êtes arrivé au terme du cours. Il est maintenant temps de mettre en pratique tout ce que vous avez appris.

### Instructions

Rédigez un **Plan d'Innovation** de 2 à 3 pages pour votre entreprise (réelle ou fictive) en suivant la structure ci-dessous:

**1. Description de l'entreprise** (1 paragraphe)
- Secteur, taille, marchés servis

**2. Type d'innovation choisi** (1 paragraphe)
- Pourquoi ce type d'innovation est le plus approprié pour votre contexte?

**3. Analyse JTBD** (1/2 page)
- Quel "job" vos clients cherchent-ils à accomplir?
- Comment votre innovation y répond-elle mieux que les solutions actuelles?

**4. Plan de mise en œuvre** (Tableau de 6 mois)
- Étapes clés, responsables, ressources nécessaires

**5. Plan de financement** (1/2 page)
- Source(s) de financement identifiées et montants estimés

### Critères d'Évaluation
- Cohérence entre le type d'innovation et le contexte: 30%
- Qualité de l'analyse JTBD: 25%
- Réalisme du plan de mise en œuvre: 25%
- Pertinence du plan de financement: 20%`,
              settings: {
                totalPoints: 100,
                passingPoints: 65,
                timeLimitWeeks: 2,
                hasDeadline: false,
                deadline: '',
                allowResubmission: true,
                maxResubmissions: 2,
                fileUploadLimit: 1,
                maxFileSizeMB: 5,
              },
            } as never,
          },
        ],
      },
    ],
  });

  console.log('French innovation course seeded.');

  // ─── Enroll Goodness Emmanuel in the Masterclass with partial progress ─────────
  const goodness = await prisma.user.findUnique({ where: { email: 'goodnessemma05@gmail.com' } });
  const masterclass = await prisma.course.findFirst({ where: { title: 'Entrepreneurship Masterclass: Build Your Business in Africa' } });

  if (goodness && masterclass) {
    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: goodness.id, courseId: masterclass.id } },
      create: { userId: goodness.id, courseId: masterclass.id },
      update: {},
    });

    // Mark first 3 lessons complete to show partial progress
    const firstSection = await prisma.section.findFirst({
      where: { courseId: masterclass.id },
      orderBy: { order: 'asc' },
      include: { lessons: { orderBy: { order: 'asc' }, take: 3 } },
    });

    if (firstSection?.lessons) {
      for (const lesson of firstSection.lessons) {
        await prisma.lessonCompletion.upsert({
          where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: lesson.id } },
          create: { enrollmentId: enrollment.id, lessonId: lesson.id },
          update: {},
        });
      }
    }

    // Count total lessons in this course
    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId: masterclass.id } },
    });
    const completedCount = firstSection?.lessons?.length ?? 0;
    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100 * 10) / 10 : 0;

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progressPct },
    });

    console.log(`Goodness Emmanuel enrolled in Masterclass with ${progressPct}% progress (${completedCount}/${totalLessons} lessons).`);
  }

  // ─── Events ────────────────────────────────────────────────────────────────────
  await prisma.event.createMany({
    data: [
      {
        title: 'Africa Entrepreneurship Summit 2026',
        titleFr: 'Sommet de l\'Entrepreneuriat Africain 2026',
        description: 'The premier gathering of African entrepreneurs, investors, and ecosystem builders. Three days of keynotes, workshops, and networking in the heart of Yaoundé.',
        type: 'CONFERENCE',
        startDate: new Date('2026-03-20T08:00:00Z'),
        endDate: new Date('2026-03-22T18:00:00Z'),
        location: 'Palais des Congrès, Yaoundé',
        isOnline: false,
        price: 0,
        isFree: true,
        capacity: 200,
        thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        tags: ['entrepreneurship', 'summit', 'networking', 'africa'],
        isPublished: true,
      },
      {
        title: 'Digital Skills Workshop: AI for Africa',
        titleFr: 'Atelier Compétences Numériques : L\'IA pour l\'Afrique',
        description: 'A hands-on online workshop exploring practical applications of AI tools for African professionals and entrepreneurs. No coding required.',
        type: 'WORKSHOP',
        startDate: new Date('2026-04-05T09:00:00Z'),
        endDate: new Date('2026-04-05T13:00:00Z'),
        location: 'Online',
        isOnline: true,
        meetingUrl: 'https://nextgen.africa/events/ai-workshop',
        price: 5000,
        isFree: false,
        capacity: 50,
        thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
        tags: ['AI', 'digital skills', 'technology', 'online'],
        isPublished: true,
      },
      {
        title: 'Women in Business Networking Event',
        titleFr: 'Événement de Réseautage Femmes en Affaires',
        description: 'A monthly virtual networking event connecting women entrepreneurs across Francophone Africa. Share challenges, find mentors, and build lasting professional relationships.',
        type: 'WEBINAR',
        startDate: new Date('2026-04-15T17:00:00Z'),
        endDate: new Date('2026-04-15T19:00:00Z'),
        location: 'Online',
        isOnline: true,
        meetingUrl: 'https://nextgen.africa/events/women-network',
        price: 0,
        isFree: true,
        capacity: 150,
        thumbnail: 'https://images.unsplash.com/photo-1573166953836-06864dc2e44d?w=800&q=80',
        tags: ['women', 'networking', 'business', 'mentorship'],
        isPublished: true,
      },
      {
        title: 'Research Methods Masterclass',
        titleFr: 'Masterclass en Méthodes de Recherche',
        description: 'A two-day intensive training on applied research methods for development practitioners, NGO staff, and early-career researchers in Central Africa.',
        type: 'TRAINING',
        startDate: new Date('2026-05-10T08:00:00Z'),
        endDate: new Date('2026-05-11T17:00:00Z'),
        location: 'Université de Douala, Amphi B',
        isOnline: false,
        price: 0,
        isFree: true,
        capacity: 80,
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
        tags: ['research', 'training', 'methodology', 'practitioners'],
        isPublished: true,
      },
      {
        title: 'Central Africa Policy Forum 2026',
        titleFr: 'Forum des Politiques d\'Afrique Centrale 2026',
        description: 'A high-level policy dialogue bringing together government officials, civil society, and development partners to discuss regional development priorities and the implementation of Agenda 2063.',
        type: 'CONFERENCE',
        startDate: new Date('2026-06-20T08:00:00Z'),
        endDate: new Date('2026-06-21T18:00:00Z'),
        location: 'Hôtel Mont Fébé, Yaoundé',
        isOnline: false,
        price: 10000,
        isFree: false,
        capacity: 300,
        thumbnail: 'https://images.unsplash.com/photo-1529088746738-c4c0a152fb2c?w=800&q=80',
        tags: ['policy', 'governance', 'development', 'CEMAC'],
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  });

  // ─── Publications ──────────────────────────────────────────────────────────────
  await prisma.publication.createMany({
    data: [
      {
        title: 'State of Entrepreneurship in Cameroon 2025',
        titleFr: 'État de l\'Entrepreneuriat au Cameroun 2025',
        abstract: 'A comprehensive assessment of the entrepreneurial ecosystem in Cameroon, covering access to finance, regulatory environment, market opportunities, and the impact of digital tools on SME growth.',
        authors: ['Dr. Amina Ngozi', 'Dr. Prosper Biyong', 'NextGen Research Team'],
        type: 'REPORT',
        fileUrl: 'https://nextgen.africa/publications/entrepreneurship-cameroon-2025.pdf',
        doi: '10.1234/nextgen.2025.001',
        tags: ['entrepreneurship', 'cameroon', 'SME', 'ecosystem'],
        sdgGoals: [8, 9, 10],
        downloadCount: 487,
        isApproved: true,
        publishedAt: new Date('2025-01-15'),
      },
      {
        title: 'Digital Financial Inclusion in Central Africa',
        titleFr: 'Inclusion Financière Numérique en Afrique Centrale',
        abstract: 'This policy brief examines the expansion of mobile money and digital banking in CEMAC countries, identifying barriers to financial inclusion and recommending regulatory reforms to accelerate adoption.',
        authors: ['Prof. Emmanuel Tchoupo', 'Cécile Mbarga'],
        type: 'POLICY_BRIEF',
        fileUrl: 'https://nextgen.africa/publications/digital-finance-cemac.pdf',
        doi: '10.1234/nextgen.2025.002',
        tags: ['fintech', 'mobile money', 'financial inclusion', 'CEMAC'],
        sdgGoals: [1, 8, 10],
        downloadCount: 312,
        isApproved: true,
        publishedAt: new Date('2025-03-01'),
      },
      {
        title: 'Gender Gap in STEM Education: A Cameroon Perspective',
        titleFr: 'Fossé de Genre dans l\'Éducation STEM : Perspective du Cameroun',
        abstract: 'This working paper investigates the structural and cultural factors that limit women\'s participation in STEM fields in Cameroon, drawing on a mixed-methods study of 800 secondary and university students.',
        authors: ['Dr. Fatima Aliou', 'Marie Nguemo'],
        type: 'WORKING_PAPER',
        fileUrl: 'https://nextgen.africa/publications/gender-stem-cameroon.pdf',
        doi: '10.1234/nextgen.2024.003',
        tags: ['gender', 'STEM', 'education', 'women'],
        sdgGoals: [4, 5],
        downloadCount: 228,
        isApproved: true,
        publishedAt: new Date('2024-09-10'),
      },
      {
        title: 'Agricultural Value Chains in Sub-Saharan Africa',
        titleFr: 'Chaînes de Valeur Agricoles en Afrique Subsaharienne',
        abstract: 'A peer-reviewed analysis of smallholder integration into modern agricultural value chains across six Sub-Saharan African countries, with policy recommendations for governments and development organizations.',
        authors: ['Dr. Kofi Mensah', 'Ibrahim Ouédraogo', 'NextGen Agricultural Research Unit'],
        type: 'JOURNAL_ARTICLE',
        fileUrl: 'https://nextgen.africa/publications/agri-value-chains-ssa.pdf',
        doi: '10.1234/nextgen.2024.004',
        tags: ['agriculture', 'value chains', 'smallholders', 'food security'],
        sdgGoals: [1, 2, 8],
        downloadCount: 156,
        isApproved: true,
        publishedAt: new Date('2024-06-20'),
      },
      {
        title: 'Youth Unemployment and Skills Mismatch in Cameroon',
        titleFr: 'Chômage des Jeunes et Inadéquation des Compétences au Cameroun',
        abstract: 'An in-depth report on youth unemployment trends, skills gaps, and the mismatch between higher education outputs and labor market demands in Cameroon, with actionable recommendations for policymakers.',
        authors: ['Prof. Emmanuel Tchoupo', 'Dr. Amina Ngozi', 'Jean Fotso'],
        type: 'REPORT',
        fileUrl: 'https://nextgen.africa/publications/youth-unemployment-cameroon.pdf',
        doi: '10.1234/nextgen.2024.005',
        tags: ['youth', 'unemployment', 'skills', 'education', 'policy'],
        sdgGoals: [4, 8, 10],
        downloadCount: 394,
        isApproved: true,
        publishedAt: new Date('2024-11-05'),
      },
      {
        title: 'SME Activity in Central Africa 2024 — Open Dataset',
        titleFr: 'Activité des PME en Afrique Centrale 2024 — Jeu de Données Ouvert',
        abstract: 'An open-access dataset containing survey data from 2,400 SMEs across Cameroon, DRC, Chad, and Gabon, covering business formalization, digital adoption, financing, and employment. Suitable for research and policy analysis.',
        authors: ['NextGen Research Team'],
        type: 'DATASET',
        fileUrl: 'https://nextgen.africa/publications/sme-data-central-africa-2024.csv',
        doi: '10.1234/nextgen.2024.006',
        tags: ['SME', 'dataset', 'central africa', 'open data'],
        sdgGoals: [8, 9, 17],
        downloadCount: 521,
        isApproved: true,
        publishedAt: new Date('2024-12-01'),
      },
    ],
    skipDuplicates: true,
  });

  // ─── Opportunities ─────────────────────────────────────────────────────────────
  await prisma.opportunity.createMany({
    data: [
      {
        title: 'Junior Researcher Fellowship',
        organization: 'NextGen Research Institute',
        type: 'FELLOWSHIP',
        description: 'A 12-month fully-funded fellowship for early-career researchers focused on development economics or social policy in Cameroon and Central Africa. Fellows receive mentorship, a stipend, and a research budget.',
        requirements: ['Masters degree in economics, social science or related field', 'Research proposal on a Central Africa topic', 'French or English proficiency'],
        deadline: new Date('2026-05-31'),
        location: 'Yaoundé, Cameroon',
        isRemote: false,
        applicationUrl: 'https://nextgen.africa/opportunities/junior-researcher-fellowship',
        tags: ['research', 'fellowship', 'economics', 'policy'],
        isApproved: true,
      },
      {
        title: 'Business Development Internship',
        organization: 'NextGen Ventures',
        type: 'INTERNSHIP',
        description: 'A 6-month paid internship for recent graduates to support NextGen\'s business development team in Douala. Work on partnership development, market research, and client engagement.',
        requirements: ['Bachelor\'s degree in business, marketing or related field', 'Strong analytical and communication skills', 'French and English required'],
        deadline: new Date('2026-04-15'),
        location: 'Douala, Cameroon',
        isRemote: false,
        salary: '150,000 XAF / month',
        applicationUrl: 'https://nextgen.africa/opportunities/biz-dev-internship',
        tags: ['internship', 'business development', 'Douala'],
        isApproved: true,
      },
      {
        title: 'AGRA Agricultural Innovation Grant',
        organization: 'Alliance for a Green Revolution in Africa (AGRA)',
        type: 'GRANT',
        description: 'Grants of up to $50,000 USD for innovative agribusiness ventures in Cameroon, DRC, and Chad focused on sustainable food systems, smallholder productivity, or climate-smart agriculture.',
        requirements: ['Registered agribusiness entity', 'At least 1 year of operations', 'Innovation element with measurable impact on smallholders'],
        deadline: new Date('2026-06-30'),
        location: 'Remote',
        isRemote: true,
        applicationUrl: 'https://agra.org/grants/innovation',
        tags: ['agriculture', 'grant', 'food security', 'AGRA'],
        isApproved: true,
      },
      {
        title: 'Cameroon Startup Competition 2026',
        organization: 'Ministry of SMEs, Cameroon',
        type: 'COMPETITION',
        description: 'The national startup competition recognizing Cameroon\'s most innovative early-stage companies. Winners receive prize money, investor access, and a spot in the national accelerator program.',
        requirements: ['Cameroon-registered startup', 'Less than 3 years old', 'Technology or innovation component'],
        deadline: new Date('2026-04-30'),
        location: 'Yaoundé, Cameroon',
        isRemote: false,
        applicationUrl: 'https://minpmeesa.cm/startup-competition-2026',
        tags: ['startup', 'competition', 'innovation', 'prize'],
        isApproved: true,
      },
      {
        title: 'Policy Analyst — World Bank Yaoundé',
        organization: 'World Bank Group',
        type: 'JOB',
        description: 'The World Bank Country Office in Yaoundé is recruiting an experienced Policy Analyst to support economic research, policy dialogue, and project supervision in Cameroon\'s education and social protection sectors.',
        requirements: ['Master\'s degree in economics, public policy or related field', '5+ years of relevant experience', 'Excellent French and English writing skills'],
        deadline: new Date('2026-03-31'),
        location: 'Yaoundé, Cameroon',
        isRemote: false,
        salary: 'Competitive, World Bank scale',
        applicationUrl: 'https://worldbank.org/jobs/policy-analyst-yaounde',
        tags: ['policy', 'World Bank', 'economics', 'Yaoundé'],
        isApproved: true,
      },
      {
        title: 'AfDB Young Leaders Fellowship',
        organization: 'African Development Bank',
        type: 'FELLOWSHIP',
        description: 'A prestigious 2-year fellowship program at the African Development Bank for outstanding young African professionals (aged 25-35) with backgrounds in development economics, finance, or engineering.',
        requirements: ['Age 25-35', 'Masters or PhD in relevant field', 'Demonstrated leadership experience', 'African citizenship'],
        deadline: new Date('2026-05-15'),
        location: 'Abidjan, Côte d\'Ivoire',
        isRemote: false,
        salary: 'Full stipend + benefits',
        applicationUrl: 'https://afdb.org/young-leaders-fellowship',
        tags: ['fellowship', 'AfDB', 'leadership', 'development'],
        isApproved: true,
      },
      {
        title: 'Digital Marketing Associate',
        organization: 'NextGen',
        type: 'JOB',
        description: 'Join NextGen\'s growing marketing team in Yaoundé as a Digital Marketing Associate. You will manage social media channels, run paid campaigns, create content, and grow our learner community across Africa.',
        requirements: ['1-2 years digital marketing experience', 'Proficiency in Facebook Ads and Google Analytics', 'Bilingual (French/English)', 'Passion for education and Africa'],
        deadline: new Date('2026-04-01'),
        location: 'Yaoundé, Cameroon',
        isRemote: false,
        salary: '250,000 – 350,000 XAF / month',
        applicationUrl: 'https://nextgen.africa/jobs/digital-marketing-associate',
        tags: ['marketing', 'digital', 'job', 'NextGen'],
        isApproved: true,
      },
      {
        title: 'Women Entrepreneurs Fund Grant',
        organization: 'Tony Elumelu Foundation',
        type: 'GRANT',
        description: 'Annual seed capital grants of $5,000 USD for women-led businesses in Francophone Africa, as part of the Tony Elumelu Foundation Entrepreneurship Programme. Includes mentorship and training.',
        requirements: ['Woman-led business', 'African citizen', 'Business plan submitted', 'No previous TEF grant recipients'],
        deadline: new Date('2026-03-31'),
        location: 'Remote',
        isRemote: true,
        salary: '$5,000 USD seed capital',
        applicationUrl: 'https://tonyelumelufoundation.org/teep',
        tags: ['grant', 'women', 'TEF', 'seed capital'],
        isApproved: true,
      },
    ],
    skipDuplicates: true,
  });

  // ─── Forum / Community Posts ─────────────────────────────────────────────────
  const existingForumCount = await prisma.forumPost.count();
  if (existingForumCount === 0) {
    // Ensure demo users exist for forum authorship
    const demoUsers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'amara.kamara@demo.nextgen' },
        create: {
          email: 'amara.kamara@demo.nextgen',
          firstName: 'Amara',
          lastName: 'Kamara',
          passwordHash: await bcrypt.hash('DemoPass123!', 10),
          role: 'LEARNER',
          country: 'Cameroon',
          city: 'Douala',
        },
        update: {},
      }),
      prisma.user.upsert({
        where: { email: 'jean.fotso@demo.nextgen' },
        create: {
          email: 'jean.fotso@demo.nextgen',
          firstName: 'Jean',
          lastName: 'Fotso',
          passwordHash: await bcrypt.hash('DemoPass123!', 10),
          role: 'FELLOW',
          country: 'Cameroon',
          city: 'Yaoundé',
        },
        update: {},
      }),
      prisma.user.upsert({
        where: { email: 'alice.abwe@demo.nextgen' },
        create: {
          email: 'alice.abwe@demo.nextgen',
          firstName: 'Alice',
          lastName: 'Abwe',
          passwordHash: await bcrypt.hash('DemoPass123!', 10),
          role: 'LEARNER',
          country: 'Cameroon',
          city: 'Buea',
        },
        update: {},
      }),
      prisma.user.upsert({
        where: { email: 'fatou.diallo@demo.nextgen' },
        create: {
          email: 'fatou.diallo@demo.nextgen',
          firstName: 'Fatou',
          lastName: 'Diallo',
          passwordHash: await bcrypt.hash('DemoPass123!', 10),
          role: 'LEARNER',
          country: 'Senegal',
          city: 'Dakar',
        },
        update: {},
      }),
      prisma.user.upsert({
        where: { email: 'prosper.biyong@demo.nextgen' },
        create: {
          email: 'prosper.biyong@demo.nextgen',
          firstName: 'Prosper',
          lastName: 'Biyong',
          passwordHash: await bcrypt.hash('DemoPass123!', 10),
          role: 'FELLOW',
          country: 'Cameroon',
          city: 'Yaoundé',
        },
        update: {},
      }),
    ]);
    const [amara, jean, alice, fatou, prosper] = demoUsers;

    const post1 = await prisma.forumPost.create({
      data: {
        userId: amara.id,
        title: 'How to register a startup in Cameroon — step by step guide',
        content: `Starting a business in Cameroon can feel overwhelming, but I've been through it and want to share a practical breakdown.\n\n1. Choose your business structure (SARL is most common for SMEs)\n2. Reserve your company name at CFCE\n3. Deposit initial capital at the bank\n4. Register with the Trade Register\n5. Obtain your tax identification number (NIU)\n\nThe whole process took me about 3 weeks in Douala. Budget around 150,000–300,000 FCFA for all fees. Happy to answer specific questions!`,
        category: 'Entrepreneurship',
        isPinned: true,
        viewCount: 342,
        likeCount: 47,
        createdAt: new Date('2025-11-10T09:00:00Z'),
      },
    });
    await prisma.forumReply.createMany({
      data: [
        { postId: post1.id, userId: jean.id, content: 'Thank you Amara! Do you need a physical office address for CFCE or can you use a residential address?', createdAt: new Date('2025-11-10T10:30:00Z'), likeCount: 3 },
        { postId: post1.id, userId: alice.id, content: 'For SARL you need a commercial address. A coworking space in Bonanjo was about 15,000 FCFA/month for us — great option.', createdAt: new Date('2025-11-10T11:45:00Z'), likeCount: 5 },
        { postId: post1.id, userId: amara.id, content: '@Jean — Correct. Virtual offices are a great affordable option for commercial address requirements.', createdAt: new Date('2025-11-10T13:00:00Z'), likeCount: 2 },
        { postId: post1.id, userId: fatou.id, content: 'Is this similar in Senegal? I am preparing to launch through APIX here.', createdAt: new Date('2025-11-11T08:20:00Z'), likeCount: 1 },
        { postId: post1.id, userId: prosper.id, content: 'The OHADA framework harmonizes business law across 17 African countries including both. SARL minimum capital is 1,000,000 FCFA in most OHADA states.', createdAt: new Date('2025-11-11T09:15:00Z'), likeCount: 8 },
      ],
    });

    const post2 = await prisma.forumPost.create({
      data: {
        userId: alice.id,
        title: 'Best tools for building a mobile app on a bootstrap budget',
        content: `Building an agri-tech app for smallholder farmers — here are the tools I use that cost nothing:\n\n- React Native (free, cross-platform iOS & Android)\n- Supabase free tier (auth, database, file storage)\n- Notchpay API (MTN MoMo and Orange Money)\n- OpenStreetMap with Leaflet.js (free vs Google Maps)\n- PouchDB + CouchDB for offline-first sync\n\nTotal monthly cost for my MVP: ~0 USD under 500 users. What is everyone else using?`,
        category: 'Technology',
        isPinned: false,
        viewCount: 218,
        likeCount: 31,
        createdAt: new Date('2025-12-03T14:00:00Z'),
      },
    });
    await prisma.forumReply.createMany({
      data: [
        { postId: post2.id, userId: amara.id, content: 'Great list! Also add Expo for React Native — it simplifies deployment significantly. Firebase Spark plan is free up to 1GB storage too.', createdAt: new Date('2025-12-03T15:30:00Z'), likeCount: 4 },
        { postId: post2.id, userId: jean.id, content: "For payments, check Campay — it's Cameroonian-built with great MTN and Orange docs. Sandbox is completely free.", createdAt: new Date('2025-12-03T17:00:00Z'), likeCount: 6 },
        { postId: post2.id, userId: fatou.id, content: 'Does Notchpay work across CEMAC or just Cameroon? Also any good offline-first solutions for poor connectivity areas?', createdAt: new Date('2025-12-04T09:10:00Z'), likeCount: 2 },
        { postId: post2.id, userId: alice.id, content: '@Fatou — Notchpay is primarily Cameroon right now. For offline-first I use PouchDB with CouchDB sync — works great for farmers in villages with no signal.', createdAt: new Date('2025-12-04T10:30:00Z'), likeCount: 7 },
      ],
    });

    const post3 = await prisma.forumPost.create({
      data: {
        userId: prosper.id,
        title: 'Access to finance for African SMEs: practical overview of options in 2025',
        content: `A structured overview of funding options for entrepreneurs in the CEMAC zone:\n\n1. Microfinance (MFIs): CAMCCUL network — up to 10M FCFA, 15–25% interest\n2. Impact Investors: I&P, XSML — €50K–€500K tickets\n3. DFI-backed loans via AfDB — 8–12% rates, higher requirements\n4. Grants: TEF, Orange Corners, GIZ — non-dilutive but competitive\n5. Equity Crowdfunding: Afrikwity — emerging for tech startups\n\nRecommendation: exhaust grants and MFI options before giving equity. Preserve ownership while proving the model.`,
        category: 'Finance',
        isPinned: true,
        viewCount: 589,
        likeCount: 84,
        createdAt: new Date('2025-10-15T11:00:00Z'),
      },
    });
    await prisma.forumReply.createMany({
      data: [
        { postId: post3.id, userId: amara.id, content: 'I applied to TEF in 2024 and was selected — truly transformative. Application opens every January. Recommend to anyone with a viable business idea.', createdAt: new Date('2025-10-15T13:30:00Z'), likeCount: 12 },
        { postId: post3.id, userId: jean.id, content: "What's your view on BEAC's SME refinancing window? Does it actually reach SMEs or get absorbed by large banks?", createdAt: new Date('2025-10-16T08:00:00Z'), likeCount: 5 },
        { postId: post3.id, userId: prosper.id, content: 'Trickle-down has been limited. Most promising is the FAGACE guarantee fund — ask your partner bank specifically about FAGACE-backed loans.', createdAt: new Date('2025-10-16T10:15:00Z'), likeCount: 9 },
        { postId: post3.id, userId: fatou.id, content: 'Do any options work for early-stage social enterprises? We generate revenue but cannot give equity.', createdAt: new Date('2025-10-17T09:30:00Z'), likeCount: 3 },
        { postId: post3.id, userId: alice.id, content: 'USAID DCHA and SIDA run social enterprise grant windows for West Africa. Also look at Ashoka Fellow program — the network support is worth as much as the funding.', createdAt: new Date('2025-10-17T11:00:00Z'), likeCount: 7 },
      ],
    });

    const post4 = await prisma.forumPost.create({
      data: {
        userId: jean.id,
        title: 'Climate-smart agriculture in Cameroon — what is actually working on the ground?',
        content: `Three years working with smallholder farmers in the Centre Region. Honest assessment of what is being adopted vs what looks good in project reports.\n\nWorking well:\n- Agroforestry with Moringa/Gliricidia shade trees: 40% yield improvement\n- Improved cassava varieties from IRAD (TMS 419): drought tolerant, 2x yield\n- Zaï pits in drier northern areas for water retention\n\nStruggling with adoption:\n- Drip irrigation: upfront cost too high without subsidy\n- Composting: knowledge exists but labour intensity is a barrier\n- Digital soil testing apps: connectivity and trust gap\n\nWhat are others seeing?`,
        category: 'Agriculture',
        isPinned: false,
        viewCount: 176,
        likeCount: 28,
        createdAt: new Date('2026-01-08T10:00:00Z'),
      },
    });
    await prisma.forumReply.createMany({
      data: [
        { postId: post4.id, userId: fatou.id, content: 'Farmer field school model works well for composting adoption in Senegal. Peer demonstration beats extension worker visits 3-to-1 in our data.', createdAt: new Date('2026-01-08T14:00:00Z'), likeCount: 6 },
        { postId: post4.id, userId: prosper.id, content: 'Aligns with ICRAF data from the Congo Basin. Are you seeing differences in adoption between male and female-led farms?', createdAt: new Date('2026-01-09T08:45:00Z'), likeCount: 4 },
        { postId: post4.id, userId: jean.id, content: 'Yes — female-led farms show better agroforestry adoption. They prioritize household food security and long-term improvements over short-term cash crop optimization.', createdAt: new Date('2026-01-09T10:30:00Z'), likeCount: 11 },
      ],
    });

    const post5 = await prisma.forumPost.create({
      data: {
        userId: fatou.id,
        title: 'Building a support network as a woman entrepreneur — strategies that worked for me',
        content: `When I launched my food processing business three years ago I felt completely isolated. Here is what actually helped.\n\n1. Industry-specific women's groups: Joined GFAC (Groupement des Femmes d'Affaires du Cameroun). Monthly meetings, genuine peer support, and a lending circle.\n2. Mentorship through NextGen: Booked an advisory session here. Three sessions changed my thinking completely.\n3. Online communities: African Women in Tech (Slack), She Leads Africa — global networks with local chapters.\n4. Be the connector: I make it a practice to introduce two people per week. You give value, value comes back.\n\nWhat strategies have worked for others?`,
        category: 'Women in Business',
        isPinned: false,
        viewCount: 245,
        likeCount: 62,
        createdAt: new Date('2026-02-14T09:00:00Z'),
      },
    });
    await prisma.forumReply.createMany({
      data: [
        { postId: post5.id, userId: alice.id, content: "The 'husband's signature' experience is still common. Ecobank Cameroon launched a women's SME account that waives the spousal consent requirement — small win but it matters.", createdAt: new Date('2026-02-14T11:00:00Z'), likeCount: 14 },
        { postId: post5.id, userId: amara.id, content: 'Speaking at local events positioned me as an expert and opened more doors than any networking event. People remember presenters. Apply to speak at anything you are qualified for.', createdAt: new Date('2026-02-14T14:30:00Z'), likeCount: 18 },
        { postId: post5.id, userId: jean.id, content: 'Sharing this with my sister who is launching her second business. Did not know GFAC had a lending circle.', createdAt: new Date('2026-02-15T08:00:00Z'), likeCount: 3 },
      ],
    });

    const post6 = await prisma.forumPost.create({
      data: {
        userId: prosper.id,
        title: 'Simple impact measurement frameworks for social entrepreneurs without a research team',
        content: `One of the biggest gaps I see: founders know they are creating value but cannot prove it. Here is the SIMPLE framework I use in advisory work.\n\nS — Select 3–5 indicators maximum\nI — Identify your theory of change\nM — Measure baseline BEFORE intervention\nP — Pick a comparison group if possible\nL — Log data consistently (even a WhatsApp group for field agents works)\nE — Evaluate quarterly, not annually\n\nFree tools:\n- KoboToolbox for mobile data collection\n- Airtable free tier for aggregation\n- Google Looker Studio for visualization\n\nKey mistake: measuring outputs (# of trainings held) instead of outcomes (# of participants who applied a new skill).`,
        category: 'Impact Measurement',
        isPinned: false,
        viewCount: 134,
        likeCount: 39,
        createdAt: new Date('2026-02-28T11:00:00Z'),
      },
    });
    await prisma.forumReply.createMany({
      data: [
        { postId: post6.id, userId: jean.id, content: "Outputs vs outcomes — so often missed. Also: talk to beneficiaries in their own language about what changed. Qualitative data reveals things the numbers miss.", createdAt: new Date('2026-02-28T14:00:00Z'), likeCount: 8 },
        { postId: post6.id, userId: fatou.id, content: 'KoboToolbox works via SMS on feature phones — great for remote areas. Does SIMPLE scale for multi-country programs with different contexts?', createdAt: new Date('2026-03-01T09:00:00Z'), likeCount: 4 },
        { postId: post6.id, userId: prosper.id, content: "For multi-country: use a 'common minimum' set of 2–3 core indicators plus country-specific ones. The DCED Standard for Results Measurement has good guidance on this.", createdAt: new Date('2026-03-01T11:30:00Z'), likeCount: 6 },
      ],
    });

    console.log('Forum: created 6 posts with replies.');
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
