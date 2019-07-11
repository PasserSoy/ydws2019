layui.use(['table','form','laydate'], function(){
  var form = layui.form ,layer = layui.layer,table = layui.table;
  var count = 0;//加载完移除load
	var frameH = sessionStorage.windowHeight -58 + 'px';// 页面高度
	window.parent.$('#iframepage').height(frameH);
	///////删除不需要的菜单
	if (sessionStorage.menuTab == "xj") {
		$('.normalNav .li2').remove();// 总览页面菜单
	};
  window.parent.$("body").addClass('myIndex');
  // 登录权限
  if(sessionStorage.permission=='admin'){
    $('.adminNav').removeClass('hide');
  }else{
    $('.normalNav').removeClass('hide');
  };
  // 下拉框
  POST('/sys/monitorStation/queryMonitorAddress.v1', { createBy: sessionStorage.id }, function (res) {
    if (res.code == '0') {
      var content = '<option value="">全部区域</option>'
      for (let i of res.data) {
        content += `<option value="${i}">${i}</option>`
      }
      $('select[name=stationAddress]').empty().append(content);
      form.render();
    } else {
      layer.alert(res.msg)
    }
  },'',function(){
    ++count;
  });

  // 查询
  form.on('submit(search)', function(data){
    init(data.field);
    return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
  });
  // 下拉查询
  form.on('select(selectS)', function(data){
    init({city:data.value});
  });  
  // 地图初始化
  init({stationName:'',city:''});
  function init(data) {// 地图初始化方法
    data.rows=10000;
    data.createBy=sessionStorage.id;
    POST('/sys/monitorStation/queryMonitorStation.v1', data, function (res) {
      // 地图
      var map = new AMap.Map('map', {
        mapStyle: 'amap://styles/29568e6677b30e3292a0250ced45afa5',
        zoom: 4,
        center: [104.669509, 39.3],
        resizeEnable: true,
        zoomEnable: true, //禁止缩放
        dragEnable: true, //禁止移动
      });
      var marker1=[],// 详情点
          marker2=[],// 统计点
          marker3=[];// 点击统计点后查询的点
      if (res.data.count) {
        // 重组地址数据
        var mapArr=mapData(res);
        // console.log(mapArr)
        mapArr.forEach(x=>{// 统计点标志
          var marker = new AMap.Marker({
            position: x.position,
            // 设置鼠标划过点标记显示的文字提示
            title: x.addr,
            // 点标记的动画效果: 掉落效果
            animation: 'AMAP_ANIMATION_DROP',
            // 需在点标记中显示的图标 有合法的content内容时，此属性无效
            icon: './images/index/maploc.png',
            // 点标记显示内容
            content: `<span class="maploc">${x.length}</span>`
          });
          marker2.push(marker);
          marker.setMap(map);
        });

        // 详情点
        var arr = [];  
        for (var i of res.data.list) {
          arr.push(i);
        };
        if(arr[0]==null){arr=[]};
        var context = ''
        $('#list').html('');
        for (let i = 0; i < arr.length; i++) {// 描详情点
          if (!arr[i].longitudeAndlatitude) {
            continue;
          };
          context += '<li title="'+arr[i].stationAddress+'" monitorStationId="' + arr[i].id + '">' +
            '<img class="img1" src="./images/two/position2.png" alt="">' + arr[i].stationName +
            '<img class="img2" src="./images/two/right.png" alt="">' +
            '</li>';  
          mapDetails(map,marker1,arr,i);
        };  
        $('#list').append(context);
        // $('html').height(htmlHeight);
        marker1.forEach(x=>x.hide());// 详情点默认隐藏
        marker2.forEach(x=>{// 统计点点击，隐藏统计点，显示详情点
          x.on('click',function(){
            var city = x.getTitle();// 获取区域
            var marker3Arr = mapArr.filter(x=>x.addr==city)[0].list;
            for (let i = 0; i < marker3Arr.length; i++) {// 描详情点
              if (!marker3Arr[i].longitudeAndlatitude) {
                continue;
              }; 
              mapDetails(map,marker3,marker3Arr,i);
            }; 
            mapShowOrHide(marker3,marker2);
            map.setFitView();
          })
        });
        map.on('zoomend',function(){// 缩放地图
          if(map.getZoom()>=9){
            mapShowOrHide(marker1,marker2);
          }else{
            mapShowOrHide(marker2,marker1);
            marker3.forEach(x=>map.remove(x));// 移除所有marker3的点
          }
        });
      };
      mapZoom(map);
      $(window).resize(function(){
        mapZoom(map);
      });
    },'',function(){++count;})
  }
  function mapZoom(map){// 地图缩放
    if(map.getZoom()<=4){
      if($('.middle .map').width()<=650||$('.middle .map').height()<=540){
        map.setZoom(3);
      }else{
        map.setZoom(4);
      };
    };
  }
  function mapData(res){// 统计地图数据
    var resObj={};
    if(res.data.list[0]==null){res.data.list=[]};
    res.data.list.forEach(x=>{
      if(resObj[x.city]==undefined){// 如果对象不存在
        resObj[x.city]=[];
      };
      resObj[x.city].push(x);
    });
    // console.log(resObj)
    var resArr=[];
    for(var j in resObj){
      var obj={};
      obj.addr=j;// 存入地址名
      obj.list=resObj[j];// 存入地址对象
      var addrLen=resObj[j].length;// 地址个数
      obj.length=addrLen;// 存入地址个数
      var addrArr=[];// 地址经纬度数组
      resObj[j].forEach(y=>{
        addrArr.push(y.longitudeAndlatitude.split(','));// 切割经纬度
      });
      var long=0,lat=0;// 最终经纬度
      addrArr.forEach(z=>{
        long+=Number(z[0]);
        lat+=Number(z[1]);
      });
      obj.position=[long/addrLen,lat/addrLen];// 存入地址经纬度
      resArr.push(obj);
    };
    // console.log(resArr);
    return resArr;
  }
  function mapShowOrHide(a,b){// 地图描点显示隐藏
    a.forEach(x=>x.show());
    b.forEach(x=>x.hide());
  }
  function mapDetails(map,markers,arr,i){// 地图详情点  
    var marker = new AMap.Marker({
      position: arr[i].longitudeAndlatitude.split(','),
      // 设置鼠标划过点标记显示的文字提示
      title: arr[i].stationAddress,
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
    markers.push(marker);
    marker.setMap(map);
    // 点击事件
    marker.on('click', function () {
      sessionStorage.monitorStationId = arr[i].id;
      sessionStorage.stationName = arr[i].stationName;
      window.parent.$("#iframepage").attr("src", 'back13_0_line.html?v=1.6.22');
      $(window.parent.document).find('.nav').removeClass('navfull');
    });
  }
  $('#list').on('click','li',function(){// 页面跳转
    sessionStorage.monitorStationId = $(this).attr('monitorStationId');
    sessionStorage.stationName = $(this).text();
    window.parent.$("#iframepage").attr("src", 'back13_0_line.html?v=1.6.22');
  });  
  $('.tabs>i').on('click',function(){// 地图列表切换
    $(this).addClass('active').siblings('i').removeClass('active');
    if($(this).attr('class').indexOf('listI')>-1){
      $('#list').addClass('show');
    }else{
      $('#list').removeClass('show');
    }
  });
  $('.right .nav li:not(.li5)').on('mouseenter',function(){// 滑动菜单时将内容赋值给li5
    var cont = $(this).html();
    $(this).siblings('.li5').html(cont);
  }).on('mouseout',function(){// 移出时将active内容赋值给li5
    var cont = $('.right .nav li.active').html();
    $(this).siblings('.li5').html(cont);
  }).on('click',function(){// 页面跳转
    var src = $(this).data('src');
    window.parent.$(".two_header_nav li#"+src).click();
  });
  ////报警年月日
  var mydate = new Date(); //通过new方法创建对象
  var _year = mydate.getFullYear()
      ,_month = (mydate.getMonth() + 1) < 10 ? '0' + (mydate.getMonth() + 1) : mydate.getMonth() + 1
      ,_date = mydate.getDate() < 10 ? '0' + mydate.getDate() : mydate.getDate()
      ,_mydate = _year + '-' + _month + '-' + _date
      ,oneDay = 24 * 60 * 60 * 1000
      ,todayS = new Date(_mydate + ' 00:00:00').getTime()
      ,todayE = new Date(_mydate + ' 23:59:59').getTime();
  alarm({timeStart:todayS,timeEnd:todayE});// 初始化
  ///////////////////////////////// 时间单选框处理
  $('.dateChoose').on('click','li:not(.active)',function () {
    $(this).addClass('active').siblings('li').removeClass('active');// 切换效果
    var dataTime = {};
    var _id = $(this).attr('id');
    if(_id == 'week'){ // 周报
      var weekDay = mydate.getDay() == 0 ? 7 : mydate.getDay(); // 星期天改成7
      var sWeek = todayS - (weekDay - 1) * oneDay; // 一周开始的时间
      var eWeek = todayE + (7 - weekDay) * oneDay; // 一周结束的时间
      dataTime.timeStart=sWeek; // 一周开始的时间
      dataTime.timeEnd=eWeek; // 一周结束的时间
    }else if(_id == 'month'){ // 月报
      var sMonth = new Date(_year + '-' + _month + '-01 00:00:00').getTime(); // 本月1号
      var nextMonth = _year + '-' + (mydate.getMonth() + 2) + '-01 00:00:00'; // 下个月1号
      var eMonth = new Date(nextMonth).getTime() - 1; // 本月最后一天
      if(_month==12) eMonth = new Date(_year + '-12-31 23:59:59').getTime();
      dataTime.timeStart=sMonth; // 本月开始的时间
      dataTime.timeEnd=eMonth; // 本月结束的时间
    }else if(_id == 'quarter'){ // 季报
      var sQuarter = '',
        eQuarter = '';
      if(_month == '01' || _month == '02' || _month == '03'){ // 第一季度
        sQuarter = _year + '-01-01'; // 季度开始时间
        eQuarter = _year + '-03-31'; // 季度结束时间
      }else if(_month == '04' || _month == '05' || _month == '06'){ // 第二季度
        sQuarter = _year + '-04-01'; // 季度开始时间
        eQuarter = _year + '-06-30'; // 季度结束时间
      }else if (_month == '07' || _month == '08' || _month == '09'){ // 第三季度
        sQuarter = _year + '-07-01'; // 季度开始时间
        eQuarter = _year + '-09-30'; // 季度结束时间
      }else if (_month == '10' || _month == '11' || _month == '12'){ // 第四季度
        sQuarter = _year + '-10-01'; // 季度开始时间
        eQuarter = _year + '-12-31'; // 季度结束时间
      };
      dataTime.timeStart=new Date(sQuarter+' 00:00:00').getTime(); // 季度开始时间
      dataTime.timeEnd=new Date(eQuarter+' 23:59:59').getTime(); // 季度结束时间
    }else if(_id == 'year'){ // 年报
      var sYear = _year + '-01-01'; // 年开始时间
      var eYear = _year + '-12-31'; // 年结束时间
      dataTime.timeStart=new Date(sYear+' 00:00:00').getTime(); // 年开始时间
      dataTime.timeEnd=new Date(eYear+' 23:59:59').getTime(); // 年结束时间
    }else if(_id == 'day'){ // 自选日期
      dataTime.timeStart=todayS;
      dataTime.timeEnd=todayE;
    };
    alarm(dataTime);
  });
  function alarm(data){// 报警
    POST('/index/alarmCount',data,function(res){
      if(res.code==0){
        for(var i in res.data){
          $('.left span.'+i).text(res.data[i]);
        };
      }else{
        layer.msg(res.msg);
      };
    },'',function(){++count});
  }
  // 实时报警
  table.render({
    elem: '#tableAlarm'
    ,height: 215
    ,id:'tableAlarm'
    ,where:{token:sessionStorage.token}
    ,url: rooturl+'/index/getIndexRealFault' //数据接口
    ,cols: [[ //表头
      {title: '监测站名称', field: 'monitorStationName'}
      ,{title: '报警级别', field: 'alarmLeve'}
      ,{title: '故障线路', field: 'masterName'}
      ,{title: '故障类型', field: 'fault'} 
      ,{title: '故障发生时间', field: 'times',templet:'#timeTpl'}
    ]],
    done:function(){++count;tableHeight('.realAlarm');}
  });
  // 设备状态详情
  table.render({
    elem: '#tableDetail'
    ,height: 215
    ,id:'tableDetail'
    ,where:{token:sessionStorage.token}
    ,url: rooturl+'/index/getDevieStatuInfo' //数据接口
    ,cols: [[ //表头
      {title: '监测站名称', field: 'stationName'}
      ,{title: '设备名称', field: 'masterName'}
      ,{title: '设备类型分类', field: 'devType'}
      ,{title: '离线时间', field: 'offlineTime',templet:'#timesTpl'}
    ]],
    done:function(){++count;tableHeight('.detail');}
  });
  mapWidth();
  $(window).resize(function(){
    table.resize('tableAlarm');
    table.resize('tableDetail');
    tableHeight('.realAlarm');
    tableHeight('.detail');
  });
  function tableHeight(parent){// 表格高度
    var parentHeight = $(parent).height(),// 模块高度
        titleHeight = $(parent).find('h2').height(),// 标题高度
        headHeight = $(parent).find('.layui-table-header').height(),// 表头高度
        bottomHeight = 5;// 距离底部
    $(parent).find('.layui-table-body').height(parentHeight-titleHeight-headHeight-bottomHeight);
  }
  // 表格hover
  $('#mainbody').on('mouseover','.layui-table-body tr',function(){
    $('.layui-table-grid-down').remove();
    var thArr=[],tbArr=[],_titile='';
    var _t=$(this),_thead=_t.parents('.layui-table-view').find('.layui-table-header');
    _thead.find('th:not(.layui-table-patch)').each(function(){// 表头
      thArr.push($(this).find('span').text());
    });
    _t.find('td').each(function(){
      tbArr.push($(this).find('div').text());
    });
    thArr.forEach((x,i)=>{
      _titile += `${x}:${tbArr[i]}\n`;
    });
    _t.attr('title',_titile);
  });
  // 表格点击跳转
  table.on('row(tableAlarm)', function(obj){// 实时报警
    if (obj.data.phase == '0') {
      obj.data.phase = "没有相位";
    } else if (obj.data.phase == '1') {
      obj.data.phase = "A相";
    } else if (obj.data.phase == '2') {
      obj.data.phase = "B相";
    }else if (obj.data.phase == '3') {
      obj.data.phase = "AB相";
    } else if (obj.data.phase == '4') {
      obj.data.phase = "C相";
    }else if (obj.data.phase == '5') {
      obj.data.phase = "AC相";
    }else if (obj.data.phase == '6') {
      obj.data.phase = "BC相";
    }else if (obj.data.phase == '7') {
      obj.data.phase = "ABC相";
    } else {
      obj.data.phase = "未知相位";
    };
    sessionStorage.myIndex='myIndex';
    var _href='&index=myIndex&autoId='+obj.data.autoId+'&monitorStationName='+encodeURI(obj.data.monitorStationName)
              +'&masterName='+encodeURI(obj.data.masterName)+'&protectorType=' + obj.data.protectorType
              +'&aname='+encodeURI(obj.data.alarmLeve)+'&fname='+encodeURI(obj.data.fault)
              +'&type='+obj.data.faultType+'&times='+obj.data.times.slice(0, -4)
              +'&devid='+obj.data.devid+'&phase='+obj.data.phase;// 跳转参数
    window.parent.$("#iframepage").attr("src", 'back8_1_FaultGroundInfo.html?v=1.6.22'+_href);
  });
  table.on('row(tableDetail)', function(obj){// 设备状态详情
    sessionStorage.breadstation = obj.data.stationName;
    sessionStorage.breadmomline = obj.data.masterName;

    sessionStorage.companyId=obj.data.companyId;
    sessionStorage.companyName=obj.data.companyName;
    sessionStorage.myIndex='myIndex';
    sessionStorage.removeItem('back5');// 移除主页跳转sessionStorage
    var _href='&monitorStationId='+obj.data.stationId;// 跳转参数
    window.parent.$("#iframepage").attr("src", 'back4_LinesOnMaster.html?v=1.6.22'+_href);
    if(obj.data.devType=="监测设备"){// 跳转到支线
      sessionStorage.back5='back5';
      _href='&linesOnMasterId='+obj.data.id;
      window.parent.$("#iframepage").attr("src", 'back5_LinesOnBranch.html?v=1.6.22'+_href);
    };
  });
  // 设备状态
  POST('/index/getDevieStatuCount',{},function(res){
    if(res.code==0){
      for(var i in res.data){
        $('.right .state li span.'+i).text(res.data[i]);
      };
    }else{
      layer.msg(res.msg);
    };
  },'',function(){++count});
  var _s=setInterval(x=>{
    if(count>=5){
      clearInterval(_s);
      $('.loadjy').removeClass('op');
    };
  },10);
})
function mapWidth(){// 布局
  var lfw=$('.left').width()+30,rgw=$('.right').width()+20;
  if($('.left').width()<=210 || $('.right').width()<=250){
    $('.middle').css({'left':'240px','right':'270px'});
  }else{
    $('.middle').css({'left':lfw,'right':rgw});
  };
  $('.left,.right,.middle').css({'opacity':'1'});
}
