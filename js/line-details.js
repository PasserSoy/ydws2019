$(function(){
  $('#line-detail h2.title').text(sessionStorage.stationName);
  searchline();
  $(document).on('keydown',function(e){
    if(e.keyCode==122){
      return false;
    };
  });
  /* 全屏 */
	$('.no-screen').on('click',function(){
    if($(this).hasClass('full-screen')){/**全屏 */
      // fullScreen();
      fullScreens('iframepage');
      $(this).removeClass('full-screen');
      $('#line-detail').addClass('full');
      /**获取cabinet的坐标 */
      // var _top = $('.cabinet').offset().top;
      // $('#line-detail h2.title').css({'top':_top});
    }else{/**退出全屏 */
      exitFullScreen();
      $(this).addClass('full-screen');
      $('#line-detail').removeClass('full');
    };
    allwidth();
  });
  /**写一个定时器
   * 当一次接线图的宽度小于等于1000时就是处于窗口化
   * 此时判断按钮no-screen是否存在full-screen
   * 没有则点击
   */
  var onceline = setInterval(x=>{
    var _w = $('#line-detail').outerWidth();
    if(_w<=1000){
      if(!$('.no-screen').hasClass('full-screen')){
        $('.no-screen').click();
      }
    }
  },300);
  /**全屏 */
  function fullScreen() {
    // window.parent.$("body").find('button.full').click();
    // window.parent.$("body").find('.nav').addClass('fullscreen');
    var el = document.documentElement;
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen,
        wscript;
    if(typeof rfs != "undefined" && rfs) {
      rfs.call(el);
      return;
    }
    if(typeof window.ActiveXObject != "undefined") {
      wscript = new ActiveXObject("WScript.Shell");
      if(wscript) {
          wscript.SendKeys("{F11}");
      }
    }
  }
  
  /**故障母线挂链接 */
  $('body').on('click','.momline .tit',function(){
    var _this = $(this).parents('.momline');
    var err = _this.attr('data-err'),
    monitorFlag = _this.attr('data-monitorFlag'),
    masterName = _this.attr('data-masterName');
    if(err=='Y'){
      window.parent.$("#iframepage").attr("src", 'back13_1_line_masterFaultInfo.html?monitorFlag=' + monitorFlag + '&isSolve=false' + '&masterName='+encodeURI(masterName));
      /**跳转后退出全屏 */
      exitFullScreen();
    };
  });
})
var searchline = function(){
  $('.cabinet').html('正在请求数据...');
  $.ajax({
    // url: rooturl+'/sys/monitorStation/queryMonitorStation.v1',
    url: rooturl+'/sys/monitorStation/queryWiringDiagramData.v1',
    dataType:'json',
    cache:true,
    type: 'post',
    data: {
      token: sessionStorage.token,
      monitorStationId: sessionStorage.monitorStationId,
      flag: 'three'
    },
    success:function(res){
      onceline(res);
    },
    error:function(err){
      $('.cabinet').html('获取数据失败！');
      console.log(err);
    },
    complete:function(){
      setTimeout(x=>{
        var _h = $('html').height();
        window.parent.$('#iframepage').css({'min-height':_h+30+'px'});
      },0);
    }
  });
};

/**一次接线图 */
function onceline(res){
  /**一次接线图 */
  $('.cabinet').html('');
  var list = res.data.list;/**获取结果列表 */
  /**渲染 */
  list.forEach(x=>{
    var linesOnMasterSortList = x.linesOnMasterSortList;/**母线数组 */
    /**渲染母线结构 */
    linesOnMasterSortList.forEach(x=>{
      /**渲染支线结构 */
      var linesOnBranchDtos = x.linesOnBranchDtos;/**支线数组 */
      var contact;/**联络柜 */
      var ascension;/**提升柜 */
      var inark;/**进线柜 */
      var ptark;/**PT柜 */
      var outark;/**出线柜 */
      linesOnBranchDtos.forEach(x=>{
        // console.log(x)
        /**
         * 渲染不同类型的柜子
         * 进线柜 branchType=1
         * PT柜 branchType=2
         * 出线柜 branchType=3
         * 联络柜 branchType=4
         * 提升柜 branchType=5
         * 1、3、4有监测设备
         */
        var _id = x.id;
        if(x.branchType=='1'){
          // console.log('这是进线柜');
          /**渲染监测设备 */
          var _table = '',voltable='',temptable='';
          if(x.monitorPointDtos.length>0){
            // console.log('存在监测设备');
            x.monitorPointDtos.forEach(x=>{
              /**绘制两个表格 */
              if(x.voltage_data && x.voltage_data.length>0){/**过电压保护器 */
                var elec = x.voltage_data[0].electric*100;
                elec= elec>1000?`${elec} mA`:`${elec} UA`;
                voltable = `<table class="addTable">
                <tr class="head pow"><td colspan="2">过电压保护器</td></tr>
                <tr><td>A相湿度</td><td>${x.voltage_data[0].humidity_a} %RH</td></tr>
                <tr><td>A相温度</td><td>${x.voltage_data[0].temper_a} ℃</td></tr>
                <tr><td>B相湿度</td><td>${x.voltage_data[0].humidity_b} %RH</td></tr>
                <tr><td>B相温度</td><td>${x.voltage_data[0].temper_b} ℃</td></tr>
                <tr><td>C相湿度</td><td>${x.voltage_data[0].humidity_c} %RH</td></tr>
                <tr><td>C相温度</td><td>${x.voltage_data[0].temper_c} ℃</td></tr>
                <tr><td>泄漏电流</td><td>${elec}</td></tr>
                </table>`;
              };
              if(x.temper_data && x.temper_data.length>0){/**温度采集器 */
                var site='';
                switch(Number(x.positionName)){
                  case 0:site='母排A相';break;case 1:site='母排B相';break;case 2:site='母排C相';break;case 3:site='上动触头A相';break;
                  case 4:site='上动触头B相';break;case 5:site='上动触头C相';break;case 6:site='上静触头A相';break;case 7:site='上静触头B相';break;
                  case 8:site='上静触头C相';break;case 9:site='下动触头A相';break;case 10:site='下动触头B相';break;case 11:site='下动触头C相';break;
                  case 12:site='下静触头A相';break;case 13:site='下静触头B相';break;case 14:site='下静触头C相';break;case 15:site='三相一体保护器';break;
                  case 16:site='保护器A相';break;case 17:site='保护器B相';break;case 18:site='保护器C相';break;default:site='';
                }
                temptable +=`<tr><td>${site}</td><td>${x.temper_data[0].temper} ℃</td></tr>`;
              };
            });
            if(temptable!=''){
              temptable = `<table class="addTable"><tr class="head tem"><td colspan="2">温度采集器</td></tr>${temptable}</table>`;
            };
            _table = `${temptable}${voltable}`;
          };
          /**./渲染监测设备 */
          inark = `
          <!-- 进线柜 -->
          <li class="entry" data-val="${x.cabin_no}" data-link="${_id}">
            <div class="swicth">
              <img src="./images/linechart/open.png" alt="" class="switch">
              <i class="switch"></i>
              <div class="table">${_table}</div>
              <div class="tool">
                <!-- 中继器 -->
                <ul class="relay">
                  <li><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""></li>
                  <li><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""></li>
                </ul>
                <img src="./images/linechart/xlt3.png" alt="" class="toolimg">
              </div>
              <img src="./images/linechart/up.png" alt="" class="arrow">
              <p class="configname">${x.branchName}</p>
            </div>
          </li>`;
        }else if(x.branchType=='2'){
          // console.log('这是PT柜');
          ptark = `
          <!-- PT柜 -->
          <li class="pt" data-val="${x.cabin_no}" data-link="${_id}">
            <div class="swicth">
              <img src="./images/linechart/xlt-5.png" alt="" class="switch">
              <p class="ptname">ERIC-STOM<br>用电安全防御装置</p>
              <p class="configname">${x.branchName}</p>
            </div>
          </li>`;
        }else if(x.branchType=='3'){
          // console.log('这是出线柜');
          /**渲染监测设备 */
          var _table = '',voltable='',temptable='';
          if(x.monitorPointDtos.length>0){
            // console.log('存在监测设备');
            x.monitorPointDtos.forEach(x=>{
              /**绘制两个表格 */
              if(x.voltage_data && x.voltage_data.length>0){/**过电压保护器 */
                var elec = x.voltage_data[0].electric*100;
                elec= elec>1000?`${elec} mA`:`${elec} UA`;
                voltable = `<table class="addTable">
                <tr class="head pow"><td colspan="2">过电压保护器</td></tr>
                <tr><td>A相湿度</td><td>${x.voltage_data[0].humidity_a} %RH</td></tr>
                <tr><td>A相温度</td><td>${x.voltage_data[0].temper_a} ℃</td></tr>
                <tr><td>B相湿度</td><td>${x.voltage_data[0].humidity_b} %RH</td></tr>
                <tr><td>B相温度</td><td>${x.voltage_data[0].temper_b} ℃</td></tr>
                <tr><td>C相湿度</td><td>${x.voltage_data[0].humidity_c} %RH</td></tr>
                <tr><td>C相温度</td><td>${x.voltage_data[0].temper_c} ℃</td></tr>
                <tr><td>泄漏电流</td><td>${elec}</td></tr>
                </table>`;
              };
              if(x.temper_data && x.temper_data.length>0){/**温度采集器 */
                var site='';
                switch(Number(x.positionName)){
                  case 0:site='母排A相';break;case 1:site='母排B相';break;case 2:site='母排C相';break;case 3:site='上动触头A相';break;
                  case 4:site='上动触头B相';break;case 5:site='上动触头C相';break;case 6:site='上静触头A相';break;case 7:site='上静触头B相';break;
                  case 8:site='上静触头C相';break;case 9:site='下动触头A相';break;case 10:site='下动触头B相';break;case 11:site='下动触头C相';break;
                  case 12:site='下静触头A相';break;case 13:site='下静触头B相';break;case 14:site='下静触头C相';break;case 15:site='三相一体保护器';break;
                  case 16:site='保护器A相';break;case 17:site='保护器B相';break;case 18:site='保护器C相';break;default:site='';
                }
                temptable +=`<tr><td>${site}</td><td>${x.temper_data[0].temper} ℃</td></tr>`;
              };
            });
            if(temptable!=''){
              temptable = `<table class="addTable"><tr class="head tem"><td colspan="2">温度采集器</td></tr>${temptable}</table>`;
            };
            _table = `${temptable}${voltable}`;
          };
          /**./渲染监测设备 */
          outark += `
          <!-- 出线柜 -->
          <li class="transformer" data-val="${x.cabin_no}" data-link="${_id}">
            <div class="swicth">
              <img src="./images/linechart/open.png" alt="" class="switch">
              <div class="table"> ${_table} </div>
              <div class="tool">
                <!-- 中继器 -->
                <ul class="relay">
                  <li><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""></li>
                  <li><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""></li>
                </ul>
                <img src="./images/linechart/xlt-8.png" alt="" class="toolimg">
              </div>
              <img src="./images/linechart/down.png" alt="" class="arrow">
              <img src="./images/linechart/xlt-9.png" alt="" class="p">
              <p class="configname">${x.branchName}</p>
            </div>
          </li>`;
        }else if(x.branchType=='4'){
          // console.log('这是联络柜');
          /**渲染监测设备 */
          var _table = '',voltable='',temptable='';
          if(x.monitorPointDtos.length>0){
            // console.log('存在监测设备');
            x.monitorPointDtos.forEach(x=>{
              /**绘制两个表格 */
              if(x.voltage_data && x.voltage_data.length>0){/**过电压保护器 */
                var elec = x.voltage_data[0].electric*100;
                elec= elec>1000?`${elec} mA`:`${elec} UA`;
                voltable = `<table class="addTable">
                <tr class="head pow"><td colspan="2">过电压保护器</td></tr>
                <tr><td>A相湿度</td><td>${x.voltage_data[0].humidity_a} %RH</td></tr>
                <tr><td>A相温度</td><td>${x.voltage_data[0].temper_a} ℃</td></tr>
                <tr><td>B相湿度</td><td>${x.voltage_data[0].humidity_b} %RH</td></tr>
                <tr><td>B相温度</td><td>${x.voltage_data[0].temper_b} ℃</td></tr>
                <tr><td>C相湿度</td><td>${x.voltage_data[0].humidity_c} %RH</td></tr>
                <tr><td>C相温度</td><td>${x.voltage_data[0].temper_c} ℃</td></tr>
                <tr><td>泄漏电流</td><td>${elec}</td></tr>
                </table>`;
              };
              if(x.temper_data && x.temper_data.length>0){/**温度采集器 */
                var site='';
                switch(Number(x.positionName)){
                  case 0:site='母排A相';break;case 1:site='母排B相';break;case 2:site='母排C相';break;case 3:site='上动触头A相';break;
                  case 4:site='上动触头B相';break;case 5:site='上动触头C相';break;case 6:site='上静触头A相';break;case 7:site='上静触头B相';break;
                  case 8:site='上静触头C相';break;case 9:site='下动触头A相';break;case 10:site='下动触头B相';break;case 11:site='下动触头C相';break;
                  case 12:site='下静触头A相';break;case 13:site='下静触头B相';break;case 14:site='下静触头C相';break;case 15:site='三相一体保护器';break;
                  case 16:site='保护器A相';break;case 17:site='保护器B相';break;case 18:site='保护器C相';break;default:site='';
                }
                temptable +=`<tr><td>${site}</td><td>${x.temper_data[0].temper} ℃</td></tr>`;
              };
            });
            if(temptable!=''){
              temptable = `<table class="addTable"><tr class="head tem"><td colspan="2">温度采集器</td></tr>${temptable}</table>`;
            };
            _table = `${temptable}${voltable}`;
          };
          /**./渲染监测设备 */
          contact = `
          <!-- 联络柜 -->
          <li class="contact" data-link="${_id}">
            <div class="swicth">
              <img src="./images/linechart/open.png" alt="" class="switch">
              <div class="table">${_table}</div>
              <div class="tool">
                  <!-- 中继器 -->
                <ul class="relay">
                  <li><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""></li>
                  <li><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""><img src="./images/linechart/xlt-9.png" alt=""></li>
                </ul>
                <img src="./images/linechart/xlt3.png" alt="" class="toolimg">
              </div>
              <p class="configname">${x.branchName}</p>
            </div>
          </li>`;
        }else if(x.branchType=='5'){
          // console.log('这是提升柜');
          ascension =`
          <!-- 提升柜 -->
          <li class="ascension" data-link="${_id}">
            <div class="swicth">
              <img src="./images/linechart/close.png" alt="" class="switch">
              <div class="table"></div>
              <div class="tool">
                <img src="./images/linechart/xlt-4.png" alt="" class="toolimg">
              </div>
              <p class="configname">${x.branchName}</p>
            </div>
          </li>`;
        }
      });
      /**进线柜、PT、出线柜排序 */
      var sortark = `${inark}${ptark}${outark}`;
      $('ul.hide').empty().append(sortark);
      var _li = $('ul.hide li[data-val]').get();
      _li.sort(function(a,b){
        var a = $(a).data('val');
        var b = $(b).data('val');
        if(a>b) return 1;
        if(a<b) return -1;
        return 0;
      });
      $('ul.hide').empty().append(_li);
      // console.log(sortark)
      sortark = $('ul.hide').html();
      /**./进线柜、PT、出线柜排序 */
      var content = `<li class="momline" data-err="${x.isProblem}" data-monitorFlag="${x.monitorFlag}" data-masterName="${x.masterName}">
        <h3 class="tit"><span class="kv">${x.hitchType} KV</span><span class="linename">${x.masterName}</span></h3>
        <ul class="config"> ${ascension} ${sortark} ${contact} </ul>
      </li>`;
      $('.cabinet').append(content);
      $('ul.hide').empty();/**清空临时ul */
    }); /**./渲染母线结构 */       
  });/**./渲染 */
  // $('.addTable').hide()/**隐藏所有支线上的表格 */
  
  allwidth();
  
  
  //  线路条数和故障次数
  $('.line_top_content_border').text(res.data.list[0].totalProblem);
  $('.line_top_content_green').text(res.data.list[0].totalLines);
  
  // 拼接母线
  var linesOnMasterDtosList = res.data.list[0].linesOnMasterSortList;
  var html = '';
  for (let k=0; k< linesOnMasterDtosList.length; k++) {
    if (linesOnMasterDtosList[k].monitorFlag) {
      html += '<option value="'+linesOnMasterDtosList[k].monitorFlag+'">'+linesOnMasterDtosList[k].masterName+'</option>';
    }
  
  }
  $('#node').append(html);
  
  //  图表格展示数据
  deviceId  =  $('select[name="node"]').val();
  
  getStatisticsElectricData(deviceId);  // 电流
  getStatisticsEricVoltageData(deviceId);// 电压
  Statistics_btn();

}

function allwidth(){
  /**联络柜 提升柜渲染开始 */
  $('.cabinet>.momline').each(function(i,cont){
    var _this = $(this);
    /**判断联络柜之后的母线是否存在提升柜，有则画连接线 */
    var cable = `<div class="cable"></div>`;/**连接线 */
    if($(this).next('.momline')[0] && $(this).find('li.contact')[0] && $(this).next('.momline').find('li.ascension')[0]){
      _this.find('li.contact .tool').append(cable);
      // if(_this.find('li.contact .table table').length>0){/**存在表格的 */
      //   if(_this.find('li.contact .table').width()>0){
      //     var _h = _this.find('li.contact .table').height();
      //     _this.next('.momline').find('li.ascension .table').height(_h);
      //     var _w = _this.find('li.contact .table').width()+110;
      //     _this.find('li.contact .tool .cable').width(_w);
      //   }else{
      //     _this.next('.momline').find('li.ascension .table').height(0);
      //     _this.find('li.contact .tool .cable').width('133px');
      //   };
      // };
      
      var _A = $(this).find('li.contact .swicth');
      var _B= $(this).next('.momline').find('li.ascension .swicth');
      _A.append(`<div class="pointA"></div>`);
      _B.append(`<div class="pointB"></div>`);
    };
    /**故障母线挂链接 */
    // if(_this.data('err')=='Y'){
    //   _this.find('.tit').click(function(){
    //     window.parent.$("#iframepage").attr("src", 'back13_1_line_masterFaultInfo.html?monitorFlag=' + _this.data('monitorFlag') + '&isSolve=false' + '&masterName='+encodeURI(_this.data('masterName')));
    //     sessionStorage._monitorFlag = _this.data('monitorFlag');
    //     sessionStorage._masterName = encodeURI(_this.data('masterName'));
    //     /**跳转后退出全屏 */
    //     exitFullScreen();
    //   })
    // };
  });/**联络柜 提升柜渲染结束 */
  /**为表格的父元素switch加样式 */
  $('.swicth .table').each(function(){
    var _this = $(this),_switch = _this.parents('.swicth');
    var _w = _this.width()+14;/**+14的原因是 表格的竖线偏移 */
    if(_this.find('.addTable')[0]){
      _this.css({'margin-left':_w});
      _switch.css({'margin-left':-(_w*3/4)});
    };
  });
  /**整体宽度 */
  setInterval(x=>{
    /**底部标签长度 */
    var cabinetWidth= $('.cabinet')[0].scrollWidth;
    // $('.cabinet').outerWidth(cabinetWidth);
    var cabinetW = 0;
    $('.momline').each(function(){
      cabinetW += $(this).outerWidth()+50;
      if($(this).next('.momline')[0] && $(this).find('li.contact')[0] && $(this).next('.momline').find('li.ascension')[0]){
        var _h = $(this).find('li.contact .table').height();
        $(this).next('.momline').find('li.ascension .table').height(_h);
        var pointA = $(this).find('li.contact .pointA').offset().left;
        var pointB = $(this).next('.momline').find('li.ascension .pointB').offset().left;
        var pointdis = pointB - pointA + 3;
        $(this).find('li.contact .tool .cable').width(pointdis);
      }
    });
    $('.cabinet').width(cabinetW);
    /**底部标签内容宽度 */
    $('.config>li').each(function(){
      var pwidth = $(this).outerWidth();
      $(this).find('.configname').width(pwidth);
    });
    var _h = $('html').height();
    window.parent.$('#iframepage').css({'min-height':_h+30+'px'});
  },100);
  /**挂链接 */
  $('.config>li').each(function(){
    var _this = $(this);
    /**判断是否存在表格 */
    if(_this.find('.table table').length>0){
      _this.addClass('mylink');
      _this.click(function(){
        window.parent.$("#iframepage").attr("src", 'back13_2_line_pointFaultInfo.html?id=' + _this.data('link'));
        /**跳转后退出全屏 */
        exitFullScreen();
      })
    };
  });
};


function fullScreens(iframeId) {
  /* 获取父类的document */
  var parentDoc = parent.document;
  /* 定义一个接收元素的变量 */
  var thisIframe = null;
  $("iframe", parentDoc).each(function (index, e) {
      if(e.id == iframeId){
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

  /**退出全屏 */
  function exitFullScreen() {
    // window.parent.$("body").find('.nav').removeClass('fullscreen');
    window.parent.$("body").find('button.nofull').click();
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
    };
  }
