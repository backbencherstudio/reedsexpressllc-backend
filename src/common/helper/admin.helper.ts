import * as bcrypt from 'bcrypt';
import { UserType, UserStatus } from '@prisma/client';
import appConfig from '../../config/app.config';
import { PrismaService } from '../../prisma/prisma.service';

export async function ensureSuperAdminExists(prisma: PrismaService) {
  const systemEmail = appConfig().defaultUser.system.email;
  const systemPassword = appConfig().defaultUser.system.password;

  if (!systemEmail || !systemPassword) {
    console.warn(
      '[bootstrap] SYSTEM_EMAIL or SYSTEM_PASSWORD missing; skipping super admin auto-create.',
    );
    return;
  }

  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ type: UserType.SUPER_ADMIN }, { email: systemEmail }],
    },
    select: {
      id: true,
    },
  });

  if (existingSuperAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(
    systemPassword,
    appConfig().security.salt,
  );

  await prisma.user.create({
    data: {
      email: systemEmail,
      password: hashedPassword,
      type: UserType.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      approved_at: new Date(),
      email_verified_at: new Date(),
    },
  });

  console.log('[bootstrap] Super admin created successfully.');
}
