const express = require("express");
const {addPriority,allPriority,deletePriority,updatePriority,searchPriority} = require('../controller/machinePriorityLogs')
const router = express.Router();
const path = require("path");
const Auth = require("../middleware/auth");
const userAuth = require('../middleware/userAuth');
const {priorityValidator}=require('../validator/machineLogs')


router.post("/",userAuth,Auth("page_create"),priorityValidator, addPriority);
router.get("/",userAuth,Auth("page_view"), allPriority);
router.put("/:id",userAuth, Auth("page_edit"), updatePriority);
router.get("/:id",userAuth, Auth("page_edit"), searchPriority);
router.delete("/:id",userAuth,Auth("page_delete"), deletePriority);
// router.post('/add/:id', upload.array('Image', 3), addImage);
module.exports = router;


// add-page update-page search-page delete-page