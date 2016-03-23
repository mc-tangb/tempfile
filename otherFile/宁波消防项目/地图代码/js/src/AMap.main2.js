var McMap = new Function();
(function(){
	//拓展API
	!function(){
		AMap.Marker.prototype.setData = function(data){
			this.jsonData = data;
		};
		AMap.Marker.prototype.getData = function(data){
			return this.jsonData;
		};
		String.prototype.trim = function(){
			 return this.replace(/(^\s*)|(\s*$)/g,""); 
		}
	}();
	/*
		地图上点对象的封装
		参数:
			map:当前的高德地图对象
			pointArr：点数组
			images: {"error":"../images/warn.png","correct":"../images/pic1.png"}
		方法:
			draw:
			hide:
			show:
			getMarkers:
			onclick:

	*/
	function DrawMarker(map,pointArr,images){
		this._init(map,pointArr,images);
	}
	DrawMarker.prototype = {
		/*
			_init:初始化方法
		*/
		_init:function(map,pointArr,images){
			this.__map__ = map;
			this.__pointArr__ = pointArr;
			this.__images__ = images;
			this.__markers__ = [];
			//this._drawMap();
		},
		/*
			_draw:描点
		*/
		_draw:function(){
			for(var i=0;i<this.__pointArr__.length;i++){
				var marker = new AMap.Marker({
				    icon: this.__pointArr__[i]["MainStatus"] == 0 ? this.__images__.error : this.__images__.correct,
				    position: [this.__pointArr__[i]["Longitude"], this.__pointArr__[i]["Latitude"]]
				});
				marker.setMap(this.__map__);
				marker.setData(this.__pointArr__[i]);
				this.__markers__.push(marker);
			}
		},
		/*
			_onclick:点击事件
		*/
		_onclick:function(func){
			this.__markers__.forEach(function(marker){
				marker.on("click",function(e){
					typeof func === "function"?func(e):"";
				})
			});
		},
		_hide:function(){
			this.__markers__.forEach(function(marker){
				marker.hide();
			});
		},
		_show:function(){
			this.__markers__.forEach(function(marker){
				marker.show();
			});
		},
		draw:function(){
			this._draw();
		},
		getMap:function(){
			return this.__map__;
		},
		hide:function(){
			this._hide();
		},
		show:function(){
			this._show();
		},
		getMarkers:function(){
			return this.__markers__;
		},
		onclick:function(func){
			this._onclick(func);
		}
	}
	McMap.DrawMarker = DrawMarker;

	/*
	API 说明：
		功能:画区域
		参数:
			map:当前地图对象,
			objectArr:对象数组数组
			plyOption:参考PolygonOptions；
		方法: 
			draw:画区域 (相当于初始化方法，一定要有)
			hide:隐藏画过的区域
			show:显示画过的区域
			getPolygons:返回画过的区域的Polygon对象的数组
			onclick:区块的点击事件(传入回调函数,参数为当前对象)
	*/
	function DrawPolygon(map,objectArr,plyOption){
		this._init(map,objectArr,plyOption);
	}
	DrawPolygon.prototype = {
		_init:function(map,objectArr,plyOption){
			this.__map__ = map;
			this.__pointArr__ = objectArr; //放置点数组
			(typeof(objectArr[0].data) == "object")?"":this.__pointArr__= this._parseData(objectArr);//如果pointArr[0]不是数组则解析
			this.__plyOption__ = plyOption;
			this.__plyArr__ =  new Array();//用于放置polygon对象
		},
		_parseData:function(objectArr){
			for(var j=0;j<objectArr.length;j++){
				var tmp = objectArr[j].data.split(";");
				var pointArr = [];
				for(var i=0;i<tmp.length;i++){
					if(tmp[i].trim() == "" || tmp == null)continue;
					var t = tmp[i].split(",");
					pointArr.push(t);
				}
				objectArr[j].data = pointArr;
			}
			return objectArr;
		},
		_draw:function(){
			for(var i=0;i<this.__pointArr__.length;i++){
				var  polygon = new AMap.Polygon(this.__plyOption__);
				polygon.setPath(this.__pointArr__[i].data);
				this.__plyArr__.push(polygon);
				polygon.setMap(this.__map__);
				var center = this.__pointArr__[i].center;
				var tmpArr = center.split(",");
				var marker = new AMap.Marker({ //添加自定义点标记
					map: map,
					position: [tmpArr[0],tmpArr[1]], //基点位置
					offset: new AMap.Pixel(-20, -20), //相对于基点的偏移位置
					draggable: true,  //是否可拖动
					icon:new AMap.Icon({image:""}),
					content: '<div class="custom-content-label">'+this.__pointArr__[i].name+'</div>'   //自定义点标记覆盖物内容
				});
				this.__plyArr__.push(polygon);
				this.__plyArr__.push(marker);
			}
		},
		draw:function(){
			this._draw();
		},
		hide:function(){
			for(var i=0;i<this.__plyArr__.length;i++){
				this.__plyArr__[i].hide();
			}
		},
		show:function(){
			for(var i=0;i<this.__plyArr__.length;i++){
				this.__plyArr__[i].show();
			}
		},
		getPolygons:function(){
			return this.__plyArr__;
		},
		onclick:function(func){
			this.__plyArr__.forEach(function(ply){
				ply.on("click",function(e){
					typeof func === "function"?func(e):"";
				})
			});
		}
	}
	McMap.DrawPolygon = DrawPolygon;
}());