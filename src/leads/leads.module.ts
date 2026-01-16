import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { LeadsProcessor } from './leads.processor';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'leads-queue',
    }),
    PrismaModule,
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      ttl: 600,
    }),
  ],
  controllers: [LeadsController],
  providers: [LeadsService, LeadsProcessor],
  exports: [LeadsService]
})
export class LeadsModule {}
