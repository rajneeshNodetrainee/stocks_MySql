import {Request ,Response } from "express";
import validator from "validator";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { emptyRequestBody } from "../modules/emptyRequestBody";
import { connection } from "../database_connection/mysql";

export const verifyOtp = async (req:Request, res:Response)=>{
    if(emptyRequestBody(req)){
        return res.status(400).json({error: "Nothing in the body"})
    }
    const {email, otp} = req.body;
    if(!otp || !email){
        return res.status(404).json({error: "Provide otp and email"})
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({error:"Invalid email"})
    }
    if(otp.toString().length!==5){
        return res.status(401).json({error:"Enter an otp of length 5"})
    }

    // const findUser = `SELECT * FROM user WHERE email='${email}'`;
    const findEmailInOtp = `select * from otp where email='${email}'`
    connection.query(findEmailInOtp,async (err, rows)=>{
        if(err){
            return res.status(400).json({error: err.message})
        }
        if(!rows.length){
            return res.status(404).json({error: "User is not registered"})
        }
        const databaseotp = rows[rows.length-1].otp;
        const otpTimestamp = rows[rows.length-1].generatedAt;
    
        if(Date.now()-otpTimestamp > 30000000*1000){
                return res.status(401).json({error: "OTP has expired."})
            }
        console.log(typeof databaseotp)
        const isMatch = await bcrypt.compare(otp.toString(), databaseotp)
        console.log("databaseotp", databaseotp)
        console.log("otp", otp)
        console.log(isMatch)
        console.log(otp.toString()===databaseotp)
        if(isMatch){
            const newToken = jwt.sign({email: rows[rows.length-1].email},
                process.env.SECRET_KEY as string,
                {expiresIn:'48h'}
                )

            res.cookie("jwt", newToken)   
            console.log("jwtToken", newToken)

            const updateQuery = `UPDATE user SET isVerified = '1' WHERE email = '${email}'`;
            connection.query(updateQuery, (updateError)=>{
                if(updateError){
                    return res.status(400).json({eerror:updateError.message})
                }
                else{
                    return res.status(202).json({message: "User authenticated"})
                }
            })
        }else{
            return res.status(400).json({error: "Incorrect otp"})
        }
    })
    
}

