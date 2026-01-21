import { createHash } from 'crypto';
import type { SchemaField } from './firestore-types';

export interface InferenceResult {
  parseStatus: 'OK' | 'FAILED' | 'PARTIAL';
  parsedJson?: any;
  flattenedFields?: Record<string, string | number | boolean>;
  schemaFields: SchemaField[];
  shapeHash: string;
  parseError?: string;
}

function generateShapeHash(fields: SchemaField[]): string {
  // Sort by path to ensure order doesn't affect hash
  const sortedFields = [...fields].sort((a, b) => a.path.localeCompare(b.path));
  // Only use path and type for the shape hash to keep it stable
  const shapeString = sortedFields.map(f => `${f.path}:${f.type}`).join('|');
  return createHash('sha256').update(shapeString).digest('hex');
}

function inferType(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    return 'datetime';
  }
  const type = typeof value;
  if (type === 'number') {
    return Number.isInteger(value) ? 'integer' : 'float';
  }
  return type;
}

function traverse(
  data: any,
  path: string,
  fields: Map<string, { types: Set<string>; nullable: boolean }>,
  flattened: Record<string, string | number | boolean>
) {
  if (data === null || data === undefined) {
    const currentPath = path || 'root';
    if (fields.has(currentPath)) {
      fields.get(currentPath)!.nullable = true;
    }
    // Don't traverse further, but mark as nullable if seen
    return;
  }

  const type = inferType(data);

  const currentPath = path || (type === 'object' || type === 'array' ? '' : 'value');

  if (currentPath) {
      if (!fields.has(currentPath)) {
        fields.set(currentPath, { types: new Set(), nullable: data === null });
      }
      fields.get(currentPath)!.types.add(type);

      // Add primitive types to flattened fields
      if (['string', 'integer', 'float', 'boolean', 'datetime'].includes(type)) {
        flattened[currentPath] = data;
      }
  }

  if (type === 'object') {
    Object.keys(data).forEach(key => {
      // Sanitize key to handle dots in keys
      const sanitizedKey = key.includes('.') ? `["${key}"]` : key;
      const newPath = currentPath ? `${currentPath}.${sanitizedKey}` : sanitizedKey;
      traverse(data[key], newPath, fields, flattened);
    });
  } else if (type === 'array') {
    const arrayPath = `${currentPath}[*]`;
    data.forEach((item: any) => {
      traverse(item, arrayPath, fields, flattened);
    });
  }
}

export function inferSchemaFromPayload(
    payload: string,
    contentType: string | null
): InferenceResult {
    let parseStatus: 'OK' | 'FAILED' | 'PARTIAL' = 'OK';
    let parsedJson: any | undefined;
    let parseError: string | undefined;
    const isJson = contentType?.includes('json');

    if (isJson && payload) {
        try {
            parsedJson = JSON.parse(payload);
        } catch (e: any) {
            parseStatus = 'FAILED';
            parseError = e.message;
        }
    } else if (!payload) {
        parseStatus = 'OK';
    }


    const fieldsMap = new Map<string, { types: Set<string>; nullable: boolean }>();
    const flattenedFields: Record<string, string | number | boolean> = {};

    if (parsedJson) {
        traverse(parsedJson, '', fieldsMap, flattenedFields);
    } else if (payload) {
        // Not JSON or failed to parse, treat as simple text
        fieldsMap.set('body', { types: new Set(['text']), nullable: false });
    }

    const schemaFields: SchemaField[] = [];
    for (const [path, { types, nullable: isNullable }] of fieldsMap.entries()) {
        const finalTypes = new Set(types);
        let wasNullable = isNullable;
        if (finalTypes.has('null')) {
            wasNullable = true;
            finalTypes.delete('null');
        }

        // If after removing null, there's still more than one type, it's a mixed type.
        // For simplicity, we'll call it 'mixed'.
        const type = finalTypes.size > 1 ? 'mixed' : finalTypes.values().next().value || 'unknown';

        if (type !== 'unknown') {
            schemaFields.push({
                path,
                type,
                nullable: wasNullable,
                example: '...', // Placeholder for now
                frequency: 0,   // Placeholder for now
            });
        }
    }

    const shapeHash = generateShapeHash(schemaFields);

    return {
        parseStatus,
        parsedJson,
        flattenedFields: Object.keys(flattenedFields).length > 0 ? flattenedFields : undefined,
        schemaFields,
        shapeHash,
        parseError,
    };
}
