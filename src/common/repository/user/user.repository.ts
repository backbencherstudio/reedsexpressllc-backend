import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaClient, UserType, UserStatus } from '@prisma/client';
import appConfig from '../../../config/app.config';
import { ArrayHelper } from '../../helper/array.helper';
import { Role } from '../../guard/role/role.enum';

const prisma = new PrismaClient();

export class UserRepository {
  /**
   * get user by email
   * @param email
   * @returns
   */
  static async getUserByEmail(email: string) {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        deleted_at: null,
      },
      include: {
        admin: true,
        dispatcher: true,
        driver: true,
      },
    });
    return user;
  }

  /**
   * email verification
   * @param email
   * @returns
   */
  static async verifyEmail({ email }: { email: string }) {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        deleted_at: null,
      },
      include: {
        admin: true,
        dispatcher: true,
        driver: true,
      },
    });
    return user;
  }

  /**
   * get user details
   * @returns
   */
  static async getUserDetails(userId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deleted_at: null,
      },
      include: {
        admin: true,
        dispatcher: true,
        driver: true,
      },
    });
    return user;
  }

  /**
   * Check existence
   * @returns
   */
  static async exist({ field, value }: { field: string; value: any }) {
    const model = await prisma.user.findFirst({
      where: {
        [field]: value,
        deleted_at: null,
      },
    });
    return model;
  }

  /**
   * Create super admin user
   * @param param0
   * @returns
   */
  static async createSuAdminUser({ username, email, password }) {
    try {
      password = await bcrypt.hash(password, appConfig().security.salt);

      const user = await prisma.user.create({
        data: {
          username: username,
          email: email,
          password: password,
          type: UserType.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
          approved_at: new Date(),
          email_verified_at: new Date(),
        },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Invite user under tenant
   * @param param0
   * @returns
   */
  static async inviteUser({
    username,
    email,
  }: {
    username?: string;
    email: string;
  }) {
    try {
      // Check if email already exist
      const userExists = await UserRepository.exist({
        field: 'email',
        value: email,
      });

      if (userExists) {
        return {
          success: false,
          message: 'Email already exists',
        };
      }

      // Generate username from email if not provided
      const finalUsername = username || email.split('@')[0];

      const user = await prisma.user.create({
        data: {
          username: finalUsername,
          email: email,
          status: UserStatus.PENDING,
        },
        include: {
          admin: true,
          dispatcher: true,
          driver: true,
        },
      });

      if (user) {
        return {
          success: true,
          message: 'User invited successfully',
          data: user,
        };
      } else {
        return {
          success: false,
          message: 'User invitation failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * create user
   * @param param0
   * @returns
   */
  static async createUser({
    username,
    email,
    password,
    phone_number,
    avatar,
    date_of_birth,
    type = UserType.DRIVER,
    status = UserStatus.PENDING,
  }: {
    username?: string;
    email: string;
    password: string;
    phone_number?: string;
    avatar?: string;
    date_of_birth?: Date;
    type?: UserType;
    status?: UserStatus;
  }) {
    try {
      const data: any = {};

      if (phone_number) {
        data['phone_number'] = phone_number;
      }
      if (avatar) {
        data['avatar'] = avatar;
      }
      if (date_of_birth) {
        data['date_of_birth'] = date_of_birth;
      }
      if (email) {
        // Check if email already exist
        const userEmailExist = await UserRepository.exist({
          field: 'email',
          value: String(email),
        });

        if (userEmailExist) {
          return {
            success: false,
            message: 'Email already exist',
          };
        }

        data['email'] = email;
      }

      // Generate username from email if not provided
      const finalUsername = username || email.split('@')[0];
      data['username'] = finalUsername;

      if (password) {
        data['password'] = await bcrypt.hash(
          password,
          appConfig().security.salt,
        );
      }

      // Validate type against UserType enum
      if (type && Object.values(UserType).includes(type)) {
        data['type'] = type;
      } else {
        return {
          success: false,
          message: 'Invalid user type',
        };
      }

      data['status'] = status;

      const user = await prisma.user.create({
        data: {
          ...data,
        },
        include: {
          admin: true,
          dispatcher: true,
          driver: true,
        },
      });

      if (user) {
        return {
          success: true,
          message: 'User created successfully',
          data: user,
        };
      } else {
        return {
          success: false,
          message: 'User creation failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * update user
   * @param param0
   * @returns
   */
  static async updateUser(
    user_id: string,
    {
      email,
      password,
      phone_number,
      avatar,
      date_of_birth,
      type,
      status,
    }: {
      email?: string;
      password?: string;
      phone_number?: string;
      avatar?: string;
      date_of_birth?: Date;
      type?: UserType;
      status?: UserStatus;
    },
  ) {
    try {
      const data: any = {};

      if (email) {
        // Check if email already exist
        const userEmailExist = await UserRepository.exist({
          field: 'email',
          value: String(email),
        });

        if (userEmailExist && userEmailExist.id !== user_id) {
          return {
            success: false,
            message: 'Email already exist',
          };
        }
        data['email'] = email;
      }
      if (password) {
        data['password'] = await bcrypt.hash(
          password,
          appConfig().security.salt,
        );
      }
      if (phone_number) {
        data['phone_number'] = phone_number;
      }
      if (avatar) {
        data['avatar'] = avatar;
      }
      if (date_of_birth) {
        data['date_of_birth'] = date_of_birth;
      }

      if (type && Object.values(UserType).includes(type)) {
        data['type'] = type;
      } else if (type) {
        return {
          success: false,
          message: 'Invalid user type',
        };
      }

      if (status && Object.values(UserStatus).includes(status)) {
        data['status'] = status;
      } else if (status) {
        return {
          success: false,
          message: 'Invalid user status',
        };
      }

      const existUser = await prisma.user.findFirst({
        where: {
          id: user_id,
          deleted_at: null,
        },
      });

      if (!existUser) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const user = await prisma.user.update({
        where: {
          id: user_id,
        },
        data: {
          ...data,
        },
        include: {
          admin: true,
          dispatcher: true,
          driver: true,
        },
      });

      if (user) {
        return {
          success: true,
          message: 'User updated successfully',
          data: user,
        };
      } else {
        return {
          success: false,
          message: 'User update failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * soft delete user
   * @param param0
   * @returns
   */
  static async deleteUser(user_id: string) {
    try {
      // check if user exist
      const existUser = await prisma.user.findFirst({
        where: {
          id: user_id,
          deleted_at: null,
        },
      });
      if (!existUser) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      await prisma.user.update({
        where: {
          id: user_id,
        },
        data: {
          deleted_at: new Date(),
        },
      });
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // change password
  static async changePassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    try {
      const hashedPassword = await bcrypt.hash(
        password,
        appConfig().security.salt,
      );
      const user = await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          password: hashedPassword,
          email_verified_at: new Date(),
        },
      });
      return {
        success: true,
        message: 'Password changed successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // change email
  static async changeEmail({
    user_id,
    new_email,
  }: {
    user_id: string;
    new_email: string;
  }) {
    try {
      // Check if email already exist
      const emailExists = await UserRepository.exist({
        field: 'email',
        value: new_email,
      });

      if (emailExists) {
        return {
          success: false,
          message: 'Email already in use',
        };
      }

      const user = await prisma.user.update({
        where: {
          id: user_id,
        },
        data: {
          email: new_email,
          email_verified_at: null, // Reset verification
        },
      });
      return {
        success: true,
        message: 'Email changed successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // validate password
  static async validatePassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      return isValid;
    } else {
      return false;
    }
  }

  // convert user type
  static async convertTo(user_id: string, type: UserType = UserType.DRIVER) {
    try {
      const userDetails = await UserRepository.getUserDetails(user_id);
      if (!userDetails) {
        return {
          success: false,
          message: 'User not found',
        };
      }
      if (!Object.values(UserType).includes(type)) {
        return {
          success: false,
          message: 'Invalid user type',
        };
      }
      await prisma.user.update({
        where: { id: user_id },
        data: { type: type },
      });

      return {
        success: true,
        message: `Converted to ${type} successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // generate two factor secret
  static async generate2FASecret(user_id: string) {
    try {
      const user = await prisma.user.findFirst({
        where: { id: user_id, deleted_at: null },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const secret = speakeasy.generateSecret();
      await prisma.user.update({
        where: { id: user_id },
        data: { two_factor_secret: secret.base32 },
      });

      const otpAuthUrl = secret.otpauth_url;
      const qrCode = await QRCode.toDataURL(otpAuthUrl);

      return {
        success: true,
        message: '2FA secret generated successfully',
        data: {
          secret: secret.base32,
          qrCode: qrCode,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // verify two factor
  static async verify2FA(user_id: string, token: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!user || !user.two_factor_secret) return false;

      const isValid = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token,
      });

      return isValid;
    } catch (error) {
      return false;
    }
  }

  // enable two factor
  static async enable2FA(user_id: string) {
    try {
      const user = await prisma.user.update({
        where: { id: user_id },
        data: { is_two_factor_enabled: 1 },
      });
      return {
        success: true,
        message: '2FA enabled successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // disable two factor
  static async disable2FA(user_id: string) {
    try {
      const user = await prisma.user.update({
        where: { id: user_id },
        data: { is_two_factor_enabled: 0, two_factor_secret: null },
      });
      return {
        success: true,
        message: '2FA disabled successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
