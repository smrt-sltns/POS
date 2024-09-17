const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const fse = require('fs-extra');
const nodemailer = require('nodemailer'); 

const rootDir = process.env.APPDATA + "/POS";
const databasesDir = path.join(rootDir, 'server', 'databases');
const uploadsDir = path.join(rootDir, 'uploads');
const backupDir = path.join(rootDir, 'backups'); 
const zipFilePath = path.join(backupDir, `backup-${new Date().toISOString().slice(0, 10)}.zip`); 

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
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } }); 

        output.on('close', () => {
            console.log(`Zip file created successfully at ${zipFilePath} (${archive.pointer()} total bytes)`);
            resolve();
        });

        archive.on('warning', err => {
            if (err.code === 'ENOENT') {
                console.warn('Warning:', err);
            } else {
                reject(err);
            }
        });

        archive.on('error', err => {
            reject(err);
        });

        
        archive.pipe(output);

        
        archive.directory(databasesDir, 'databases'); 
        archive.directory(uploadsDir, 'uploads');     

        
        archive.finalize();
    });
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
