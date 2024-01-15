import { Primitive } from 'type-fest';
import { FormBodyFormatter } from './types';

/**
 * Repeats key for array values.
 * Stringifies objects.
 */
export const defaultFormatter: FormBodyFormatter = (data) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'undefined') continue;

    if (Array.isArray(value)) {
      value
        .map((item) => {
          if (typeof item === 'object') {
            return JSON.stringify(item);
          }
          return item.toString();
        })
        .forEach((s) => formData.append(key, s));
      continue;
    }

    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    if (value instanceof File) {
      formData.append(key, value);
    }

    formData.append(key, value.toString());
  }

  return formData;
};

/**
 * Joins array values with `,`
 * Stringifies objects.
 */
export const joinFormatter: FormBodyFormatter = (data) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'undefined') continue;

    if (Array.isArray(value)) {
      const valueString = value
        .map((item) => {
          if (typeof item === 'object') {
            return JSON.stringify(item);
          }
          return item.toString();
        })
        .join(',');
      formData.append(key, valueString);
      continue;
    }

    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      continue;
    }

    if (value instanceof File) {
      formData.append(key, value);
    }

    formData.append(key, value.toString());
  }

  return formData;
};

class PathFormatter {
  static flatten(
    data: Record<string, any> | Array<any>,
    prefix = ''
  ): Record<string, string | File> {
    if (!data) return {};

    if (!Array.isArray(data) && prefix.at(-1) === ']') {
      prefix += '.';
    }

    let flattenedObject: Record<string, string | File> = {};
    for (const [_key, value] of Object.entries(data)) {
      const key = prefix + _key;
      if (typeof value === 'undefined') continue;

      if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          if (typeof item === 'object') {
            flattenedObject = {
              ...flattenedObject,
              ...PathFormatter.flatten(item, `${key}[${idx}]`),
            };
            return;
          }

          flattenedObject[`${key}[${idx}]`] = item.toString();
        });
        continue;
      }

      if (typeof value === 'object') {
        flattenedObject = {
          ...flattenedObject,
          ...PathFormatter.flatten(value, `${key}.`),
        };
        continue;
      }

      if (value instanceof File) {
        flattenedObject[key] = value;
        continue;
      }

      flattenedObject[key] = value.toString();
    }
    return flattenedObject;
  }

  static format(data: Record<string, any>) {
    const formData = new FormData();
    Object.entries(PathFormatter.flatten(data)).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  }
}

/**
 * Converts object with key as path to value
 * eg.
 * ```json
 * {
 *   "names": [
 *     {
 *       "firstName": "hello"
 *     }
 *   ]
 * }
 * ```
 * `?names[0].firstName=hello`
 */
export const pathFormatter: FormBodyFormatter = PathFormatter.format;
