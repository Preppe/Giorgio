import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { User } from '../auth/decorators/user.decorator';
import { JwtPayload } from '../auth/types/jwt.types';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('preferences')
  async updateUserSettings(@User() user: JwtPayload, @Body() updateUserSettingsDto: UpdateUserSettingsDto) {
    return this.usersService.updateUserSettings(user.sub, updateUserSettingsDto);
  }

  @Patch('profile')
  async updateProfile(@User() user: JwtPayload, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, updateProfileDto);
  }
}
