import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor(private config: ConfigService) {
    this.from = this.config.get<string>('email.from') || 'NextGen Platform <noreply@nextgen-en.com>';

    // Resend (HTTP API) is preferred — raw SMTP sockets are blocked/unreliable
    // on Render's free tier, which silently dropped every email for a week
    // (Connection timeout / ENETUNREACH on smtp.gmail.com:465). Falls back
    // to SMTP only if no Resend key is configured (e.g. local dev).
    const resendApiKey = this.config.get<string>('email.resendApiKey');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.logger.log('Email service configured: Resend');
      return;
    }

    const host = this.config.get<string>('email.host');
    const port = this.config.get<number>('email.port') || 587;
    const user = this.config.get<string>('email.user');
    const pass = this.config.get<string>('email.pass');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Email service configured: SMTP ${host}:${port}`);
    } else {
      this.logger.warn('Email not configured — set RESEND_API_KEY (or SMTP_HOST/USER/PASS) to enable emails');
    }
  }

  async send(payload: EmailPayload): Promise<void> {
    if (this.resend) {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      if (error) {
        this.logger.error(`Failed to send email to ${payload.to}: ${error.message}`);
        return;
      }
      this.logger.log(`Email sent to ${payload.to}: ${payload.subject}`);
      return;
    }

    if (!this.transporter) return;
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      this.logger.log(`Email sent to ${payload.to}: ${payload.subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${payload.to}: ${(err as Error).message}`);
    }
  }

  // ─── Template builders ────────────────────────────────────────────────────

  private wrap(title: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#1B5E20;padding:28px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">NextGen Platform</h1>
            <p style="margin:4px 0 0;color:#A5D6A7;font-size:13px;">Empowering Entrepreneurs in Cameroon</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f4f6f9;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              &copy; ${new Date().getFullYear()} ESRC Cameroon · NextGen Platform<br/>
              <a href="https://nextgen-en.com" style="color:#1B5E20;">nextgen-en.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private btn(text: string, url: string): string {
    return `<p style="text-align:center;margin:28px 0 0;">
      <a href="${url}" style="display:inline-block;background:#F9A825;color:#1a1a1a;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">${text}</a>
    </p>`;
  }

  private h2(text: string): string {
    return `<h2 style="margin:0 0 16px;color:#1B5E20;font-size:20px;font-weight:700;">${text}</h2>`;
  }

  private p(text: string): string {
    return `<p style="margin:0 0 14px;color:#374151;font-size:15px;line-height:1.6;">${text}</p>`;
  }

  private infoBox(label: string, value: string): string {
    return `<tr>
      <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;">${label}</td>
      <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${value}</td>
    </tr>`;
  }

  // ─── Emails ───────────────────────────────────────────────────────────────

  sendWelcome(to: string, firstName: string): Promise<void> {
    const body =
      this.h2(`Welcome to NextGen, ${firstName}!`) +
      this.p('We\'re thrilled to have you join our community of entrepreneurs, researchers, and innovators in Cameroon.') +
      this.p('Here\'s what you can do on the platform:') +
      `<ul style="color:#374151;font-size:15px;line-height:2;margin:0 0 20px;padding-left:20px;">
        <li>Enroll in entrepreneurship and business courses</li>
        <li>Access research publications and policy briefs</li>
        <li>Register for events, workshops, and webinars</li>
        <li>Book advisory sessions with mentors</li>
        <li>Explore job, fellowship, and grant opportunities</li>
      </ul>` +
      this.btn('Go to Dashboard', 'https://nextgen-en.com/dashboard');
    return this.send({ to, subject: 'Welcome to NextGen Platform!', html: this.wrap('Welcome', body) });
  }

  sendForgotPassword(to: string, firstName: string, resetUrl: string): Promise<void> {
    const body =
      this.h2('Reset your password') +
      this.p(`Hi ${firstName}, we received a request to reset your password.`) +
      this.p('Click the button below to choose a new password. This link expires in 1 hour.') +
      this.btn('Reset Password', resetUrl) +
      this.p('If you did not request a password reset, you can safely ignore this email.');
    return this.send({ to, subject: 'Reset your NextGen password', html: this.wrap('Password Reset', body) });
  }

  sendEnrollmentConfirmation(to: string, firstName: string, courseTitle: string, courseId: string): Promise<void> {
    const body =
      this.h2('Enrollment Confirmed!') +
      this.p(`Hi ${firstName}, you are now enrolled in <strong>${courseTitle}</strong>.`) +
      this.p('Start learning at your own pace and track your progress on your dashboard.') +
      this.btn('Start Learning', `https://nextgen-en.com/courses/${courseId}`);
    return this.send({ to, subject: `You're enrolled in ${courseTitle}`, html: this.wrap('Enrollment', body) });
  }

  sendCertificateIssued(to: string, firstName: string, courseTitle: string, verificationCode: string): Promise<void> {
    const body =
      this.h2('Your Certificate is Ready!') +
      this.p(`Congratulations ${firstName}! You have successfully completed <strong>${courseTitle}</strong>.`) +
      this.p(`Your certificate verification code is: <strong style="font-size:18px;color:#1B5E20;">${verificationCode}</strong>`) +
      this.p('Download your certificate or share it on LinkedIn to showcase your achievement.') +
      this.btn('View Certificate', 'https://nextgen-en.com/dashboard/certificates');
    return this.send({ to, subject: `Certificate issued: ${courseTitle}`, html: this.wrap('Certificate', body) });
  }

  sendInstructorApproved(to: string, firstName: string, adminNotes?: string): Promise<void> {
    const body =
      this.h2('Instructor Application Approved!') +
      this.p(`Congratulations ${firstName}! Your application to become an instructor on NextGen has been approved.`) +
      this.p('You can now log into your instructor dashboard and start creating courses to share your expertise.') +
      (adminNotes ? this.p(`<em>Note from admin: ${adminNotes}</em>`) : '') +
      this.btn('Go to Instructor Dashboard', 'https://nextgen-en.com/instructor/courses');
    return this.send({ to, subject: 'Your instructor application has been approved!', html: this.wrap('Application Approved', body) });
  }

  sendInstructorRejected(to: string, firstName: string, reason?: string): Promise<void> {
    const body =
      this.h2('Instructor Application Update') +
      this.p(`Hi ${firstName}, thank you for applying to become an instructor on NextGen.`) +
      this.p('After reviewing your application, we are unable to approve it at this time.') +
      (reason ? this.p(`<strong>Reason:</strong> ${reason}`) : '') +
      this.p('You are welcome to reapply after addressing the feedback. If you have questions, please contact our support team.') +
      this.btn('Learn More', 'https://nextgen-en.com/dashboard');
    return this.send({ to, subject: 'Update on your instructor application', html: this.wrap('Application Update', body) });
  }

  sendNewInstructorRequestToAdmin(to: string, applicantName: string, applicantEmail: string, requestId: string): Promise<void> {
    const body =
      this.h2('New Instructor Application') +
      this.p('A new instructor application has been submitted and requires your review.') +
      `<table cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
        ${this.infoBox('Applicant', applicantName)}
        ${this.infoBox('Email', applicantEmail)}
      </table>` +
      this.btn('Review Application', `https://nextgen-en.com/admin/instructors/${requestId}`);
    return this.send({ to, subject: `New instructor application from ${applicantName}`, html: this.wrap('Instructor Application', body) });
  }

  sendEventRegistration(to: string, firstName: string, eventTitle: string, eventDate: string, location: string, isOnline: boolean): Promise<void> {
    const body =
      this.h2('Event Registration Confirmed!') +
      this.p(`Hi ${firstName}, you are registered for <strong>${eventTitle}</strong>.`) +
      `<table cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
        ${this.infoBox('Date', eventDate)}
        ${this.infoBox('Location', isOnline ? 'Online' : location)}
        ${isOnline ? this.infoBox('Format', 'Virtual — link will be shared before the event') : ''}
      </table>` +
      this.p('Add this event to your calendar and check your dashboard for updates.') +
      this.btn('View Event', 'https://nextgen-en.com/events');
    return this.send({ to, subject: `Registered: ${eventTitle}`, html: this.wrap('Event Registration', body) });
  }

  sendAdvisorySessionBooked(toUser: string, userFirstName: string, advisorName: string, sessionType: string, scheduledAt: string): Promise<void> {
    const body =
      this.h2('Advisory Session Booked!') +
      this.p(`Hi ${userFirstName}, your advisory session has been successfully booked.`) +
      `<table cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
        ${this.infoBox('Advisor', advisorName)}
        ${this.infoBox('Session Type', sessionType.replace(/_/g, ' '))}
        ${this.infoBox('Scheduled', scheduledAt)}
      </table>` +
      this.p('You will receive a meeting link closer to the session date. Prepare any questions or materials you\'d like to discuss.') +
      this.btn('View My Sessions', 'https://nextgen-en.com/dashboard/advisory');
    return this.send({ to: toUser, subject: `Advisory session booked with ${advisorName}`, html: this.wrap('Session Booked', body) });
  }

  sendAdvisorySessionToAdvisor(toAdvisor: string, advisorFirstName: string, userName: string, sessionType: string, scheduledAt: string): Promise<void> {
    const body =
      this.h2('New Advisory Session Request') +
      this.p(`Hi ${advisorFirstName}, a new advisory session has been booked with you.`) +
      `<table cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
        ${this.infoBox('User', userName)}
        ${this.infoBox('Session Type', sessionType.replace(/_/g, ' '))}
        ${this.infoBox('Scheduled', scheduledAt)}
      </table>` +
      this.btn('View Sessions', 'https://nextgen-en.com/dashboard/advisory');
    return this.send({ to: toAdvisor, subject: `New advisory session from ${userName}`, html: this.wrap('New Session', body) });
  }

  sendPaymentConfirmation(to: string, firstName: string, courseTitle: string, amount: number, currency: string, referenceCode: string): Promise<void> {
    const body =
      this.h2('Payment Confirmed!') +
      this.p(`Hi ${firstName}, your payment for <strong>${courseTitle}</strong> has been confirmed.`) +
      `<table cellpadding="0" cellspacing="0" style="margin:16px 0;width:100%;">
        ${this.infoBox('Course', courseTitle)}
        ${this.infoBox('Amount', `${amount} ${currency}`)}
        ${this.infoBox('Reference', referenceCode)}
      </table>` +
      this.p('You are now enrolled and can start learning immediately.') +
      this.btn('Start Learning', 'https://nextgen-en.com/courses');
    return this.send({ to, subject: `Payment confirmed for ${courseTitle}`, html: this.wrap('Payment Confirmed', body) });
  }

  sendForumReplyNotification(to: string, firstName: string, postTitle: string, replierName: string, postId: string): Promise<void> {
    const body =
      this.h2('Someone replied to your post') +
      this.p(`Hi ${firstName}, <strong>${replierName}</strong> replied to your forum post: <em>${postTitle}</em>.`) +
      this.btn('View Reply', `https://nextgen-en.com/community?post=${postId}`);
    return this.send({ to, subject: `New reply on "${postTitle}"`, html: this.wrap('Forum Reply', body) });
  }

  sendNewCourseReviewToInstructor(to: string, instructorFirstName: string, courseTitle: string, rating: number, reviewerName: string): Promise<void> {
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const body =
      this.h2('New Course Review') +
      this.p(`Hi ${instructorFirstName}, <strong>${reviewerName}</strong> left a ${rating}-star review on <strong>${courseTitle}</strong>.`) +
      this.p(`<span style="color:#F9A825;font-size:20px;">${stars}</span>`) +
      this.btn('View Course', 'https://nextgen-en.com/instructor/courses');
    return this.send({ to, subject: `New ${rating}-star review on ${courseTitle}`, html: this.wrap('Course Review', body) });
  }

  sendPasswordResetSuccess(to: string, firstName: string): Promise<void> {
    const body =
      this.h2('Password changed successfully') +
      this.p(`Hi ${firstName}, your NextGen password was recently changed.`) +
      this.p('If you did not make this change, please contact our support team immediately.') +
      this.btn('Go to Dashboard', 'https://nextgen-en.com/dashboard');
    return this.send({ to, subject: 'Your password has been changed', html: this.wrap('Password Changed', body) });
  }

  async sendTestEmail(to: string): Promise<{ success: boolean; message: string; configured: boolean }> {
    const configured = !!this.resend || !!this.transporter;
    if (!configured) {
      return { success: false, message: 'Email not configured — set RESEND_API_KEY (or SMTP_HOST, SMTP_USER, SMTP_PASS) env vars', configured: false };
    }
    const body =
      this.h2('Email Test Successful!') +
      this.p('This is a test email from your NextGen Platform backend.') +
      this.p(`Sent at: <strong>${new Date().toISOString()}</strong>`) +
      this.p('Your SMTP configuration is working correctly. All platform emails (welcome, enrollment, certificates, etc.) will be delivered.') +
      this.btn('Go to Platform', 'https://nextgen-en.com');
    try {
      await this.send({ to, subject: 'NextGen Platform — Email Test', html: this.wrap('Email Test', body) });
      return { success: true, message: `Test email sent to ${to}`, configured: true };
    } catch (err) {
      return { success: false, message: (err as Error).message, configured: true };
    }
  }

  isConfigured(): boolean {
    return !!this.resend || !!this.transporter;
  }
}
