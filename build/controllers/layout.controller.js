"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutByType = exports.editLayout = exports.createLayout = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const cloudinary_1 = __importDefault(require("cloudinary"));
const layout_model_1 = __importDefault(require("../models/layout.model"));
//creating layout
exports.createLayout = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { type } = req.body; //we will recieve "type" from our api
        //now, keep in mind that the admin can create the layout(s) only once and then he can only edit them and not create more layouts because obviously there is going to be only 1 faq section, banner, categories section. So, setting up code such that if the entered type exisits, simply throw an error.
        const isTypeExist = await layout_model_1.default.findOne({ type });
        if (isTypeExist) {
            return next(new ErrorHandler_1.default(`${type} already exists`, 400));
        }
        //for creating "banner"
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary_1.default.v2.uploader.upload(image, {
                folder: "layout",
            });
            const banner = {
                type: "Banner",
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                    title,
                    subTitle,
                },
            };
            await layout_model_1.default.create(banner);
        }
        //for creatin "faq"
        if (type === "FAQ") {
            const { faq } = req.body; //this const "faq" will be an array(check your layout.model.ts to confirm if you want)
            //since "faq" is an array, we cannot directly post it mongo bs databse or else the data won't be uploaded, only empty arrays will be uploaded(see from 8:15:00, you'll understand). First, we need to break the array(i.e. the const "faq" here) into object(s) and then post it in mongo db.
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answer: item.answer
                };
            }) //Don't put ";" in this line or you'll get an error
            );
            await layout_model_1.default.create({ type: "FAQ", faq: faqItems }); //i.e. add "faq" as "faqitems"
        }
        //for creating "categories"
        if (type === "Categories") {
            const { categories } = req.body; //this const "categories" will be an array(check your layout.model.ts to confirm if you want)
            const categoryItems = await Promise.all(categories.map(async (item) => {
                return {
                    title: item.title,
                };
            }) //Don't put ";" in this line or you'll get an error
            );
            await layout_model_1.default.create({ type: "Categories", categories: categoryItems }); //i.e. add "faq" as "faqitems"
        }
        //sending response
        res.status(200).json({
            success: true,
            message: "Layout Created Successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 109("c": ../routes/route.layout.ts & "m": ../routes/route.layout.ts)
//STEP: 112
exports.editLayout = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { type } = req.body; //we will recieve "type" from our api
        //for editing "banner"
        if (type === "Banner") {
            const bannerData = await layout_model_1.default.findOne({ type: "Banner" });
            const { image, title, subTitle } = req.body;
            //watch(part 2)- 8:30:45 to 8:33:05 
            const data = image.startsWith("https") ? bannerData : await cloudinary_1.default.v2.uploader.upload(image, { folder: "layout" });
            const banner = {
                type: "Banner",
                image: {
                    public_id: image.startsWith("https") ? bannerData.banner.image.public_id : data?.public_id,
                    url: image.startsWith("https") ? bannerData.banner.image.url : data?.secure_url,
                },
                title,
                subTitle,
            };
            await layout_model_1.default.findByIdAndUpdate(bannerData._id, { banner });
        }
        //for editing "faq"
        if (type === "FAQ") {
            const { faq } = req.body; //this const "faq" will be an array(check your layout.model.ts to confirm if you want)
            const FaqItem = await layout_model_1.default.findOne({ type: "FAQ" });
            //since "faq" is an array, we cannot directly post it mongo bs databse or else the data won't be uploaded, only empty arrays will be uploaded(see from 8:15:00, you'll understand). First, we need to break the array(i.e. the const "faq" here) into object(s) and then post it in mongo db.
            const faqItems = await Promise.all(faq.map(async (item) => {
                return {
                    question: item.question,
                    answer: item.answer
                };
            }) //Don't put ";" in this line or you'll get an error
            );
            await layout_model_1.default.findByIdAndUpdate(FaqItem._id, { type: "FAQ", faq: faqItems }); //i.e. add "faq" as "faqitems"
        }
        //for creating "categories"
        if (type === "Categories") {
            const { categories } = req.body; //this const "categories" will be an array(check your layout.model.ts to confirm if you want)
            const categoriesData = await layout_model_1.default.findOne({ type: "Categories" });
            const categoryItems = await Promise.all(categories.map(async (item) => {
                return {
                    title: item.title,
                };
            }) //Don't put ";" in this line or you'll get an error
            );
            await layout_model_1.default.findByIdAndUpdate(categoriesData._id, { type: "Categories", categories: categoryItems }); //i.e. add "faq" as "faqitems"
        }
        //sending response
        res.status(200).json({
            success: true,
            message: "Layout Updated Successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 112("m": ../routes/route.layout.ts)
//STEP: 114
exports.getLayoutByType = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { type } = req.params;
        const layout = await layout_model_1.default.findOne({ type });
        res.status(201).json({
            success: true,
            layout,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 114("m": ../routes/route.layout.ts)
