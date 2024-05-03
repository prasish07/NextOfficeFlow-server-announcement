import express from "express";
import "express-async-errors";
import { DbConnect } from "./db/DbConnect.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import router from "./routes/index.js";
import { config } from "./config/config.js";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// port
const port = config.server.port;

// security
app.use(helmet());
app.use(
	cors({
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(config.jwt.secret));

// routes
app.use(router);

// not found
app.use(notFound);

// error handler
app.use(errorHandler);

const start = async () => {
	try {
		// connecting to database
		await DbConnect(config.mongo.url);
	} catch (error) {
		console.log(error);
	}
	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
};

start();
