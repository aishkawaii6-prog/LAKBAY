import mysql from "mysql2/promise";
import dotenv from "dotenv"

dotenv.config();

const pool = mysql.createPool({
    host: process.env.HOST || "localhost",
    user: process.env.USER || "root",
    password: process.env.PASSWORD || "",
    port: process.env.PORT || 3306,
    database: process.env.DATABASE || "mern",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test n connection on startup
pool.getConnection()
    .then(() => console.log("✅ Database Connected via Pool"))
    
    .catch(err => console.log(`❌ Database Connection Error: ${err.message}`));

export default pool;
