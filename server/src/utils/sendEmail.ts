// import nodemailer from 'nodemailer';

// export const sendEmail=async(to: string, html: string)=>{
//     // all emails are catched by ethereal.email
//     const mailConfig = {
//             host: 'smtp.ethereal.email',
//             port: 587,
//             auth: {
//                 user: 'ethereal.user@ethereal.email',
//                 pass: 'verysecret'
//             },
//             tls: {
//                 rejectUnauthorized: false // avoid NodeJs self signed certificate error
//             }
//         };

//     let transporter = nodemailer.createTransport(mailConfig);

//     // send mail with defined transport object
// 	let info = await transporter.sendMail({
// 		from: '"Bob Doe" <bobdoe@example.com>', // sender address
// 		to, // list of receivers
// 		subject: 'Change Password', // Subject line
// 		html // html body
// 	})

// 	console.log('Message sent: %s', info.messageId)
// 	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

// 	// Preview only available when sending through an Ethereal account
// 	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
// 	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

// }

"use strict";
import nodemailer from 'nodemailer';

// async..await is not allowed in global scope, must use a wrapper
export const sendEmail = async (to: string, html: string) => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();
    // console.log('test account: ', testAccount)
    // create reusable transporter object using the default SMTP transport
    console.log("sendEmail start")

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.NODEMAILER_TEST_USER, // generated ethereal user
            pass: process.env.NODEMAILER_TEST_PASSWORD, // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false // avoid NodeJs self signed certificate error
        }

    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: to, // list of receivers
        subject: "Change Password", // Subject line
        html: html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
