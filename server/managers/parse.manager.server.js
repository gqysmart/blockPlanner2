/**
 * 
 * rule 自定义的基本格式
 * DSL描述：
 * 
 * name:"江苏嘉城/成本/项目总成本"
 * bases:"1:江苏嘉城/成本/开发成本|2:江苏嘉城/成本/期间费用|3:江苏嘉城/成本/不含税费总投资|4:江苏嘉城/成本/开发期间税费|5:江苏嘉城/成本/返还费用",
 * formula:"_1 + _2 + _3 + _4 - abs(_5)"，$protocol：“W"
 * iValue:50
 * breakCondition:"_1 <= 10"
 * markdown:""
 */