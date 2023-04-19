import { Request, Response } from "express"
import { emptyRequestBody } from "../modules/emptyRequestBody"
import bcrypt from "bcryptjs"
import validator from "validator"
import { sendOtpOnMail, sendOtpOnWhatsapp } from "../modules/sendOtp"
import { connection } from "../database_connection/mysql"

export const userRegister = async (req: Request, res: Response) => {
    try {
        if (emptyRequestBody(req)) {
            return res.status(400).json({ error: "Nothing found" })
        }
        const { name, phone, email, password, channel } = req.body;

        if (!name) {
            return res.status(400).json({ error: "name is required" })
        }

        if (!email) {
            return res.status(400).json({ error: "email is required" })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Invalid email" })
        }

        // if(findEmail){
        //     return res.status(409).json({error:"someone is using this emial"})
        // }
        // console.log("result",result)
        if (!password) {
            return res.status(400).json({ error: "password is required" })
        }

        if (password.length < 8) {
            return res.status(401).json({ error: "Password must be of atleat 8 characters" })
        }

        if (!phone) {
            return res.status(400).json({ error: "phone is required" })
        }

        if (phone.toString().length != 10) {
            return res.status(400).json({ error: "Invalid phone number" })
        }

        if (!channel || (channel != "message" && channel != "mail")) {
            return res.status(400).json({ error: "Channel can be either message or mail only" })
        }
        const findEmail = `select * from user where email='${email}'`
        // console.log("findEmail", findEmail)
        connection.query(findEmail, async (err, rows) => {
            console.log(rows)
            console.log("rows ki length ", rows.length)
            if (err) {
                console.log("first err")
                return res.status(400).json({ error: err.message })
            } 
            if(rows.length){
                return res.status(409).json({ error: "Someone is using this email id" })
            }else {
                // console.log("rows",rows)
                // return res.status(200).json({message: rows.length})
                
                    const hashedPassword = await bcrypt.hash(password, 10);
                    let otp;
                    if (channel == "message") {
                        otp = await sendOtpOnWhatsapp();
                    }
                    else {
                        otp = await sendOtpOnMail(email)
                    }
                    if (!otp) {
                        return res.status(400).json({ error: "Otp was not delivered" })
                    }
                    const receivedOtp = otp.otp.toString(); //converting into string cuz bcrypt.hash takes string
                    const hashedOtp = await bcrypt.hash(receivedOtp, 10);
                    console.log("hashedotp", hashedOtp)
                    console.log("otp", otp)
                    const query = 'INSERT INTO user (name,email,password,phone) VALUES (?, ?, ?,?)';
                    connection.query(query, [name, email, hashedPassword, phone], (err) => {
                        if (err) {
                            res.status(400).json({ error: err.message })
                            return;

                            // console.log(err.message)
                        }
                    })
                    console.log('after error still im here....boom')
                    const insertInOtp = 'INSERT INTO otp (email,otp,generatedAt,channel) VALUES (?, ?, ?, ?)';
                    connection.query(insertInOtp, [email, hashedOtp, otp.otpTimestamp, channel], (err, result) => {
                        if (err) {
                            console.log("secong err")
                            return res.status(400).json({ error: err.message })
                        } else {
                            console.log("please verify your otp")
                            return res.status(201).json({ message: "Please verify your otp" })
                        }
                    })
                
            }
        })
    } catch (err: any) {
        return res.status(400).json({ error: err.message })
    }
}
