import { Hono } from "hono";
import normalRoute from "./normal.route";
import protectedRoute from "./protected.route";
import testRoute from "./test.route";
import userController from "../controllers/userController";

const route = new Hono();

route.route("/normal", normalRoute);
route.route("/protected", protectedRoute);
route.route("/test", testRoute)
route.route("/", userController) // Mount at root since already under /api/user/

export default route;
