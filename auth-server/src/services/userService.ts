// 3. Service (services/userService.ts)
import { userRepository } from '../repositories/userRepository';

export const userService = {
  async getUserData(userId: string) {
    return await userRepository.getUserData(userId);
  },
  async updateUserData(userId: string, data: any) {
    // Implement update logic here
    return await userRepository.updateUserData(userId, data);
  },
  async getAllUsers() {
    return await userRepository.getAllUsers();
  },
  async updateUserRole(userId: string, role: string) {
    return await userRepository.updateUserRole(userId, role);
  }
};