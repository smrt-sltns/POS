const fs = require('fs');
const path = require('path');
const util = require('util');
const fse = require('fs-extra'); // For easier copying of directories
const mkdir = util.promisify(fs.mkdir);

const rootDir = process.env.APPDATA+"/POS";
const databasesDir = path.join(rootDir, 'server', 'databases');
const uploadsDir = path.join(rootDir, 'uploads');
const backupDir = path.join(rootDir, 'backups', new Date().toISOString().slice(0, 10)); 
const backupDatabasesDir = path.join(backupDir, 'databases');
const backupUploadsDir = path.join(backupDir, 'uploads');

async function backup_databases_and_images() {
    try {
        // Ensure the backup directory exists
        if (!fs.existsSync(backupDir)) {
            await mkdir(backupDir, { recursive: true });
            await mkdir(backupDatabasesDir, { recursive: true });
            await mkdir(backupUploadsDir, { recursive: true });
            console.log(`Created backup directory: ${backupDir}`);
        }

        // Copy the databases folder
        await fse.copy(databasesDir, backupDatabasesDir);
        console.log(`Copied databases folder to: ${backupDatabasesDir}`);

        // Copy the uploads folder
        await fse.copy(uploadsDir, backupUploadsDir);
        console.log(`Copied uploads folder to: ${backupUploadsDir}`);

        console.log('Backup completed successfully.');
    } catch (err) {
        console.error('Error during backup:', err);
    }
}

module.exports = backup_databases_and_images;
