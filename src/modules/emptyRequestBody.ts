import { Request } from "express";

export const emptyRequestBody = (req:Request):Boolean=>{
    if(Object.keys(req.body).length){
        return false
    }
    return true
}
