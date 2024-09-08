import ImageKit from "imagekit";
import fs from "fs";
import {Blob} from "buffer"

const imageKIT2 = await new ImageKit({
    publicKey : "public_fGdpllNYQQYrfbXf7uZzuXtBNkA=",
    privateKey : "private_omOrcKWGkLx/RLrmBC4HdeDAEqU=",
    urlEndpoint : "https://ik.imagekit.io/gr9gvq8ow"
});


const uploadToClouds = async (localFilePath,fileNAME) =>{
    try {
        if(!localFilePath) return null;

       let kl =  fs.readFile(localFilePath, (err, data) => {
            if (err) throw err;
            
             imageKIT2.upload(
                {
                    file : data,//required
                    fileName : fileNAME,//required
                    extensions: [
                        {
                            name: "google-auto-tagging",
                            maxTags: 0,
                            minConfidence: 0
                        }
                    ],
                    transformation: {
                        pre: 'l-text,i-Imagekit,fs-50,l-end',
                        post: [
                            {
                                type: 'transformation',
                                value: 'w-100'
                            }
                        ]
                    }
                },
                function (error, result) {
                    if (error) {
                    // console.log("Error:", error);
                    } else {
                        return result
                    // console.log("Success:", result);
                    }
                }
            )

          });
          
          return kl
        
        
    } catch (error) {
        return error
        // fs.unlinkSync(localFilePath)
    }
}


const uploadToCloud = async (localFilePath,fileName)=>{
    return new Promise((resolve, reject) => {
        fs.readFile(localFilePath, (err, data) => {
          if (err) {
            reject(err); // Handle file reading error
            return; // Exit the callback function to prevent further execution
          }
    
          const imageKitOptions = {
            file: data,
            fileName: fileName,
            extensions: [
              {
                name: "google-auto-tagging",
                maxTags: 0,
                minConfidence: 0
              }
            ],
            transformation: {
              pre: 'l-text,i-Imagekit,fs-50,l-end',
              post: [
                {
                  type: 'transformation',
                  value: 'w-100'
                }
              ]
            }
          };
    
          imageKIT2.upload(imageKitOptions, (error, result) => {
            if (error) {
              // console.log(error)
              reject(error); // Handle ImageKit upload error
            } else {
              fs.unlinkSync(localFilePath)
              // console.log(localFilePath)
              resolve(result); // Resolve the promise with the upload result
            }
          });
        });
      });
}

export {uploadToCloud}