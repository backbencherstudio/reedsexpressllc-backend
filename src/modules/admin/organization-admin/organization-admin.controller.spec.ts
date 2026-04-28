import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationAdminController } from './organization-admin.controller';
import { OrganizationAdminService } from './organization-admin.service';

describe('OrganizationAdminController', () => {
  let controller: OrganizationAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationAdminController],
      providers: [OrganizationAdminService],
    }).compile();

    controller = module.get<OrganizationAdminController>(
      OrganizationAdminController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
