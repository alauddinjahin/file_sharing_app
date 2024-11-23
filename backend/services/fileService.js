const prisma = require('./prismaService');
const HttpStatus = require('../utils/statusCodes');
const { disk, pathToUpload } = require('../config/file');
const storages = require('../utils/storages');

class FileService {

    constructor(){
        this.disk = disk;
        this.pathToUpload = pathToUpload;
    }
    
    uploader(){
        return storages[this.disk] ?? null;
    }

    async uploadFile({ userId, file, tags }) {

        if (!file) {
            throw new RequestError('No file uploaded.', HttpStatus.BAD_REQUEST);
        }

        const { originalname, mimetype, path: filePath } = file;

        const fileType = mimetype.startsWith('image') ? 'image' : 'video';

        // Save file metadata in the database
        return prisma.file.create({
            data: {
                userId,
                filename: originalname,
                fileType,
                filePath,
                tags: tags?.length ? { create: tags.map((tagId) => ({ tagId })) } : undefined,
            },
            include: {
                tags: { include: { tag: true } },
            },
        });
    }

    async findUserByEmail(email) {
        return await prisma.user.findUnique({ where: { email } });
    }
}

module.exports = new FileService();
