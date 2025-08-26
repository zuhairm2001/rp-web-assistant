import { Hono } from "hono"
import { generateText } from "ai"
import createLLMS from "../utils/llms"


const chat = new Hono().basePath("/chat")

chat.get("/",
  async(c) => {
    const {deepseek} = createLLMS(c.env.GATEWAY_API_KEY);
    const response = await generateText({
      model: deepseek,
      messages: [{ role: "user", content: "Hello, how are you?" }],
    })
    return c.json(response)
  }
)

export default chat
