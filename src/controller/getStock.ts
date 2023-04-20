import { Response } from "express";
import { Request } from "../types";
import { fetchLast7DaysData } from "../modules/fetchLast7DaysData";
import { isValidSymbol } from "../modules/isValidSymbol";
import { connection } from "../database_connection/mysql";

export const getStock = async (req: Request, res: Response) => {
    try {

        let stockSymbol = req.query.symbol;
        if (!stockSymbol) {
            return res.status(404).json({ error: "Which company's stock you are looking for..." })
        }

        // console.log(stockSymbol)
        // let {symbol:string} = req.query;
        // cron.schedule("0 8 * * *", ()=>{
        //     updateStockDailyAt8();
        // })

        if (typeof stockSymbol === 'string') {

            if (!isValidSymbol(stockSymbol.toUpperCase())) {
                return res.status(404).json({ error: "stock symbol is invalid" })
            }

            let email = req.user.email;
            // console.log(email);
            const saveHistory = `INSERT INTO history (email, symbol, date) VALUES (?,?,?)`;
            connection.query(saveHistory,[email, stockSymbol.toUpperCase(), Date.now()], (err)=>{
                if(err){
                    console.log("first error")
                    return res.status(400).json({error: err.message})
                }
            })

            const isSymbolPresent = `select * from stock where symbol='${stockSymbol.toUpperCase()}'`;
            connection.query(isSymbolPresent, async (err, rows)=>{
                if(err){
                    return res.status(400).json({error: err.message})
                }
                if(rows.length){
                    //parsing the data before output because stringify doesn't looks good.
                    const data = rows[0].stockDetails;
                    const parsedData = JSON.parse(data);
                    return res.status(200).json({foundData: parsedData})
                }
                const last7DaysData = await fetchLast7DaysData(stockSymbol as string);
                //because longText type field doesn't contain JSON object. We must stringify it first then save it. While showning the finalData we should reverse JSON.stringify() by JSON.parse()
                const finaldata = JSON.stringify(last7DaysData)  
                console.log(last7DaysData)
                if (last7DaysData == 'noData') {
                    return res.status(404).json({ error: `No company has ${stockSymbol} as their stock symbol` })
                }

                const saveStock = `INSERT INTO stock (email,symbol,stockDetails) VALUES(?,?,?)`;
                
                connection.query(saveStock,[email,(stockSymbol as string).toUpperCase(), finaldata], (err)=>{
                    if(err){
                        console.log("Second error")
                        return res.status(400).json({errpr:err.message})
                    }
                    else{
                        return res.status(201).json({last7DaysData})
                    }
            })

            })
            
        } else {
            return res.status(404).json({ error: "Provide a stock's symbol" })
        }

    } catch (err: any) {
        return res.status(404).json({ error: err.message })
        // console.log(err)
    }

}
