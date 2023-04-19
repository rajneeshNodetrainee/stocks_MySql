import twilio from "twilio"
// const sgMail = require('@sendgrid/mail');
import * as sgMail from "@sendgrid/mail"
import { msgtype } from "../types";

let otp:number;
let otpTimestamp:number;

export const sendOtpOnWhatsapp = async ()=>{
    const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

    otp = Math.floor(Math.random()*90000)+10000
    client.messages
    .create({
        body: `Your otp is ${otp}`,
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+917030138451'
    })
    .then((message:any) => {
        console.log(message.sid)
        console.log("otpTimestamp", otpTimestamp)
    })
    .catch((e:any)=>console.log(e))

    console.log("otp",otp)
    otpTimestamp = Date.now();

    return {otp, otpTimestamp};

}

export const sendOtpOnMail = async (email:string)=>{
    otp = Math.floor(Math.random()*90000)+10000

    const msg = {
        to:email,
        from:'rajneesh@solulab.com',
        subject: "Verify stock api OTP",
        text: "Please verify your account.",
        html: `<strong>Hi there, thank you for signing up.<br>Here is your one time password.<br><i> ${otp}<br>This otp is valid for 5 minutes only.</strong>`
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
    
    const sentMsg = await sgMail.send(msg)
    // sgMail.send(msg)
    // .then((response)=>console.log("mail sent"))
    // .catch((err)=> console.log(err))

    otpTimestamp = Date.now();

    console.log("mail sent")
    console.log("otp",otp)
   return {otp, otpTimestamp}
}

