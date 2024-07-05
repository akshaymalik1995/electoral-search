
import express from "express";
import bodyParser from "body-parser";

import captcha from "./controllers/captcha.js";

import puppeteer from 'puppeteer'; // Import puppeteer




let browser

(async () => {
    browser = await puppeteer.launch({ headless: true });
})();


const app = express();



app.use(express.static("public"));
app.use(bodyParser.json());



app.post("/api/electoral-search", async (req, res) => {
    const { epicNumber, stateCd, captchaData, captchaId } = req.body;
    console.log(captchaData, captchaId);
    let page = await browser.newPage()

    await page.goto('https://electoralsearch.eci.gov.in/', {
        waitUntil: 'networkidle2',
    })

    await page.setRequestInterception(true)

    if (!epicNumber) {
        return res.status(400).send({ status: "error", "message": "Epic Number is required" });
    }

    if (stateCd === "NA") {
        return res.status(400).send({ status: "error", "message": "State is required" });
    }

    if (!captchaData) {
        return res.status(400).send({ status: "error", "message": "Captcha is required" });
    }

    page.on("request", async (request) => {
        if (request.postData() && request.url().includes("search-by-epic-from-national-display")) {
            const data = JSON.parse(request.postData());
            const newData = { ...data, captchaData: captchaData, captchaId: captchaId, stateCd: stateCd, epicNumber: epicNumber };
            console.log(newData);
            request.continue({
                postData: JSON.stringify(newData)
            })
        } else {
            request.continue()
        }

    })

    try {
        // Fill the form
        await page.locator('#epicID').fill(epicNumber);

        await page.select(".search-details-subbody-epic .form-select", stateCd);

        await page.locator('input[name="captcha"]').fill(captchaData);

        await page.locator('.search-buttons button').click();


        page.on('dialog', async dialog => {
            // console.log(dialog.message()); // Log the alert message
            // console.log(dialog.type()); // Log the dialog type
            await dialog.accept(); // Accept the dialog
            res.status(400).send({ status: "error", "message": dialog.message() });

        });

        await new Promise(resolve => setTimeout(resolve, 2000));



        const data = await page.$eval('.result-table', (element) => { return element.innerHTML });

        res.send({
            data: data
        });

        // Delete the page from pageSessions
        await page.close()

    } catch (err) {
        console.log(err);
        if (res.finished) return;
        res.status(500).send({ message: "Incorrect Details" });
    }

})

app.get("/api/get_captcha/", captcha)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));