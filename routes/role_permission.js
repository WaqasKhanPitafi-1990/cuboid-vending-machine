const express = require("express");
const userAuth = require("../middleware/userAuth");
const router = express.Router();
const Auth = require("../middleware/auth");
// const permissions = require("../middleware/permissions");
const {rolePermissionValidator}=require('../validator/role_permission')
const {
    assignPermission,
    allRolePermissions,
   
    updateRolePermission,
    deleteRole,
    displayRoles
} = require("../controller/assign_permission");


/// Add New Role
router.post("/", userAuth,Auth("role_create"),rolePermissionValidator, assignPermission);

/// Display All Role 
router.get("/", userAuth, Auth("role_view"), displayRoles);

// Display only role Permission
router.get("/role_id/:role_id", userAuth, Auth("role_permission_view",), allRolePermissions);
// Update Role
router.patch("/:role_id", userAuth, Auth("role_edit" ), updateRolePermission);

// Delete Role
router.delete("/:role_id", userAuth, Auth("role_delete" ), deleteRole);

// create 
module.exports = router;

// display-roles , add-role , delete-roles , search-roles , update-roles
