-- CreateTable
CREATE TABLE `business` (
    `business_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `trade_name` VARCHAR(150) NOT NULL,
    `legal_name` VARCHAR(200) NULL,
    `business_type` ENUM('pharmacy', 'supermarket', 'convenience_store', 'hardware_store', 'electronics_store', 'home_appliance_store', 'beauty_store', 'stationery_store') NOT NULL,
    `business_status` ENUM('active', 'temporarily_closed', 'suspended', 'retired', 'inactive') NOT NULL DEFAULT 'active',
    `description` TEXT NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(150) NULL,
    `tax_id` VARCHAR(30) NULL,
    `logo_url` VARCHAR(500) NULL,
    `logo_public_id` VARCHAR(255) NULL,
    `retired_at` DATETIME(0) NULL,
    `retirement_reason` TEXT NULL,
    `deleted_at` DATETIME(0) NULL,
    `deletion_reason` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_business_email`(`email`),
    UNIQUE INDEX `uq_business_tax_id`(`tax_id`),
    INDEX `idx_business_deleted_at`(`deleted_at`),
    INDEX `idx_business_status`(`business_status`),
    INDEX `idx_business_type`(`business_type`),
    PRIMARY KEY (`business_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_order` (
    `business_order_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `external_order_code` VARCHAR(64) NOT NULL,
    `business_id` INTEGER UNSIGNED NOT NULL,
    `external_customer_id` INTEGER UNSIGNED NOT NULL,
    `inventory_reservation_id` INTEGER UNSIGNED NULL,
    `external_payment_code` VARCHAR(64) NULL,
    `order_status` ENUM('pending_validation', 'reserved', 'confirmed', 'preparing', 'ready_for_pickup', 'dispatched', 'delivered', 'cancelled_by_customer', 'cancelled_by_business', 'cancelled_by_system') NOT NULL DEFAULT 'pending_validation',
    `financial_status_snapshot` ENUM('pending', 'approved', 'denied', 'cancelled', 'partially_refunded', 'refunded') NOT NULL DEFAULT 'pending',
    `base_subtotal_snapshot` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_discount_amount_snapshot` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `service_fee_amount_snapshot` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `tip_amount_snapshot` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_paid_amount_snapshot` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `currency` CHAR(3) NOT NULL DEFAULT 'gtq',
    `payment_approved_at` DATETIME(0) NULL,
    `cancelled_by` ENUM('customer', 'business', 'system') NULL,
    `cancellation_reason` TEXT NULL,
    `penalty_applied` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `penalty_type_snapshot` ENUM('fixed_amount', 'percentage') NULL,
    `penalty_value_snapshot` DECIMAL(10, 2) NULL,
    `penalty_amount_snapshot` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_business_order_external_code`(`external_order_code`),
    INDEX `fk_business_order_reservation`(`inventory_reservation_id`),
    INDEX `idx_business_order_business`(`business_id`),
    INDEX `idx_business_order_created_at`(`created_at`),
    INDEX `idx_business_order_ext_customer`(`external_customer_id`),
    INDEX `idx_business_order_fin_status`(`financial_status_snapshot`),
    INDEX `idx_business_order_status`(`order_status`),
    PRIMARY KEY (`business_order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_order_delivery` (
    `business_order_delivery_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_order_id` INTEGER UNSIGNED NOT NULL,
    `delivery_type` ENUM('home_delivery', 'pickup') NOT NULL DEFAULT 'home_delivery',
    `delivery_status` ENUM('pending_assignment', 'courier_assigned', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'delivery_failed', 'cancelled') NOT NULL DEFAULT 'pending_assignment',
    `external_courier_id` INTEGER UNSIGNED NULL,
    `recipient_name_snapshot` VARCHAR(150) NULL,
    `recipient_phone_snapshot` VARCHAR(20) NULL,
    `delivery_address_snapshot` TEXT NULL,
    `delivery_reference_snapshot` TEXT NULL,
    `delivery_notes_snapshot` TEXT NULL,
    `estimated_distance_km` DECIMAL(8, 2) NULL,
    `estimated_travel_minutes` INTEGER UNSIGNED NULL,
    `base_delivery_fee_snapshot` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `final_delivery_fee_snapshot` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `has_fee_adjustment` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `assigned_at` DATETIME(0) NULL,
    `picked_up_at` DATETIME(0) NULL,
    `delivered_at` DATETIME(0) NULL,
    `cancelled_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_business_order_delivery_order`(`business_order_id`),
    INDEX `idx_business_order_delivery_created_at`(`created_at`),
    INDEX `idx_business_order_delivery_ext_courier`(`external_courier_id`),
    INDEX `idx_business_order_delivery_status`(`delivery_status`),
    INDEX `idx_business_order_delivery_type`(`delivery_type`),
    PRIMARY KEY (`business_order_delivery_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_order_delivery_fee_adjustment` (
    `business_order_delivery_fee_adjustment_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_order_delivery_id` INTEGER UNSIGNED NOT NULL,
    `external_courier_id` INTEGER UNSIGNED NULL,
    `requested_extra_fee` DECIMAL(10, 2) NOT NULL,
    `approved_extra_fee` DECIMAL(10, 2) NULL,
    `adjustment_status` ENUM('requested', 'approved', 'rejected', 'applied', 'cancelled') NOT NULL DEFAULT 'requested',
    `reason_type` ENUM('distance', 'rain', 'heavy_traffic', 'difficult_delivery', 'other') NOT NULL,
    `reason_detail` TEXT NULL,
    `requested_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `resolved_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_business_order_delivery_fee_adj_delivery`(`business_order_delivery_id`),
    INDEX `idx_business_order_delivery_fee_adj_ext_courier`(`external_courier_id`),
    INDEX `idx_business_order_delivery_fee_adj_reason`(`reason_type`),
    INDEX `idx_business_order_delivery_fee_adj_requested`(`requested_at`),
    INDEX `idx_business_order_delivery_fee_adj_status`(`adjustment_status`),
    PRIMARY KEY (`business_order_delivery_fee_adjustment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_order_delivery_status_history` (
    `business_order_delivery_status_history_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_order_delivery_id` INTEGER UNSIGNED NOT NULL,
    `previous_status` ENUM('pending_assignment', 'courier_assigned', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'delivery_failed', 'cancelled') NULL,
    `new_status` ENUM('pending_assignment', 'courier_assigned', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'delivery_failed', 'cancelled') NOT NULL,
    `status_origin` ENUM('business', 'couriers', 'payments', 'system', 'customer_service') NOT NULL,
    `observation` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_business_order_delivery_status_hist_created`(`created_at`),
    INDEX `idx_business_order_delivery_status_hist_delivery`(`business_order_delivery_id`),
    INDEX `idx_business_order_delivery_status_hist_new`(`new_status`),
    INDEX `idx_business_order_delivery_status_hist_origin`(`status_origin`),
    PRIMARY KEY (`business_order_delivery_status_history_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_order_detail` (
    `business_order_detail_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_order_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `product_type_id` INTEGER UNSIGNED NOT NULL,
    `business_promotion_reference_id` INTEGER UNSIGNED NULL,
    `product_name_snapshot` VARCHAR(180) NOT NULL,
    `product_description_snapshot` TEXT NULL,
    `product_type_name_snapshot` VARCHAR(120) NOT NULL,
    `base_unit_price_snapshot` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL,
    `base_subtotal_snapshot` DECIMAL(10, 2) NOT NULL,
    `has_promotion_snapshot` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_business_order_detail_order`(`business_order_id`),
    INDEX `idx_business_order_detail_prod_type`(`product_type_id`),
    INDEX `idx_business_order_detail_product`(`product_id`),
    PRIMARY KEY (`business_order_detail_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_order_status_history` (
    `business_order_status_history_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_order_id` INTEGER UNSIGNED NOT NULL,
    `previous_status` ENUM('pending_validation', 'reserved', 'confirmed', 'preparing', 'ready_for_pickup', 'dispatched', 'delivered', 'cancelled_by_customer', 'cancelled_by_business', 'cancelled_by_system') NULL,
    `new_status` ENUM('pending_validation', 'reserved', 'confirmed', 'preparing', 'ready_for_pickup', 'dispatched', 'delivered', 'cancelled_by_customer', 'cancelled_by_business', 'cancelled_by_system') NOT NULL,
    `status_origin` ENUM('business', 'payments', 'system', 'couriers', 'customer_service') NOT NULL,
    `observation` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_business_order_status_hist_created`(`created_at`),
    INDEX `idx_business_order_status_hist_new`(`new_status`),
    INDEX `idx_business_order_status_hist_order`(`business_order_id`),
    INDEX `idx_business_order_status_hist_origin`(`status_origin`),
    PRIMARY KEY (`business_order_status_history_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_promotion_reference` (
    `business_promotion_reference_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_id` INTEGER UNSIGNED NOT NULL,
    `external_promotion_id` INTEGER UNSIGNED NOT NULL,
    `external_promotion_request_id` INTEGER UNSIGNED NULL,
    `scope_type` ENUM('business', 'product', 'product_type') NOT NULL,
    `product_id` INTEGER UNSIGNED NULL,
    `product_type_id` INTEGER UNSIGNED NULL,
    `promotion_name_snapshot` VARCHAR(150) NOT NULL,
    `promotion_description_snapshot` TEXT NULL,
    `discount_type_snapshot` ENUM('percentage', 'fixed_amount') NOT NULL,
    `discount_value_snapshot` DECIMAL(10, 2) NOT NULL,
    `start_at_snapshot` DATETIME(0) NOT NULL,
    `end_at_snapshot` DATETIME(0) NOT NULL,
    `start_time_snapshot` TIME(0) NULL,
    `end_time_snapshot` TIME(0) NULL,
    `promotion_status_snapshot` ENUM('active', 'paused', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
    `is_currently_valid` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `show_in_catalog` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_business_promo_ref_business`(`business_id`),
    INDEX `idx_business_promo_ref_ext_promo`(`external_promotion_id`),
    INDEX `idx_business_promo_ref_prod_type`(`product_type_id`),
    INDEX `idx_business_promo_ref_product`(`product_id`),
    INDEX `idx_business_promo_ref_scope_type`(`scope_type`),
    INDEX `idx_business_promo_ref_status`(`promotion_status_snapshot`),
    INDEX `idx_business_promo_ref_valid`(`is_currently_valid`),
    PRIMARY KEY (`business_promotion_reference_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_promotion_request` (
    `business_promotion_request_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_id` INTEGER UNSIGNED NOT NULL,
    `external_promotion_request_id` INTEGER UNSIGNED NULL,
    `external_promotion_id` INTEGER UNSIGNED NULL,
    `requested_name` VARCHAR(150) NOT NULL,
    `requested_description` TEXT NULL,
    `requested_discount_type` ENUM('percentage', 'fixed_amount') NOT NULL,
    `requested_discount_value` DECIMAL(10, 2) NOT NULL,
    `requested_start_at` DATETIME(0) NOT NULL,
    `requested_end_at` DATETIME(0) NOT NULL,
    `requested_start_time` TIME(0) NULL,
    `requested_end_time` TIME(0) NULL,
    `current_order_count_snapshot` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `local_request_status` ENUM('pending_send', 'sent', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending_send',
    `rejection_reason` TEXT NULL,
    `external_response_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_business_promotion_request_business`(`business_id`),
    INDEX `idx_business_promotion_request_ext_promo`(`external_promotion_id`),
    INDEX `idx_business_promotion_request_ext_req`(`external_promotion_request_id`),
    INDEX `idx_business_promotion_request_status`(`local_request_status`),
    PRIMARY KEY (`business_promotion_request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_schedule` (
    `business_schedule_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_id` INTEGER UNSIGNED NOT NULL,
    `day_of_week` ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    `opening_time` TIME(0) NULL,
    `closing_time` TIME(0) NULL,
    `is_open` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_business_schedule_day`(`day_of_week`),
    UNIQUE INDEX `uq_business_schedule_day`(`business_id`, `day_of_week`),
    PRIMARY KEY (`business_schedule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cancellation_penalty_rule` (
    `cancellation_penalty_rule_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_id` INTEGER UNSIGNED NOT NULL,
    `applicable_order_status` ENUM('confirmed', 'preparing', 'ready_for_pickup', 'dispatched') NOT NULL,
    `penalty_type` ENUM('fixed_amount', 'percentage') NOT NULL,
    `penalty_value` DECIMAL(10, 2) NOT NULL,
    `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_cancel_penalty_rule_active`(`is_active`),
    UNIQUE INDEX `uq_cancel_penalty_rule`(`business_id`, `applicable_order_status`),
    PRIMARY KEY (`cancellation_penalty_rule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_business_metric` (
    `daily_business_metric_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_id` INTEGER UNSIGNED NOT NULL,
    `metric_date` DATE NOT NULL,
    `total_orders` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `total_confirmed_orders` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `total_cancelled_orders` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `total_products_sold` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `total_base_sales_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_discount_amount_snapshot` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_paid_amount_snapshot` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_daily_business_metric_date`(`metric_date`),
    UNIQUE INDEX `uq_daily_business_metric`(`business_id`, `metric_date`),
    PRIMARY KEY (`daily_business_metric_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_movement` (
    `inventory_movement_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `movement_type` ENUM('inbound', 'outbound', 'reservation', 'reservation_release', 'adjustment', 'order_confirmation', 'order_cancellation') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `previous_quantity` INTEGER NOT NULL,
    `new_quantity` INTEGER NOT NULL,
    `reason` TEXT NULL,
    `source_reference` VARCHAR(80) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_inventory_movement_created_at`(`created_at`),
    INDEX `idx_inventory_movement_product`(`product_id`),
    INDEX `idx_inventory_movement_source_ref`(`source_reference`),
    INDEX `idx_inventory_movement_type`(`movement_type`),
    PRIMARY KEY (`inventory_movement_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_reservation` (
    `inventory_reservation_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `reservation_code` VARCHAR(64) NOT NULL,
    `business_id` INTEGER UNSIGNED NOT NULL,
    `external_customer_id` INTEGER UNSIGNED NOT NULL,
    `reservation_status` ENUM('active', 'confirmed', 'released', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
    `expires_at` DATETIME(0) NOT NULL,
    `confirmed_at` DATETIME(0) NULL,
    `released_at` DATETIME(0) NULL,
    `release_reason` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_inventory_reservation_code`(`reservation_code`),
    INDEX `idx_inventory_reservation_business`(`business_id`),
    INDEX `idx_inventory_reservation_expires_at`(`expires_at`),
    INDEX `idx_inventory_reservation_ext_customer`(`external_customer_id`),
    INDEX `idx_inventory_reservation_status`(`reservation_status`),
    PRIMARY KEY (`inventory_reservation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_reservation_detail` (
    `inventory_reservation_detail_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `inventory_reservation_id` INTEGER UNSIGNED NOT NULL,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `requested_quantity` INTEGER UNSIGNED NOT NULL,
    `base_unit_price_snapshot` DECIMAL(10, 2) NOT NULL,
    `base_subtotal_snapshot` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_inventory_res_detail_product`(`product_id`),
    UNIQUE INDEX `uq_inventory_res_detail`(`inventory_reservation_id`, `product_id`),
    PRIMARY KEY (`inventory_reservation_detail_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `product_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_id` INTEGER UNSIGNED NOT NULL,
    `product_type_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(180) NOT NULL,
    `description` TEXT NULL,
    `internal_code` VARCHAR(60) NULL,
    `base_price` DECIMAL(10, 2) NOT NULL,
    `image_url` TEXT NULL,
    `image_public_id` VARCHAR(255) NULL,
    `product_status` ENUM('active', 'inactive', 'out_of_stock', 'retired') NOT NULL DEFAULT 'active',
    `deleted_at` DATETIME(0) NULL,
    `deletion_reason` TEXT NULL,
    `visible_in_catalog` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_product_business`(`business_id`),
    INDEX `idx_product_deleted_at`(`deleted_at`),
    INDEX `idx_product_product_type`(`product_type_id`),
    INDEX `idx_product_status`(`product_status`),
    INDEX `idx_product_visible_in_catalog`(`visible_in_catalog`),
    UNIQUE INDEX `uq_product_business_internal_code`(`business_id`, `internal_code`),
    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_stock` (
    `product_stock_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `available_quantity` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `reserved_quantity` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `minimum_alert_quantity` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `last_updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_product_stock_product`(`product_id`),
    INDEX `idx_product_stock_available_qty`(`available_quantity`),
    INDEX `idx_product_stock_reserved_qty`(`reserved_quantity`),
    PRIMARY KEY (`product_stock_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_type` (
    `product_type_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `product_type_status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `deleted_at` DATETIME(0) NULL,
    `deletion_reason` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_product_type_deleted_at`(`deleted_at`),
    INDEX `idx_product_type_status`(`product_type_status`),
    UNIQUE INDEX `uq_product_type_business_name`(`business_id`, `name`),
    PRIMARY KEY (`product_type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion_request_scope` (
    `promotion_request_scope_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_promotion_request_id` INTEGER UNSIGNED NOT NULL,
    `scope_type` ENUM('business', 'product', 'product_type') NOT NULL,
    `product_id` INTEGER UNSIGNED NULL,
    `product_type_id` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_promotion_request_scope_request`(`business_promotion_request_id`),
    INDEX `idx_promotion_request_scope_prod_type`(`product_type_id`),
    INDEX `idx_promotion_request_scope_product`(`product_id`),
    INDEX `idx_promotion_request_scope_type`(`scope_type`),
    PRIMARY KEY (`promotion_request_scope_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion_sync_history` (
    `promotion_sync_history_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_promotion_reference_id` INTEGER UNSIGNED NULL,
    `external_promotion_id` INTEGER UNSIGNED NULL,
    `event_type` ENUM('local_creation', 'request_sent', 'external_response', 'validity_check', 'manual_sync', 'status_update', 'operational_change_report') NOT NULL,
    `previous_status` VARCHAR(50) NULL,
    `new_status` VARCHAR(50) NULL,
    `was_successful` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `event_detail` TEXT NULL,
    `request_data` TEXT NULL,
    `response_data` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_promotion_sync_history_promo_ref`(`business_promotion_reference_id`),
    INDEX `idx_promotion_sync_history_created`(`created_at`),
    INDEX `idx_promotion_sync_history_event_type`(`event_type`),
    INDEX `idx_promotion_sync_history_ext_promo`(`external_promotion_id`),
    INDEX `idx_promotion_sync_history_success`(`was_successful`),
    PRIMARY KEY (`promotion_sync_history_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `temporary_business_closure` (
    `temporary_business_closure_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `business_id` INTEGER UNSIGNED NOT NULL,
    `start_at` DATETIME(0) NOT NULL,
    `end_at` DATETIME(0) NOT NULL,
    `reason` TEXT NULL,
    `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_temp_business_closure_active`(`is_active`),
    INDEX `idx_temp_business_closure_business`(`business_id`),
    INDEX `idx_temp_business_closure_dates`(`start_at`, `end_at`),
    PRIMARY KEY (`temporary_business_closure_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_order` ADD CONSTRAINT `fk_business_order_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`business_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_order` ADD CONSTRAINT `fk_business_order_reservation` FOREIGN KEY (`inventory_reservation_id`) REFERENCES `inventory_reservation`(`inventory_reservation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_order_delivery` ADD CONSTRAINT `fk_business_order_delivery_order` FOREIGN KEY (`business_order_id`) REFERENCES `business_order`(`business_order_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_order_delivery_fee_adjustment` ADD CONSTRAINT `fk_business_order_delivery_fee_adj_delivery` FOREIGN KEY (`business_order_delivery_id`) REFERENCES `business_order_delivery`(`business_order_delivery_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_order_delivery_status_history` ADD CONSTRAINT `fk_business_order_delivery_status_hist_delivery` FOREIGN KEY (`business_order_delivery_id`) REFERENCES `business_order_delivery`(`business_order_delivery_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_order_detail` ADD CONSTRAINT `fk_business_order_detail_order` FOREIGN KEY (`business_order_id`) REFERENCES `business_order`(`business_order_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_order_detail` ADD CONSTRAINT `fk_business_order_detail_prod_type` FOREIGN KEY (`product_type_id`) REFERENCES `product_type`(`product_type_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_order_detail` ADD CONSTRAINT `fk_business_order_detail_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_order_status_history` ADD CONSTRAINT `fk_business_order_status_hist_order` FOREIGN KEY (`business_order_id`) REFERENCES `business_order`(`business_order_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_promotion_reference` ADD CONSTRAINT `fk_business_promo_ref_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`business_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_promotion_reference` ADD CONSTRAINT `fk_business_promo_ref_prod_type` FOREIGN KEY (`product_type_id`) REFERENCES `product_type`(`product_type_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_promotion_reference` ADD CONSTRAINT `fk_business_promo_ref_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_promotion_request` ADD CONSTRAINT `fk_business_promotion_request_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`business_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `business_schedule` ADD CONSTRAINT `fk_business_schedule_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`business_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cancellation_penalty_rule` ADD CONSTRAINT `fk_cancel_penalty_rule_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`business_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `daily_business_metric` ADD CONSTRAINT `fk_daily_business_metric_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`business_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_movement` ADD CONSTRAINT `fk_inventory_movement_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_reservation` ADD CONSTRAINT `fk_inventory_reservation_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`business_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_reservation_detail` ADD CONSTRAINT `fk_inventory_res_detail_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_reservation_detail` ADD CONSTRAINT `fk_inventory_res_detail_reservation` FOREIGN KEY (`inventory_reservation_id`) REFERENCES `inventory_reservation`(`inventory_reservation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `fk_product_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`business_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `fk_product_product_type` FOREIGN KEY (`product_type_id`) REFERENCES `product_type`(`product_type_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_stock` ADD CONSTRAINT `fk_product_stock_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_type` ADD CONSTRAINT `fk_product_type_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`business_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `promotion_request_scope` ADD CONSTRAINT `fk_promotion_request_scope_prod_type` FOREIGN KEY (`product_type_id`) REFERENCES `product_type`(`product_type_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `promotion_request_scope` ADD CONSTRAINT `fk_promotion_request_scope_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `promotion_request_scope` ADD CONSTRAINT `fk_promotion_request_scope_request` FOREIGN KEY (`business_promotion_request_id`) REFERENCES `business_promotion_request`(`business_promotion_request_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `promotion_sync_history` ADD CONSTRAINT `fk_promotion_sync_history_promo_ref` FOREIGN KEY (`business_promotion_reference_id`) REFERENCES `business_promotion_reference`(`business_promotion_reference_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `temporary_business_closure` ADD CONSTRAINT `fk_temp_business_closure_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`business_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
