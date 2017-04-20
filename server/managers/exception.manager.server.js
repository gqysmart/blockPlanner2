/**
 * 
 * 
 */

const { wrap: async, co: co } = require("co");
//system erro
const systemException = 100;
const unkownException = systemException + 1;
const modelNotExist = systemException + 2;
module.exports.unkownException = unkownException;
module.exports.modelNotExist = modelNotExist;
//parameter erro
const parameterException = systemException + 50;
const notFunctionException = parameterException + 1;
module.exports.parameterException = parameterException;
module.exports.notFunctionException = notFunctionException;
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
const incubatorIsBusyException = ruleException + 2;
module.exports.incubatorNotExistException = incubatorNotExistException;
module.exports.incubatorIsBusyException = incubatorIsBusyException;
//terminology
const terminologyException = incubatorException + 50;
const qualifiedNameNotExistException = terminologyException + 1;
module.exports.qualifiedNameNotExistException = qualifiedNameNotExistException;