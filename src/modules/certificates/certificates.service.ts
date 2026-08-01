import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { StorageService } from '@/modules/storage/storage.service';
import puppeteer from 'puppeteer';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async generateCertificate(userId: string, courseId: string): Promise<string> {
    const existing = await this.prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      if (existing.pdfUrl) return existing.pdfUrl;
      const url = await this.ensurePdf(existing.id);
      return url ?? existing.pdfUrl ?? '';
    }
    const [user, course] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.course.findUniqueOrThrow({ where: { id: courseId } }),
    ]);
    const certificate = await this.prisma.certificate.create({
      data: { userId, courseId, courseName: course.title },
    });
    const html = this.buildCertificateHtml({
      studentName: `${user.firstName} ${user.lastName}`,
      courseName: course.title,
      issuedDate: new Date().toLocaleDateString('en-GB'),
      verificationCode: certificate.verificationCode,
    });
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true });
    await browser.close();
    const key = `certificates/${userId}/${certificate.id}.pdf`;
    const result = await this.storageService.uploadBuffer(Buffer.from(pdf), key, 'application/pdf');
    await this.prisma.certificate.update({
      where: { id: certificate.id },
      data: { pdfUrl: result.url },
    });
    return result.url;
  }

  async ensurePdf(certificateId: string): Promise<string | null> {
    const cert = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (!cert) return null;
    if (cert.pdfUrl) return cert.pdfUrl;
    const html = this.buildCertificateHtml({
      studentName: `${cert.user.firstName} ${cert.user.lastName}`,
      courseName: cert.courseName,
      issuedDate: cert.issuedAt.toLocaleDateString('en-GB'),
      verificationCode: cert.verificationCode,
    });
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    const pdf = await page.pdf({ format: 'A4', landscape: true, printBackground: true });
    await browser.close();
    const key = `certificates/${cert.userId}/${cert.id}.pdf`;
    const result = await this.storageService.uploadBuffer(Buffer.from(pdf), key, 'application/pdf');
    await this.prisma.certificate.update({
      where: { id: certificateId },
      data: { pdfUrl: result.url },
    });
    return result.url;
  }

  async findByUser(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async verify(code: string) {
    const cert = await this.prisma.certificate.findFirst({ where: { verificationCode: code } });
    if (!cert) return null;
    return cert;
  }

  private encodeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildCertificateHtml(data: { studentName: string; courseName: string; issuedDate: string; verificationCode: string }) {
    const studentName = this.encodeHtml(data.studentName);
    const courseName = this.encodeHtml(data.courseName);
    const verificationCode = this.encodeHtml(data.verificationCode);
    const issuedDate = this.encodeHtml(data.issuedDate);
    return `<!DOCTYPE html>
<html><head><style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans');
body { margin: 0; background: #1B5E20; display: flex; align-items: center; justify-content: center; height: 100vh; }
.cert { background: white; width: 900px; height: 620px; padding: 60px; border: 8px solid #F9A825; border-radius: 12px; text-align: center; }
h1 { font-family: 'Playfair Display'; font-size: 42px; color: #1B5E20; }
.name { font-size: 36px; color: #2E7D32; font-family: 'Playfair Display'; margin: 20px 0; }
.code { font-size: 12px; color: #999; margin-top: 30px; }
</style></head><body>
<div class='cert'>
<p style='color: #F9A825; font-weight: bold; letter-spacing: 3px;'>ESRC CAMEROON</p>
<h1>Certificate of Completion</h1>
<p>This certifies that</p>
<div class='name'>${studentName}</div>
<p>has successfully completed</p>
<p style='font-size: 22px; font-weight: bold; color: #1B5E20;'>${courseName}</p>
<p>Issued: ${issuedDate} | ESRC Cameroon</p>
<p class='code'>Verification: ${verificationCode}</p>
</div></body></html>`;
  }
}
