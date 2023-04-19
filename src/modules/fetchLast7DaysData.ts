import _ from "lodash"
export const fetchLast7DaysData = async (stockSymbol:string)=>{

    const api = process.env.ALPHA_API_KEY;
    
    var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stockSymbol}&apikey=${api}`;
                
        const result = await fetch(url);
        const response = await result.json();
        const dailyData = response['Time Series (Daily)']

        if(_.isNull(dailyData) || _.isUndefined(dailyData) || _.isEmpty(dailyData)){
            return "noData"
        }
        
        const filteredData =Object.keys(dailyData).slice(0,7);
        // console.log("filteredData", filteredData)
        
        const last7DaysData = filteredData.map((date:any)=> ({date, ...dailyData[date]}))
        // console.log("last7DaysData in module", last7DaysData)

        return last7DaysData
}
