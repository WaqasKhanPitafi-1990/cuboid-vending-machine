const mongoose = require('mongoose');
// const multer = require('multer')
const banner = require('../model/banner')
const { logs } = require('../utils/logs')
const path = require('path');
const ErrorHandler = require('../utils/errorHandling')
const asyncCatchHandler = require('../middleware/catchAsyncError');
const machineModel = require('../model/verdering')
const pagination = require('../utils/pagination')

exports.addBanner = asyncCatchHandler(async (req, res, next) => {
    const { banner_title, banner_description, banner_status, banner_canteen_ids, banner_start_date, banner_end_date } = req.body

    const bannerObj = new banner({
        banner_title,
        banner_description,
        banner_status,
        banner_canteen_ids,
        banner_image: process.env.BASE_URL + "/" + req.file.path,
        banner_start_date,
        banner_end_date,
        banner_parent_id: req.user ? req.user._id : ''
    })

    const store = await bannerObj.save();

    await logs(null, null, null, store._id, null, null, null, null, null, null, null, null, null, null, "Add banner", `${banner_title} banner has been added from ${req?.user?.user_name}`, req, res, next)
    return res.json({
        success: true,
        message: req.t('Banner is save successfully')
    })

})

exports.deleteBanner = asyncCatchHandler(async (req, res, next) => {

    const id = req.params.id;


    const banner_data = await banner.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { banner_status: "Deleted" });

    if (!banner_data) {
        return next(new ErrorHandler(req.t('banner not found'), 200))
    }
    res.json({
        success: true,
        message: req.t("Banner is in-Active successfully")
    })
}
)

exports.updateBanner = asyncCatchHandler(async (req, res, next) => {
    const id = req.params.id;
    const { banner_title, banner_status, banner_description, banner_canteen_ids, banner_start_date, banner_end_date } = req.body
    const profile = await banner.findOne({ _id: mongoose.Types.ObjectId(id) })
    if (!profile) {
        return next(new ErrorHandler(req.t('banner not found'), 200))

    }


    const image = req.file ? process.env.BASE_URL + "/" + req.file.path : "";
    if (image && !image.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
        return next(new ErrorHandler(req.t('Only JPG ,PNG and JPEG file format is supported'), 422))
    }
    const bannerModel = await banner.findOne({ _id: id })
    if (!bannerModel) {
        return next(new ErrorHandler(req.t('banner not found'), 200))
    }
    banner_title ? bannerModel.banner_title = banner_title : bannerModel.banner_title
    banner_status ? bannerModel.banner_status = banner_status : bannerModel.banner_status
    banner_description ? bannerModel.banner_description = banner_description : bannerModel.banner_description;
    banner_canteen_ids ? bannerModel.banner_canteen_ids = banner_canteen_ids : bannerModel.banner_canteen_ids;
    image ? bannerModel.banner_image = image : bannerModel.banner_image
    banner_start_date ? bannerModel.banner_start_date = banner_start_date : bannerModel.banner_start_date;
    banner_end_date ? bannerModel.banner_end_date = banner_end_date : bannerModel.banner_end_date
    await bannerModel.save();
    res.json({
        success: true,
        message: req.t("Banner is updated successfully")
    })


})

exports.allBanner = asyncCatchHandler(async (req, res, next) => {
    const currentPage = Number(req.query.currentPage) || 1
    const resultPerPage = Number(req.query.resultPerPage) || 10
    const skip = resultPerPage * (currentPage - 1);
    var totalRecord
    var totalPage
    let allbanner = []
    if (req.user.user_role == 'super_admin') {

        allbanner = await banner.aggregate([
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $match: {
                    banner_status: { $ne: "Deleted" },
                }
            },
            {
                $unwind: {
                    path: '$banner_canteen_ids',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: 'canteens',
                    localField: 'banner_canteen_ids',
                    foreignField: '_id',
                    as: 'Canteens'
                }
            }, {
                $unwind: {
                    path: '$Canteens',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $group: {
                    _id: {
                        _id: '$_id',
                        banner_title: '$banner_title',
                        banner_description: '$banner_description',
                        banner_image: '$banner_image',
                        banner_status: '$banner_status',
                        banner_start_date: '$banner_start_date',
                        banner_end_date: '$banner_end_date'
                    },
                    canteens: {
                        $push: '$Canteens'
                    },

                }
            }, {
                $project: {
                    _id: '$_id._id',
                    canteens: 1,
                    banner_title: '$_id.banner_title',
                    banner_description: '$_id.banner_description',
                    banner_image: '$_id.banner_image',
                    banner_status: '$_id.banner_status',
                    banner_start_date: '$_id.banner_start_date',
                    banner_end_date: '$_id.banner_end_date',
                    banner_canteen_ids: '$Canteens'
                }
            }, {
                $sort: {
                    _id: -1,
                    createdAt: -1
                }
            },
            {
                $skip: skip
            }, {
                $limit: resultPerPage
            }
        ])

        const bannerRecord = await banner.aggregate([
            {
                $match: {
                    banner_status: { $ne: "Deleted" },
                }
            },

            {
                $unwind: {
                    path: '$banner_canteen_ids',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: 'canteens',
                    localField: 'banner_canteen_ids',
                    foreignField: '_id',
                    as: 'Canteen'
                }
            }, {
                $unwind: {
                    path: '$Canteen',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $group: {
                    _id: {
                        _id: '$_id',
                        banner_title: '$banner_title',
                        banner_description: '$banner_description',
                        banner_image: '$banner_image',
                        banner_status: '$banner_status',
                        banner_start_date: '$banner_start_date',
                        banner_end_date: '$banner_end_date'
                    },
                    Canteen: { $first: '$Canteen' },
                    Machines: {
                        $push: '$Canteen'
                    }
                }
            }, {
                $project: {
                    _id: '$_id._id',
                    Canteen: 1,
                    banner_title: '$_id.banner_title',
                    banner_description: '$_id.banner_description',
                    banner_image: '$_id.banner_image',
                    banner_status: '$_id.banner_status',
                    banner_start_date: '$_id.banner_start_date',
                    banner_end_date: '$_id.banner_end_date',
                    banner_canteen_ids: '$Canteen'
                }
            }, {
                $sort: {
                    _id: -1
                }
            },

        ])
        totalRecord = bannerRecord?.length
        totalPage = await Math.ceil(totalRecord / resultPerPage)
    } else {

        allbanner = await banner.aggregate([
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $match: {
                    banner_parent_id: mongoose.Types.ObjectId(req.user._id),
                    banner_status: { $ne: "Deleted" },
                }
            },
            {
                $unwind: {
                    path: '$banner_canteen_ids',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: 'canteens',
                    localField: 'banner_canteen_ids',
                    foreignField: '_id',
                    as: 'Canteen'
                }
            }, {
                $unwind: {
                    path: '$Canteen',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $group: {
                    _id: {
                        _id: '$_id',
                        banner_title: '$banner_title',
                        banner_description: '$banner_description',
                        banner_image: '$banner_image',
                        banner_status: '$banner_status',
                        banner_start_date: '$banner_start_date',
                        banner_end_date: '$banner_end_date'
                    },

                    canteens: {
                        $push: '$Canteen'
                    }
                }
            }, {
                $project: {
                    _id: '$_id._id',

                    banner_title: '$_id.banner_title',
                    banner_description: '$_id.banner_description',
                    banner_image: '$_id.banner_image',
                    banner_status: '$_id.banner_status',
                    banner_start_date: '$_id.banner_start_date',
                    banner_end_date: '$_id.banner_end_date',
                    banner_canteen_ids: '$Canteen',
                    canteens: 1
                }
            }, {
                $sort: {
                    _id: -1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: resultPerPage
            }
        ])
        const bannerRecord = await banner.aggregate([
            {
                $match: {
                    banner_parent_id: mongoose.Types.ObjectId(req.user._id),
                    banner_status: { $ne: "Deleted" },
                }
            },
            {
                $unwind: {
                    path: '$banner_canteen_ids',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $lookup: {
                    from: 'canteens',
                    localField: 'banner_canteen_ids',
                    foreignField: '_id',
                    as: 'Canteen'
                }
            }, {
                $unwind: {
                    path: '$Canteen',
                    preserveNullAndEmptyArrays: true
                }
            }, {
                $group: {
                    _id: {
                        _id: '$_id',
                        banner_title: '$banner_title',
                        banner_description: '$banner_description',
                        banner_image: '$banner_image',
                        banner_status: '$banner_status',
                        banner_start_date: '$banner_start_date',
                        banner_end_date: '$banner_end_date'
                    },
                    Machines: {
                        $push: '$Canteen'
                    }
                }
            }, {
                $project: {
                    _id: '$_id._id',
                    banner_title: '$_id.banner_title',
                    banner_description: '$_id.banner_description',
                    banner_image: '$_id.banner_image',
                    banner_status: '$_id.banner_status',
                    banner_start_date: '$_id.banner_start_date',
                    banner_end_date: '$_id.banner_end_date',
                    banner_canteen_ids: '$Canteen'
                }
            }, {
                $sort: {
                    _id: -1
                }
            },

        ])
        totalRecord = bannerRecord.length
        totalPage = await Math.ceil(totalRecord / resultPerPage)
    }


    return res.json({
        success: true,
        totalRecord: totalRecord,
        currentPage: currentPage,
        totalPage: totalPage,
        banner: allbanner
    })

})


exports.machineBanner = asyncCatchHandler(async (req, res, next) => {

    const { banner_canteen_id } = req.params
    const allbanner = await banner.find({ banner_status: 'Active', $or: [{ banner_canteen_ids: { $elemMatch: { $eq: banner_canteen_id } } }, { banner_canteen_ids: { $size: 0 } }] })
        .select({ 'banner_canteen_ids': 0 }).sort({ _id: -1 })


    res.json({
        success: true,
        banner: allbanner
    })

})


