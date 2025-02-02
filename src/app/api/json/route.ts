import { openai } from "@/lib/openai";
import { EXAMPLE_ANSWER, EXAMPLE_PROMPT } from "@/lib/utils/example-prompt";
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
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "assistant",
              content:
                "You are an AI that transforms unstructured data into the exact JSON format provided in the attachment. Your response must be strictly valid JSON, with no extra text, explanations, or formatting outside of the JSON structure. Start immediately with the opening curly brace '{' and end with the closing curly brace '}'. If a field's value is indeterminate, assign it 'null', but avoid assumptions or modifications beyond formatting the data correctly.",
            },
            { role: "user", content: EXAMPLE_PROMPT },
            { role: "system", content: EXAMPLE_ANSWER },
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
