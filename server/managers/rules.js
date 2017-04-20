/**
 * 
 * rule 自定义的基本格式
 * 关于计算规则和predicate规则的关联。如果是谓语规则，则规则有bases字段。譬如，/用地限定条件/容积率是一个predicated规则，它的bases对象是设计/容积率。pdc中计算时，传入predicat规则，如果不满足就退出计算，并记录完成计算原因
 * 
 * DSL描述：
 * 
 * "name":"江苏嘉城/成本/项目总成本"
 * "bases":"1:江苏嘉城/成本/开发成本|2:江苏嘉城/成本/期间费用|3:江苏嘉城/成本/不含税费总投资|4:江苏嘉城/成本/开发期间税费|5:江苏嘉城/成本/返还费用",
 * "formula":"_1 + _2 + _3 + _4 - abs(_5)"，
 * $protocol：“W" //default="L","W"网络服务
 * iValue:50  //如果有迭代依赖，指定初始值，不指定默认为0；
 * constraintCondition:/限定条件对象 //如果有迭代指定迭代退出条件
 * "desc":""
 */

/**
 * 
 * 因为规则很多，原型链需要通过Category细分为costrule，projectrule，当修改某一规则时，只是写时copy本类型的accesor中的item。
 */


var costRules = [
    //成本
    {
        "name": "江苏嘉城/成本/项目总成本",
        "bases": "1:江苏嘉城/成本/开发成本|2:江苏嘉城/成本/期间费用|3:江苏嘉城/成本/不含税费总投资|4:江苏嘉城/成本/开发期间税费|5:江苏嘉城/成本/返还费用",
        "formula": "_1 + _2 + _3 + _4 - Math.abs(_5)",
        iValue: 50,
    },




];
//项目

//财务

//设计




//建筑安装工程费
var costRules_建筑安装工程费_多层住宅 = [{
        "name": "江苏嘉城/成本/产品/住宅/多层住宅/建设安装工程费",
        "desc": "单位:万元"
    },
    {
        "name": "江苏嘉城/成本/产品/住宅/多层住宅/建设安装工程费",
        "desc": "单位:万元"
    },

];



/**
 * 
 * target rule
 * 
 * {
 * "name":
 * "bases":
 * "formula":
 * }
 * target terminology
 * {"name":
 * desc:{cn:,en:}
 * "desc":{unit:,explain:}
 * }
 */