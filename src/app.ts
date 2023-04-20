import express,{Application} from "express"
import { router } from "./routes/router";
import cron from "node-cron"
import { connectDb } from "./database_connection/mysql";
import dotenv from "dotenv"
import path from 'path'
import { updateStockDailyAt10 } from "./modules/updateDailyStock";
const dotenvPath = path.join(__dirname, '..', 'src', '.env')

const app:Application = express();
connectDb();
dotenv.config({path: dotenvPath})

cron.schedule("26 10 * * *", ()=>{
	updateStockDailyAt10();
})

app.use(express.json())
app.use(router)

app.listen(3000, ()=>{
    console.log("server started at 3000")
})
