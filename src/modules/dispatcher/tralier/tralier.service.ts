import { Injectable } from '@nestjs/common';
import { CreateTralierDto } from './dto/create-tralier.dto';
import { UpdateTralierDto } from './dto/update-tralier.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTralierTypeDto } from './dto/create-tralier-type.dto';
import { ListTralierQueryDto } from './dto/list-tralier-query.dto';

@Injectable()
export class TralierService {
  constructor(private readonly prisma: PrismaService) {}

  async createTralierType(requesterUserId: string, dto: CreateTralierTypeDto) {
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

      const created = await this.prisma.trailerType.create({
        data: {
          name: dto.name,
          description: dto.description ?? null,
        },
      });

      return {
        success: true,
        message: 'Trailer type created successfully',
        data: created,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getTralierTypes(requesterUserId: string) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { id: true },
      });

      if (!requester) {
        return { success: false, message: 'Unauthorized request' };
      }

      const types = await this.prisma.trailerType.findMany({
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

  async create(requesterUserId: string, createTralierDto: CreateTralierDto) {
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
        where: { id: createTralierDto.carrier_id },
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

        if (!dispatcher || dispatcher.id !== carrier.dispatcher_id) {
          return {
            success: false,
            message: 'You can only create trailers for your own carriers',
          };
        }
      }

      if (createTralierDto.trailer_type_id) {
        const trailerType = await this.prisma.trailerType.findFirst({
          where: { id: createTralierDto.trailer_type_id, deleted_at: null },
          select: { id: true },
        });

        if (!trailerType) {
          return { success: false, message: 'Invalid trailer_type_id' };
        }
      }

      const created = await this.prisma.trailer.create({
        data: {
          carrier_id: createTralierDto.carrier_id,
          trailer_type_id: createTralierDto.trailer_type_id ?? null,
          model: createTralierDto.model ?? null,
          plate_number: createTralierDto.plate_number ?? null,
          plate_state: createTralierDto.plate_state ?? null,
          unit_number: createTralierDto.unit_number ?? null,
        },
      });

      return {
        success: true,
        message: 'Trailer created successfully',
        data: created,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async findAll(requesterUserId: string, query?: ListTralierQueryDto) {
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

      if (query?.trailer_type_id) {
        where.trailer_type_id = query.trailer_type_id;
      }

      if (search) {
        where.OR = [
          { plate_number: { contains: search, mode: 'insensitive' } },
          { plate_state: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
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

      const total = await this.prisma.trailer.count({ where });

      const trailers = await this.prisma.trailer.findMany({
        where,
        include: {
          trailer_type: {
            select: { id: true, name: true },
          },
          carrier: {
            select: { id: true, legal_name: true },
          },
          loads: {
            select: {
              id: true,
              load_number: true,
              status: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      });

      const data = trailers.map((trailer) => ({
        id: trailer.id,
        carrier_id: trailer.carrier_id,
        trailer_type_id: trailer.trailer_type_id,
        trailer_type: trailer.trailer_type,
        model: trailer.model,
        plate_number: trailer.plate_number,
        plate_state: trailer.plate_state,
        unit_number: trailer.unit_number,
        carrier: trailer.carrier,
        loads: trailer.loads,
        created_at: trailer.created_at,
        updated_at: trailer.updated_at,
      }));

      const totalPage = limit > 0 ? Math.ceil(total / limit) : 0;

      return {
        success: true,
        data,
        meta: { page, limit, total, totalPage },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async findOne(requesterUserId: string, tralierId: string) {
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

      const trailer = await this.prisma.trailer.findUnique({
        where: { id: tralierId },
        include: {
          trailer_type: {
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
              updated_at: true,
            },
          },
        },
      });

      if (!trailer || trailer.deleted_at) {
        return { success: false, message: 'Trailer not found' };
      }

      if (requester.type === 'DISPATCHER') {
        const dispatcher = await this.prisma.dispatcher.findFirst({
          where: { user_id: requesterUserId },
          select: { id: true },
        });

        if (!dispatcher || trailer.carrier?.dispatcher_id !== dispatcher.id) {
          return {
            success: false,
            message: 'You can only view your own trailers',
          };
        }
      }

      return {
        success: true,
        data: {
          id: trailer.id,
          carrier_id: trailer.carrier_id,
          trailer_type_id: trailer.trailer_type_id,
          trailer_type: trailer.trailer_type,
          model: trailer.model,
          plate_number: trailer.plate_number,
          plate_state: trailer.plate_state,
          unit_number: trailer.unit_number,
          carrier: trailer.carrier,
          loads: trailer.loads,
          created_at: trailer.created_at,
          updated_at: trailer.updated_at,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async update(
    requesterUserId: string,
    tralierId: string,
    updateTralierDto: UpdateTralierDto,
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

      const trailer = await this.prisma.trailer.findUnique({
        where: { id: tralierId },
        include: {
          carrier: {
            select: { id: true, dispatcher_id: true },
          },
        },
      });

      if (!trailer || trailer.deleted_at) {
        return { success: false, message: 'Trailer not found' };
      }

      if (requester.type === 'DISPATCHER') {
        const dispatcher = await this.prisma.dispatcher.findFirst({
          where: { user_id: requesterUserId },
          select: { id: true },
        });

        if (!dispatcher || trailer.carrier?.dispatcher_id !== dispatcher.id) {
          return {
            success: false,
            message: 'You can only update your own trailers',
          };
        }
      }

      let targetCarrierId =
        updateTralierDto.carrier_id ?? trailer.carrier_id ?? null;

      if (updateTralierDto.carrier_id) {
        const carrier = await this.prisma.carrier.findUnique({
          where: { id: updateTralierDto.carrier_id },
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
              message: 'You can only assign trailers to your own carriers',
            };
          }
        }

        targetCarrierId = carrier.id;
      }

      if (updateTralierDto.trailer_type_id) {
        const trailerType = await this.prisma.trailerType.findFirst({
          where: { id: updateTralierDto.trailer_type_id, deleted_at: null },
          select: { id: true },
        });

        if (!trailerType) {
          return { success: false, message: 'Invalid trailer_type_id' };
        }
      }

      const updated = await this.prisma.trailer.update({
        where: { id: tralierId },
        data: {
          carrier_id: targetCarrierId,
          trailer_type_id:
            updateTralierDto.trailer_type_id !== undefined
              ? updateTralierDto.trailer_type_id
              : trailer.trailer_type_id,
          model: updateTralierDto.model ?? trailer.model,
          plate_number: updateTralierDto.plate_number ?? trailer.plate_number,
          plate_state: updateTralierDto.plate_state ?? trailer.plate_state,
          unit_number: updateTralierDto.unit_number ?? trailer.unit_number,
        },
      });

      return {
        success: true,
        message: 'Trailer updated successfully',
        data: updated,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async remove(requesterUserId: string, tralierId: string) {
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

      const trailer = await this.prisma.trailer.findUnique({
        where: { id: tralierId },
        include: {
          carrier: {
            select: { id: true, dispatcher_id: true },
          },
        },
      });

      if (!trailer || trailer.deleted_at) {
        return { success: false, message: 'Trailer not found' };
      }

      if (requester.type === 'DISPATCHER') {
        const dispatcher = await this.prisma.dispatcher.findFirst({
          where: { user_id: requesterUserId },
          select: { id: true },
        });

        if (!dispatcher || trailer.carrier?.dispatcher_id !== dispatcher.id) {
          return {
            success: false,
            message: 'You can only delete your own trailers',
          };
        }
      }

      const deleted = await this.prisma.trailer.update({
        where: { id: tralierId },
        data: { deleted_at: new Date() },
      });

      return {
        success: true,
        message: 'Trailer deleted successfully',
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
