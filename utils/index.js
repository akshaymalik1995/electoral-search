
import axios from "axios";
import https from "https";
import crypto from "crypto";



export async function getCaptcha() {
    const url = "https://gateway-voters.eci.gov.in/api/v1/captcha-service/generateCaptcha"
    const response = await axios.get(url);
    const data = response.data;
    return data;
}