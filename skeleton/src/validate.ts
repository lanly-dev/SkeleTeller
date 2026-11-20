import Ajv from 'ajv';
import type { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schema/storyboard.schema.json';
import type { Issue, Storyboard, ValidationResult } from './types';

// No Node-only imports here, so this module can also run in a browser.

const REMOVED_FIELDS: Record<string, string> = {
  duration: 'is no longer used (both outputs are self-paced), remove it',
  total_duration: 'is no longer used, remove it',
};

const ajv = new Ajv({ allErrors: true, strict: true, discriminator: true });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

/** Turn an Ajv JSON pointer such as /scenes/3/code/snippet into a scene number and a readable path. */
function locate(pointer: string): { scene?: number; path: string } {
  const parts = pointer.split('/').slice(1).map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
  if (parts[0] === 'scenes' && parts[1] !== undefined && /^\d+$/.test(parts[1])) {
    return { scene: Number(parts[1]) + 1, path: parts.slice(2).join('.') };
  }
  return { path: parts.join('.') };
}

function join(base: string, leaf: string): string {
  return base ? `${base}.${leaf}` : leaf;
}

function describe(err: ErrorObject): Issue {
  const { scene, path } = locate(err.instancePath);
  const where = (p: string): Issue => ({ scene, path: p, message: '' });

  switch (err.keyword) {
    case 'additionalProperties': {
      const field = String((err.params as { additionalProperty: string }).additionalProperty);
      const issue = where(join(path, field));
      const removed = REMOVED_FIELDS[field];
      issue.message = removed ? `"${field}" ${removed}` : `unknown field "${field}"`;
      return issue;
    }
    case 'required': {
      const field = String((err.params as { missingProperty: string }).missingProperty);
      const issue = where(join(path, field));
      issue.message = `missing required field "${field}"`;
      return issue;
    }
    case 'discriminator': {
      const p = err.params as { error?: string; tag?: string; tagValue?: unknown };
      const issue = where(join(path, 'type'));
      issue.message =
        p.error === 'mapping'
          ? `unknown scene type "${String(p.tagValue)}" (use title, feature, callout, code or outro)`
          : 'scene needs a "type" (title, feature, callout, code or outro)';
      return issue;
    }
    case 'const':
    case 'enum': {
      const allowed = (err.params as { allowedValue?: unknown; allowedValues?: unknown[] });
      const list = allowed.allowedValues ?? [allowed.allowedValue];
      return { scene, path, message: `must be ${list.map((v) => JSON.stringify(v)).join(', ')}` };
    }
    case 'minItems':
      return { scene, path, message: `needs at least ${(err.params as { limit: number }).limit} item(s)` };
    case 'maxItems':
      return { scene, path, message: `allows at most ${(err.params as { limit: number }).limit} item(s)` };
    default:
      return { scene, path, message: err.message ?? 'is invalid' };
  }
}

/** Checks that cannot be written in JSON Schema. */
function semanticIssues(sb: Storyboard): Issue[] {
  const issues: Issue[] = [];
  sb.scenes.forEach((scene, i) => {
    if (scene.type !== 'code') return;
    const lines = scene.code.highlight_lines;
    if (!lines) return;
    const count = scene.code.snippet.replace(/\n$/, '').split('\n').length;
    for (const line of lines) {
      if (line > count) {
        issues.push({
          scene: i + 1,
          path: 'code.highlight_lines',
          message: `line ${line} is past the end of the snippet (${count} line${count === 1 ? '' : 's'})`,
        });
      }
    }
  });
  return issues;
}

/** Validate parsed storyboard data against the schema. Returns every problem, not just the first. */
export function validateStoryboard(data: unknown): ValidationResult {
  if (!validateSchema(data)) {
    const errors = (validateSchema.errors ?? []).map(describe);
    return { ok: false, errors: dedupe(errors) };
  }
  const storyboard = data as unknown as Storyboard;
  const semantic = semanticIssues(storyboard);
  return semantic.length ? { ok: false, errors: semantic } : { ok: true, storyboard };
}

function dedupe(issues: Issue[]): Issue[] {
  const seen = new Set<string>();
  return issues.filter((i) => {
    const key = `${i.scene ?? ''}|${i.path}|${i.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
