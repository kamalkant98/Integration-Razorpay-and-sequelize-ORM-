import multer from "multer";

const storage = await multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now()+ '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix+"_"+file.originalname);
    }
  })
  
export const upload = multer({storage});