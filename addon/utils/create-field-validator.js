import { validator } from 'ember-cp-validations';
import { computed, getProperties } from '@ember/object';

const comparableValues = {
  lt: (property, number) => Math.min(property, number),
  lte: (property, number) => Math.min(property, number),
  gt: (property, number) => Math.max(property, number),
  gte: (property, number) => Math.max(property, number),
}

function comparableValueForOperator(property, number, operator) {
  property = parseFloat(property);
  number = parseFloat(number);
  if (!isNaN(property) && !isNaN(number)) {
    return comparableValues[operator](property, number);
  } else {
    return !isNaN(property) ? property : number;
  }
}

function getValidatorCompareValue(validatorValue, operator) {
  if (!isNaN(parseFloat(validatorValue))) {
    return validatorValue;
  } else if (typeof validatorValue === 'object') {
    if (validatorValue.property === undefined) {
      return validatorValue.number;
    } else {
      return computed(`model.formValues.${validatorValue.property}`, function () {
        return comparableValueForOperator(
          this.get(`model.formValues.${validatorValue.property}`),
          validatorValue.number,
          operator
        );
      });
    }
  }
}

/**
 * Creates an ``ember-cp-validations`` validators for given field specification
 * 
 * @param {FieldType} field
 * @returns {Array.Validator}
 */
export default function createFieldValidator(field) {
  let validations = [];
  const {
    type: fieldType,
    length: textLength,
  } = getProperties(field, 'type', 'length');
  if (!field.optional && fieldType !== 'static') {
    validations.push(validator('presence', {
      presence: true,
      ignoreBlank: true,
    }));
  }
  if (['text', 'password'].includes(fieldType) && textLength) {
    validations.push(validator('length', textLength));
  }
  if (field.type === 'number') {
    validations.push(validator('number', {
      allowString: true,
      allowBlank: field.optional,
      gte: getValidatorCompareValue(field.gte, 'gte'),
      lte: getValidatorCompareValue(field.lte, 'lte'),
      gt: getValidatorCompareValue(field.gt, 'gt'),
      lt: getValidatorCompareValue(field.lt, 'lt'),
      integer: field.integer
    }));
  }
  if (field.regex) {
    validations.push(validator('format', {
      regex: field.regex,
      message: field.regexMessage,
      allowBlank: field.regexAllowBlank
    }));
  }
  return validations;
}
