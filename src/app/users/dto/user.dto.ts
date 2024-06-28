import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { Address } from '@echos/core/auth/dto/auth.dto';

export class UserDTO {

  @ApiProperty({ type: String, description: 'pseudonyme of  user',required: false, })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  pseudonyme: string;

  @ApiProperty({ type: String, description: 'password of  user' ,required: false})
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: 'Password must contain at least 8 characters, letter, number and  special character',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: String, description: 'name of  user' ,required: false})
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ type: Address, description: 'address of  user' ,required: false})
  @IsObject()
  @IsOptional()
  @Type(() => Address)
  address?: Address;

  @ApiProperty({ type: String, description: 'comment of  user' ,required: false})
  @IsString()
  @IsOptional()
  comment?: string;


}

export class UserAdminDTO extends PartialType(UserDTO) {
  @ApiProperty({ type: String, description: 'role of  user' ,required: false})
  @IsIn(['admin', 'user'])
  @IsOptional()
  role?: 'admin' | 'user';
}

export class QueryDTO{

  @IsOptional()
  @ApiProperty({type: String, description: 'search text',required: false, })
  text: string;

  @IsOptional()
  @ApiProperty({type: String, description: 'property Sort',required: false, })
  propertySort: string;

  @IsOptional()
  @ApiProperty({ default: 1,type: Number, description: 'direction Sort' ,required: false, })
  @IsIn([1,-1])
  directionSort: number;

  @ApiProperty({
    minimum: 1,
    maximum: 10000,
    title: 'Page',
    exclusiveMaximum: true,
    exclusiveMinimum: true,
    format: 'int32',
    default: 1
  })
  page: number;
  @ApiProperty({
    maximum: 10000,
    title: 'limit',
    exclusiveMaximum: true,
    format: 'int32',
    default: 20
  })
  limit: number;
}
