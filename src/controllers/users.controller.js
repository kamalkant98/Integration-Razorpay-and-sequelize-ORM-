import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadToCloud} from "../utils/imagekit.js"
import {queryFire,paginationInfo} from "./common.controller.js";
import bcrpty from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";

const generateAccessAndRefreshToken = async(user_id) =>{
    let getUser = await queryFire(`SELECT * FROM admin_users WHERE user_id = '${user_id}'`)
    if(getUser?.length <= 0){
        throw new ApiError(409, "Something went wrong.",error)
    }

   let accessToken = await jwt.sign({
        user_id:user_id,
        email:getUser[0].email,
        first_name:getUser[0].first_name,
        last_name:getUser[0].last_name,
    },
    process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )

    let refreshToken = await jwt.sign({
                user_id:user_id,
                },
                process.env.REFRESH_TOKEN_SECRET,
                    {
                        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
                    }
                )
    await queryFire(`UPDATE admin_users SET refresh_token= '${refreshToken}' WHERE user_id = '${user_id}'`)            
    return {accessToken,refreshToken}

}

const login = asyncHandler(async(req,res)=>{
    const data= req.body;
    let getUser = await queryFire(`SELECT * FROM admin_users WHERE email = '${data.email}'`)
    if(getUser?.length <= 0){
        return res.status(200).json(new ApiResponse(200,{},"user doesn't exist."))
    }
    
    let checkPassword  = await bcrpty.compare(data.password,getUser[0].password);
    if(!checkPassword){
        return res.status(200).json(new ApiResponse(200,{},"Password doesn't match."))
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(getUser[0].user_id)
    
    const option = {
        httpOnly:true,
        secure:true
    }
    return res.status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",refreshToken,option)
        .json(
            new ApiResponse(
                200,
                {
                    user:getUser[0],accessToken,refreshToken
                },"User logged in successfully."
            )
        )
   

})

export {login}