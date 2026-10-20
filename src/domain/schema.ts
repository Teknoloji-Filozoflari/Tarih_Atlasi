export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
}
export type ValidationResult<T> =
  { ok: true; value: T; issues: [] } | { ok: false; issues: ValidationIssue[] };
export interface Schema<T> {
  readonly type?: T;
  check(value: unknown, path: string, issues: ValidationIssue[]): void;
}
export function issue(issues: ValidationIssue[], path: string, code: string, message: string) {
  if (issues.length < 100) issues.push({ path, code, message });
}
export function parse<T>(schema: Schema<T>, value: unknown): ValidationResult<T> {
  const issues: ValidationIssue[] = [];
  schema.check(value, '$', issues);
  return issues.length ? { ok: false, issues } : { ok: true, value: value as T, issues: [] };
}
export const text = (max = 2000, pattern?: RegExp): Schema<string> => ({
  check(value, path, issues) {
    if (
      typeof value !== 'string' ||
      !value.trim() ||
      value.trim() !== value ||
      value.length > max ||
      (pattern && !pattern.test(value))
    )
      issue(issues, path, 'SCHEMA_STRING', 'Geçerli, boş olmayan ve sınırlı metin gerekli.');
  },
});
export const numeric = (min: number, max: number, integer = false): Schema<number> => ({
  check(value, path, issues) {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (integer && !Number.isInteger(value))
    )
      issue(issues, path, 'SCHEMA_NUMBER', 'Sonlu ve izinli aralıkta sayı gerekli.');
  },
});
export const boolean: Schema<boolean> = {
  check(value, path, issues) {
    if (typeof value !== 'boolean') issue(issues, path, 'SCHEMA_BOOLEAN', 'Boolean gerekli.');
  },
};
export function enumeration<const T extends readonly (string | number | null)[]>(
  values: T,
): Schema<T[number]> {
  return {
    check(value, path, issues) {
      if (!values.includes(value as T[number]))
        issue(issues, path, 'SCHEMA_ENUM', 'Bilinmeyen tür veya değer.');
    },
  };
}
export function nullable<T>(schema: Schema<T>): Schema<T | null> {
  return {
    check(value, path, issues) {
      if (value !== null) schema.check(value, path, issues);
    },
  };
}
export function array<T>(schema: Schema<T>, min = 0, max = 1000): Schema<T[]> {
  return {
    check(value, path, issues) {
      if (!Array.isArray(value) || value.length < min || value.length > max) {
        issue(issues, path, 'SCHEMA_ARRAY', `Dizi uzunluğu ${min}–${max} olmalı.`);
        return;
      }
      value.forEach((item: unknown, index) => schema.check(item, `${path}[${index}]`, issues));
    },
  };
}
export function object<T extends object>(
  fields: { [K in keyof T]-?: Schema<T[K]> },
  optionalKeys: readonly (keyof T)[] = [],
): Schema<T> {
  return {
    check(value, path, issues) {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        issue(issues, path, 'SCHEMA_OBJECT', 'Nesne gerekli.');
        return;
      }
      const record = value as Record<string, unknown>;
      for (const key of Object.keys(record))
        if (!Object.hasOwn(fields, key))
          issue(issues, `${path}.${key}`, 'UNKNOWN_FIELD', 'Bilinmeyen alan; sessizce atılmaz.');
      for (const [key, schema] of Object.entries(fields) as [string, Schema<unknown>][]) {
        if (!Object.hasOwn(record, key) && optionalKeys.includes(key as keyof T)) continue;
        if (!Object.hasOwn(record, key))
          issue(issues, `${path}.${key}`, 'MISSING_FIELD', 'Zorunlu alan eksik.');
        else schema.check(record[key], `${path}.${key}`, issues);
      }
    },
  };
}
export function refine<T>(
  schema: Schema<T>,
  check: (value: T, path: string, issues: ValidationIssue[]) => void,
): Schema<T> {
  return {
    check(value, path, issues) {
      const result = parse(schema, value);
      if (result.ok) check(result.value, path, issues);
      else
        for (const entry of result.issues)
          issue(issues, path + entry.path.slice(1), entry.code, entry.message);
    },
  };
}
export function union<T>(schemas: Schema<unknown>[]): Schema<T> {
  return {
    check(value, path, issues) {
      if (!schemas.some((schema) => parse(schema, value).ok))
        issue(issues, path, 'SCHEMA_UNION', 'Desteklenmeyen nesne veya alan birleşimi.');
    },
  };
}
export const idSchema = text(160, /^[a-z][a-z0-9-]*:[A-Za-z0-9._:-]+$/);
export const hashSchema = text(64, /^[a-f0-9]{64}$/);
export const httpsSchema = refine(text(), (value, path, issues) => {
  try {
    const url = new URL(value);
    if (
      !value.startsWith('https://') ||
      /[\s\\\u0000-\u001f\u007f]/u.test(value) ||
      /%(?:0[0-9a-f]|1[0-9a-f]|7f|5c)/iu.test(value) ||
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port
    )
      throw new Error();
  } catch {
    issue(issues, path, 'HTTPS_REQUIRED', 'Kimlik bilgisi içermeyen HTTPS URL gerekli.');
  }
});
export const timestampSchema = refine(
  text(30, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
  (value, path, issues) => {
    if (!Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value)
      issue(issues, path, 'INVALID_TIMESTAMP', 'Gerçek UTC tarihi gerekli.');
  },
);
