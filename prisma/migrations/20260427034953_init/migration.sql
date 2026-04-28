/*
  Warnings:

  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `availability` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `billing_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `zip_code` on the `users` table. All the data in the column will be lost.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_PermissionToRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permission_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `social_medias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_payment_methods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `website_infos` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `status` on table `messages` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DISPATCHER', 'DRIVER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LoadStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_B_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_transactions" DROP CONSTRAINT "payment_transactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "permission_roles" DROP CONSTRAINT "permission_roles_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "permission_roles" DROP CONSTRAINT "permission_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "role_users" DROP CONSTRAINT "role_users_role_id_fkey";

-- DropForeignKey
ALTER TABLE "role_users" DROP CONSTRAINT "role_users_user_id_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_payment_methods" DROP CONSTRAINT "user_payment_methods_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_settings" DROP CONSTRAINT "user_settings_setting_id_fkey";

-- DropForeignKey
ALTER TABLE "user_settings" DROP CONSTRAINT "user_settings_user_id_fkey";

-- DropIndex
DROP INDEX "users_domain_key";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "attachments" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "contacts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "conversations" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "faqs" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "status" SET NOT NULL;

-- AlterTable
ALTER TABLE "notification_events" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "entity_type" TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ucodes" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "address",
DROP COLUMN "availability",
DROP COLUMN "billing_id",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "domain",
DROP COLUMN "first_name",
DROP COLUMN "gender",
DROP COLUMN "last_name",
DROP COLUMN "name",
DROP COLUMN "state",
DROP COLUMN "username",
DROP COLUMN "zip_code",
ALTER COLUMN "updated_at" DROP DEFAULT,
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "type",
ADD COLUMN     "type" "UserType" NOT NULL DEFAULT 'DRIVER';

-- DropTable
DROP TABLE "_PermissionToRole";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "payment_transactions";

-- DropTable
DROP TABLE "permission_roles";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "role_users";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "settings";

-- DropTable
DROP TABLE "social_medias";

-- DropTable
DROP TABLE "user_payment_methods";

-- DropTable
DROP TABLE "user_settings";

-- DropTable
DROP TABLE "website_infos";

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "company_name" TEXT NOT NULL,
    "business_address" TEXT,
    "admin_name" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatchers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "full_name" TEXT NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    "user_id" TEXT NOT NULL,
    "admin_id" TEXT,

    CONSTRAINT "dispatchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "legal_name" TEXT NOT NULL,
    "dba_name" TEXT,
    "mc_number" TEXT,
    "dot_number" TEXT,
    "address" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "logo" TEXT,
    "dispatcher_id" TEXT,
    "pricing_plan_id" TEXT,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "full_name" TEXT NOT NULL,
    "contact" TEXT,
    "license_no" TEXT,
    "address" TEXT,
    "user_id" TEXT NOT NULL,
    "carrier_id" TEXT,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trucks" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "carrier_id" TEXT,
    "license_plate" TEXT NOT NULL,
    "truck_type" TEXT,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "vin" TEXT,
    "unit_number" TEXT,

    CONSTRAINT "trucks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trailers" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "carrier_id" TEXT,
    "trailer_type" TEXT,
    "model" TEXT,
    "plate_number" TEXT,
    "plate_state" TEXT,
    "unit_number" TEXT,

    CONSTRAINT "trailers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "name" TEXT,
    "type" TEXT,
    "file" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "carrier_id" TEXT,
    "driver_id" TEXT,
    "load_id" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loads" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "load_number" TEXT NOT NULL,
    "rate_confirmation" TEXT,
    "carrier_id" TEXT NOT NULL,
    "broker_name" TEXT,
    "broker_reference_no" TEXT,
    "broker_email" TEXT,
    "broker_phone" TEXT,
    "pickup_company" TEXT NOT NULL,
    "pickup_date" TIMESTAMP(3) NOT NULL,
    "pickup_time" TEXT,
    "pickup_address" TEXT NOT NULL,
    "delivery_company" TEXT NOT NULL,
    "delivery_date" TIMESTAMP(3) NOT NULL,
    "delivery_time" TEXT,
    "delivery_address" TEXT NOT NULL,
    "dispatcher_id" TEXT NOT NULL,
    "driver_id" TEXT,
    "truck_id" TEXT,
    "trailer_id" TEXT,
    "rate_per_mile" DOUBLE PRECISION,
    "total_miles" INTEGER,
    "deadhead_miles" INTEGER DEFAULT 0,
    "loaded_miles" INTEGER DEFAULT 0,
    "total_rate" DOUBLE PRECISION,
    "commodity" TEXT,
    "weight" DOUBLE PRECISION,
    "additional_notes" TEXT,
    "status" "LoadStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "loads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "invoice_number" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "carrier_id" TEXT,
    "selected_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dispatch_fee_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dispatch_fee_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_due" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amount" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "notes_terms" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_loads" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoice_id" TEXT NOT NULL,
    "load_id" TEXT NOT NULL,
    "load_revenue_snapshot" DOUBLE PRECISION,

    CONSTRAINT "invoice_loads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_statements" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "statement_number" TEXT,
    "title" TEXT DEFAULT 'General Statement',
    "carrier_id" TEXT,
    "driver_id" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "total_revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_loads" INTEGER NOT NULL DEFAULT 0,
    "total_miles" INTEGER DEFAULT 0,
    "loaded_miles" INTEGER DEFAULT 0,
    "deadhead_miles" INTEGER DEFAULT 0,
    "avg_rate_per_mile" DOUBLE PRECISION DEFAULT 0,
    "dispatch_fee_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dispatch_fee_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "net_to_carrier" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "report_file" TEXT,
    "notes" TEXT,

    CONSTRAINT "financial_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_statement_loads" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "financial_statement_id" TEXT NOT NULL,
    "load_id" TEXT NOT NULL,
    "rate_snapshot" DOUBLE PRECISION,
    "loaded_miles_snapshot" INTEGER,
    "deadhead_miles_snapshot" INTEGER,
    "route_snapshot" TEXT,

    CONSTRAINT "financial_statement_loads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_plans" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "plan_name" TEXT NOT NULL,
    "description" TEXT,
    "dispatcher_fee" DECIMAL(5,2),
    "use_default_dispatcher_fee" BOOLEAN NOT NULL DEFAULT true,
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "billing_day" "Weekday",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "admin_id" TEXT,

    CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_features" (
    "id" TEXT NOT NULL,
    "pricing_plan_id" TEXT NOT NULL,
    "feature_id" TEXT NOT NULL,

    CONSTRAINT "plan_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_user_id_key" ON "admins"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dispatchers_user_id_key" ON "dispatchers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_user_id_key" ON "drivers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "loads_load_number_key" ON "loads"("load_number");

-- CreateIndex
CREATE INDEX "loads_load_number_idx" ON "loads"("load_number");

-- CreateIndex
CREATE INDEX "loads_carrier_id_idx" ON "loads"("carrier_id");

-- CreateIndex
CREATE INDEX "loads_dispatcher_id_idx" ON "loads"("dispatcher_id");

-- CreateIndex
CREATE INDEX "loads_driver_id_idx" ON "loads"("driver_id");

-- CreateIndex
CREATE INDEX "loads_status_idx" ON "loads"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_idx" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_carrier_id_idx" ON "invoices"("carrier_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_start_date_idx" ON "invoices"("start_date");

-- CreateIndex
CREATE INDEX "invoices_end_date_idx" ON "invoices"("end_date");

-- CreateIndex
CREATE INDEX "invoice_loads_invoice_id_idx" ON "invoice_loads"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_loads_load_id_idx" ON "invoice_loads"("load_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_loads_invoice_id_load_id_key" ON "invoice_loads"("invoice_id", "load_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_statements_statement_number_key" ON "financial_statements"("statement_number");

-- CreateIndex
CREATE INDEX "financial_statements_carrier_id_idx" ON "financial_statements"("carrier_id");

-- CreateIndex
CREATE INDEX "financial_statements_driver_id_idx" ON "financial_statements"("driver_id");

-- CreateIndex
CREATE INDEX "financial_statements_start_date_idx" ON "financial_statements"("start_date");

-- CreateIndex
CREATE INDEX "financial_statements_end_date_idx" ON "financial_statements"("end_date");

-- CreateIndex
CREATE INDEX "financial_statement_loads_financial_statement_id_idx" ON "financial_statement_loads"("financial_statement_id");

-- CreateIndex
CREATE INDEX "financial_statement_loads_load_id_idx" ON "financial_statement_loads"("load_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_statement_loads_financial_statement_id_load_id_key" ON "financial_statement_loads"("financial_statement_id", "load_id");

-- CreateIndex
CREATE INDEX "pricing_plans_admin_id_idx" ON "pricing_plans"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_admin_id_plan_name_key" ON "pricing_plans"("admin_id", "plan_name");

-- CreateIndex
CREATE UNIQUE INDEX "plan_features_pricing_plan_id_feature_id_key" ON "plan_features"("pricing_plan_id", "feature_id");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatchers" ADD CONSTRAINT "dispatchers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatchers" ADD CONSTRAINT "dispatchers_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carriers" ADD CONSTRAINT "carriers_dispatcher_id_fkey" FOREIGN KEY ("dispatcher_id") REFERENCES "dispatchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carriers" ADD CONSTRAINT "carriers_pricing_plan_id_fkey" FOREIGN KEY ("pricing_plan_id") REFERENCES "pricing_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trailers" ADD CONSTRAINT "trailers_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "loads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_dispatcher_id_fkey" FOREIGN KEY ("dispatcher_id") REFERENCES "dispatchers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "trucks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "trailers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_loads" ADD CONSTRAINT "invoice_loads_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_loads" ADD CONSTRAINT "invoice_loads_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "loads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_statements" ADD CONSTRAINT "financial_statements_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_statements" ADD CONSTRAINT "financial_statements_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_statement_loads" ADD CONSTRAINT "financial_statement_loads_financial_statement_id_fkey" FOREIGN KEY ("financial_statement_id") REFERENCES "financial_statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_statement_loads" ADD CONSTRAINT "financial_statement_loads_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "loads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_plans" ADD CONSTRAINT "pricing_plans_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_pricing_plan_id_fkey" FOREIGN KEY ("pricing_plan_id") REFERENCES "pricing_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
