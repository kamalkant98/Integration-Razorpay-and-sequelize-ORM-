import { db } from "../../server.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {sqlDB,Users,Plan,Subscription} from "../database/database.js";
import Razorpay from "razorpay";

let rzp = new Razorpay({
    key_id: process.env.KEY_ID, // your `KEY_ID`
    key_secret: process.env.KEY_SECRET // your `KEY_SECRET`
})

const PayPayment = asyncHandler(async(req,res)=>{

    
      // rzp.customers.create({
      //   "name": "Gaurav Kumar",
      //   "contact": 9123456780,
      //   "email": "gaurav.kumar@mailinator.com",
      //   "fail_existing": 0,
      //   "notes": {
      //     "notes_key_1": "Tea, Earl Grey, Hot",
      //     "notes_key_2": "Tea, Earl Grey… decaf."
      //   }
      // }).then((data)=>{
      //   console.log(data);
      //   return res.status(200).json(new ApiResponse(200,{data},"Data Update successfully."));
        
      // }).catch((error) => {
      //   console.log(error);
        
      // })
      let options = {}

      // rzp.customers.all(options).then((data)=>{
      //   console.log(data);
      //   return res.status(200).json(new ApiResponse(200,{data},"Data Update successfully."));
        
      // }).catch((error) => {
      //   console.log(error);
        
      // })

      rzp.orders.create({
        amount: 50000,
        currency: "INR",
        receipt: "receipt#1",
        notes: {
          key1: "value3",
          key2: "value2"
        }
      }).then((data)=>{
        return res.json(data)
      }).catch((error)=>{
        console.log(error);
        
      })
     
})

let createCustomer = asyncHandler(async(req,res)=>{



})

const addAndUpdatePlan = asyncHandler(async(req,res) => {
  const data = req.body;
  if(data.id > 0){
    await Plan.update(data,{
      where: { id: data.id }
    });
    return res.status(200).json(new ApiResponse(200,{data},"Data Update successfully."));
    
  }else{
    await Plan.create(data)
    return res.status(200).json(new ApiResponse(200,{data},"Data Create successfully."));
  }
});

const createOrder = asyncHandler(async(req,res)=>{
  const data = req.body;

  let insData = await Subscription.create(data);

  let getPlan = await Plan.findOne({
    where: { status: 'active',id:data.planId}, // Filtering condition
  });


  let rzpData = await rzp.orders.create({
    amount: getPlan?.price * 100,
    currency: getPlan?.currency,
    receipt: getPlan?.name,
    notes: {
      key1: getPlan?.description,
    }
  })
  await Subscription.update({ order_id:rzpData?.id},{
        where: { id: insData.id }
  });

  return res.status(200).json(new ApiResponse(200,{insData,getPlan,rzpData},"Data Create successfully."));
  // res.status(200).json("asdasd")

});



export {PayPayment,addAndUpdatePlan,createCustomer,createOrder}