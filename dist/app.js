"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express2 = __toESM(require("express"));

// src/routes/router.ts
var import_express = __toESM(require("express"));

// src/controller/get.ts
var get = (req, res) => {
  res.sendStatus(400);
};

// src/modules/emptyRequestBody.ts
var emptyRequestBody = (req) => {
  if (Object.keys(req.body).length) {
    return false;
  }
  return true;
};

// src/controller/userRegister.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_validator = __toESM(require("validator"));

// src/modules/sendOtp.ts
var import_twilio = __toESM(require("twilio"));
var sgMail = __toESM(require("@sendgrid/mail"));
var otp;
var otpTimestamp;
var sendOtpOnWhatsapp = async () => {
  const client = (0, import_twilio.default)(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
  otp = Math.floor(Math.random() * 9e4) + 1e4;
  client.messages.create({
    body: `Your otp is ${otp}`,
    from: "whatsapp:+14155238886",
    to: "whatsapp:+917030138451"
  }).then((message) => {
    console.log(message.sid);
    console.log("otpTimestamp", otpTimestamp);
  }).catch((e) => console.log(e));
  console.log("otp", otp);
  otpTimestamp = Date.now();
  return { otp, otpTimestamp };
};
var sendOtpOnMail = async (email) => {
  otp = Math.floor(Math.random() * 9e4) + 1e4;
  const msg = {
    to: email,
    from: "rajneesh@solulab.com",
    subject: "Verify stock api OTP",
    text: "Please verify your account.",
    html: `<strong>Hi there, thank you for signing up.<br>Here is your one time password.<br><i> ${otp}<br>This otp is valid for 5 minutes only.</strong>`
  };
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const sentMsg = await sgMail.send(msg);
  otpTimestamp = Date.now();
  console.log("mail sent");
  console.log("otp", otp);
  return { otp, otpTimestamp };
};

// src/database_connection/mysql.ts
var import_mysql = __toESM(require("mysql"));
var connection = import_mysql.default.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "stock"
});
var connectDb = () => {
  connection.connect((error) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Connected to the database");
    }
  });
};

// src/controller/userRegister.ts
var userRegister = async (req, res) => {
  try {
    if (emptyRequestBody(req)) {
      return res.status(400).json({ error: "Nothing found" });
    }
    const { name, phone, email, password, channel } = req.body;
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }
    if (!import_validator.default.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (!password) {
      return res.status(400).json({ error: "password is required" });
    }
    if (password.length < 8) {
      return res.status(401).json({ error: "Password must be of atleat 8 characters" });
    }
    if (!phone) {
      return res.status(400).json({ error: "phone is required" });
    }
    if (phone.toString().length != 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    if (!channel || channel != "message" && channel != "mail") {
      return res.status(400).json({ error: "Channel can be either message or mail only" });
    }
    const findEmail = `select * from user where email='${email}'`;
    connection.query(findEmail, async (err, rows) => {
      console.log(rows);
      console.log("rows ki length ", rows.length);
      if (err) {
        console.log("first err");
        return res.status(400).json({ error: err.message });
      }
      if (rows.length) {
        return res.status(409).json({ error: "Someone is using this email id" });
      } else {
        const hashedPassword = await import_bcryptjs.default.hash(password, 10);
        let otp2;
        if (channel == "message") {
          otp2 = await sendOtpOnWhatsapp();
        } else {
          otp2 = await sendOtpOnMail(email);
        }
        if (!otp2) {
          return res.status(400).json({ error: "Otp was not delivered" });
        }
        const receivedOtp = otp2.otp.toString();
        const hashedOtp = await import_bcryptjs.default.hash(receivedOtp, 10);
        console.log("hashedotp", hashedOtp);
        console.log("otp", otp2);
        const query = "INSERT INTO user (name,email,password,phone) VALUES (?, ?, ?,?)";
        connection.query(query, [name, email, hashedPassword, phone], (err2) => {
          if (err2) {
            res.status(400).json({ error: err2.message });
            return;
          }
        });
        console.log("after error still im here....boom");
        const insertInOtp = "INSERT INTO otp (email,otp,generatedAt,channel) VALUES (?, ?, ?, ?)";
        connection.query(insertInOtp, [email, hashedOtp, otp2.otpTimestamp, channel], (err2, result) => {
          if (err2) {
            console.log("secong err");
            return res.status(400).json({ error: err2.message });
          } else {
            console.log("please verify your otp");
            return res.status(201).json({ message: "Please verify your otp" });
          }
        });
      }
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// src/controller/verifyOtp.ts
var import_validator2 = __toESM(require("validator"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var verifyOtp = async (req, res) => {
  if (emptyRequestBody(req)) {
    return res.status(400).json({ error: "Nothing in the body" });
  }
  const { email, otp: otp2 } = req.body;
  if (!otp2 || !email) {
    return res.status(404).json({ error: "Provide otp and email" });
  }
  if (!import_validator2.default.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (otp2.toString().length !== 5) {
    return res.status(401).json({ error: "Enter an otp of length 5" });
  }
  const findEmailInOtp = `select * from otp where email='${email}'`;
  connection.query(findEmailInOtp, async (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!rows.length) {
      return res.status(404).json({ error: "User is not registered" });
    }
    const databaseotp = rows[rows.length - 1].otp;
    const otpTimestamp2 = rows[rows.length - 1].generatedAt;
    if (Date.now() - otpTimestamp2 > 3e7 * 1e3) {
      return res.status(401).json({ error: "OTP has expired." });
    }
    console.log(typeof databaseotp);
    const isMatch = await import_bcryptjs2.default.compare(otp2.toString(), databaseotp);
    console.log("databaseotp", databaseotp);
    console.log("otp", otp2);
    console.log(isMatch);
    console.log(otp2.toString() === databaseotp);
    if (isMatch) {
      const newToken = import_jsonwebtoken.default.sign(
        { email: rows[rows.length - 1].email },
        process.env.SECRET_KEY,
        { expiresIn: "48h" }
      );
      res.cookie("jwt", newToken);
      console.log("jwtToken", newToken);
      const updateQuery = `UPDATE user SET isVerified = '1' WHERE email = '${email}'`;
      connection.query(updateQuery, (updateError) => {
        if (updateError) {
          return res.status(400).json({ eerror: updateError.message });
        } else {
          return res.status(202).json({ message: "User authenticated" });
        }
      });
    } else {
      return res.status(400).json({ error: "Incorrect otp" });
    }
  });
};

// src/middlewares/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string") {
      const token = authHeader.split(" ")[1];
      const verifyUser = import_jsonwebtoken2.default.verify(token, process.env.SECRET_KEY);
      console.log("verifyUser", verifyUser);
      const findUser = `SELECT * FROM user where email = '${verifyUser.email}'`;
      connection.query(findUser, (err, rows) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        if (!rows.length) {
          return res.status(404).json({ error: "PLease make a registration first" });
        }
        if (!rows[rows.length - 1].isVerified) {
          return res.status(401).json({ error: "Please verify your otp first" });
        } else {
          req.token = token;
          req.user = rows[rows.length - 1];
          next();
        }
      });
    } else {
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (e) {
    return res.status(404).json({ error: "Please log in to be authorised " });
  }
};

// src/modules/fetchLast7DaysData.ts
var import_lodash = __toESM(require("lodash"));
var fetchLast7DaysData = async (stockSymbol) => {
  const api = process.env.ALPHA_API_KEY;
  var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stockSymbol}&apikey=${api}`;
  const result = await fetch(url);
  const response = await result.json();
  const dailyData = response["Time Series (Daily)"];
  if (import_lodash.default.isNull(dailyData) || import_lodash.default.isUndefined(dailyData) || import_lodash.default.isEmpty(dailyData)) {
    return "noData";
  }
  const filteredData = Object.keys(dailyData).slice(0, 7);
  const last7DaysData = filteredData.map((date) => ({ date, ...dailyData[date] }));
  return last7DaysData;
};

// src/modules/isValidSymbol.ts
var isValidSymbol = (stockSymbol) => {
  const pattern = /^[A-Z0-9.]{1,20}$/;
  return pattern.test(stockSymbol);
};

// src/controller/getStock.ts
var getStock = async (req, res) => {
  try {
    let stockSymbol = req.query.symbol;
    if (!stockSymbol) {
      return res.status(404).json({ error: "Which company's stock you are looking for..." });
    }
    if (typeof stockSymbol === "string") {
      if (!isValidSymbol(stockSymbol.toUpperCase())) {
        return res.status(404).json({ error: "stock symbol is invalid" });
      }
      let email = req.user.email;
      const saveHistory = `INSERT INTO history (email, symbol, date) VALUES (?,?,?)`;
      connection.query(saveHistory, [email, stockSymbol.toUpperCase(), Date.now()], (err) => {
        if (err) {
          console.log("first error");
          return res.status(400).json({ error: err.message });
        }
      });
      const isSymbolPresent = `select * from stock where symbol='${stockSymbol.toUpperCase()}'`;
      connection.query(isSymbolPresent, async (err, rows) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        if (rows.length) {
          const data = rows[0].stockDetails;
          const parsedData = JSON.parse(data);
          return res.status(200).json({ foundData: parsedData });
        }
        const last7DaysData = await fetchLast7DaysData(stockSymbol);
        const finaldata = JSON.stringify(last7DaysData);
        console.log(last7DaysData);
        if (last7DaysData == "noData") {
          return res.status(404).json({ error: `No company has ${stockSymbol} as their stock symbol` });
        }
        const saveStock = `INSERT INTO stock (email,symbol,stockDetails) VALUES(?,?,?)`;
        connection.query(saveStock, [email, stockSymbol.toUpperCase(), finaldata], (err2) => {
          if (err2) {
            console.log("Second error");
            return res.status(400).json({ errpr: err2.message });
          } else {
            return res.status(201).json({ last7DaysData });
          }
        });
      });
    } else {
      return res.status(404).json({ error: "Provide a stock's symbol" });
    }
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};

// src/controller/userHistory.ts
var historyUser = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const email = req.user.email;
    const findHistory = `SELECT * FROM HISTORY WHERE EMAIL= '${email}' LIMIT ${limit} OFFSET ${skip}`;
    connection.query(findHistory, (err, rows) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (!rows.length) {
        return res.status(404).json({ error: "We have reached end of the table" });
      }
      return res.status(200).json({ history: rows });
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// src/routes/router.ts
var router = import_express.default.Router();
router.get("/", get);
router.post("/api/v1/user/register", userRegister);
router.post("/api/v1/verifyotp", verifyOtp);
router.get("/api/v1/stock/get", auth, getStock);
router.get("/api/v1/user/history", auth, historyUser);

// src/app.ts
var import_node_cron = __toESM(require("node-cron"));
var import_dotenv = __toESM(require("dotenv"));
var import_path = __toESM(require("path"));

// src/modules/updateDailyStock.ts
var updateStockDailyAt10 = async () => {
  const findStock = `SELECT * FROM STOCK`;
  connection.query(findStock, async (err, rows) => {
    for (let i = 0; i < rows.length; i++) {
      let stockSymbol = rows[i].symbol;
      console.log(stockSymbol);
      const last7Days = await fetchLast7DaysData(stockSymbol);
      const finalData = JSON.stringify(last7Days);
      const updateQuery = `UPDATE STOCK SET stockDetails = '${finalData}' WHERE symbol = '${stockSymbol}' `;
      connection.query(updateQuery, (err2) => {
        if (err2) {
          console.log(err2.message);
          return;
        }
      });
    }
  });
};

// src/app.ts
var dotenvPath = import_path.default.join(__dirname, "..", "src", ".env");
var app = (0, import_express2.default)();
connectDb();
import_dotenv.default.config({ path: dotenvPath });
import_node_cron.default.schedule("26 10 * * *", () => {
  updateStockDailyAt10();
});
app.use(import_express2.default.json());
app.use(router);
app.listen(3e3, () => {
  console.log("server started at 3000");
});
