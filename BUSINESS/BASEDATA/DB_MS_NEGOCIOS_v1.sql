create database if not exists business_service_db_v1
character set utf8mb4
collate utf8mb4_unicode_ci;

use business_service_db_v1;

set foreign_key_checks = 0;

drop table if exists daily_business_metric;
drop table if exists promotion_sync_history;
drop table if exists business_promotion_reference;
drop table if exists promotion_request_scope;
drop table if exists business_promotion_request;
drop table if exists business_order_status_history;
drop table if exists business_order_detail;
drop table if exists business_order;
drop table if exists cancellation_penalty_rule;
drop table if exists inventory_reservation_detail;
drop table if exists inventory_reservation;
drop table if exists inventory_movement;
drop table if exists product_stock;
drop table if exists product;
drop table if exists product_type;
drop table if exists temporary_business_closure;
drop table if exists business_schedule;
drop table if exists business;

set foreign_key_checks = 1;

create table business (
    business_id int unsigned auto_increment primary key,
    trade_name varchar(150) not null,
    legal_name varchar(200) null,
    business_type enum('pharmacy', 'supermarket') not null,
    business_status enum('active', 'temporarily_closed', 'suspended', 'retired', 'inactive') not null default 'active',
    description text null,
    address text null,
    phone varchar(20) null,
    email varchar(150) null,
    tax_id varchar(30) null,
    retired_at datetime null,
    retirement_reason text null,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    unique key uq_business_tax_id (tax_id),
    unique key uq_business_email (email),
    key idx_business_type (business_type),
    key idx_business_status (business_status)
) engine=innodb;

create table business_schedule (
    business_schedule_id int unsigned auto_increment primary key,
    business_id int unsigned not null,
    day_of_week enum('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') not null,
    opening_time time null,
    closing_time time null,
    is_open tinyint unsigned not null default 1,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_business_schedule_business
        foreign key (business_id) references business (business_id),
    unique key uq_business_schedule_day (business_id, day_of_week),
    key idx_business_schedule_day (day_of_week)
) engine=innodb;

create table temporary_business_closure (
    temporary_business_closure_id int unsigned auto_increment primary key,
    business_id int unsigned not null,
    start_at datetime not null,
    end_at datetime not null,
    reason text null,
    is_active tinyint unsigned not null default 1,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_temp_business_closure_business
        foreign key (business_id) references business (business_id),
    key idx_temp_business_closure_business (business_id),
    key idx_temp_business_closure_dates (start_at, end_at),
    key idx_temp_business_closure_active (is_active)
) engine=innodb;

create table product_type (
    product_type_id int unsigned auto_increment primary key,
    business_id int unsigned not null,
    name varchar(120) not null,
    description text null,
    product_type_status enum('active', 'inactive') not null default 'active',
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_product_type_business
        foreign key (business_id) references business (business_id),
    unique key uq_product_type_business_name (business_id, name),
    key idx_product_type_status (product_type_status)
) engine=innodb;

create table product (
    product_id int unsigned auto_increment primary key,
    business_id int unsigned not null,
    product_type_id int unsigned not null,
    name varchar(180) not null,
    description text null,
    internal_code varchar(60) null,
    base_price decimal(10,2) not null,
    image_url text null,
    product_status enum('active', 'inactive', 'out_of_stock', 'retired') not null default 'active',
    visible_in_catalog tinyint unsigned not null default 1,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_product_business
        foreign key (business_id) references business (business_id),
    constraint fk_product_product_type
        foreign key (product_type_id) references product_type (product_type_id),
    unique key uq_product_business_internal_code (business_id, internal_code),
    key idx_product_business (business_id),
    key idx_product_product_type (product_type_id),
    key idx_product_status (product_status),
    key idx_product_visible_in_catalog (visible_in_catalog)
) engine=innodb;

create table product_stock (
    product_stock_id int unsigned auto_increment primary key,
    product_id int unsigned not null,
    available_quantity int unsigned not null default 0,
    reserved_quantity int unsigned not null default 0,
    minimum_alert_quantity int unsigned not null default 0,
    last_updated_at datetime not null default current_timestamp,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_product_stock_product
        foreign key (product_id) references product (product_id),
    unique key uq_product_stock_product (product_id),
    key idx_product_stock_available_qty (available_quantity),
    key idx_product_stock_reserved_qty (reserved_quantity)
) engine=innodb;

create table inventory_movement (
    inventory_movement_id int unsigned auto_increment primary key,
    product_id int unsigned not null,
    movement_type enum('inbound', 'outbound', 'reservation', 'reservation_release', 'adjustment', 'order_confirmation', 'order_cancellation') not null,
    quantity int not null,
    previous_quantity int not null,
    new_quantity int not null,
    reason text null,
    source_reference varchar(80) null,
    created_at datetime not null default current_timestamp,
    constraint fk_inventory_movement_product
        foreign key (product_id) references product (product_id),
    key idx_inventory_movement_product (product_id),
    key idx_inventory_movement_type (movement_type),
    key idx_inventory_movement_source_ref (source_reference),
    key idx_inventory_movement_created_at (created_at)
) engine=innodb;

create table inventory_reservation (
    inventory_reservation_id int unsigned auto_increment primary key,
    reservation_code varchar(64) not null,
    business_id int unsigned not null,
    external_customer_id int unsigned not null,
    reservation_status enum('active', 'confirmed', 'released', 'expired', 'cancelled') not null default 'active',
    expires_at datetime not null,
    confirmed_at datetime null,
    released_at datetime null,
    release_reason text null,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_inventory_reservation_business
        foreign key (business_id) references business (business_id),
    unique key uq_inventory_reservation_code (reservation_code),
    key idx_inventory_reservation_business (business_id),
    key idx_inventory_reservation_ext_customer (external_customer_id),
    key idx_inventory_reservation_status (reservation_status),
    key idx_inventory_reservation_expires_at (expires_at)
) engine=innodb;

create table inventory_reservation_detail (
    inventory_reservation_detail_id int unsigned auto_increment primary key,
    inventory_reservation_id int unsigned not null,
    product_id int unsigned not null,
    requested_quantity int unsigned not null,
    base_unit_price_snapshot decimal(10,2) not null,
    base_subtotal_snapshot decimal(10,2) not null,
    created_at datetime not null default current_timestamp,
    constraint fk_inventory_res_detail_reservation
        foreign key (inventory_reservation_id) references inventory_reservation (inventory_reservation_id),
    constraint fk_inventory_res_detail_product
        foreign key (product_id) references product (product_id),
    unique key uq_inventory_res_detail (inventory_reservation_id, product_id),
    key idx_inventory_res_detail_product (product_id)
) engine=innodb;

create table cancellation_penalty_rule (
    cancellation_penalty_rule_id int unsigned auto_increment primary key,
    business_id int unsigned not null,
    applicable_order_status enum('confirmed', 'preparing', 'ready_for_pickup', 'dispatched') not null,
    penalty_type enum('fixed_amount', 'percentage') not null,
    penalty_value decimal(10,2) not null,
    is_active tinyint unsigned not null default 1,
    description text null,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_cancel_penalty_rule_business
        foreign key (business_id) references business (business_id),
    unique key uq_cancel_penalty_rule (business_id, applicable_order_status),
    key idx_cancel_penalty_rule_active (is_active)
) engine=innodb;

create table business_order (
    business_order_id int unsigned auto_increment primary key,
    external_order_code varchar(64) not null,
    business_id int unsigned not null,
    external_customer_id int unsigned not null,
    inventory_reservation_id int unsigned null,
    external_payment_code varchar(64) null,
    order_status enum(
        'pending_validation',
        'reserved',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'dispatched',
        'delivered',
        'cancelled_by_customer',
        'cancelled_by_business',
        'cancelled_by_system'
    ) not null default 'pending_validation',
    financial_status_snapshot enum(
        'pending',
        'approved',
        'denied',
        'cancelled',
        'partially_refunded',
        'refunded'
    ) not null default 'pending',
    base_subtotal_snapshot decimal(10,2) not null default 0.00,
    total_discount_amount_snapshot decimal(10,2) not null default 0.00,
    service_fee_amount_snapshot decimal(10,2) not null default 0.00,
    tip_amount_snapshot decimal(10,2) not null default 0.00,
    total_paid_amount_snapshot decimal(10,2) not null default 0.00,
    currency char(3) not null default 'gtq',
    payment_approved_at datetime null,
    cancelled_by enum('customer', 'business', 'system') null,
    cancellation_reason text null,
    penalty_applied tinyint unsigned not null default 0,
    penalty_type_snapshot enum('fixed_amount', 'percentage') null,
    penalty_value_snapshot decimal(10,2) null,
    penalty_amount_snapshot decimal(10,2) null,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_business_order_business
        foreign key (business_id) references business (business_id),
    constraint fk_business_order_reservation
        foreign key (inventory_reservation_id) references inventory_reservation (inventory_reservation_id),
    unique key uq_business_order_external_code (external_order_code),
    key idx_business_order_business (business_id),
    key idx_business_order_ext_customer (external_customer_id),
    key idx_business_order_status (order_status),
    key idx_business_order_fin_status (financial_status_snapshot),
    key idx_business_order_created_at (created_at)
) engine=innodb;

create table business_order_detail (
    business_order_detail_id int unsigned auto_increment primary key,
    business_order_id int unsigned not null,
    product_id int unsigned not null,
    product_type_id int unsigned not null,
    business_promotion_reference_id int unsigned null,
    product_name_snapshot varchar(180) not null,
    product_description_snapshot text null,
    product_type_name_snapshot varchar(120) not null,
    base_unit_price_snapshot decimal(10,2) not null,
    quantity int unsigned not null,
    base_subtotal_snapshot decimal(10,2) not null,
    has_promotion_snapshot tinyint unsigned not null default 0,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_business_order_detail_order
        foreign key (business_order_id) references business_order (business_order_id),
    constraint fk_business_order_detail_product
        foreign key (product_id) references product (product_id),
    constraint fk_business_order_detail_prod_type
        foreign key (product_type_id) references product_type (product_type_id),
    key idx_business_order_detail_order (business_order_id),
    key idx_business_order_detail_product (product_id),
    key idx_business_order_detail_prod_type (product_type_id)
) engine=innodb;

create table business_order_status_history (
    business_order_status_history_id int unsigned auto_increment primary key,
    business_order_id int unsigned not null,
    previous_status enum(
        'pending_validation',
        'reserved',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'dispatched',
        'delivered',
        'cancelled_by_customer',
        'cancelled_by_business',
        'cancelled_by_system'
    ) null,
    new_status enum(
        'pending_validation',
        'reserved',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'dispatched',
        'delivered',
        'cancelled_by_customer',
        'cancelled_by_business',
        'cancelled_by_system'
    ) not null,
    status_origin enum('business', 'payments', 'system', 'couriers', 'customer_service') not null,
    observation text null,
    created_at datetime not null default current_timestamp,
    constraint fk_business_order_status_hist_order
        foreign key (business_order_id) references business_order (business_order_id),
    key idx_business_order_status_hist_order (business_order_id),
    key idx_business_order_status_hist_new (new_status),
    key idx_business_order_status_hist_origin (status_origin),
    key idx_business_order_status_hist_created (created_at)
) engine=innodb;

create table business_promotion_request (
    business_promotion_request_id int unsigned auto_increment primary key,
    business_id int unsigned not null,
    external_promotion_request_id int unsigned null,
    external_promotion_id int unsigned null,
    requested_name varchar(150) not null,
    requested_description text null,
    requested_discount_type enum('percentage', 'fixed_amount') not null,
    requested_discount_value decimal(10,2) not null,
    requested_start_at datetime not null,
    requested_end_at datetime not null,
    requested_start_time time null,
    requested_end_time time null,
    current_order_count_snapshot int unsigned not null default 0,
    local_request_status enum('pending_send', 'sent', 'approved', 'rejected', 'cancelled') not null default 'pending_send',
    rejection_reason text null,
    external_response_at datetime null,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_business_promotion_request_business
        foreign key (business_id) references business (business_id),
    key idx_business_promotion_request_business (business_id),
    key idx_business_promotion_request_status (local_request_status),
    key idx_business_promotion_request_ext_promo (external_promotion_id),
    key idx_business_promotion_request_ext_req (external_promotion_request_id)
) engine=innodb;

create table promotion_request_scope (
    promotion_request_scope_id int unsigned auto_increment primary key,
    business_promotion_request_id int unsigned not null,
    scope_type enum('business', 'product', 'product_type') not null,
    product_id int unsigned null,
    product_type_id int unsigned null,
    created_at datetime not null default current_timestamp,
    constraint fk_promotion_request_scope_request
        foreign key (business_promotion_request_id) references business_promotion_request (business_promotion_request_id),
    constraint fk_promotion_request_scope_product
        foreign key (product_id) references product (product_id),
    constraint fk_promotion_request_scope_prod_type
        foreign key (product_type_id) references product_type (product_type_id),
    key idx_promotion_request_scope_type (scope_type),
    key idx_promotion_request_scope_product (product_id),
    key idx_promotion_request_scope_prod_type (product_type_id)
) engine=innodb;

create table business_promotion_reference (
    business_promotion_reference_id int unsigned auto_increment primary key,
    business_id int unsigned not null,
    external_promotion_id int unsigned not null,
    external_promotion_request_id int unsigned null,
    scope_type enum('business', 'product', 'product_type') not null,
    product_id int unsigned null,
    product_type_id int unsigned null,
    promotion_name_snapshot varchar(150) not null,
    promotion_description_snapshot text null,
    discount_type_snapshot enum('percentage', 'fixed_amount') not null,
    discount_value_snapshot decimal(10,2) not null,
    start_at_snapshot datetime not null,
    end_at_snapshot datetime not null,
    start_time_snapshot time null,
    end_time_snapshot time null,
    promotion_status_snapshot enum('active', 'paused', 'expired', 'cancelled') not null default 'active',
    is_currently_valid tinyint unsigned not null default 1,
    show_in_catalog tinyint unsigned not null default 1,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_business_promo_ref_business
        foreign key (business_id) references business (business_id),
    constraint fk_business_promo_ref_product
        foreign key (product_id) references product (product_id),
    constraint fk_business_promo_ref_prod_type
        foreign key (product_type_id) references product_type (product_type_id),
    key idx_business_promo_ref_business (business_id),
    key idx_business_promo_ref_ext_promo (external_promotion_id),
    key idx_business_promo_ref_scope_type (scope_type),
    key idx_business_promo_ref_product (product_id),
    key idx_business_promo_ref_prod_type (product_type_id),
    key idx_business_promo_ref_status (promotion_status_snapshot),
    key idx_business_promo_ref_valid (is_currently_valid)
) engine=innodb;

create table promotion_sync_history (
    promotion_sync_history_id int unsigned auto_increment primary key,
    business_promotion_reference_id int unsigned null,
    external_promotion_id int unsigned null,
    event_type enum(
        'local_creation',
        'request_sent',
        'external_response',
        'validity_check',
        'manual_sync',
        'status_update',
        'operational_change_report'
    ) not null,
    previous_status varchar(50) null,
    new_status varchar(50) null,
    was_successful tinyint unsigned not null default 1,
    event_detail text null,
    request_data text null,
    response_data text null,
    created_at datetime not null default current_timestamp,
    constraint fk_promotion_sync_history_promo_ref
        foreign key (business_promotion_reference_id) references business_promotion_reference (business_promotion_reference_id),
    key idx_promotion_sync_history_ext_promo (external_promotion_id),
    key idx_promotion_sync_history_event_type (event_type),
    key idx_promotion_sync_history_success (was_successful),
    key idx_promotion_sync_history_created (created_at)
) engine=innodb;

create table daily_business_metric (
    daily_business_metric_id int unsigned auto_increment primary key,
    business_id int unsigned not null,
    metric_date date not null,
    total_orders int unsigned not null default 0,
    total_confirmed_orders int unsigned not null default 0,
    total_cancelled_orders int unsigned not null default 0,
    total_products_sold int unsigned not null default 0,
    total_base_sales_amount decimal(12,2) not null default 0.00,
    total_discount_amount_snapshot decimal(12,2) not null default 0.00,
    total_paid_amount_snapshot decimal(12,2) not null default 0.00,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_daily_business_metric_business
        foreign key (business_id) references business (business_id),
    unique key uq_daily_business_metric (business_id, metric_date),
    key idx_daily_business_metric_date (metric_date)
) engine=innodb;


-- =========================================================
-- 1) soft delete for administrative/catalog entities
-- =========================================================

alter table business
    add column deleted_at datetime null after retirement_reason,
    add column deletion_reason text null after deleted_at,
    add key idx_business_deleted_at (deleted_at);

alter table product_type
    add column deleted_at datetime null after product_type_status,
    add column deletion_reason text null after deleted_at,
    add key idx_product_type_deleted_at (deleted_at);

alter table product
    add column deleted_at datetime null after product_status,
    add column deletion_reason text null after deleted_at,
    add key idx_product_deleted_at (deleted_at);

-- =========================================================
-- 2) delivery data for business orders
-- =========================================================

create table business_order_delivery (
    business_order_delivery_id int unsigned auto_increment primary key,
    business_order_id int unsigned not null,
    delivery_type enum('home_delivery', 'pickup') not null default 'home_delivery',
    delivery_status enum(
        'pending_assignment',
        'courier_assigned',
        'ready_for_pickup',
        'picked_up',
        'in_transit',
        'delivered',
        'delivery_failed',
        'cancelled'
    ) not null default 'pending_assignment',
    external_courier_id int unsigned null,
    recipient_name_snapshot varchar(150) null,
    recipient_phone_snapshot varchar(20) null,
    delivery_address_snapshot text null,
    delivery_reference_snapshot text null,
    delivery_notes_snapshot text null,
    estimated_distance_km decimal(8,2) null,
    estimated_travel_minutes int unsigned null,
    base_delivery_fee_snapshot decimal(10,2) not null default 0.00,
    final_delivery_fee_snapshot decimal(10,2) not null default 0.00,
    has_fee_adjustment tinyint unsigned not null default 0,
    assigned_at datetime null,
    picked_up_at datetime null,
    delivered_at datetime null,
    cancelled_at datetime null,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_business_order_delivery_order
        foreign key (business_order_id) references business_order (business_order_id),
    unique key uq_business_order_delivery_order (business_order_id),
    key idx_business_order_delivery_type (delivery_type),
    key idx_business_order_delivery_status (delivery_status),
    key idx_business_order_delivery_ext_courier (external_courier_id),
    key idx_business_order_delivery_created_at (created_at)
) engine=innodb;

create table business_order_delivery_status_history (
    business_order_delivery_status_history_id int unsigned auto_increment primary key,
    business_order_delivery_id int unsigned not null,
    previous_status enum(
        'pending_assignment',
        'courier_assigned',
        'ready_for_pickup',
        'picked_up',
        'in_transit',
        'delivered',
        'delivery_failed',
        'cancelled'
    ) null,
    new_status enum(
        'pending_assignment',
        'courier_assigned',
        'ready_for_pickup',
        'picked_up',
        'in_transit',
        'delivered',
        'delivery_failed',
        'cancelled'
    ) not null,
    status_origin enum(
        'business',
        'couriers',
        'payments',
        'system',
        'customer_service'
    ) not null,
    observation text null,
    created_at datetime not null default current_timestamp,
    constraint fk_business_order_delivery_status_hist_delivery
        foreign key (business_order_delivery_id) references business_order_delivery (business_order_delivery_id),
    key idx_business_order_delivery_status_hist_delivery (business_order_delivery_id),
    key idx_business_order_delivery_status_hist_new (new_status),
    key idx_business_order_delivery_status_hist_origin (status_origin),
    key idx_business_order_delivery_status_hist_created (created_at)
) engine=innodb;

-- =========================================================
-- 3) delivery fee increase / adjustment requested by courier
-- =========================================================

create table business_order_delivery_fee_adjustment (
    business_order_delivery_fee_adjustment_id int unsigned auto_increment primary key,
    business_order_delivery_id int unsigned not null,
    external_courier_id int unsigned null,
    requested_extra_fee decimal(10,2) not null,
    approved_extra_fee decimal(10,2) null,
    adjustment_status enum(
        'requested',
        'approved',
        'rejected',
        'applied',
        'cancelled'
    ) not null default 'requested',
    reason_type enum(
        'distance',
        'rain',
        'heavy_traffic',
        'difficult_delivery',
        'other'
    ) not null,
    reason_detail text null,
    requested_at datetime not null default current_timestamp,
    resolved_at datetime null,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    constraint fk_business_order_delivery_fee_adj_delivery
        foreign key (business_order_delivery_id) references business_order_delivery (business_order_delivery_id),
    key idx_business_order_delivery_fee_adj_delivery (business_order_delivery_id),
    key idx_business_order_delivery_fee_adj_ext_courier (external_courier_id),
    key idx_business_order_delivery_fee_adj_status (adjustment_status),
    key idx_business_order_delivery_fee_adj_reason (reason_type),
    key idx_business_order_delivery_fee_adj_requested (requested_at)
) engine=innodb;