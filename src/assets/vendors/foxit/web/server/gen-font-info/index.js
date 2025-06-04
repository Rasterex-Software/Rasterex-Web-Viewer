const syncRequest = require('sync-request');
const fs = require('fs');
const path = require('path');
const os = require('os');
const binarizen = require('./src/tool');

let toolIns;

async function main() {
    if (!process.argv[2]) {
        console.error('Please enter input path');
        process.exit(1);
        return;
    }

    toolIns = await binarizen({
        locateFile: (filename) => {
            return path.resolve(__dirname, './src', filename);
        },
    });

    let [inputPath, outputPath, outputOverride] = process.argv.slice(2);
    if (outputOverride) {
        outputOverride = outputOverride === 'false' ? 'false' : 'true';
        if (!path.isAbsolute(outputPath)) {
            outputPath = path.resolve(__dirname, outputPath);
        }
    } else {
        if (outputPath === 'true' || outputPath === 'false') {
            outputOverride = outputPath;
            outputPath = path.resolve(__dirname, './fontInfo.csv');
        } else {
            outputOverride = 'true';
            if (outputPath) {
                if (!path.isAbsolute(outputPath)) {
                    outputPath = path.resolve(__dirname, outputPath);
                }
            } else {
                outputPath = path.resolve(__dirname, './fontInfo.csv');
            }   
        }
    }
    // console.log(111, inputPath, outputPath, outputOverride);

    let results = [];
    
    if (outputOverride === 'false' && fs.existsSync(outputPath)) {
        const existContent = fs.readFileSync(outputPath, 'utf8');
        if (existContent.indexOf('\r\n') > -1) {
            results = existContent.split('\r\n').filter(Boolean).map(item => item + '\r\n');
        } else {
            results = existContent.split('\n').filter(Boolean).map(item => item + '\n');
        }
    }

    if (inputPath.startsWith('http://') || inputPath.startsWith('https://')) {
        getFromServer(inputPath, results);
    } else {
        await getFromLocal(inputPath, results);
    }
    
    fs.writeFileSync(outputPath, results.join(''));
}

function getFromServer(inputPath, results) {
    const response = syncRequest('GET', inputPath);
    const contentType = response.headers['content-type'];
    if (contentType === 'application/octet-stream') {
        const fontName = inputPath.split('/').pop();
        const result = getFontInformation(results.length + 1, fontName, response.getBody());
        results.push(result);
    } else if (contentType === 'application/json') {
        const fontList = JSON.parse(response.getBody('utf8') || '[]');
        const resultsLength = results.length;
        fontList.forEach((fontUrl, index) => {
            const fontName = fontUrl.split('/').pop();
            const buffer = syncRequest('GET', fontUrl).getBody();
            const result = getFontInformation(resultsLength + index + 1, fontName, buffer);
            results.push(result);
        });
    }
}    

async function getFromLocal(inputPath, results) {
    if (!path.isAbsolute(inputPath)) {
        inputPath = path.resolve(__dirname, inputPath);
    }
    await recursiveLocalPath(inputPath, results);
}

async function recursiveLocalPath(inputPath, results) {
    const statInputPath = fs.statSync(inputPath);
    if (statInputPath.isDirectory()) {
        const inputPathDir = fs.opendirSync(inputPath);
        for await (const dirent of inputPathDir) {
            await recursiveLocalPath(path.resolve(inputPath, dirent.name), results);
        }
    } else if (statInputPath.isFile()) {
        const fontName = inputPath.split(/[\\\/]/).pop();
        const buffer = fs.readFileSync(inputPath);
        const result = getFontInformation(results.length + 1, fontName, buffer);
        if (result) {
            results.push(result);
        }
    }
}

function getFontInformation(index, fontName, buffer) {
    const streamCallback = toolIns.StreamCallback.implement({
        GetSize: () => buffer.byteLength,
        GetPosition: () => 0,
        ReadBlock: (cursor, offset, size) => {
            const src = new Uint8Array(buffer);
            const array = src.slice(offset, offset + size);
            toolIns.HEAPU8.set(array, cursor);
            return true;
        },
        Release: () => {
        },
    });

    let info = toolIns.GetFontInformation(index, fontName, streamCallback); // 换行符为 \r\n
    return info;
}

main();

