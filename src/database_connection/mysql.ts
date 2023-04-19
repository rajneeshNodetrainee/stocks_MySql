import mysql from "mysql"


export const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stock'
    });

export const connectDb = ()=>{
    connection.connect((error) => {
    if (error) {
        console.error(error);
    } else {
        console.log('Connected to the database');
    }
    });
}

