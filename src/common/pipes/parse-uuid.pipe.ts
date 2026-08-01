import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException(`Invalid ${metadata.data || 'id'}`);
    }
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const cuidRegex = /^c[0-9a-z]{24}$/i;
    if (uuidRegex.test(value) || cuidRegex.test(value)) {
      return value;
    }
    throw new BadRequestException(`Invalid ${metadata.data || 'id'} format`);
  }
}
