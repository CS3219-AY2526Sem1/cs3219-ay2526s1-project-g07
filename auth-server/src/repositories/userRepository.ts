// 4. Repository (repositories/userRepository.ts)
import { db } from '../db/connection';

interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  description?: string | null;
  role?: string | null;
}

export const userRepository = {
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      const query = `
        SELECT id, name, email, "emailVerified", image, "createdAt", "updatedAt", "description", "role"
        FROM "user" 
        WHERE id = $1
      `;
      
      const result = await db.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as UserData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error('Failed to fetch user data');
    }
  }

};

