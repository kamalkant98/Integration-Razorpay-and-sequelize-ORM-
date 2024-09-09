import { db } from "../../server.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import fs from "fs";

const queryFire = async (DBquery) => {
    let queryPromise = new Promise((resolve, reject) => {
      try {
        db.query(DBquery, function (err, result, fields) {
          if (err) throw err;
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
  
    return queryPromise;
};
  
const paginationInfo = async(totalRow= 0,currentPage =1,limit= 10) => {
    if(totalRow){
        const totalPages = Math.ceil(totalRow / limit);
        const firstPage = 1;
        const lastPage = totalPages > 0 ? totalPages : 1;

        const offset = (currentPage - 1) * limit;
        const adjustedLimit = Math.min(limit, totalRow - offset);
        return {
            totalData: totalRow,
            currentPage,
            firstPage,
            lastPage,
            offset,
            limit: adjustedLimit,
        };
    }else{
        return {
            totalData: totalRow,
            currentPage :currentPage,
            firstPage:1,
            lastPage:0,
            offset:0,
            limit: limit,
        };
    }
}

const getCityList = asyncHandler(async(req,res) =>{
    try {
        const data = req.query;
        let cityList;
        if(data.state_id){
            cityList = await queryFire(`SELECT city As label,id As value,state_id  FROM city WHERE state_id = '${data.state_id}' WHERE city != "" ORDER BY city ASC`)  
        }else{
            cityList = await queryFire(`SELECT city As label,id As value  FROM city WHERE city != "" ORDER BY city ASC`)  
        }
        return res.status(200).json(new ApiResponse(200,{cityList},"Data Update successfully."));
    } catch (error) {
        throw new ApiError(409, "Something went wrong.",error)
    }
})

const getStateList = asyncHandler(async(req,res) =>{
    try {
        const data = req.query;
        let cityList;
        if(data.state_id){
            cityList = await queryFire(`SELECT state_name As label,state_id As value, gst_state_code  FROM state WHERE state_id = '${data.state_id}' WHERE state_name != "" ORDER BY state_name ASC`)  
        }else{
            cityList = await queryFire(`SELECT state_name As label,state_id As value, gst_state_code  FROM state WHERE state_name != "" ORDER BY state_name ASC`)  
        }
        return res.status(200).json(new ApiResponse(200,{cityList},"Data Update successfully."));
    } catch (error) {
        throw new ApiError(409, "Something went wrong.",error)
    }
})

const getAllParentCategories = asyncHandler(async(req,res) =>{
    try {
        let query1 = `SELECT category_id as value, category_title As label FROM categories WHERE parent_category_id = 0  and status = 1 ORDER BY category_title ASC`;
        let allParentCategory = await queryFire(query1);
        return res.status(200).json(new ApiResponse(200,{allParentCategory},"Data fetch successfully."));
    } catch (error) {
        throw new ApiError(409, "Something went wrong.",error)
    }
})

const getAllCategories = asyncHandler(async(req,res) =>{
    try {
        let query1 = `SELECT A.category_id as value, A.category_title As label ,A.parent_category_id, B.category_title As parent_category_title FROM categories As A  
                        LEFT JOIN categories As B On B.category_id = A.parent_category_id
                        WHERE A.status = 1 ORDER BY A.category_title ASC`;
        let getAllCategories = await queryFire(query1);
        return res.status(200).json(new ApiResponse(200,{getAllCategories},"Data fetch successfully."));
    } catch (error) {
        throw new ApiError(409, "Something went wrong.",error)
    }
})

const getAllContactTypes = asyncHandler(async(req,res)=>{
    try {
        let query =`SELECT contact_type_id As value , contact_type As label FROM contact_types ORDER BY contact_type ASC`
        let getAllContactTypes = await queryFire(query);
        return res.status(200).json(new ApiResponse(200,{getAllContactTypes:getAllContactTypes},"Data fetch successfully."));
    } catch (error) {
        throw new ApiError(409,"Something went wrong.",error)
    }
})

const filesUpload = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,{"files":req.files},"Data fetch successfully."));
    // console.log(req.files)
})




export {queryFire,paginationInfo,getCityList,getStateList,getAllParentCategories,getAllCategories,getAllContactTypes,filesUpload}