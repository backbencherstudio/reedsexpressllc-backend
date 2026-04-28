import { Module, OnModuleInit, Injectable } from '@nestjs/common';
import { PricingPlanService } from './pricing-plan.service';
import { PricingPlanController } from './pricing-plan.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
class FeatureSeeder implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  private readonly FEATURES = [
    {
      name: 'Load Dispatching',
      description: 'Full load management and dispatching services',
    },
    {
      name: 'Dedicated Dispatcher',
      description: 'Personal dispatcher assignment',
    },
    { name: 'Load Board Access', description: 'Access to premium load boards' },
    {
      name: 'Document Tracking',
      description: 'Track insurance, permits, and driver documents',
    },
    {
      name: 'Document Upload',
      description: 'Upload and store compliance documents',
    },
    {
      name: 'Driver Qualification Files',
      description: 'Full DQF management (CDL, Medical, MVR, Drug Tests)',
    },
    {
      name: 'HOS Violations Tracking',
      description: 'Track and monitor hours of service violations',
    },
    {
      name: 'Vehicle Maintenance',
      description: 'Maintenance scheduling and tracking',
    },
    { name: 'DVIR Tracking', description: 'Driver vehicle inspection reports' },
    {
      name: 'CSA Score Monitoring',
      description: 'Track CSA BASIC scores and percentiles',
    },
    {
      name: 'Permit Renewals',
      description: 'Track UCR, BOC-3, IRP, IFTA, HVIJT renewals',
    },
    {
      name: 'Safety Meeting Tracking',
      description: 'Schedule and track safety training meetings',
    },
    {
      name: 'Email Notifications',
      description: 'Email alerts for expirations and violations',
    },
    {
      name: 'Audit Reports',
      description: 'Comprehensive compliance audit and scoring',
    },
    {
      name: 'Billing & Invoicing',
      description: 'Automated billing and invoice generation',
    },
    {
      name: 'Statements & Invoicing',
      description: 'Professional invoicing and statements',
    },
    {
      name: 'Factoring Services',
      description: 'Invoice factoring and quick pay',
    },
    {
      name: 'Financial Metrics',
      description: 'Revenue tracking, profit analysis, and financial reports',
    },
    {
      name: 'Financial Metrics & Reports',
      description:
        'Access to financial dashboards, revenue analytics, and performance reports',
    },
    {
      name: '24/7 Dispatch Support',
      description: 'Round-the-clock dispatcher assistance and load support',
    },
    {
      name: '24 Hour Support',
      description: 'Round-the-clock dispatch and customer support',
    },
    {
      name: '24/7 Roadside Assistance',
      description: 'Round-the-clock roadside support',
    },
    { name: 'Fuel Card Program', description: 'Discounted fuel card access' },
    { name: 'ELD Integration', description: 'Electronic logging device sync' },
    { name: 'Insurance Filing', description: 'Help with insurance paperwork' },
    {
      name: 'Permits & IFTA Filing',
      description: 'Permit and IFTA filing assistance',
    },
    {
      name: 'Driver Recruiting',
      description: 'Help finding and vetting drivers',
    },
  ];

  async onModuleInit() {
    for (const f of this.FEATURES) {
      try {
        const existing = await this.prisma.feature.findFirst({
          where: { name: f.name },
        });
        if (existing) {
          await this.prisma.feature.update({
            where: { id: existing.id },
            data: { description: f.description },
          });
        } else {
          await this.prisma.feature.create({
            data: { name: f.name, description: f.description },
          });
        }
      } catch (err) {
        // swallow errors to avoid blocking app startup; log if Prisma logger available
        // eslint-disable-next-line no-console
        console.error(
          'FeatureSeeder: upsert failed for',
          f.name,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [PricingPlanController],
  providers: [FeatureSeeder, PricingPlanService],
})
export class PricingPlanModule {}
