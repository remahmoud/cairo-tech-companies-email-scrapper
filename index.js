import fs from "fs";
import ora from "ora";
import chalk from "chalk";
import prompts from "prompts";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

const url =
    "https://docs.google.com/spreadsheets/u/0/d/101uckSfVnie8JyCxE65R5fpEam_vmz589IinE5yLFcI/htmlview";

(async () => {
    try {
        const response = await prompts(
            [
                {
                    type: "text",
                    name: "fileName",
                    message: "Enter file name",
                    initial: "emails",
                },
                {
                    type: "select",
                    name: "fileType",
                    message: "Choose output data type",
                    choices: [
                        { title: "txt", value: "txt" },
                        { title: "json", value: "json" },
                    ],
                    initial: 0,
                },
            ],
            {
                onCancel: () => {
                    console.log("operation cancelled");
                },
            }
        );

        // initialize the spinner
        const spinner = ora("Scraping emails...").start();

        // open the headless browser
        const browser = await puppeteer.launch({ headless: "new" });

        // open a new page
        const page = await browser.newPage();

        // enter url in page
        await page.goto(url);

        // wait for element defined by XPath appear in page
        const html = await page.content();

        // get html content of the page
        const $ = cheerio.load(html);

        // get all the table cells
        const cells = $("table tbody tr td");

        // data array to store the emails
        const data = [];

        // regex to check if the cell contains an email
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g;

        // loop through all the cells
        // if the cell contains an email, push it to the data array
        cells.each((index, element) => {
            if (emailRegex.test($(element).text())) {
                data.push($(element).text().replace(/\s/g, ""));
            }
        });
        // remove empty rows
        data.filter((row) => row.length > 0);

        // close the browser
        await browser.close();

        // save the data to a file
        if (response.fileType === "json") {
            const json = JSON.stringify(
                data.map((email) => ({ email })),
                null,
                2
            );

            fs.writeFileSync(`${response.fileName}.json`, json);
        } else {
            fs.writeFileSync(`${response.fileName}.txt`, data.join("\n"));
        }

        // stop the spinner
        spinner.stop();
        console.log(chalk.green.bold("Emails saved successfully!"));
    } catch (err) {
        console.log(err);
    }
})();
