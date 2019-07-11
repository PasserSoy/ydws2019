layer.config({
  skin: 'layui-layer-molv'
})

var data = {
  page: 1,
  rows: $('#pagechange').val()
};
var callB = false; // 增加、删除的异步操作
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
    rows: mypagec
  });
});

function queryData(data) {
  var allCount=0;// 是否有数据
  POST("/api/feedAndQuests/queryFeedback.v1", data, function (res) {
    if (res.code == '0') {
      var allnum = res.data.count;
      allCount=allnum;// 是否有数据
      if(res.data.list.length<=0) allCount=0;
      var page = Math.ceil(allnum / $('#pagechange').val());
      $('.numtotal').text(page);
      $('.numtotalpp').text(allnum);
      var dataList = res.data.list;
      $('#tbody').empty();
      var dataList = res.data.list;
      var html = '';
      for (var i = 0; i < dataList.length; i++) {
        var isReply_flag = '未回复';
        if (dataList[i].replyAccount) {
          isReply_flag = "已回复";
        }
        if (!dataList[i].mobileOremail) {
          dataList[i].mobileOremail = '-';
        }
        if (!dataList[i].reply) {
          dataList[i].reply = '-';
        }
        var serial = (parseInt($(".nowpage").text()) - 1) * parseInt($('#pagechange').val()) + parseInt(i) + parseInt(1);
        html += '<tr>' +
          '<td>' + serial + '</td>' +
          '<td> ' + dataList[i].mobileOremail + '</a></td>' +
          '<td >' + dataList[i].content + '</td>' +
          '<td >' + dataList[i].reply + '</td>' +
          //                            '<td class="text-l displayPart" displayLength="90" >'+ '<a onClick='+'Guestbook_view(this) '+ ' dataUserName = '+dataList[i].userName+ ' dataMobile = '+dataList[i].mobile+ ' dataContent = '+dataList[i].content+ ' dataCreateTime = '+dataList[i].createTime+'>'+dataList[i].reply+'</a></td>'+
          '<td >' + dataList[i].createTime + '</td>' +
          '<td class="td-manage ">' +
          '<a onClick=' + 'member_del(this,"1")' + ' dataId="' + dataList[i].id + '" href="javascript:;" title="删除" id="delete" >删除</a>&nbsp;' +
          '&nbsp;&nbsp;&nbsp;&nbsp;<a onClick=' + 'Industry_edit(this,"550")' + ' dataid="' + dataList[i].id + '" dataIsReply="' + dataList[i].isRepl + '" dataIsReply_flag="' + dataList[i].isReply_flag + '"  href="javascript:;" title="回复" id="edit" >' +
          isReply_flag + '</a> &nbsp;&nbsp;' +
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
    }; // if 后面的括号
    if(allCount==0){// 没有数据
      $('#noTableData').show();$('#Member_Ratings').hide();
    }else{
      $('#noTableData').hide();$('#Member_Ratings').show();
    };
  }, function () {
    $('.loadjy').addClass('op');
  }, function () {
    $('.loadjy').removeClass('op');
    callB = true;
  }, true); // post 后面的括号
} // function 后面的括号

// 组织查询
function manageQueryData(nowpage) {
  data = {
    page: nowpage,
    rows: $('#pagechange').val()
  };
  queryData(data);
}

function Industry_edit(obj, id) {
  $('#reply').text('');
  var dataid = $(obj).attr('dataid');
  layer.open({
    type: 1,
    closeBtn: 1,
    title: '意见反馈',
    // shadeClose:false, //点击遮罩关闭层
    offset: ['40px'],
    area: ['300px'],
    content: $('#add_menber_style'),
    btn: ['取消', '发送'],
    yes: function (index) {
      layer.close(index); //如果设定了yes回调，需进行手工关闭
    },
    btn2: function (index) {
      var reply = $('#reply').val();
      data = {
        feedbackId: dataid,
        reply: reply
      };
      nowpage = $('.nowpage').text();
      addOrUpdateFeedback(data, nowpage);
      layer.close(index);
      // 弹框关闭刷新页面
      // manageQueryData(nowpage);
    }
  });
}

// 编辑的引用
function addOrUpdateFeedback(data, nowpage) {
  callB = false;
  POST("/api/feedAndQuests/addOrUpdateFeedback.v1", data, function (res) {
    manageQueryData(nowpage);
    var s = setInterval(x => {
      if (callB == true) {
        if (res.code == '0') {
          layer.alert('回复成功！', { title: '提示框', icon: 1},function(){
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

/*留言查看*/
function Guestbook_view(obj) {
  var userName = $(obj).attr('dataUserName');
  var mobile = $(obj).attr('dataMobile');
  var createTime = $(obj).attr('dataCreateTime');
  var content = $(obj).attr('dataContent');

  $("#userName").text(userName);
  $("#mobile").text(mobile);
  $("#createTime").text(createTime);
  $("#content").text(content);

  var index = layer.open({
    type: 1,
    closeBtn: 1,
    title: '详细信息',
    // maxmin: true,
    // shadeClose:false,
    offset: ['40px'],
    area: ['400px'],
    content: $('#Guestbook'),
    btn: ['关闭'],
  })
};

/*用户-删除*/
function member_del(obj, id) {
  var dataid = $(obj).attr("dataId");
  var data = {
    feedBackIds: dataid
  };
  layer.open({
    title: "提示",
    content: '确认要删除吗？',
    offset: ['40px'],
    area: ['350px'],
    btn: ['取消', '确认'],
    yes: function (index) {
      layer.close(index); //如果设定了yes回调，需进行手工关闭
    },
    btn2: function (index) {
      nowpage = $('.nowpage').text();
      // $(obj).parents("tr").remove();
      nowpage = $('#tbody tr').length <= 1 ? nowpage - 1 : nowpage;
      feedAndQuests_del_Info(data, nowpage)
      layer.close(index);
      $(".nowpage").text(parseInt(nowpage));
      // manageQueryData(nowpage);// 组织条件查询
    }
  });
}

//删除信息:被引用
function feedAndQuests_del_Info(data, nowpage) {
  callB = false;
  POST("/api/feedAndQuests/deleteFeedback.v1", data, function (res) {
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