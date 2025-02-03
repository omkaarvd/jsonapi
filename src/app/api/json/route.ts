import { openai } from "@/lib/openai";
import {
  COMPLEX_EXAMPLE_ANSWER,
  COMPLEX_EXAMPLE_PROMPT,
  EXAMPLE_ANSWER,
  EXAMPLE_PROMPT,
  NESTED_EXAMPLE_ANSWER,
  NESTED_EXAMPLE_PROMPT,
} from "@/lib/utils/example-prompt";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodTypeAny } from "zod";

const determineSchemaType = (schema: any): string => {
  if (!schema.hasOwnProperty("type")) {
    if (Array.isArray(schema)) return "array";
    else return typeof schema;
  }

  return schema.type;
};

const jsonSchemaToZod = (schema: any): ZodTypeAny => {
  const type = determineSchemaType(schema);

  switch (type) {
    case "string":
      return z.string().nullable();

    case "number":
      return z.number().nullable();

    case "boolean":
      return z.boolean().nullable();

    case "array":
      return z.array(jsonSchemaToZod(schema.items)).nullable();

    case "object":
      const shape: Record<string, ZodTypeAny> = {};
      for (const key in schema) {
        if (key !== "type") {
          shape[key] = jsonSchemaToZod(schema[key]);
        }
      }
      return z.object(shape).nullable();

    default:
      throw new Error(`Unsupported schema type: ${type}`);
  }
};

type PromiseExecutor<T> = (
  resolve: (value: T) => void,
  reject: (reason?: any) => void
) => void;

class RetryablePromise<T> extends Promise<T> {
  static async retry<T>(
    retries: number,
    executor: PromiseExecutor<T>
  ): Promise<T> {
    return new RetryablePromise<T>(executor).catch((error) => {
      console.error(`Retrying due to error: ${error}`);
      return retries > 0
        ? RetryablePromise.retry(retries - 1, executor)
        : RetryablePromise.reject(error);
    });
  }
}

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const genericSchema = z.object({
    data: z.string(),
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
        const res = await openai.chat.completions.create({
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

        const text = res.choices[0].message.content;

        const validationResult = dynamicSchema.parse(JSON.parse(text || ""));

        return resolve(validationResult);
      } catch (error) {
        reject(error);
      }
    }
  );

  return NextResponse.json(result, { status: 200 });
};
