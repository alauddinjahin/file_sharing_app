const fs = require('fs');
const path = require('path');

// Path to the Prisma models directory
const modelsDir = path.resolve(__dirname, 'models');
const schemaPath = path.resolve(__dirname, 'schema.prisma');

const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.prisma'));

// Start building the schema file content
let schemaContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb" // or any other provider you use
  url      = env("DATABASE_URL")
}

// Combined Models
`;

// Read each model file and append its content to the schema
modelFiles.forEach(file => {
  const modelContent = fs.readFileSync(path.join(modelsDir, file), 'utf-8');
  schemaContent += `\n// Imported from ${file}\n${modelContent}\n`;
});

// Write the combined content to the schema.prisma file
fs.writeFileSync(schemaPath, schemaContent, 'utf-8');
console.log('Prisma schema has been updated.');
