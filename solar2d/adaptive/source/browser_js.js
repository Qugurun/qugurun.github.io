
var browser_js = 
{
  JS: function(text){
    return eval(text)
  },

  width: function(){
  	return window.innerWidth
  },

  height: function(){
  	return window.innerHeight
  },

  log: function(){
  	let text  = '';
  	for (let index = 0; index < arguments.length; index++) {
        text = text + ' ' + arguments[index];
    }
  	console.log(text)
  }

};

var metaViewport = document.querySelector('meta[name="viewport"]');
metaViewport.setAttribute('content', 'user-scalable=0, initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, minimal-ui=1');

document.body.style.border = 'none';
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.scrollbarWidth = 'none';
document.body.style.msOverflowStyle = 'none';
document.body.style.overflow = 'hidden';