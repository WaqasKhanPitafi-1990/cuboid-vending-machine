
const mongoose = require('mongoose')
var cron = require('node-cron');
const { OrderModel } = require('../model/order')
const axios = require('axios')
const sgMail = require('@sendgrid/mail');
const sendGridApi = process.env.USER_API;
require('dotenv').config();
sgMail.setApiKey(sendGridApi);
//// company that direct contract with super admin
cron.schedule("0 0 1 * *", function () {
    console.log("e", process.env.BASE_URL)
    axios.get(`${process.env.BASE_URL}/api/v1/company_subsidy/company`);
    axios.get(`${process.env.BASE_URL}/api/v1/company_subsidy/sub_company`);
    // companySubsidyContractBySuperAdmin()
});


exports.companySubsidyContractBySuperAdmin = async (req, res, next) => {

    try {
        var date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth() - 1;

        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 1);
        console.log(firstDay, "First", lastDay, "last")
        let data = await OrderModel.aggregate([
            {
                $match: {
                    'createdAt': {
                        '$gte': new Date(firstDay),
                        '$lte': new Date(lastDay)
                    },
                    payment_status:'SALE'


                }
            }, {
                $sort: {
                    createdAt: 1
                }
            }, {
                $match: {
                    subsidy: { $gt: 0 }
                }
            }, {
                $group: {
                    _id: {
                        _id: '$canteen_id',
                        user_id: '$user_id'
                    },
                    subsidy: {
                        $sum: '$subsidy'
                    }
                }
            }, {
                $lookup: {
                    from: 'canteens',
                    localField: '_id._id',
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
                    subsidy: 1,
                    canteen_id: '$canteen._id',
                    canteen_name: '$canteen.canteen_name',
                    canteen_company: '$canteen.canteen_company_ids',
                    user_id: '$_id.user_id'
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'user.user_parent_id',
                    foreignField: '_id',
                    as: 'userParent'
                }
            }, {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $unwind: {
                    path: '$userParent',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    'userParent.user_role': {
                        $ne: 'super_admin'
                    }
                }
            },
            {
                $group: {
                    _id: {
                        company: '$userParent._id'
                    },
                    subsidy: {
                        $sum: '$subsidy'
                    },
                    canteen_name: {
                        $first: '$canteen_name'
                    },
                    company_name: {
                        $first: '$userParent.user_name'
                    },
                    company_email: {
                        $first: '$userParent.user_email'
                    },
                    userParent: {
                        $first: '$userParent'
                    },
                    user: {
                        $first: '$user'
                    }
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'userParent.user_parent_id',
                    foreignField: '_id',
                    as: 'parentParent'
                }
            }, {
                $unwind: {
                    path: '$parentParent',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $addFields: {
                    subCompany: []
                }
            }, {
                $addFields: {
                    status: "active"
                }
            }
        ])

        for (let i = 0; i < data?.length; i++) {
            console.log(data[i]._id.company, "i")
            for (let j = 0; j < data?.length; j++) {
                if (data[i]?.parentParent?.user_role == "super_admin") {

                    if (data[i]?._id.company && (data[i]?._id?.company).toString() == data[j]?.userParent?.user_parent_id && (data[j]?.userParent?.user_parent_id).toString()) {

                        data[i].subsidy = data[i]?.subsidy + data[j]?.subsidy
                        data[i].subCompany.push(data[j])
                        data[j].status = "deleted"


                    }
                }
            }
        }
        for (let i = 0; i < data?.length; i++) {
            console.log(data[i].status)
            if (data[i]?.status == "deleted") {
                data.splice(i, 1)
            }
        }

        for (let i = 0; i < data?.length; i++) {

            try{
                sgMail.send({
                    to: data[i]?.company_email,
                    from: process.env.SENDER_EMAIL,
                    subject: 'Montly Billing Report',
                    html: ` 
                    canteen name: ${data[i].canteen_name}<br/>
                    company name: ${data[i].company_name}<br/>
                    total subsidy: ${data[i].subsidy}<br/><br/>
                    ${data[i]?.subCompany?.length > 0 && "<br style={text-align:'center'}>Sub Company</br>"}
                    <ul>
                    ${data[i]?.subCompany && data[i]?.subCompany?.length > 0 && data[i].subCompany?.map(data1 => (
                        `<div>
                        <li> Canteen Name: ${data1?.canteen_name}</li>
                        <li>sub company name: ${data1?.userParent.user_name}</li>
                        <li>sub company email: ${data1?.userParent.user_email}</li>
                        <li>${data1.subsidy}</li>
    
                    </div>`
                    ))}
                    </ul>
                    `
                })
                .then((response) => {
                    console.log(response[0].statusCode)
                    console.log('Email has been sent successfully')
                })
                .catch((error) => {
                    console.error(error)
                });
            } catch(error) {
                console.log(error);
            }

        }
        return res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        return res.status(202).json({
            success: false,
            error,
            message: error.message
        })
    }

}

///


// company that have contract with sub company

exports.subCompanyContract = async (req, res, next) => {

    try {
        var date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth() - 1;

        var firstDay = new Date(y, m, 1);
        var lastDay = new Date(y, m + 1, 1);
     
        let data = await OrderModel.aggregate([
            {
                $match: {
                    'createdAt': {
                        '$gte': new Date(firstDay),
                        '$lte': new Date(lastDay)
                    },
                    payment_status:'SALE'


                }
            },
            {
                $match: {
                    subsidy: {
                        $gt: 0
                    }
                }
            }, {
                $group: {
                    _id: {
                        _id: '$canteen_id',
                        user_id: '$user_id'
                    },
                    subsidy: {
                        $sum: '$subsidy'
                    }
                }
            }, {
                $lookup: {
                    from: 'canteens',
                    localField: '_id._id',
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
                    subsidy: 1,
                    canteen_id: '$canteen._id',
                    canteen_name: '$canteen.canteen_name',
                    canteen_company: '$canteen.canteen_company_ids',
                    user_id: '$_id.user_id'
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'user.user_parent_id',
                    foreignField: '_id',
                    as: 'userParent'
                }
            }, {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $unwind: {
                    path: '$userParent',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    'userParent.user_role': {
                        $ne: 'super_admin'
                    }
                }
            },
            {
                $group: {
                    _id: {
                        company: '$userParent._id'
                    },
                    subsidy: {
                        $sum: '$subsidy'
                    },
                    canteen_name: {
                        $first: '$canteen_name'
                    },
                    company_name: {
                        $first: '$userParent.user_name'
                    },
                    company_email: {
                        $first: '$userParent.user_email'
                    },
                    userParent: {
                        $first: '$userParent'
                    },
                    user: {
                        $first: '$user'
                    }
                }
            }, {
                $lookup: {
                    from: 'users',
                    localField: 'userParent.user_parent_id',
                    foreignField: '_id',
                    as: 'parentParent'
                }
            }, {
                $unwind: {
                    path: '$parentParent',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $match: {
                    'parentParent.user_role': {
                        $ne: 'super_admin'
                    }
                }
            },


        ])

        for (let i = 0; i < data?.length; i++) {
            try{
                sgMail.send({
                    to: data[i]?.company_email,
                    from: process.env.SENDER_EMAIL,
                    subject: 'Monthly Billing Report',
                    html: ` 
                canteen name: ${data[i].canteen_name} <br/>
                company name: ${data[i].company_name} <br/>
                total subsidy: ${data[i].subsidy}    <br/>
                `
                })
                .then((response) => {
                    console.log(response[0].statusCode)
                    console.log('Email has been sent successfully')
                })
                .catch((error) => {
                    console.error(error)
                });
                
                res.status(200).json({
                    success: true,
                    data
                })

            } catch(error) {
                console.log(error);
            }
        }
    } catch (error) {
        return res.status(202).json({
            success: false,
            error,
            message: error.message
        })
    }
}




