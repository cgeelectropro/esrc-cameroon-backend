import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List certificates for current user' })
  findByUser(@CurrentUser('id') userId: string) {
    return this.certificatesService.findByUser(userId);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get certificate PDF download URL or redirect' })
  async download(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Query('url') returnUrl: string,
    @Res() res: Response,
  ) {
    const certs = await this.certificatesService.findByUser(userId);
    const cert = certs.find((c) => c.id === id);
    if (!cert || cert.userId !== userId) {
      return res.status(404).json({ success: false, error: 'Certificate not found' });
    }
    const url = cert.pdfUrl ?? (await this.certificatesService.ensurePdf(id));
    if (!url) return res.status(404).json({ success: false, error: 'PDF not available' });
    if (returnUrl === '1' || returnUrl === 'true') {
      return res.json({ success: true, url });
    }
    return res.redirect(url);
  }

  @Public()
  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify certificate by code' })
  verify(@Param('code') code: string) {
    return this.certificatesService.verify(code);
  }
}
