$(function () {
  sessionStorage.token=sessionStorage.token!=undefined?sessionStorage.token:'password';
  var rooturl = '/back/sysUser/';
  var endUrl='updatePasswordBySmsCode.v2';
  var user = $('#password').data('user');
  if(user=='xj'){// 巡检员
    rooturl = '/api/member/';
    endUrl='updatePasswordBySmsCode.v1';
  };
  // 获取验证码
  $('.send').click(function () {
    var _t = $(this),time = 60;
    var tel = $('.tel').val();
    var data = {type: 3};
    user=='xj'?data.mobileOrEmail=tel:data.mobileOrAccount=tel;
    if (tel == '') {
      layer.msg('请填写手机号', {
        time: 1000
      });
      $('.tel').focus();
    } else {
      POST(rooturl+'sendSmsCode.v1',data,function(res){
        if (res.msg == '成功') {
          layer.msg('验证码已发送成功', { time: 1000 },function(){
            // 验证码倒计时
            _t.attr('disabled','disabled').addClass('disabled');
            var _s = setInterval(()=>{
              time--;
              _t.text(time+'s')
              if(time<=0){
                clearInterval(_s);
                _t.text('获取验证码').removeAttr('disabled').removeClass('disabled');
              }
            },1000);
          });
        } else {
          layer.msg(res.msg, {
            time: 1000
          });
        };
      });
    }
  });
  // 修改密码
  $('.confirm').click(function () {
    var tel = $('.tel').val();
    var newpw = $('.newpw').val();
    var valid = $('.valid').val();
    var data = {password: newpw,smsCode: valid};
    // var psd = /^[a-zA-Z]\w{5,13}$/;// 字母开头6-14位
    var psd = /\S{6,14}$/;// 字母开头6-14位
    var sj = /^1[3-9]\d{9}$/;// 电话号码
    user=='xj'?data.mobileOrEmail=tel:data.mobileOrAccount=tel;
    if(newpw == ''){
      layer.msg('请填写密码', { time: 1000 }); $('.newpw').focus(); return;
    }else{
      if(!psd.test(newpw)){
        layer.msg('只能输入6-14位英文、数字、符号！');$('.newpw').focus(); return;
      };
    };
    if(tel == ''){
      layer.msg('请填写手机号', { time: 1000 }); $('.tel').focus(); return;
    }else{
      if(!sj.test(tel)){
        layer.msg('请输入正确的号码！');$('.tel').focus(); return;
      };
    };
    if(valid == ''){
      layer.msg('请填写验证码', { time: 1000 }); $('.valid').focus(); return;
    };
    // 密码、手机号、验证码都已填写
    POST(rooturl + endUrl,data,function(res){
      if(res.msg == '成功'){
        layer.msg(res.msg, { time: 500 },function(){
          history.back();
        });
      }else{
        layer.msg(res.msg, { time: 1000 });
        $('.valid').focus();
      };
    })
  });
  // 返回
  $('.back').click(function () {
    history.back();
  });
})