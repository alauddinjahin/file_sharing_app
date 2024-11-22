const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('./prismaService');
const HttpStatus = require('../utils/statusCodes');
const config = require('./../config').app;

class AuthService {

  async findUserByEmail(email){
    return await prisma.user.findUnique({ where: { email } });
  }

  async register(email, password, name, files) {
    const hashedPassword = await bcrypt.hash(password, 10);
    let payload = { email, password: hashedPassword, name };

    if (files?.length) {
      payload = { ...payload, files };
    }

    return prisma.user.create({
      data: payload,
      select: {
        id: true,
        email: true,
        name: true,
        files: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Login method
  async login(email, password) {
    const user = await this.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new RequestError('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: '1d' });
    return { user, token };
  }
}

module.exports = new AuthService();
