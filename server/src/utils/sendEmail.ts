import nodemailer from 'nodemailer';

export const sendEmail=async(to: string, html: string)=>{
    // all emails are catched by ethereal.email
    const mailConfig = {
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'ethereal.user@ethereal.email',
                pass: 'verysecret'
            },
            tls: {
                rejectUnauthorized: false // avoid NodeJs self signed certificate error
            }
        };
    
    let transporter = nodemailer.createTransport(mailConfig);
    
    // send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Bob Doe" <bobdoe@example.com>', // sender address
		to, // list of receivers
		subject: 'Change Password', // Subject line
		html // html body
	})

	console.log('Message sent: %s', info.messageId)
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    
}