
import axios from "axios";
import https from "https";
import crypto from "crypto";


const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
});


export async function makeRequest(data) {
    const url = "https://gateway.eci.gov.in/api/v1/elastic/search-by-epic-from-national-display/";
    const headers = {
        "referer": "https://electoralsearch.eci.gov.in/",
        "origin": "https://electoralsearch.eci.gov.in",
    }
    const response = await axios.post(url, data, { httpsAgent, headers });
    const html = response.data;
    console.log(html);
}


export async function getCaptcha() {
    const url = "https://gateway-voters.eci.gov.in/api/v1/captcha-service/generateCaptcha"
    const response = await axios.get(url);
    const data = response.data;
    return data;
}