function manageQueryData() {}
// 获取省份
POST('/sys/monitorStation/queryMonitorAddress.v1', {
  createBy: sessionStorage.id
}, function (res) {
  if (res.code == '0') {
    // console.log(res)
    var content = '<option value="">全部</option>'
    for (let i of res.data) {
      content += `<option value="${i}">${i}</option>`
    }
    $('#selectArea').append(content)
  } else {
    // alert(res.msg)
  }
})

var comName = $('#companyName_find').val()
var stationAddress = $('#selectArea').val()
var data = {
  stationName: comName,
  stationAddress: stationAddress,
  rows: 10000,
  createBy: sessionStorage.id
}
init(data);

var allCount = 0; // 是否有数据
var htmlHeight = '510px';
function init(data) {
  POST('/sys/monitorStation/queryMonitorStation.v1', data, function (res) {
    // console.log(data)
    allCount = res.data.count != undefined ? res.data.count : 0;
    if (res.data.count) {
      $('#allList').css('display', 'none');
      $('#map').css('display', 'block');
      $('#noTableData').css('display', 'none');

      var map = new AMap.Map('map', {
        // viewMode: '3D',
        zoom: 4,
        center: [104.669509, 36.518758],
        resizeEnable: true,
        zoomEnable: true, //禁止缩放
        dragEnable: true, //禁止移动
      })

      var arr = [];

      for (var i of res.data.list) {
        arr.push(i)
      }
      if(arr[0]==null){arr=[]};
      var context = ''
      $('.allList_ul').html('');
      for (let i = 0; i < arr.length; i++) {
        if (!arr[i].longitudeAndlatitude) {
          continue;
        }
        // console.log(arr[i])
        // console.log(arr[i].longitudeAndlatitude.split(','))
        context += '<li onClick="link(this)" monitorStationId="' + arr[i].id + '">' +
          '<img class="img1" src="./images/two/position2.png" alt="">' + arr[i].stationName +
          '<img class="img2" src="./images/two/right.png" alt="">' +
          '</li>'

        var marker = new AMap.Marker({
          position: arr[i].longitudeAndlatitude.split(','),
          // 设置鼠标划过点标记显示的文字提示
          title: arr[i].stationName,
          // 点标记的动画效果: 掉落效果
          animation: 'AMAP_ANIMATION_DROP',
          // 需在点标记中显示的图标 有合法的content内容时，此属性无效
          icon: './images/two/u188.png',
          // 点标记显示内容
          content: `<span style="display:inline-block; min-width:160px;padding-right: 10px; height:30px; line-height:30px; text-align:center; border-radius: 3px; background:#2494f9; color:white; padding-left:10px; position:relative;">
								<span style="display:inline-block; width:10px; height:10px; text-align:center; background:#2494f9; position:absolute; left:10px; top:25px; transform:rotate(45deg);"></span>
								<img src="./images/two/position.png" style="width:26px; height:26px; display: inline-block; background:#2494f9; position:absolute; left:2px; top:2px;">
								<span style="margin:0 26px;white-space: nowrap;">${arr[i].stationName}</span></span>`
        });
        marker.setMap(map);

        // 设置label标签
        // marker.setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
        // 	offset: new AMap.Pixel(20, 20),//修改label相对于maker的位置
        // 	content: arr[i].stationName
        // });

        // 点击事件
        marker.on('click', function () {
          // console.log(arr[i])
          sessionStorage.monitorStationId = arr[i].id
          sessionStorage.stationName = arr[i].stationName
          window.parent.$("#iframepage").attr("src", 'back13_0_line.html?v=1.6.22');
          $(window.parent.document).find('.nav').removeClass('navfull');
          /* 全屏 */
          // fullScreens('iframepage');
        });

      }

      $('.allList_ul').append(context);
      $('html').height(htmlHeight);
    } else {
      $('#allList').css('display', 'none');
      $('#map').css('display', 'none');
      $('#noTableData').css('display', 'block');
    };
  })
}

$('.btn_search').click(function () {
  var comName = $('#companyName_find').val()
  var stationAddress = $('#selectArea').val()
  var data = {
    stationName: comName,
    stationAddress: stationAddress,
    rows: 10000,
    createBy: sessionStorage.id
  };
  init(data)
})

function selectArea() {
  var comName = $('#companyName_find').val()
  var stationAddress = $('#selectArea').val()
  var data = {
    stationName: comName,
    stationAddress: stationAddress,
    rows: 10000,
    createBy: sessionStorage.id
  };
  init(data)
}

$('.span1').click(function () {
  $('.span1').addClass('active')
  $('.span2').removeClass('active')
  $('#map').css('display', 'block')
  $('#allList').css('display', 'none')
  if (allCount != 0) $('#noTableData').css('display', 'none');
  window.parent.$('#iframepage').css({
    'min-height':  htmlHeight
  });
})

$('.span2').click(function () {
  $('.span2').addClass('active')
  $('.span1').removeClass('active')
  $('#allList').css('display', 'block')
  $('#map').css('display', 'none')
  if (allCount != 0) $('#noTableData').css('display', 'none');  
  $('html').height('auto');
  var newHeight = $('html').height(); /*编辑时同步iframe高度*/
  window.parent.$('#iframepage').css({
    'min-height': newHeight + 30 + 'px'
  });
})

function link(obj) {
  sessionStorage.monitorStationId = $(obj).attr('monitorStationId')
  sessionStorage.stationName = $(obj).text()
  window.parent.$("#iframepage").attr("src", 'back13_0_line.html?v=1.6.22');
}


function fullScreens(iframeId) {
  /* 获取父类的document */
  var parentDoc = parent.document;
  /* 定义一个接收元素的变量 */
  var thisIframe = null;
  $("iframe", parentDoc).each(function (index, e) {
    if (e.id == iframeId) {
      thisIframe = e;
    }
  });

  requestFullScreen(thisIframe);
}

/**
 * 调用全屏方法
 */
var requestFullScreen = function (element) {
  if (window.ActiveXObject) {
    var WsShell = new ActiveXObject('WScript.Shell')
    WsShell.SendKeys('{F11}');
  }
  //HTML W3C 提议
  else if (element.requestFullScreen) {
    element.requestFullScreen();
  }
  //IE11
  else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
  // Webkit (works in Safari5.1 and Chrome 15)
  else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
  // Firefox (works in nightly)
  else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  }
}
$(function () {
  /*地图铺满*/
  $(window.parent.document).find('.nav').addClass('navfull');
  // var _h1 = $(window.parent.document).find('.nav').outerHeight();
  // var _h2 = $('.box_title').outerHeight();
  // $('#map').outerHeight(_h1 - _h2);
  // $('#map').outerHeight(720);

  // $(window).resize(function () {
  //   var _h1 = $(window.parent.document).find('.nav').outerHeight();
  //   var _h2 = $('.box_title').outerHeight();
  //   $('#map').outerHeight(_h1 - _h2);
  //   $('#map').outerHeight(720);
  // })

  $('.allList_ul').on('click', 'li', function () {
    $(window.parent.document).find('.nav').removeClass('navfull');
  })
})