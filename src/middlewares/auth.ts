import {Response,NextFunction} from "express"
import { Request } from "../types"
import jwt, { JwtPayload } from "jsonwebtoken"
import { connection } from "../database_connection/mysql"

export const auth = async(req:Request, res:Response, next:NextFunction)=>{
	try{
	// console.log("reached in auth function")
	const authHeader = req.headers.authorization
		// console.log(authHeader)
	if(typeof authHeader==='string'){

	const token = authHeader.split(' ')[1];

	// console.log("token2", token)

	const verifyUser = jwt.verify(token, process.env.SECRET_KEY!) as JwtPayload
	console.log("verifyUser", verifyUser)
	// if(!verifyUser.isAuthenticated || typeof verifyUser.isAuthenticated=='undefined'){
	// 	return res.status(401).json({error: "Please verify your otp"})
	// }
    const findUser = `SELECT * FROM user where email = '${verifyUser.email}'`
    connection.query(findUser, (err,rows)=>{
        if(err){
            return res.status(400).json({error: err.message})
        }
        if(!rows.length){
            return res.status(404).json({error: "PLease make a registration first"})
        }
        if(!rows[rows.length-1].isVerified){
            return res.status(401).json({error: "Please verify your otp first"})
        }
        else{
            req.token = token;
	        req.user = rows[rows.length-1]
            // console.log("user", rows[rows.length-1])
            next();
        }
    })
	// console.log("user",user)

	}else{
		return res.status(401).json({error: "Invalid token"})
	}
	
	}catch(e:any){
	return res.status(404).json({error: "Please log in to be authorised "})
	}
}

