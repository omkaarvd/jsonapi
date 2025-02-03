import { type Request, type Response } from "express";
import { z } from "zod";
import {
  COMPLEX_EXAMPLE_ANSWER,
  COMPLEX_EXAMPLE_PROMPT,
  EXAMPLE_ANSWER,
  EXAMPLE_PROMPT,
  NESTED_EXAMPLE_ANSWER,
  NESTED_EXAMPLE_PROMPT,
} from "./utils/example-prompt";
import { openai } from "./utils/openai";
import { RetryablePromise } from "./utils/retryable-promise";
import { jsonSchemaToZod } from "./utils/schema.handler";

export const jsonController = async (req: Request, res: Response) => {
  const body = req.body;

  const genericSchema = z.object({
    data: z.string().min(1, "Data field cannot be empty"),
    format: z.object({}).passthrough(),
  });

  const { data, format } = genericSchema.parse(body);

  const dynamicSchema = jsonSchemaToZod(format);

  const PROMPT = `DATA: \n"${data}"\n\n-----------\nExpected JSON format: ${JSON.stringify(
    format,
    null,
    2
  )}`;

  const result = await RetryablePromise.retry<string>(
    3,
    async (resolve, reject) => {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          temperature: 1,
          max_tokens: 4096,
          top_p: 1,
          messages: [
            {
              role: "assistant",
              content:
                "You are an AI that converts unstructured data into the exact JSON format provided in the attachment. Your response must be a pure JSON object with no extra characters, formatting, code blocks, or explanations. Do not include markdown, backticks, or any other symbols—only the JSON object itself. Begin immediately with `{` and end with `}`. If a field's value is indeterminate, use `null`, but make no assumptions or modifications beyond structuring the data correctly.",
            },
            { role: "user", content: EXAMPLE_PROMPT },
            { role: "system", content: EXAMPLE_ANSWER },
            { role: "user", content: COMPLEX_EXAMPLE_PROMPT },
            { role: "system", content: COMPLEX_EXAMPLE_ANSWER },
            { role: "user", content: NESTED_EXAMPLE_PROMPT },
            { role: "system", content: NESTED_EXAMPLE_ANSWER },
            { role: "user", content: PROMPT },
          ],
        });

        const text = response.choices[0]!.message.content;

        const validationResult = dynamicSchema.parse(JSON.parse(text || ""));

        return resolve(validationResult);
      } catch (error) {
        reject(error);
      }
    }
  );

  return res.status(200).json(result);
};
