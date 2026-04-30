import { Injectable } from '@nestjs/common';
import { CreateTruckDto } from './dto/create-truck.dto';
import { UpdateTruckDto } from './dto/update-truck.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTruckTypeDto } from './dto/create-truck-type.dto';
import { ListTruckQueryDto } from './dto/list-truck-query.dto';

@Injectable()
export class TruckService {
  constructor(private readonly prisma: PrismaService) {}

  async createTruckType(requesterUserId: string, dto: CreateTruckTypeDto) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { id: true, type: true },
      });
      if (!requester)
        return { success: false, message: 'Unauthorized request' };

      const created = await this.prisma.truckType.create({
        data: { name: dto.name, description: dto.description ?? null },
      });

      return { success: true, message: 'Truck type created', data: created };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async create(requesterUserId: string, createTruckDto: CreateTruckDto) {
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

      const carrier = await this.prisma.carrier.findUnique({
        where: { id: createTruckDto.carrier_id },
        select: { id: true, dispatcher_id: true },
      });

      if (!carrier) {
        return { success: false, message: 'Carrier not found' };
      }

      if (requester.type === 'DISPATCHER') {
        const dispatcher = await this.prisma.dispatcher.findFirst({
          where: { user_id: requesterUserId },
        });

        if (!dispatcher || dispatcher.id !== carrier.dispatcher_id) {
          return {
            success: false,
            message: 'You can only create trucks for your own carriers',
          };
        }
      }

      // validate truck_type_id if provided to avoid FK constraint errors
      let truckTypeId = createTruckDto.truck_type_id ?? null;
      if (truckTypeId) {
        const tt = await this.prisma.truckType.findFirst({
          where: { id: truckTypeId, deleted_at: null },
          select: { id: true },
        });
        if (!tt) {
          return { success: false, message: 'Invalid truck_type_id' };
        }
      }

      const created = await this.prisma.truck.create({
        data: {
          carrier_id: createTruckDto.carrier_id,
          license_plate: createTruckDto.license_plate,
          truck_type_id: createTruckDto.truck_type_id,
          make: createTruckDto.make ?? null,
          model: createTruckDto.model ?? null,
          year: createTruckDto.year ?? null,
          vin: createTruckDto.vin ?? null,
          unit_number: createTruckDto.unit_number ?? null,
        },
      });

      return {
        success: true,
        message: 'Truck created successfully',
        data: created,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getTruckTypes(requesterUserId: string) {
    try {
      if (!requesterUserId)
        return { success: false, message: 'Unauthorized request' };
      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { id: true },
      });
      if (!requester)
        return { success: false, message: 'Unauthorized request' };

      const types = await this.prisma.truckType.findMany({
        where: { deleted_at: null },
        orderBy: { name: 'asc' },
      });
      return { success: true, data: types };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async findAll(requesterUserId: string, query?: ListTruckQueryDto) {
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

      const page = query?.page ? Number(query.page) : 1;
      const limit = query?.limit ? Number(query.limit) : 20;
      const search = query?.search ? String(query.search).trim() : null;

      const where: any = { deleted_at: null };

      if (query?.carrier_id) {
        where.carrier_id = query.carrier_id;
      }
      if (query?.truck_type_id) {
        where.truck_type_id = query.truck_type_id;
      }

      if (search) {
        where.OR = [
          { license_plate: { contains: search, mode: 'insensitive' } },
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { vin: { contains: search, mode: 'insensitive' } },
          { unit_number: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (requester.type === 'DISPATCHER') {
        const dispatcher = await this.prisma.dispatcher.findFirst({
          where: { user_id: requesterUserId },
          select: { id: true },
        });
        if (!dispatcher) {
          return {
            success: false,
            message: 'Dispatcher profile not found for requester',
          };
        }
        where.carrier = { dispatcher_id: dispatcher.id };
      }

      const total = await this.prisma.truck.count({ where });
      const trucks = await this.prisma.truck.findMany({
        where,
        include: {
          truck_type: {
            select: { id: true, name: true },
          },
          carrier: {
            select: { id: true, legal_name: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      });

      const totalPage = limit > 0 ? Math.ceil(total / limit) : 0;
      return {
        success: true,
        data: trucks,
        meta: { page, limit, total, totalPage },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async findOne(requesterUserId: string, truckId: string) {
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

      const truck = await this.prisma.truck.findUnique({
        where: { id: truckId },
        include: {
          truck_type: {
            select: { id: true, name: true, description: true },
          },
          carrier: {
            select: { id: true, legal_name: true, dispatcher_id: true },
          },
          loads: {
            select: {
              id: true,
              load_number: true,
              status: true,
              created_at: true,
            },
          },
        },
      });

      if (!truck || truck.deleted_at) {
        return { success: false, message: 'Truck not found' };
      }

      if (requester.type === 'DISPATCHER') {
        const dispatcher = await this.prisma.dispatcher.findFirst({
          where: { user_id: requesterUserId },
          select: { id: true },
        });

        if (!dispatcher || truck.carrier?.dispatcher_id !== dispatcher.id) {
          return {
            success: false,
            message: 'You can only view your own trucks',
          };
        }
      }

      return { success: true, data: truck };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async update(
    requesterUserId: string,
    truckId: string,
    updateTruckDto: UpdateTruckDto,
  ) {
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

      const truck = await this.prisma.truck.findUnique({
        where: { id: truckId },
        include: {
          carrier: {
            select: { id: true, dispatcher_id: true },
          },
        },
      });

      if (!truck || truck.deleted_at) {
        return { success: false, message: 'Truck not found' };
      }

      if (requester.type === 'DISPATCHER') {
        const dispatcher = await this.prisma.dispatcher.findFirst({
          where: { user_id: requesterUserId },
          select: { id: true },
        });

        if (!dispatcher || truck.carrier?.dispatcher_id !== dispatcher.id) {
          return {
            success: false,
            message: 'You can only update your own trucks',
          };
        }
      }

      let targetCarrierId =
        updateTruckDto.carrier_id ?? truck.carrier_id ?? null;
      if (updateTruckDto.carrier_id) {
        const carrier = await this.prisma.carrier.findUnique({
          where: { id: updateTruckDto.carrier_id },
          select: { id: true, dispatcher_id: true },
        });

        if (!carrier) {
          return { success: false, message: 'Carrier not found' };
        }

        if (requester.type === 'DISPATCHER') {
          const dispatcher = await this.prisma.dispatcher.findFirst({
            where: { user_id: requesterUserId },
            select: { id: true },
          });

          if (!dispatcher || carrier.dispatcher_id !== dispatcher.id) {
            return {
              success: false,
              message: 'You can only assign trucks to your own carriers',
            };
          }
        }

        targetCarrierId = carrier.id;
      }

      if (updateTruckDto.truck_type_id) {
        const tt = await this.prisma.truckType.findFirst({
          where: { id: updateTruckDto.truck_type_id, deleted_at: null },
          select: { id: true },
        });
        if (!tt) {
          return { success: false, message: 'Invalid truck_type_id' };
        }
      }

      const updated = await this.prisma.truck.update({
        where: { id: truckId },
        data: {
          carrier_id: targetCarrierId,
          license_plate: updateTruckDto.license_plate ?? truck.license_plate,
          truck_type_id:
            updateTruckDto.truck_type_id !== undefined
              ? updateTruckDto.truck_type_id
              : truck.truck_type_id,
          make: updateTruckDto.make ?? truck.make,
          model: updateTruckDto.model ?? truck.model,
          year:
            updateTruckDto.year !== undefined
              ? updateTruckDto.year
              : truck.year,
          vin: updateTruckDto.vin ?? truck.vin,
          unit_number: updateTruckDto.unit_number ?? truck.unit_number,
        },
      });

      return {
        success: true,
        message: 'Truck updated successfully',
        data: updated,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async remove(requesterUserId: string, truckId: string) {
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

      const truck = await this.prisma.truck.findUnique({
        where: { id: truckId },
        include: {
          carrier: {
            select: { id: true, dispatcher_id: true },
          },
        },
      });

      if (!truck || truck.deleted_at) {
        return { success: false, message: 'Truck not found' };
      }

      if (requester.type === 'DISPATCHER') {
        const dispatcher = await this.prisma.dispatcher.findFirst({
          where: { user_id: requesterUserId },
          select: { id: true },
        });

        if (!dispatcher || truck.carrier?.dispatcher_id !== dispatcher.id) {
          return {
            success: false,
            message: 'You can only delete your own trucks',
          };
        }
      }

      const deleted = await this.prisma.truck.update({
        where: { id: truckId },
        data: { deleted_at: new Date() },
      });

      return {
        success: true,
        message: 'Truck deleted successfully',
        data: deleted,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
