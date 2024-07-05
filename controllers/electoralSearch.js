import { makeRequest } from "../utils/index.js";

export default async (req, res) => {
    const data = req.body
    try {
        const response = await makeRequest(data)
    }
    catch (error) {
        console.log(error)
    }
    res.json(data)
}