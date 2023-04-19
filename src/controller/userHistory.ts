import {Response } from "express";
import { Request } from "../types";
import { connection } from "../database_connection/mysql";

export const historyUser = async(req:Request, res:Response)=>{
    try {

        let page = parseInt(req.query.page as string) || 1;
        let limit = parseInt(req.query.limit as string) || 10;

        const skip = (page-1)*limit;

        const email = req.user.email;
        const findHistory = `SELECT * FROM HISTORY WHERE EMAIL= '${email}' LIMIT ${limit} OFFSET ${skip}`;
        connection.query(findHistory, (err,rows)=>{
            if(err){
                return res.status(400).json({error:err.message})
            }
            if(!rows.length){
                return res.status(404).json({error: "We have reached end of the table"})
            }
            return res.status(200).json({history: rows})

        })
    
    } catch (err:any) {
        return res.status(400).json({error: err.message})
        
    }
}
