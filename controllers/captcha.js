import { getCaptcha } from "../utils/index.js";

export default async (req, res) => {
    try {
        const captcha = await getCaptcha();
        res.json({
            status: "success",
            data: captcha
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }

}