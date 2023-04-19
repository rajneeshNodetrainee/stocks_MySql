import express from "express"
import { get } from "../controller/get";
import { userRegister } from "../controller/userRegister";
import { verifyOtp } from "../controller/verifyOtp";
import { auth } from "../middlewares/auth";
import { getStock } from "../controller/getStock";
import { historyUser } from "../controller/userHistory";


export const router = express.Router();

router.get("/", get)

router.post("/api/v1/user/register", userRegister)

router.post("/api/v1/verifyotp", verifyOtp)

router.get("/api/v1/stock/get",auth, getStock)

router.get("/api/v1/user/history",auth, historyUser)