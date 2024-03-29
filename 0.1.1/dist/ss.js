class SSkillet{
	constructor(){
		this.distribute_id = 0;
		this.eventBackUpStorage = {};

		// start point
		this.array_extension();
		this.selector_extension();
		this.object_extension();
		this.dom_extension();
		this.nodeList_extension();
		this.string_extension();
	}

	array_extension(){
		Array.prototype.last = function(val){
			if(typeof val == 'undefined')
				return this[this.length - 1];
			else
				this[this.length - 1] = val;
			return this;
		}

		Array.prototype.first = function(val){
			if(typeof val == 'undefined')
				return this[0];
			else
				this[0] = val;
			return this;
		}

		Array.prototype.each = function(callback){
			for(let i=0; i<this.length; i++){
				if(callback(i, this[i]) === false){
					return false;
				}
			}

			return true;
		}

		Array.prototype.log = function(){
			console.log(this);
		}

		Array.prototype.different = function(arr){
			return this.filter(i=>!arr.includes(i))
			.concat(arr.filter(i=>!this.includes(i)))
		}
	}

	selector_extension(){
		window['ss'] = function(selector){
			let elements = document.querySelectorAll(selector);
			return elements;
		}

		window['log'] = function(){
			for(let i=0; i<arguments.length; i++){
				console.log(arguments[i]);
			}
		}

		window['ss']['get'] = function(url, callback, err){
			let xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					callback(this.responseText);
				}else{
					if(typeof err != 'undefined'){
						err(this);
					}
				}
			};

			xhttp.open("GET", url, true);
			xhttp.send();
		}

		window['ss']['post'] = function(url, data, callback, err){
			let xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					callback(this.responseText);
				}else{
					if(typeof err != 'undefined'){
						err(this);
					}
				}
			};

			xhttp.open("POST", url, true);
			if(typeof data != 'object'){
				return false;
			}

			let query = '';
			data.each(function(name, value){
				if(query != ''){
					query += '&';
				}

				query += name + '=' + encodeURIComponent(value);
			});
			log(query);
			xhttp.send(query);
		}
	}

	object_extension(){
		Object.prototype.each = function(callback){
			for(let i in this){
				if(!this.hasOwnProperty( i )){
					continue;
				}

				if(callback(i, this[i]) === false){
					return false;
				}
			}

			return true;
		}

		Object.prototype.log = function(){
			console.log(this);
		}

		Object.prototype.clone = function(){
			function recursiveClone(obj){
				let clone = {};
				for (var i in obj) {
					if(typeof obj[i] == 'function'){
						continue;
					}

					if(typeof obj[i] == 'object'){
						clone[i] = recursiveClone(obj[i]);
					}else{
						clone[i] = obj[i];
					}
				}

				return clone;
			}
			return recursiveClone(this);
		}

		Object.prototype.compare = function(obj){
			function c(obj1, obj2){
				for(let i in obj1){
					if(typeof obj1[i] == 'function'){
						continue;
					}
					if(typeof obj1[i] == 'object' || typeof obj1[i] == 'array'){
						if(!c(obj1[i], obj2[i])){
							return false;
						}
					}else if(obj1[i] != obj2[i]){
						return false;
					}
				}
				return true;
			}

			return c(this, obj) && c(obj, this);
		}

		Object.prototype.props = function(){
			let props = [];
			for(let prop in this){
				if(this.hasOwnProperty(prop)){
					props.push(prop);
				}
			}

			return props;
		}

	}

	dom_extension(){
		let self = this;

		HTMLElement.prototype.addClass = function(classname){
			this.classList.add(classname);
			return this;
		}

		HTMLElement.prototype.removeClass = function(classname){
			this.classList.remove(classname);
			return this;
		}

		HTMLElement.prototype.toggleClass = function(classname){
			this.classList.toggle(classname);
			return this;
		}

		HTMLElement.prototype.hasClass = function(classname){
			for(let i=0; i<this.classList.length; i++){
				if(this.classList.item(i) == classname){
					return true;
				}
			}

			return false;
		}

		HTMLElement.prototype.append = function(element){
			if(typeof element == 'object'){
				this.insertAdjacentElement('beforeend', element);
			}else{
				this.insertAdjacentHTML('beforeend', element);
			}
			return this;
		}

		HTMLElement.prototype.prepend = function(element){
			if(typeof element == 'object'){
				this.insertAdjacentElement('afterbegin', element);
			}else{
				this.insertAdjacentHTML('afterbegin', element);
			}
			return this;
		}

		HTMLElement.prototype.on = function(eventName, listener){
			let evName = eventName + "__" + ++self.distribute_id;
			self.eventBackUpStorage[evName] = listener;
			this.addEventListener(eventName, listener);
			this.dataset.ssBind = typeof this.dataset.ssBind != 'undefined' ? this.dataset.ssBind + evName + ',' : evName + ',';
			return this;
		}

		HTMLElement.prototype.find = function(selector){
			return this.querySelectorAll(selector);
		}

		HTMLElement.prototype.attr = function(name, val){
			if(typeof val != 'undefined'){
				this.setAttribute(name, val);
				return this;
			}
			return this.getAttribute(name);
		}

		HTMLElement.prototype.hasAttr = function(name){
			return (this.getAttribute(name) == null) ? false : true;
		}

		HTMLElement.prototype.show = function(){
			if(window.getComputedStyle(this).display != 'none'){
				return this;
			}

			if(typeof this.dataset.ssPropsOriginalDisplay == 'undefined' || this.dataset.ssPropsOriginalDisplay == ''){
				this.style.display = 'block';
			}else{
				this.style.display = this.dataset.ssPropsOriginalDisplay;
			}
			return this;
		}

		HTMLElement.prototype.hide = function(){
			this.dataset.ssPropsOriginalDisplay = window.getComputedStyle(this).display;
			this.style.display = 'none';
			return this;
		}

		HTMLElement.prototype.parent = function(){
			return this.parentNode;
		}
	}

	nodeList_extension(){
		function r(funcName, item, arg1, arg2){
			for(let i in item){
				if(typeof item[i][funcName] != 'undefined'){
					item[i][funcName](arg1, arg2);
				}
			}
		}
		NodeList.prototype.last = Array.prototype.last;
		NodeList.prototype.first = Array.prototype.first;
		NodeList.prototype.each = Array.prototype.each;
		NodeList.prototype.addClass = function (arg1) {return r('addClass', this, arg1)};
		NodeList.prototype.removeClass = function (arg1) {return r('removeClass', this, arg1)};
		NodeList.prototype.toggleClass = function (arg1) {return r('toggleClass', this, arg1)};
		NodeList.prototype.attr = function (arg1) {return r('attr', this, arg1)};
		NodeList.prototype.append = function (arg1) {return r('append', this, arg1)};
		NodeList.prototype.prepend = function (arg1) {return r('prepend', this, arg1)};
		NodeList.prototype.show = function () {return r('show', this)};
		NodeList.prototype.hide = function () {return r('hide', this)};
		NodeList.prototype.on = function (arg1, arg2) {return r('on', this, arg1, arg2)};
	}

	string_extension(){
		String.prototype.ss = function(){
			let self = this;
			let source = this;
			for(let i=0; i<arguments.length; i++){
				let tmp = this.replace('{' + i + '}', arguments[i]);
				if(tmp != source){
					self = tmp;
				}
			}
			return self;
		}
	}
}



let ssk = new SSkillet();
