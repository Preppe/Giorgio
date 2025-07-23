import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    return user;
  }

  async findUserByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findUserById(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  async createUser(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const createdUser = new this.userModel({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
    });
    return createdUser.save();
  }

  async updateUserSettings(userId: string, updateUserSettingsDto: UpdateUserSettingsDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, { $set: updateUserSettingsDto }, { new: true, runValidators: true });

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return this.findUserById(userId);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, { $set: updateProfileDto }, { new: true, runValidators: true });

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return this.findUserById(userId);
  }
}
