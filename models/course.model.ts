//STEP: 47
import mongoose, {Document,Model,Schema} from "mongoose";
import { IUser } from "./user.model";
//creating interface for comment
export interface IComment extends Document{
    user: IUser;
    question: string;
    questionReplies: IComment[];
}
//creating interface for review
interface IReview extends Document{
    user: IUser;
    rating: number;
    comment: string;
    commentReplies?: IComment[];
}
//creating interface for link
interface ILink extends Document{
    title: string;
    url: string;
}
//creating interface for the course data
interface ICourseData extends Document{
    title: string;
    description: string;
    videoUrl: string;
    videoThumbnail: object; //not string because we will be using cloudinary.
    videoSection: string;
    videoLength: number;
    videoPLayer: string;
    links: ILink[];
    suggestion: string;
    questions: IComment[];
}
//creating interface fro couse information
export interface ICourse extends Document{
    name: string;
    description: string;
    categories: string;
    price: number; //discounted price
    estimatedPrice?: number; //original price
    thumbnail: object;
    tags: string;
    level: string; //beginner, intermediate or advanced
    demoUrl: string; //url for demo video of the course
    benefits: {title: string}[];
    prerequisits: {title: string}[];
    reviews: IReview[];
    courseData: ICourseData[];
    ratings?: number;
    purchased: number; //no. of people who purchased the course
}
//now that our interface creation is done, we will now move towards model creation.
//creating model for review
const reviewSchema = new Schema<IReview>({
    user: Object,
    rating: {
        type: Number,
        default: 0,
    },
    comment: String,
    commentReplies: [Object],
}, {timestamps:true});
//creating model for link
const linkSchema = new Schema<ILink>({
    title: String,
    url: String,
});
//creating model for comment
const commentSchema = new Schema<IComment>({
    user: Object,
    question: String,
    questionReplies: [Object],
}, {timestamps:true});
//creating model for course data
const courseDataSchema = new Schema<ICourseData>({
    videoUrl: String,
    videoThumbnail: Object,
    title: String,
    videoSection: String,
    description: String,
    videoLength: Number,
    videoPLayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema],
});
//creating model for course info
const courseSchema = new Schema<ICourse>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    categories: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimatedPrice: {
        type: Number,
        required: true,
    },
    thumbnail: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    tags: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    demoUrl: {
        type: String,
        required: true,
    },
    benefits: [{title: String}],
    prerequisits: [{title: String}],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    purchased: {
        type: Number,
        default: 0,
    },
},{timestamps: true});
const CourseModel: Model<ICourse> = mongoose.model("Course", courseSchema);
export default CourseModel;
//OVER: 47("c": ../controllers/course.controller.ts and "m": ../controllers/course.controller.ts)