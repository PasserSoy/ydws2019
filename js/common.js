// var rooturl = 'http://120.79.6.179:80/dianli'; // 测试服
// var rooturl='http://192.168.0.28:8081/dianli';   //刘冬ip地址
var rooturl = 'http://www.cloudelec.com:8081/dianli'; //云电微视正式服务器域名
// var rooturl='http://192.168.0.86:3000/dianli';  //ljy
// var rooturl='http://localhost:3000/dianli';  //离线
/* * url 请求接口 * data 请求参数 * func * */
var POST = function (url, data, func, befback, compback, async = true, err) {
	data.token = sessionStorage.token;
	$.ajax({
		url: rooturl + url,
		type: 'POST',
		dataType: 'JSON',
		async: async,
		data: data,
		error: function (e) {
			console.log(e);
			if ($('.loadjy')[0]) $('.loadjy').removeClass('op');
			if (err) err();
		},
		beforeSend: function () {
			if (befback) befback();
		},
		success: function (res) {
			if (res.code == "9997" || res.code == "11002" || res.code == undefined) {
				window.parent.location.href = sessionStorage.menuTab == "admin" ? 'alogin.html' : 'login.html';
			};
			if (!sessionStorage.token || sessionStorage.token == '' || sessionStorage.token == undefined) {
				window.parent.location.href = sessionStorage.menuTab == "admin" ? 'alogin.html' : 'login.html';
			};
			func(res);
			var _h = $('html').height(); /*编辑时同步iframe高度*/
			window.parent.$('#iframepage').css({
				'min-height': _h + 30 + 'px'
			});
		},
		complete: function () {
			if (compback) compback();
		}
	});
}

function getPropetyVal(p) {
	var s = location.search;
	s = s.substr(1, s.length - 1);
	var propetys = s.split("&");
	for (var i = 0; i < propetys.length; i++) {
		if (propetys[i].split("=")[0].trim() == p) {
			return propetys[i].split("=")[1];
		}
	}
	return null;
}


// 控制页面的显示
jQuery(function ($) {
	// 控制左边扇形的收缩和显示完整
	//$('[data-rel="tooltip"]').tooltip({placement: tooltip_placement});
	function tooltip_placement(context, source) {
		var $source = $(source);
		var $parent = $source.closest('table')
		var off1 = $parent.offset();
		var w1 = $parent.width();

		var off2 = $source.offset();
		var w2 = $source.width();

		if (parseInt(off2.left) < parseInt(off1.left) + parseInt(w1 / 2)) return 'right';
		return 'left';
	}

	// 全选
	$('table th input:checkbox').on('click', function () {
		var that = this;
		$(this).closest('table').find('tr > td:first-child input:checkbox')
			.each(function () {
				this.checked = that.checked;
				$(this).closest('tr').toggleClass('selected');
			});

	});

});

//面包屑返回值
var index = parent.layer.getFrameIndex(window.name);
parent.layer.iframeAuto(index);
$('.Order_form ,.brond_name').on('click', function () {
	var cname = $(this).attr("title");
	var cnames = parent.$('.Current_page').html();
	var herf = parent.$("#iframe").attr("src");
	parent.$('#parentIframe span').html(cname);
	parent.$('#parentIframe').css("display", "inline-block");
	parent.$('.Current_page').attr("name", herf).css({
		"color": "#4c8fbd",
		"cursor": "pointer"
	});
	parent.layer.close(index);
});
// 基本变量
var page = 1;
var limit = 10;
var allnum = 0;
var nowpage = 1;
var allpaper = 0;
var toPage = 0;
var numTotal = 0;
/*用户-查询*/
$('.btn_search').bind('click', function (e) {
	$('.nowpage').text(1);
	manageQueryData(1);
});
// 下一页
$('input[rel="after"]').on('click', function () {
	nowpage = parseInt($('.nowpage').text());
	allpaper = $('.numtotal').text();
	if (nowpage < allpaper) {
		$(".nowpage").text(nowpage + 1);
		manageQueryData(nowpage + 1); // 组织条件查询
	}
});
// 上一页
$('input[rel="prev"]').on('click', function () {
	nowpage = parseInt($('.nowpage').text());
	if (nowpage >= 2) {
		$(".nowpage").text(nowpage - 1);
		manageQueryData(nowpage - 1); // 组织条件查询
	}
});
// 首页
$('input[rel="1"]').on('click', function () {
	toPage = 1;
	numTotal = $('.numtotal').text();
	$(".nowpage").text(toPage);
	if (toPage <= numTotal) {
		manageQueryData(toPage); // 组织条件查询
	}
});
// 尾页
$('input[rel="total"]').on('click', function () {
	numTotal = $('.numtotal').text();
	$(".nowpage").text(numTotal);
	if (numTotal > 0) {
		manageQueryData(numTotal); // 组织条件查询
	}
});

$(function () {
	// 如果token存在且返回的地址存在index或者存在login
	// 禁止浏览器回退事件
	if((sessionStorage.token && window.parent.location.href.indexOf("index.html") > -1) || location.href.indexOf("login") > -1){
		history.pushState(null, null, document.URL);
		window.addEventListener('popstate', function () {
			history.pushState(null, null, document.URL);
		});
	};
	// 如果sessionStorge.myIndex存在，则隐藏公司信息选项
	if(sessionStorage.myIndex){
		$('.companyHide').remove();
		$('.breadadd').after(`<li class="title"><span>[${sessionStorage.companyName}] -</span></li>`);
	};
	if(sessionStorage.back5){
		$('.companyback5').remove();
		$('[data-bread=momline]').parent('li').before(`<li class="title"><span>[${sessionStorage.breadstation}] -</span></li>`);
	};
	// 当前页为首页时，body加myIndex
	if(window.parent.$("#iframepage").length>0){
		if(sessionStorage.token && window.parent.$("#iframepage").attr('src').indexOf('myIndex.html')>-1){
			window.parent.$("body").addClass('myIndex');
		}else{
			window.parent.$("body").removeClass('myIndex');
			var frameH = sessionStorage.windowHeight -119 + 'px';// 页面高度
			window.parent.$('#iframepage').height(frameH);
		};
		window.parent.$("body").find('.info').css('opacity',1);
	};
	//// 点击链接使刷新后为当前页
	if(window.parent.$('#iframepage').length>0){
		var iframeUrl=window.parent.$('#iframepage').attr('src');
		sessionStorage.iframeUrl=iframeUrl;
	};
	$('body').on('click','a[href*=back]',function(){
		var _href=$(this).attr('href');
		window.parent.$('#iframepage').attr('src',_href);
	});
	// 表格跳转
	$('.jumpsure').click(function () {
		const nowpage = $('.jumpint').val(),curpage = Number($(".nowpage").text());
		if(nowpage && nowpage!='' && nowpage<=Number($('.numtotal').text()) && nowpage>0 && nowpage!=curpage){
			$(".nowpage").text(nowpage);
			manageQueryData(nowpage);
		};
	});
	$('.jumpint').on('focus',function(){
		$('body').on('keyup',function(e){
			if(e.keyCode==13){
				$('.jumpsure').click();
			};
		});
	}).on('blur',function(){
		$('body').off('keyup');
	});
})

// 监听是否全屏
window.onload = function () {
	var _dom = $("#iframepage").contents().find(".no-screen");
	document.addEventListener('fullscreenchange', function () {
		if (!document.fullscreen) {
			if (!_dom.hasClass('full-screen')) {
				$("#iframepage").contents().find(".no-screen").addClass('full-screen');
				$("#iframepage").contents().find('#line-detail').removeClass('full');
			}
		};
	}, false);
	document.addEventListener('mozfullscreenchange', function () {
		if (!document.mozFullScreen) {
			if (!_dom.hasClass('full-screen')) {
				$("#iframepage").contents().find(".no-screen").addClass('full-screen');
				$("#iframepage").contents().find('#line-detail').removeClass('full');
			}
		};
	}, false);
	document.addEventListener('webkitfullscreenchange', function () {
		if (!document.webkitIsFullScreen) {
			if (!_dom.hasClass('full-screen')) {
				$("#iframepage").contents().find(".no-screen").addClass('full-screen');
				$("#iframepage").contents().find('#line-detail').removeClass('full');
			}
		};
	}, false);
	document.addEventListener('msfullscreenchange', function () {
		if (!document.msFullscreenElement) {
			if (!_dom.hasClass('full-screen')) {
				$("#iframepage").contents().find(".no-screen").addClass('full-screen');
				$("#iframepage").contents().find('#line-detail').removeClass('full');
			}
		};
	}, false);
}
// 固定小数位
function fixNum(num,l=2){// num为传入数值,l为小数位数
  // if(String(num).indexOf('.')>-1){
	// 	num = Number(num).toFixed(l)!=0?Number(num).toFixed(l):0.00;
  // };
	num = Number(num).toFixed(l)!=0?Number(num).toFixed(l):'0.00';
  return num;
}
function fixNum3(num,l=3){// num为传入数值,l为小数位数
	num = Number(num).toFixed(l)!=0?Number(Number(num).toFixed(l)):0;
  return num;
}
function mapWidth(){// 布局空方法避免报错
}
function todayTime(){// 当前毫秒
	return new Date().getTime();
}
function dealTime(times){// 将时间处理为字符串
	var d = new Date();
	return new Date(times).toLocaleString('chinese',{hour12:false}).replace(/\//ig,'-');
}
var dataZooms = [{
  type: 'inside',
  start: 0,
  end: 100
}, {
  start: 0,
  end: 100,
  handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
  handleSize: '80%',
  handleStyle: {
    color: '#fff',
    shadowBlur: 3,
    shadowColor: 'rgba(0, 0, 0, 0.6)',
    shadowOffsetX: 2,
    shadowOffsetY: 2
  }
}],
legends = {
  x: 20,
  y: 30
},
grids = {
  left: 70,
  right: 25,
  bottom: 40,
  containLabel: true
};// 波形图公共样式
