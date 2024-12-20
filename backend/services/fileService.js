const { apiUrl } = require('../config').app;
const HttpStatus = require('../utils/statusCodes');
const { disk, pathToUpload } = require('../config').file;
const storages = require('../utils/storages');
const prismaService = require('./prismaService');
const fs = require('fs/promises'); // Use promises API for async file operations
const path = require('path');
const crypto = require('crypto');

class FileService {

    constructor(){
        this.disk = disk;
        this.pathToUpload = pathToUpload;
    }

    #getTable() {
        const table = "file";
        return prismaService.getClient()[table];
    }
    
    uploader(){
        return storages[this.disk] ?? null;
    }

    async getFileHash(filePath) {
        const fileBuffer = await fs.readFile(filePath);
        const hash = crypto.createHash('sha256');
        hash.update(fileBuffer);
        return hash.digest('hex');
    }

    async isFileUniqueByContent(filePath, existingHashes) {
        try {
            
            const fileHash = await this.getFileHash(filePath);
            
            if (existingHashes.has(fileHash)) {
                return false; 
            } else {
                return true; // Content is unique
            }

        } catch (error) {
            console.error('Error checking file uniqueness by content:', error);
            throw error;
        }
    }


    async #handleFileUpload({ userId, files, tags, isMulti=false }) {
        
        if (!files || files?.length === 0) {
            throw new RequestError("No files provided for upload.", HttpStatus.BAD_REQUEST);
        }

        // console.log(files,'files---------------------')
    
        const uploadedFilePaths = [];
        try {


            // Process each file and associate with tags
            const tagNames = [...new Set(tags)];

             // Step 1: Check and create missing tags
             if (tagNames && tagNames?.length > 0) {
                const existingTags = await prismaService.getClient().tag.findMany({
                    where: { name: { in: tagNames } },
                });

                const existingTagNames = new Set(existingTags.map(tag => tag.name));
                const tagsToCreate = tagNames.filter(tag => !existingTagNames.has(tag));
                // console.log('============================================')
                for (const tag of tagsToCreate) {

                    const exists = await prismaService.getClient().tag.findUnique({
                        where: { name: tag} 
                    });

                    try {
                        if(!exists){
                           const tagData= await prismaService.getClient().tag.create({ data: { name: tag } });
                        //    console.log(tagData,'tagData')
                        }
                    } catch (error) {
                        if (error.code !== 'P2002') { // Ignore duplicate entry errors
                            throw error;
                        }
                    }
                }
            }

            const uploadedFiles = await Promise.all(
                files.map(async (file) => {

                    const { originalname, mimetype, path } = file;
                    const filePath = `${apiUrl}/images/${file?.filename}`;
                    const fileType = mimetype.startsWith("image") ? "image" : "video";
                    const fileHash = await this.getFileHash(path);
                    const oldFile  = await prismaService.getClient().file.findFirst({ where: { fileHash: fileHash }})
                  
                    uploadedFilePaths.push(filePath);

                    if(!oldFile){
                        return await this._createFileWithTagsV3({
                            userId,
                            filename: originalname,
                            fileType,
                            filePath,
                            fileHash,
                            isMulti,
                            tagNames: tagNames,
                        });
                    }
    
                })
            );

    
            return [...new Set(uploadedFiles)].filter(item => item != null);

        } catch (error) {
            console.error("Error uploading files:", error);
            await this.#cleanupUploadedFiles(uploadedFilePaths);
            throw new RequestError("File upload failed.", HttpStatus.FORBIDDEN);
        }
    }


    async #cleanupUploadedFiles(filePaths) {
        try {
            const deletePromises = filePaths.map(async (filePath) => {
                try {

                    const pathname = new URL(filePath)?.pathname;
                    // Resolve it to the file system path
                    const absolutePath = path.resolve(path.join('public', pathname));
    
                    // Delete the file
                    await fs.unlink(absolutePath);
    
                    console.log(`Deleted file:  ${filePath}`);
                } catch (error) {
                    console.error(`Failed to delete file: ${filePath}`, error);
                }
            });
    
            await Promise.all(deletePromises);

        } catch (cleanupError) {
            console.error("Error during file cleanup:", cleanupError);
        }
    }
 

    async _createFileWithTags(fileData) {
        const { userId, filename, fileType, filePath, tags } = fileData;
    
        // Ensure tags are unique
        const tagNames = [...new Set(tags)];
    
        try {
            const tagRecords = await prismaService.getClient().$transaction(async (prisma) => {
                // Step 1: Find or Create Tags
                const tags = await Promise.all(
                    tagNames.map(async (tagName) => {

                        const existingTag = await prisma.tag.findUnique({
                            where: { name: tagName },
                        });

                        return (
                            existingTag ||
                            (await prisma.tag.create({
                                data: { name: tagName },
                            }))
                        );
                    })
                );
    
                // Step 2: Create File and Link Tags
                const newFile = await prisma.file.create({
                    data: {
                        userId,
                        filename,
                        fileType,
                        filePath,
                        tags: {
                            create: tags.map((tag) => ({
                                tagId: tag.id,
                            })),
                        },
                    },
                    include: {
                        tags: {
                            include: { tag: true },
                        },
                    },
                });
    
                return newFile;
            });
    
            const transformedFile = {
                ...tagRecords,
                tags: tagRecords.tags.map((fileTag) => fileTag.tag),
            };
    
            return transformedFile;

            // return tagRecords;
        } catch (error) {
            console.error("Error creating file with tags:", error);
            throw new RequestError('Failed to create file with tags.', HttpStatus.FORBIDDEN);
        }
    }  
    

    async _createFileWithTagsV2(fileData) {

        const { 
            userId, 
            filename, 
            fileType, 
            filePath, 
            newTags, 
            newTagsWithName, 
            tagNamesReq, 
            isMulti 
        } = fileData;

        const retryTransaction = async (prisma) => {
            try {
                
                if (newTags?.length > 0) {
                    newTags.map(async(tagName) => {

                        const fnExisting = await prisma.tag.findUnique({
                            where: { name: tagName },
                        });

                        if(!fnExisting){
                            await prisma.tag.create({
                                data: { name: tagName },
                            });
                        }
                    })

                }

                // Step 2: Get all Tags
                const allTags = await prisma.tag.findMany({
                    where: { name: { in: newTags } },
                });

                return await prisma.file.create({
                    data: {
                        userId,
                        filename,
                        fileType,
                        filePath,
                        tags: {
                            create: allTags.map((tag) => ({
                                tagId: tag.id,
                            })),
                        },
                    },
                    include: {
                        tags: { include: { tag: true } },
                    },
                });

            } catch (error) {
                console.error("Error during tag creation:", error);
                throw error; // Rethrow the error after logging
            }
        };
    
        try {

            let result = await prismaService.getClient().$transaction(retryTransaction);

            const transformedFile = {
                ...result,
                tags: result?.tags?.map((fileTag) => fileTag.tag) ?? [],
            };

            return transformedFile;

        } catch (error) {
            console.error("Error creating file with tags:", error);
            throw new RequestError("Failed to create file with tags.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async _createFileWithTagsV3(fileData) {
        const { userId, filename, fileType, filePath, fileHash, tagNames } = fileData;
    
        const retryTransaction = async (prisma) => {
            try {
    
                // Step 2: Fetch all tags again
                const allTags = await prisma.tag.findMany({
                    where: { name: { in: tagNames } },
                });
    
                // Step 3: Create File and Link Tags
                const newFile = await prisma.file.create({
                    data: {
                        userId,
                        filename,
                        fileType,
                        filePath,
                        fileHash,
                        tags: {
                            create: allTags.map(tag => ({
                                tagId: tag.id,
                            })),
                        },
                    },
                    include: {
                        tags: { include: { tag: true } },
                    },
                });
    
                return newFile;
    
            } catch (error) {
                console.error("Error during transaction:", error);
                throw error;
            }
        };
    
        try {
            const result = await prismaService.getClient().$transaction(retryTransaction);
    
            const transformedFile = {
                ...result,
                tags: result?.tags?.map((fileTag) => fileTag.tag) ?? [],
            };
    
            return transformedFile;
        } catch (error) {
            console.error("Error creating file with tags:", error);
            throw new RequestError("Failed to create file with tags.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async _createFileWithTagsV4(fileData) {
        const { 
            userId, 
            filename, 
            fileType, 
            filePath,
            tagNames,
            isMulti 
        } = fileData;
    
        const retryTransaction = async (prisma) => {
            try {

                // Ensure newTags is an array and filter out any invalid tags
                if (tagNames && tagNames.length > 0) {
                    // Create tags if they don't exist, batching the insertions to avoid deadlocks
                    const existingTags = await prisma.tag.findMany({
                        where: {
                            name: { in: tagNames },
                        },
                        select: {
                            name: true,
                        },
                    });
    
                    const existingTagNames = new Set(existingTags.map(tag => tag.name));
                    const tagsToCreate = tagNames.filter(tag => !existingTagNames.has(tag));
    
                    // Use `createMany` for batch insert, which is more efficient and avoids deadlocks

                    if (tagsToCreate.length > 0) {
                        try {
                            await prisma.tag.createMany({
                                data: tagsToCreate.map(tag => ({ name: tag })),
                            });
                        } catch (error) {
                            console.error("Error in createMany for tags:", error);
                            throw new Error("Failed to create tags.");
                        }
                    }
                }
    
                // Step 2: Get all Tags
                const allTags = await prisma.tag.findMany({
                    where: { name: { in: tagNames } },
                });
    
                // Step 3: Create File and Link Tags
                const newFile = await prisma.file.create({
                    data: {
                        userId,
                        filename,
                        fileType,
                        filePath,
                        tags: {
                            create: allTags.map(tag => ({
                                tagId: tag.id,
                            })),
                        },
                    },
                    include: {
                        tags: { include: { tag: true } },
                    },
                });
    
                return newFile;

            } catch (error) {
                console.error("Error during tag creation:", error);
                throw error; // Rethrow the error after logging
            }
        };
    
        try {
            // Retry transaction up to 3 times in case of deadlocks or write conflicts
            let result;
            let attempts = 0;
            while (attempts < 3) {
                try {
                    result = await prismaService.getClient().$transaction(retryTransaction);
                    break; // If the transaction is successful, break out of the loop
                } catch (error) {
                    if (error.code === 'P2002' || error.code === 'P2003') {
                        // Retry on deadlock or conflict errors
                        attempts++;
                        console.log(`Retrying transaction... Attempt ${attempts}`);
                        if (attempts >= 3) {
                            throw new RequestError("Failed to create file with tags after multiple retries.", HttpStatus.INTERNAL_SERVER_ERROR);
                        }
                    } else {
                        throw error; // If not a deadlock or conflict, throw the error
                    }
                }
            }
    
            const transformedFile = {
                ...result,
                tags: result?.tags?.map((fileTag) => fileTag.tag) ?? [],
            };
    
            return transformedFile;
        } catch (error) {
            console.error("Error creating file with tags:", error);
            throw new RequestError("Failed to create file with tags.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    
    
    
    

    async uploadFile({ userId, file, tags }) {

        if (!file) {
            throw new RequestError('No file uploaded.', HttpStatus.BAD_REQUEST);
        }

        return await this.#handleFileUpload({ userId, files: [file], tags, isMulti: true });
    }


    async uploadMultiFile({ userId, files, tags }) {

        if (!files?.length) {
            throw new RequestError('No file uploaded.', HttpStatus.BAD_REQUEST);
        }

        return await this.#handleFileUpload({ userId, files, tags, isMulti: true });
    }

    
}

module.exports = new FileService();














