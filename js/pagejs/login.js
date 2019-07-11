sessionStorage.clear();
//验证帐号密码
function backLogin() {
  var account = $('#account').val();
  var password = $('#password').val();
  var url = '/back/login/login.v1'; // 默认admin的地址
  var user = $('#main').data('user'); // 当前用户
  var role = 'a';// 登录角色
  if (user == 'admin') { // 用户为admin
    sessionStorage.menuTab = "admin";
  } else { // 用户为巡检员
    password = $('#password').val() == '' ? '' : hex_md5($('#password').val());
    url = '/back/login/memberLogin.v1';
    sessionStorage.menuTab = "xj";
    role = 'i';
  };
  if(account==''){
    layer.msg('请输入用户名!');$('#account').focus();;return;
  };
  if(password==''){
    layer.msg('请输入密码!');$('#password').focus();;return;
  };
  var data = {
    account: account,
    password: password
  };
  sessionStorage.token='errorToken';
  POST(url, data, function (res) {
    if (res.code == '0') {
      sessionStorage.id = res.data.id;
      sessionStorage.account = res.data.account != undefined ? res.data.account : res.data.userName; //登录帐号名
      sessionStorage.token = res.data.token;
      sessionStorage.permission = res.data.permission;
      sessionStorage.iframeUrl = 'myIndex.html?v=1.6.22';
      sessionStorage.navId = 'myIndex';
      window.location.href = "index.html?v=1.6.22"+role+todayTime();
    }else{// 登录错误
      layer.msg(res.msg);
    };
  });
}

$('.submit_btns').on('click', function (event) {
  backLogin();
});

$("body").keydown(function () {
  if (event.keyCode == "13") { //keyCode=13是回车键
    backLogin();
  }
});