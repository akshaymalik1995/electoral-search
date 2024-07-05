import { getCaptcha } from "../utils/index.js";

export default async (req, res) => {
    const captcha = await getCaptcha();
    res.json({
        status: "success",
        data: captcha
    });
}