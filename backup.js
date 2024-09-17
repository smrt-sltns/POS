const fs = require('fs');
const path = require('path');
const JSZip = require('jszip'); 
const fse = require('fs-extra');
const nodemailer = require('nodemailer');

const rootDir = process.env.APPDATA + "/POS";
const databasesDir = path.join(rootDir, 'server', 'databases');
const uploadsDir = path.join(rootDir, 'uploads');
const backupDir = path.join(rootDir, 'backups');
const zipFilePath = path.join(backupDir, `POS-backup-${new Date().toISOString().slice(0, 10)}.zip`);

async function backup_databases_and_images() {
    try {
        
        if (!fs.existsSync(backupDir)) {
            await fse.mkdir(backupDir, { recursive: true });
            console.log(`Created backups directory: ${backupDir}`);
        }
        
        await zipBackupFolder();
        await sendBackupEmail();

        console.log('Backup, zipping, and email sending completed successfully.');
    } catch (err) {
        console.error('Error during backup or email sending:', err);
    }
}

async function zipBackupFolder() {
    const zip = new JSZip();

    await addFolderToZip(zip, databasesDir, 'databases');
    await addFolderToZip(zip, uploadsDir, 'uploads');
    
    const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    await fse.writeFile(zipFilePath, content);
    console.log(`Zip file created successfully at ${zipFilePath}`);
}

async function addFolderToZip(zip, folderPath, folderName) {
    const folder = zip.folder(folderName);
    const files = await fse.readdir(folderPath);

    for (const fileName of files) {
        const fullPath = path.join(folderPath, fileName);
        const stats = await fse.stat(fullPath);

        if (stats.isDirectory()) {
            await addFolderToZip(folder, fullPath, fileName); 
        } else {
            const fileContent = await fse.readFile(fullPath);
            folder.file(fileName, fileContent);
        }
    }
}

async function sendBackupEmail() {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'coboaccess@gmail.com',
            pass: 'erxenrgmiefnhgkv'
        }
    });

    let mailOptions = {
        from: '"POS Backup" <coboaccess@gmail.com>',
        to: 'coboaccess@gmail.com, georgeyoumansjr@gmail.com',
        subject: 'POS Backup - ' + new Date().toISOString().slice(0, 10),
        text: 'Attached is the backup of your POS system databases and uploads.',
        attachments: [
            {
                filename: path.basename(zipFilePath),
                path: zipFilePath
            }
        ]
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            console.log(`Backup email sent: ${info.response}`);
            resolve();
        });
    });
}

module.exports = backup_databases_and_images;
