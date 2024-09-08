import Joi from "joi" 
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js";

const categorySchema = Joi.object({
  category_title: Joi.string().required().trim().min(3).max(50),
  parent_category_id: Joi.number().allow(null).integer(), // Allow null for parent category
  sort_order: Joi.number().integer().min(0),
  status: Joi.number().integer().valid(0, 1), // Valid statuses: 0 or 1
  header_category: Joi.number().allow(0,1).max(1).required(),
  banner_category: Joi.number().allow(0,1).max(1).required(),
  slider_category: Joi.number().allow(0,1).max(1).required(),
  section_category: Joi.number().allow(0,1).max(1).required(),
  category_icon: Joi.string().allow('', null).uri(), // Allow empty/null icon URL
  category_image: Joi.string().allow('', null).uri(), // Allow empty/null image URL
  meta_title: Joi.string().allow('', null).trim().max(70), // Limit meta title length
  meta_description: Joi.string().allow('', null).trim().max(160), // Limit meta description length
  meta_keywords: Joi.string().allow('', null).trim().max(160), // Unique keywords with max length
  category_id: Joi.number().allow('', null).optional(), // Optional category ID (for updates)
}).unknown(true);

const categoryValidation = asyncHandler(async(req,res,next)=>{
    let value = await categorySchema.validate(req.body);
    if(value.error){
        throw new ApiError(422,value.error.details[0].message)
    }else{
        next();
    }
})


export {categoryValidation}