import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class Address {
  @ApiProperty({ type: String, description: 'street of Address user',required: false })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiProperty({ type: String, description: 'city of Address user' ,required: false})
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ type: String, description: 'country of Address user',required: false })
  @IsString()
  @IsOptional()
  country?: string;
}

export class SignupDTO {

  @ApiProperty({ type: String, description: 'pseudonyme of  user' })
  @IsString()
  @IsNotEmpty()
  pseudonyme: string;

  @ApiProperty({ type: String, description: 'password of  user' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: 'Password must contain at least 8 characters, letter, number and  special character',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: String, description: 'name of  user',required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ type: Address, description: 'address of  user',required: false })
  @IsObject()
  @IsOptional()
  @Type(() => Address)
  address?: Address;

  @ApiProperty({ type: String, description: 'comment of  user',required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ type: String, description: 'role of  user',required: false })
  @IsIn(['admin', 'user'])
  @IsOptional()
  role?: 'admin' | 'user';


}


export class SigninDTO {

  @ApiProperty({ type: String, description: 'pseudonyme of  user' })
  @IsString()
  @IsNotEmpty()
  pseudonyme: string;

  @ApiProperty({ type: String, description: 'password of  user' })
  @IsString()
  @IsNotEmpty()
  password: string;


}

export class TokenDto {

  @ApiProperty({ type: String, description: 'refreshToken of  user' })
  @IsString()
  readonly refreshToken: string;
}
