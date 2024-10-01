require('dotenv').config();

const fs = require('fs').promises;
const fss = require('fs');
const path = require('path');
const process = require('process');
const axios = require('axios');

const transactionsDb = require('./api/transactions').db;
const usersDb = require('./api/users').db;
const inventoryDb = require('./api/inventory').db;
const customersDb = require('./api/customers').db;

const SHEETS_SERVER_URL = process.env.SHEETS_SERVER_URL || "http://localhost:3005";
const SHEETS_SERVER_API_KEY = process.env.SHEETS_SERVER_API_KEY || "temp";

const DATABASES = {
    "transactions": transactionsDb,
    "users": usersDb,
    "inventory": inventoryDb,
    "customers": customersDb,
}


function getSheetData() {

    const sheetNames = [
        "transactions",
        "users",
        "customers",
        "inventory",
    ];

    const sheetData = {};

    for (let sheetName of sheetNames) {
        sheetData[sheetName] = getDocs(sheetName);
    }

    return sheetData;
}



function getDocs(sheetName) {
    let db = DATABASES[sheetName]; // getDataStore(sheetName);
    const fileContent = fss.readFileSync(db.filename, 'utf8');
    const lines = fileContent.trim().split('\n');
    const docs = lines.map(line => JSON.parse(line));

    return docs;
}


async function backup_to_sheets() {
    let sheetData = getSheetData();
    try {

        let dataToPost = {
            "API_KEY": SHEETS_SERVER_API_KEY,
            "sheetData": sheetData
        }

        const response = await axios.post(SHEETS_SERVER_URL, dataToPost);

        console.log('Server Response:', response.data);

    } catch (error) {
        console.error('Error occurred while sending POST request:', error);
    }
    return sheetData;
}


module.exports = backup_to_sheets;

// backup_to_sheets();