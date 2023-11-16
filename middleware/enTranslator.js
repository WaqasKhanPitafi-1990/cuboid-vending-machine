const Redis=require('redis')
const fs = require('fs')
require('dotenv').config();
const REDIS_PORT=process.env.REDIS_PORT ||6379
const client =Redis.createClient(REDIS_PORT);

client.connect();


const englishLanguage=async (req,res,next)=>{
try{
  
    const data=  await client.get("en")

    if(!data){
       console.log("if")
     fs.readFile(`./locales/en/translation.json` , async(err, data) => {
        
    if(err){
         console.error(err)
         return
         }
       
  const boss= await JSON.parse(data)
  await client.set("en",JSON.stringify(boss))
  await client.get("en")
  // const getData=await client.get(ln)

  req.languageEnglish= await client.get("en")
  

  next() 
      })
     
   }else{

     client.get("en")
    // const getData= 
    req.languageEnglish=await client.get("en")

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

module.exports=englishLanguage