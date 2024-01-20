const { StatusCodes } = require("http-status-codes")
const FileSchema = require('../model/fileModel')
const User = require('../model/userModel')
const path = require('path')
const fs = require('fs')
const fileType = require('../util/fileExt')

//remove file
const removeTemp = (filePath) =>{
    fs.unlinkSync(filePath) 
}
//upload -post+data
const uploadFile = async(req, res) => {
    try{
        const {product} = req.files 
        // return res.json({fileExt, product})
        const id = req.userId 

        //check the public folder if folder not exists create it
        const outPath = path.join(__dirname, '../public')
        if(!fs.existsSync(outPath)){
            fs.mkdirSync(outPath, {recursive: true})
        }
        //no files are attached
        if(!req.files)
        return res.status(StatusCodes.NOT_FOUND).json({msg: `No files to upload...`, success: false})

        //fetch user info
        let extUser = await User.findById({_id: id}).select('-password')
        
        //if user id not found
        if(!extUser){
        removeTemp(product.tempFilePath)
        return res.status(StatusCodes.CONFLICT).json({msg: `requested user id not found`, success: false})
        }
        //validate the file txt
       if(product.mimetype === fileType.docx || product.mimetype === fileType.pptx||product.mimetype === fileType.doc
        ||product.mimetype ===fileType.ppt||product.mimetype ===fileType.pdf||
        product.mimetype ===fileType.png||product.mimetype ===fileType.jpg ||product.mimetype ===fileType.mp4){
            //rename the file -> doc-
            let ext = path.extname(product.name)
            let filename = `doc-${Date.now()}${ext}`
            
        //store the file in physical location
            await product.mv(path.resolve(__dirname, `../public/${filename}`), async(err) => {
                if(err){
                removeTemp(product.tempFilePath)
                return res.status(StatusCodes.CONFLICT).json({msg: err, success: false})
            }
                //add file info to db collection
            let fileRes = await FileSchema.create(
                {   userId: extUser._id, 
                    newName: filename,
                    extName:ext,
                    user: extUser, 
                    info: product})
       
        // final response
        res.status(StatusCodes.ACCEPTED).json({msg: "file uploaded successfully", file: fileRes, success: true})
        }) 
        }else{
                removeTemp(req.files.product.tempFilePath)
                return res.status(StatusCodes.CONFLICT).json({msg: `upload only .pdf, .doc, .docx, .ppt, .pptx, .png, .jpeg files`, success: false})
               }
       } catch(err){
        removeTemp(req.files.product.tempFilePath)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err, success: false})
    }
}

//read all -get
const readAll = async(req, res) => {
    try{
        let files = await FileSchema.find({})
        let filtered = files.filter((item) => item.userId === req.userId)
        res.status(StatusCodes.OK).json({length: filtered.length, files: filtered, success: true})
        // res.json({msg: "read all"})
    }catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err, success: false})
    }
}

//read single -get + ref
const readSingle = async(req, res) => {
    try{
        let fileId = req.params.id 
        let userId = req.userId

        //read existing file data ref to id
        let extFile = await FileSchema.findById({_id: fileId})
        if(!extFile)
        return res.status(StatusCodes.CONFLICT).json({msg: `Requested file id not exists`, success: false})

        //if file belongs to authorized user or not
        if(userId != extFile.userId)
        return res.status(StatusCodes.UNAUTHORIZED).json({msg: `unauthorized file read..`, success: false}) 

        res.status(StatusCodes.ACCEPTED).json({file: extFile, success: true}) 
        
    }catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err, success: false})
    }
}

//delete -delete
const deleteFile = async(req, res) => {
    try{
        let fileId = req.params.id 
        let userId = req.userId

        //read existing file data ref to id
        let extFile = await FileSchema.findById({_id: fileId})
        if(!extFile)
        return res.status(StatusCodes.CONFLICT).json({msg: `Requested file id not exists`, success: false})

        //if file belongs to authorized user or not
        if(userId != extFile.userId)
        return res.status(StatusCodes.UNAUTHORIZED).json({msg: `unauthorized file read..`, success: false}) 
        
        //delete physical file from directory
        let filePath = path.resolve(__dirname, `../public/${extFile.newName}`)
        if(fs.existsSync(filePath)){
            //to delete the file
            await fs.unlinkSync(filePath) 
            //to remove file info in db collection
            await FileSchema.findByIdAndDelete({_id:extFile._id})
        
        // if(fs.existsSync.resolve(__dirname,`../public/${extFile.newName}`)){
            // return res.json({msg: 'file exists', extFile})
            return res.status(StatusCodes.ACCEPTED).json({msg: 'file deleted successfully', success: true})
        }else {
            return res.json({msg:'file not exists', extFile, success: false})
        }

    }catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err, success: false})
    }
}
//to read all file contents without authentication
const allFiles = async(req, res) => {
    try{
        let files = await FileSchema.find({})
        // let filtered = files.filter((item) => item.userId === req.userId)
        res.status(StatusCodes.OK).json({length: files.length, files, success: true}) 
        console.log("res", files);
    } catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err, success: false})
    }
}
const filterType = async(req, res) => {
    try{
        let data = req.query 
        let files = await FileSchema.find({}) 

        if(data.type === "all"){
            res.status(StatusCodes.OK).json({data, length: files.length, files, success: true}) 
       
        }else{
        let filtered = files.filter((item) => item.extName === `.${data.type}`) 

            res.status(StatusCodes.OK).json({data, length: filtered.length, filtered, success: true}) 
        }
    }catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err, success: false})
    }
}



module.exports = {uploadFile, readAll, readSingle, deleteFile, allFiles, filterType}