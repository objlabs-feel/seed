-- AddForeignKey
ALTER TABLE "medical_device" ADD CONSTRAINT "medical_device_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
