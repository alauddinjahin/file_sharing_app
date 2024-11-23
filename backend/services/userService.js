const bcrypt = require('bcrypt');
const HttpStatus = require('../utils/statusCodes');
const prismaService = require('./prismaService');
const { salt } = require('../config/app');

class UserService {


    #getTable() {
        const table = "user";
        return prismaService.getClient()[table];
    }

    #getSelect() {
        return {
            id: true,
            email: true,
            name: true,
            files: true,
            isOnline: true,
            createdAt: true,
            updatedAt: true,
        };
    }

    async getUserById(identifier, extras={}) {
        const where = { id: identifier };
        return this.#getTable().findUnique({
            where,
            select: { ...this.#getSelect(), ...extras },
        });
    }

    async getUserByEmail(identifier, extras = {}) {
        const where = { email: identifier };
        return this.#getTable().findUnique({
            where,
            select: { ...this.#getSelect(), ...extras },
        });
    }

    async getUsers(filter = {}, pagination = { skip: 0, take: 10 }) {
        return this.#getTable().findMany({
            where: filter,
            skip: pagination.skip,
            take: pagination.take,
            select: this.#getSelect(),
        });
    }


    async createUser({ email, password, name, files }) {
        const existingUser = await this.getUserByEmail(email);
        if (existingUser) {
            throw new RequestError('Email already been taken!', HttpStatus.BAD_REQUEST);
        }

        const hashedPassword = await bcrypt.hash(password, salt);
        const payload = { email, password: hashedPassword, name, ...(files?.length && { files }) };

        return this.#getTable().create({
            data: payload,
            select: this.#getSelect(),
        });
    }


    async updateUserById(id, data) {

        const existingUser = await this.getUserById(id);
        if (!existingUser) {
            throw new RequestError('User not found!', HttpStatus.NOT_FOUND);
        }

        if (data?.password) {
            data.password = await bcrypt.hash(data.password, salt);
        }

        return this.#getTable().update({
            where: { id },
            data,
            select: this.#getSelect(),
        });
    }


    // Delete a user by ID
    async deleteUserById(id) {

        const existingUser = await this.getUserById(id);
        if (!existingUser) {
            throw new RequestError('User not found!', HttpStatus.NOT_FOUND);
        }

        return this.#getTable().delete({
            where: { id },
        });

    }


    // Mark a user as online
    async markAsOnline(id) {
        return this.#getTable().update({
            where: { id },
            data: { isOnline: true },
            select: this.#getSelect(),
        });
    }

    // Mark a user as offline
    async markAsOffline(id) {
        return this.#getTable().update({
            where: { id },
            data: { isOnline: false },
            select: this.#getSelect(),
        });
    }


}

module.exports = new UserService();
