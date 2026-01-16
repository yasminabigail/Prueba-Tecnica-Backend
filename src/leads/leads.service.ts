import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
    @InjectQueue('leads-queue') private leadsQueue: Queue,
  ) {}

  async create(createLeadDto: CreateLeadDto) {
    return this.prisma.lead.upsert({
      where: { email: createLeadDto.email },
      update: createLeadDto,
      create: createLeadDto,
    });
  }

  async findAll() {
    return this.prisma.lead.findMany();
  }

  async findOne(id: string) {
    const cachedLead = await this.cacheManager.get(id);
    if (cachedLead) {
      return cachedLead;
    }

    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    await this.cacheManager.set(id, lead, 600 * 1000); // 10 minutes in ms

    return lead;
  }

  async summarize(id: string) {
    const lead = await this.findOne(id); // Ensures lead exists
    await this.leadsQueue.add('summarize-lead', { leadId: id, user: lead });
    return { message: 'Procesando...' };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.debug('Running Cron Job to sync leads');
    try {
      const { data } = await firstValueFrom(this.httpService.get('https://randomuser.me/api/?results=10'));
      const users = data.results;

      for (const user of users) {
        const email = user.email;
        const name = `${user.name.first} ${user.name.last}`;
        
        await this.prisma.lead.upsert({
          where: { email },
          update: {}, 
          create: {
            name,
            email,
            source: 'api'
          }
        });
      }
      this.logger.debug('Cron Job finished successfully');
    } catch (error) {
      this.logger.error('Error in Cron Job', error);
    }
  }
}
