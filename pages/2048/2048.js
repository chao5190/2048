// pages/2048/2048.js
//整个游戏的加载
var app=getApp();
var Grid=require('./grid.js');
var Tile=require('./tile.js');
var GameManager=require('./game_manager.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
  grids:[],
  over:false,
  win:false,
  score:0,
  highscore:0,
  overMsg:'游戏结束'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.GameManager=new GameManager(4);
    this.setData({
      grids:this.GameManager.setup(),
      highscore:wx.getStorageSync('highscore')||0
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that=this;
    //页面渲染完毕取消加载
    that.setData({
      hidden:true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },
  //更新视图数据
  updateView:function(data){
    if(data.over){
      data.overMsg='游戏结束';
    }
    if(data.win){
      data.overMsg="恭喜"
    }
    this.setData(data);
  },
  restart:function(){
    this.updateView({
      grids:this.GameManager.restart(),
      over:false,
      won:false,
      score:0
    });
  },
  touchStartClinetX:0,
  touchStartClientY:0,
  touchEndClientX:0,
  touchEndClientY:0,
  isMultipe:false,//多手指操作，设为false，不许多手指操作

  touchStart:function(events){
    this.isMultipe=events.touches.length>1;
    if(this.isMultipe){
      return;
    }
    var touch=events.touches[0];
    this.touchStartClinetX=touch.clientX;
    this.touchStartClientY=touch.clientY;
  },
  touchMove:function(events){
    var touch=events.touches[0];
    this.touchEndClientX=touch.clientX;
    this.touchEndClientY=touch.clientY;
  },
  touchEnd:function(events){
      if(this.isMultipe){
        return;
      }
      var dx=this.touchEndClientX-this.touchStartClinetX;
      var absDx=Math.abs(dx);
      var dy=this.touchEndClientY-this.touchStartClientY;
      var absDy=Math.abs(dy);
      if(Math.max(absDx,absDy)>10){
        var direction=absDx>absDy?(dx>0?1:3):(dy>0?2:0);
        var data=this.GameManager.move(direction)||{
          grids:this.data.grids,
          over:this.data.over,
          won:this.data.won,
          score:this.data.score
        };
        var highscore=wx.getStorageSync('highscore')||0;
        if(data.score>highscore){
          wx.setStorageSync('highscore', data.score);
        }
        this.updateView({
          grids:data.grids,
          over:data.over,
          won:data.won,
          score:data.score,
          highscore:Math.max(highscore,data.score)
        });
      }
  }
  }
)
