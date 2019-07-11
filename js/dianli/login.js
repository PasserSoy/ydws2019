
var lang_state = '';

layui.use(['jquery'],function(){
    var canvas = $(".layui-canvs");
    window.jQuery = window.$ = layui.jquery;
    canvas.width($(window).width());
    canvas.height($(window).height());
    $(window).resize(function () {
        canvas.width($(window).width());
        canvas.height($(window).height());
        var c =  $(".layui-canvs").find('canvas').eq(0);
        c.width($(window).width());
        c.height($(window).height());
//            canvas.jParticle({
//                background: "#141414",
//                color: "#E6E6E6"
//            });
    });
});

// 下拉框出发点击事件
$('select[name="lang_state"]').on('change',function(){
    if($(this).val() == '繁體'){
        $(this).prop("selected", 'selected');

        $('strong').text(ManagementSystem[1]);
        $('#username').attr('placeholder',userName[1]);
        $('#userpwd').attr('placeholder',password[1]);
        $('#txtVerification').attr('placeholder',identifyCode[1]);
        $('.login-btn').attr('placeholder',login[1]);
    } else if($(this).val() == '简体'){
        $(this).prop("selected", 'selected');
        $('strong').text(ManagementSystem[0]);
        $('#username').attr('placeholder',userName[0]);
        $('#userpwd').attr('placeholder',password[0]);
        $('#txtVerification').attr('placeholder',identifyCode[0]);
        $('.login-btn').attr('placeholder',login[0]);
    }
});


$(function () {
    var open_layer = 0;
    $(".layui-canvs").jParticle({
        background: "#141414",
        color: "#E6E6E6"
    });
    $(".login_txtbx").keypress(function (res) {
            if (res.keyCode === 13 && open_layer === 0) {
                $('.submit_btn').click();
            }
        }
    );

    //验证帐号密码
    function backLogin() {
        var account=$('#account').val();
        var password=$('#password').val();
        var data = {
            account:account,
            password:password
        };
        if(account!= '' ||  password!=''){
            POST("/back/login/login.v1", data, function (res) {
                if (res.code == '0') {
                    layer.msg('登陆成功！');
                    sessionStorage.id=res.data.id;
                    sessionStorage.account=res.data.account;//登录帐号名
                    sessionStorage.token=res.data.token;
                    window.location.href = "index.html";
                } else {
                    layer.msg(res.msg);
                }
            });
        }else{
            layer.msg('帐号或密码不能为空!');
        }
    }


    $('.login-btn').on('click', function(event) {
        backLogin();
    });

    $("body").keydown(function() {
        if (event.keyCode == "13") {//keyCode=13是回车键
            var inputCode=$('#txtVerification').val().toLowerCase();
            if (inputCode.length <= 0) {
                layer.msg("请输入验证码！");
            }
            else if (inputCode != divCode) {
                layer.msg("验证码输入错误！");
                getCode(); //刷新验证码
                $("#txtVerification").val('');
            }
            else {
                backLogin();
            }
        }
    });
    $(".Codes_region").on('click',function () {
        getCode()
    })

});