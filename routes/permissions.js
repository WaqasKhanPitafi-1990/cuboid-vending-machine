const express = require("express");
const {
    addPermission,
    displayPermissions,
    deletePermissions,
    updatePermission,
    searchPermission,
    permissionsAdd
  } = require("../controller/permissions");
const router = express.Router();
const Auth = require("../middleware/auth");
const userAuth = require("../middleware/userAuth");
const {permissionValidator}=require('../validator/permission')


router.post("/",userAuth,Auth('permission_create'), permissionsAdd);

// router.post("/",userAuth,Auth("add-permission"),permissionValidator, addPermission);

router.get("/", userAuth, Auth("permission_view"), displayPermissions);


module.exports = router;


// add-permission  display-permission delete-permission search-permission update-permission