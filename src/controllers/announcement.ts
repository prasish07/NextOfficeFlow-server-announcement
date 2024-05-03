import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import customAPIErrors from "../errors/customError";
import { CustomerRequestInterface } from "../middleware/auth.middleware";
import Announcement from "../modals/announcement";
import { sentEmail } from "../utils/mailTransporter";
import axios from "axios";
import { config } from "../config/config";

import { dateFormatter } from "../utils/utils";

export const createAnnouncement = async (req: Request, res: Response) => {
	const { userId, token } = (req as CustomerRequestInterface).user;

	const announcement = new Announcement({
		userId,
		content: req.body.content,
		date: req.body.date,
		endDate: req.body.endDate,
		title: req.body.title,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	await announcement.save();

	if (req.body.addToCalender === "yes") {
		try {
			const response = await axios.post(
				`${config.baseUrl}/api/v1/event`,
				{
					title: req.body.title,
					description: req.body.content,
					start: req.body.date,
					end: req.body.endDate,
					type: "announcement",
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
		} catch (error) {
			throw new customAPIErrors(
				"Event not added to calender",
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}

	try {
		// sent notification to everyone
		const notification = await axios.post(
			`${config.baseUrl}/api/v1/notification`,
			{
				message: `New announcement: <strong>${
					req.body.title
				}</strong> on ${dateFormatter(req.body.date)}`,
				link: `/announcement`,
				type: "announcement",
				userId: userId,
			}
		);

		if (!notification) {
			console.log("notification not sent");
		}

		const employees = await axios.get(`${config.baseUrl}/api/v1/employee`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		employees.data.data.forEach((employee: any) => {
			if (employee.email)
				sentEmail(employee.email, req.body.content, req.body.title);
		});

		res
			.status(StatusCodes.CREATED)
			.json({ message: "Announcement created successfully" });
	} catch (error: any) {
		throw new customAPIErrors(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
	}
};

export const getAllAnnouncements = async (req: Request, res: Response) => {
	const { date, endDate } = req.query;
	const filter: any = {};

	const { token } = (req as CustomerRequestInterface).user;

	if (date && endDate) {
		filter.date = { $gte: date, $lte: endDate };
	}

	const allAnnouncements = await Announcement.find(filter).sort({ date: -1 });

	const announcements = await Promise.all(
		allAnnouncements.map(async (announcement) => {
			// const employee = await Employee.findOne({ userId: announcement.userId });
			try {
				const { data } = await axios.get(
					`${config.baseUrl}/api/v1/user/information/${announcement.userId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				const employee = data.data;

				return {
					...announcement.toJSON(),
					employeeName: employee?.name,
					employeePosition: employee?.position,
				};
			} catch (error) {
				console.log("error", error);
				throw new customAPIErrors("Employee not found", StatusCodes.NOT_FOUND);
			}
		})
	);

	res.status(StatusCodes.OK).json({ announcements });
};

export const getAnnouncement = async (req: Request, res: Response) => {
	const { announcementId } = req.params;
	let announcementData = await Announcement.findById(announcementId);

	if (!announcementData) {
		throw new customAPIErrors("Announcement not found", StatusCodes.NOT_FOUND);
	}

	const { token } = (req as CustomerRequestInterface).user;

	try {
		const { data } = await axios.get(
			`${config.baseUrl}/api/v1/user/information/${announcementData.userId}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		const employeeData = data.data;

		const announcement = {
			...announcementData.toJSON(),
			employeeName: employeeData?.name,
			employeePosition: employeeData?.position,
		};

		res.status(StatusCodes.OK).json({ announcement });
	} catch (error: any) {
		throw new customAPIErrors(error.message, StatusCodes.NOT_FOUND);
	}
};

export const updateAnnouncement = async (req: Request, res: Response) => {
	const { announcementId } = req.params;

	const announcement = await Announcement.findById(announcementId);

	if (!announcement) {
		throw new customAPIErrors("Announcement not found", StatusCodes.NOT_FOUND);
	}

	announcement.content = req.body.content;
	announcement.endDate = req.body.endDate;
	announcement.title = req.body.title;
	announcement.updatedAt = new Date();

	await announcement.save();

	// sent notification to everyone
	const notification = await axios.post(
		`${config.baseUrl}/api/v1/notification`,
		{
			message: `Announcement updated: <strong>${req.body.title}</strong>`,
			link: `/announcement`,
			type: "announcement",
		}
	);

	res
		.status(StatusCodes.OK)
		.json({ message: "Announcement updated successfully" });
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
	const { announcementId } = req.params;

	const announcement = await Announcement.findByIdAndRemove(announcementId);

	if (!announcement) {
		throw new customAPIErrors("Announcement not found", StatusCodes.NOT_FOUND);
	}

	// sent notification to everyone
	const notification = await axios.post(
		`${config.baseUrl}/api/v1/notification`,
		{
			message: `Announcement deleted: <strong>${announcement.title}</strong>`,
			link: `/announcement`,
			type: "announcement",
		}
	);

	res
		.status(StatusCodes.OK)
		.json({ message: "Announcement deleted successfully" });
};
