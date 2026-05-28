import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OracleAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string | undefined;

    const oracleApiKey = this.configService.get<string>('ORACLE_API_KEY');

    if (!oracleApiKey) {
      throw new UnauthorizedException('Oracle API key not configured');
    }

    if (!apiKey || apiKey !== oracleApiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
