import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    enum: Role, 
    description: 'User role', 
    example: Role.PATIENT 
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}