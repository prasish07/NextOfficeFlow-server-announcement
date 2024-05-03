import { config } from "../config/config";
import jwt from "jsonwebtoken";

export const verifyToken = (token: string) => {
	const secret = config.jwt.secret as string;
	const decoded = jwt.verify(token, secret);
	return decoded;
};

export const dateFormatter = (date: Date) => {
	const options = { year: "numeric", month: "long", day: "numeric" };
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};
