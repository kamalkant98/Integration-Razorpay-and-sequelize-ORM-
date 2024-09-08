import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import {uploadToCloud} from "../utils/imagekit.js"
import {queryFire,paginationInfo} from "./common.controller.js";
import fs from "fs";

const addAndUpdateVendors = asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    let authUser = req.user.user_id ? req.user.user_id : 0;
    let vendor_timings = data.vendor_timings
    
    if (!data.email) {
      res.status(400).json({ message: "Email required" });
    }
  
    if(!data.customer_id){
      let checkEmail = await queryFire(`SELECT * FROM vendors WHERE email = '${data.email}'`);
      if (checkEmail.length > 0) {
        return res.status(422).json(new ApiResponse(422,{},"Email address already exists."));
      }

      if(data.phone){
        let checkPhone = await queryFire(`SELECT * FROM vendors WHERE phone = '${data.phone}'`);
        if (checkPhone.length > 0) {
          return res.status(422).json(new ApiResponse(422,{},"Phone already exists."));
        }
      }

      if(data.whatsapp_number){
        let checkPhone = await queryFire(`SELECT * FROM vendors WHERE whatsapp_number = '${data.whatsapp_number}'`);
        if (checkPhone.length > 0) {
          return res.status(422).json(new ApiResponse(422,{},"Whatsapp number already exists."));
        }
      }
      
      
      const query = `INSERT INTO vendors (vendor_unique_id,vendor_name,business_name,email,phone,whatsapp_number,website,address_line_1,
                        address_line_2,city_id,state_id,pincode,latitude,longitude,google_location,gstin,year_of_establishment,
                        tags,status,verified,ratings,meta_title,meta_description,meta_keywords,is_vendor,added_by,added_date,modified_by,modified_date
                        ) 
                        VALUES ('','${data.vendor_name || ''}','${data.business_name || null}', '${data.email}','${data.phone}', '${data.whatsapp_number || null}','${data.website || null}','${data.address_line_1 || null}',
                        '${data.address_line_2 || null}',${data.city || null},${data.state || null},${data.pincode || null},'${data.latitude || null}', '${data.longitude || null}', '${data.google_location || null}', '${data.gstin || null}','${data.year_of_establishment || null}',
                        '${data.tags || null}', ${data.status || 0}, ${data.verified || 0}, ${data.ratings || 5}, '${data.meta_title || null}', '${data.meta_description || null}', '${data.meta_keywords || null}', ${data.is_vendor || 1},'${authUser}',NOW(),'${authUser}',NOW())`;
    
      let insertData = await queryFire(query)
        console.log(insertData.insertId);
        if(insertData.insertId > 0 && vendor_timings){
          Promise.all((JSON.parse(vendor_timings) || []).map(async(Items)=>{
            let query ;
            if(Items?.id && Items?.id > 0){
              query = `UPDATE vendor_timings SET customer_id ='${insertData.insertId}',weekday='${Items.weekday}',opening_hour='${Items.opening_hour}',closing_hour='${Items.closing_hour}' WHERE id = ${Items.id}`;
            }else{
              query = `INSERT INTO vendor_timings(customer_id, weekday, opening_hour, closing_hour) VALUES ('${insertData.insertId}','${Items.weekday}','${Items.opening_hour}','${Items.closing_hour}')`;
            }
            await queryFire(query);
          }))
        }
        
  
      return res.status(200).json(new ApiResponse(200,{insertData},"Data insert successfully."));
    }else if(data.customer_id && data.customer_id > 0){
      let checkEmail = await queryFire(`SELECT * FROM vendors WHERE email = '${data.email} and customer_id != ${data.customer_id}'`);
      if (checkEmail.length > 0) {
        // throw new ApiError(409, "Email address already exists.")
        return res.status(422).json(new ApiResponse(422,{},"Email address already exists."));
      }
  
      let query = `UPDATE vendors SET vendor_name= '${data.vendor_name}',business_name = '${data.business_name || null}',email= '${data.email}',phone= '${data.phone}',whatsapp_number= '${data.whatsapp_number || null}',website= '${data.website || null}',address_line_1= '${data.address_line_1 || null}',
                        address_line_2= '${data.address_line_2 || null}',city_id=' ${data.city || null}',state_id= '${data.state || null}',pincode= '${data.pincode || null}',latitude= '${data.latitude || null}',longitude= '${data.longitude || null}',google_location= '${data.google_location || null}',gstin= '${data.gstin || null}',year_of_establishment= '${data.year_of_establishment || null}',
                        tags= '${data.tags || null}',status= '${data.status || 0}',verified= '${data.verified || 0}',ratings= '${data.ratings || 5}',meta_title= '${data.meta_title || null}',meta_description= '${data.meta_description || null}',meta_keywords= '${data.meta_keywords || null}',is_vendor= '${data.is_vendor || 1}',
                        modified_by = '${authUser}',modified_date = NOW()  WHERE customer_id = ${data.customer_id}`
      let UpdateData = await queryFire(query)

      if(data.customer_id > 0 && vendor_timings){
        Promise.all((JSON.parse(vendor_timings) || []).map(async(Items)=>{
          let query ;
          if(Items?.id && Items?.id > 0){
            query = `UPDATE vendor_timings SET customer_id ='${data.customer_id}',weekday='${Items.weekday}',opening_hour='${Items.opening_hour}',closing_hour='${Items.closing_hour}' WHERE id = ${Items.id}`;
          }else{
            query = `INSERT INTO vendor_timings(customer_id, weekday, opening_hour, closing_hour) VALUES ('${data.customer_id}','${Items.weekday}','${Items.opening_hour}','${Items.closing_hour}')`;
          }
          await queryFire(query);
        }))
      }
      return res.status(200).json(new ApiResponse(200,{},"Data Update successfully."));
    }
  } catch (error) {
    throw new ApiError(409, "Something went wrong.",error)
  }
  

});

const getVendor = asyncHandler(async(req,res) =>{
    try {
      if(req.query.customer_id && req.query.customer_id > 0){
        // let get = await queryFire(`SELECT * FROM vendors WHERE customer_id = '${req.query.customer_id}'`);
        let vendors = await queryFire(`SELECT vendors.*,state.state_name,city.city As city_name FROM vendors 
                                      LEFT JOIN state ON state.state_id = vendors.state_id 
                                      LEFT JOIN city ON city.id = vendors.city_id
                                      WHERE vendors.customer_id = '${req.query.customer_id}'`)
        let vendor_timings = await queryFire(`SELECT * FROM vendor_timings WHERE customer_id = '${req.query.customer_id}'`)
        if(vendors.length > 0){
          return res.status(200).json(new ApiResponse(200,{vendors:vendors[0],vendor_timings},"Data Update successfully."));
        }else{
          throw new ApiError(409, "Data not found")
        }
       
      }else{
        throw new ApiError(409, "customer_id required")
      }
    } catch (error) {
      throw new ApiError(409, "Something went wrong.",error)
    }
})

const deleteVendor = asyncHandler(async(req,res) =>{
  try {
    if(req.query.customer_id && req.query.customer_id > 0){
      let getVendorData = await queryFire(`DELETE FROM vendors WHERE customer_id = '${req.query.customer_id}'`)
      await queryFire(`DELETE FROM vendor_timings WHERE customer_id = '${req.query.customer_id}'`)
      if(getVendorData){
        return res.status(200).json(new ApiResponse(200,{},"Deleted successfully."));
      }
    }else{
      throw new ApiError(409, "customer_id required")
    }
  } catch (error) {
    throw new ApiError(409, "Something went wrong.",error)
  }
})

const getVenderList = asyncHandler(async(req,res)=>{
  try {
    const data = req.body;

    let page = data.page && data.page > 0 ? +data.page :1
    let limit = data.limit && data.limit > 0 ? +data.limit :5

    let viaName = data.viaName || '';
    let viaEmail = data.viaEmail || '';
    let viaPhone = data.viaPhone || '';
    let viaNumber = data.viaNumber || '';
    let viaCity = data.viaCity ? JSON.parse(data.viaCity).join(",") :'';
    let viaState = data.viaState ? JSON.parse(data.viaState).join(",") :'';
    let viaStatus = data.viaStatus ? JSON.parse(data.viaStatus).join(",") : '';
    let viaVerified = data.viaVerified ? JSON.parse(data.viaVerified).join(",") :'';


    let query = `SELECT *,state.state_name,city.city As city_name,vendors.state_id as state_id,vendors.city_id as city_id
                FROM vendors LEFT JOIN state ON state.state_id = vendors.state_id 
                LEFT JOIN city ON city.id = vendors.city_id`

    let whereClause=''
    if(viaName || viaEmail || viaPhone || viaNumber || viaCity || viaState || viaStatus || viaVerified){
      whereClause += ' WHERE'
    }
    if(viaName){
      whereClause += ` vendors.vendor_name LIKE '%${viaName}%'`;
    }
    if(viaEmail){
      whereClause += `${viaName ? ' AND' :''} vendors.email LIKE '%${viaEmail}%'`;
    }
    if(viaPhone){
      whereClause += `${viaEmail ? ' AND' :''} vendors.phone LIKE '%${viaPhone}%'`;
    }
    if(viaNumber){
      whereClause += `${viaPhone ? ' AND' :''} vendors.vendor_unique_id LIKE '%${viaNumber}%'`;
    }
    if(viaCity){
      whereClause += `${viaNumber ? ' AND' :''} vendors.city_id  IN (${viaCity})`;
    }
    if(viaState){
      whereClause += `${viaCity ? ' AND' :''} vendors.state_id IN (${viaState})`;
    }
    if(viaStatus){
      whereClause += `${viaState ? ' AND' :''} vendors.status IN (${viaStatus})`;
    }
    if(viaVerified){
      whereClause += `${viaStatus ? ' AND' :''} vendors.verified IN (${viaVerified})`;
    }

    query+= whereClause
    
    let count = await queryFire(query)
    let TotalData = count.length
    let pagination = await paginationInfo(TotalData,page,limit)
    if(TotalData == 0){
      return res.status(200).json(new ApiResponse(200,{pagination,vendors:[]},"Data fetch successfully."));
    }
    query+=` LIMIT ${pagination.limit} OFFSET ${pagination.offset}`
    // console.log(query);
    let vendors = await queryFire(query)

    return res.status(200).json(new ApiResponse(200,{vendors,pagination},"Data fetch successfully."));
  } catch (error) {
    throw new ApiError(409, "Something went wrong.",error)
  }
})

const createMultidimensionalArray =  async (data) => {
  const output = [];

  // Helper function to set value at specific index
  const setValueAtIndex = (array, indexes, value) => {
    let current = array;
    for (let i = 0; i < indexes.length - 1; i++) {
      if (!current[indexes[i]]) {
        current[indexes[i]] = [];
      }
      current = current[indexes[i]];
    }
    current[indexes[indexes.length - 1]] = value;
  };

  // Process each object in the input array
  data.forEach(item => {
    const match = item.fieldname.match(/serviceImage\[(\d+)\]\[(\d+)\]/);
    if (match) {
      const i = parseInt(match[1], 10);
      const j = parseInt(match[2], 10);
      setValueAtIndex(output, [i, j], item);
    }
  });

  return output;
}

const addAndUpdateVenderServiceOLD =  asyncHandler(async(req,res)=>{
  const data = req.body;
  // return res.status(200).json("asd")
  if(!data.service_id){
    // console.log("----")
    let service_unique_id = 'S-1001';
    let lastService = `SELECT service_unique_id FROM vendor_services ORDER BY service_id DESC LIMIT 1`;
    let getLastService = await queryFire(lastService)
    if(getLastService.length > 0){
      let getArr = (getLastService[0]?.service_unique_id).split('-')
      service_unique_id =  `S-${Number(getArr[1]) + 1}`
    }
    
    let query = `INSERT INTO vendor_services (service_unique_id, customer_id,category_id, status, added_by, added_date, modified_by, modified_date)
    VALUES ('${service_unique_id}','${data.customer_id}','${data.category_id}','${data.status}','','','','')`
    
    let insertData = await queryFire(query)
  

    if(data.specifications && insertData.insertId ){
      let allServiceImage  = await createMultidimensionalArray(req.files|| []);
      Promise.all((JSON.parse(data.specifications) || []).map(async(Items,sIndex)=>{
  
        let query = `INSERT INTO vendor_services_specifications (service_id,service_value,service_name) VALUES ('${insertData.insertId}','${Items.specification_key}','${Items.specification_value}')`
        let insertSpecifications  = await queryFire(query);
        if((Items.allServiceImage).length > 0){
          // console.log("asdasdasd");
          await Promise.all((Items.allServiceImage || []).map(async(imageData,index)=>{
            // console.log(imageData);
                let isFeatures = Items.features_image >= 0 && Items.features_image == index ? 1 : 0; 
                if(imageData?.path && fs.existsSync(imageData?.path)){
                    let filepath = imageData?.path;
                    let filename = imageData?.filename;
                    let fileDetails = await uploadToCloud(filepath,filename)
                    // console.log("======",fileDetails);
                    let imageUrl = fileDetails.url
                    
                    if(imageUrl){
                      let query = `INSERT INTO service_specifications_images (service_id,specification_id,image_url, features_image) VALUES ('${insertData.insertId}','${insertSpecifications.insertId}','${imageUrl}','${isFeatures}')`
                      await queryFire(query)
                    }
                }else if(imageData.id && imageData.id > 0 && !imageData.isDeleted){
                  let query = `INSERT INTO service_specifications_images (features_image) VALUES ('${isFeatures}')`
                  await queryFire(query)
                }else if(imageData.id && imageData.id > 0 && imageData.isDeleted == 1){
                  let query = `DELETE FROM  service_specifications_images WHERE = id  ${imageData.id}`
                  await queryFire(query)
                }
               
          }))
        }
        // if(insertSpecifications.insertId > 0){
        //   await Promise.all((allServiceImage[sIndex] || []).map(async(imageData,index)=>{
        //     let filepath = imageData?.path;
        //     let filename = imageData?.filename;
        //     let fileDetails = await uploadToCloud(filepath,filename)
        //     let imageUrl = fileDetails.url
        //     let isFeatures = Items.features_image >= 0 && Items.features_image == index ? 1 : 0; 
        //     if(imageUrl){
        //       let query = `INSERT INTO service_specifications_images (service_id,specification_id,image_url, features_image) VALUES ('${insertData.insertId}','${insertSpecifications.insertId}','${imageUrl}','${isFeatures}')`
        //       await queryFire(query)
        //     }
        //   }))
        // }


      }))
    }
    return res.status(200).json(new ApiResponse(200,{},"Data insert successfully."))

  }else if(data.service_id > 0){

    
    let query = `UPDATE vendor_services SET category_id='${data.category_id}',status='${data.status}',added_by='',added_date='',modified_by='',modified_date='' WHERE service_id = ${data.service_id}`
    let updateData = await queryFire(query)

    // return res.status(200).json({updateData})

    if(data.specifications && data.service_id > 0 ){
      let allServiceImage  = await createMultidimensionalArray(req.files|| []);
      Promise.all((JSON.parse(data.specifications) || []).map(async(Items,sIndex)=>{
        
        let insertSpecificationsID 
        if(Items.id && Items.id > 0){
           let query = `UPDATE vendor_services_specifications
                        SET service_name = '${Items.service_name}',service_value = '${Items.service_value}'
                        WHERE id = '${Items.id}'`;
            await queryFire(query);
          insertSpecificationsID = Items.id
        }else{
          let query = `INSERT INTO vendor_services_specifications (service_id,service_name,service_value) VALUES ('${data.service_id}','${Items.specification_key}','${Items.specification_value}')`
          let insertSpecifications  = await queryFire(query);
          insertSpecificationsID = insertSpecifications.insertId
        }
        

        if((Items.allServiceImage).length > 0){
          // await queryFire(`DELETE FROM service_specifications_images WHERE service_id = ${data.service_id} AND specification_id = ${insertSpecificationsID}`)
          await Promise.all((Items.allServiceImage || []).map(async(imageData,index)=>{
                let isFeatures = Items.features_image >= 0 && Items.features_image == index ? 1 : 0; 
                if(imageData?.path && fs.existsSync(imageData?.path)){
                    let filepath = imageData?.path;
                    let filename = imageData?.filename;
                    let fileDetails = await uploadToCloud(filepath,filename)
                    let imageUrl = fileDetails.url
                    
                    if(imageUrl){
                      let query = `INSERT INTO service_specifications_images (service_id,specification_id,image_url, features_image) VALUES ('${data.service_id}','${insertSpecificationsID}','${imageUrl}','${isFeatures}')`
                      await queryFire(query)
                    }
                }else if(imageData.id && imageData.id > 0 && !imageData.isDeleted){
                  let query = `INSERT INTO service_specifications_images (features_image) VALUES ('${isFeatures}')`
                  await queryFire(query)
                }else if(imageData.id && imageData.id > 0 && imageData.isDeleted == 1){
                  let query = `DELETE FROM  service_specifications_images WHERE id = ${imageData.id}`
                  await queryFire(query)
                }
               
          }))
        }
  
        // if(insertSpecificationsID > 0){
        //   console.log(allServiceImage.length)
        //   await Promise.all((allServiceImage[sIndex] || []).map(async(imageData,index)=>{
        //     // let filepath = imageData?.path;
        //     // let filename = imageData?.filename;
        //     // let fileDetails = await uploadToCloud(filepath,filename)
        //     // let imageUrl = fileDetails.url
        //     // let isFeatures = Items.features_image >= 0 && Items.features_image == index ? 1 : 0; 
        //     // if(imageUrl){
        //     //   let query = `INSERT INTO service_specifications_images (service_id,specification_id,image_url, features_image) VALUES ('${insertData.insertId}','${insertSpecifications.insertId}','${imageUrl}','${isFeatures}')`
        //     //   await queryFire(query)
        //     // }
        //   }))
        // }
      }))
    }
    // if(req.files?.serviceImage && data.service_id > 0){

    //   await Promise.all((req.files?.serviceImage).map(async(imageData,index)=>{
    //       let filepath = imageData?.path;
    //       let filename = imageData?.filename;
    //       let fileDetails = await uploadToCloud(filepath,filename)
    //       let imageUrl = fileDetails.url
    //       let isFeatures = data.features_image && data.features_image == index ? 1 : 0; 
    //       if(imageUrl){
    //         let query = `INSERT INTO service_images (service_id, image_url, features_image) VALUES ('${data.service_id}','${imageUrl}','${isFeatures}')`
    //         await queryFire(query)
    //       }

    //   }))
    // }
    return res.status(200).json(new ApiResponse(200,{},"Data update successfully."))
  }

  throw new ApiError(422,'Something went wrong')
  
  

})


const addAndUpdateVenderService =  asyncHandler(async(req,res)=>{
  const data = req.body;
  let authUser =  req.user.user_id ? req.user.user_id : 0
  // return res.status(200).json(authUser)
  
  if(data.customer_id && data.category_id){
   if(data.specifications){
     // return res.status(200).json(authUser)
      Promise.all((JSON.parse(data.specifications) || []).map(async(Items,sIndex)=>{
        
        let insertSpecificationsID 
        if(Items.id && Items.id > 0){
          let query = `UPDATE vendor_services
                        SET service_name = '${Items.service_name}',service_value = '${Items.service_value}',
                        status = '${Items.status}', customer_id = '${data.customer_id}',category_id = '${data.category_id}',modified_by = '${authUser}',modified_date = NOW()
                        WHERE id = '${Items.id}'`;
            await queryFire(query);
          insertSpecificationsID = Items.id
        }else{
          console.log(Items.specification_key,"===",Items.specification_value);
          let query = `INSERT INTO vendor_services (service_name,service_value,status,customer_id,category_id,added_by,added_date,modified_by,modified_date) VALUES ('${Items.service_name}','${Items.service_value}','${Items.status || 1}','${data.customer_id}','${data.category_id}','${authUser}',NOW(),'${authUser}',NOW())`
          let insertSpecifications  = await queryFire(query);
          insertSpecificationsID = insertSpecifications.insertId
        }
        

        if((Items.allServiceImage).length > 0 && insertSpecificationsID > 0){
          await Promise.all((Items.allServiceImage || []).map(async(imageData,index)=>{
                let isFeatures = Items.features_image >= 0 && Items.features_image == index ? 1 : 0; 
                if(imageData?.path && fs.existsSync(imageData?.path)){
                    let filepath = imageData?.path;
                    let filename = imageData?.filename;
                    let fileDetails = await uploadToCloud(filepath,filename)
                    let imageUrl = fileDetails.url
                    // let imageUrl = imageData?.path
                    if(imageUrl){
                      let query = `INSERT INTO service_specifications_images (service_id,image_url,features_image) VALUES ('${insertSpecificationsID}','${imageUrl}','${isFeatures}')`
                      await queryFire(query)
                    }
                }else if(imageData.id && imageData.id > 0 && !imageData.isDeleted){
                  let query = `INSERT INTO service_specifications_images (features_image) VALUES ('${isFeatures}')`
                  await queryFire(query)
                }else if(imageData.id && imageData.id > 0 && imageData.isDeleted == 1){
                  let query = `DELETE FROM  service_specifications_images WHERE id = ${imageData.id}`
                  await queryFire(query)
                }
               
          }))
        }
      }))
    }
    return res.status(200).json(new ApiResponse(200,{},"Data updated successfully."))

  }

  throw new ApiError(422,'Something went wrong')
  
  

})

const getService = asyncHandler(async(req,res) =>{
  
  if(req.query.category_id && req.query.customer_id > 0){
    let serviceData = await queryFire(`SELECT * FROM vendor_services WHERE customer_id = ${req.query.customer_id} AND category_id = ${req.query.category_id}`);
    if(serviceData.length > 0 ){
      serviceData = await Promise.all(serviceData.map(async(item)=>{
                let getSpecificationsImage = await queryFire(`SELECT * FROM service_specifications_images WHERE service_id = ${item.id}`)
                item.getSpecificationsImage = getSpecificationsImage
                return item
      }))
    }
    return res.status(200).json(new ApiResponse(200,{serviceData}))
  }else{
    throw new ApiError(422,"service_id is required.")
  }
  
})

const getServiceList = asyncHandler(async(req,res) =>{

   try {
     const data = req.body;
 
     let page = data.page && data.page > 0 ? +data.page :1
     let limit = data.limit && data.limit > 0 ? +data.limit :5
 
     let query = `SELECT A.customer_id,A.category_id,B.category_title  FROM vendor_services As A LEFT JOIN categories As B ON B.category_id  = A.category_id WHERE A.customer_id  = ${data.customer_id} GROUP BY A.category_id`
     let count = await queryFire(query)
     let TotalData = count.length
     let pagination = await paginationInfo(TotalData,page,limit)
     if(TotalData == 0){
       return res.status(200).json(new ApiResponse(200,{pagination,services:[]},"Data fetch successfully."));
     }
     query+=` LIMIT ${pagination.limit} OFFSET ${pagination.offset}`
     let services = await queryFire(query)
     return res.status(200).json(new ApiResponse(200,{services,pagination},"Data fetch successfully."));
 
   } catch (error) {
      throw new ApiError(409, "Something went wrong.",error)
   }
})

const deleteService = asyncHandler(async(req,res) =>{
  try {
    if(req.query.customer_id && req.query.category_id ){

      let serviceData = await queryFire(`SELECT * FROM vendor_services WHERE customer_id = ${req.query.customer_id} AND category_id = ${req.query.category_id}`);
      if(serviceData.length > 0 ){
        serviceData = await Promise.all(serviceData.map(async(item)=>{
                  let getSpecificationsImage = await queryFire(`DELETE FROM service_specifications_images WHERE service_id = ${item.id}`)
                  item.getSpecificationsImage = getSpecificationsImage
                  return item
        }))
      }

      let getServiceData = await queryFire(`DELETE FROM vendor_services WHERE customer_id = ${req.query.customer_id} AND category_id = ${req.query.category_id}`)
      if(getServiceData){
        return res.status(200).json(new ApiResponse(200,{},"Deleted successfully."));
      }
    }else{
      throw new ApiError(409, "service_id required")
    }
  } catch (error) {
    throw new ApiError(409, "Something went wrong.",error)
  }
})


const addAndUpdateContact = asyncHandler(async(req,res)=>{
  const data = req.body;
  if(!data.vendor_contact_person_id){

    let query = `INSERT INTO vendor_contact_persons(customer_id, first_name, last_name, email, phone, contact_type_id,status) 
                VALUES ('${data.customer_id}','${data.first_name}','${data.last_name}','${data.email}','${data.phone}','${data.contact_type_id}','${data.status}')`
    let insertData = await queryFire(query);
    return res.status(200).json(new ApiResponse(200,{},"Data insert successfully."))
  }else if(data.vendor_contact_person_id > 0 ){
    let query =  `UPDATE vendor_contact_persons SET customer_id='${data.customer_id}',first_name='${data.first_name}',last_name='${data.last_name}',email='${data.email}',phone='${data.phone}',contact_type_id='${data.contact_type_id}',status='${data.status}' WHERE vendor_contact_person_id = ${data.vendor_contact_person_id}`;
    let updateData = await queryFire(query);
    return res.status(200).json(new ApiResponse(200,{},"Data update successfully."))
  }

})

const getContact = asyncHandler(async(req,res)=>{
    try {
      if(req.query.vendor_contact_person_id > 0){
        let query = `SELECT A.*,B.contact_type As contact_type_name FROM vendor_contact_persons As A LEFT JOIN contact_types As B ON A.contact_type_id = B.contact_type_id WHERE A.vendor_contact_person_id = ${req.query.vendor_contact_person_id}`;
        let getData = await queryFire(query);
        return res.status(200).json(new ApiResponse(200,{getData:getData?.[0]},"Data fetch successfully."))
      }else{
        return res.status(422).json(new ApiError(422,"vendor_contact_person_id required."))
      }
    } catch (error) {
      throw new ApiError(409, "Something went wrong.",error)
    }

});


const deleteContact = asyncHandler(async(req,res)=>{
  try {
    if(req.query.vendor_contact_person_id > 0){
      let query = `DELETE FROM vendor_contact_persons WHERE vendor_contact_person_id = ${req.query.vendor_contact_person_id}`;
      let getData = await queryFire(query);
      return res.status(200).json(new ApiResponse(200,{},"Data Deleted"))
    }else{
      return res.status(422).json(new ApiError(422,"vendor_contact_person_id required."))
    }
  } catch (error) {
    throw new ApiError(409, "Something went wrong.",error)
  }

});


const getContactList = asyncHandler(async(req,res) =>{

  try {
    const data = req.body;
    if(!data.customer_id){
      return res.status(422).json(new ApiError(422,'','customer_id required.'))
    }
    let page = data.page && data.page > 0 ? +data.page :1
    let limit = data.limit && data.limit > 0 ? +data.limit :10

    let query =  `SELECT A.*,B.contact_type As contact_type_name FROM vendor_contact_persons As A LEFT JOIN contact_types As B ON A.contact_type_id = B.contact_type_id WHERE A.customer_id = ${data.customer_id}`;

    let count = await queryFire(query)
    let TotalData = count.length
    let pagination = await paginationInfo(TotalData,page,limit)

    if(TotalData == 0){
      return res.status(200).json(new ApiResponse(200,{pagination},"Data fetch successfully."));
    }

    query+=` LIMIT ${pagination.limit} OFFSET ${pagination.offset}`
    let contactList = await queryFire(query)

    return res.status(200).json(new ApiResponse(200,{contactList:contactList,pagination},"Data fetch successfully."));

  } catch (error) {
    throw new ApiError(409,"Something went wrong.",error)
  }

})





export { addAndUpdateVendors,getVendor,deleteVendor,getVenderList,addAndUpdateVenderService,getService,getServiceList,
  deleteService,addAndUpdateContact,getContact,deleteContact,getContactList
};
