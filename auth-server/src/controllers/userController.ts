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

userController.put("/updateUserData/:userId", async (c: Context) => {
  console.log("Updating user data for user ID:", c.req.param('userId'))
  const userId = c.req.param('userId')
  
  if (!userId) {
    return c.json({ error: "User ID is required" }, 400)
  }

  try {
    const body = await c.req.json()
    const { name, description } = body
    console.log(body)
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return c.json({ error: "Name is required" }, 400)
    }

    // Update user data
    await userService.updateUserData(userId, { name, description })
    
    // Return updated data
    const updatedUserData = await userService.getUserData(userId)
    
    return c.json({
      message: "User data updated successfully",
      userId: updatedUserData?.id,
      name: updatedUserData?.name,
      description: updatedUserData?.description,
    })
  } catch (error) {
    console.error('Error in updateUserData:', error)
    return c.json({ error: "Internal server error" }, 500)
  }
})


export default userController;