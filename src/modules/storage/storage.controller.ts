import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StorageService, UploadResult } from './storage.service';

// Use require for multer 2.x CommonJS compatibility with NestJS/TypeScript
const multer = require('multer');
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_PDF = ['application/pdf'];
const ALLOWED_DOCS = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_PDF, ...ALLOWED_DOCS];

const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024; // 100MB
const PDF_MAX_SIZE = 20 * 1024 * 1024; // 20MB
const DOC_MAX_SIZE = 15 * 1024 * 1024; // 15MB

function getMaxSize(mimetype: string): number {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) return IMAGE_MAX_SIZE;
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) return VIDEO_MAX_SIZE;
  if (ALLOWED_PDF.includes(mimetype)) return PDF_MAX_SIZE;
  if (ALLOWED_DOCS.includes(mimetype)) return DOC_MAX_SIZE;
  return 0;
}

function getCategory(mimetype: string): string {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) return 'images';
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) return 'videos';
  if (ALLOWED_PDF.includes(mimetype)) return 'documents';
  if (ALLOWED_DOCS.includes(mimetype)) return 'documents';
  return 'files';
}

@ApiTags('storage')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StorageController {
  private readonly logger = new Logger(StorageController.name);

  constructor(private storageService: StorageService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN', 'STUDENT')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: VIDEO_MAX_SIZE },
    }),
  )
  @ApiOperation({ summary: 'Upload file (images, videos, PDFs, documents)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    try {
      if (!file) throw new BadRequestException('No file provided');
      
      if (!ALLOWED.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type. Allowed: images (jpeg,png,gif,webp), videos (mp4,webm), PDF, Word docs`,
        );
      }

      const maxSize = getMaxSize(file.mimetype);
      if (file.size > maxSize) {
        throw new BadRequestException(`File too large. Max: ${Math.round(maxSize / 1024 / 1024)}MB`);
      }

      const category = getCategory(file.mimetype);
      const key = this.storageService.generateKey(category, file.originalname);
      const metadata = {
        userId,
        uploadedAt: new Date().toISOString(),
        originalName: file.originalname,
      };

      const result = await this.storageService.uploadBuffer(
        file.buffer,
        key,
        file.mimetype,
        metadata,
      );

      this.logger.log(`File uploaded by user ${userId}: ${result.key}`);

      return {
        success: true,
        data: {
          url: result.url,
          key: result.key,
          size: result.size,
          contentType: result.contentType,
        },
      };
    } catch (error) {
      this.logger.error('Upload error:', error);
      throw error;
    }
  }

  @Post(':category/:filename')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: VIDEO_MAX_SIZE },
    }),
  )
  @ApiOperation({ summary: 'Upload file to specific category' })
  @ApiConsumes('multipart/form-data')
  async uploadToCategory(
    @Param('category') category: string,
    @Param('filename') filename: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    try {
      if (!file) throw new BadRequestException('No file provided');
      
      const key = `${category}/${filename}`;
      const result = await this.storageService.uploadBuffer(
        file.buffer,
        key,
        file.mimetype,
        { userId, uploadedAt: new Date().toISOString() },
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Category upload error:', error);
      throw error;
    }
  }

  @Get('signed-url/:key')
  @ApiOperation({ summary: 'Get signed URL for file access' })
  async getSignedUrl(
    @Param('key') key: string,
    @Query('expires') expires: string = '3600',
    @CurrentUser('id') userId: string,
  ) {
    try {
      const expiresIn = Math.min(parseInt(expires, 10) || 3600, 3600 * 24); // Max 24 hours
      const signedUrl = await this.storageService.getSignedUrl(key, expiresIn);
      
      this.logger.log(`Signed URL generated for ${key} by user ${userId}`);

      return {
        success: true,
        data: { signedUrl, expiresIn },
      };
    } catch (error) {
      this.logger.error('Signed URL error:', error);
      throw error;
    }
  }

  @Delete(':key')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Delete file from storage' })
  async deleteFile(
    @Param('key') key: string,
    @CurrentUser('id') userId: string,
  ) {
    try {
      await this.storageService.delete(key);
      
      this.logger.log(`File deleted by user ${userId}: ${key}`);

      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      this.logger.error('Delete error:', error);
      throw error;
    }
  }

  @Get('list/:prefix')
  @ApiOperation({ summary: 'List files in directory' })
  async listFiles(
    @Param('prefix') prefix: string,
    @Query('limit') limit: string = '100',
    @CurrentUser('id') userId: string,
  ) {
    try {
      const maxLimit = Math.min(parseInt(limit, 10) || 100, 1000);
      const files = await this.storageService.listFiles(prefix, maxLimit);
      
      return {
        success: true,
        data: files,
      };
    } catch (error) {
      this.logger.error('List files error:', error);
      throw error;
    }
  }
}
