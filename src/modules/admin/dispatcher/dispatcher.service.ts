import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserStatus, UserType } from '@prisma/client';
import appConfig from '../../../config/app.config';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDispatcherDto } from './dto/create-dispatcher.dto';
import { GetDispatcherDetailQueryDto } from './dto/get-dispatcher-detail-query.dto';
import { ListDispatcherQueryDto } from './dto/list-dispatcher-query.dto';
import { UpdateDispatcherDto } from './dto/update-dispatcher.dto';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';

@Injectable()
export class DispatcherService {
  constructor(private prisma: PrismaService) {}

  async create(
    requesterUserId: string,
    createDispatcherDto: CreateDispatcherDto,
  ) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        include: { admin: true },
      });

      if (!requester || requester.type !== UserType.ADMIN || !requester.admin) {
        return { success: false, message: 'Only admin can create dispatcher' };
      }

      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email: createDispatcherDto.email,
          deleted_at: null,
        },
        select: { id: true },
      });

      if (existingEmail) {
        return { success: false, message: 'Email already exists' };
      }

      const username =
        createDispatcherDto.username || createDispatcherDto.email.split('@')[0];
      const hashedPassword = await bcrypt.hash(
        createDispatcherDto.password,
        appConfig().security.salt,
      );

      const created = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username,
            email: createDispatcherDto.email,
            phone_number: createDispatcherDto.phone_number,
            password: hashedPassword,
            type: UserType.DISPATCHER,
            status: UserStatus.ACTIVE,
            approved_at: new Date(),
          },
        });

        const dispatcher = await tx.dispatcher.create({
          data: {
            user_id: user.id,
            admin_id: requester.admin.id,
            full_name: createDispatcherDto.full_name,
            address: createDispatcherDto.address,
            notes: createDispatcherDto.notes,
          },
        });

        return { user, dispatcher };
      });

      return {
        success: true,
        message: 'Dispatcher created successfully',
        data: {
          user_id: created.user.id,
          dispatcher_id: created.dispatcher.id,
          admin_id: requester.admin.id,
          email: created.user.email,
          username: created.user.username,
          full_name: created.dispatcher.full_name,
          address: created.dispatcher.address,
          notes: created.dispatcher.notes,
          phone_number: created.user.phone_number,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async findAll(requesterUserId: string, query?: ListDispatcherQueryDto) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        include: { admin: true },
      });

      if (
        !requester ||
        (requester.type !== UserType.ADMIN &&
          requester.type !== UserType.SUPER_ADMIN)
      ) {
        return { success: false, message: 'Access denied' };
      }

      const page = query?.page ? Number(query.page) : 1;
      const limit = query?.limit ? Number(query.limit) : 20;
      const search = query?.search ? String(query.search).trim() : null;

      const where: any = { deleted_at: null };

      if (requester.type === UserType.ADMIN) {
        if (!requester.admin) {
          return { success: false, message: 'Admin profile not found' };
        }
        where.admin_id = requester.admin.id;
      }

      const andFilters: any[] = [];

      if (search) {
        andFilters.push({
          OR: [
            { full_name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { notes: { contains: search, mode: 'insensitive' } },
            { user: { username: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        });
      }

      if (query?.full_name) {
        andFilters.push({
          full_name: { contains: String(query.full_name), mode: 'insensitive' },
        });
      }

      if (query?.username) {
        andFilters.push({
          user: {
            username: { contains: String(query.username), mode: 'insensitive' },
          },
        });
      }

      if (query?.email) {
        andFilters.push({
          user: {
            email: { contains: String(query.email), mode: 'insensitive' },
          },
        });
      }

      if (query?.address) {
        andFilters.push({
          address: { contains: String(query.address), mode: 'insensitive' },
        });
      }

      if (query?.notes) {
        andFilters.push({
          notes: { contains: String(query.notes), mode: 'insensitive' },
        });
      }

      if (andFilters.length > 0) {
        where.AND = andFilters;
      }

      const total = await this.prisma.dispatcher.count({
        where,
      });

      const dispatchers = await this.prisma.dispatcher.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              phone_number: true,
              type: true,
              approved_at: true,
              created_at: true,
            },
          },
          admin: {
            select: {
              id: true,
              company_name: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      });

      const data = dispatchers.map((dispatcher) => ({
        dispatcher_id: dispatcher.id,
        admin_id: dispatcher.admin_id,
        full_name: dispatcher.full_name,
        address: dispatcher.address,
        notes: dispatcher.notes,
        created_at: dispatcher.created_at,
        updated_at: dispatcher.updated_at,
        user: dispatcher.user,
        admin: dispatcher.admin,
      }));

      return {
        success: true,
        data,
        meta: {
          page,
          limit,
          total,
          totalPage: limit > 0 ? Math.ceil(total / limit) : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async findOne(
    requesterUserId: string,
    dispatcherId: string,
    query?: GetDispatcherDetailQueryDto,
  ) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        include: { admin: true },
      });

      if (
        !requester ||
        (requester.type !== UserType.ADMIN &&
          requester.type !== UserType.SUPER_ADMIN)
      ) {
        return { success: false, message: 'Access denied' };
      }

      const dispatcher = await this.prisma.dispatcher.findUnique({
        where: { id: dispatcherId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              phone_number: true,
              type: true,
              approved_at: true,
              created_at: true,
            },
          },
          admin: {
            select: {
              id: true,
              company_name: true,
            },
          },
          loads: {
            include: {
              carrier: true,
            },
          },
        },
      });

      if (!dispatcher || dispatcher.deleted_at) {
        return { success: false, message: 'Dispatcher not found' };
      }

      if (
        requester.type === UserType.ADMIN &&
        (!requester.admin || dispatcher.admin_id !== requester.admin.id)
      ) {
        return { success: false, message: 'Dispatcher not found' };
      }

      const startDate = query?.start_date ? new Date(query.start_date) : null;
      const endDate = query?.end_date ? new Date(query.end_date) : null;
      const carrierId = query?.carrier_id
        ? String(query.carrier_id).trim()
        : null;

      const filteredLoads = dispatcher.loads.filter((load) => {
        if (carrierId && load.carrier_id !== carrierId) {
          return false;
        }

        const loadDate = load.completed_at || load.created_at;

        if (startDate && loadDate < startDate) {
          return false;
        }

        if (endDate && loadDate > endDate) {
          return false;
        }

        return true;
      });

      const carrierMap = new Map<string, any>();
      filteredLoads.forEach((load) => {
        if (load.carrier) {
          carrierMap.set(load.carrier.id, {
            carrier_id: load.carrier.id,
            legal_name: load.carrier.legal_name,
            dba_name: load.carrier.dba_name,
            mc_number: load.carrier.mc_number,
            dot_number: load.carrier.dot_number,
            address: load.carrier.address,
            contact: load.carrier.contact,
            email: load.carrier.email,
            logo: load.carrier.logo,
          });
        }
      });

      const totalRevenue = filteredLoads.reduce((sum, load) => {
        return sum + Number(load.total_rate || 0);
      }, 0);

      const totalMiles = filteredLoads.reduce((sum, load) => {
        return sum + Number(load.total_miles || 0);
      }, 0);

      const data = {
        dispatcher_id: dispatcher.id,
        admin_id: dispatcher.admin_id,
        full_name: dispatcher.full_name,
        address: dispatcher.address,
        notes: dispatcher.notes,
        created_at: dispatcher.created_at,
        updated_at: dispatcher.updated_at,
        user: dispatcher.user,
        admin: dispatcher.admin,
        carriers: Array.from(carrierMap.values()),
        loads: filteredLoads.map((load) => ({
          load_id: load.id,
          load_number: load.load_number,
          carrier_id: load.carrier_id,
          carrier: load.carrier,
          pickup_company: load.pickup_company,
          pickup_date: load.pickup_date,
          delivery_company: load.delivery_company,
          delivery_date: load.delivery_date,
          status: load.status,
          rate_per_mile: load.rate_per_mile,
          total_miles: load.total_miles,
          loaded_miles: load.loaded_miles,
          deadhead_miles: load.deadhead_miles,
          total_rate: load.total_rate,
          completed_at: load.completed_at,
          created_at: load.created_at,
        })),
        revenue: {
          total_loads: filteredLoads.length,
          total_miles: totalMiles,
          total_revenue: totalRevenue,
          total_dispatcher_revenue: totalRevenue,
        },
      };

      return {
        success: true,
        data,
        meta: {
          start_date: startDate ? startDate.toISOString() : null,
          end_date: endDate ? endDate.toISOString() : null,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async findOneCarrier(requesterUserId: string, carrierId: string) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        include: { admin: true },
      });

      if (
        !requester ||
        (requester.type !== UserType.ADMIN && requester.type !== UserType.SUPER_ADMIN)
      ) {
        return { success: false, message: 'Access denied' };
      }

      const carrier = await this.prisma.carrier.findUnique({
        where: { id: carrierId },
        include: {
          dispatcher: {
            select: {
              id: true,
              full_name: true,
              admin_id: true,
            },
          },
          pricing_plan: true,
          documents: {
            where: { deleted_at: null },
            orderBy: { created_at: 'desc' },
          },
        },
      });

      if (!carrier || carrier.deleted_at) {
        return { success: false, message: 'Carrier not found' };
      }

      if (requester.type === UserType.ADMIN) {
        if (!requester.admin) {
          return { success: false, message: 'Admin profile not found' };
        }

        if (!carrier.dispatcher || carrier.dispatcher.admin_id !== requester.admin.id) {
          return { success: false, message: 'Carrier not found' };
        }
      }

      const data = {
        carrier_id: carrier.id,
        legal_name: carrier.legal_name,
        dba_name: carrier.dba_name,
        mc_number: carrier.mc_number,
        dot_number: carrier.dot_number,
        address: carrier.address,
        contact: carrier.contact,
        email: carrier.email,
        logo: carrier.logo,
        logo_url: carrier.logo
          ? SojebStorage.url(appConfig().storageUrl.websiteInfo + carrier.logo)
          : null,
        dispatcher_id: carrier.dispatcher_id,
        dispatcher: carrier.dispatcher,
        pricing_plan: carrier.pricing_plan
          ? {
              id: carrier.pricing_plan.id,
              plan_name: carrier.pricing_plan.plan_name,
              description: carrier.pricing_plan.description,
              dispatcher_fee: carrier.pricing_plan.dispatcher_fee?.toString() ?? null,
              use_default_dispatcher_fee:
                carrier.pricing_plan.use_default_dispatcher_fee,
              billing_cycle: carrier.pricing_plan.billing_cycle,
              billing_day: carrier.pricing_plan.billing_day,
              is_active: carrier.pricing_plan.is_active,
            }
          : null,
        documents: carrier.documents.map((document) => ({
          id: document.id,
          name: document.name,
          type: document.type,
          file: document.file,
          status: document.status,
          notes: document.notes,
          created_at: document.created_at,
        })),
        created_at: carrier.created_at,
        updated_at: carrier.updated_at,
      };

      return {
        success: true,
        message: 'Carrier profile fetched successfully',
        data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  update(id: number, updateDispatcherDto: UpdateDispatcherDto) {
    return `This action updates a #${id} dispatcher`;
  }

  remove(id: number) {
    return `This action removes a #${id} dispatcher`;
  }
}
