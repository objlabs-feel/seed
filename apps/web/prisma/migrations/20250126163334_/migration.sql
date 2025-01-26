/*
  Warnings:

  - You are about to drop the column `department` on the `medical_device` table. All the data in the column will be lost.
  - You are about to drop the column `device_type` on the `medical_device` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "medical_device_department_device_type_manufacturer_id_manufactu";

-- AlterTable
ALTER TABLE "auction_item" ADD COLUMN     "quantity" SMALLINT DEFAULT 0,
ALTER COLUMN "auction_code" SET DATA TYPE VARCHAR(12);

-- AlterTable
ALTER TABLE "company" ADD COLUMN     "area" VARCHAR(10),
ALTER COLUMN "owner_id" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "medical_device" DROP COLUMN "department",
DROP COLUMN "device_type",
ADD COLUMN     "department_id" SMALLINT DEFAULT 0,
ADD COLUMN     "device_type_id" SMALLINT DEFAULT 0,
ADD COLUMN     "manufacture_year" INTEGER;

-- CreateIndex
CREATE INDEX "medical_device_department_device_type_manufacturer_id_manufactu" ON "medical_device"("department_id", "device_type_id", "manufacturer_id", "manufacture_date");

-- AddForeignKey
ALTER TABLE "medical_device" ADD CONSTRAINT "medical_device_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_device" ADD CONSTRAINT "medical_device_device_type_id_fkey" FOREIGN KEY ("device_type_id") REFERENCES "device_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_device" ADD CONSTRAINT "medical_device_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
