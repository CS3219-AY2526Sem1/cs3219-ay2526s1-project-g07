// 3. Service (services/userService.ts)
import { userRepository } from '../repositories/userRepository';

export const userService = {
  async getUserData(userId: string) {
    return await userRepository.getUserData(userId);
  },
};