const ErrorHandler = require("../utils/errorHandling");
// const AsyncAwaitHandling = require("../middleware/catchAsyncError");
const model = require("../model/permissions");
const asyncCatchHandler = require("../middleware/catchAsyncError");
const mongoose = require("mongoose");

exports.permissionsAdd = asyncCatchHandler(async (req, res, next) => {
  const permissions = [
    {
      name: "Product",
      permission: [
        "product_create",
        "product_view",
        "product_edit",
        "product_delete",
        "bulk_product_create",
      ],
    },
    {
      name: "Machine",
      permission: [
        "machine_create",
        "machine_view",
        "machine_edit",
        "machine_delete",
        "machine_temperature_edit",
        "list-machines-by-canteen",
        "admin-side-product",
        "display-machine-product",
      ],
    },
    {
      name: "Channel",
      permission: [
        "channel_create",
        "channel_view",
        "channel_edit",
        "channel_delete",
        "channel_merge",
        "channel_unmerge",
        "row_add",
        "row_delete",
      ],
    },
    {
      name: "Canteen",
      permission: [
        "canteen_create",
        "canteen_view",
        "canteen_edit",
        "canteen_delete",
        "assign-canteen",
        "update-canteen-admin",
        "display-canteen-admin-canteens",
      ],
    },
    {
      name: "Discount",
      permission: [
        "discount_create",
        "discount_view",
        "discount_edit",
        "discount_delete",
      ],
    },
    {
      name: "Promotion",
      permission: [
        "promotion_create",
        "promotion_view",
        "promotion_edit",
        "promotion_delete",
        "promotion_expire",
      ],
    },
    {
      name: "User",
      permission: [
        "user_create",
        "bulk_user_create",
        "user_view",
        "user_edit",
        "user_delete",
        "white_list_user",
        "profile_delete",
        "profile_edit",
        "machine_filler_view",
        "canteen_admin_user",
        "supplier_user",
      ],
    },
    {
      name: "Category",
      permission: [
        "category_create",
        "category_view",
        "category_edit",
        "category_delete",
        "update-category",
      ],
    },
    {
      name: "Banner",
      permission: [
        "banner_create",
        "banner_view",
        "banner_edit",
        "banner_delete",
        "machine-banner",
      ],
    },
    {
      name: "Page_Builder",
      permission: ["page_create", "page_view", "page_edit", "page_delete"],
    },
    {
      name: "Inventory",
      permission: ["inventory_view", "product_add", "product_remove"],
    },
    {
      name: "Permission",
      permission: ["permission_view", "permission_create"],
    },
    {
      name: "Role & Permissions",
      permission: [
        "role_create",
        "role_edit",
        "role_view",
        "role_delete",
        "role_permission_view",
      ],
    },
    {
      name: "Waste_Management",
      permission: [
        "wastage_create",
        "wastage_view",
        "wastage_edit",
        "wastage_delete",
      ],
    },
    {
      name: "Machine Filler",
      permission: [
        "machine_channels_view",
        "machine_filler_canteens_view",
        "machine_filler_machines_view",
        "update_inventory",
        "waste_inventory",
        "machine_category",
        "category_product",
        "update_machine_channel",
        "machinerow_create",
        "freevend_validator",
      ],
    },
    {
      name: "Company",
      permission: [
        "company_view",
        "company_whitelist_user",
        "company_with_canteen_view",
        "company_contract_with_cuboid",
        "subcompanies_view",
      ],
    },
    {
      name: "Company Subsidy",
      permission: ["company_contract_by_super_admin", "subcompany_contract"],
    },
    {
      name: "Free Vend",
      permission: ["freevend_view"],
    },
    {
      name: "Machine Temperature Logs",
      permission: ["machine_temperature_log"],
    },
    {
      name: "Order",
      permission: ["order_view", "order_refund_payment"],
    },
    {
      name: "Reports",
      permission: [
        "sale_report_by_machine",
        "inventory_report",
        "sale_report",
        "monthly_machine_report",
        "monthly_reports",
        "product_sale",
        "canteen_locations_view",
        "transaction_log_report",
        "downtime_view",
        "top_ten_events",
        "top_machine",
        "top_products",
        "total_sale_revenue",
        "sales_dashboard",
      ],
    },
    {
      name: "Subsidy",
      permission: [
        "subsidy_create",
        "subsidy_view_all",
        "subsidy_view",
        "subsidy_delete",
        "subsidy_edit",
      ],
    },
    {
      name: "Whitelist User",
      permission: [
        "white_list_user_create",
        "white_list_user_view",
        "white_list_user_delete",
        "white_list_user_edit",
        "white_list_user_bulk_create",
      ],
    },
    {
      name: "Product Vend",
      permission: ["product_vend_add", "product_vend_limit_list", "product_vend_delete", "product_vend_update"],
    },
  ];

  const allPermissions = await model.find({}).count();

  if (allPermissions < 1) {
    const add = await new model({
      permissions: permissions,
    });
    await add.save();
    return res.json({
      success: true,
      permissions: add,
    });
  }
  return res.json({
    success: false,
    message: req.t("permission is already created"),
  });
});

exports.displayPermissions = asyncCatchHandler(async (req, res, next) => {
  const Data = await model.find({ permission_status: "Active" });

  res.json({
    success: true,
    Data,
  });
});
