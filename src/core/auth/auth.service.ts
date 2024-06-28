import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SigninDTO, SignupDTO } from '@echos/core/auth/dto/auth.dto';
import { UsersService } from '@echos/app/users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {

  constructor(
    private userService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService) {
  }

  /**
   * Valide l'existence d'un utilisateur par son ID.
   * @param {any} id - ID de l'utilisateur
   * @returns {Promise<any>} - Utilisateur trouvé ou null
   */
  async validateUser(id): Promise<any> {
    let user = await this.userService.findOne({ _id: id });
    return user?.toJSON(); // Retourne l'utilisateur au format JSON s'il est trouvé
  }

  /**
   * Inscription d'un nouvel utilisateur.
   * @param {SignupDTO} body - Données d'inscription de l'utilisateur
   * @returns {Promise<any>} - Token d'accès et refresh token générés
   * @throws {ForbiddenException} - Exception si le pseudonyme existe déjà
   */
  async signup(body: SignupDTO): Promise<any> {
    const { pseudonyme, password } = body;
    const user = await this.userService.findOne({ pseudonyme: pseudonyme.toLowerCase() });

    if (user) {
      throw new ForbiddenException('Account already exists !'); // Exception si le pseudonyme est déjà utilisé
    }

    if (password) {
      body.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8)); // Hachage du mot de passe
    }

    const newUser: any = await this.userService.create(body); // Création de l'utilisateur
    const payload = { userId: newUser._id, role: newUser.role, name: newUser.name }; // Données pour le token JWT
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt_refresh_secret'), // Signature du refresh token avec la clé secrète
      expiresIn: '7d', // Valide pendant 7 jours
    });

    return { token: this.jwtService.sign(payload), refreshToken, user: payload }; // Retourne le token d'accès, refresh token et les informations de l'utilisateur
  }

  /**
   * Connexion de l'utilisateur.
   * @param {SigninDTO} body - Données de connexion de l'utilisateur
   * @returns {Promise<any>} - Token d'accès et refresh token générés
   * @throws {NotFoundException} - Exception si l'utilisateur n'est pas trouvé
   * @throws {ForbiddenException} - Exception si les identifiants sont invalides
   */
  async signin(body: SigninDTO): Promise<any> {
    const { pseudonyme, password } = body;
    const user: any = await this.userService.findOne({ pseudonyme: pseudonyme.toLowerCase() });

    if (!user) {
      throw new NotFoundException('User not found!'); // Exception si l'utilisateur n'est pas trouvé
    }

    if (bcrypt.compareSync(password, user.password)) { // Vérification du mot de passe
      let data: any = { $set: { lastConxAt: new Date() } };
      await this.userService.update({ _id: user._id }, data); // Mise à jour de la dernière connexion de l'utilisateur
      const payload = { userId: user._id, role: user.role, name: user.name }; // Données pour le token JWT
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('jwt_refresh_secret'), // Signature du refresh token avec la clé secrète
        expiresIn: '7d', // Valide pendant 7 jours
      });

      return { token: this.jwtService.sign(payload), refreshToken, user: payload }; // Retourne le token d'accès, refresh token et les informations de l'utilisateur
    } else {
      throw new ForbiddenException('Invalid credentials !'); // Exception si les identifiants sont invalides
    }
  }

  /**
   * Rafraîchissement du token d'accès à partir du refresh token.
   * @param {string} refreshToken - Refresh token à vérifier et utiliser pour générer un nouveau token d'accès
   * @returns {Promise<any>} - Nouveau token d'accès et refresh token générés
   * @throws {UnauthorizedException} - Exception si le refresh token est invalide
   */
  async refresh(refreshToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt_refresh_secret'), // Vérification du refresh token avec la clé secrète
      });

      const newPayload = { userId: payload._id, role: payload.role, name: payload.name }; // Nouveau payload pour le token JWT
      return {
        accessToken: this.jwtService.sign(newPayload), // Nouveau token d'accès signé
        refreshToken: this.jwtService.sign(newPayload, {
          secret: this.configService.get('jwt_refresh_secret'), // Signature du nouveau refresh token avec la clé secrète
          expiresIn: '7d', // Valide pendant 7 jours
        }),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token'); // Exception si le refresh token est invalide
    }
  }

}
