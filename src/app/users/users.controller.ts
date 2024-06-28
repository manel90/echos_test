import { Body, Controller, Delete, Get, NotFoundException, Param, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@echos/core/auth/jwt-auth.guard';
import { ROLES } from '@echos/utils/constants/roles.constant';
import { User } from '@echos/shared/decorators/users.decorator';
import { Roles } from '@echos/shared/decorators/roles.decorator';
import { QueryDTO, UserAdminDTO, UserDTO } from '@echos/app/users/dto/user.dto';
import { Types } from 'mongoose';
import { SuccessInterceptor } from '@echos/shared/interceptors/success.interceptor';
import { RolesGuard } from '@echos/shared/guards/roles.guard';


// Utilisation des gardes JWT et de rôles pour sécuriser les routes du contrôleur
@UseGuards(JwtAuthGuard, RolesGuard)
// Documentation Swagger : tag 'Users' pour les routes de ce contrôleur
@ApiTags('Users')
// Utilisation du schéma d'authentification JWT pour les routes de ce contrôleur
@ApiBearerAuth()
// Préfixe de route 'users' pour toutes les routes de ce contrôleur
@Controller('users')
// Intercepteur de succès pour transformer les réponses en un format standardisé
@UseInterceptors(SuccessInterceptor)


export class UsersController {

  // Injection du service UsersService pour interagir avec les données utilisateur
  constructor(private readonly usersService: UsersService) {}

  /**
   * Récupérer le profil de l'utilisateur courant
   * @param {User} user - Utilisateur actuellement authentifié
   * @return {*} - Profil de l'utilisateur sans les champs iat, __v, et password
   */
  @Roles([ROLES.ALL])
  @Get('me')
  async getProfile(@User() user) {
    return await this.usersService.findOne({ _id: user._id }, { iat: 0, __v: 0, password: 0 });
  }

  /**
   * Modifier le profil de l'utilisateur courant
   * @param {UserDTO} body - Données du profil à mettre à jour
   * @param {User} user - Utilisateur actuellement authentifié
   * @return {*} - Profil de l'utilisateur mis à jour sans les champs iat, __v, et password
   */
  @Roles([ROLES.ALL])
  @Put('me')
  async editProfile(@Body() body: UserDTO, @User() user) {
    await this.usersService.update({ _id: user._id }, { $set: body });
    return await this.usersService.findOne({ _id: user._id }, { iat: 0, __v: 0, password: 0 });
  }

  /**
   * Supprimer un utilisateur par ID
   * Accessible uniquement aux administrateurs
   * @param {Types.ObjectId} id - ID de l'utilisateur à supprimer
   * @return {*} - Résultat de la suppression de l'utilisateur
   */
  @Roles([ROLES.ADMIN])
  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  async deleteUser(@Param('id') id: Types.ObjectId) {
    const userData = await this.usersService.findOne({ _id: id });
    if (!userData) {
      throw new NotFoundException('user not found');
    }
    return this.usersService.remove({ _id: id });
  }

  /**
   * Modifier un utilisateur par ID
   * Accessible uniquement aux administrateurs
   * @param {Types.ObjectId} id - ID de l'utilisateur à modifier
   * @param {UserAdminDTO} body - Données de l'utilisateur à mettre à jour
   * @return {*} - Utilisateur mis à jour sans les champs iat, __v, et password
   */
  @Roles([ROLES.ADMIN])
  @Put(':id')
  @ApiParam({ name: 'id', type: String })
  async editUser(@Param('id') id: Types.ObjectId, @Body() body: UserAdminDTO) {
    const userData = await this.usersService.findOne({ _id: id });
    if (!userData) {
      throw new NotFoundException('user not found');
    }
    await this.usersService.update({ _id: id }, { $set: body });
    return await this.usersService.findOne({ _id: id }, { iat: 0, __v: 0, password: 0 });
  }

  /**
   * Récupérer tous les utilisateurs avec options de tri et de filtrage
   * Accessible uniquement aux administrateurs
   * @param {QueryDTO} query - Options de tri et de filtrage
   * @return {*} - Liste des utilisateurs correspondant aux critères
   */
  @Roles([ROLES.ADMIN])
  @Get('')
  @ApiQuery({ type: QueryDTO })
  async getAllUser(@Query() query) {
    return await this.usersService.findAll(query);
  }

  /**
   * Récupérer un utilisateur par ID
   * Accessible uniquement aux administrateurs
   * @param {Types.ObjectId} id - ID de l'utilisateur à récupérer
   * @return {*} - Données de l'utilisateur sans les champs iat, __v, et password
   */
  @Roles([ROLES.ADMIN])
  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  async getUserByID(@Param('id') id: Types.ObjectId) {
    const userData = await this.usersService.findOne({ _id: id }, { iat: 0, __v: 0, password: 0 });
    if (!userData) {
      throw new NotFoundException('user not found');
    }
    return userData;
  }
}
