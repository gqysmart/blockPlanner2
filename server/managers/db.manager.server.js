/**
 * 
 * 
 * 
 */


const { respond } = require("../utils");
const path = require("path");
const _ = require("lodash");
const { wrap: async, co: co } = require("co");
const assert = require("assert");
const fs = require("fs");
const mongoose = require("mongoose");
const ObjectID = require("mongoDB").ObjectID;


module.exports.systemDB = {
    connectString: "mongodb://127.0.0.1:27017/test",


}
const defaultHoldOptions = {
    maxLagTime: 1000 //一秒
};
/**
 * 
 * @param {*} modelName 访问控制块mongoose model 名。
 * @param {*} accessorID 
 * @param {*} operOptions 
 */

//访问器 有并发访问器，安全访问器，跟踪访问器等等。

function* holdLockAndOper(modelName, targetAccessor, oper, operOptions) { //调整到db.manager作为通用锁访问，相应的组件有access{}；schema支持继承么？
        function pause(time) {
            var promise = new Promise(function(resolve, reject) {
                setTimeout(function() { resolve(time) }, time);
            })
        };
        //参数调整
        if (!operOptions) { operOptions = {}; };
        operOptions = _.defaults(operOptions, defaultHoldOptions);

        const model = mongoose.model(modelName);
        if (!model) { return false };
        var accessorID = targetAccessor;
        if (!operOptions._startTime) { operOptions._startTime = new Date() }; //计时
        //
        var myAccessTag = new ObjectID(); //新建随机accesstag，为防止死锁，需要考虑按规则强行释放。
        var accessor = yield model.findOne({ _id, accessorID }); //为了真正实现线程锁，还需要添加占用锁定的ID，可用objectID。
        if (!accessor.concurrent.hostTag) {
            accessor.concurrent.hostTag = myAccessTag;
            yield pdc.save();
            //重新查找一次，确认目前是自己占用了锁。
            accessor = yield PDC.findOne({ _id, pdcID });
            if (accessor.access.hostTag !== myAccessTag) {
                var now = new Date();
                if (now.getTime() - operOptions._startTime.getTime() > operOptions.maxLagTime) { return false } //操作失败。
                else { //尝试随机时间后，再尝试修改
                    operOptions._startTime = new Date();
                    var randomPauseTime = Math.random() * 500; //0.5秒以内，重新尝试一次。
                    yield pause(randomPauseTime);
                    yield co(holdLockAndOper(model, accessorID, operOptions));
                }

            } else { //hold
                try {
                    if (operOptions.cb) {
                        cb();
                    }

                } catch (e) {

                } finally {
                    //释放lock
                    accessor.access.hostTag = null;
                    yield accessor.save();

                }


            }

            return true;
        }