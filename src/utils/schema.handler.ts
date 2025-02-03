import { z, type ZodTypeAny } from "zod";

export const determineSchemaType = (schema: any): string => {
  if (!schema.hasOwnProperty("type")) {
    if (Array.isArray(schema)) return "array";
    else return typeof schema;
  }

  return schema.type;
};

export const jsonSchemaToZod = (schema: any): ZodTypeAny => {
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
