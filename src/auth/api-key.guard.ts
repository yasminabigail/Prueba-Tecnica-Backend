import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
        return true; // Or throw error if security is strict about config
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid or missing API Key');
    }
    
    return true;
  }
}
