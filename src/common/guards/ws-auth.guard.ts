import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);
    if (!token) {
      throw new WsException('Unauthorized');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('jwt.secret'),
      });
      client.data.user = payload;
      client.data.userId = payload.sub;
      return true;
    } catch {
      throw new WsException('Invalid token');
    }
  }

  async validateToken(client: Socket) {
    const token = this.extractToken(client);
    if (!token) throw new WsException('Unauthorized');
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.config.get<string>('jwt.secret'),
    });
    return { id: payload.sub, ...payload };
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
      return auth.slice(7);
    }
    return auth || null;
  }
}
