import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserStatus, UserType } from '@prisma/client';
import appConfig from '../../../config/app.config';
import { PrismaService } from '../../../prisma/prisma.service';
import { SojebStorage } from '../../../common/lib/Disk/SojebStorage';
import { StringHelper } from '../../../common/helper/string.helper';
import { CreateOrganizationAdminDto } from './dto/create-organization-admin.dto';
import { UpdateOrganizationAdminDto } from './dto/update-organization-admin.dto';

@Injectable()
export class OrganizationAdminService {
  constructor(private prisma: PrismaService) {}

  async create(
    requesterUserId: string,
    createOrganizationAdminDto: CreateOrganizationAdminDto,
    logo?: Express.Multer.File,
  ) {
    try {
      if (!requesterUserId) {
        return {
          success: false,
          message: 'Unauthorized request',
        };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { id: true, type: true },
      });

      if (!requester || requester.type !== UserType.SUPER_ADMIN) {
        return {
          success: false,
          message: 'Only super admin can create organization admin',
        };
      }

      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email: createOrganizationAdminDto.email,
          deleted_at: null,
        },
        select: { id: true },
      });

      if (existingEmail) {
        return {
          success: false,
          message: 'Email already exists',
        };
      }

      const username =
        createOrganizationAdminDto.username ||
        createOrganizationAdminDto.email.split('@')[0];
      const hashedPassword = await bcrypt.hash(
        createOrganizationAdminDto.password,
        appConfig().security.salt,
      );

      const created = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username,
            email: createOrganizationAdminDto.email,
            password: hashedPassword,
            type: UserType.ADMIN,
            status: UserStatus.ACTIVE,
            approved_at: new Date(),
          },
        });

        // handle logo upload if provided
        let logoFileName: string | null = null;
        if (logo && logo.buffer) {
          logoFileName = `${StringHelper.randomString()}${logo.originalname}`;
          await SojebStorage.put(
            appConfig().storageUrl.websiteInfo + logoFileName,
            logo.buffer,
          );
        }

        const admin = await tx.admin.create({
          data: {
            user_id: user.id,
            company_name: createOrganizationAdminDto.company_name,
            business_address: createOrganizationAdminDto.business_address,
            admin_name: createOrganizationAdminDto.admin_name,
            website: createOrganizationAdminDto.website,
            logo: logoFileName,
          },
        });

        return { user, admin };
      });

      const dataResponse: any = {
        user_id: created.user.id,
        admin_id: created.admin.id,
        email: created.user.email,
        username: created.user.username,
        company_name: created.admin.company_name,
      };

      if (created.admin.logo) {
        dataResponse.logo_url = SojebStorage.url(
          appConfig().storageUrl.websiteInfo + created.admin.logo,
        );
      }

      return {
        success: true,
        message: 'Organization admin created successfully',
        data: dataResponse,
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

      if (!requester || requester.type !== UserType.SUPER_ADMIN) {
        return {
          success: false,
          message: 'Only super admin can list organization admins',
        };
      }

      const page = query && query.page ? Number(query.page) : 1;
      const limit = query ? Number(query.limit ?? 20) : 20;
      const search = query && query.search ? String(query.search).trim() : null;

      const where: any = { deleted_at: null };

      const orFilters: any[] = [];
      if (search) {
        orFilters.push({
          company_name: { contains: search, mode: 'insensitive' },
        });
        orFilters.push({
          admin_name: { contains: search, mode: 'insensitive' },
        });
        orFilters.push({
          user: { username: { contains: search, mode: 'insensitive' } },
        });
        orFilters.push({
          user: { email: { contains: search, mode: 'insensitive' } },
        });
      }

      if (query && query.company_name) {
        where.company_name = {
          contains: String(query.company_name),
          mode: 'insensitive',
        };
      }

      if (query && query.username) {
        where.user = {
          username: { contains: String(query.username), mode: 'insensitive' },
        };
      }

      if (query && query.email) {
        where.user = {
          ...(where.user || {}),
          email: { contains: String(query.email), mode: 'insensitive' },
        };
      }

      if (orFilters.length > 0) {
        where.AND = where.AND || [];
        where.AND.push({ OR: orFilters });
      }

      const total = await this.prisma.admin.count({ where });

      const admins = await this.prisma.admin.findMany({
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
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      });

      const results = admins.map((a) => {
        const record: any = {
          admin_id: a.id,
          company_name: a.company_name,
          business_address: a.business_address,
          admin_name: a.admin_name,
          website: a.website,
          created_at: a.created_at,
          updated_at: a.updated_at,
          user: a.user,
        };
        if (a.logo) {
          record.logo_url = SojebStorage.url(
            appConfig().storageUrl.websiteInfo + a.logo,
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

  async findOne(requesterUserId: string, adminId: string) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { id: true, type: true },
      });

      if (!requester || requester.type !== UserType.SUPER_ADMIN) {
        return {
          success: false,
          message: 'Only super admin can view organization admin',
        };
      }

      const a = await this.prisma.admin.findUnique({
        where: { id: adminId },
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
        },
      });

      if (!a) {
        return { success: false, message: 'Organization admin not found' };
      }

      const record: any = {
        admin_id: a.id,
        company_name: a.company_name,
        business_address: a.business_address,
        admin_name: a.admin_name,
        website: a.website,
        created_at: a.created_at,
        updated_at: a.updated_at,
        user: a.user,
      };
      if (a.logo) {
        record.logo_url = SojebStorage.url(
          appConfig().storageUrl.websiteInfo + a.logo,
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

  async update(
    requesterUserId: string,
    adminId: string,
    updateOrganizationAdminDto: UpdateOrganizationAdminDto,
    logo?: Express.Multer.File,
  ) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { id: true, type: true },
      });

      if (!requester || requester.type !== UserType.SUPER_ADMIN) {
        return {
          success: false,
          message: 'Only super admin can update organization admin',
        };
      }

      const existing = await this.prisma.admin.findUnique({
        where: { id: adminId },
        include: { user: true },
      });

      if (!existing) {
        return { success: false, message: 'Organization admin not found' };
      }

      // validate email uniqueness if changing
      if (
        updateOrganizationAdminDto.email &&
        updateOrganizationAdminDto.email !== existing.user.email
      ) {
        const emailExists = await this.prisma.user.findFirst({
          where: {
            email: updateOrganizationAdminDto.email,
            deleted_at: null,
          },
          select: { id: true },
        });

        if (emailExists) {
          return { success: false, message: 'Email already exists' };
        }
      }

      const userData: any = {};
      if (updateOrganizationAdminDto.username) {
        userData.username = updateOrganizationAdminDto.username;
      }
      if (updateOrganizationAdminDto.email) {
        userData.email = updateOrganizationAdminDto.email;
      }
      if (updateOrganizationAdminDto.password) {
        userData.password = await bcrypt.hash(
          updateOrganizationAdminDto.password,
          appConfig().security.salt,
        );
      }

      const adminData: any = {};
      if (updateOrganizationAdminDto.company_name) {
        adminData.company_name = updateOrganizationAdminDto.company_name;
      }
      if (updateOrganizationAdminDto.business_address) {
        adminData.business_address =
          updateOrganizationAdminDto.business_address;
      }
      if (updateOrganizationAdminDto.admin_name) {
        adminData.admin_name = updateOrganizationAdminDto.admin_name;
      }
      if (updateOrganizationAdminDto.website) {
        adminData.website = updateOrganizationAdminDto.website;
      }

      // handle logo replacement
      if (logo && logo.buffer) {
        // delete old logo if exists
        if (existing.logo) {
          try {
            await SojebStorage.delete(
              appConfig().storageUrl.websiteInfo + existing.logo,
            );
          } catch (e) {
            // ignore delete errors
          }
        }

        const fileName = `${StringHelper.randomString()}${logo.originalname}`;
        await SojebStorage.put(
          appConfig().storageUrl.websiteInfo + fileName,
          logo.buffer,
        );
        adminData.logo = fileName;
      }

      await this.prisma.$transaction(async (tx) => {
        if (Object.keys(userData).length > 0) {
          await tx.user.update({
            where: { id: existing.user_id },
            data: userData,
          });
        }

        if (Object.keys(adminData).length > 0) {
          await tx.admin.update({
            where: { id: adminId },
            data: adminData,
          });
        }
      });

      const updated = await this.prisma.admin.findUnique({
        where: { id: adminId },
        include: { user: true },
      });

      const resp: any = {
        admin_id: updated.id,
        company_name: updated.company_name,
        business_address: updated.business_address,
        admin_name: updated.admin_name,
        website: updated.website,
        user: updated.user,
      };
      if (updated.logo) {
        resp.logo_url = SojebStorage.url(
          appConfig().storageUrl.websiteInfo + updated.logo,
        );
      }

      return {
        success: true,
        message: 'Organization admin updated',
        data: resp,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async remove(requesterUserId: string, adminId: string) {
    try {
      if (!requesterUserId) {
        return { success: false, message: 'Unauthorized request' };
      }

      const requester = await this.prisma.user.findUnique({
        where: { id: requesterUserId },
        select: { id: true, type: true },
      });

      if (!requester || requester.type !== UserType.SUPER_ADMIN) {
        return {
          success: false,
          message: 'Only super admin can delete organization admin',
        };
      }

      const existing = await this.prisma.admin.findUnique({
        where: { id: adminId },
        include: { user: true },
      });

      if (!existing) {
        return { success: false, message: 'Organization admin not found' };
      }

      // delete logo from storage if exists
      if (existing.logo) {
        try {
          await SojebStorage.delete(
            appConfig().storageUrl.websiteInfo + existing.logo,
          );
        } catch (e) {
          // ignore
        }
      }

      const now = new Date();
      await this.prisma.$transaction(async (tx) => {
        await tx.admin.update({
          where: { id: adminId },
          data: { deleted_at: now },
        });

        await tx.user.update({
          where: { id: existing.user_id },
          data: { deleted_at: now },
        });
      });

      return { success: true, message: 'Organization admin deleted' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
