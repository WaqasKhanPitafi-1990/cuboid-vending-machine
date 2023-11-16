let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
const {
    sendAttachment
  } = require("../email/emailMessage");
  const asyncCatchHandler = require("../middleware/catchAsyncError");

const pdfGenerator=(req,res,next,data)=>{
ejs.renderFile(path.join(__dirname, '..','views', "reports.ejs"), {data: data}, (err, data) => {
    var fileName=`public/uploads/machineErrorlogs/${Date.now()}_report.pdf`
    if (err) {
          res.send(err);
    } else {
        let options = {
            "directory": "/tmp",
            "height": "11.25in",
            "width": "8.5in",
            "header": {
                "height": "20mm"
            },
            "footer": {
                "height": "20mm",
            },
        };
       
        pdf.create(data, options).toFile(fileName, function (err, data) {
            if (err) {
                res.send(err);
            } else {
              
        sendAttachment('machine error logs',fileName)
            }
        });
    }

  })
  next()
}

module.exports=pdfGenerator