import express from "express";
import { authUser } from "../middlewares/auth.middleware";
import HomeController from "../controllers/home.controller";

const HomeRoutes = express.Router();
const homeController = new HomeController();

// GET /home        - Home page (featured listings, recent listings, categories)
// GET /categories  - All active categories
HomeRoutes.get("/home", homeController.getHome);
HomeRoutes.get("/categories", homeController.getCategories);

export default HomeRoutes;
