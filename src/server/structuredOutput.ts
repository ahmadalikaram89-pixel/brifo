import { z } from 'zod';

/**
 * Builds an Anthropic `output_config.format` for a Zod schema, equivalent to
 * the SDK's own `zodOutputFormat` from `@anthropic-ai/sdk/helpers/zod`.
 *
 * That helper subpath internally imports `zod/v4`, which resolved fine in
 * local dev but failed to resolve inside Vercel's serverless function bundle
 * (ERR_MODULE_NOT_FOUND), crashing every /api/analyze and /api/reply request
 * before the handler's own try/catch ever ran. Reimplemented locally so the
 * only imports left are the SDK's main entry point and the top-level `zod`
 * package, both of which bundle reliably.
 */
export function toStructuredOutputFormat<T extends z.ZodType>(schema: T) {
  const jsonSchema = strictifyJsonSchema(z.toJSONSchema(schema, { reused: 'ref' }) as JsonSchemaNode);
  return {
    type: 'json_schema' as const,
    schema: jsonSchema,
    parse(content: string): z.infer<T> {
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch (error) {
        throw new Error(`failed to parse structured output as JSON: ${error instanceof Error ? error.message : String(error)}`);
      }
      const result = schema.safeParse(parsed);
      if (!result.success) {
        throw new Error(`structured output failed validation: ${result.error.message}`);
      }
      return result.data;
    },
  };
}

type JsonSchemaNode = Record<string, unknown>;

const SUPPORTED_STRING_FORMATS = new Set([
  'date-time',
  'time',
  'date',
  'duration',
  'email',
  'hostname',
  'uri',
  'ipv4',
  'ipv6',
  'uuid',
]);

function pop(obj: JsonSchemaNode, key: string): unknown {
  const value = obj[key];
  delete obj[key];
  return value;
}

/** Ports Anthropic's schema-strictification (required for structured output
 * — e.g. forcing `additionalProperties: false` on every object) so it no
 * longer depends on importing it from the SDK's helper subpath. */
function strictifyJsonSchema(input: JsonSchemaNode): JsonSchemaNode {
  const jsonSchema = structuredClone(input);
  return strictify(jsonSchema);
}

function strictify(jsonSchema: JsonSchemaNode): JsonSchemaNode {
  const strictSchema: JsonSchemaNode = {};

  const ref = pop(jsonSchema, '$ref');
  if (ref !== undefined) {
    strictSchema['$ref'] = ref;
    return strictSchema;
  }

  const defs = pop(jsonSchema, '$defs');
  if (defs !== undefined) {
    const strictDefs: Record<string, unknown> = {};
    strictSchema['$defs'] = strictDefs;
    for (const [name, defSchema] of Object.entries(defs as Record<string, JsonSchemaNode>)) {
      strictDefs[name] = strictify(defSchema);
    }
  }

  const type = pop(jsonSchema, 'type');
  const anyOf = pop(jsonSchema, 'anyOf');
  const oneOf = pop(jsonSchema, 'oneOf');
  const allOf = pop(jsonSchema, 'allOf');

  if (Array.isArray(anyOf)) {
    strictSchema['anyOf'] = anyOf.map((variant) => strictify(variant as JsonSchemaNode));
  } else if (Array.isArray(oneOf)) {
    strictSchema['anyOf'] = oneOf.map((variant) => strictify(variant as JsonSchemaNode));
  } else if (Array.isArray(allOf)) {
    strictSchema['allOf'] = allOf.map((entry) => strictify(entry as JsonSchemaNode));
  } else {
    if (type === undefined) {
      throw new Error('JSON schema must have a type defined if anyOf/oneOf/allOf are not used');
    }
    strictSchema['type'] = type;
  }

  const description = pop(jsonSchema, 'description');
  if (description !== undefined) strictSchema['description'] = description;

  const title = pop(jsonSchema, 'title');
  if (title !== undefined) strictSchema['title'] = title;

  if (type === 'object') {
    const properties = (pop(jsonSchema, 'properties') as Record<string, JsonSchemaNode>) ?? {};
    strictSchema['properties'] = Object.fromEntries(
      Object.entries(properties).map(([key, propSchema]) => [key, strictify(propSchema)]),
    );
    pop(jsonSchema, 'additionalProperties');
    strictSchema['additionalProperties'] = false;
    const required = pop(jsonSchema, 'required');
    if (required !== undefined) strictSchema['required'] = required;
  } else if (type === 'string') {
    const format = pop(jsonSchema, 'format');
    if (typeof format === 'string' && SUPPORTED_STRING_FORMATS.has(format)) {
      strictSchema['format'] = format;
    } else if (format !== undefined) {
      jsonSchema['format'] = format;
    }
  } else if (type === 'array') {
    const items = pop(jsonSchema, 'items');
    if (items !== undefined) strictSchema['items'] = strictify(items as JsonSchemaNode);
    const minItems = pop(jsonSchema, 'minItems');
    if (minItems === 0 || minItems === 1) {
      strictSchema['minItems'] = minItems;
    } else if (minItems !== undefined) {
      jsonSchema['minItems'] = minItems;
    }
  }

  if (Object.keys(jsonSchema).length > 0) {
    const existingDescription = strictSchema['description'] as string | undefined;
    strictSchema['description'] =
      (existingDescription ? existingDescription + '\n\n' : '') +
      '{' +
      Object.entries(jsonSchema)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ') +
      '}';
  }

  return strictSchema;
}
