const Redis=require('redis')
const fs = require('fs')
require('dotenv').config();
const REDIS_PORT=process.env.REDIS_PORT ||6379
const client =Redis.createClient(REDIS_PORT);

client.connect();
console.log(REDIS_PORT,"REDIS_PORT")

const norwayLanguage=async (req,res,next)=>{
try{
  
    const data=  await client.get("no")

    if(!data){
       console.log("if")
     fs.readFile(`./locales/en/translation.json` , async(err, data) => {
        
    if(err){
         console.error(err)
         return
         }
       
  const boss= await JSON.parse(data)
  await client.set("no",JSON.stringify(boss))
  await client.get("no")
  // const getData=await client.get(ln)

  req.norwayLanguage= await client.get("no")
  

  next() 
      })
     
   }else{

     client.get("no")
    // const getData= 
    req.norwayLanguage=await client.get("no")

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

module.exports=norwayLanguage