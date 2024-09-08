
import {db} from '../../server.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {uploadToCloud} from "../utils/imagekit.js";
import {queryFire,paginationInfo} from "./common.controller.js";
import fs from "fs";



const addAndUpdateCategory = asyncHandler(async(req,res)=>{
  try {
    const data = req.body;
    let authUser = req.user.user_id ? req.user.user_id : 0;

    let checkCategory  = await queryFire(`SELECT * FROM categories WHERE category_title  = '${data.category_title}' AND parent_category_id = '${data.parent_category_id || 0}'`);
    if(checkCategory && checkCategory.length > 0){
      return res.status(422).json(new ApiResponse(422,{},"the category already exists."))
    }
    let category_icon
    let category_image
    if(req.files?.category_icon && req.files?.category_icon[0]?.path){
      let filepath = req.files?.category_icon[0]?.path;
      let filename = req.files?.category_icon[0].filename;
      let fileDetails = await uploadToCloud(filepath,filename)
      category_icon = fileDetails.url
    }else{
      category_icon = data.category_icon
    }

    if(req.files?.category_image && req.files?.category_image[0]?.path){
      let filepath = req.files?.category_image[0]?.path;
      let filename = req.files?.category_image[0].filename;
      let fileDetails = await uploadToCloud(filepath,filename)
      category_image = fileDetails.url
      // console.log(fileDetails.url);
    }else{
      category_image = data.category_image
    }
    
    let trimSlug= (data.category_title || '').trim().replace(/\s+/g, " ");
    let category_slug = trimSlug.toLowerCase().replaceAll(' ',"-")
    console.log(category_slug);
    // return res.status(200).json(new ApiResponse(200,{},"Data update successfully."));
    if(!data.category_id){
        let query = `INSERT INTO categories (category_title, category_slug,parent_category_id,sort_order, status,
        header_category, banner_category, slider_category, section_category, category_icon,category_image,
        meta_title,meta_description,meta_keywords,added_by,added_date,modified_by,modified_date) 
        VALUES ('${data.category_title || ''}','${category_slug || ''}','${data.parent_category_id || 0}','${data.sort_order || 0}','${data.status || 1}',
        '${data.header_category || 0}','${data.banner_category || 0}','${data.slider_category || 0}','${data.section_category || 0}','${category_icon || ''}','${category_image || ''}',
        '${data.meta_title || ''}','${data.meta_description || ''}','${data.meta_keywords || ''}','${authUser}',NOW(),'${authUser}',NOW())`;
        
        let insertData = await queryFire(query)
        return res.status(200).json(new ApiResponse(200,{insertData},"Data insert successfully."));

    }else if(data.category_id > 0){
        let query = `UPDATE categories SET category_title = '${data.category_title || ''}', category_slug ='${category_slug || ''}',parent_category_id = '${data.parent_category_id || 0}',sort_order = '${data.sort_order || 0}', status = '${data.status || 1}',
          header_category = '${data.header_category || 0}', banner_category = '${data.banner_category || 0}', slider_category='${data.slider_category || 0}', section_category='${data.section_category ||0}', category_icon='${category_icon || ''}',category_image='${category_image || ''}',
          meta_title='${data.meta_title || ''}',meta_description='${data.meta_description || ''}',meta_keywords='${data.meta_keywords || ''}',modified_by = '${authUser}',modified_date = NOW() WHERE category_id = ${data.category_id}`;
          
          let insertData = await queryFire(query)
          return res.status(200).json(new ApiResponse(200,{insertData},"Data update successfully."));
    }
    
  } catch (error) {
    throw new ApiError(409, "Something went wrong.",error)
  }
})

const getCategory = asyncHandler(async(req,res)=>{
 try {
    const data = req.query;
    
    if(data.category_id > 0){
      let query1 = `SELECT * FROM categories WHERE category_id =${data.category_id} `;
      // let query2 = `SELECT * FROM categories WHERE parent_category_id =${data.category_id}`;
      let parentCategory = await queryFire(query1);
      // let childCategory = await queryFire(query2);
      parentCategory = parentCategory ? parentCategory[0] : ""
      return res.status(200).json(new ApiResponse(200,{parentCategory},"Data fetch successfully."));
    }
  } catch (error) {
    throw new ApiError(409, "Something went wrong.",error)
  }

})


const getCategoryList = asyncHandler(async(req,res) =>{

    try {
      const data = req.body;
  
      let page = data.page && data.page > 0 ? +data.page :1
      let limit = data.limit && data.limit > 0 ? +data.limit :10
  
      let viaCategoryName = data.viaCategoryName || '';
      let viaStatus = data.viaStatus ? JSON.parse(data.viaStatus).join(",") : '';
  
      let query = `SELECT A.category_id,A.category_title,A.parent_category_id,B.category_title As parent_category_title,A.status 
                  FROM categories AS A LEFT JOIN categories AS B On A.parent_category_id = B.category_id`
  
      let whereClause=''
      if(viaCategoryName || viaStatus){
        whereClause += ' WHERE'
      }
      if(viaCategoryName){
        whereClause += ` A.category_title LIKE '%${viaCategoryName}%'`;
      }
      if(viaStatus){
        whereClause += `${viaCategoryName ? ' AND' :''} A.status  IN (${viaStatus})`;
      }
  
      query+= whereClause
      
      let count = await queryFire(query)
      let TotalData = count.length
      let pagination = await paginationInfo(TotalData,page,limit)
  
      if(TotalData == 0){
        return res.status(200).json(new ApiResponse(200,{pagination},"Data fetch successfully."));
      }
  
      query+=` LIMIT ${pagination.limit} OFFSET ${pagination.offset}`
      let categories = await queryFire(query)
  
      return res.status(200).json(new ApiResponse(200,{categories,pagination},"Data fetch successfully."));
  
    } catch (error) {
      throw new ApiError(409, "Something went wrong.",error)
    }

})





export {addAndUpdateCategory,getCategory,getCategoryList};