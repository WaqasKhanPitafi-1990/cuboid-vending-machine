const express = require("express");
const {addPage,allPage,deletePage,updatePage,searchPage} = require('../controller/page')
const router = express.Router();
const path = require("path");
const Auth = require("../middleware/auth");
const userAuth = require('../middleware/userAuth');
const {pageValidator}=require('../validator/page')

router.post("/",userAuth,Auth("page_create"),pageValidator, addPage);
router.get("/",userAuth,Auth("page_view"), allPage);
router.put("/:id",userAuth, Auth("page_edit"), updatePage);
router.get("/:id",userAuth, Auth("page_edit"), searchPage);
router.delete("/:id",userAuth,Auth("page_delete"), deletePage);
// router.post('/add/:id', upload.array('Image', 3), addImage);
module.exports = router;


// add-page update-page search-page delete-page