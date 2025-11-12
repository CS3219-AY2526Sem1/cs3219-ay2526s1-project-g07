import { Hono } from "hono";
import { auth } from "../lib/auth";
import type { Context } from "hono";

const testRoute = new Hono()

// A route to test my queries
testRoute.get("/table", async(c: Context) => {
  console.log("Test Route Get Request");
  const query = c.req.query('q') || 'default';
  const name = c.req.query('name') || 'World';

  return c.text(`Hello ${name}! Your query was: ${query}`);
});


export default testRoute;
