const puppeteer = require("puppeteer-core");
const Utils = require("./js/utils");

const args = Utils.parseArgs(process.argv.slice(2));

(async () => {
    console.time(" TOTAL OPERATION TIME");

    const urls = await Utils.readInputFile("src/csv/urls.csv");
    const selectors = await Utils.readInputFile("src/csv/selectors.csv");

    if (Array.isArray(urls) && urls.length) {
        const browser = await puppeteer.launch({
            executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            headless: args.headless !== "n",
            devtools: args.devtools === "y"
        });

        const page = (await browser.pages())[0];
        page.setViewport({ width: 1366, height: 768 });
        console.log("\nBrowser opened");

        const queryData = [];
        const path = Utils.getOutputPath();
        const filename = `${path}${Utils.getOutputFilename()}.csv`;

        for (let i = 0, len = urls.length; i < len; i++) {
            let url = urls[i];

            console.log(`\n[${i + 1} of ${len}]\nFetching "${url}"...`);
            console.time("Query time");

            const response = await page.goto(url, { waitUntil: "domcontentloaded" });
            const pageData = {
                url,
                status: response.status()
            };

            Object.assign(pageData, await page.evaluate(selectors => {
                const data = {};
                for (let selector of selectors) {
                    const element = document.querySelector(selector);
                    data[selector] = element ? element.innerText.trim() : "";
                }
                return data;
            }, selectors));
            queryData.push(pageData);

            console.timeEnd("Query time");
        }

        const writeResult = await Utils.writeOutputFile(queryData, path, filename);
        console.log(writeResult);

        console.log("\nOperation complete");

        await browser.close();
        console.log("Browser closed\n");

        console.log("-".repeat(35));
        console.timeEnd(" TOTAL OPERATION TIME");
        console.log("-".repeat(35));
    }
})();