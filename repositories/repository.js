const fs = require('fs');
const crypto = require('crypto');
const { randomId } = require('./users');

module.exports = class Repository {
  constructor(filename) {
    if (!filename) {
      throw new Error('Creating a repositry requires a filename');
    }

    this.filename = filename;
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      fs.writeFileSync(this.filename, '[]');
    }
  }

  async create(atributes) {
    atributes.id = this.randomId();

    const records = await this.getAll();
    records.push(atributes);
    await this.writeAll(records);

    return atributes;
  }

  async getAll() {
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: 'utf8',
      })
    );
  }

  async writeAll(records) {
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2) // 'null' and '2' are for identation in json file
    );
  }

  randomId() {
    return crypto.randomBytes(4).toString('hex');
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find((record) => record.id === id);
  }

  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter((record) => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  async update(id, atributes) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);

    if (!record) {
      throw new Error(`Record with ${id} not found!`);
    }
    Object.assign(record, atributes); // assign the props from "atributes" to "record"
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.getAll();

    for (let record of records) {
      let found = true;

      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }

      if (found === true) {
        return record;
      }
    }
  }
};
