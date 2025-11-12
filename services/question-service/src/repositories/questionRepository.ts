import { db } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  title: string;
  question: string;
  difficulty: string;
  topics: string[];
}

interface CreateQuestionData {
  title: string;
  question: string;
  difficulty: string;
  topics: string[];
}

export const questionRepository = {
  async createQuestion(data: CreateQuestionData): Promise<Question> {
    try {
      const id = uuidv4();
      const query = `
        INSERT INTO "question" (id, title, question, difficulty, topics)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await db.query(query, [
        id,
        data.title,
        data.question,
        data.difficulty,
        data.topics
      ]);

      
      
      return result.rows[0] as Question;
    } catch (error) {
      console.error('Error creating question:', error);
      throw new Error('Failed to create question');
    }
  },

  async getAllQuestions(): Promise<Question[]> {
    try {
      const query = `
        SELECT id, title, question, difficulty, topics
        FROM "question"
        ORDER BY title ASC
      `;
      
      const result = await db.query(query);
      return result.rows as Question[];
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new Error('Failed to fetch questions');
    }
  },

  async getQuestionById(id: string): Promise<Question | null> {
    try {
      const query = `
        SELECT id, title, question, difficulty, topics
        FROM "question"
        WHERE id = $1
      `;
      
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as Question;
    } catch (error) {
      console.error('Error fetching question:', error);
      throw new Error('Failed to fetch question');
    }
  },

  async updateQuestion(id: string, data: Partial<CreateQuestionData>): Promise<Question | null> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (data.title !== undefined) {
        fields.push(`title = $${paramCount}`);
        values.push(data.title);
        paramCount++;
      }

      if (data.question !== undefined) {
        fields.push(`question = $${paramCount}`);
        values.push(data.question);
        paramCount++;
      }

      if (data.difficulty !== undefined) {
        fields.push(`difficulty = $${paramCount}`);
        values.push(data.difficulty);
        paramCount++;
      }

      if (data.topics !== undefined) {
        fields.push(`topics = $${paramCount}`);
        values.push(data.topics);
        paramCount++;
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);
      const query = `
        UPDATE "question"
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as Question;
    } catch (error) {
      console.error('Error updating question:', error);
      throw new Error('Failed to update question');
    }
  },

  async deleteQuestion(id: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM "question"
        WHERE id = $1
      `;
      
      const result = await db.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new Error('Failed to delete question');
    }
  },

  // From Chatgpt
  async findMatchingQuestion(difficulty: string, topics: string[]): Promise<Question | null> {
    try {
      // Find a question that matches the difficulty and has at least one matching topic (case-insensitive)
      const query = `
        SELECT id, title, question, difficulty, topics
        FROM "question"
        WHERE LOWER(difficulty) = LOWER($1)
          AND EXISTS (
            SELECT 1 FROM unnest(topics) AS topic
            WHERE LOWER(topic) LIKE LOWER($2) || '%'
               OR LOWER($2) LIKE LOWER(topic) || '%'
          )
        ORDER BY RANDOM()
        LIMIT 1
      `;
      
      const result = await db.query(query, [difficulty, topics[0]]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as Question;
    } catch (error) {
      console.error('Error finding matching question:', error);
      throw new Error('Failed to find matching question');
    }
  }
};