import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationAdminService } from './organization-admin.service';

describe('OrganizationAdminService', () => {
  let service: OrganizationAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationAdminService],
    }).compile();

    service = module.get<OrganizationAdminService>(OrganizationAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
