require('dotenv').config();
import nodemailer, {Transporter} from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
interface EmailOptions{
    email: string;
    subject: string;
    template: string;
    data: {[key:string]:any};
}
const sendMail = async (options: EmailOptions):Promise <void> => {
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        service: process.env.SMTP_SERVICE, //next line is the "authentication" part
        auth:{
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });
    const {email,subject,template,data} = options;
    //now, we will create a dynamic path for email templates inside the folder "mails"
    const templatePath = path.join(__dirname,'../mails',template);
    //now, we will render the email template with EJS
    const html:string = await ejs.renderFile(templatePath,data);
    //enternig the mail options
    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html
    };
    await transporter.sendMail(mailOptions);
};
//watch: 2:21:10 to 2:24:32
export default sendMail;