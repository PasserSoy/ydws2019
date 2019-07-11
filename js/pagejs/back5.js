layer.config({
  skin: 'layui-layer-molv'
})


var linesOnMasterId = getPropetyVal('linesOnMasterId');
if (linesOnMasterId) {
  sessionStorage.linesOnMasterId = linesOnMasterId;
}
const breadmomline = decodeURI(getPropetyVal('breadmomline'));
if (breadmomline && breadmomline!='null') {
  sessionStorage.breadmomline = breadmomline;
};
$('[data-bread=company]').text(sessionStorage.companyName);
$('[data-bread=station]').text(sessionStorage.breadstation);
$('[data-bread=momline]').text(sessionStorage.breadmomline);

$('.back_to_lineOnmaster').on('click', function () {
  if(sessionStorage.back5){
    window.parent.$("#iframepage").attr("src", 'myIndex.html?v=1.6.22');
  }else{
    window.parent.$("#iframepage").attr("src", 'back4_LinesOnMaster.html?v=1.6.22');
  };
})
$('.back_to_MonitorStation').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back3_2_MonitorStation.html?v=1.6.22');
})
$('.company_info').on('click', function () {
  window.parent.$("#iframepage").attr("src", 'back2_company.html?v=1.6.22');
})


var mobile = '';
var isActive = '';
var callB = false; // 增加、删除的异步操作

var branchName_find = $("#branchName_find").val();
var data = {
  page: 1,
  rows: $('#pagechange').val(),
  linesOnMasterId: sessionStorage.linesOnMasterId,
  companyId: sessionStorage.companyId,
  branchName: branchName_find,
  flag: 'Y'
};
queryData(data);

$('#pagechange').on('change',function(){
  const totalpage = $('.numtotalpp').text()*1,// 总条数
        curpage = $('.nowpage').text()*1,// 当前页
        mypagec = $(this).val();// 每页数
  const respage = Math.ceil(totalpage/mypagec);// 切换后的总页数
  $('.numtotal').text(respage);
  // 总页数 = Math.ceil(总条数/每页数)
  // 当总页数 < 当前页时，将当前页设置为最后一页
  if(curpage!=1 &&　respage<curpage){
    $('.nowpage').text(respage);
  };
  queryData({
    page: $('.nowpage').text(),
    rows: mypagec,
    linesOnMasterId: sessionStorage.linesOnMasterId,
    companyId: sessionStorage.companyId,
    branchName: branchName_find,
    flag: 'Y'
  });
});
// <!--  branchName  branchAddress preBranchId  memberInfo monitorPoints  -->
function queryData(data) {
  var allCount=0;// 是否有数据
  POST("/sys/linesOnBranch/queryLinesOnBranch.v1", data, function (res) {
    if (res.code == '0') {
      sessionStorage.selectData=JSON.stringify(res.data.list);// 表格数据存入缓存中
      var allnum = res.data.count;
      allCount=allnum;// 是否有数据
      if(res.data.list.length<=0) allCount=0;
      var page = Math.ceil(allnum / $('#pagechange').val());
      $('.numtotal').text(page);
      $('.numtotalpp').text(allnum);
      var list = res.data.list;
      $('#tbody').empty();
      $('.ui_input_txt01').attr('max', page);
      $('.ui_input_txt01').val($(".nowpage").text());
      var html = '';
      for (var i = 0; i < list.length; i++) { //<!--  stationName  stationAddress longitudeAndlatitude  companyDto 母线条数 支线条数  监测设备数 -->
        var pointSize = '';
        var userName = '';
        var memberId = '';
        var cabin_no = '';
        var branchType = '';
        var sensorNumber = '';
        if (list[i].monitorPointDtos) {
          pointSize = list[i].monitorPointDtos.length;
        }
        if (list[i].memberInfoDto) {
          userName = list[i].memberInfoDto.userName;
          memberId = list[i].memberInfoDto.id;
        }
        // if (!list[i].longitudeAndlatitude) {
        //     list[i].longitudeAndlatitude = '';
        // } 
        if (!list[i].branchName) {
          list[i].branchName = '-';
        }
        // if (!list[i].branchAddress) {
        //     list[i].branchAddress = '';
        // }
        if (!list[i].cabin_no) {
          list[i].cabin_no = '-';
        }
        if (!list[i].branchType) {
          list[i].branchType = '-';
        }
        var serial = (parseInt($(".nowpage").text()) - 1) * parseInt($('#pagechange').val()) + parseInt(i) + parseInt(1);
        var branchname = ''; //支线类型
        // var pointDom = ''; //监测设备
        var pointDom = `<a href="back6_MonitorPoint.html?v=1.6.22&linesOnBranchId=${list[i].id}&breadbranch=${encodeURI(list[i].branchName)}">${pointSize}</a>`; //监测设备
        if (list[i].branchType == 1) {
          branchname = '进线柜';
          // pointDom = `<a href="back6_MonitorPoint.html?v=1.6.22&linesOnBranchId=${list[i].id}">${pointSize}</a>`;
        } else if (list[i].branchType == 2) {
          branchname = 'PT柜';
          // pointDom = '-';
        } else if (list[i].branchType == 3) {
          branchname = '出线柜';
          // pointDom = `<a href="back6_MonitorPoint.html?v=1.6.22&linesOnBranchId=${list[i].id}">${pointSize}</a>`;
        } else if (list[i].branchType == 4) {
          branchname = '联络柜';
          // pointDom = `<a href="back6_MonitorPoint.html?v=1.6.22&linesOnBranchId=${list[i].id}">${pointSize}</a>`;
        } else if (list[i].branchType == 5) {
          branchname = '提升柜';
          // pointDom = '-';
        }
        if (!list[i].sensorNumber) {
          list[i].sensorNumber = '-';
        }
        html += '<tr>' +
          '<td>' + serial + '</td>' +
          '<td>' + list[i].branchName + '</td>' +
          // '<td>'+list[i].branchAddress+'</td>'+
          // '<td>'+list[i].longitudeAndlatitude+'</td>'+
          '<td>' + list[i].cabin_no + '</td>' +
          '<td>' + branchname + '</td>' +
          '<td>' + list[i].sensorNumber + '</td>' +
          '<td>' + pointDom + '</td>' +
          // '<td><a href="back6_MonitorPoint.html?linesOnBranchId='+list[i].id+'">'+pointSize+'</a></td>'+
          //                            '<td><a href="back6_MonitorPoint.html">'+list[i].monitorPointDtos.length+'</a></td>'+
          // '<td>' + userName + '</td>' + /*list[i].monitorPointDtos.length*/
          '<td class="td-manage">' +
          '<a onClick=' + 'member_edit(this,"550")' + ' dataId="' + list[i].id + '" dataBranchName="' + list[i].branchName + '"  dataBranchAddress="' + list[i].branchAddress +
          '"  dataLongitudeAndlatitude="' + list[i].longitudeAndlatitude + '"  dataCabin_no="' + list[i].cabin_no + '"  dataBranchType="' + list[i].branchType + '"  dataSensorNumber="' + list[i].sensorNumber + '"  href="javascript:;" title="编辑" id="edit">' +
          '编辑</a>&nbsp;&nbsp;' +
          '<a onClick=' + 'member_del(this,"1")' + ' dataid="' + list[i].id + '" href="javascript:;" title="删除" id="delete">删除</a>&nbsp;&nbsp;' +
          '<a onClick=' + 'SyncTopol(this,"1")' + ' dataId="' + list[i].id + '" href="javascript:;" title="同步" id="delete" >同步</a>' +
          '</td>' +
          '</tr>';
      }
      $('#tbody').append(html);

      if ($('.numtotal').text() == '1') {
        $('.beforPage').css({
          background: '#ccc',
          cursor: 'default'
        })
        $('.laterPage').css({
          background: '#ccc',
          cursor: 'default'
        })
      } else {
        if ($('.nowpage').text() == '1') {
          $('.beforPage').css({
            background: '#ccc',
            cursor: 'default'
          })
          $('.laterPage').css({
            background: '#2494f9',
            cursor: 'pointer'
          })
        } else if ($('.nowpage').text() == $('.numtotal').text()) {
          $('.beforPage').css({
            background: '#2494f9',
            cursor: 'pointer'
          })
          $('.laterPage').css({
            background: '#ccc',
            cursor: 'default'
          })
        } else {
          $('.beforPage').css({
            background: '#2494f9',
            cursor: 'pointer'
          })
          $('.laterPage').css({
            background: '#2494f9',
            cursor: 'pointer'
          })
        }
      }
      // 实时预览
      onceline(res);
    };
    if(allCount==0){// 是否有数据
      $('#noTableData').show();$('.table_menu_list,.live-preview').hide();
    }else{
      $('#noTableData').hide();$('.table_menu_list,.live-preview').show();
    };
  }, function () {
    $('.loadjy').addClass('op');
  }, function () {
    $('.loadjy').removeClass('op');
    callB = true;
  }, true);

}

// 组织查询
function manageQueryData(nowpage) {
  branchName_find = $("#branchName_find").val();
  data = {
    page: nowpage,
    rows: $('#pagechange').val(),
    linesOnMasterId: sessionStorage.linesOnMasterId,
    companyId: sessionStorage.companyId,
    branchName: branchName_find,
    flag: 'Y'
  };
  queryData(data);
}



function initMemberList() {
  var data = {
    companyId: sessionStorage.companyId
  };
  POST("/api/member/queryMembers.v1", data, function (res) {
    if (res.code == '0') {
      $('select[name="memberInfoId"]').empty();
      var resultList = res.data.list;
      var selected_dataName = '<option  id="memberInfoId_selected" value="">请选择巡检员</option>';
      for (var i = 0; i < resultList.length; i++) {
        selected_dataName += '<option  value="' + resultList[i].id + '">' + resultList[i].userName + '</option>';
      }
      $('select[name="memberInfoId"]').append(selected_dataName);
    }
  });
}

/*用户-添加*/
$('#member_add').on('click', function () {
  initMemberList();
  $("#branchName").val('');
  $("#branchAddress").val('');
  $("#longitudeAndlatitude").val('');
  $("#memberInfoId_selected").prop("selected", 'selected');

  // 新增：
  $("#cabin_no_selected").prop("selected", 'selected');
  $("#branchType_no_selected").prop("selected", 'selected');
  $("#sensorNumber_no_selected").prop("selected", 'selected');
  $("#type_selected").prop("selected", 'selected');
  $("input[type = 'checkbox']:checkbox").attr("checked", false);
  sessionStorage.removeItem('branchType');

  layer.open({
    type: 1,
    closeBtn: 1,
    title: '添加支线',
    // maxmin: true,
    // shadeClose: true, //点击遮罩关闭层
    offset: ['40px'],
    area: ['400px'],
    content: $('#add_menber_style'),
    btn: ['提交', '取消'],
    yes: function (index, layero) {
      var branchName_add = $('#branchName').val();
      var branchAddress_add = $('#branchAddress').val();
      var longitudeAndlatitude_add = $('#longitudeAndlatitude').val();
      var memberInfoId_add = $('select[name="memberInfoId"]').val();


      var cabin_no_add = $('select[name="cabin_no"]').val();
      var branchType_no_add = $('select[name="branchType"]').val();
      var sensorNumber_no_add = $('select[name="sensorNumber"]').val();
      var type_add = $('select[name="type"]').val();

      if (!branchName_add) {
        layer.msg("请填写支线名称！");$('#branchName').focus(); return;
      };
      if (!cabin_no_add) {
        layer.msg("请选择排序柜号！"); return;
      };
      if (!branchType_no_add) {
        layer.msg("请选择支线类型！"); return;
      };
      if (!sensorNumber_no_add) {
        layer.msg("请选择CT绕组数！"); return;
      };

      var data = {
        cabin_no: cabin_no_add,
        branchType: branchType_no_add,
        sensorNumber: sensorNumber_no_add,
        type: type_add,

        branchName: branchName_add,
        branchAddress: branchAddress_add,
        longitudeAndlatitude: longitudeAndlatitude_add,
        memberInfoId: memberInfoId_add,
        linesOnMasterId: sessionStorage.linesOnMasterId
      };
      $('.nowpage').text('1');
      addOrUpdateLinesOnBranch(data, 1);
      // layer.close(index);
      // manageQueryData(1);

    }
  });
});

//保存
function addOrUpdateLinesOnBranch(data, nowpage) {
  callB = false;
  POST("/sys/linesOnBranch/addOrUpdateLinesOnBranch.v1", data, function (res) {
    manageQueryData(nowpage); // 组织条件查询
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
          console.log(res)
          layer.alert('成功！', { title: '提示框', icon: 1},function(){
            layer.closeAll();
          });
        } else {
          layer.msg(res.msg);
        };
        clearInterval(s);
      };
    }, 1);
  }, function () {
    $('.loadjy').addClass('op');
  }, '', true);
}

// 同步一次接线图到终端// 没用到此方法
function addOrUpdateSyncTopol(data) {
  POST("/eric/syncTopol.v1", data, function (res) {
    if (res.code == '0') {
      console.log("同步成功")
    }
  });
}



/*用户-编辑*/
function member_edit(obj, id) {
  initMemberList();
  $("#branchName").val('');
  $("#branchAddress").val('');
  $("#longitudeAndlatitude").val('');
  $("#memberInfoId_selected").prop("selected", 'selected');

  var linesOnBranchId = $(obj).attr('dataId');
  var dataBranchName = $(obj).attr('dataBranchName');
  var dataBranchAddress = $(obj).attr('dataBranchAddress');
  var dataLongitudeAndlatitude = $(obj).attr('dataLongitudeAndlatitude');
  var dataMemberInfoId = $(obj).attr('dataMemberInfoId');
  var dataCabin_no = $(obj).attr('dataCabin_no');
  var dataBranchType = $(obj).attr('dataBranchType');
  var dataSensorNumber = $(obj).attr('dataSensorNumber');
  // console.log(obj)
  /*存储支线类型*/
  sessionStorage.branchType = dataBranchType;

  $('select[name="cabin_no"]').val(dataCabin_no)
  $('select[name="branchType"]').val(dataBranchType)
  $('select[name="sensorNumber"]').val(dataSensorNumber)
  $("#branchName").val(dataBranchName);
  $("#branchAddress").val(dataBranchAddress);
  $("#longitudeAndlatitude").val(dataLongitudeAndlatitude);
  layer.open({
    type: 1,
    closeBtn: 1,
    title: '编辑支线',
    // maxmin: true,
    // shadeClose:false, //点击遮罩关闭层
    offset: ['40px'],
    area: ['400px'],
    content: $('#add_menber_style'),
    btn: ['提交', '取消'],
    yes: function (index, layero) {
      var branchName_add = $('#branchName').val();
      var branchAddress_add = $('#branchAddress').val();
      var longitudeAndlatitude_add = $('#longitudeAndlatitude').val();
      var memberInfoId_add = $('select[name="memberInfoId"]').val();
      var cabin_no_add = $('select[name="cabin_no"]').val();
      var branchType_no_add = $('select[name="branchType"]').val();
      var sensorNumber_no_add = $('select[name="sensorNumber"]').val();
      var type_add = $('select[name="type"]').val();

      if (!branchName_add) {
        layer.msg("请填写支线名称！");$('#branchName').focus(); return;
      };
      if (!cabin_no_add) {
        layer.msg("请选择排序柜号！"); return;
      };
      if (!branchType_no_add) {
        layer.msg("请选择支线类型！"); return;
      };
      if (!sensorNumber_no_add) {
        layer.msg("请选择CT绕组数！"); return;
      };
      var data = {
        cabin_no: cabin_no_add,
        branchType: branchType_no_add,
        sensorNumber: sensorNumber_no_add,
        type: type_add,

        linesOnBranchId: linesOnBranchId,
        branchName: branchName_add,
        branchAddress: branchAddress_add,
        longitudeAndlatitude: longitudeAndlatitude_add,
        memberInfoId: memberInfoId_add,
        linesOnMasterId: sessionStorage.linesOnMasterId
      };
      nowpage = $('.nowpage').text();
      addOrUpdateLinesOnBranch(data, nowpage);
      // layer.close(index);
      // manageQueryData(nowpage);
    }
  });
}


//保存
function SyncTopol(obj) {
  var linesOnBranchId = $(obj).attr('dataId');
  var data_ = {
    linesOnBranchId: linesOnBranchId
  };
  POST("/sys/linesOnBranch/SyncTopol.v1", data_, function (res) {
    console.log("res:" + res)
    if (res.code == '0') {
      layer.msg('同步成功！');
    }else{
      layer.msg(res.msg);
    };
  });
}

/*用户-删除*/
function member_del(obj, id) {
  var dataid = $(obj).attr("dataId");
  var data = {
    linesOnBranchIds: dataid
  };
  layer.open({
    title: "提示",
    content: '删除此支线，包含的监测设备将一起删除，确定要继续？',
    offset: ['40px'],
    area: ['350px'],
    btn: ['取消', '确认'],
    yes: function (index) {
      layer.close(index); //如果设定了yes回调，需进行手工关闭
    },
    btn2: function (index) {
      nowpage = $('.nowpage').text();
      nowpage = $('#tbody tr').length <= 1 ? nowpage - 1 : nowpage;
      linesOnBranch_del_Info(data, nowpage)
      // $(obj).parents("tr").remove();
      layer.close(index);
      $(".nowpage").text(parseInt(nowpage));
      // manageQueryData(nowpage);// 组织条件查询
    }
  });
}

//删除信息:被引用
function linesOnBranch_del_Info(data,nowpage) {
  callB = false;
  POST("/sys/linesOnBranch/deleteLinesOnBranch.v1", data, function (res) {
    manageQueryData(nowpage); // 组织条件查询
    // console.log(res)
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
          layer.msg('已删除!');
        } else {
          layer.msg(res.msg);
        };
        clearInterval(s);
      };
    }, 1);
  }, function () {
    $('.loadjy').addClass('op');
  }, '', true);
}
$(function () {
  /*进线柜、PT柜、联络柜、提升柜 唯一性*/
  $('body').on('mouseenter', 'select[name=branchType]', function () {
    $('select[name=branchType] option').removeAttr('disabled');
    var branchTypeValue = sessionStorage.branchType;
    var list = JSON.parse(sessionStorage.selectData);
    console.log('list')
    console.log(list)
    list.forEach(x => {
      if (x.branchType == '1') {
        $('select[name=branchType] option[value=1]').attr('disabled', true);
      };
      if (x.branchType == '2') {
        $('select[name=branchType] option[value=2]').attr('disabled', true);
      };
      if (x.branchType == '4') {
        $('select[name=branchType] option[value=4]').attr('disabled', true);
      };
      if (x.branchType == '5') {
        $('select[name=branchType] option[value=5]').attr('disabled', true);
      };
      $('select[name=branchType] option[value=' + branchTypeValue + ']').removeAttr('disabled'); /*默认时为可选*/
    });
  });
})



/**一次接线图 */
var onceline = function (res) {
  /**一次接线图 */
  $('.live-preview').empty();
  var list = res.data.list; /**获取结果列表 */
  if (list.length > 0) {
    /**渲染支线结构 */
    var contact; /**联络柜 */
    var ascension; /**提升柜 */
    var inark; /**进线柜 */
    var ptark; /**PT柜 */
    var outark; /**出线柜 */
    list.forEach(x => {
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
      if (x.branchType == '1') {
        // console.log('这是进线柜');
        inark = `
        <!-- 进线柜 -->
        <li class="entry" data-val="${x.cabin_no}" data-link="${_id}">
          <div class="equip">
            <i class="busbar"></i> <i class="upc"></i> <i class="swi"></i> <i class="downc"></i>
            <div class="tool">
              <!-- 传感器 -->` +
          oncesensor(x.sensorNumber) +
          `<i class="jx"><i class="sen"></i></i>
            </div>
            <i class="uparrow"></i>
          </div>
          <div class="table"><p class="configname">${x.branchName}</p></div>
        </li>`;
      } else if (x.branchType == '2') {
        // console.log('这是PT柜');
        ptark = `
        <!-- PT柜 -->
        <li class="pt" data-val="${x.cabin_no}" data-link="${_id}">
          <div class="equip">
            <i class="pt"></i>
            <p class="ptname">ERIC-STOM<br>用电安全防御装置</p>
          </div>
          <div class="table"><p class="configname">${x.branchName}</p></div>
        </li>`;
      } else if (x.branchType == '3') {
        // console.log('这是出线柜');
        outark += `
        <!-- 出线柜 -->
        <li class="transformer" data-val="${x.cabin_no}" data-link="${_id}">
          <div class="equip">
            <i class="busbar"></i> <i class="upc"></i> <i class="swi"></i> <i class="downc"></i>
            <div class="tool">
              <!-- 传感器 -->` +
          oncesensor(x.sensorNumber) +
          `<i class="cg"><i class="sen"></i></i>
            </div>
            <i class="downarrow"></i>
            <i class="sensor"></i>
          </div>
          <div class="table"><p class="configname">${x.branchName}</p></div>
        </li>`;
      } else if (x.branchType == '4') {
        // console.log('这是联络柜');
        contact = `
        <!-- 联络柜 -->
        <li class="contact" data-link="${_id}">
          <div class="equip">
            <i class="busbar"></i> <i class="upc"></i> <i class="swi"></i> <i class="downc"></i>
            <div class="tool">
                <!-- 传感器 -->` +
          oncesensor(x.sensorNumber) +
          `<i class="jx"><i class="sen"></i></i>
            </div>
          </div>
          <div class="table"><p class="configname">${x.branchName}</p></div>
        </li>`;
      } else if (x.branchType == '5') {
        // console.log('这是提升柜');
        ascension = `
        <!-- 提升柜 -->
        <li class="ascension" data-link="${_id}">
          <div class="equip">
          <i class="busbar"></i> <i class="upc"></i> <i class="swi swi1"></i> <i class="downc"></i>
            <div class="tool">
              <i class="ts"></i>
            </div>
          </div>
          <div class="table"><p class="configname">${x.branchName}</p></div>
        </li>`;
      }
    });
    /**进线柜、PT、出线柜排序 */
    var sortark = `${inark}${ptark}${outark}`;
    $('ul.hide').empty().append(sortark);
    var _li = $('ul.hide li[data-val]').get();
    _li.sort(function (a, b) {
      var a = $(a).data('val');
      var b = $(b).data('val');
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    });
    $('ul.hide').empty().append(_li);
    // console.log(sortark)
    sortark = $('ul.hide').html();
    /**./进线柜、PT、出线柜排序 */
    var momData = list[0].linesOnMasterDto; //母线数据
    var content = `<div class="momline ` +
      oncehitchType(momData.hitchType) +
      `"><h3 class="tit"><span class="kv">${momData.hitchType} KV</span><span class="linename">${momData.masterName}</span><div class="linep"></div></h3>
      <ul class="config"> ${ascension} ${sortark} ${contact} </ul>
    </div>`;
    $('.live-preview').append(content);
    $('ul.hide').empty(); /**清空临时ul */

    /**./渲染支线结构 */
  }
}
/**一次接线图传感器次数 */
function oncesensor(x) {
  switch (x) {
    case '0':
      return `<ul class="relay"></ul>`;
      break;
    case '3':
      return `<ul class="relay"><li><i></i><i></i><i></i></li></ul>`;
      break;
    case '4':
      return `<ul class="relay even"><li><i></i><i></i></li><li><i></i><i></i></li></ul>`;
      break;
    case '6-1':
      return `<ul class="relay"><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li></ul>`;
      break;
    case '6-2':
      return `<ul class="relay even"><li><i></i><i></i></li><li><i></i><i></i></li><li><i></i><i></i></li></ul>`;
      break;
    case '9':
      return `<ul class="relay"><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li></ul>`;
      break;
    case '12':
      return `<ul class="relay"><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li><li><i></i><i></i><i></i></li></ul>`;
      break;
    default:
      return `<ul class="relay"></ul>`;
  }
}
/**一次接线图母线电压等级 */
function oncehitchType(x) {
  switch (x) {
    case '6':
      return `kv6`;
      break;
    case '35':
      return `kv35`;
      break;
    default:
      return `kv10`;
      break;
  }
}