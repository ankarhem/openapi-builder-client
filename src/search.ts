import { FormBodyFormatter } from './types';

/**
 * Repeats key for array values.
 * Stringifies objects.
 */
export const defaultFormatter: FormBodyFormatter = (body) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) {
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
export const joinFormatter: FormBodyFormatter = (body) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'undefined') continue;

    if (Array.isArray(value)) {
      value
        .map((item) => {
          if (typeof item === 'object') {
            return JSON.stringify(item);
          }
          return item.toString();
        })
        .join(',');
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
