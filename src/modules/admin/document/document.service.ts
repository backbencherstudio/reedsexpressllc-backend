import { Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import appConfig from '../../../config/app.config';
import { SojebStorage } from '../../../common/lib/Disk/SojebStorage';
import { PrismaService } from '../../../prisma/prisma.service';
import { ListDocumentQueryDto } from './dto/list-document-query.dto';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(requesterUserId: string, query?: ListDocumentQueryDto) {
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
      const startDate = query?.start_date ? new Date(query.start_date) : null;
      const endDate = query?.end_date ? new Date(query.end_date) : null;

      const where: any = { deleted_at: null };
      const andFilters: any[] = [];

      if (requester.type === UserType.ADMIN) {
        if (!requester.admin) {
          return { success: false, message: 'Admin profile not found' };
        }

        where.OR = [
          { carrier: { dispatcher: { admin_id: requester.admin.id } } },
          { load: { dispatcher: { admin_id: requester.admin.id } } },
          {
            driver: {
              carrier: { dispatcher: { admin_id: requester.admin.id } },
            },
          },
        ];
      }

      if (search) {
        andFilters.push({
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { type: { contains: search, mode: 'insensitive' } },
            { notes: { contains: search, mode: 'insensitive' } },
            { file: { contains: search, mode: 'insensitive' } },
          ],
        });
      }

      if (query?.name) {
        andFilters.push({
          name: { contains: String(query.name), mode: 'insensitive' },
        });
      }

      if (query?.type) {
        andFilters.push({
          type: { contains: String(query.type), mode: 'insensitive' },
        });
      }

      if (query?.status) {
        andFilters.push({ status: query.status });
      }

      if (query?.carrier_id) {
        andFilters.push({ carrier_id: query.carrier_id });
      }

      const wantsCarrierDocs =
        query?.carrier !== undefined && String(query.carrier).trim() !== '';

      if (query?.driver_id) {
        andFilters.push({ driver_id: query.driver_id });
      }

      const wantsDriverDocs =
        query?.driver !== undefined && String(query.driver).trim() !== '';

      if (wantsCarrierDocs && wantsDriverDocs) {
        andFilters.push({
          OR: [{ carrier_id: { not: null } }, { driver_id: { not: null } }],
        });
      } else if (wantsCarrierDocs) {
        andFilters.push({ carrier_id: { not: null } });
      } else if (wantsDriverDocs) {
        andFilters.push({ driver_id: { not: null } });
      }

      if (query?.load_id) {
        andFilters.push({ load_id: query.load_id });
      }

      if (startDate) {
        andFilters.push({ created_at: { gte: startDate } });
      }

      if (endDate) {
        andFilters.push({ created_at: { lte: endDate } });
      }

      if (andFilters.length > 0) {
        where.AND = andFilters;
      }

      const total = await this.prisma.document.count({ where });

      const documents = await this.prisma.document.findMany({
        where,
        include: {
          carrier: {
            select: {
              id: true,
              legal_name: true,
              dba_name: true,
            },
          },
          driver: {
            select: {
              id: true,
              full_name: true,
            },
          },
          load: {
            select: {
              id: true,
              load_number: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      });

      const data = documents.map((document) => ({
        id: document.id,
        name: document.name,
        type: document.type,
        file: document.file,
        status: document.status,
        notes: document.notes,
        approved_at: document.approved_at,
        approved_by: document.approved_by,
        carrier_id: document.carrier_id,
        driver_id: document.driver_id,
        load_id: document.load_id,
        carrier: document.carrier,
        driver: document.driver,
        load: document.load,
        file_url: document.file
          ? SojebStorage.url(appConfig().storageUrl.websiteInfo + document.file)
          : null,
        created_at: document.created_at,
        updated_at: document.updated_at,
      }));

      return {
        success: true,
        message: 'Documents fetched successfully',
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
}
