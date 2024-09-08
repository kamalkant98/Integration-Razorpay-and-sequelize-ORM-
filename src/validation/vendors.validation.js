import Joi from "joi";
import {ApiError} from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";

const vendorSchema = Joi.object({
    vendor_name: Joi.string().required().trim(),
    email: Joi.string().required().email(),
    website: Joi.string().allow('', null).uri(), // Allow empty or null website
    business_name: Joi.string().required().min(3).max(100).trim(),
    phone: Joi.string().required().length(10).pattern(/^[0-9]+$/), // Ensure 10-digit phone number
    whatsapp_number: Joi.string().allow('', null).length(10).pattern(/^[0-9]+$/), // Allow empty/null and validate 10-digit number
    gstin: Joi.string().length(15).pattern(/^[0-9A-Z]+$/), // Validate GSTIN format (15 alphanumeric characters)
    year_of_establishment: Joi.number().integer().min(1).max(2024), // Ensure valid year range
    verified: Joi.number().allow(0,1).max(1).required(),
    address_line_1: Joi.string().required().trim(),
    address_line_2: Joi.string().allow('', null).trim(),
    city: Joi.number().integer().required(), // Assuming city ID exists
    state: Joi.number().integer().required(), // Assuming state ID exists
    pincode: Joi.string().length(6).pattern(/^[0-9]+$/), // Ensure 6-digit pincode
    latitude: Joi.number().allow(null), // Allow null for latitude
    longitude: Joi.number().allow(null), // Allow null for longitude
    meta_title: Joi.string().allow('', null).trim().max(70), // Limit meta title length
    meta_description: Joi.string().allow('', null).trim().max(160), // Limit meta description length
    meta_keywords: Joi.array().items(Joi.string().trim().max(20)).unique(), // Ensure unique keywords with max length
    tags: Joi.array().items(Joi.string().trim().max(20)).unique(), // Ensure unique tags with max length
    ratings: Joi.number().allow(null).min(0).max(5), // Allow null for ratings and restrict range
    is_vendor: Joi.number().allow(0,1).max(1).required(),
    google_location: Joi.string().allow('', null).trim(),
    status: Joi.number().allow(0,1).max(1).required(),
    customer_id: Joi.number().optional(), // Not included in the provided data
    // vendor_timings: Joi.array().items(
    //   Joi.object({
    //     opening_hour: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/).required(),
    //     closing_hour: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/).required(),
    //     weekday: Joi.number().integer().min(0).max(6).required(), // Ensure valid weekday (0-6)
    //   })
    // ),
}).unknown(true);


const serviceSchema = Joi.object({
    customer_id : Joi.number().integer().required().default(0),
    // name: Joi.string().trim().required().min(3).max(50).default('').allow(null, ''),
    // description: Joi.string().trim().allow(null, ''),
    category_id: Joi.number().integer().required().default(0), // Set a default category ID
    // status: Joi.string().trim().required().allow(0,1).default(0),
    // features_image: Joi.string().trim().allow(0,1).default(0),
    service_id: Joi.number().optional(),
}).unknown(true);

const customerSchema = Joi.object({
    customer_id: Joi.number().integer().allow(null), // Allow null for customer_id
    first_name: Joi.string().trim().required().min(3).max(50),
    last_name: Joi.string().trim().required().min(3).max(50),
    email: Joi.string().trim().required().email(),
    phone: Joi.string().trim().allow(null, ''), // Allow null or empty string for phone
    status: Joi.string().trim().allow(0,1),
    contact_type_id: Joi.number().integer().required().allow(null),
    vendor_contact_person_id: Joi.number().optional(),  // Allow null or empty string for status
  }).unknown(true);

const vendorValidation = asyncHandler(async(req,res,next)=>{
    let value = await vendorSchema.validate(req.body);
    if(value.error){
        throw new ApiError(422,value.error.details[0].message)
    }else{
        next();
    }
})

const serviceValidation = asyncHandler(async(req,res,next)=>{
    let value = await serviceSchema.validate(req.body);
    if(value.error){
        throw new ApiError(422,value.error.details[0].message)
    }else{
        next();
    }
})

const  customerValidation = asyncHandler(async(req,res,next)=>{
    let value = await customerSchema.validate(req.body);
    if(value.error){
        throw new ApiError(422,value.error.details[0].message)
    }else{
        next();
    }
})


  export {vendorValidation,serviceValidation,customerValidation}


