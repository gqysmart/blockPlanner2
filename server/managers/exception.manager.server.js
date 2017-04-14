/**
 * 
 * 
 */

const { wrap: async, co: co } = require("co");
//parameter erro
const parameterException = 100;
const notFunctionException = parameterException + 1;
//accessor
const accessorException = parameterException + 50;
const holdAccessorException = accessorException + 1;
const accessorNotExistException = accessorException + 2;
module.exports.holdAccessorException = holdAccessorException;
module.exports.accessorNotExistException = accessorNotExistException;

//ruledescriptor
const ruleException = accessorException + 50;
const ruleNotExistException = ruleException + 1;
const ruleParseException = ruleException + 2;
const webServiceException = ruleException + 3;
const zeroDivideException = ruleException + 4;
module.exports.ruleNotExistException = ruleNotExistException;
//
//incubator
const incubatorException = ruleException + 50;
const incubatorNotExistException = incubatorException + 1;
module.exports.incubatorNotExistException = incubatorNotExistException;