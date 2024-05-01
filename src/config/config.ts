import path from "path";
import dotenv from "dotenv";

const absolutePath = path.join(__dirname, "../../.env");
dotenv.config({ path: absolutePath });

const MONGO_URL = process.env.MONGO_URL || ``;

const PORT = process.env.PORT || 5001;

const email = process.env.email;
const password = process.env.password;

export const config = {
	mongo: {
		url: MONGO_URL,
	},
	server: {
		port: PORT,
	},
	email,
	password,
};
