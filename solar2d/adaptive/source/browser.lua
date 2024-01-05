
if system.getInfo("platform") == 'html5' then
  	return require("browser_js")
else
	lib = {}
	
	function lib.JS(...)
		print( "JS - Only HTML5" )
	end

	function lib.width()
		return display.contentWidth
	end

	function lib.height()
		return display.contentHeight
	end

	function lib.log(...)
		print(...)
	end

	return lib
end

