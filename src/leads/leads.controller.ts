import { Controller, Get, Post, Body, Param, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Controller()
@UseGuards(ApiKeyGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('create-lead')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get('leads')
  findAll() {
    return this.leadsService.findAll();
  }

  @Get('leads/:id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post('leads/:id/summarize')
  summarize(@Param('id') id: string) {
    return this.leadsService.summarize(id);
  }
}
