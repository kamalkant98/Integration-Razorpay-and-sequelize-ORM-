
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {queryFire} from "../controllers/common.controller.js";
import jwt from "jsonwebtoken";

export const verifiedJWT = asyncHandler( async (req,res,next) => {
    try {
        const accessToken =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") 
        // const accessToken = req.header("Authorization")?.replace("Bearer ","");
        if(!accessToken){
            throw new ApiError(401,"Unauthorized request")
        }
        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
        const user = await queryFire(`SELECT user_id,email,first_name,last_name,phone FROM admin_users WHERE user_id = '${decodedToken?.user_id}'`)
        
        if(user.length <= 0){
            throw new (404,"Authorized user not found.")
        }
    
        req.user = user[0]
        next()
    } catch (error) {
        throw new ApiError(500,error)
    }

})