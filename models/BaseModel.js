const joi = require('joi')

class BaseModel {
  constructor (dataObj) {
    __typecheck(dataObj, __type.object, true)

    const validationResult = joi.validate(dataObj, this.constructor.schema)
    if (validationResult.error) { throw new Error(validationResult.error) }

    if (!this.constructor.isInitialized) {
      buildModelProps(dataObj, this.constructor.schema, this)
    }
  }
}

function buildModelProps (dataObj, schema, context) {
  __typecheck(dataObj, __type.object, true)
  __typecheck(schema, __type.object, true)
  __typecheck(context, __type.object, true)

  Object.keys(dataObj).forEach(propName => {
    Object.defineProperty(context, propName, {
      get: () => dataObj[propName],
      set: value => {
        const isValidValue = joi.validate(value, schema[propName])
        if (isValidValue.error) { throw new Error(isValidValue.error) }
        dataObj[propName] = value
      },
      enumerable: true,
      configurable: false
    })
  })

  Object.defineProperty(context.constructor, 'isInitialized', {
    get: () => true,
    configurable: false
  })

  return Object.freeze(context)
}

module.exports = BaseModel