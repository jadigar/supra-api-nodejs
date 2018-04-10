const crypto = require('crypto')

const ENCRYPTION_KEY = require('../../config/token').encryptkey
const IV_LENGTH = 16 // For AES, this is always 16

/**
 * @return {string}
 */
module.exports.encrypt = (str) => {
  __typecheck(str, 'String', true)

  let iv = crypto.randomBytes(IV_LENGTH)
  let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(str)

  encrypted = Buffer.concat([encrypted, cipher.final()])

  return `${iv.toString('hex')}::${encrypted.toString('hex')}`
}

/**
 * @return {string}
 */
module.exports.decrypt = (str) => {
  __typecheck(str, 'String', true)

  let strings = str.split('::')
  let iv = new Buffer(strings.shift(), 'hex')
  let encryptedString = new Buffer(strings.join('::'), 'hex')
  let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv)
  let decrypted = decipher.update(encryptedString)

  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}
