import { connection } from "../database_connection/mysql";
import { fetchLast7DaysData } from "./fetchLast7DaysData";

export const updateStockDailyAt10 = async ()=>{

    const findStock = `SELECT * FROM STOCK`;
    connection.query(findStock,async (err, rows)=>{
        // if(err){
        //     return res.status(400).json({error: err.message})
        // }
        for(let i=0;i<rows.length;i++){
            let stockSymbol = rows[i].symbol;
            console.log(stockSymbol)
            const last7Days = await fetchLast7DaysData(stockSymbol)
            const finalData = JSON.stringify(last7Days)
            const updateQuery = `UPDATE STOCK SET stockDetails = '${finalData}' WHERE symbol = '${stockSymbol}' `
            connection.query(updateQuery, (err)=>{
                if(err){
                    console.log(err.message)
                    return;
                }
            })
        }

    })
}
