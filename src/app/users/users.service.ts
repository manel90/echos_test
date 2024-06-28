import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '@echos/shared/schemas/user.schema';
import { UserDTO } from '@echos/app/users/dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // Injection du modèle Mongoose pour interagir avec la collection des utilisateurs
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) {}

  /**
   * Créer un nouvel utilisateur
   * @param {UserDTO} createUserDto - Données de l'utilisateur à créer
   * @return {*} - L'utilisateur créé
   */
  async create(createUserDto) {
    const data = await this.userModel.create(createUserDto);
    return data;
  }

  /**
   * Récupérer tous les utilisateurs avec options de tri, de pagination et de recherche
   * @param {any} query - Options de recherche, de tri et de pagination
   * @return {*} - Liste des utilisateurs correspondant aux critères
   */
  async findAll(query) {
    let { limit = 20, page = 1, text, propertySort, directionSort } = query;
    const skip = (page - 1) * limit;
    let sort = {};
    sort[propertySort] = parseInt(directionSort);

    return await this.userModel.find(text ? { $text: { $search: text, $caseSensitive: true } } : {})
      .select({ iat: 0, __v: 0, password: 0 }) // Exclure certains champs de la réponse
      .limit(limit).skip(skip) // Appliquer la pagination
      .sort(sort); // Appliquer le tri
  }

  /**
   * Récupérer un utilisateur selon un critère de recherche
   * @param {any} query - Critère de recherche
   * @param {any} [select] - Champs à sélectionner
   * @return {*} - L'utilisateur correspondant au critère
   */
  async findOne(query: any, select?) {
    return await this.userModel.findOne(query).select(select || {});
  }

  /**
   * Mettre à jour un utilisateur selon un critère de recherche
   * @param {any} query - Critère de recherche
   * @param {any} data - Données à mettre à jour
   * @return {*} - L'utilisateur mis à jour
   */
  async update(query: any, data: any) {
    // Hachage du mot de passe si présent dans les données
    if (data.password)
      data.password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(8));

    return await this.userModel.findOneAndUpdate(
      query,
      data,
      {
        new: true, // Retourner le document mis à jour
        useFindAndModify: false,
      },
    );
  }

  /**
   * Supprimer des utilisateurs selon un critère de recherche
   * @param {any} query - Critère de recherche
   * @return {*} - Résultat de l'opération de suppression
   */
  async remove(query: any) {
    return await this.userModel.deleteMany(query);
  }
}
