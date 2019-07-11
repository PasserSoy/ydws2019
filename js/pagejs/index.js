layer.config({
  skin: 'demo-class'
})
$('#manager').text(sessionStorage.account);// 用户名

$('#Exit_system').on('click', function () {
  layer.confirm('是否确定退出系统？', {
      btn: ['是', '否'], //按钮
      icon: 2,
    },
    function loginOut() {
      if (sessionStorage.menuTab == "admin") {
        window.location.href = 'alogin.html?v=1.6.22';
      } else {
        window.location.href = 'login.html?v=1.6.22';
      };
      sessionStorage.clear();
    });
});

init();

function init() {
  //  控制显示
  if (sessionStorage.permission != 'admin') {// 以前是判断sessionStorage.account
    $('#back1_manager').remove();
    $('#back7_feedBack').remove();
    $('#back12_version').remove();
    $('.two_header_nav ul li').css('width', '250px')
  }
}
$('.two_header_nav li').click(function () {
  sessionStorage.removeItem('myIndex');// 移除主页跳转sessionStorage
  sessionStorage.removeItem('companyId');// 移除主页跳转sessionStorage
  sessionStorage.removeItem('companyName');// 移除主页跳转sessionStorage
  sessionStorage.removeItem('back5');// 移除主页跳转sessionStorage
  var datasrc = $(this).find('img').attr('datasrc');
  $("#iframepage").attr("src", datasrc);
  sessionStorage.iframeUrl=datasrc;
  var obj = $('.public img').parent().parent();
  var arr = [];
  for (var i in obj) {
    arr.push(obj[i]); //属性
  }
  arr.length = 8;
  for (var k of arr) {
    $(k).removeClass('active');
  };
  $(this).addClass('active');
})

$(function () {
  $('.info').css('opacity',0);
  $('body').css({'overflow':'hidden'});
  sessionStorage.windowHeight=$(window).height();// 窗口高度
  $('body').css({'overflow':'auto'});
  $(window).resize(function () {
    ifm.window.mapWidth();
    sessionStorage.windowHeight=$(window).height();// 窗口高度
    var frameH = sessionStorage.windowHeight - 119 + 'px';
    if(sessionStorage.token && $("#iframepage").attr('src').indexOf('myIndex.html')>-1){
      frameH = sessionStorage.windowHeight - 58 + 'px';
    };
    if($(window.frames["ifm"].document).find(".myIndexzhuye").length>0){
      frameH = sessionStorage.windowHeight - 58 + 'px';
    };
    $('#iframepage').height(frameH);
  });
  /* 点击按钮取消全屏 */
  $('button.nofull').click(function () {
    exitFullScreen();
  });
  function exitFullScreen() {
    var el = document,
      cfs = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen,
      wscript;
    if (typeof cfs != "undefined" && cfs) {
      cfs.call(el);
      return;
    }
    if (typeof window.ActiveXObject != "undefined") {
      wscript = new ActiveXObject("WScript.Shell");
      if (wscript != null) {
        wscript.SendKeys("{F11}");
      }
    }
  }
  /**全屏 */
  /* 点击按钮全屏 */
  $('button.full').click(function () {
    fullScreen();
  });
  function fullScreen() {
    var el = document.documentElement,
      rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen,
      wscript;
    if (typeof rfs != "undefined" && rfs) {
      rfs.call(el);
      return;
    }
    if (typeof window.ActiveXObject != "undefined") {
      wscript = new ActiveXObject("WScript.Shell");
      if (wscript) {
        wscript.SendKeys("{F11}");
      }
    }
  }
  // 日期
  getToday();
  setInterval(x => {
    getToday();
  }, 1000);
  function getToday() {
    var d = new Date();
    // 处理年月日
    var y = d.getFullYear(),
      m = d.getMonth() + 1,
      d1 = d.getDate(); // 年月日
    var date = `${y}年${m<10?'0'+m:m}月${d1<10?'0'+d1:d1}日`;
    // 处理周
    var w = d.getDay(); // 周
    var weekArr = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    var week = weekArr[w];
    // 处理时分秒
    var h = d.getHours(),
      m1 = d.getMinutes(),
      s = d.getSeconds(); // 时分秒
    var time = `${h<10?'0'+h:h}:${m1<10?'0'+m1:m1}:${s<10?'0'+s:s}`;
    $('.dates .date').text(date);
    $('.dates .week').text(week);
    $('.dates .time').text(time);
  }
  // 导航处理
	$('.two_header_nav li[id]').click(function () {
		sessionStorage.navId = $(this).attr('id');
		$('.nav').removeClass('navfull');
  });
  //// 点击链接使刷新后为当前页
  $('.two_header_nav li[id=' + sessionStorage.navId + ']').addClass('active');
  $('#iframepage').attr('src',sessionStorage.iframeUrl);
	// if(sessionStorage.navId!=undefined){// 有则点击该菜单，没有则点击第一个菜单
	// 	$('.two_header_nav li[id=' + sessionStorage.navId + ']').click();
	// }else{
	// 	$('.two_header_nav li[id]:first-child').click();
  // };
	///////删除不需要的菜单
	if (sessionStorage.menuTab == "xj") {
		$('#back1_manager').remove();
		$('#back2_company').remove();
		$('#back7_feedBack').remove();
		$('#back12_version').remove();
		$('.xja').show();
	};
	if (sessionStorage.menuTab == "admin") {
		$('.admina').show();
  };
})