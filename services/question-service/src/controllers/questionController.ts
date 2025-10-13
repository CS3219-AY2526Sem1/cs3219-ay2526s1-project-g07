import { Hono } from "hono";
import type { Context } from "hono";
import { questionService } from "../services/questionService.js";

const questionController = new Hono();

// GET /questions - Get all questions
questionController.get("/", async (c: Context) => {
  try {
    const questions = await questionService.getAllQuestions();
    
    return c.json({
      message: "Questions retrieved successfully",
      questions: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error in getAllQuestions:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST /questions - Create new question
questionController.post("/", async (c: Context) => {
  try {
    const body = await c.req.json();
    const { title, question, difficulty, categories } = body;
    
    const newQuestion = await questionService.createQuestion({
      title,
      question, 
      difficulty,
      categories
    });
    
    return c.json({
      message: "Question created successfully",
      question: newQuestion
    }, 201);
  } catch (error) {
    console.error('Error in createQuestion:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        return c.json({ error: error.message }, 400);
      }
    }
    
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET /questions/:id - Get question by ID
questionController.get("/:id", async (c: Context) => {
  try {
    const id = c.req.param('id');
    const question = await questionService.getQuestionById(id);
    
    if (!question) {
      return c.json({ error: "Question not found" }, 404);
    }
    
    return c.json({
      message: "Question retrieved successfully",
      question: question
    });
  } catch (error) {
    console.error('Error in getQuestionById:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ error: "Internal server error" }, 500);
  }
});

// PUT /questions/:id - Update question
questionController.put("/:id", async (c: Context) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { title, question, difficulty, categories } = body;
    
    const updatedQuestion = await questionService.updateQuestion(id, {
      title,
      question,
      difficulty,
      categories
    });
    
    if (!updatedQuestion) {
      return c.json({ error: "Question not found" }, 404);
    }
    
    return c.json({
      message: "Question updated successfully",
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Error in updateQuestion:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        return c.json({ error: error.message }, 400);
      }
    }
    
    return c.json({ error: "Internal server error" }, 500);
  }
});

// DELETE /questions/:id - Delete question
questionController.delete("/:id", async (c: Context) => {
  try {
    const id = c.req.param('id');
    const deleted = await questionService.deleteQuestion(id);
    
    if (!deleted) {
      return c.json({ error: "Question not found" }, 404);
    }
    
    return c.json({
      message: "Question deleted successfully"
    });
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default questionController;