
import express from "express";
import bodyParser from "body-parser";
import electoralSearch from "./controllers/electoralSearch.js";
import captcha from "./controllers/captcha.js";

import puppeteer from 'puppeteer'; // Import puppeteer
import crypto from 'crypto'; // Import crypto



let browser

(async () => {
    browser = await puppeteer.launch({ headless: false });
})();


const app = express();



app.use(express.static("public"));
app.use(bodyParser.json());


const pageSessions = {};


app.post("/api/electoral-search", async (req, res) => {
    const { epicNumber, stateCd, captchaData, pageId } = req.body;

    if (!epicNumber) {
        return res.status(400).send({ status: "error", "message": "Epic Number is required" });
    }

    if (stateCd === "NA") {
        return res.status(400).send({ status: "error", "message": "State is required" });
    }

    if (!captchaData) {
        return res.status(400).send({ status: "error", "message": "Captcha is required" });
    }

    if (!pageId || pageId === "undefined") {
        return res.status(400).send({ status: "error", "message": "Invalid Request. Refresh the page" });
    }

    console.log(req.body);
    // Get page from pageSessions
    const page = pageSessions[pageId];
    if (!page) {
        return res.status(400).send({ "message": "Page not found" });
    }

    try {
        // Fill the form


        await page.locator('#epicID').fill(epicNumber);

        await page.select(".search-details-subbody-epic .form-select", stateCd);

        await page.locator('input[name="captcha"]').fill(captchaData);

        await page.locator('.search-buttons button').click();

        await page.setRequestInterception(true)

        page.on("request", async (request) => {
            console.log(request.url());
            request.continue()
        })

        page.on('dialog', async dialog => {
            // console.log(dialog.message()); // Log the alert message
            // console.log(dialog.type()); // Log the dialog type
            // await dialog.accept(); // Accept the dialog
            res.status(400).send({ status: "error", "message": dialog.message() });

        });

        await new Promise(resolve => setTimeout(resolve, 2000));


        const data = await page.$eval('.result-table', (element) => { return element.innerHTML });
        console.log(data);
        res.send({
            data: data
        });

        // Delete the page from pageSessions
        await page.close()
        delete pageSessions[pageId];
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Internal Server Error" });
    }

})



app.get("/api/captcha", async (req, res) => {
    try {
        if (!browser) {
            browser = await puppeteer.launch({ headless: false });
        }
        const page = await browser.newPage();
        await page.setRequestInterception(true)
        page.on("request", async (request) => {
            console.log(request.url(), request.postData());
            request.continue()
        })
        const pageid = crypto.randomBytes(16).toString("hex");

        pageSessions[pageid] = page;

        console.log(pageid, pageSessions);

        await page.goto('https://electoralsearch.eci.gov.in/', {
            waitUntil: 'networkidle2',
        });

        const captchaDiv = await page.$('.captcha-div');
        // Wait for the image to load

        const imgElement = await captchaDiv.$('img');

        const textContent = await imgElement.evaluate(element => element.getAttribute('src'));

        res.send({ captcha: textContent, id: pageid });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Internal Server Error" });
    }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));