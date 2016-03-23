/*
	高德地图API的封装
	author:美创科技 By tangbin
*/
(function(){
	var McMap;
	!McMap && (McMap = new Function());
	//拓展API
	!function(){
		AMap.Marker.prototype.setData = function(data){
			this.jsonData = data;
		};
		AMap.Marker.prototype.getData = function(){
			return this.jsonData;
		};
		AMap.Marker.prototype.setStatus = function(data){
			this.myStatus = data;
		};
		AMap.Marker.prototype.getStatus = function(){
			return this.myStatus;
		};
		AMap.Polygon.prototype.setData = function(data){
			this.jsonData = data;
		};
		AMap.Polygon.prototype.getData = function(){
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
		    for (var i = 0; i < this.__pointArr__.length; i++) {
		        var iconpath = '';
		        if (this.__pointArr__[i]["MainStatus"] == 0) {
		            if (this.__pointArr__[i]["MType"] != 3) {
		                iconpath = this.__images__.correct;
		            } else if (this.__pointArr__[i]["MType"] == 3) {
		                iconpath = '/content/images/dianqi_red_icon.png';
		            }
		        } else {
		            if (this.__pointArr__[i]["MType"] != 3) {
		                iconpath = this.__images__.error;
		            } else if (this.__pointArr__[i]["MType"] == 3) {
		                iconpath = '/content/images/dianqi_icon_green.png';
		            }
		        }
			    var marker = new AMap.Marker({
			        icon: iconpath,//this.__pointArr__[i]["MainStatus"] == 0?(this.__images__.error):this.__images__.correct,
					position: [this.__pointArr__[i]["Longitude"], this.__pointArr__[i]["Latitude"]]
				});
				if (this.__pointArr__[i]["MainStatus"] == 0){
					marker.setStatus(false);
				}else{
					marker.setStatus(true);
				}
				marker.setMap(this.__map__);
				marker.setData(this.__pointArr__[i]);
				this.__markers__.push(marker);
			}
		},
		/*
			_onevent:事件
		*/
		_onevent:function(type,func){
			this.__markers__.forEach(function(marker){
				marker.on(type,function(e){
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
		_setOffset:function(p){ //解决点的偏移问题
			var pixel = new AMap.Pixel(p.x,p.y);
			this.__markers__.forEach(function(marker){
				marker.setOffset(pixel);
			});
		},
		draw:function(){
			this._draw();
		},
		getMap:function(){
			return this.__map__;
		},
		setOffset:function(p){
			this._setOffset(p);
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
			this._onevent("click",func);
		},
		onmouseover:function(func){
			this._onevent("mouseover",func);
		}
	}
	McMap.DrawMarker = DrawMarker;
	/*
		功能:实现大量点的显示
		参数:
			map:当前的高德地图对象；
			data:传入的数据,json格式为:[{"lnglat":[lng,lat],status:"0 or 1",name:"xxx",id:"xxx","other":xxx},]其中"lnglat":[lng,lat]和status为必需
			image:{"error":"../images/warn.png","correct":"../images/pic1.png"}
			size:图片大小 new AMap.Size(16,18);
			anchor:图片偏移量new AMap.Size(16,18);
	*/
	function BdMarker(map,data,image,size,anchor){
		this._init(map,data,image,size,anchor);
	}
	BdMarker.prototype = {
		_init:function(map,data,image,size,anchor){
			this.__map__ = map;
			this.__data__ = this._parseData(data);
			this.__image__ = image;
			this.__massArr__ = [];
			this.__size__ = size || new AMap.Size(16,18);
			this.__anchor__ = anchor || new AMap.Size(3,7);
		},
		_parseData:function(data){
			var reArr = [],
				errorArr = [],
				rightArr = [];
			for(var i=0;i<data.length;i++){
				if(data[i].status === 0 || data[i].status === "0"){
					errorArr.push(data[i]);
				}else{
					rightArr.push(data[i]);
				}
			}
			reArr.push(errorArr);
			reArr.push(rightArr);
			return reArr;
		},
		_draw:function(){
			var that = this;
			this.__data__.forEach(function(data){
				if(!data || (typeof data !== "object") || (data.constructor !== Array)){
					return;
				}
				var mass = new AMap.MassMarks(data, {
				  url:(data[0]["status"]==0 || data[0]["status"]=="0")?that.__image__["error"]:that.__image__["correct"],
				  anchor: new AMap.Pixel(3, 7),
				  size: new AMap.Size(16, 18),
				  opacity:1,
				  cursor:'pointer',
				  zIndex:999
				});
				mass.setMap(that.__map__);
				that.__massArr__.push(mass);
			})
		},
		_show:function(){
			this.__massArr__.forEach(function(mass){
				if(typeof mass === "function"){
					return ;
				};
				mass.show();
			});
		},
		_hide:function(){
			this.__massArr__.forEach(function(mass){
				if(typeof mass === "function"){
					return ;
				};
				mass.hide();
			});
		},
		_onevent:function(type,func){
			this.__massArr__.forEach(function(mass){
				if(typeof mass === "function"){
					return ;
				};
				mass.on(type,function(e){
					func(e.data);
				});
			});
		},
		draw:function(){
			this._draw();
		},
		hide:function(){
			this._hide();
		},
		show:function(){
			this._show();
		},
		onclick:function(func){
			this._onevent("click",func);
		},
		onmouseover:function(func){
			this._onevent("mouseover",func);
		}
	}
	McMap.BdMarker = BdMarker
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
			(typeof (objectArr[0].Latiandlongi) == "object") ? "" : this.__pointArr__ = this._parseData(objectArr);//如果pointArr[0]不是数组则解析
			this.__plyOption__ = plyOption;
			this.__plyArr__ =  new Array();//用于放置polygon对象
			this.__label__ = new Array();//用于放置标签
		},
		_parseData:function(objectArr){
			for(var j=0;j<objectArr.length;j++){
			    var tmp = objectArr[j].Latiandlongi.split(";");
				var pointArr = [];
				for(var i=0;i<tmp.length;i++){
					if(tmp[i].trim() == "" || tmp == null)continue;
					var t = tmp[i].split(",");
					pointArr.push(t);
				}
				objectArr[j].Latiandlongi = pointArr;
			}
			return objectArr;
		},
		_draw:function(){
			for(var i=0;i<this.__pointArr__.length;i++){
				var  polygon = new AMap.Polygon(this.__plyOption__);
				polygon.setPath(this.__pointArr__[i].Latiandlongi);
				polygon.setData(this.__pointArr__[i]);
				polygon.setMap(this.__map__);
				var center = this.__pointArr__[i].Center;
				var tmpArr = center.split(",");
				var marker = new AMap.Marker({ //添加自定义点标记
					map: map,
					position: [tmpArr[0],tmpArr[1]], //基点位置
					offset: new AMap.Pixel(0, 0), //相对于基点的偏移位置
					draggable: false,  //是否可拖动
					icon:new AMap.Icon({image:""}),
					content: '<div class="custom-content-label">'+this.__pointArr__[i].Name+'</div>'   //自定义点标记覆盖物内容
				});
				this.__plyArr__.push(polygon);
				this.__label__.push(marker);
			}
		},
		_onevent:function(type,func){
			this.__plyArr__.forEach(function(ply){
				ply.on(type,function(e){
					typeof func === "function"?func(e):"";
				})
			});
		},
		draw:function(){
			this._draw();
		},
		hide:function(){
			for(var i=0;i<this.__plyArr__.length;i++){
				this.__plyArr__[i].hide();
			}
			for(var i=0;i<this.__plyArr__.length;i++){
				this.__label__[i].hide();
			}
		},
		show:function(){
			for(var i=0;i<this.__plyArr__.length;i++){
				this.__plyArr__[i].show();
			}
			for(var i=0;i<this.__plyArr__.length;i++){
				this.__label__[i].show();
			}
		},
		getPolygons:function(){
			return this.__plyArr__;
		},
		getLabel:function(){
			return this.__label__;
		},
		onclick:function(func){
			this._onevent("click",func);
		},
		onrightclick:function(func){
			this._onevent("rightclick",func);
		},
		onmouseover:function(func){
			this._onevent("mouseover",func);
		},
		onmouseout:function(func){
			this._onevent("mouseout",func);
		}
	}
	McMap.DrawPolygon = DrawPolygon;
	
	/*
		手动画矩形API
		参数:map ,当前地图对象
		方法:
			start:开始绘制
			end:结束绘制(对象数组会被清空);
			getObj:得到绘制对象数组
			getStatus:检测getObj中是否有值
	*/
	function DrawPolygonHand(map){
		this._init(map);
	}
	DrawPolygonHand.prototype = {
		_init:function(map){
			this.__returnObj__ = new Array();
			this.__mouseTool__ = new Object();
			this.__status__ = false;
			var that = this;
			map.plugin(["AMap.MouseTool"],function(){
				var mouseTool = new AMap.MouseTool(map);
				that.__mouseTool__ = mouseTool;
				AMap.event.addListener(mouseTool,'draw',function(obj){
					that.__returnObj__.push(obj.target); //返回画完成的对象
					that.__status__ = true;
				})
			});
		},
		_start:function(polygonOption){
			this.__mouseTool__.polygon(polygonOption);
		},
		_end:function(){
			this.__mouseTool__.close();
		},
		start:function(polygonOption){
			this._start(polygonOption);
		},
		end:function(){
			this._end();
			this.__returnObj__ = [];
		},
		getObj:function(){
			return this.__returnObj__;
		},
		getStatus:function(){
			return this.__status__;
		}
	}
	McMap.DrawPolygonHand = DrawPolygonHand;
	
	/*
		手动画矩形API
		参数:map ,当前地图对象
			target:要编辑的对象
		方法:
			start:开始绘制
			end:结束绘制;
			getObj:得到修改后的对象
	*/
	function EditPolygon(map,target){
		this._init(map,target);
	}
	EditPolygon.prototype = {
		_init:function(map,target){
			this.__polygonEditer__ = new Object();
			this.__returnObj__ = new Object();
			var that = this;
			map.plugin(["AMap.PolyEditor"],function(){
				var polygonEditer = new AMap.PolyEditor(map,target);
				that.__polygonEditer__ = polygonEditer;
				AMap.event.addListener(polygonEditer,'end',function(obj){
					that.__returnObj__ = obj.target;
				});
			});
		},
		_start:function(){
			this.__polygonEditer__.open();
		},
		_end:function(){
			this.__polygonEditer__.close();
		},
		start:function(){
			this._start();
		},
		end:function(){
			this._end();
		},
		getObj:function(){
			return this.__returnObj__;
		}
	}	
	McMap.EditPolygon = EditPolygon;
	
	/*
		程序功能说明:
			以某个点为圆心，搜索1公里内有问题的点，如果没有将圈放大到5公里
		参数:
			map:当前地图对象， （必须）
			markers:点集        (必须)
			point:目标点的位置   （必须）
			circleOption: 配置项
			boundary:{ //搜索范围
				low: 1000, //米
				top:5000
			}
	*/
	function SearchCircle(map,markers,point,circleOption,boundary){
		this._init(map,markers,point,circleOption,boundary);
	}
	SearchCircle.prototype = {
		_init:function(map,markers,point,circleOption,boundary){
			this.__map__ = map;
			this.__markers__ = markers;
			this.__point__ = point;
			this.__option__ = circleOption || {
				strokeColor: "#F33", //线颜色
				strokeOpacity: 1, //线透明度
				strokeWeight: 3, //线粗细度
				fillColor: "#ee2200", //填充颜色
				fillOpacity: 0.35//填充透明度
			};
			this.__boundary__ = boundary || undefined;
			(typeof boundary === "undefined") && (this.__boundary__ = {'low':1000,'top':5000});
			this.__option__.center = this.__point__;
			this.__option__.radius = this.__boundary__.low;
			this.__option__.map = this.__map__;
			this.__contains__ = [];
			this._preprocess();
		},
		_draw:function(){
			var circle = new AMap.Circle(this.__option__);
			this.__circle__ = circle;
		},
		_contains:function(){
			var that = this;
			this.__markers__.forEach(function(marker,index){
				var flag = that.__circle__.contains(marker.getPosition());
				if(falg){
					if(!marker.getStatus()){
						that.__contains__.push(marker);
					}
				}
			});
			return that.__contains__.length;
		},
		_preprocess:function(){
			this.__markers__.forEach(function(marker){
				marker.hide();
			});
			this._draw();
			this._contains();
		},
		getCirlce:function(){
			return this.__circle__;
		},
		setCenter:function(point){
			this.getCirlce().setCenter(point);
			this.__contains__ = [];
		},
		setRadius:function(radius){
			this.getCircle().setRadius(radius);
			this.__contains__ = [];
		},
		show:function(){
			this.getCirlce().show();
		},
		hide:function(){
			this.getCirlce().hide();
		},
		getContainsMarkers:function(){
			return this.__contains__;
		},
		showContainsMarkers:function(){
			this.getContainsMarkers().forEach(function(marker,index){
				marker.show();
			});
		},
		hideContainsMarkers:function(){
			this.getContainsMarkers().forEach(function(marker,index){
				marker.hide();
			});
		}
	};
	McMap.SearchCircle = SearchCircle;
	window.McMap = McMap;
}());
