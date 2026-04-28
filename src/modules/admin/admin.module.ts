import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { OrganizationAdminModule } from './organization-admin/organization-admin.module';
import { DispatcherModule } from './dispatcher/dispatcher.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [UserModule, NotificationModule, OrganizationAdminModule, DispatcherModule, DocumentModule],
})
export class AdminModule {}
