
async function filter(query,req){
   
        const currentPage=Number(req.query.currentPage)||1
        const resultPerPage=Number(req.query.resultPerPage)||10
        const pagination=req.query.pagination||"true"
       
        const skip= resultPerPage *(currentPage-1);
        const data= await query.clone().count()
    
      
        let totalPage=Math.ceil(data/resultPerPage)
        var product
        if(pagination==="true"){
             product=await query.limit(resultPerPage).skip(skip)
        }else{
  
            product=await query
           
        }
   
        
     

     return {
        data:product,
        totalRecord:data,
        currentPage:currentPage,
        totalPage:totalPage
    }
}
    module.exports=filter