import path from "path";
import dotenv from "dotenv";

const absolutePath = path.join(__dirname, "../../.env");
dotenv.config({ path: absolutePath });

const MONGO_URL = process.env.MONGO_URL || ``;

const PORT = process.env.PORT || 5001;

const JWT_SECRET = process.env.JWT_SECRET;
const email = process.env.email;
const password = process.env.password;
const baseUrl = process.env.baseUrl;

export const config = {
	mongo: {
		url: MONGO_URL,
	},
	server: {
		port: PORT,
	},
	jwt: {
		secret: JWT_SECRET,
	},

	email,
	password,
	leaveDetails: {
		availableLeaves: 12,
	},
	baseUrl,
};
