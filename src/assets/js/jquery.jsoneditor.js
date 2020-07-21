/*
 * Json Editor plugin for jQuery
 *
 * Licensed under the Apache License:
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * $Date: 2010-5-10 $
 * $Author: Jadesoul $
 * (Home Page: http://jadesoul.org , Blog: http://www.jadesoul.org)
 */


$.fn.jsoneditor = function(cmd, options) {
	if (cmd=='init') {
		
		if (options) {
			$.extend($.jsoneditor.options, options);
			
		} else {
			if ($(this).children('div.je-node').length!=0) return;

			if ($(this).children('textarea').length==1) {
				try{
					var json=$.evalJSON($(this).children('textarea:first').val());
					$.jsoneditor.options.data=json;
				} catch(e) {}
			
			} else if ($(this).children('div.je-node').length==0) {
				try{
					json=$.evalJSON($(this).html());
					$.jsoneditor.options.data=json;
				} catch(e) {}
			}
		}

		$(this).html($.jsoneditor.initUI($.jsoneditor.options));
	} else if (cmd=='input') {
		if ($(this).children('div.je-node').length==0) return;
		var json=$.jsoneditor.dumpNode($(this).children('div.je-node:first'));
		$.jsoneditor.options.data=json;
		$(this).html('<textarea style="width:95%; height:500px">'+$.toJSON(json)+'</textarea>');
	} else if (cmd=='dump') {
		if ($(this).children('div.je-node').length==0) return;
		var json=$.jsoneditor.dumpNode($(this).children('div.je-node:first'));
		$.jsoneditor.options.data=json;
		$(this).html($.toJSON(json));
		
	} else if (cmd=='getjson') {
		var json={};
		if ($(this).children('div.je-node').length!=0) {
			var json=$.jsoneditor.dumpNode($(this).children('div.je-node:first'));
		} else {
			var json=$.jsoneditor.options.data;
		}
		return json;
	}
};



$.jsoneditor = {

	options:{root:'json', data:{}},
	
	initUI:function(options) {
		var html=this.parseNode(options.root, options.data, 0, true);
		return html;
	},
	
	parseNode:function(key, node, layer, root) {
		var children=[];
		
		for (var i in node) {
			var el=node[i];
			if (typeof(el)==='object') children.push(this.parseNode(i, el, layer+1));
			else if (el === 'true' || el === 'false')
			{
				el = this.stringToBoolean(el);
				children.push(this.parseLeaf(i, el, layer+1));
			}
			else if (typeof(el)==='string' || typeof(el)==='number' || typeof(el)==='boolean') children.push(this.parseLeaf(i, el, layer+1));
		}
		var html='<div class="je-node">';
		
		html+=this.repeat('<span class="je-tab"></span>', layer);
		
		html+='<span class="je-tree-minus-icon" onclick="$.jsoneditor.toggleNode(this);"></span>';
		html+='<span class="je-tree-node-open-icon"></span>';
		
		if (!root) html+='<span class="je-key"><input class="je-key-input" type="text" value="'+key+'"/></span>';
		else html+='<span class="je-key"><input style="border:none;background:#FFF;" disabled="disabled" class="je-key-input" type="text" value="'+key+'"/></span>';
		
		html+='<span class="je-node-op">';
		
		html+='</span>';
		
		html+='<div class="je-children">'+children.join('')+'</div>';
		
		html+='</div>';
		
		return html;
	},
	parseLeaf:function(key, val, layer) {
		var html='<div class="je-leaf">';
		
		html+=this.repeat('<span class="je-tab"></span>', layer+1);

		html+='<span class="je-tree-leaf-icon"></span>';
		
		html+='<span class="je-key"><input class="je-key-input" type="text" value="'+key+'"/></span>';
		html+=' : <span class="je-val"><textarea class="je-val-input" wrap="soft" rows="1" value="'+val+'">'+val+'</textarea></span>';
		
		html+='<span class="je-leaf-op"><span class="je-insert-node-brother glyphicon glyphicon-copy" onclick="$.jsoneditor.copyValue(this);" title="copy this to selected field"></span><span class="je-insert-leaf-brother glyphicon glyphicon-plus" onclick="$.jsoneditor.appendValue(this);"  title="append this to selected field"></span></span>';

		html+='</div>';
		
		return html;
	},
	
	repeat:function(str, count) {
		var s='';
		for (var i=0; i<count; i++) s+=str;
		return s;
	},
	
	toggleNode:function(node) {
		if ($(node).hasClass('je-tree-plus-icon')) {
			$(node).nextAll('.je-tree-node-closed-icon:first').toggleClass('je-tree-node-closed-icon').toggleClass('je-tree-node-open-icon');
		} else {
			$(node).nextAll('.je-tree-node-open-icon:first').toggleClass('je-tree-node-closed-icon').toggleClass('je-tree-node-open-icon');
		}
		$(node).toggleClass('je-tree-minus-icon').toggleClass('je-tree-plus-icon').nextAll('div.je-children:first').slideToggle('fast');
	},
	
	len:function(obj) {
		var count=0;
		for (var i in obj) {
			count++;
		}
		return count;
	},
	
	addNodeChild:function(span) {
		var layer=$(span).parent().prevAll('span.je-tab').length;
		$(span).parent().nextAll('div.je-children:first').append(this.parseNode('', {}, layer+1, false)).show();
	},
	
	addLeafChild:function(span) {
		var layer=$(span).parent().prevAll('span.je-tab').length;
		$(span).parent().nextAll('div.je-children:first').append(this.parseLeaf('', '', layer+1)).show();
	},
	
	copyValue:function(span) {

		textVal = $(span).parent().prev('span.je-val').children('textarea').val();
		selectfield = document.forms["selectform"]["selectfield"].value;
		document.forms["updateform"][selectfield].value=textVal;
		
	},
	
	appendValue:function(span) {
		
		textVal = $(span).parent().prev('span.je-val').children('textarea').val();
		selectfield = document.forms["selectform"]["selectfield"].value;
		selectedfieldVal = document.forms["updateform"][selectfield].value;
		if(selectfield=="historicalfact-urls-0")
			$('#multiple-input').multipleInput('add',{textVal});
		else
			document.forms["updateform"][selectfield].value=selectedfieldVal+' '+textVal;
	},
	
	del:function(span) {
		$(span).parent().parent().fadeOut("fast",function(){
			$(this).remove();
		});
	},
	
	dumpNode:function(node) {
		var json={};
		var key=node.children('span.je-key:first').children('input:first').val();//no useness
		var children=node.children('div.je-children:first').children('div.je-node , div.je-leaf');
		for (var i=0; i<children.length; i++) {
			if ($(children[i]).hasClass('je-node')) {
				var key1=$(children[i]).children('span.je-key:first').children('input:first').val();
				json[key1]=this.dumpNode($(children[i]));
			} else {
				var key2=$(children[i]).children('span.je-key:first').children('input:first').val();
				var val2=$(children[i]).children('span.je-val:first').children('input:first').val();
				if (val2 === 'true' || val2 === 'false') val2 = this.stringToBoolean(val2);
				json[key2]=val2;
			}
		}
		return json;
	},
	
	stringToBoolean:function(str) {
		switch(str.toLowerCase()) {
			case "true": case "yes": case "1": return true;
			case "false": case "no": case "0": case null: return false;
			default: return Boolean(str);
		}
	}
};

