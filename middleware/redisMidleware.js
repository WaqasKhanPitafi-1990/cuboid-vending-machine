const Redis=require('redis')
const fs = require('fs')
require('dotenv').config();
const REDIS_PORT=process.env.REDIS_PORT ||6379
const client =Redis.createClient(REDIS_PORT);

client.connect();


const casheMiddleware=async (req,res,next)=>{
try{
    let ln=req.header('Accept-Language')
   
    if(ln!="no"&&ln!="en"){
        ln="en"
    }
    const data=  await client.get(ln)

    if(!data){
      
     fs.readFile(`./locales/${ln}/translation.json` , async(err, data) => {
        
    if(err){
         console.error(err)
         return res.json({ success:false,message:err})
         }
       
  const translate= await JSON.parse(data)
  await client.set(ln,JSON.stringify(translate))
  
  req.language= await client.get(ln)
  next() 
      })
     
   }else{

    client.get(ln)
    req.language=await client.get(ln)

next()
}
}
catch(error){
    return res.status(202).json({
        success:false,
        message:error.message
      })
   
}
}

module.exports=casheMiddleware