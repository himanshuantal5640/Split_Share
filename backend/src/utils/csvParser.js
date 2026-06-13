import { Readable } from 'stream';
import csv from 'csv-parser';

/**
 * Parses a CSV file buffer in memory into an array of objects.
 * @param {Buffer} buffer - The uploaded CSV file buffer
 * @returns {Promise<Array<object>>} Promise resolving to parsed CSV rows
 */
export const parseCsv = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

export default parseCsv;
