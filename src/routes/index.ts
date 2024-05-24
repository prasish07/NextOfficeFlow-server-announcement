import { Router, Request, Response } from "express";
import {
	authorizePermission,
	validateToken,
} from "../middleware/auth.middleware";
import {
	createAnnouncement,
	deleteAnnouncement,
	getAllAnnouncements,
	getAnnouncement,
	updateAnnouncement,
} from "../controllers/announcement";

const router = Router();

router.get("/about", (req, res) => {
	res.send("You have entered nextofficeflow announcement server");
});

router
	.route("/")
	.post(validateToken, authorizePermission("admin", "HR"), createAnnouncement)
	.get(validateToken, getAllAnnouncements);

router
	.route("/:announcementId")
	.get(validateToken, getAnnouncement)
	.put(validateToken, authorizePermission("admin", "HR"), updateAnnouncement)
	.delete(
		validateToken,
		authorizePermission("admin", "HR"),
		deleteAnnouncement
	);

export default router;
