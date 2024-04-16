import { UserService } from './../user/user.service';
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './signIn.dto';
import { UserDto } from 'src/user/user.dto';
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.userName, signInDto.password);
  }

  @Post('signup')
  signUp(@Body() userDto: UserDto) {
    return this.userService.createUser(userDto);
  }
  @Post('validate')
  validateToken(@Body() body: { token: string }) {
    const token = body.token;
    return this.authService.validateToken(token);
  }
}
