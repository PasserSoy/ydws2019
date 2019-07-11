$(function(){
  var data;// 接口获取的原始数据
  ///////////////////////////////// 初始化下拉框 后初始化页面数据
  myAjax(rooturl+'/sys/company/queryStaticThree.v1',{createBy:sessionStorage.id},function(res){
    $('button.btns').removeAttr('disabled');// 数据获取成功后解禁按钮组
    res = res.data;
    /// 公司及监测站 初始化
    var opt='';
    res.forEach(x=>{
      opt += `<option value="${x.id}">${x.companyName}</option>`;
    });
    $('select#company').append(opt);
    var _jcz = '<option value="">全部</option>';// 监测站的内容
    if(res[0].monitorStationDtos!=undefined && res[0].monitorStationDtos.length>0){
      res[0].monitorStationDtos.forEach(x=>{
        _jcz += `<option value="${x.id}">${x.stationName}</option>`;
      });
    };
    $('select#monitor').empty().append(_jcz);
    /// 监测站
    var _index=0;// 监测站的下标
    var _index1=0;// 母线的下标
    $('select#company').change(function(){
      _index = $(this).find('option:selected').index();// 选中项的下标
      var _c2 = '<option value="">全部</option>';// 监测站的内容
      if(res[_index].monitorStationDtos!=undefined && res[_index].monitorStationDtos.length>0){
        res[_index].monitorStationDtos.forEach(x=>{
          _c2 += `<option value="${x.id}">${x.stationName}</option>`;
        });
      };
      $('select#monitor').empty().append(_c2);
      $('select#bus').empty().append('<option value="">全部</option>');
    });
    /// 母线
    $('select#monitor').change(function(){
      _index1 = $(this).find('option:selected').index()-1;// 选中项的下标 -1 是去掉全部这个选项
      var _c2 = '<option value="">全部</option>';// 母线的内容
      if(_index1>-1 && res[_index].monitorStationDtos[_index1].linesOnMasterDtos!=undefined && res[_index].monitorStationDtos[_index1].linesOnMasterDtos.length>0) {
        res[_index].monitorStationDtos[_index1].linesOnMasterDtos.forEach(x=>{
          _c2 += `<option value="${x.id}">${x.masterName}</option>`;
        });
      };
      $('select#bus').empty().append(_c2);
    });

    initData();// 初始化页面
  });
  ///////////////////////////////// 初始化时间
  var mydate=new Date();//通过new方法创建对象
  var _year = mydate.getFullYear();
  var _month = (mydate.getMonth()+1)<10?'0'+(mydate.getMonth()+1):mydate.getMonth()+1;
  var _date = mydate.getDate()<10?'0'+mydate.getDate():mydate.getDate();
  var _mydate = _year+'-'+_month+'-'+_date;
  // if($('#timeStart').val()){
  //     timeStart = $('#timeStart').val()+' 00:00:00:000';
  // }else{
  //     $('#timeStart').val(_mydate);
  //     timeStart = mydate.getFullYear()+'-'+(mydate.getMonth()+1)+'-'+mydate.getDate()+' 00:00:00:000';
  // }
  // if($('#timeEnd').val()){
  //     timeEnd = $('#timeEnd').val()+' 00:00:00:000';
  // }else{
  //     $('#timeEnd').val(_mydate);
  //     timeEnd = mydate.getFullYear()+'-'+(mydate.getMonth()+1)+'-'+mydate.getDate()+' 23:59:59:000';
  // };
  ///////////////////////////////// 时间单选框处理
  $('.time input[type=radio]').change(function(){
    var _id = $(this).attr('id');
    if(_id=='week') {// 周报
      var oneDay = 24*60*60*1000;// 一天的时间
      var todayS = new Date(mydate.toDateString()+' 0:0:0').getTime();// 一天的开始时间
      var todayE = new Date(mydate.toDateString()+' 23:59:59').getTime();// 一天的结束时间
      var weekDay = mydate.getDay()==0?7:mydate.getDay();// 星期天改成7
      var sWeek = dateInit(new Date(todayS-(weekDay-1)*oneDay));// 一周开始的时间
      var eWeek = dateInit(new Date(todayE+(7-weekDay)*oneDay));// 一周结束的时间
      $('#timeStart').val(sWeek);// 一周开始的时间
      $('#timeEnd').val(eWeek);// 一周结束的时间
    }else if(_id=='month') {// 月报
      var sMonth = mydate.getFullYear()+'-'+(mydate.getMonth()+1<10?'0'+(mydate.getMonth()+1):mydate.getMonth()+1)+'-'+'01';// 本月1号
      var nextMonth = mydate.getFullYear()+'-'+(mydate.getMonth()+2)+'-'+'01'+' 00:00:00:000';// 下个月1号
      var eMonth = dateInit(new Date(new Date(nextMonth).getTime()-1));// 本月最后一天
      $('#timeStart').val(sMonth);// 本月开始的时间
      $('#timeEnd').val(eMonth);// 本月结束的时间
    }else if(_id=='quarter') {// 季报
      var sQuarter='',eQuarter='';
      if(_month=='01' || _month=='02' || _month=='03') {// 第一季度
        sQuarter = mydate.getFullYear()+'-01-01';// 季度开始时间
        eQuarter = mydate.getFullYear()+'-03-31';// 季度结束时间
      }else if(_month=='04' || _month=='05' || _month=='06') {// 第二季度
        sQuarter = mydate.getFullYear()+'-04-01';// 季度开始时间
        eQuarter = mydate.getFullYear()+'-06-30';// 季度结束时间
      }else if(_month=='07' || _month=='08' || _month=='09') {// 第三季度
        sQuarter = mydate.getFullYear()+'-07-01';// 季度开始时间
        eQuarter = mydate.getFullYear()+'-09-30';// 季度结束时间
      }else if(_month=='10' || _month=='11' || _month=='12') {// 第四季度
        sQuarter = mydate.getFullYear()+'-10-01';// 季度开始时间
        eQuarter = mydate.getFullYear()+'-12-31';// 季度结束时间
      };
      $('#timeStart').val(sQuarter);// 季度开始时间
      $('#timeEnd').val(eQuarter);// 季度结束时间
    }else if(_id=='year') {// 年报
      var sYear=mydate.getFullYear()+'-01-01';// 年开始时间
      var eYear=mydate.getFullYear()+'-12-31';// 年结束时间
      $('#timeStart').val(sYear);// 年开始时间
      $('#timeEnd').val(eYear);// 年结束时间
    }else if(_id=='choose') {// 自选日期
      $('#timeStart').val(_mydate);
      $('#timeEnd').val(_mydate);
    }
  });
  $('#timeStart,#timeEnd').change(function(){// 改为自选日期
    $('#choose').prop('checked',true);
  })
  function dateInit(time) {// 处理时间戳
    var mydate=new Date(time);
    var _year = mydate.getFullYear();
    var _month = (mydate.getMonth()+1)<10?'0'+(mydate.getMonth()+1):mydate.getMonth()+1;
    var _date = mydate.getDate()<10?'0'+mydate.getDate():mydate.getDate();
    return _year+'-'+_month+'-'+_date;
  }


  var url = rooturl+'/api/count/getStatisticsData';  
  ///////点击查询
  $('.search').click(function(){
    initData();
  });
  function initData(){// 初始化页面
    // 遍历checkbox
    $('.filter input[type=checkbox]').each(function(){
      var name = $(this).attr('name');
      if($(this).prop('checked')){
        $(this).data('val','Y');
        $(`.tables[data-name=${name}]`).show();
      }else{
        $(this).data('val','N');
        $(`.tables[data-name=${name}]`).hide();
      };
    });
    var masterFlag = $('input[name=masterFlag]').data('val');// 母线参数值
    var voltageFlag = $('input[name=voltageFlag]').data('val');// 过电压保护器参数值
    var temperFlag = $('input[name=temperFlag]').data('val');// 温度采集器参数值
    var companyId = $('select[name=company]').val();// 公司Id参数值
    var monitorStationId = $('select[name=monitor]').val();// 监测站参数值
    var masterId = $('select[name=bus]').val();// 母线参数值
    var timeStart = $('#timeStart').val()+' 00:00:00:000';// 开始时间
    var timeEnd = $('#timeEnd').val()+' 23:59:59:000';// 结束时间
    if($('#timeStart').val()=='') timeStart = '';
    if($('#timeEnd').val()=='') timeEnd = '';
    var toData = {timeStart:timeStart,timeEnd:timeEnd,masterFlag:masterFlag,voltageFlag:voltageFlag,temperFlag:temperFlag,userId:sessionStorage.id,companyId:companyId,monitorStationId:monitorStationId,masterId:masterId,isDown:'N'};
    console.log(toData)
    // 下载地址
    var downloadUrl = url+'?token='+sessionStorage.token+'&timeStart='+timeStart+'&timeEnd='+timeEnd+'&masterFlag='+masterFlag+'&voltageFlag='+voltageFlag+'&temperFlag='+temperFlag+'&userId='+sessionStorage.id+'&companyId='+companyId+'&monitorStationId='+monitorStationId+'&masterId='+masterId+'&isDown=Y';
    $('#download').attr('href',downloadUrl);
    myAjax(url,toData,function(res){
      data=dealData(res.data);// 处理后的原数据
      console.log('data')
      console.log(data)
      draw(data);
    });
  }

  $('.sort i').click(function(e){// 点击箭头排序表格
    e.stopPropagation();
    var _t = $(this),className=_t.attr('class'),pTable=_t.parents('.mytable').data('table'),phase=_t.parents('th').hasClass('phase');
    var thType = _t.parents('th').data('type');// 排序的类别
    if(className=='up'){// 升序
      asc(data,pTable,thType,phase);
    }else{// 降序
      des(data,pTable,thType,phase);
    };
    $('.sort i').removeClass('active');
    $(this).addClass('active');
  });
  $('.sort').click(function(){// 点击表头排序
    var _t = $(this),_active = _t.find('i.active');// _active 当前的排序箭头
    // 如果_active存在，则触发另一个按钮
    // 如果不存在，则触发升序按钮
    if(_active.length>0){
      _active.siblings('i').click();
    }else{
      _t.find('i.up').click();
    }
  })
  function myAjax(url,data,callback){// ajax方法
    data.token=sessionStorage.token;
    $.ajax({
      url:url,
      data:data,
      type:'post',
      beforeSend:function(){
        $('.loading').show(0);
      },
      success:function(res){
        if(res.code == "9997" || res.code == "11002" || res.code == undefined){
          // window.parent.location.href=sessionStorage.menuTab=="admin"?'alogin.html':'login.html';
        };
        if(!sessionStorage.token || sessionStorage.token == '' || sessionStorage.token == undefined){
            window.parent.location.href=sessionStorage.menuTab=="admin"?'alogin.html':'login.html';
        };
        callback(res);
        var _h = $('html').height();/*编辑时同步iframe高度*/
        window.parent.$('#iframepage').css({'min-height':_h+30+'px'});
      },
      complete:function(){
        $('.loading').hide(0);
      }
    })
  }
  function asc(data,table,type,phase){// 升序
    // data 为原数据；table 为数据对象；type 为对应的排序列； phase 为是否有相位
    if(phase){// 相位排序
      data[table].sort(function(a,b){
        a = Math.max(...a.phase.map(x=>x[type]));
        b = Math.max(...b.phase.map(x=>x[type]));
        if(a>b) return 1;
        if(a<b) return -1;
        return 0;
      });
    }else{// 非相位排序
      data[table].sort(function(a,b){
        a = a[type];
        b = b[type];
        if(a>b) return 1;
        if(a<b) return -1;
        return 0;
      });
    };
    draw(data);// 描表
  }
  function des(data,table,type,phase){// 降序
    // data 为原数据；table 为数据对象；type 为对应的排序列； phase 为是否有相位
    if(phase){// 相位排序
      data[table].sort(function(a,b){
        a = Math.max(...a.phase.map(x=>x[type]));
        b = Math.max(...b.phase.map(x=>x[type]));
        if(a>b) return -1;
        if(a<b) return 1;
        return 0;
      });
    }else{// 非相位排序
      data[table].sort(function(a,b){
        a = a[type];
        b = b[type];
        if(a>b) return -1;
        if(a<b) return 1;
        return 0;
      });
    };
    draw(data);// 描表
  }
  function draw(data){// 描表
    var dataCopy = JSON.parse(JSON.stringify(data));// 克隆数据，避免改变原数组
    // 渲染母线表格
    var momTr='';
    if(dataCopy.maxValueEric.length>0){
      dataCopy.maxValueEric.forEach(x => {// 遍历生成对应的td结构
        x.phase.forEach((y,i) => {// 遍历母线下的相位数据
          var ts='';// 固定的表头
          switch(i){
            case 0:ts=`<td rowspan="3" class="name">${x.masterName}</td><td class="A">A相</td>`;break;
            case 1:ts=`<td class="B">B相</td>`;break;
            case 2:ts=`<td class="C">C相</td>`;break;
          };
          var td='';// 动态插入数据的td
          for(j in y) {// 循环phase数组，获取最大值
            if(y[j]==Math.max(...x.phase.map(z=>z[j])) && y[j]!=''){// 最大值
              y[j]=`<span class="max">${y[j]}</span>`;
            };
            td +=`<td data-type="${j}">${y[j]}</td>`;
          };
          if(i==0){
            momTr +=`<tr class="firstTr">${ts}${td}</tr>\n`;
          }else{
            momTr +=`<tr>${ts}${td}</tr>\n`;
          };
        });
      });
    }else{
      momTr =`<tr class="white"><td colspan="10">暂无数据</td></tr>\n`;
    }
    $('.momTable tbody').empty().append(momTr);
    // ./渲染母线表格

    // 渲染过电压保护器表格
    var gdyTr='';
    if(dataCopy.maxValueVoltage.length>0){
      dataCopy.maxValueVoltage.forEach(x => {// 遍历生成对应的td结构
        x.phase.forEach(y=>y.temper=y.temper.toFixed(2));// 避免渲染时倒序
        x.phase.forEach((y,i) => {// 遍历过电压保护器下的相位数据
          console.log('y')
          console.log(y)
          var ts='';// 固定的表头
          switch(i){
            case 0:ts=`<td rowspan="3" class="name">${x.pointName}</td><td class="A">A相</td>`;break;
            case 1:ts=`<td class="B">B相</td>`;break;
            case 2:ts=`<td class="C">C相</td>`;break;
          };
          var td='';// 动态插入数据的td
          for(j in y) {// 循环phase数组，获取最大值
            if(y[j]==Math.max(...x.phase.map(z=>z[j])) && y[j]!=''){// 最大值
              y[j]=`<span class="max">${y[j]}</span>`;
            };
            td +=`<td data-type="${j}">${y[j]}</td>`;
          };
          var firstTr = `<td rowspan="3">${x.electric}</td><td rowspan="3"></td><td rowspan="3"></td>`;// 第一行的数据 泄漏电流 动作次数 动作时长
          if(i==0){
            gdyTr +=`<tr class="firstTr">${ts}${td}${firstTr}</tr>\n`;
          }else{
            gdyTr +=`<tr>${ts}${td}</tr>\n`;
          };
        });
      });
    }else{
      gdyTr =`<tr class="white"><td colspan="7">暂无数据</td></tr>\n`;
    };
    $('.gdyTable tbody').empty().append(gdyTr);
    // ./渲染过电压保护器表格

    // 渲染温度采集器表格
    var wdTr='';
    if(dataCopy.maxValueTemper.length>0){
      dataCopy.maxValueTemper.forEach(x => {// 遍历新的数组
        wdTr += `<tr class="firstTr"><td class="name">${x.positionName.slice(0,-2)}</td><td class="A">A相</td><td>${x.a}</td><td class="B">B相</td><td>${x.b}</td><td class="C">C相</td><td>${x.c}</td></tr>`;
      });
    }else{
      wdTr =`<tr class="white"><td colspan="7">暂无数据</td></tr>\n`;
    };
    $('.wdTable tbody').empty().append(wdTr);
    // ./渲染温度采集器表格

    // 渲染报警统计表格
    $(`.bjTable tbody td[data-num]`).text(0);
    dataCopy.allCountByFaultType.forEach(x => {// 遍历生成对应的td结构
      $(`.bjTable tbody td[data-num=${x.fault_type}]`).text(x.cnt);
    });
    // ./渲染报警统计表格
  }
  function dealData(data){// 处理数据
    // 处理母线数据 maxValueEric
    data.maxValueEric= data.maxValueEric!=undefined?data.maxValueEric:[];
    data.maxValueEric.forEach((x,j) => {
      // 电压 voltage;电流 Electric;功率因数 Power_Factor;视在功率 Powerpparent;有功功率 Power_Use;无功功率 Power_Nouse;电压总畸变率 dyjb;电流总畸变率 dljb;
      var _a={voltage:'',Electric:'',Power_Factor:'',Power_Apparent:'',Power_Use:'',Power_Nouse:'',dyjb:'',dljb:''},// A相数据
      _b=JSON.parse(JSON.stringify(_a)),// B相数据
      _c=JSON.parse(JSON.stringify(_a));// C相数据
      for(var i in x){
        if(i.indexOf('_a')>-1) _a[i.slice(0,-2)]=x[i].toFixed(2);
        if(i.indexOf('_b')>-1) _b[i.slice(0,-2)]=x[i].toFixed(2);
        if(i.indexOf('_c')>-1) _c[i.slice(0,-2)]=x[i].toFixed(2);
      };
      var res=[];
      res.push(_a,_b,_c);
      x.phase=res;
    });
    // ./处理母线数据 maxValueEric

    // 处理过电压保护器数据 maxValueVoltage
    data.maxValueVoltage= data.maxValueVoltage!=undefined?data.maxValueVoltage:[];
    data.maxValueVoltage.forEach((x,j) => {
      // 温度 temper;湿度 humidity;
      var _a={temper:'',humidity:''},// A相数据
      _b=JSON.parse(JSON.stringify(_a)),// B相数据
      _c=JSON.parse(JSON.stringify(_a));// C相数据
      for(var i in x){
        if(i.indexOf('_a')>-1) _a[i.slice(0,-2)]=x[i].toFixed(2);
        if(i.indexOf('_b')>-1) _b[i.slice(0,-2)]=x[i].toFixed(2);
        if(i.indexOf('_c')>-1) _c[i.slice(0,-2)]=x[i].toFixed(2);
      };
      var res=[];
      res.push(_a,_b,_c);
      x.phase=res;
    });
    // ./处理过电压保护器数据 maxValueVoltage

    // 处理温度采集器数据 maxValueTemper
    data.maxValueTemper= data.maxValueTemper!=undefined?data.maxValueTemper:[];
    data.maxValueTemper.forEach((x,j) => {
      var n = x.positionName.slice(-2,-1).toUpperCase();
      switch(n){
        case 'A':x.a=(x.a).toFixed(2);x.b='';x.c='';break;
        case 'B':x.a='';x.b=(x.b).toFixed(2);x.c='';break;
        case 'C':x.a='';x.b='';x.c=(x.c).toFixed(2);break;
      };
    });
    // ./处理温度采集器数据 maxValueTemper

    // 处理报警统计数据 allCountByFaultType
    data.allCountByFaultType= data.allCountByFaultType!=undefined?data.allCountByFaultType:[];
    // ./处理报警统计数据 allCountByFaultType
    return data;
  }

  ////// 打印
  $('.print').click(function(){
    $('.allTable').print({mediaPrint: true,globalStyles: true});
  })
})
