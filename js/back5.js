/**一次接线图 */
var onceline = function (res){
  /**一次接线图 */
  $('.live-preview').empty();
  var list = res.data.list;/**获取结果列表 */
  if(list.length>0){
    /**渲染支线结构 */
    var contact;/**联络柜 */
    var ascension;/**提升柜 */
    var inark;/**进线柜 */
    var ptark;/**PT柜 */
    var outark;/**出线柜 */
    list.forEach(x=>{
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
        inark = `
        <!-- 进线柜 -->
        <li class="entry" data-val="${x.cabin_no}" data-link="${_id}">
          <div class="equip">
            <i class="busbar"></i> <i class="upc"></i> <i class="swi"></i> <i class="downc"></i>
            <div class="tool">
              <!-- 传感器 -->`+
              oncesensor(x.sensorNumber)
              +`<i class="jx"><i class="sen"></i></i>
            </div>
            <i class="uparrow"></i>
          </div>
          <div class="table"><p class="configname">${x.branchName}</p></div>
        </li>`;
      }else if(x.branchType=='2'){
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
      }else if(x.branchType=='3'){
        // console.log('这是出线柜');
        outark += `
        <!-- 出线柜 -->
        <li class="transformer" data-val="${x.cabin_no}" data-link="${_id}">
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
          <div class="table"><p class="configname">${x.branchName}</p></div>
        </li>`;
      }else if(x.branchType=='4'){
        // console.log('这是联络柜');
        contact = `
        <!-- 联络柜 -->
        <li class="contact" data-link="${_id}">
          <div class="equip">
            <i class="busbar"></i> <i class="upc"></i> <i class="swi"></i> <i class="downc"></i>
            <div class="tool">
                <!-- 传感器 -->`+
                oncesensor(x.sensorNumber)
                +`<i class="jx"><i class="sen"></i></i>
            </div>
          </div>
          <div class="table"><p class="configname">${x.branchName}</p></div>
        </li>`;
      }else if(x.branchType=='5'){
        // console.log('这是提升柜');
        ascension =`
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
    var momData = list[0].linesOnMasterDto;//母线数据
    var content = `<div class="momline `+
    oncehitchType(momData.hitchType)
    +`"><h3 class="tit"><span class="kv">${momData.hitchType} KV</span><span class="linename">${momData.masterName}</span><div class="linep"></div></h3>
      <ul class="config"> ${ascension} ${sortark} ${contact} </ul>
    </div>`;
    $('.live-preview').append(content);
    $('ul.hide').empty();/**清空临时ul */
    
    /**./渲染支线结构 */
  }
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