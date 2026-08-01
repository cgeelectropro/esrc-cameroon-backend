import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as path from 'path';

export interface UploadResult {
  url: string;
  key: string;
  contentType: string;
  size: number;
}

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private bucket = 'media';
  private readonly logger = new Logger(StorageService.name);
  private maxFileSize = 100 * 1024 * 1024; // 100MB

  constructor(private config: ConfigService) {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.config.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      this.logger.warn('Supabase credentials not configured. File uploads will fail.');
      this.supabase = null as unknown as SupabaseClient;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.logger.log('Supabase Storage client initialized');
  }

  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<UploadResult> {
    if (buffer.length > this.maxFileSize) {
      throw new BadRequestException(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    const sanitizedKey = this.sanitizeKey(key);

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(sanitizedKey, buffer, {
        contentType,
        upsert: false,
        metadata,
      });

    if (error) {
      this.logger.error('Supabase upload error:', error.message);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }

    const url = this.getPublicUrl(sanitizedKey);
    this.logger.log(`File uploaded: ${sanitizedKey}`);

    return { url, key: sanitizedKey, contentType, size: buffer.length };
  }

  async delete(key: string): Promise<void> {
    const sanitizedKey = this.sanitizeKey(key);
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([sanitizedKey]);

    if (error) {
      this.logger.error('Supabase delete error:', error.message);
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }

    this.logger.log(`File deleted: ${sanitizedKey}`);
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const sanitizedKey = this.sanitizeKey(key);
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(sanitizedKey, expiresIn);

    if (error || !data?.signedUrl) {
      this.logger.error('Signed URL error:', error?.message);
      throw new BadRequestException('Failed to generate signed URL');
    }

    return data.signedUrl;
  }

  async listFiles(prefix: string, limit = 100): Promise<Array<{ key: string; url: string; size: number }>> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .list(prefix, { limit });

    if (error) {
      this.logger.error('List files error:', error.message);
      throw new BadRequestException('Failed to list files');
    }

    return (data || []).map((obj) => ({
      key: `${prefix}/${obj.name}`,
      url: this.getPublicUrl(`${prefix}/${obj.name}`),
      size: obj.metadata?.size || 0,
    }));
  }

  private getPublicUrl(key: string): string {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL') || '';
    return `${supabaseUrl}/storage/v1/object/public/${this.bucket}/${key}`;
  }

  private sanitizeKey(key: string): string {
    let sanitized = key.replace(/^\/+/, '').replace(/\\/g, '/').replace(/\/+/g, '/');
    // Only add timestamp if key doesn't already have one (from generateKey)
    if (!sanitized.match(/-\d{13}-[a-z0-9]{6}-/)) {
      const ext = path.extname(sanitized);
      const base = path.basename(sanitized, ext);
      const dir = path.dirname(sanitized);
      const timestamp = Date.now();
      sanitized = dir === '.' ? `${base}-${timestamp}${ext}` : `${dir}/${base}-${timestamp}${ext}`;
    }
    return sanitized;
  }

  generateKey(category: string, originalFilename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, ext).replace(/[^\w-]/g, '-');
    return `${category}/${timestamp}-${random}-${baseName}${ext}`;
  }
}
