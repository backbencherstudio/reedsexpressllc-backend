import { Injectable } from '@nestjs/common';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import appConfig from '../../../config/app.config';
import { SojebStorage } from '../../../common/lib/Disk/SojebStorage';
import { StringHelper } from '../../../common/helper/string.helper';
import { CreateCarrierDocumentsFormDto } from './dto/create-carrier-documents-form.dto';

@Injectable()
export class CarrierService {
  constructor(private prisma: PrismaService) {}

  async create(
    requesterUserId: string,
    createCarrierDto: CreateCarrierDto,
    logo?: Express.Multer.File,
  ) {
    try {
      const {
        legal_name,
        dba_name,
        mc_number,
        dot_number,
        address,
        contact,
        email,
        pricing_plan_id,
      } = createCarrierDto as any;

      // validate requester
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

      // if requester is DISPATCHER, bind carrier to their dispatcher profile
      let dispatcherId: string | null = null;
      if (requester.type === 'DISPATCHER') {
        const dispatcher = await this.prisma.dispatcher.findFirst({
          where: { user_id: requesterUserId },
        });
        if (!dispatcher) {
          return {
            success: false,
            message: 'Dispatcher profile not found for requester',
          };
        }
        dispatcherId = dispatcher.id;
      }

      const data: any = {
        legal_name,
        dba_name: dba_name ?? null,
        mc_number: mc_number ?? null,
        dot_number: dot_number ?? null,
        address: address ?? null,
        contact: contact ?? null,
        email: email ?? null,
        logo: null,
        pricing_plan_id: pricing_plan_id ?? null,
      };

      // handle logo file upload (same pattern as organization-admin)
      if (logo && logo.buffer) {
        const logoFileName = `${StringHelper.randomString()}${logo.originalname}`;
        await SojebStorage.put(
          appConfig().storageUrl.logo + logoFileName,
          logo.buffer,
        );
        data.logo = logoFileName;
      }

      // ensure dispatcher_id is set when requester is dispatcher
      if (dispatcherId) {
        data.dispatcher_id = dispatcherId;
      }

      const created = await this.prisma.carrier.create({
        data,
      });

      return {
        success: true,
        message: 'Carrier created successfully',
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
          legal_name: { contains: search, mode: 'insensitive' },
        });
      }

      // scope: DISPATCHER sees only their own carriers, ADMIN/SUPERADMIN see all
      if (requester.type === 'DISPATCHER') {
        const dispatcher = await this.prisma.dispatcher.findFirst({
          where: { user_id: requesterUserId },
        });
        if (!dispatcher) {
          return {
            success: false,
            message: 'Dispatcher profile not found for requester',
          };
        }
        where.dispatcher_id = dispatcher.id;
      }

      const total = await this.prisma.carrier.count({ where });

      const carriers = await this.prisma.carrier.findMany({
        where,
        include: {
          pricing_plan: {
            select: {
              id: true,
              plan_name: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      });

      const results = carriers.map((c) => {
        const record: any = {
          id: c.id,
          legal_name: c.legal_name,
          dba_name: c.dba_name,
          mc_number: c.mc_number,
          dot_number: c.dot_number,
          address: c.address,
          contact: c.contact,
          email: c.email,
          logo: c.logo,
          dispatcher_id: c.dispatcher_id,
          pricing_plan_id: c.pricing_plan_id,
          pricing_plan: c.pricing_plan,
          created_at: c.created_at,
          updated_at: c.updated_at,
        };
        if (c.logo) {
          record.logo_url = SojebStorage.url(
            appConfig().storageUrl.logo + c.logo,
          );
        }
        return record;
      });

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

  async findOne(requesterUserId: string, carrierId: string) {
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
        where: { id: carrierId },
        include: {
          documents: {
            where: { deleted_at: null },
            orderBy: { created_at: 'desc' },
          },
          pricing_plan: {
            select: {
              id: true,
              plan_name: true,
            },
          },
        },
      });

      if (!carrier) {
        return { success: false, message: 'Carrier not found' };
      }

      // scope check: DISPATCHER can only view their own carriers
      if (requester.type === 'DISPATCHER') {
        const dispatcher = await this.prisma.dispatcher.findFirst({
          where: { user_id: requesterUserId },
        });
        if (!dispatcher || carrier.dispatcher_id !== dispatcher.id) {
          return {
            success: false,
            message: 'You can only view your own carriers',
          };
        }
      }

      // map documents with file URLs
      const documents = carrier.documents.map((doc: any) => {
        const docRecord: any = {
          id: doc.id,
          name: doc.name,
          type: doc.type,
          status: doc.status,
          notes: doc.notes,
          approved_at: doc.approved_at,
          approved_by: doc.approved_by,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
        };
        if (doc.file) {
          docRecord.file_url = SojebStorage.url(
            appConfig().storageUrl.websiteInfo + doc.file,
          );
        }
        return docRecord;
      });

      const record: any = {
        id: carrier.id,
        legal_name: carrier.legal_name,
        dba_name: carrier.dba_name,
        mc_number: carrier.mc_number,
        dot_number: carrier.dot_number,
        address: carrier.address,
        contact: carrier.contact,
        email: carrier.email,
        logo: carrier.logo,
        dispatcher_id: carrier.dispatcher_id,
        pricing_plan_id: carrier.pricing_plan_id,
        pricing_plan: carrier.pricing_plan,
        documents,
        created_at: carrier.created_at,
        updated_at: carrier.updated_at,
      };

      if (carrier.logo) {
        record.logo_url = SojebStorage.url(
          appConfig().storageUrl.logo + carrier.logo,
        );
      }

      return { success: true, data: record };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async submitDocuments(
    requesterUserId: string,
    carrierId: string,
    files: Express.Multer.File[],
    body?: CreateCarrierDocumentsFormDto,
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

      const carrier = await this.prisma.carrier.findUnique({
        where: { id: carrierId },
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
            message: 'You can only upload documents for your own carriers',
          };
        }
      }

      if (!files || files.length === 0) {
        return { success: false, message: 'No files uploaded' };
      }

      // Parse metadata array from JSON string
      let metadataArray: Array<{
        type?: string;
        name?: string;
        notes?: string;
      }> = [];
      if (body?.metadata) {
        try {
          const parsed = JSON.parse(body.metadata as string);
          if (Array.isArray(parsed)) {
            metadataArray = parsed;
          }
        } catch (e) {
          // ignore parse errors, metadata remains empty
        }
      }

      // Validate: if metadata provided, must have same length as files
      if (
        body?.metadata &&
        metadataArray.length > 0 &&
        metadataArray.length !== files.length
      ) {
        return {
          success: false,
          message: `Metadata array length (${metadataArray.length}) must match files count (${files.length})`,
        };
      }

      const uploaded: Array<{
        filename: string;
        originalname: string;
        meta?: { type?: string; name?: string; notes?: string };
      }> = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const filename = `${StringHelper.randomString()}${f.originalname}`;
        await SojebStorage.put(
          appConfig().storageUrl.document + filename,
          f.buffer,
        );
        // Get per-file metadata from array, or undefined if index doesn't exist
        const fileMeta = metadataArray[i];
        uploaded.push({
          filename,
          originalname: f.originalname,
          meta: fileMeta,
        });
      }

      const creates = uploaded.map((u) =>
        this.prisma.document.create({
          data: {
            name: (u.meta && u.meta.name) ?? u.originalname,
            type: (u.meta && u.meta.type) ?? null,
            notes: (u.meta && u.meta.notes) ?? null,
            file: u.filename,
            carrier_id: carrierId,
          },
        }),
      );

      const created = await this.prisma.$transaction(creates);

      const resp = created.map((d) => ({
        id: d.id,
        name: d.name,
        file: d.file,
        file_url: d.file
          ? SojebStorage.url(appConfig().storageUrl.document + d.file)
          : null,
        status: d.status,
        created_at: d.created_at,
      }));

      return {
        success: true,
        message: 'Documents uploaded successfully',
        data: resp,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  update(id: number, updateCarrierDto: UpdateCarrierDto) {
    return `This action updates a #${id} carrier`;
  }

  remove(id: number) {
    return `This action removes a #${id} carrier`;
  }
}
