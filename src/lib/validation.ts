import { z } from 'zod';

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_TAGS = /<[^>]*>/g;

export function sanitizeKnowledgeText(value: string): string {
  return value
    .replace(CONTROL_CHARACTERS, '')
    .replace(HTML_TAGS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeKnowledgeContent(value: string): string {
  return value
    .replace(CONTROL_CHARACTERS, '')
    .replace(HTML_TAGS, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function sanitizeKnowledgeTag(value: string): string {
  return sanitizeKnowledgeText(value).toLowerCase();
}

export function formatZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  if (!firstIssue) {
    return 'Invalid request payload.';
  }

  const path = firstIssue.path.length > 0 ? firstIssue.path.join('.') : 'payload';
  return `${path}: ${firstIssue.message}`;
}

export function parseSchema<TSchema extends z.ZodTypeAny>(schema: TSchema, input: unknown): z.infer<TSchema> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new z.ZodError(parsed.error.issues);
  }

  return parsed.data;
}
