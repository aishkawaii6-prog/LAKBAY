import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import database from "./src/configs/database.js";
import router from "./src/routes/routes.js";
import bodyParser from "body-parser";

dotenv.config();
const app = express();

app.use(cors({
    origin: "*",
    methods: ["POST", "GET", "PUT", "DELETE", "PATCH"]
}));

// Increase body size limit to 10 MB so cover image base64 uploads don't overflow
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true, parameterLimit: 10000 }));

app.use("/api", router);

const SERVER_PORT = process.env.SERVER_PORT || 3000;

// Test database connection before starting server
async function startServer() {
    try {
        // Test the pool connection
        await database.getConnection();
        console.log("✅ Database Connected Successfully");
    } catch (dbError) {
        console.log(`❌ Database Connection Failed: ${dbError.message}`);
        console.log('⚠️  Server will start without database functionality');
    }

    app.listen(SERVER_PORT, (error) => {
        if (!error) {
            console.log(`🚀 Server listening on PORT: ${SERVER_PORT}`);
        } else {
            console.log(`❌ Server error: ${error}`);
        }
    });
}

startServer();