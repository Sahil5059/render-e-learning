"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//STEP: 108
const mongoose_1 = require("mongoose");
//creating schemas
const faqSchema = new mongoose_1.Schema({
    question: { type: String },
    answer: { type: String },
});
const categorySchema = new mongoose_1.Schema({
    title: { type: String },
});
const bannerImageSchema = new mongoose_1.Schema({
    public_id: { type: String },
    url: { type: String },
});
const layoutSchema = new mongoose_1.Schema({
    type: { type: String },
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {
        image: bannerImageSchema,
        title: { type: String },
        subTitle: { type: String },
    },
});
//creating model and exporting it
const LayoutModel = (0, mongoose_1.model)('Layout', layoutSchema);
exports.default = LayoutModel;
//OVER: 108("c": ../contollers/layout.controller.ts and "m": ../contollers/layout.controller.ts)
