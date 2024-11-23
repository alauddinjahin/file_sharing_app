const prisma = require('./prismaService');
const HttpStatus = require('../utils/statusCodes');

class TagService {

  #generatePayload(name, files=[]){
    return { name, ...(files?.length && { files }) };
  }

  async findTagById(id){
    return await prisma.tag.findUnique({ where: { id } });
  }

  async create(name, files) {
    const payload = this.#generatePayload(name,  files)
    return prisma.tag.create({
      data: payload,
      select: {
        id: true,
        name: true,
        files: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }


  async update(id, name) {
    const tag = await this.findTagById(id);
    if (!tag) {
      throw new RequestError('Tag not found!', HttpStatus.NOT_FOUND);
    }

    return prisma.tag.update({
      where: { id },
      data: this.#generatePayload(name),
      select: {
        id: true,
        name: true,
        files: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }


   // Retrieve all tags with optional filtering and pagination
   async findAll({ filter, skip = 0, take = 10 }) {
    const where = filter ? { name: { contains: filter } } : undefined;

    return prisma.tag.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        files: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id) {
    const tag = await this.findTagById(id);
    if (!tag) {
      throw new RequestError('Tag not found!', HttpStatus.NOT_FOUND);
    }

    return prisma.tag.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        files: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

}

module.exports = new TagService();
