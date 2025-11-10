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
  profileImage?: string | null;
  collab_id?: string | null;
}

export const userRepository = {
  async getUserData(userId: string): Promise<UserData | null> {
    try {
      const query = `
        SELECT id, name, email, "emailVerified", image, "createdAt", "updatedAt", "description", "role", "profileImage"
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
  },
  async updateUserData(userId: string, data: any): Promise<void> {
    try {
      const { name, description, profileImage } = data;
      
      // Build dynamic query based on provided fields
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      
      if (description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(description);
      }
      
      if (profileImage !== undefined) {
        updates.push(`"profileImage" = $${paramIndex++}`);
        values.push(profileImage);
      }
      
      updates.push(`"updatedAt" = NOW()`);
      values.push(userId);
      
      const query = `
        UPDATE "user"
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
      `;
      
      await db.query(query, values);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw new Error('Failed to update user data');
    }

  },
  async getAllUsers(): Promise<UserData[]> {
    try {
      const query = `
        SELECT id, name, email, "emailVerified", image, "createdAt", "updatedAt", "description", "role"
        FROM "user"
        ORDER BY "createdAt" DESC
      `;
      
      const result = await db.query(query);
      return result.rows as UserData[];
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new Error('Failed to fetch all users');
    }
  },
  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      const query = `
        UPDATE "user"
        SET role = $1, "updatedAt" = NOW()
        WHERE id = $2
      `;
      await db.query(query, [role, userId]);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  },
  async updateUserCollabId(userId: string, collabSessionId: string | null): Promise<void> {
    try {
      const query = `
        UPDATE "user"
        SET collab_id = $1, "updatedAt" = NOW()
        WHERE id = $2
      `;
      await db.query(query, [collabSessionId, userId]);
    } catch (error) {
      console.error('Error updating user collab_id:', error);
      throw new Error('Failed to update user collab_id');
    }
  }
};
