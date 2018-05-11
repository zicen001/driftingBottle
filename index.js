'use strict';

// 定义信息类
var Bottle = function (text) {
    if (text) {
        var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
        this.content = obj.content;                 // 内容
        this.author = obj.author;                  // 作者
        this.timestamp = obj.timestamp;            // 时间戳
    } else {
        this.content = "";
        this.author = "";
        this.timestamp = 0;
    }
};

// 将信息类对象转成字符串
Bottle.prototype.toString = function () {
    return JSON.stringify(this)
};

// 定义智能合约
var BottleContract = function () {
    // 使用内置的LocalContractStorage绑定一个map，名称为BottleMap
    // 这里不使用prototype是保证每布署一次该合约此处的BottleMap都是独立的
    LocalContractStorage.defineMapProperty(this, "bottleMap", {
        // 从BottleMap中读取，反序列化
        parse: function (text) {
            return new Bottle(text);
        },
        // 存入BottleMap，序列化
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

// 定义合约的原型对象
BottleContract.prototype = {
    // init是星云链智能合约中必须定义的方法，只在布署时执行一次
    init : function () {
    	 this.size = 0;
    },
    // 提交信息到星云链保存，传入标题和内容
    throwBottle : function (content) {
        content = content.trim();
        if ( content === "") {
            throw new Error("漂流瓶为空！");
        }
        if (content.length > 256) {
            throw new Error("漂流瓶长度超过256个字符！");
        }
        // 使用内置对象Blockchain获取提交内容的作者钱包地址
        var from = Blockchain.transaction.from;

        var bottle = new Bottle();
        bottle.content = content;
        bottle.timestamp = new Date().getTime();
        bottle.author = from;
        // 此处调用前面定义的序列化方法stringify，将Bottle对象存储到存储区
        this.bottleMap.put(this.size, bottle);
        this.size +=1;
    },
    // 根据作者的钱包地址从存储区读取内容，返回Bottle对象
    salvageBottle : function () {
    	var key=parseInt(Math.random()*this.size);
        var bottle  = this.bottleMap.get(key);
        return bottle ;
    },
};
// 导出代码，标示智能合约入口
module.exports = BottleContract;