//by Qugurun
//The images are for this example only, belong to Qugurun and are prohibited from being used in games and applications.

SetErrorMode(2)

SetWindowTitle( "Call Javascript" )
SetVirtualResolution( 768, 1024 )

if GetDeviceWidth() > GetDeviceHeight()
	setvirtualresolution( 1136*GetDeviceWidth()/GetDeviceHeight(), 1136)
else
	setvirtualresolution( 1136, 1136*GetDeviceHeight()/GetDeviceWidth() )
endif

SetOrientationAllowed( 1, 1, 1, 1 )
SetSyncRate( 60, 0 )
SetScissor( 0,0,0,0 )
UseNewDefaultFonts( 1 )
SetPrintSize(20)

SetVSync( 1 )


global width as float
global height as float

global jswidth as float
global jsheight as float

global time_event_resize as float
time_event_resize = timer()

width = GetVirtualWidth()
height = GetVirtualHeight()

global bg
bg = createSprite(LoadImage("bg.jpg"))

global player
player = createSprite(LoadImage("player.png"))

global foliage_l
foliage_l = createSprite(LoadImage("foliage_l.png"))

global foliage_r
foliage_r = createSprite(LoadImage("foliage_r.png"))

global dim cloud []
for i=0 to 2
	spr = createSprite(LoadImage("cloud_"+str(i)+".png"))
	cloud.insert(spr)
next i

//update_size()
update_spr_resize()

for i=0 to cloud.length
	SetSpritePositionByOffset(cloud[i], Random(0, width), Random(0, height))
next i

//hello
JS_Print('Hello from AGK!')

//get the current url
url$ = JS_Call("window.location.href")

//writing and reading to local storage
JS_Call('localStorage.setItem ("_qugurun",  "AGK_qugurun")')

localStorage$ = JS_Call('localStorage.getItem ("_qugurun")')
JS_Print("localStorage: _qugurun: " + localStorage$)

global js_focus, time_event#, time_event_resize#
js_focus = 1

time_event# = timer()
time_event_resize# = timer()

global MoveRate# = 200
do
	EventResize(0.25)
	
	__agk__focus = JS_FocusEventListener(0.5)
	if __agk__focus <> -1
		js_focus = __agk__focus
	endif 
	
	print("Current url: "+ url$)

	if js_focus = 1
		print("Test focus: GAME ENABLED")
	else
		print("Test focus: GAME DISABLED")
	endif
	print("localStorage: _qugurun :"+localStorage$ )
	
	print("AGK size: " + str(GetDeviceWidth())+":"+str(GetDeviceHeight()))
	print("JS size: " + str(val(JS_Call("window.innerWidth")))+":"+str(val(JS_Call("window.innerHeight"))))

	if js_focus = 1
		
		SetSpritePositionByOffset(player, GetPointerX(), GetPointerY())
		
		DoClouds()
	endif
	Sync()
loop

function DoClouds()
    ThisMove# = MoveRate# * GetFrameTime()
    for i = 0 to cloud.Length
        ThisX# = GetSpriteXByOffset(cloud[i])
        ThisY# = GetSpriteYByOffset(cloud[i]) + ThisMove#
        if ThisY# >= height + GetSpriteHeight(cloud[i])
            ThisX# = Random(0,width)
            ThisY# = -Random(GetSpriteHeight(cloud[i]),height) 
        endif
        SetSpritePositionByOffset(cloud[i], ThisX#, ThisY#)
    next i
endfunction

function JS_FocusEventListener( delay as float )
	result = -1
	if(GetDeviceName() = "html5")
		if timer()-time_event# > delay
			time_event# = timer()
			
			result = val(JS_Call("__agk__focus"))
		endif
    endif
endfunction result

function update_spr_resize()
	SetSpriteSize(bg, width, height)
	SetSpritePosition(bg, width/2 - GetSpriteWidth(bg)/2, height/2 - GetSpriteHeight(bg)/2)

	SetSpritePosition(foliage_r, width-GetSpriteWidth(foliage_r), 0)
endfunction

function update_size()
	width_now = valfloat(JS_Call("window.innerWidth"))
	height_now = valfloat(JS_Call("window.innerHeight"))
	
	if width_now > height_now
		width = 960*width_now/height_now
		height = 960
	else
		width = 960
		height = 960*height_now/width_now
	endif
	
	UpdateDeviceSize( width_now , height_now )
	setvirtualresolution( width,  height)
	
endfunction

function EventResize( delay as float )
	if(GetDeviceName() = "html5")
		if timer()-time_event_resize# > delay
			time_event_resize# = timer()

			if JS_ResizeEventListener() = 1
				update_size()
				update_spr_resize()
			endif
		endif
    endif
endfunction

function JS_ResizeEventListener()
	result = 1
	if(GetDeviceName() = "html5")
		result = val(LoadSharedVariable("resize", ""))
	endif
endfunction result

function JS_Call( eval as string )
	if(GetDeviceName() = "html5")
		result$ = LoadSharedVariable("call", eval)
	endif
endfunction result$

Function JS_Print(data as String)
	If(GetDeviceName() = "html5")
		LoadSharedVariable("call", 'console.log("' + data + '")')
	Endif
EndFunction


