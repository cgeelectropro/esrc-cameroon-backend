import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: string;
  content: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AI_TIMEOUT_MS = 25_000;

const SYSTEM_PROMPT = (lang: string) =>
  `You are the NextGen Assistant for ESRC Cameroon — a bilingual learning and ` +
  `entrepreneurship hub for African professionals and entrepreneurs. ` +
  `Help users find courses, explore opportunities, validate business ideas, ` +
  `connect with mentors, and navigate the platform. ` +
  `Respond in ${lang}. Be warm, practical, and Africa-focused. ` +
  `Keep replies concise (2–4 sentences) unless the user asks for detail.`;

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;
  private hfToken: string | null = null;

  // HuggingFace Router (new endpoint — api-inference.huggingface.co is deprecated)
  private readonly hfChatApiBase = 'https://router.huggingface.co/v1';
  // Llama-3.1-8B — free, no provider lock-in (let HF router pick fastest)
  private readonly hfChatModel = 'meta-llama/Llama-3.1-8B-Instruct';

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    // 1. Anthropic — primary
    const anthropicKey = this.config.get<string>('anthropic.apiKey');
    if (anthropicKey && anthropicKey.startsWith('sk-ant-') && !anthropicKey.includes('get_from')) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
      this.logger.log('Anthropic API configured (primary)');
    }

    // 2. OpenAI — secondary (only if real key)
    const openaiKey = this.config.get<string>('openai.apiKey');
    if (openaiKey && openaiKey.startsWith('sk-') && !openaiKey.includes('get_from')) {
      this.openai = new OpenAI({ apiKey: openaiKey });
      this.logger.log('OpenAI API configured (secondary)');
    }

    // 3. HuggingFace — tertiary
    this.hfToken = this.config.get<string>('huggingface.apiKey') || null;
    if (this.hfToken) {
      this.logger.log('Hugging Face API configured (tertiary)');
    }

    if (!this.anthropic && !this.openai && !this.hfToken) {
      this.logger.warn(
        'No AI API configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or HUGGINGFACE_API_KEY.',
      );
    }
  }

  // ─── Public Methods ─────────────────────────────────────────────────────────

  async chat(userId: string, messages: ChatMessage[]) {
    try {
      const lang = await this.resolveLanguage(userId);

      if (this.anthropic) return await this.chatWithAnthropic(messages, lang);
      if (this.openai) return await this.chatWithOpenAI(messages, lang);
      if (this.hfToken) return await this.chatWithHuggingFace(messages, lang);

      return { message: this.getFallbackChatResponse(messages, lang), source: 'fallback' };
    } catch (error) {
      this.logger.error('chat() top-level error:', error);
      return { message: 'Sorry, I encountered an error. Please try again.', source: 'error' };
    }
  }

  async getRecommendations(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { interests: true, enrollments: { include: { course: true } } },
    });
    const enrolledIds = user?.enrollments.map((e) => e.courseId) || [];
    const interestCategories = user?.interests.map((i) => i.category) || [];
    return this.prisma.course.findMany({
      where: {
        status: 'PUBLISHED' as any,
        id: { notIn: enrolledIds },
        ...(interestCategories.length ? { category: { in: interestCategories } } : {}),
      },
      orderBy: [{ avgRating: 'desc' }, { studentCount: 'desc' }],
      take: 8,
    });
  }

  async validateBusinessIdea(userId: string, idea: string) {
    try {
      if (this.anthropic) return await this.validateWithAnthropic(idea);
      if (this.openai) return await this.validateWithOpenAI(idea);
      if (this.hfToken) return await this.validateWithHuggingFace(idea);
      return this.getFallbackValidation(idea);
    } catch (error) {
      this.logger.error('validateBusinessIdea() error:', error);
      return this.getFallbackValidation(idea);
    }
  }

  async generateQuiz(lessonContent: string, numQuestions = 5) {
    try {
      if (this.anthropic) return await this.generateQuizWithAnthropic(lessonContent, numQuestions);
      if (this.openai) return await this.generateQuizWithOpenAI(lessonContent, numQuestions);
      if (this.hfToken) return await this.generateQuizWithHuggingFace(lessonContent, numQuestions);
      return { questions: this.generateFallbackQuestions(numQuestions) };
    } catch (error) {
      this.logger.error('generateQuiz() error:', error);
      return { questions: this.generateFallbackQuestions(numQuestions) };
    }
  }

  // ─── Anthropic Implementations ──────────────────────────────────────────────

  private async chatWithAnthropic(messages: ChatMessage[], lang: string) {
    const anthropicMessages = messages.map((m) => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await this.withTimeout(
      this.anthropic!.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: SYSTEM_PROMPT(lang),
        messages: anthropicMessages,
      }),
      AI_TIMEOUT_MS,
    );

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    return { message: text, source: 'anthropic' };
  }

  private async validateWithAnthropic(idea: string) {
    const prompt =
      `Analyze this business idea for an African entrepreneur and return ONLY valid JSON ` +
      `(no markdown, no prose) matching exactly: ` +
      `{"marketFit":number,"feasibility":number,"strengths":["..."],"risks":["..."],` +
      `"suggestions":["..."],"nextSteps":["..."],"verdict":"..."}\n\nIdea: ${idea}`;

    const response = await this.withTimeout(
      this.anthropic!.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: 'You are a JSON-only business analysis API. Return valid JSON only, no prose, no markdown.',
        messages: [{ role: 'user', content: prompt }],
      }),
      AI_TIMEOUT_MS,
    );

    const raw = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    return this.safeParseJson(raw, this.getFallbackValidation(idea));
  }

  private async generateQuizWithAnthropic(lessonContent: string, numQuestions: number) {
    const prompt =
      `Generate exactly ${numQuestions} multiple choice questions based on this lesson content. ` +
      `Return ONLY valid JSON (no markdown, no prose) matching: ` +
      `{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}\n\n` +
      `Lesson:\n${lessonContent.substring(0, 2000)}`;

    const response = await this.withTimeout(
      this.anthropic!.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: 'You are a JSON-only quiz generation API. Return valid JSON only, no prose, no markdown.',
        messages: [{ role: 'user', content: prompt }],
      }),
      AI_TIMEOUT_MS,
    );

    const raw = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    return this.safeParseJson(raw, { questions: this.generateFallbackQuestions(numQuestions) });
  }

  // ─── OpenAI Implementations ─────────────────────────────────────────────────

  private async chatWithOpenAI(messages: ChatMessage[], lang: string) {
    const response = await this.withTimeout(
      this.openai!.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT(lang) },
          ...messages.map((m) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
          })),
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
      AI_TIMEOUT_MS,
    );
    return { message: response.choices[0]?.message?.content || '', source: 'openai' };
  }

  private async validateWithOpenAI(idea: string) {
    const response = await this.withTimeout(
      this.openai!.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a business mentor for African entrepreneurs. ' +
              'Return JSON: { marketFit, feasibility, strengths, risks, suggestions, nextSteps, verdict }.',
          },
          { role: 'user', content: `Analyze: ${idea}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      }),
      AI_TIMEOUT_MS,
    );
    return this.safeParseJson(
      response.choices[0]?.message?.content || '{}',
      this.getFallbackValidation(idea),
    );
  }

  private async generateQuizWithOpenAI(lessonContent: string, numQuestions: number) {
    const response = await this.withTimeout(
      this.openai!.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Generate quiz questions. Return JSON: { questions: [{ question, options: string[], correctIndex: number, explanation: string }] }',
          },
          {
            role: 'user',
            content: `Content: ${lessonContent}\nGenerate ${numQuestions} questions.`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
      AI_TIMEOUT_MS,
    );
    return this.safeParseJson(response.choices[0]?.message?.content || '{}', {
      questions: this.generateFallbackQuestions(numQuestions),
    });
  }

  // ─── HuggingFace Implementations (fixed) ────────────────────────────────────

  private async chatWithHuggingFace(
    messages: ChatMessage[],
    lang: string,
  ): Promise<{ message: string; source: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      const hfMessages = [
        { role: 'system', content: SYSTEM_PROMPT(lang) },
        ...messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      ];

      let response: Response;
      try {
        response = await fetch(`${this.hfChatApiBase}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.hfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.hfChatModel,
            messages: hfMessages,
            max_tokens: 500,
            temperature: 0.7,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        throw new Error(`HF API ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content ?? '';

      return {
        message: text || this.getFallbackChatResponse(messages, lang),
        source: 'huggingface',
      };
    } catch (error: unknown) {
      const isAbort =
        error instanceof Error &&
        (error.name === 'AbortError' || error.message.includes('abort'));
      this.logger.warn(
        isAbort ? 'HF request timed out, using fallback' : `HF chat error: ${String(error)}`,
      );
      return {
        message: this.getFallbackChatResponse(messages, lang),
        source: 'fallback',
      };
    }
  }

  private async validateWithHuggingFace(idea: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(`${this.hfChatApiBase}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.hfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.hfChatModel,
            messages: [
              {
                role: 'system',
                content:
                  'You are a business mentor for African entrepreneurs. ' +
                  'Analyze the business idea and return ONLY valid JSON (no markdown): ' +
                  '{"marketFit":number,"feasibility":number,"strengths":["..."],"risks":["..."],' +
                  '"suggestions":["..."],"nextSteps":["..."],"verdict":"..."}',
              },
              { role: 'user', content: `Analyze this idea: ${idea}` },
            ],
            max_tokens: 700,
            temperature: 0.5,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) throw new Error(`HF ${response.status}`);

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = data.choices?.[0]?.message?.content ?? '';
      return this.safeParseJson(raw, this.getFallbackValidation(idea));
    } catch (error) {
      this.logger.warn(`HF validation error: ${String(error)}`);
      return this.getFallbackValidation(idea);
    }
  }

  private async generateQuizWithHuggingFace(lessonContent: string, numQuestions: number) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(`${this.hfChatApiBase}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.hfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.hfChatModel,
            messages: [
              {
                role: 'system',
                content:
                  'You are a quiz generator. Return ONLY valid JSON (no markdown): ' +
                  '{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}',
              },
              {
                role: 'user',
                content: `Generate ${numQuestions} multiple choice questions from:\n${lessonContent.substring(0, 1500)}`,
              },
            ],
            max_tokens: 1000,
            temperature: 0.4,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) throw new Error(`HF ${response.status}`);

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = data.choices?.[0]?.message?.content ?? '';
      return this.safeParseJson(raw, { questions: this.generateFallbackQuestions(numQuestions) });
    } catch (error) {
      this.logger.warn(`HF quiz generation error: ${String(error)}`);
      return { questions: this.generateFallbackQuestions(numQuestions) };
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`AI call timed out after ${ms}ms`)), ms),
      ),
    ]);
  }

  private async resolveLanguage(userId: string): Promise<string> {
    if (!userId || userId === 'anonymous') return 'English';
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { preferredLanguage: true },
      });
      return user?.preferredLanguage === 'FR' ? 'French' : 'English';
    } catch {
      return 'English';
    }
  }

  private safeParseJson<T>(raw: string, fallback: T): T {
    try {
      const cleaned = raw
        .replace(/^```(?:json)?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();
      return JSON.parse(cleaned) as T;
    } catch {
      this.logger.warn('JSON parse failed, using fallback');
      return fallback;
    }
  }

  // ─── Fallback Responses ──────────────────────────────────────────────────────

  private getFallbackChatResponse(messages: ChatMessage[], lang: string): string {
    const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';

    if (lang === 'French') {
      if (/bonjour|salut|hello|hi/.test(lastMsg))
        return "Bonjour ! 👋 Je suis l'Assistant NextGen. Comment puis-je vous aider aujourd'hui ?";
      if (/cours|apprendre|formation/.test(lastMsg))
        return 'Nous proposons plus de 200 cours en entrepreneuriat, technologie, agriculture et plus ! Quel sujet vous intéresse ?';
      if (/idée|business|entreprise|projet|startup/.test(lastMsg))
        return "Excellent ! NextGen propose des outils de validation d'idées et des mentors expérimentés. Décrivez votre idée.";
      if (/mentor|conseil|aide|expert/.test(lastMsg))
        return 'Nos mentors experts sont disponibles pour des sessions individuelles. Rendez-vous dans la section "Conseil".';
      if (/événement|conférence|atelier|webinaire/.test(lastMsg))
        return 'Consultez la section "Événements" pour voir nos prochaines dates à travers l\'Afrique.';
      if (/inscri|compte|register|connexion/.test(lastMsg))
        return "Pour vous inscrire, cliquez sur \"Commencer\" en haut à droite. C'est gratuit !";
      if (/certificat|diplôme/.test(lastMsg))
        return 'Oui ! Vous recevez un certificat reconnu pour chaque cours complété, partageable sur LinkedIn.';
      if (/opportunité|emploi|bourse|fellowship/.test(lastMsg))
        return 'La section "Opportunités" liste des offres d\'emploi, stages et bourses pour les professionnels africains.';
      if (/prix|gratuit|payer|tarif/.test(lastMsg))
        return 'Cours gratuits et premium disponibles. Paiement via MTN MoMo, Orange Money ou carte bancaire.';
      if (/recherche|publication|étude/.test(lastMsg))
        return "Notre bibliothèque de recherche contient des notes de politique et articles sur le développement africain. Accès gratuit.";
      if (/communauté|forum|réseau/.test(lastMsg))
        return 'Rejoignez notre communauté de professionnels africains ! Participez aux forums et agrandissez votre réseau.';
      return "Je suis l'Assistant NextGen. Je peux vous aider avec les cours, opportunités, événements et plus. Que souhaitez-vous savoir ?";
    } else {
      if (/hello|hi|hey|bonjour|salut/.test(lastMsg))
        return "Hello! 👋 I'm the NextGen Assistant. What can I help you with today?";
      if (/course|learn|training|study/.test(lastMsg))
        return 'We offer 200+ courses in entrepreneurship, technology, agriculture and more! What topic interests you?';
      if (/idea|business|startup|project/.test(lastMsg))
        return "Great! NextGen offers business idea validation tools and experienced mentors. Tell me about your idea.";
      if (/mentor|advisory|advice|help|expert/.test(lastMsg))
        return 'Our expert mentors offer 1-on-1 and group sessions. Visit the "Advisory" section to book.';
      if (/event|conference|workshop|webinar/.test(lastMsg))
        return 'Check the "Events" section for upcoming conferences and workshops across Africa.';
      if (/register|sign up|account|join/.test(lastMsg))
        return 'Click "Get Started" in the top right to register for free!';
      if (/certificate|diploma|credential/.test(lastMsg))
        return 'Yes! You earn a recognized certificate for every completed course, shareable on LinkedIn.';
      if (/opportunit|job|fellowship|grant/.test(lastMsg))
        return 'The "Opportunities" section lists jobs, internships, fellowships and grants for African professionals.';
      if (/price|free|cost|pay/.test(lastMsg))
        return 'Free and premium courses available. Pay via MTN MoMo, Orange Money, or credit card.';
      if (/research|publication|paper|study/.test(lastMsg))
        return 'Our research library has policy briefs and academic articles on African development. Free and open access.';
      if (/community|forum|network/.test(lastMsg))
        return "Join our community of African professionals! Participate in forums and grow your professional network.";
      return "I'm the NextGen Assistant. I can help with courses, opportunities, events and more. What would you like to know?";
    }
  }

  private getFallbackValidation(idea: string) {
    const hasMarket = idea.toLowerCase().includes('market') || idea.length > 50;
    const hasSolution =
      idea.toLowerCase().includes('solut') || idea.toLowerCase().includes('problem');
    return {
      marketFit: hasMarket ? 7 : 6,
      feasibility: hasSolution ? 7 : 6,
      strengths: ['Clear problem statement', 'Addresses African market needs'],
      risks: ['Market competition', 'Regulatory environment', 'Access to capital'],
      suggestions: [
        'Validate with potential customers',
        'Build an MVP',
        'Create a detailed business plan',
      ],
      nextSteps: ['Market research', 'Prototype development', 'Pitch to investors'],
      verdict: 'Promising idea! Proceed with market validation.',
    };
  }

  private generateFallbackQuestions(
    numQuestions: number,
  ): Array<{ question: string; options: string[]; correctIndex: number; explanation: string }> {
    const base = [
      {
        question: 'What is the main topic of this lesson?',
        options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
        correctIndex: 0,
        explanation: 'Review the introduction section.',
      },
      {
        question: 'Which statement is correct based on the lesson?',
        options: ['Statement 1', 'Statement 2', 'Statement 3', 'Statement 4'],
        correctIndex: 1,
        explanation: 'Check the key concepts section.',
      },
      {
        question: 'What can you apply from this lesson?',
        options: ['Application 1', 'Application 2', 'Application 3', 'Application 4'],
        correctIndex: 0,
        explanation: 'Review the practical examples.',
      },
      {
        question: 'Which is a key takeaway?',
        options: ['Takeaway 1', 'Takeaway 2', 'Takeaway 3', 'Takeaway 4'],
        correctIndex: 2,
        explanation: 'Review the summary section.',
      },
      {
        question: 'How would you explain this concept?',
        options: ['Explanation 1', 'Explanation 2', 'Explanation 3', 'Explanation 4'],
        correctIndex: 1,
        explanation: 'Think about real-world applications.',
      },
    ];
    return base.slice(0, numQuestions);
  }

}
