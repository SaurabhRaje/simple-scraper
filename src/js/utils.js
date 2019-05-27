const fs = require("fs");
const converter = require("json-2-csv");

const parseArgs = (args) => {
    const parsedArgs = {};
    args.forEach(arg => {
        let match = arg.match(/^--(\w+)=(\S+)$/);
        if (match && match.length === 3) {
            parsedArgs[match[1]] = match[2];
        }
    });
    console.log("Options:");
    console.table(parsedArgs);
    console.log("");
    return parsedArgs;
};

const getOutputPath = () => {
    return "dist/csv/";
};

const getOutputFilename = format => {
    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    const timestamp = new Date(Date.now() - timezoneOffset).toISOString();
    switch (format) {
        case "date":
            return timestamp.substring(0, timestamp.indexOf("T"));
        case "time":
            return timestamp.substring(timestamp.indexOf("T") + 1, timestamp.indexOf(".")).replace(/\D/g, "-");
        case "datetime":
        default:
            return timestamp.substring(0, timestamp.indexOf(".")).replace(/\D/g, "-");
    }
};

const readInputFile = filename => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, "utf8", (err, csv) => {
            if (err) return reject(err.message);
            console.log(`"${filename}" read`);

            csv = csv.replace(/\r\n/g, "\n");
            converter.csv2jsonAsync(csv, { excelBOM: true }).then(json => {
                json = json.map(item => item.query);
                resolve(json);
            });
        });
    });
};

const writeOutputFile = (json, path, filename) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, { recursive: true }, async err => {
            if (err) return reject(err.message);

            const csv = await converter.json2csvAsync(json, { excelBOM: true });
            fs.writeFile(filename, csv, err => {
                if (err) return reject(err.message);
                resolve(`\n"${filename}" written`);
            });
        });
    });
};

module.exports = {
    parseArgs,
    getOutputPath,
    getOutputFilename,
    readInputFile,
    writeOutputFile
};
