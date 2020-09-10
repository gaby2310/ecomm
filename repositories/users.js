const fs = require('fs');
const crypto = require('crypto');
const { get } = require('http');
const util = require('util');
const Repository = require('./repository');

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
  async create(atributes) {
    atributes.id = this.randomId();

    const salt = crypto.randomBytes(8).toString('hex');
    const buf = await scrypt(atributes.password, salt, 64);

    const records = await this.getAll();
    const record = {
      ...atributes,
      password: `${buf.toString('hex')}.${salt}`,
    };
    records.push(record);

    await this.writeAll(records);

    return record;
  }

  async comparePasswords(saved, supplied) {
    // saved -> password saved in database. 'hashed + salt'
    // supplied -> password provided by user to sign in

    const result = saved.split('.');
    const hashed = result[0];
    const salt = result[1];

    const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

    return hashed === hashedSuppliedBuf.toString('hex');
  }
}

module.exports = new UsersRepository('users.json');
