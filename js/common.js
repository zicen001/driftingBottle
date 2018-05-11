$(function() {
	 if(typeof(webExtensionWallet) === "undefined") {
		 $("#btnLogin").show();
 	}
    window.Util = {
        format:function(date) {
            var d = new Date(date),
                r = '';
            var f = function(p) {
                return p<10? "0"+p : p;
            }
            r += d.getFullYear() + '-';
            r += f(d.getMonth()+1) + '-';
            r += f(d.getDate()) + ' ';
            r += f(d.getHours())+ ':';
            r += f(d.getMinutes());
            return r;
        },

        event:{
            tap : ('ontouchstart' in window) ? 'tap' : ((window.DocumentTouch && document instanceof DocumentTouch) ? 'tap' : 'click')
        }
    }

    var app = function() {
        this.name = 'bottles';

        this.el = {
            'page': $("#page"),
            'btnThrow': $("#btnThrow"),
            'btnGet': $("#btnGet"),
            'btnBottle': $("#btnBottle"),
            'btnLogin': $("#btnLogin"),
            'loginPanel': $("#loginPanel"),
            'salvageAnim': $("#salvageAnim"),
            'result': $("#result"),
            'btnSubmitLogin':$("#btnSubmitLogin"),
            'writeBottle' : $("#writeBottle"),
            'btnSubBottleMsg' : $("#btnSubBottleMsg"),
            'bottleMsg' : $("#bottleMsg")
        }
        this.tpls = {
            'bottle': $("#tpl_bottle").html(),
            'msg' : $("#tpl_msg").html(),
        }

        var href = window.location.href;

        this.url = {
            'requestInfo' : href + '/api.php',
            'getBottle': href + '/api.php',
            'sendMsg' : href + '/api.php',
            'throwBottle' : href + '/api.php'
        }

        this.config = {
            showResult: 2500 // 捕捞动作显示时长
        }

        this.user = {};

        this.init();

        this.TEST();
    }
    var NebPay = require("nebpay");
	var nebPay = new NebPay();
	var dappAddress = "n1wN5KEZ2TFZXCYqypyKtKxVBxJgo15rYdJ";
    app.prototype = {

        init: function() {
            this.initEvent();
        },
        initData: function() {
            var lastLogin = localStorage.getItem('lastLogin');
            var count_get = 225,
                count_throw = 0;
            localStorage.setItem('lastLogin', Date.now());
        },

        

        initEvent: function() {
            var me = this,
                tap = Util.event.tap;

            // 丢瓶子
            this.el.btnThrow.on(tap, function() {
                console.log('throw bottles');
                if(typeof(webExtensionWallet) === "undefined") {
                	 me.showLoginPanel.call(me);
                	 return ;
                }
                me.el.writeBottle.show();
            });

            // 丢瓶子btn
            this.el.btnSubBottleMsg.on(tap,function() {
                var msg = $.trim( $("#bottleMsg").val() );
                if (msg.length>256) {
                	layer.msg("漂流瓶太长了");
                }
                if (msg) {
                    me.el.writeBottle.find('.notice').hide();
					var to = dappAddress;
					var value = "0";
					var callFunction = "throwBottle";
					var callArgs = '["'+msg+'"]'; //in the form of ["args"]
					nebPay.call(to, value, callFunction,callArgs, { //使用nebpay的call接口去调用合约,
						listener:  function(data) {
                            $("#bottleMsg").val('')
                            me.el.writeBottle.hide();
                            layer.msg('您的瓶子已经丢到海中了~');
	                    } //指定回调函数
					});
                }else{
                    me.el.writeBottle.find('.notice').show();
                }
            });
            this.el.btnLogin.on(tap, function() {
       		 me.showLoginPanel.call(me);
            });
            // 捡一个
            this.el.btnGet.on(tap, function() {
            	if(typeof(webExtensionWallet) === "undefined") {
               	 me.showLoginPanel.call(me);
               	 return ;
               }
                var status = $(this).data('status');
                if (status != 'anim') {
                    // checkout
	                $(this).data('status', 'anim');
	                me.el.salvageAnim.addClass('animate').show();
	                me.getBottle.call(me);
                }
            });

            this.el.btnSubmitLogin.on(tap,function() {
                me.doLogin.call(me);
            });

            // 切换登陆注册页面
            this.el.loginPanel.on(tap, 'label', function() {
                var type = $(this).data('type');
                me.setLoginPanel.call(me, type);
            });

            // 关闭panel
            this.el.page.on(tap, '.btnClose', function() {
                console.log('close panel');
                $(this).parent('.panel').hide();
            });
            // 我的瓶子
            this.el.btnBottle.on(tap, function() {
            	layer.msg('玩命开发中...');
            });


            // 关闭result
            this.el.result.on(tap, '.btnClose', function() {
                me.el.result.hide();
            });

            // 打开看看
            this.el.result.on(tap, '#btnOpen', function() {
                me.el.result.hide();
                me.showBottle.call(me,me.newBottle);
            });

            // 继续捡
            this.el.result.on(tap, '#btnTry', function() {
                me.el.btnGet.trigger(tap);
                me.el.result.hide();
            });
        },
        showBottle:function(bottleData) {
            $("#bottle").remove();
            $(".panel").hide();
            var time =Util.format(bottleData.timestamp);
            layer.open({
            	  type: 1,
            	  skin: 'layui-layer-rim', //加上边框
            	  area: ['420px', '240px'], //宽高
            	  content: '<div class="avatar" style="margin : 20px;"><img src="img/avatar/avatar-fmale.png" height="35px" width="35px"  /><span style="padding: 3px 5px;margin-top: 10px;">'+bottleData.author+'</span></div><div class="msg"style="text-align: center;"><p>'+bottleData.content+'</p></div><p class="time" style="text-align: right;color: #666;">'+time+'</p>'
            	});
        },

        setLoginPanel: function(type) {
            var target, title;
            target = '.loginArea';
            title = '登录';
            this.el.loginPanel.find('.inputArea').hide();
            this.el.loginPanel.find('.title').html(title);
            $(target).show();
        },
        showLoginPanel: function() {
            console.log('dologin');
            $(".panel").hide();
            this.setLoginPanel();
            this.el.loginPanel.show();
        },
        doLoginSuccess:function(data) {
            localStorage.setItem('sid',data.sid);
            this.user = data.user;
            this.el.btnLogin.addClass('logined').find('img').attr('src',data.user.avatar);
        },

        /*
            请求瓶子
            返回格式
            {
                result : 1 ,  // 是否捞到瓶子
                bottle : {
                     bID   // 瓶子id
                     tDate   // throw瓶子的time
                     tID     // throw瓶子的userID
                     tName   // throw到瓶子的name
                     tAvatar  // 头像  
                     msg    
                }
            }
        */
        getBottle: function() {
            var s = Date.now(),
                me = this;
			var to = dappAddress;
			var value = "0";
			var callFunction = "salvageBottle";
			var callArgs = "[]"; //in the form of ["args"]
			nebPay.simulateCall(to, value, callFunction, callArgs, { //使用nebpay的simulateCall接口去执行get查询, 模拟执行.不发送交易,不上链
				listener: function(data) {
					if(!data.result) return;
	                // 更新次数
	                var e = Date.now();
	                var timeout = me.config.showResult - (e - s);
	                timeout = timeout < 0 ? 0 : timeout;
	                setTimeout(function() {
	                    // hide animate
	                    me.el.salvageAnim.removeClass('animate').hide();
	                    me.el.btnGet.data('status', '')
	                    // show result
	                    var resultClass = 's';
	                    var result = eval(JSON.parse(data.result));
						if(result !== 'null') {
	                        // fix data
	                        me.newBottle = result;
	                        resultClass = 'b'
	                    }
	                    me.el.result.attr('class', resultClass).show();
	                }, timeout);
	            } //指定回调函数
			});
        },

        TEST: function() {
            
        }

    }

    var bottleAPP = new app();
  
});