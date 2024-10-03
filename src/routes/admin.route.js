import { Router } from "express";
import {addAndUpdateCategory,getCategory,getCategoryList} from "../controllers/category.controller.js"
import {addAndUpdateVendors,getVendor,deleteVendor,getVenderList,addAndUpdateVenderService,getService,getServiceList,
    deleteService,addAndUpdateContact,getContact,deleteContact,getContactList
} from "../controllers/vendors.controller.js"
import {getCityList,getStateList,getAllParentCategories,getAllCategories,getAllContactTypes,filesUpload} from "../controllers/common.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {vendorValidation,serviceValidation,customerValidation} from "../validation/vendors.validation.js"
import {categoryValidation} from "../validation/category.validation.js"
import {login} from "../controllers/users.controller.js"
import {verifiedJWT}  from "../middlewares/auth.middleware.js"


import {PayPayment,addAndUpdatePlan,createCustomer,createOrder} from "../controllers/razorpay.controller.js";
const router = Router();

// admin users

router.route("/login").post(upload.none(),login)



// Categories APIs
router.route("/addAndUpdateCategory").post(upload.fields([{name:"category_icon",maxCount:1},{name:"category_image",maxCount:1}]),verifiedJWT,categoryValidation,addAndUpdateCategory)
router.route("/getCategory").get(upload.none(),verifiedJWT,getCategory)
router.route("/getCategoryList").post(upload.none(),verifiedJWT,getCategoryList)

// vendors APIs
router.route("/addAndUpdateVendors").post(upload.none(),verifiedJWT,vendorValidation,addAndUpdateVendors)
router.route("/getVendor").get(verifiedJWT,getVendor)
router.route("/deleteVendor").get(upload.none(),verifiedJWT,deleteVendor)
router.route("/getVenderList").post(upload.none(),verifiedJWT,getVenderList)

//Vender Service Apis
// router.route("/addAndUpdateVenderService").post(upload.fields([{name:"serviceImage"}]),serviceValidation,addAndUpdateVenderService)
router.route("/addAndUpdateVenderService").post(upload.any(),verifiedJWT,serviceValidation,addAndUpdateVenderService)
router.route("/getService").get(upload.none(),verifiedJWT,getService)
router.route("/getServiceList").post(upload.none(),verifiedJWT,getServiceList)
router.route("/deleteService").get(upload.none(),verifiedJWT,deleteService)

//Vender Contact Apis
router.route("/addAndUpdateContact").post(upload.none(),verifiedJWT,customerValidation,addAndUpdateContact)
router.route("/getContact").get(upload.none(),verifiedJWT,getContact)
router.route("/deleteContact").get(upload.none(),verifiedJWT,deleteContact)
router.route("/getContactList").post(upload.none(),verifiedJWT,getContactList)

// common APIS
router.route("/getCityList").get(upload.none(),getCityList)
router.route("/getStateList").get(upload.none(),getStateList)
router.route("/getAllParentCategories").get(upload.none(),getAllParentCategories)
router.route("/getAllCategories").get(upload.none(),getAllCategories)
router.route("/getAllContactTypes").get(upload.none(),getAllContactTypes)
router.route("/filesUpload").post(upload.array('multipleFiles'),filesUpload)

router.route("/PayPayment").post(upload.none(),PayPayment)
router.route("/addAndUpdatePlan").post(upload.none(),addAndUpdatePlan)
router.route("/createCustomer").post(upload.none(),createCustomer)
router.route("/createOrder").post(upload.none(),createOrder);


export default router;