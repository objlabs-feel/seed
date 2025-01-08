-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "password" VARCHAR(128) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "admin_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_item" (
    "id" BIGSERIAL NOT NULL,
    "medical_device_id" BIGINT NOT NULL,
    "auction_code" VARCHAR(10) NOT NULL,
    "status" SMALLINT DEFAULT 0,
    "start_timestamp" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    "expired_count" SMALLINT DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "auction_item_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_item_history" (
    "id" BIGSERIAL NOT NULL,
    "auction_item_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "value" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "action_item_history_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(40),
    "business_no" VARCHAR(15),
    "business_tel" VARCHAR(16),
    "license_img" VARCHAR(200),
    "owner_id" INTEGER,
    "related_members" JSON DEFAULT '[]',
    "institute_members" JSON DEFAULT '[]',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    "company_type" INTEGER DEFAULT 0,
    "business_mobile" VARCHAR(15),
    "secret_info" JSON DEFAULT '{"bankAccount": "", "bankCode": "", "ownerName": "", "businessEmail": "", "businessNo": "", "businessTel": "", "businessMobile": ""}',
    "zipcode" VARCHAR(15),
    "address" VARCHAR(100),
    "adddress_detail" VARCHAR(50),

    CONSTRAINT "company_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_type" (
    "id" SMALLSERIAL NOT NULL,
    "code" VARCHAR(2) DEFAULT 'BB',
    "name" VARCHAR(30) NOT NULL,
    "description" VARCHAR(100),
    "img" VARCHAR(200),
    "department_id" SMALLINT,

    CONSTRAINT "device_type_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" SMALLINT NOT NULL,
    "code" VARCHAR(2) DEFAULT 'AA',
    "name" VARCHAR(30),
    "img" VARCHAR(200),
    "description" VARCHAR(100),

    CONSTRAINT "department_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturer" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50),
    "device_types" JSON DEFAULT '[]',
    "img" VARCHAR(200),
    "description" VARCHAR(100),

    CONSTRAINT "manufacturer_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_device" (
    "id" BIGSERIAL NOT NULL,
    "company_id" INTEGER,
    "department" SMALLINT DEFAULT 0,
    "device_type" SMALLINT DEFAULT 0,
    "manufacturer_id" INTEGER,
    "manufacture_date" DATE,
    "images" JSON DEFAULT '[]',
    "description" VARCHAR(200),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "medical_device_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_info" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "device_type" INTEGER NOT NULL DEFAULT 0,
    "device_os" INTEGER NOT NULL DEFAULT 0,
    "device_token" VARCHAR(150) NOT NULL,
    "permission_status" INTEGER,
    "noti_notice" SMALLINT DEFAULT 1,
    "noti_event" SMALLINT DEFAULT 0,
    "noti_sms" SMALLINT DEFAULT 0,
    "noti_email" SMALLINT DEFAULT 0,
    "noti_auction" SMALLINT DEFAULT 0,
    "noti_favorite" SMALLINT DEFAULT 0,
    "noti_set" JSON DEFAULT '{}',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "notification_info_pk" PRIMARY KEY ("user_id","device_type","device_os","device_token")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER,
    "profile_type" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    "name" VARCHAR(40),
    "mobile" VARCHAR(16),
    "email" VARCHAR(100),

    CONSTRAINT "profile_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "device_token" VARCHAR(120) NOT NULL,
    "profile_id" INTEGER,
    "status" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT "user_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_id" ON "admin"("username");

-- CreateIndex
CREATE INDEX "auction_items_index" ON "auction_item"("auction_code", "status", "start_timestamp", "expired_count", "updated_at");

-- CreateIndex
CREATE INDEX "action_item_history_auction_id_user_id_value_index" ON "auction_item_history"("auction_item_id", "user_id", "value");

-- CreateIndex
CREATE UNIQUE INDEX "unique_no" ON "company"("business_no");

-- CreateIndex
CREATE INDEX "company_company_type_index" ON "company"("company_type");

-- CreateIndex
CREATE INDEX "company_id_index" ON "company"("id");

-- CreateIndex
CREATE INDEX "company_name_business_no_business_tel_index" ON "company"("name", "business_no", "business_tel");

-- CreateIndex
CREATE INDEX "company_owner_id_index" ON "company"("owner_id");

-- CreateIndex
CREATE INDEX "device_type_id_code_name_department_id_index" ON "device_type"("id", "code", "name", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_type_pk_2" ON "device_type"("department_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_key" ON "department"("code");

-- CreateIndex
CREATE INDEX "department_id_code_name_index" ON "department"("id", "code", "name");

-- CreateIndex
CREATE INDEX "manufacturer_id_name_index" ON "manufacturer"("id", "name");

-- CreateIndex
CREATE INDEX "medical_device_company_id_index" ON "medical_device"("company_id");

-- CreateIndex
CREATE INDEX "medical_device_department_device_type_manufacturer_id_manufactu" ON "medical_device"("department", "device_type", "manufacturer_id", "manufacture_date");

-- CreateIndex
CREATE INDEX "notification_info_index" ON "notification_info"("user_id", "permission_status", "noti_notice", "noti_event", "noti_sms", "noti_email", "noti_auction", "noti_favorite");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_id_key" ON "user"("profile_id");

-- CreateIndex
CREATE INDEX "user_device_token_index" ON "user"("device_token");

-- CreateIndex
CREATE INDEX "user_id_index" ON "user"("id");

-- CreateIndex
CREATE INDEX "user_profile_id_index" ON "user"("profile_id");

-- AddForeignKey
ALTER TABLE "auction_item" ADD CONSTRAINT "auction_item_medical_device_id_fkey" FOREIGN KEY ("medical_device_id") REFERENCES "medical_device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_item_history" ADD CONSTRAINT "auction_item_history_auction_item_id_fkey" FOREIGN KEY ("auction_item_id") REFERENCES "auction_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_type" ADD CONSTRAINT "device_type_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
