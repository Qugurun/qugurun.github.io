
local browser = require("browser")
if system.getInfo("platform") == 'html5' then
	print = browser.log
end

--================================================================================
local stage = display.getCurrentStage()

local config = {
	-- размер проекта
	width = 640,
	height = 1136,

	-- обновляемые параметры
	left = 0,
	right = 0,
	top = 0,
	bottom = 0,

	--[[
		возвращают размер всей области окна
		в актуальных для приложения размерах
	]]
	contentWidth = 0,
	contentHeigth = 0
}

----------------------------------------------------------------------------------
function onResize()
	local width = config.width
	local height = config.height

	local w = browser.width()
	local h = browser.height()
	
	if w > h  then
		width = config.height * w/h 
		height = config.height 
		
	else
		width = config.width * h/w
		height = config.width 
	end

	if width*(w/width)<config.width then
		width = config.width 
		height = config.width * h/w
	end

	if height<config.height then
		width = config.height * w/h
		height = config.height
	end

	stage.xScale = w/width
	stage.yScale = h/height

	stage.x = w/2 - (config.width * stage.xScale)/2
	stage.y = h/2 - (config.height * stage.xScale)/2

	config.left = -(width/2-config.width/2)
	config.right = (width/2+config.width/2)
	config.top = -(height/2-config.height/2)
	config.bottom = (height/2+config.height/2)

	config.contentWidth = width
	config.contentHeight = height

	for i=1, stage.numChildren do
	    local child = stage[i]
	   	if child.onResize ~= nil then 
	   		child:onResize()
	   	end
	end
end
onResize()
Runtime:addEventListener("resize", onResize)

--================================================================================
-- Создание объектов

----------------------------------------------------------------------------------
local rectRed = display.newRect(config.width/2, config.height/2, 1920*4, 1920*4)
function rectRed:onResize()
	rectRed.width = config.contentWidth - 50
	rectRed.height = config.contentHeight - 50
end
rectRed:setFillColor(1,0,1)

----------------------------------------------------------------------------------
local rectRed = display.newRect(0, 0, config.width, config.height)
rectRed.anchorX = 0
rectRed.anchorY = 0
rectRed:setFillColor(1,0,0)

----------------------------------------------------------------------------------
local rectLettTop = display.newRect(config.left, config.top, 50, 50)
function rectLettTop:onResize()
	self.x = config.left
	self.y = config.top
end

----------------------------------------------------------------------------------
local rectRightTop = display.newRect(config.right, config.top, 50, 50)
function rectRightTop:onResize()
	self.x = config.right
	self.y = config.top
end

----------------------------------------------------------------------------------
local rectLettBottom = display.newRect(config.left, config.bottom, 50, 50)
function rectLettBottom:onResize()
	self.x = config.left
	self.y = config.bottom
end

----------------------------------------------------------------------------------
local rectRightBottom = display.newRect(config.right, config.bottom, 50, 50)
function rectRightBottom:onResize()
	self.x = config.right
	self.y = config.bottom
end

----------------------------------------------------------------------------------
local avatar1 = display.newImage("qugurun.png", config.width/2-100, config.height/2)
avatar1:scale(0.7, 0.7)

local avatar2 = display.newImage("qugurun.png", config.width/2+100, config.height/2)
avatar2:scale(0.7, 0.7)

----------------------------------------------------------------------------------
local myText = display.newText( "Hello Qugurun!", config.width/2, 200, native.systemFontBold, 36 )
