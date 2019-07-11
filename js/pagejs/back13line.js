$(function(){
  $('h2.title').text(sessionStorage.stationName);// 一次接线图标题
  searchline();// 请求数据
  $(document).on('keydown',function(e){// 关闭F11
    if(e.keyCode==122){
      return false;
    };
  });
  /* 全屏 */
	$('.no-screen').on('click',function(){
    if($(this).hasClass('full-screen')){/**全屏 */
      $(this).removeClass('full-screen');
      $('#line-detail').addClass('full');
      fullScreens('iframepage');
      /**获取cabinet的坐标 */
      // var _top = $('.cabinet').offset().top;
      // $('.line_center_content h2.fulltit').css({'top':_top});
    }else{/**退出全屏 */
      $(this).addClass('full-screen');
      $('#line-detail').removeClass('full');

      exitFullScreen();
    };
    allwidth();
  });
  /**全屏 */
  function fullScreen() {
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
      window.parent.$("#iframepage").attr("src", 'back13_1_line_masterFaultInfo.html?v=1.6.22&monitorFlag=' + monitorFlag + '&isSolve=false' + '&masterName='+encodeURI(masterName));
      /**跳转后退出全屏 */
      exitFullScreen();
    };
  });
  // 表格的跳转
  $('body').on('click','.momline-collect h5',function(){// 母线
    var _this = $(this).parents('li[data-monitorFlag]');
    var monitorFlag = _this.attr('data-monitorFlag');
    $('.momline[data-monitorFlag='+monitorFlag+'] .tit').click();
  });
  $('body').on('click','.momline-collect .branch-collect li',function(){// 支线
    var _this = $(this);
    var link = _this.attr('data-link');
    $('.momline .mylink[data-link='+link+']').click();
  });
})
var searchline = function(){// 一次接线图请求
  // $('.cabinet').html('正在请求数据...');
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
    beforeSend:function(){
      $('.loadingD').show();
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
      $('.loadingD').hide();
    }
  });
};

/**一次接线图 */
function onceline(res){
  /**一次接线图 */
  $('.cabinet,.momline-collect').html('');
  var list = res.data.list;/**获取结果列表 */
  var tableDatas = [];/**表格接口数据 */
  /**渲染 */
  list.forEach(x=>{
    var linesOnMasterSortList = x.linesOnMasterSortList;/**母线数组 */
    /**渲染母线结构 */
    linesOnMasterSortList.forEach(x=>{
      /**渲染支线结构 */
      var linesOnBranchDtos = x.linesOnBranchDtos;/**支线数组 */
      var contact='';/**联络柜 */
      var ascension='';/**提升柜 */
      var inark='';/**进线柜 */
      var ptark='';/**PT柜 */
      var outark='';/**出线柜 */

      /////////////表格DOM
      var ctable='';/**联络柜表格 */
      var itable='';/**进线柜表格 */
      var otable='';/**出线柜表格 */
      var atable='';/**提升柜表格 */
      var ptable='';/**PT柜表格 */
      linesOnBranchDtos.forEach(x=>{// 遍历支线数组
        // console.log(x)
        /**
         * 渲染不同类型的柜子
         * 进线柜 branchType=1
         * PT柜 branchType=2
         * 出线柜 branchType=3
         * 联络柜 branchType=4
         * 提升柜 branchType=5
         * 1、2、3、4、5有监测设备
         */
        var _id = x.id;
        if(x.branchType=='1'){
          // console.log('这是进线柜');
          /**渲染监测设备 */
          var _table='';
          if(x.monitorPointDtos.length>0){// 监测设备数组存在时
            // 拼接表格接口数据
            x.monitorPointDtos.forEach(x=>{
              tableDatas.push(x)
            });
            _table = oncetable(x.monitorPointDtos);//一次接线图表格，返回的是 过电压保护器表格+温度采集器
          };
          /**./渲染监测设备 */
          inark = `
          <!-- 进线柜 -->
          <li class="entry" data-val="${x.cabin_no}" data-cabin="${x.cabin_no}" data-link="${_id}">
            <div class="equip">
              <i class="busbar"></i> <i class="upc"></i> <i class="swi"></i> <i class="downc"></i>
              <div class="tool">
                <!-- 传感器 -->`+
                oncesensor(x.sensorNumber)
                +`<i class="jx"><i class="sen"></i></i>
              </div>
              <i class="uparrow"></i>
            </div>
            <div class="table"><p class="configname">${x.branchName}</p>${_table}</div>
          </li>`;// 图
          if(!_table==''){
            itable = `<li data-link="${_id}" data-cabin="${x.cabin_no}"><h6 class="b-name">${x.branchName}</h6><h5 class="ctnum">CT绕组数:${x.sensorNumber}</h5><div class="table">${_table}</div></li>`;// 表
          };
        }else if(x.branchType=='2'){
          // console.log('这是PT柜');
          /**渲染监测设备 */
          var _table='';
          if(x.monitorPointDtos.length>0){// 监测设备数组存在时
            // 拼接表格接口数据
            x.monitorPointDtos.forEach(x=>{
              tableDatas.push(x)
            });
            _table = oncetable(x.monitorPointDtos);//一次接线图表格，返回的是 过电压保护器表格+温度采集器
          };
          /**./渲染监测设备 */
          ptark = `
          <!-- PT柜 -->
          <li class="pt" data-val="${x.cabin_no}" data-cabin="${x.cabin_no}" data-link="${_id}">
            <div class="equip">
              <i class="pt"></i>
              <p class="ptname">ERIC-STOM<br>用电安全防御装置</p>
            </div>
            <div class="table"><p class="configname">${x.branchName}</p>${_table}</div>
          </li>`;// 图
          if(!_table==''){
            ptable += `<li data-link="${_id}" data-cabin="${x.cabin_no}"><h6 class="b-name">${x.branchName}</h6><h5 class="ctnum">CT绕组数:${x.sensorNumber}</h5><div class="table">${_table}</div></li>`;// 表
          };
        }else if(x.branchType=='3'){
          // console.log('这是出线柜');
          /**渲染监测设备 */
          var _table='';
          if(x.monitorPointDtos.length>0){
            // 拼接表格接口数据
            x.monitorPointDtos.forEach(x=>{
              tableDatas.push(x)
            });
            _table = oncetable(x.monitorPointDtos);//一次接线图表格，返回的是 过电压保护器表格+温度采集器
          };
          /**./渲染监测设备 */
          outark += `
          <!-- 出线柜 -->
          <li class="transformer" data-val="${x.cabin_no}" data-cabin="${x.cabin_no}" data-link="${_id}">
            <div class="equip">
              <i class="busbar"></i> <i class="upc"></i> <i class="swi"></i> <i class="downc"></i>
              <div class="tool">
                <!-- 传感器 -->`+
                oncesensor(x.sensorNumber)
                +`<i class="cg"><i class="sen"></i></i>
              </div>
              <i class="downarrow"></i>
              <i class="sensor"></i>
            </div>
            <div class="table"><p class="configname">${x.branchName}</p>${_table}</div>
          </li>`;// 图
          if(!_table==''){
            otable += `<li data-link="${_id}" data-cabin="${x.cabin_no}"><h6 class="b-name">${x.branchName}</h6><h5 class="ctnum">CT绕组数:${x.sensorNumber}</h5><div class="table">${_table}</div></li>`;// 表
          };
        }else if(x.branchType=='4'){
          // console.log('这是联络柜');
          /**渲染监测设备 */
          var _table='';
          if(x.monitorPointDtos.length>0){
            // 拼接表格接口数据
            x.monitorPointDtos.forEach(x=>{
              tableDatas.push(x)
            });
            _table = oncetable(x.monitorPointDtos);//一次接线图表格，返回的是 过电压保护器表格+温度采集器
          };
          /**./渲染监测设备 */
          contact = `
          <!-- 联络柜 -->
          <li class="contact" data-cabin="${x.cabin_no}" data-link="${_id}">
            <div class="equip">
              <i class="busbar"></i> <i class="upc"></i> <i class="swi"></i> <i class="downc"></i>
              <div class="tool">
                  <!-- 传感器 -->`+
                  oncesensor(x.sensorNumber)
                  +`<i class="jx"><i class="sen"></i></i>
              </div>
            </div>
            <div class="table"><p class="configname">${x.branchName}</p>${_table}</div>
          </li>`;// 图
          if(!_table==''){
            ctable = `<li data-link="${_id}" data-cabin="${x.cabin_no}"><h6 class="b-name">${x.branchName}</h6><h5 class="ctnum">CT绕组数:${x.sensorNumber}</h5><div class="table">${_table}</div></li>`;// 表
          };
        }else if(x.branchType=='5'){
          // console.log('这是提升柜');
          /**渲染监测设备 */
          var _table='';
          if(x.monitorPointDtos.length>0){
            // 拼接表格接口数据
            x.monitorPointDtos.forEach(x=>{
              tableDatas.push(x)
            });
            _table = oncetable(x.monitorPointDtos);//一次接线图表格，返回的是 过电压保护器表格+温度采集器
          };
          /**./渲染监测设备 */
          ascension =`
          <!-- 提升柜 -->
          <li class="ascension" data-cabin="${x.cabin_no}" data-link="${_id}">
            <div class="equip">
            <i class="busbar"></i> <i class="upc"></i> <i class="swi swi1"></i> <i class="downc"></i>
              <div class="tool">
                <i class="ts"></i>
              </div>
            </div>
            <div class="table"><p class="configname">${x.branchName}</p>${_table}</div>
          </li>`;// 图
          if(!_table==''){
            atable += `<li data-link="${_id}" data-cabin="${x.cabin_no}"><h6 class="b-name">${x.branchName}</h6><h5 class="ctnum">CT绕组数:${x.sensorNumber}</h5><div class="table">${_table}</div></li>`;// 表
          };
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
      var content = `<li class="momline `+
      oncehitchType(x.hitchType)
      +`" data-err="${x.isProblem}" data-monitorFlag="${x.monitorFlag}" data-masterName="${x.masterName}" data-momline="${x.hitchType} KV ${x.masterName} ${x.isOnline==false?'(离线)':''}">
        <h3 class="tit"><span class="kv">${x.hitchType} KV</span><span class="linename">${x.masterName} ${x.isOnline==false?'(离线)':''}</span><div class="linep"></div></h3>
        <ul class="config"> ${ascension} ${sortark} ${contact} </ul>
      </li>`;
      $('.cabinet').append(content);
      $('ul.hide').empty();/**清空临时ul */

      ///////////渲染线路表
      var _myLineTable='';
      if(ctable!=''||itable!=''||otable!=''||atable!=''||ptable!=''){//ctable 联络柜表格；itable 进线柜表格；otable 出线柜表格；atable 提升柜表格；ptable PT柜表格
        var fault = x.isProblem=='Y'?'fault':'';// 是否为故障母线
        /**进线柜、PT、出线柜排序 */
        var sortTB = `${itable}${otable}${ptable}`;
        $('ul.hide').empty().append(sortTB);
        var _lis = $('ul.hide li[data-cabin]').get();
        _lis.sort(function(a,b){
          var a = $(a).data('cabin');
          var b = $(b).data('cabin');
          if(a>b) return 1;
          if(a<b) return -1;
          return 0;
        });
        $('ul.hide').empty().append(_lis);
        sortTB = $('ul.hide').html();
        /**./进线柜、PT、出线柜排序 */
        
        _myLineTable = `<li data-monitorFlag="${x.monitorFlag}" data-momline="${x.masterName} ${x.isOnline==false?'(离线)':''}"><h5 class="m-name ${fault}">${x.hitchType} KV ${x.masterName} ${x.isOnline==false?'(离线)':''}</h5>
        <ul class="branch-collect"> ${atable} ${sortTB} ${ctable}</ul></li>`;
      };
      $('.momline-collect').append(_myLineTable);
      $('ul.hide').empty();/**清空临时ul */
    }); /**./渲染母线结构 */       
  });/**./渲染 */
  ///////////渲染监测站名称 表
  $('#line-table .monitor-name').text(sessionStorage.stationName);

  /**拼接table 从新接口获取 过电压保护器 温度采集器 的数据 通过sensorId赋值*/
  var powData = tableDatas.filter(x=>x.hitchType=="过电压保护器");
  var temData = tableDatas.filter(x=>x.hitchType=="温度采集器");
  var powUrl = '';// 过电压保护器数据
  powData.forEach(x=>{
    powUrl += '&voltageIds='+x.monitorFlag;
  });
  var temUrl = '';// 温度采集器数据
  temData.forEach(x=>{
    temUrl += '&temperIds='+x.monitorFlag;
  });
  setInterval(x=>{
    oneTable();
  },5000);
  oneTable();
  function oneTable(){// 渲染表格数据方法
    // $('.myline table td').text('-');
    $.ajax({
      url: rooturl+'/sys/monitorStation/getWiringDiagramData.v2?token='+sessionStorage.token+powUrl+temUrl+'&monitorStationId='+sessionStorage.monitorStationId+'&flag=three&,',
      dataType:'json',
      success:function(res){
        var temper_data = res.data.list[0].temper_data;
        var voltage_data = res.data.list[0].voltage_data;
        if(temper_data!=undefined && temper_data.length>0){
          temper_data.forEach(x=>{//温度采集器
            $('td[data-id='+x.sensorId+']').text(`${x.temper}`);
          });
        };
        if(voltage_data!=undefined && voltage_data.length>0){
          voltage_data.forEach(x=>{//过电压保护器
            $(`table.addTable[data-id=${x.sensorId}]`).addClass('toShow');
            var volT = $('table[data-id='+x.sensorId+']');
            for(y in x){
              volT.find('td[data-p='+y+']').text(`${x[y]}`);
              if(y.indexOf('temper')>=0){// 处理温度数据
                volT.find('td[data-p='+y+']').text(`${x[y]}`);
              };
              if(y.indexOf('electric')>=0){// 处理泄漏电流数据
                var elec = x[y];
                elec= elec>1000?`${elec/1000} mA`:`${elec} μA`;
                volT.find('td[data-p='+y+']').text(elec);
              };
            }
          });
        };
        $('.branch-collect li').each(function(){// 遍历支线，如果没有toShow，就移除此支线
          var toShowLen = $(this).find('table.toShow').length;
          // console.log(toShowLen);
          if(toShowLen<1) $(this).remove();
        });
      },
      error:function(err){
        console.log(err);
      }
    });
  }
  // $('.addTable').hide()/**隐藏所有支线上的表格 */
  
  allwidth();// 挂链接
  // 图表切换
  $('.myline .tab').on('click','span',function(){
    var _t = $(this),_n = _t.data('id'),_l = _t.parents('.myline');
    _t.addClass('active').siblings('span').removeClass('active');
    _l.find(`#${_n}`).slideDown(300,function(){
      setTimeout(x=>{
        var _h = $('html').height();
        window.parent.$('#iframepage').css({'min-height':_h+30+'px'});
      },100);
    }).siblings('.tab-child').slideUp();
    // 有效值图表的显隐
    if(_n=='line-chart'){
      $('.line_bottom').show();
    }else{
      $('.line_bottom').hide();
    }
  });
  
  
  //  线路条数和故障次数
  $('.line-fault').text(res.data.list[0].totalProblem);
  $('.line-total').text(res.data.list[0].totalLines);
  $('.point-total').text(res.data.list[0].monitorPointCount);
  
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
/**一次接线图表格 */
function oncetable(x){// x传入的是监测设备数组
  var voltable='',temptable='',y='';// voltable 过电压保护器表格；temptable 温度采集器；y 返回两个表格组合
  var tem_=[],td_=`<td></td>`;// 温度采集器 的一些变量
  for(var i=0;i<=14;i++){// 14 是因为一共有15个td项
    tem_[i]=td_;
  };
  x.forEach(x=>{
    if(x.hitchType=='过电压保护器'){
      voltable = `<table class="addTable toShow" data-id="${x.monitorFlag}">
      <tr class="head pow"><td colspan="3">过电压保护器</td></tr>
      <tr><td></td><td>湿度(%RH)</td><td>温度(℃)</td></tr>
      <tr><td>A相</td><td data-p="humidity_a"></td><td data-p="temper_a"></td></tr>
      <tr><td>B相</td><td data-p="humidity_b"></td><td data-p="temper_b"></td></tr>
      <tr><td>C相</td><td data-p="humidity_c"></td><td data-p="temper_c"></td></tr>
      <tr><td>泄漏电流</td><td colspan="2" data-p="electric"></td></tr>
      </table>`;
    }else if(x.hitchType=='温度采集器'){
      tem_[x.positionName]=`<td data-id="${x.monitorFlag}"></td>`;//positionName处是有数据的点，将tem_[x.positionName]的内容与其他的区分开，没有数据的话就不存在data-id
    }
  });
  var mp="",sd="",sj="",xd="",xj="";
  if(!(tem_[0]==td_&&tem_[1]==td_&&tem_[2]==td_)){/**不全为空 */
    mp = `<tr><td>母排</td>${tem_[0]}${tem_[1]}${tem_[2]}</tr>`;// 母排
  };
  if(!(tem_[3]==td_&&tem_[4]==td_&&tem_[5]==td_)){/**不全为空 */
    sd = `<tr><td>上动触头</td>${tem_[3]}${tem_[4]}${tem_[5]}</tr>`;// 上动触头
  };
  if(!(tem_[6]==td_&&tem_[7]==td_&&tem_[8]==td_)){/**不全为空 */
    sj = `<tr><td>上静触头</td>${tem_[6]}${tem_[7]}${tem_[8]}</tr>`;// 上静触头
  };
  if(!(tem_[9]==td_&&tem_[10]==td_&&tem_[11]==td_)){/**不全为空 */
    xd = `<tr><td>下动触头</td>${tem_[9]}${tem_[10]}${tem_[11]}</tr>`;// 下动触头
  };
  if(!(tem_[12]==td_&&tem_[13]==td_&&tem_[14]==td_)){/**不全为空 */
    xj = `<tr><td>下静触头</td>${tem_[12]}${tem_[13]}${tem_[14]}</tr>`;// 下静触头
  };
  temptable += `${mp}${sd}${xd}${sj}${xj}`;
  if(temptable!=''){
    temptable = `<table class="addTable toShow"><tr class="head tem"><td colspan="4">温度采集器</td></tr><tr><td></td><td>A相(℃)</td><td>B相(℃)</td><td>C相(℃)</td></tr>${temptable}</table>`;
  };
  return y = `${temptable}${voltable}`;
}
/**一次接线图传感器次数 */
function oncesensor(x){
  switch(x){
    case '0':return `<ul class="relay"></ul>`;break;
    case '3':return `<ul class="relay"><li><i></i><i></i><i></i></li></ul>`;break;
    case '4':return `<ul class="relay even"><li><i></i><i></i></li><li><i></i><i></i></li></ul>`;break;
    case '6-1':return `<ul class="relay"><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li></ul>`;break;
    case '6-2':return `<ul class="relay even"><li><i></i><i></i></li><li><i></i><i></i></li><li><i></i><i></i></li></ul>`;break;
    case '9':return `<ul class="relay"><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li></ul>`;break;
    case '12':return `<ul class="relay"><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li></ul>`;break;
    default:return `<ul class="relay"></ul>`;
  }
}
/**一次接线图母线电压等级 */
function oncehitchType(x){
  switch(x){
    case '6':return `kv6`;break;
    case '35':return `kv35`;break;
    default:return `kv10`;break;
  }
}

function allwidth(){
  /**联络柜 提升柜渲染开始 */
  $('.cabinet>.momline').each(function(i,cont){
    var _this = $(this);
    /**判断联络柜之后的母线是否存在提升柜，有则画连接线 */
    var cable = `<div class="cable"></div>`;/**连接线 */
    if($(this).next('.momline')[0] && $(this).find('li.contact')[0] && $(this).next('.momline').find('li.ascension')[0]){
      _this.find('li.contact .cable').remove();
      _this.find('li.contact').append(cable);
    };
    /**故障母线挂链接 */
    if(_this.data('err')=='Y'){
      _this.find('.linep').addClass('fault');
    };
  });/**联络柜 提升柜渲染结束 */
  /**支线挂链接 */
  $('.config>li').each(function(){
    var _this = $(this);
    /**判断是否存在表格 */
    if(_this.find('.table table').length>0){
      _this.addClass('mylink');
      _this.click(function(){
        const momline = _this.parents('[data-momline]').attr('data-momline');
        const monitorFlag = _this.parents('[data-monitorFlag]').attr('data-monitorFlag');
        const cabin = _this.attr('data-cabin');
        sessionStorage.momcabin = JSON.stringify({momline:momline,cabin:cabin,monitor:monitorFlag});
        window.parent.$("#iframepage").attr("src", 'back13_2_line_pointFaultInfo.html?v=1.6.22&id=' + _this.data('link'));
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
  };
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

