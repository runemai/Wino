import OpenAI from "openai";
import { env } from "./env";

export const createOpenAIClient = () => {
  const { OPENAI_API_KEY } = env.server();

  return new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
};

