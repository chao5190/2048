//index.js
//获取应用实例
var app = getApp()
//用于启动游戏的方法
var config={
  data:{
    disable:false,
    gameList:['2048']
  },
  onload:function(){
    var that=this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  },
  onReady:function(){
    //页面渲染完成
  },
  onShow:function(){
    //页面展示
  },
  onHide:function(){
    //页面隐藏
  },
  onUnload:function(){
    //页面关闭
  }
};
//设置属性名"startName"到相应游戏页面的映射
config.data.gameList.forEach(function(v){
  config['start'+v]=function(){
    config.data.disable=true;
    //这里需要注意每个游戏文件夹名称需要和js名称保持一致
    wx.navigateTo({
      url: '../'+v+'/'+v
    })
  }
});
Page(config);

