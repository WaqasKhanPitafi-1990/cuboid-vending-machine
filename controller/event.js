const mongoose = require('mongoose');
const eventModel = require('../model/events')
const pdfGenerator = require('../utils/pdf') // pdf generator
const { emaillog } = require('../email/emailMessage')
const canteenModel = require('../model/canteen')
const pModel = require('../model/machinePriorityLogs')
const pagination = require('../utils/pagination')


exports.addEvent = async (req, res, next) => {
    try {
        var {
            canteen_id,
            machine_number,
            status_of_event,
            event,
        } = req.body;

        console.log('req.body',req.body);
        let canteenDetailsAggr = [
            {
              '$match': {
                '_id': new mongoose.Types.ObjectId(canteen_id)
              }
            }, {
              '$lookup': {
                'from': 'machines', 
                'localField': '_id', 
                'foreignField': 'canteen_id', 
                'as': 'machine'
              }
            }, {
              '$unwind': {
                'path': '$machine', 
                'includeArrayIndex': 'string', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$match': {
                'machine.machine_code': parseInt(machine_number)
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'canteen_admin_id', 
                'foreignField': '_id', 
                'as': 'canteen_admin'
              }
            }, {
              '$unwind': {
                'path': '$canteen_admin', 
                'includeArrayIndex': 'string', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'machine_filler_id', 
                'foreignField': '_id', 
                'as': 'machine_filler'
              }
            }, {
              '$unwind': {
                'path': '$machine_filler', 
                'includeArrayIndex': 'string', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$project': {
                'canteen_id': 1, 
                'canteen_name': 1, 
                'machine_id': '$machine._id',
                'machine_name': '$machine.machine_name',
                'canteen_admin_user_name': '$canteen_admin.user_name', 
                'canteen_admin_user_email': '$canteen_admin.user_email', 
                'machine_filler_user_name': '$machine_filler.user_name', 
                'machine_filler_user_email': '$machine_filler.user_email'
              }
            }
          ];

        let canteen = await canteenModel.aggregate(canteenDetailsAggr).exec();
        // const canteen = await canteenModel.findOne({ _id: mongoose.Types.ObjectId(canteen_id) }).populate('canteen_admin_id').populate('machine_filler_id')
        if (!canteen) {
            return res.json({
                success: false,
                message: 'canteen not found'
            })
        }
        console.log('canteen',canteen);
        const machine_filler_email = canteen[0].machine_filler_user_email;
        const canteen_admin_email = canteen[0].canteen_admin_user_email;
        const machineName = canteen[0].machine_name;
        const canteenName = canteen[0].canteen_name;
        console.log({
            canteen_id,
            machine_number,
            machine_id: canteen[0].machine_id,
            status_of_event,
            event,
        });
        const addEvent = new eventModel({
            canteen_id,
            machine_number,
            machine_id: canteen[0].machine_id,
            status_of_event,
            event,
        })
        const store = await addEvent.save();
        const check = await pModel.findOne({ title: event });
        if (check && check.priority && check.priority >= 4) {        
            await emaillog(machine_filler_email, canteen_admin_email, canteenName, status_of_event, event, machine_number, machineName , res, next);
            // await logs(null,null,null,null,null,null,null,null,null,store._id,null,null,null,null,"Add event",`${event} event has been added from ${req?.user?.user_name}`,req, res, next)
        }
        return res.json({
            success: true,
            messsage: 'event is added successfully'
        });
    }
    catch (error) {
        console.log('error', error);
        return res.json({
            success: false,
            message: error.message
        })
    }
}


exports.getEvent = async (req, res, next) => {
  console.log('req',req.query);
  let { canteen, machine, start_date, end_date, pagination, currentPage, resultPerPage } = req.query

  let filterData = {};

  if(canteen && canteen != 'all'){
    filterData = {
      ...filterData,
      "canteen_name": canteen,
    }
  }

  if (machine && machine != "all") {
    filterData = {
      ...filterData,
      "machine_name": machine,
    }
  }
  
  if(start_date && end_date){
    filterData = {
      ...filterData,
        'date':  {$gte : new Date(start_date), $lte : new Date(end_date)}
    }
  }

  console.log('filterData',filterData);

    try {
     let allEventAggr = [
        {
          '$lookup': {
            'from': 'canteens', 
            'localField': 'canteen_id', 
            'foreignField': '_id', 
            'as': 'canteen'
          }
        }, {
          '$unwind': {
            'path': '$canteen', 
            'includeArrayIndex': 'string', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$lookup': {
            'from': 'machines', 
            'localField': 'machine_id', 
            'foreignField': '_id', 
            'as': 'machine'
          }
        }, {
          '$unwind': {
            'path': '$machine', 
            'includeArrayIndex': 'string', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$project': {
            'canteen_name': '$canteen.canteen_name', 
            'machine_name': '$machine.machine_name', 
            'machine_number': '$machine.machine_code', 
            'event': 1, 
            'date': '$createdAt', 
            'status_of_event': 1
          }
        },
        {
          '$addFields': {
            'foundRegexData': {
              '$regexMatch': {
                'input': '$event', 
                'regex': new RegExp('Product dispensing error')
              }
            }
          }
        }, {
          '$match': {
            '$or': [
              {
                'event': {
                  '$in': [
                    'Machine Communication Status: Machine not connected (might not exist)', 'Machine Communication Status: Machine has lost connection (machine possibility faulty)', 'Machine Service Status: Machine out of order (faulty)', 'Dispense Status: Machine busy: not available to perform dispenses.', 'Dispense Status: Machine busy: product detector blocked by a product, advise customer to collect product.'
                  ]
                }
              }, {
                'foundRegexData': true
              }
            ]
          }
        }, {
          '$match': {
            ...filterData,           
          }
        }
      ];  

      let allEvent = await eventModel.aggregate(allEventAggr).exec();

      let totalRecords = allEvent.length;
      if (pagination && resultPerPage && currentPage) {
        const skip = (Number(resultPerPage) || 10) * ((Number(currentPage) - 1 || 0));
        console.log('skip', skip);
        console.log('resultPerPage', resultPerPage);
        console.log('currentPage', currentPage);
        allEventAggr.push(
          {
            '$skip': skip
          });
          allEventAggr.push(
          {
            '$limit': Number(resultPerPage) || 10
          });
      }


      allEvent = await eventModel.aggregate(allEventAggr).exec();

        console.log('allEvent', allEvent.length);
        const totalPage = Math.ceil(totalRecords / (Number(resultPerPage) || 10));
        return res.json({
            success: true,
            totalRecord: totalRecords,
            currentPage: currentPage,
            totalPage: totalPage,
            data: allEvent
        })
    }
    catch (error) {
      console.log('error',error);
        return res.json({
            success: false,
            message: error.message
        })
    }
}


exports.emailedEvent = async (req, res, next) => {
    try {
        const allEvent = await eventModel.aggregate([{
            $lookup: {
                from: 'canteens',
                localField: 'canteen_id',
                foreignField: '_id',
                as: 'canteen'
            }
        }, {
            $unwind: {
                path: '$canteen',
                preserveNullAndEmptyArrays: true
            }
        }, {
            $project: {
                canteen_name: '$canteen.canteen_name',
                machine_number: '$machine_number',
                status_of_event: '$status_of_event',
                event: '$event'
            }
        }])

        await pdfGenerator(req, res, next, allEvent)
        return res.json({
            success: true,
            data: allEvent
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}
