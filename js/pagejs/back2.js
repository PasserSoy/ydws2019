layer.config({
  skin: 'layui-layer-molv'
})
var callB = false; // 增加、删除的异步操作
var companyName = $("#companyName_find").val();
var data = {
  page: 1,
  rows: $('#pagechange').val(),
  createBy: sessionStorage.id,
  companyName: companyName
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
    createBy: sessionStorage.id,
    companyName: companyName
  });
});

function queryData(data) {
  var allCount=0;// 是否有数据
  POST("/sys/company/queryCompany.v1", data, function (res) {
    if (res.code == '0') {
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
      for (var i = 0; i < list.length; i++) { // back19_MemberInfoOldSoldierDetails.html?id='+dataList[i].id
        if (!list[i].companyName) {
          list[i].companyName = '-'
        }
        if (!list[i].companyNameShort) {
          list[i].companyNameShort = '-'
        }
        if (!list[i].companyAddress) {
          list[i].companyAddress = '-'
        }
        if (!list[i].industry) {
          list[i].industry = '-'
        }
        if (!list[i].businessType) {
          list[i].businessType = '-'
        }
        if (!list[i].companySize) {
          list[i].companySize = '-'
        }
        if (!list[i].mainProducts) {
          list[i].mainProducts = '-'
        }
        var serial = (parseInt($(".nowpage").text()) - 1) * parseInt($('#pagechange').val()) + parseInt(i) + parseInt(1);
        html += '<tr>' +
          '<td>' + serial + '</td>' +
          '<td><a href="back3_2_MonitorStation.html?v=1.6.22&companyId=' + list[i].id + '&companyName=' + encodeURI(list[i].companyName) + '">' + list[i].companyName + '</a></td>' +
          '<td>' + list[i].companyNameShort + '</td>' +
          '<td>' + list[i].companyAddress + '</td>' +
          '<td>' + list[i].industry + '</td>' +
          '<td>' + list[i].businessType + '</td>' +
          '<td>' + list[i].companySize + '</td>' +
          '<td>' + list[i].monitorPointCount + '</td>' +
          '<td>' + list[i].mainProducts + '</td>' +
          '<td>' + list[i].createTime.substring(0, 10) + '</td>' +
          '<td class="td-manage">' +
          '<a onClick=' + 'member_edit(this,"550")' + ' dataId="' + list[i].id + '" dataCompanyName="' + list[i].companyName + '" dataCompanyNameShort="' + list[i].companyNameShort +
          '" dataCompanyAddress="' + list[i].companyAddress + '" dataIndustry="' + list[i].industry + '" dataBusinessType="' + list[i].businessType +
          '" dataCompanySize="' + list[i].companySize + '" dataMainProducts="' + list[i].mainProducts +
          '"  href="javascript:;" title="编辑" id="edit" >' +
          '编辑</a>&nbsp;&nbsp;' +
          '<a onClick=' + 'member_del(this,"1")' + ' dataid="' + list[i].id + '" href="javascript:;" title="删除" id="delete" data-name="' + list[i].companyName + '">删除</a>' +
          //                            '<a onClick='+''+' dataid = '+list[i].id +' href="javascript:;" title="同步" id="Synchronization"  class="btn btn-xs btn-primary"><i class="icon-setting bigger-120">同步</i></a>'+
          '</td>' +
          '</tr>';
      }
      $('#tbody').append(html);

      // console.log($('.numtotal').text())
      // console.log($('.nowpage').text())
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
    };
    if(allCount==0){// 是否有数据
      $('#noTableData').show();$('.table_menu_list').hide();
    }else{
      $('#noTableData').hide();$('.table_menu_list').show();
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
  companyName = $("#companyName_find").val();
  data = {
    page: nowpage,
    rows: $('#pagechange').val(),
    createBy: sessionStorage.id,
    companyName: companyName
  };
  queryData(data);
}

/*用户-添加*/
$('#member_add').on('click', function () {
  $("#companyName").val('');
  $("#companyNameShort").val('');
  $("#companyAddress").val('');
  $("#industry").val('');
  $("#businessType").val('');
  $("#companySize").val('');
  $("#mainProducts").val('');
  layer.open({
    type: 1,
    closeBtn: 1,
    title: '添加公司',
    // maxmin: true,
    // shadeClose: true, //点击遮罩关闭层
    offset: ['40px'],
    area: ['450px'],
    content: $('#add_menber_style'),
    btn: ['提交', '取消'],
    yes: function (index, layero) {
      var num = 0;
      var str = "";
      $(".add_menber input[type$='text']").each(function (n) {
        if ($(this).val() == "") {
          layer.msg(str += "" + $(this).attr("name") + "不能为空！");
          num++;
          return false;
        }
      });
      if (num > 0) {
        return false;
      } else {
        var companyName_add = $('#companyName').val();
        var companyNameShort_add = $('#companyNameShort').val();
        var companyAddress_add = $('#companyAddress').val();
        var industry_add = $('#industry').val();
        var businessType_add = $('#businessType').val();
        var companySize_add = $('#companySize').val();
        var mainProducts_add = $('#mainProducts').val();

        if (!companyName_add) {
          layer.msg("请填写公司全称！");$('#companyName').focus(); return;
        };
        if (!companyNameShort_add) {
          layer.msg("请填写公司简称！");$('#companyNameShort').focus(); return;
        };
        if (!companyAddress_add) {
          layer.msg("请填写公司地址！");$('#companyAddress').focus(); return;
        };
        if (!industry_add) {
          layer.msg("请填写公司所属行业！");$('#industry').focus(); return;
        };
        if (!businessType_add) {
          layer.msg("请填写公司性质！");$('#businessType').focus(); return;
        };
        if (!companySize_add) {
          layer.msg("请填写公司规模！");$('#companySize').focus(); return;
        };
        if (!mainProducts_add) {
          layer.msg("请填写公司主要产品以及产能！");$('#mainProducts').focus(); return;
        };

        var data = {
          companyName: companyName_add,
          companyNameShort: companyNameShort_add,
          companyAddress: companyAddress_add,
          industry: industry_add,
          businessType: businessType_add,
          companySize: companySize_add,
          mainProducts: mainProducts_add
        };
        $('.nowpage').text('1');
        addOrUpdateCompany(data, 1);
        // layer.close(index);
        // manageQueryData(1);
      }
    }
  });
});

/*用户-编辑*/
function member_edit(obj, id) {
  $("#companyName").val('');
  $("#companyNameShort").val('');
  $("#companyAddress").val('');
  $("#industry").val('');
  $("#businessType").val('');
  $("#companySize").val('');
  $("#mainProducts").val('');

  var companyId = $(obj).attr('dataId');
  var dataCompanyName = $(obj).attr('dataCompanyName');
  var dataCompanyNameShort = $(obj).attr('dataCompanyNameShort');
  var dataCompanyAddress = $(obj).attr('dataCompanyAddress');
  var dataIndustry = $(obj).attr('dataIndustry');
  var dataBusinessType = $(obj).attr('dataBusinessType');
  var dataCompanySize = $(obj).attr('dataCompanySize');
  var dataMainProducts = $(obj).attr('dataMainProducts');

  $("#companyName").val(dataCompanyName);
  $("#companyNameShort").val(dataCompanyNameShort);
  $("#companyAddress").val(dataCompanyAddress);
  $("#industry").val(dataIndustry);
  $("#businessType").val(dataBusinessType);
  $("#companySize").val(dataCompanySize);
  $("#mainProducts").val(dataMainProducts);
  layer.open({
    type: 1,
    closeBtn: 1,
    title: '编辑公司',
    // shadeClose:false, //点击遮罩关闭层
    offset: ['40px'],
    area: ['450px'],
    content: $('#add_menber_style'),
    btn: ['提交', '取消'],
    yes: function (index, layero) {
      var companyName_edit = $('#companyName').val();
      var companyNameShort_edit = $('#companyNameShort').val();
      var companyAddress_edit = $('#companyAddress').val();
      var industry_edit = $('#industry').val();
      var businessType_edit = $('#businessType').val();
      var companySize_edit = $('#companySize').val();
      var mainProducts_edit = $('#mainProducts').val();

      
      if (!companyName_edit) {
        layer.msg("请填写公司全称！");$('#companyName').focus(); return;
      };
      if (!companyNameShort_edit) {
        layer.msg("请填写公司简称！");$('#companyNameShort').focus(); return;
      };
      if (!companyAddress_edit) {
        layer.msg("请填写公司地址！");$('#companyAddress').focus(); return;
      };
      if (!industry_edit) {
        layer.msg("请填写公司所属行业！");$('#industry').focus(); return;
      };
      if (!businessType_edit) {
        layer.msg("请填写公司性质！");$('#businessType').focus(); return;
      };
      if (!companySize_edit) {
        layer.msg("请填写公司规模！");$('#companySize').focus(); return;
      };
      if (!mainProducts_edit) {
        layer.msg("请填写公司主要产品以及产能！");$('#mainProducts').focus(); return;
      };

      var data = {
        companyId: companyId,
        companyName: companyName_edit,
        companyNameShort: companyNameShort_edit,
        companyAddress: companyAddress_edit,
        industry: industry_edit,
        businessType: businessType_edit,
        companySize: companySize_edit,
        mainProducts: mainProducts_edit
      };
      nowpage = $('.nowpage').text();
      addOrUpdateCompany(data, nowpage);
      // layer.close(index);
      // manageQueryData(nowpage);

    }
  });
}

/*用户-删除*/
function member_del(obj, id) {
  var _n = $(obj).data('name');
  var cont = `<p>删除此公司,包含的监测设备将一起删除,</p>
      <p>输入"${_n}"后删除!</p>
      <input type="text" class="confirmint" />`;
  var dataid = $(obj).attr("dataid");
  var data = {
    companyIds: dataid
  };
  layer.open({
    title: "提示",
    // content: '删除此公司,包含的监测设备将一起删除,确定要继续吗？',
    content: cont,
    offset: ['40px'],
    area: ['350px'],
    btn: ['取消', '确认'],
    yes: function (index) {
      layer.close(index); //如果设定了yes回调，需进行手工关闭
    },
    btn2: function (index) {
      if ($('.confirmint').val() == _n) {
        nowpage = $('.nowpage').text();
        nowpage = $('#tbody tr').length <= 1 ? nowpage - 1 : nowpage;
        company_del_Info(data, nowpage);
        // $(obj).parents("tr").remove();
        layer.close(index);
        $(".nowpage").text(parseInt(nowpage));
        // manageQueryData(nowpage);// 组织条件查询
      } else {
        layer.msg('删除失败!');
      }
    }
  });
}

// 功能函数  公司保存
function addOrUpdateCompany(data, nowpage) {
  callB = false;
  POST("/sys/company/addOrUpdateCompany.v1", data, function (res) {
    manageQueryData(nowpage); // 组织条件查询
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
          console.log(res)
          layer.alert('成功！', { title: '提示框', icon: 1, offset: ['50px'] },function(){
            layer.closeAll();
          });
        } else {
          layer.msg(res.msg);
        };
        clearInterval(s);
      }
    }, 1);
  }, function () {
    $('.loadjy').addClass('op');
  }, '', true);
}

//公司信息
function company_del_Info(data, nowpage) {
  callB = false;
  POST("/sys/company/deleteCompany.v1", data, function (res) {
    manageQueryData(nowpage); // 组织条件查询
    // console.log(res)
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
          layer.msg('已删除!');
        } else {
          layer.msg(res.msg);
        }
        clearInterval(s);
      }
    }, 1);
  }, function () {
    $('.loadjy').addClass('op');
  }, '', true);
}

// $('.btn_search').click(function () {
//   nowpage = $('.nowpage').text();
//   manageQueryData(nowpage);
// })