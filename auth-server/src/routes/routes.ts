import { Hono } from "hono";
import normalRoute from "./normal.route";
import protectedRoute from "./protected.route";
import testRoute from "./test.route";

const route = new Hono();


route.route("/normal", normalRoute);
route.route("/protected", protectedRoute);
route.route("/test", testRoute)

export default route;