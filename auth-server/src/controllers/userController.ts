import { Hono } from "hono";
import type { Context } from "hono";
import { userService } from "../services/userService";

const userController = new Hono();


userController.get("/", (c: Context) => {
  return c.json({ message: "This is the user route" });
});

userController.get("/getUserData/:userId", async (c: Context) => {
  console.log("Getting user data for user ID:", c.req.param('userId'))
  const userId = c.req.param('userId')
  console.log(userId)
  
  if (!userId) {
    return c.json({ error: "User ID is required" }, 400)
  }

  try {
    const userData = await userService.getUserData(userId)
    
    if (!userData) {
      return c.json({ error: "User not found" }, 404)
    }

    console.log(userData)

    return c.json({
      message: "User data retrieved",
      userId: userData.id,
      name: userData.name,
      description: userData.description,
    })
  } catch (error) {
    console.error('Error in getUserData:', error)
    return c.json({ error: "Internal server error" }, 500)
  }
})

export default userController;