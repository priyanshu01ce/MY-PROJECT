import express from "express";

import {
  registerController,
  loginController,
  forgotPasswordController,
  testController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  updateProfileController
} from "../controllers/authController.js";

import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//Forgot Password || POST
router.post("/forgot-password", forgotPasswordController);

router.get("/user-auth",requireSignIn,(req,res)=>{
    console.log("i am accessign");
    res.status(200).send({ok:true});
})


//update profile
router.put("/profile", requireSignIn, updateProfileController);


//test routes
router.get("/test", requireSignIn, isAdmin,testController);

//protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//orders
router.get("/orders", requireSignIn, getOrdersController);



//all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// order status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);
// order status update
router.put(
  "/orders/:orderId",
  requireSignIn,
  orderStatusController
);


export default router;