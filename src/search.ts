import { FormFormatter } from './types';

/**
 * Behaves like a submitted html form.
 *
 * Repeats key for array values.
 * Stringifies objects.
 *
 * ```json
 * {
 *   "categories": ["cat", "dog"]
 *   "names": [
 *     {
 *       "firstName": "John"
 *     }
 *   ]
 * }
 * ```
 *
 * `?categories=dog&categories=cat&names=%7B%22firstName%22%3A%22John%22%7D`
 */
export const htmlFormatter: FormFormatter = (data) => {
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
      continue;
    }

    formData.append(key, value.toString());
  }

  return formData;
};

/**
 * Joins array values with `,`
 *
 * Stringifies objects.
 *
 * ```json
 * {
 *   "categories": ["cat", "dog"]
 *   "names": [
 *     {
 *       "firstName": "John"
 *     }
 *   ]
 * }
 * ```
 *
 * `?categories=dog,cat&names=%7B%22firstName%22%3A%22John%22%7D`
 */
export const joinFormatter: FormFormatter = (data) => {
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
      continue;
    }

    formData.append(key, value.toString());
  }

  return formData;
};

class PathFormatter {
  private static flatten(
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
 * Converts object with path to the value as key
 *
 * ```json
 * {
 *   "categories": ["cat", "dog"]
 *   "names": [
 *     {
 *       "firstName": "John"
 *     }
 *   ]
 * }
 * ```
 * `?categories[0]=cat&categories[1]=dog&names[0].firstName=John`
 */
export const pathFormatter: FormFormatter = PathFormatter.format;
