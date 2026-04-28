import { Injectable } from '@nestjs/common';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserType } from '@prisma/client';

@Injectable()
export class PricingPlanService {
  constructor(private prisma: PrismaService) {}

  async create(
    requesterUserId: string,
    createPricingPlanDto: CreatePricingPlanDto,
  ) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { id: true, type: true },
      });

      if (
        !requester ||
        (requester.type !== UserType.ADMIN &&
          requester.type !== UserType.SUPER_ADMIN)
      ) {
        return {
          success: false,
          message: 'Only admin or super admin can create pricing plans',
        };
      }

      const {
        plan_name,
        description,
        dispatcher_fee,
        use_default_dispatcher_fee,
        billing_cycle,
        billing_day,
        is_active,
        feature_ids,
      } = createPricingPlanDto as any;

      // find admin profile for the requesting user
      const adminRecord = await this.prisma.admin.findFirst({
        where: { user_id: requesterUserId },
      });
      if (!adminRecord) {
        return {
          success: false,
          message: 'Admin profile not found for requester',
        };
      }

      const data: any = {
        plan_name,
        description,
        dispatcher_fee,
        use_default_dispatcher_fee,
        billing_cycle,
        billing_day,
        is_active,
        admin_id: adminRecord.id,
      };

      if (feature_ids && feature_ids.length) {
        data.included_features = {
          create: feature_ids.map((fid: string) => ({
            feature: { connect: { id: fid } },
          })),
        };
      }

      const created = await this.prisma.pricingPlan.create({
        data,
        include: { included_features: { include: { feature: true } } },
      });

      return {
        success: true,
        message: 'Pricing plan created successfully',
        data: created,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async findAll(requesterUserId: string, query?: any) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { id: true, type: true },
      });

      if (!requester) {
        return { success: false, message: 'Unauthorized request' };
      }

      const page = query && query.page ? Number(query.page) : 1;
      const limit = query ? Number(query.limit ?? 20) : 20;
      const search = query && query.search ? String(query.search).trim() : null;

      const where: any = { deleted_at: null };

      // search filter
      if (search) {
        where.AND = where.AND || [];
        where.AND.push({
          plan_name: { contains: search, mode: 'insensitive' },
        });
      }

      // is_active filter
      if (query && typeof query.is_active !== 'undefined') {
        const active = String(query.is_active) === 'true';
        where.is_active = active;
      }

      // scope: ADMIN sees only their own; SUPER_ADMIN can filter by admin_id
      if (requester.type === UserType.ADMIN) {
        const adminProfile = await this.prisma.admin.findFirst({
          where: { user_id: requesterUserId },
        });
        if (!adminProfile) {
          return {
            success: false,
            message: 'Admin profile not found for requester',
          };
        }
        where.admin_id = adminProfile.id;
      } else if (requester.type === UserType.SUPER_ADMIN) {
        if (query && query.admin_id) {
          where.admin_id = String(query.admin_id);
        }
      }

      const total = await this.prisma.pricingPlan.count({ where });

      const plans = await this.prisma.pricingPlan.findMany({
        where,
        include: { included_features: { include: { feature: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      });

      const results = plans.map((p) => ({
        id: p.id,
        plan_name: p.plan_name,
        description: p.description,
        dispatcher_fee: p.dispatcher_fee,
        is_active: p.is_active,
        billing_cycle: p.billing_cycle,
        included_features: p.included_features?.map((pf) => pf.feature) ?? [],
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));

      const totalPage = limit > 0 ? Math.ceil(total / limit) : 0;
      return {
        success: true,
        data: results,
        meta: { page, limit, total, totalPage },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} pricingPlan`;
  }

  async update(
    requesterUserId: string,
    planId: string,
    updatePricingPlanDto: UpdatePricingPlanDto,
  ) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { id: true, type: true },
      });

      if (
        !requester ||
        (requester.type !== UserType.ADMIN &&
          requester.type !== UserType.SUPER_ADMIN)
      ) {
        return {
          success: false,
          message: 'Only admin or super admin can update pricing plans',
        };
      }

      const existing = await this.prisma.pricingPlan.findUnique({
        where: { id: planId },
        include: { admin: { select: { user_id: true } } },
      });

      if (!existing) {
        return { success: false, message: 'Pricing plan not found' };
      }

      // scope check: ADMIN can only update their own plans
      if (requester.type === UserType.ADMIN) {
        if (existing.admin.user_id !== requesterUserId) {
          return {
            success: false,
            message: 'You can only update your own pricing plans',
          };
        }
      }

      const {
        plan_name,
        description,
        dispatcher_fee,
        use_default_dispatcher_fee,
        billing_cycle,
        billing_day,
        is_active,
        feature_ids,
      } = updatePricingPlanDto as any;

      const data: any = {};
      if (plan_name) data.plan_name = plan_name;
      if (description) data.description = description;
      if (dispatcher_fee) data.dispatcher_fee = dispatcher_fee;
      if (use_default_dispatcher_fee !== undefined)
        data.use_default_dispatcher_fee = use_default_dispatcher_fee;
      if (billing_cycle) data.billing_cycle = billing_cycle;
      if (billing_day) data.billing_day = billing_day;
      if (is_active !== undefined) data.is_active = is_active;

      // handle feature_ids update
      if (feature_ids && Array.isArray(feature_ids)) {
        // delete existing plan features
        await this.prisma.planFeature.deleteMany({
          where: { pricing_plan_id: planId },
        });

        // create new plan features
        if (feature_ids.length) {
          data.included_features = {
            create: feature_ids.map((fid: string) => ({
              feature: { connect: { id: fid } },
            })),
          };
        }
      }

      const updated = await this.prisma.pricingPlan.update({
        where: { id: planId },
        data,
        include: { included_features: { include: { feature: true } } },
      });

      return {
        success: true,
        message: 'Pricing plan updated successfully',
        data: updated,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async remove(requesterUserId: string, planId: string) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { id: true, type: true },
      });

      if (
        !requester ||
        (requester.type !== UserType.ADMIN &&
          requester.type !== UserType.SUPER_ADMIN)
      ) {
        return {
          success: false,
          message: 'Only admin or super admin can delete pricing plans',
        };
      }

      const existing = await this.prisma.pricingPlan.findUnique({
        where: { id: planId },
        include: { admin: { select: { user_id: true } } },
      });

      if (!existing) {
        return { success: false, message: 'Pricing plan not found' };
      }

      if (existing.deleted_at) {
        return { success: false, message: 'Pricing plan already deleted' };
      }

      // scope check: ADMIN can only delete their own plans
      if (requester.type === UserType.ADMIN) {
        if (existing.admin.user_id !== requesterUserId) {
          return {
            success: false,
            message: 'You can only delete your own pricing plans',
          };
        }
      }

      const deleted = await this.prisma.pricingPlan.update({
        where: { id: planId },
        data: { deleted_at: new Date() },
      });

      return {
        success: true,
        message: 'Pricing plan deleted successfully',
        data: deleted,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getFeatures() {
    try {
      const features = await this.prisma.feature.findMany({
        where: { deleted_at: null },
        orderBy: { name: 'asc' },
      });

      return {
        success: true,
        data: features,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
