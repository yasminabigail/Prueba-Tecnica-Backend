import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

@Processor('leads-queue')
export class LeadsProcessor extends WorkerHost {
  private readonly logger = new Logger(LeadsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
    if (job.name === 'summarize-lead') {
      const { leadId, user } = job.data;
      
      // Mock AI Call - In reality, call OpenAI API here
      // const summary = await callOpenAI(user.name, user.email);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      const summary = `AI automated summary for ${user.name}`;
      const nextAction = 'Follow up within 24 hours';

      await this.prisma.lead.update({
        where: { id: leadId },
        data: { summary, next_action: nextAction },
      });
      
      this.logger.debug(`Job ${job.id} completed. Lead ${leadId} updated.`);
      return { summary, nextAction };
    }
  }
}
