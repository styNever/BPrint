/*******************
**Author :liuxianshi 
**CreateDate: 2018.11.30
**UpdateDate: 
**Current version 1.0
**Notes 当前版本可以实现网页界面配置化打印。主要是实现分页打印，动态生成表格。
**UpdateAuthor: 
**Version : 1.0 
**UpdateAuthor:
**Explain :
************************/

function PrintHtml(requestObj){


	var bprint={

		read:function(){
			bprint.printAjax()
		},

		requestSuccess:function(res){
			var config={};
			config.title=res.title;
			config.logoUrl=res.logoUrl;
			config.showPage = res.showPage;
			config.breakHasTitle=res.breakHasTitle;
            this.config= $.extend({},this.config,config);
			bprint.setDataSource(res.columnsDatas);
			bprint.print();
		},
		setDataSource:function(datas){

            $.each(datas,function (idx,data) {
                bprint.getTable({colums:data},bprint);
            });

        },

		printAjax:function(){
		    if (!requestObj||!requestObj.url){
		        return;
            }
			$.ajax({
  				url: requestObj.url||'',
                type: "POST",
                contentType: "application/json",
                data:requestObj.data||{},
                success:function(res){
                	bprint.requestSuccess(res);
                },
                error:function(res){
                	/*本插件暂时没有弹窗。所有请求异常都是控制台输出*/
                	console.log(res);
                }
			})
		},

		config:{
	 		'width': '1510px',//打印宽度
		    'heigth':'100%',//打印高度
		    'rowsHeight':'20',
		    'containerWidth':'1000px',
		    'style':'',
		    'title':'打印标题',//打印标题
		    'dataSource':{},//打印数据源
		    'printStr':'',
		    'styleFile':'',
		    'logoUrl':'',
		    'headLeft':'',
		    'headRight':'',
		    'lineBreak':'18',
		},

		getDate:function() {
			var dateData=new Date();
			return dateData.getFullYear()+"-"+dateData.getMonth()+"-"
			+dateData.getDate()+" "+dateData.getHours()+":"+dateData.getMinutes()
			+":"+dateData.getSeconds();
		},
		load:function(obj){
			this.config= $.extend({},this.config,obj);
			obj=obj||this.config;
			this.init(obj);
			return this;
		},
		
		init:function(obj){

            this.getTable(obj.dataSource,this);
		},
		
		getTopHtml:function(){
			
			var header='<!DOCTYPE html><html><head>'
			    +'<meta charset="UTF-8">'
			    +'<title>'+this.config.title+'</title>'
			    +'<link rel="stylesheet" type="text/css" href="'+this.currentPath()+'">'
			    +'<style type="text/css">'
			    +'  ' 
			    +'td,th{'       
			    +'   heigth:'+this.config.rowsHeight+'px;'
			    +'}'   
			    +'html, body .container{'       
			    +'   width:'+this.config.containerWidth+';'
			    +'}' 
			    +this.config.style
			    +'</style>'
				+'</head>'
				+'<body>'
			    +'<div class="container">';
			return header;
		},	

		getFootHtml:function(){		
			var foot=
				'</div><script>window.onload=function(){window.print();window.parent.printCallBack();}</script>'
				+'</body>'
			    +'</html>';
			return foot;   
		},

		getPage:function(){
		    if (this.config.showPage=='Y'){
                return '<div class="clearfix"><span class="right">'+this.totalPage+'</span></div>';
            }else {
		        return '';
            }
		},

		getLogo:function(){
		    if (!!this.config.logoUrl){
                return '<img src="'+this.config.logoUrl+'" alt="logo" class="logo">';
            }
			if (!this.config.headLeft) {
				return '<img src="'+this.config.logoUrl+'" alt="logo" class="logo">';
			}else{
				return this.config.headLeft;
			}
		},
		getPrintHead:function(){
		    if (this.config.breakHasTitle=='N'&&this.totalPage>1){
		        return '';
            }
			if (!this.config.headRight) {
				this.config.headRight='<span class="date">'+this.getDate()+'</span>'
	                 +'<span class="week"></span>';
			}
			var head=this.getPage()+'<div class="header clearfix text-center">'
	          +'<div class="left print-col-3 text-left">'
	          +this.getLogo()
	          +'</div>'
	          +'<div class="left print-col-3 font-30">'+this.config.title+'</div>'
	          +'<div class="left print-col-3">'
	          +this.config.headRight
	          +'</div>'
	          +'</div>';
	        return head;
		},
		getId:function(data){
			//设置id
			data.id=data.id||'';
			if (data.id!='') {
				return  ' id="'+data.id+'"';
			}
			return  '';
		},
		getClass:function(data){
			data.classStr=data.classStr||'';
			if (data.classStr!='') {
				return  ' class="'+data.classStr+'"';
			}
			return '';

		},
		getStyle:function(data){
			data.style=data.style||'';
			if (data.style!='') {
				return  ' style="'+data.style+'"';
			}
			return '';
		},
		getWidth:function(data){
			data.width=data.width||'';
			if (data.width!='') {
				return ' width="'+data.width+'"';
			}
			return '';

		},
		getHeight:function(data){
			data.heigth=data.heigth||'';
			if (data.heigth!='') {
				return ' heigth="'+data.heigth+'"';
			}
			return '';
		},
		getColspan:function(data){
	 		data.colspan=data.colspan||'';
			if (data.colspan!='') {
				return ' colspan="'+data.colspan+'"';
			}
			return '';
		},
		getRowspan:function(data){
	 		data.rowspan=data.rowspan||'';
			if (data.rowspan!='') {
				return ' rowspan="'+data.rowspan+'"';
			}
			return '';
		},
		getRowAttr:function(data,that){
			//获取元素属性
			var attr= that.getClass(data)+that.getId(data)
					 +that.getStyle(data)+that.getWidth(data)
					 +that.getHeight(data)+that.getColspan(data)+that.getRowspan(data);
			return attr;
		},
		getTableFirstLine:function(obj,row,that){
			var str='';
			if (!that.totalPage) {
				//初始化
				that.currentLines=0;
				that.totalPage=1;
				str=that.getPrintHead();
			}

			if (that.totalPage>1&&that.currentLines==0) {//出现分页
				str='<div style="page-break-before:always;"><br /></div>'+that.getPrintHead();
			}

			obj.tableAttr=obj.tableAttr||' border="1" style="width: 100%;" border-color="#333" cellpadding="1" cellspacing="0"';

			str+='<table '+obj.tableAttr+'><thead><tr>';
			$.each(row,function (idx,data) {						
				str=str+'<th'+that.getRowAttr(data,that)+'>'+data.value+'</th>'					
			})
			str+='</tr></thead><tbody>';
			
			that.currentLines=Number(that.currentLines)+1;

			return str;
		},
		getTable:function(obj,that){
			//生成table
			obj.maps=obj.maps||true;
			var str='';
			$.each(obj.colums,function (idx,row) {	
				if (idx==0||that.currentLines==0) {
					//生成th
					str=that.getTableFirstLine(obj,obj.colums[0],that);
					if (idx!=0) {
						str+='<tr>';
						$.each(row,function (idx,data) {
							str=str+'<td'+that.getRowAttr(data,that)+'>'+data.value+'</td>'
						})
						str+='</tr>';
						that.currentLines=Number(that.currentLines)+1
					}
				}else{
					//生成td
					str+='<tr>';
					$.each(row,function (idx,data) {
						str=str+'<td'+that.getRowAttr(data,that)+'>'+data.value+'</td>'
					})
					str+='</tr>';
					that.currentLines=Number(that.currentLines)+1;
                    if (that.config.breakHasTitle=='N'&&that.totalPage==1){
                        //不需要分页标题
                        if (that.currentLines>=(Number(that.config.lineBreak)-parseInt(50/Number(that.config.rowsHeight)))) {
                            str=str+'</tbody></table>';
                            that.config.printStr+=str;
                            that.currentLines=0;
                            that.totalPage=Number(that.totalPage)+1;
                            str='';
                        }
                    }else
					if (that.currentLines>=Number(that.config.lineBreak)) {
						str=str+'</tbody></table>';
						that.config.printStr+=str;
						that.currentLines=0;
						that.totalPage=Number(that.totalPage)+1;
						str='';
					}
				}
			})
			if (that.currentLines!=0&&that.currentLines<Number(that.config.lineBreak)) {
				str+='</tbody></table>';		
			}
			that.config.printStr+=str;
			str='';
		},

		generatHtml:function(){
			
		},

		print:function(){
			var html=this.getTopHtml()+this.config.printStr+this.getFootHtml();
			var frame=document.getElementById('printFrame');
			frame.contentDocument.write(html);
			frame.contentDocument.close();
		},

		currentPath:function(){

			if (!this.config.styleFile) {
				var jss = document.scripts;
				for(var i=0;i<jss.length;i++){
					var path=jss[i].src;
					var name=path.substring(path.lastIndexOf("/")+1);
					if ('print.js'==name) {
						this.config.styleFile=path.substring(0,path.lastIndexOf("/"))+"/css/bprint.css";
						break;
					}
				}
			}
			
			return this.config.styleFile;
		},
		destory:function(obj){
			obj=null;
		},
		printCallBack:function(){

		}


	}

	if (!!requestObj){
	    bprint.read();
    }

	return bprint;		
}
function printCallBack(){

}

