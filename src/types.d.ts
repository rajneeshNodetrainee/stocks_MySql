import { Request as ExpressRequest } from "express";
import { Types } from "mongoose";


export interface Request extends ExpressRequest {
    token?: string;
    user?:any;
  }


export interface StockInterface {
  userId: Types.ObjectId;
  symbol:string;
  stockDetails:object;
}

export interface Iuser {
	name:string;
	email:string;
	password:string;
	phone:number;
  isVerified:boolean;
}


export interface myDocument {
  _id :Types.ObjectId;
  stockDetails: stockDetails[];
  symbol:string;
}


export interface otpDocument {
  userId:Types.ObjectId;
  otp:string;
  isVerified:boolean;
  generatedAt:Number;
  channel:string;
}

export interface msgtype{
    to: any;
    from: string;
    subject: string;
    text: string;
    html:string;
}