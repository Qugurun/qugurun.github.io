var __resize = false;

window.addEventListener('resize', function(event) {
	__resize = true;
}, true);
		
var Module;
if (typeof Module === "undefined") Module = {};
if (!Module.expectedDataFileDownloads) {
	Module.expectedDataFileDownloads = 0;
	Module.finishedDataFileDownloads = 0
}
Module.expectedDataFileDownloads++;
((function() {
	
	var loadPackage = (function(metadata) {
		var PACKAGE_PATH;
		if (typeof window === "object") {
			PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/")
		} else if (typeof location !== "undefined") {
			PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/")
		} else {
			throw "using preloaded data can only be done on a web page or in a web worker"
		}
		var PACKAGE_NAME = "AGKPlayer.data";
		var REMOTE_PACKAGE_BASE = "AGKPlayer.data";
		if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
			Module["locateFile"] = Module["locateFilePackage"];
			Module.printErr("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")
		}
		var REMOTE_PACKAGE_NAME = typeof Module["locateFile"] === "function" ? Module["locateFile"](REMOTE_PACKAGE_BASE) : (Module["filePackagePrefixURL"] || "") + REMOTE_PACKAGE_BASE;
		var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
		var PACKAGE_UUID = metadata.package_uuid;

		function fetchRemotePackage(packageName, packageSize, callback, errback) {
			var xhr = new XMLHttpRequest;
			xhr.open("GET", packageName, true);
			xhr.responseType = "arraybuffer";
			xhr.onprogress = (function(event) {
				var agkStatus = document.getElementById("agkstatus");
				if (agkStatus) {
					var size = packageSize;
					if (event.total) size = event.total;
					if (event.loaded) {
						var percent = event.loaded * 100 / size;
						agkStatus.textContent = "Loading Media... " + percent.toFixed(1) + "%"
					} else {
						agkStatus.textContent = "Loading Media... "
					}
				}
			});
			xhr.onerror = (function(event) {
				var agkStatus = document.getElementById("agkstatus");
				if (agkStatus) agkStatus.textContent = "Network Error: " + event;
				throw new Error("NetworkError for: " + packageName)
			});
			xhr.onload = (function(event) {
				if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || xhr.status == 0 && xhr.response) {
					var agkStatus = document.getElementById("agkstatus");
					if (agkStatus) agkStatus.textContent = "";
					var packageData = xhr.response;
					callback(packageData)
				} else {
					var agkStatus = document.getElementById("agkstatus");
					if (agkStatus) agkStatus.textContent = xhr.statusText;
					throw new Error(xhr.statusText + " : " + xhr.responseURL)
				}
			});
			xhr.send(null)
		}

		function handleError(error) {
			console.error("package error:", error)
		}
		var fetched = null,
			fetchedCallback = null;
		fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, (function(data) {
			if (fetchedCallback) {
				fetchedCallback(data);
				fetchedCallback = null
			} else {
				fetched = data
			}
		}), handleError);

		function runWithFS() {
			function assert(check, msg) {
				if (!check) throw msg + (new Error).stack
			} Module["FS_createPath"]("/", "media", true, true); function DataRequest(start, end, crunched, audio) {
				this.start = start;
				this.end = end;
				this.crunched = crunched;
				this.audio = audio
			}
			DataRequest.prototype = {
				requests: {},
				open: (function(mode, name) {
					this.name = name;
					this.requests[name] = this;
					Module["addRunDependency"]("fp " + this.name)
				}),
				send: (function() {}),
				onload: (function() {
					var byteArray = this.byteArray.subarray(this.start, this.end);
					this.finish(byteArray)
				}),
				finish: (function(byteArray) {
					var that = this;
					Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
					Module["removeRunDependency"]("fp " + that.name);
					this.requests[this.name] = null
				})
			};
			var files = metadata.files;
			for (i = 0; i < files.length; ++i) {
				(new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio)).open("GET", files[i].filename)
			}

			function processPackageData(arrayBuffer) {
				Module.finishedDataFileDownloads++;
				assert(arrayBuffer, "Loading data file failed.");
				assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
				var byteArray = new Uint8Array(arrayBuffer);
				if (Module["SPLIT_MEMORY"]) Module.printErr("warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting");
				var ptr = Module["getMemory"](byteArray.length);
				Module["HEAPU8"].set(byteArray, ptr);
				DataRequest.prototype.byteArray = Module["HEAPU8"].subarray(ptr, ptr + byteArray.length);
				var files = metadata.files;
				for (i = 0; i < files.length; ++i) {
					DataRequest.prototype.requests[files[i].filename].onload()
				}
				Module["removeRunDependency"]("datafile_AGKPlayer.data")
			}
			Module["addRunDependency"]("datafile_AGKPlayer.data");
			if (!Module.preloadResults) Module.preloadResults = {};
			Module.preloadResults[PACKAGE_NAME] = {
				fromCache: false
			};
			if (fetched) {
				processPackageData(fetched);
				fetched = null
			} else {
				fetchedCallback = processPackageData
			}
		}
		if (Module["calledRun"]) {
			runWithFS()
		} else {
			if (!Module["preRun"]) Module["preRun"] = [];
			Module["preRun"].push(runWithFS)
		}
	}); loadPackage({"files":[{"audio":0,"start":0,"crunched":0,"end":19430,"filename":"/media/bg.jpg"},{"audio":0,"start":19430,"crunched":0,"end":29139,"filename":"/media/bytecode.byc"},{"audio":0,"start":29139,"crunched":0,"end":41751,"filename":"/media/cloud_0.png"},{"audio":0,"start":41751,"crunched":0,"end":48604,"filename":"/media/cloud_1.png"},{"audio":0,"start":48604,"crunched":0,"end":58996,"filename":"/media/cloud_2.png"},{"audio":0,"start":58996,"crunched":0,"end":68789,"filename":"/media/foliage_l.png"},{"audio":0,"start":68789,"crunched":0,"end":75019,"filename":"/media/foliage_r.png"},{"audio":0,"start":75019,"crunched":0,"end":79930,"filename":"/media/player.png"}],"remote_package_size":79930,"package_uuid":"e3c8dd30-b68a-4332-8c93-d0cf8f9d28a0"})
}))();
var Module;
if (!Module) Module = (typeof Module !== "undefined" ? Module : null) || {};
var moduleOverrides = {};
for (var key in Module) {
	if (Module.hasOwnProperty(key)) {
		moduleOverrides[key] = Module[key]
	}
}
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
if (Module["ENVIRONMENT"]) {
	if (Module["ENVIRONMENT"] === "WEB") {
		ENVIRONMENT_IS_WEB = true
	} else if (Module["ENVIRONMENT"] === "WORKER") {
		ENVIRONMENT_IS_WORKER = true
	} else if (Module["ENVIRONMENT"] === "NODE") {
		ENVIRONMENT_IS_NODE = true
	} else if (Module["ENVIRONMENT"] === "SHELL") {
		ENVIRONMENT_IS_SHELL = true
	} else {
		throw new Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.")
	}
} else {
	ENVIRONMENT_IS_WEB = typeof window === "object";
	ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
	ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
	ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER
}
if (ENVIRONMENT_IS_NODE) {
	if (!Module["print"]) Module["print"] = console.log;
	if (!Module["printErr"]) Module["printErr"] = console.warn;
	var nodeFS;
	var nodePath;
	Module["read"] = function read(filename, binary) {
		if (!nodeFS) nodeFS = require("fs");
		if (!nodePath) nodePath = require("path");
		filename = nodePath["normalize"](filename);
		var ret = nodeFS["readFileSync"](filename);
		if (!ret && filename != nodePath["resolve"](filename)) {
			filename = path.join(__dirname, "..", "src", filename);
			ret = nodeFS["readFileSync"](filename)
		}
		if (ret && !binary) ret = ret.toString();
		return ret
	};
	Module["readBinary"] = function readBinary(filename) {
		var ret = Module["read"](filename, true);
		if (!ret.buffer) {
			ret = new Uint8Array(ret)
		}
		assert(ret.buffer);
		return ret
	};
	Module["load"] = function load(f) {
		globalEval(read(f))
	};
	if (!Module["thisProgram"]) {
		if (process["argv"].length > 1) {
			Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/")
		} else {
			Module["thisProgram"] = "unknown-program"
		}
	}
	Module["arguments"] = process["argv"].slice(2);
	if (typeof module !== "undefined") {
		module["exports"] = Module
	}
	process["on"]("uncaughtException", (function(ex) {
		if (!(ex instanceof ExitStatus)) {
			throw ex
		}
	}));
	Module["inspect"] = (function() {
		return "[Emscripten Module object]"
	})
} else if (ENVIRONMENT_IS_SHELL) {
	if (!Module["print"]) Module["print"] = print;
	if (typeof printErr != "undefined") Module["printErr"] = printErr;
	if (typeof read != "undefined") {
		Module["read"] = read
	} else {
		Module["read"] = function read() {
			throw "no read() available (jsc?)"
		}
	}
	Module["readBinary"] = function readBinary(f) {
		if (typeof readbuffer === "function") {
			return new Uint8Array(readbuffer(f))
		}
		var data = read(f, "binary");
		assert(typeof data === "object");
		return data
	};
	if (typeof scriptArgs != "undefined") {
		Module["arguments"] = scriptArgs
	} else if (typeof arguments != "undefined") {
		Module["arguments"] = arguments
	}
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
	Module["read"] = function read(url) {
		var xhr = new XMLHttpRequest;
		xhr.open("GET", url, false);
		xhr.send(null);
		return xhr.responseText
	};
	Module["readAsync"] = function readAsync(url, onload, onerror) {
		var xhr = new XMLHttpRequest;
		xhr.open("GET", url, true);
		xhr.responseType = "arraybuffer";
		xhr.onload = function xhr_onload() {
			if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
				onload(xhr.response)
			} else {
				onerror()
			}
		};
		xhr.onerror = onerror;
		xhr.send(null)
	};
	if (typeof arguments != "undefined") {
		Module["arguments"] = arguments
	}
	if (typeof console !== "undefined") {
		if (!Module["print"]) Module["print"] = function print(x) {
			console.log(x)
		};
		if (!Module["printErr"]) Module["printErr"] = function printErr(x) {
			console.warn(x)
		}
	} else {
		var TRY_USE_DUMP = false;
		if (!Module["print"]) Module["print"] = TRY_USE_DUMP && typeof dump !== "undefined" ? (function(x) {
			dump(x)
		}) : (function(x) {})
	}
	if (ENVIRONMENT_IS_WORKER) {
		Module["load"] = importScripts
	}
	if (typeof Module["setWindowTitle"] === "undefined") {
		Module["setWindowTitle"] = (function(title) {
			document.title = title
		})
	}
} else {
	throw "Unknown runtime environment. Where are we?"
}

function globalEval(x) {
	eval.call(null, x)
}
if (!Module["load"] && Module["read"]) {
	Module["load"] = function load(f) {
		globalEval(Module["read"](f))
	}
}
if (!Module["print"]) {
	Module["print"] = (function() {})
}
if (!Module["printErr"]) {
	Module["printErr"] = Module["print"]
}
if (!Module["arguments"]) {
	Module["arguments"] = []
}
if (!Module["thisProgram"]) {
	Module["thisProgram"] = "./this.program"
}
Module.print = Module["print"];
Module.printErr = Module["printErr"];
Module["preRun"] = [];
Module["postRun"] = [];
for (var key in moduleOverrides) {
	if (moduleOverrides.hasOwnProperty(key)) {
		Module[key] = moduleOverrides[key]
	}
}
moduleOverrides = undefined;
var Runtime = {
	setTempRet0: (function(value) {
		tempRet0 = value
	}),
	getTempRet0: (function() {
		return tempRet0
	}),
	stackSave: (function() {
		return STACKTOP
	}),
	stackRestore: (function(stackTop) {
		STACKTOP = stackTop
	}),
	getNativeTypeSize: (function(type) {
		switch (type) {
			case "i1":
			case "i8":
				return 1;
			case "i16":
				return 2;
			case "i32":
				return 4;
			case "i64":
				return 8;
			case "float":
				return 4;
			case "double":
				return 8;
			default: {
				if (type[type.length - 1] === "*") {
					return Runtime.QUANTUM_SIZE
				} else if (type[0] === "i") {
					var bits = parseInt(type.substr(1));
					assert(bits % 8 === 0);
					return bits / 8
				} else {
					return 0
				}
			}
		}
	}),
	getNativeFieldSize: (function(type) {
		return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE)
	}),
	STACK_ALIGN: 16,
	prepVararg: (function(ptr, type) {
		if (type === "double" || type === "i64") {
			if (ptr & 7) {
				assert((ptr & 7) === 4);
				ptr += 4
			}
		} else {
			assert((ptr & 3) === 0)
		}
		return ptr
	}),
	getAlignSize: (function(type, size, vararg) {
		if (!vararg && (type == "i64" || type == "double")) return 8;
		if (!type) return Math.min(size, 8);
		return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE)
	}),
	dynCall: (function(sig, ptr, args) {
		if (args && args.length) {
			if (!args.splice) args = Array.prototype.slice.call(args);
			args.splice(0, 0, ptr);
			return Module["dynCall_" + sig].apply(null, args)
		} else {
			return Module["dynCall_" + sig].call(null, ptr)
		}
	}),
	functionPointers: [],
	addFunction: (function(func) {
		for (var i = 0; i < Runtime.functionPointers.length; i++) {
			if (!Runtime.functionPointers[i]) {
				Runtime.functionPointers[i] = func;
				return 2 * (1 + i)
			}
		}
		throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."
	}),
	removeFunction: (function(index) {
		Runtime.functionPointers[(index - 2) / 2] = null
	}),
	warnOnce: (function(text) {
		if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
		if (!Runtime.warnOnce.shown[text]) {
			Runtime.warnOnce.shown[text] = 1;
			Module.printErr(text)
		}
	}),
	funcWrappers: {},
	getFuncWrapper: (function(func, sig) {
		assert(sig);
		if (!Runtime.funcWrappers[sig]) {
			Runtime.funcWrappers[sig] = {}
		}
		var sigCache = Runtime.funcWrappers[sig];
		if (!sigCache[func]) {
			sigCache[func] = function dynCall_wrapper() {
				return Runtime.dynCall(sig, func, arguments)
			}
		}
		return sigCache[func]
	}),
	getCompilerSetting: (function(name) {
		throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"
	}),
	stackAlloc: (function(size) {
		var ret = STACKTOP;
		STACKTOP = STACKTOP + size | 0;
		STACKTOP = STACKTOP + 15 & -16;
		return ret
	}),
	staticAlloc: (function(size) {
		var ret = STATICTOP;
		STATICTOP = STATICTOP + size | 0;
		STATICTOP = STATICTOP + 15 & -16;
		return ret
	}),
	dynamicAlloc: (function(size) {
		var ret = DYNAMICTOP;
		DYNAMICTOP = DYNAMICTOP + size | 0;
		DYNAMICTOP = DYNAMICTOP + 15 & -16;
		if (DYNAMICTOP >= TOTAL_MEMORY) {
			var success = enlargeMemory();
			if (!success) {
				DYNAMICTOP = ret;
				return 0
			}
		}
		return ret
	}),
	alignMemory: (function(size, quantum) {
		var ret = size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16);
		return ret
	}),
	makeBigInt: (function(low, high, unsigned) {
		var ret = unsigned ? +(low >>> 0) + +(high >>> 0) * +4294967296 : +(low >>> 0) + +(high | 0) * +4294967296;
		return ret
	}),
	GLOBAL_BASE: 8,
	QUANTUM_SIZE: 4,
	__dummy__: 0
};
Module["Runtime"] = Runtime;
var ABORT = false;
var EXITSTATUS = 0;

function assert(condition, text) {
	if (!condition) {
		abort("Assertion failed: " + text)
	}
}

function getCFunc(ident) {
	var func = Module["_" + ident];
	if (!func) {
		try {
			func = eval("_" + ident)
		} catch (e) {}
	}
	assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)");
	return func
}
var cwrap, ccall;
((function() {
	var JSfuncs = {
		"stackSave": (function() {
			Runtime.stackSave()
		}),
		"stackRestore": (function() {
			Runtime.stackRestore()
		}),
		"arrayToC": (function(arr) {
			var ret = Runtime.stackAlloc(arr.length);
			writeArrayToMemory(arr, ret);
			return ret
		}),
		"stringToC": (function(str) {
			var ret = 0;
			if (str !== null && str !== undefined && str !== 0) {
				ret = Runtime.stackAlloc((str.length << 2) + 1);
				writeStringToMemory(str, ret)
			}
			return ret
		})
	};
	var toC = {
		"string": JSfuncs["stringToC"],
		"array": JSfuncs["arrayToC"]
	};
	ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
		var func = getCFunc(ident);
		var cArgs = [];
		var stack = 0;
		if (args) {
			for (var i = 0; i < args.length; i++) {
				var converter = toC[argTypes[i]];
				if (converter) {
					if (stack === 0) stack = Runtime.stackSave();
					cArgs[i] = converter(args[i])
				} else {
					cArgs[i] = args[i]
				}
			}
		}
		var ret = func.apply(null, cArgs);
		if (returnType === "string") ret = Pointer_stringify(ret);
		if (stack !== 0) {
			if (opts && opts.async) {
				EmterpreterAsync.asyncFinalizers.push((function() {
					Runtime.stackRestore(stack)
				}));
				return
			}
			Runtime.stackRestore(stack)
		}
		return ret
	};
	var sourceRegex = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;

	function parseJSFunc(jsfunc) {
		var parsed = jsfunc.toString().match(sourceRegex).slice(1);
		return {
			arguments: parsed[0],
			body: parsed[1],
			returnValue: parsed[2]
		}
	}
	var JSsource = null;

	function ensureJSsource() {
		if (!JSsource) {
			JSsource = {};
			for (var fun in JSfuncs) {
				if (JSfuncs.hasOwnProperty(fun)) {
					JSsource[fun] = parseJSFunc(JSfuncs[fun])
				}
			}
		}
	}
	cwrap = function cwrap(ident, returnType, argTypes) {
		argTypes = argTypes || [];
		var cfunc = getCFunc(ident);
		var numericArgs = argTypes.every((function(type) {
			return type === "number"
		}));
		var numericRet = returnType !== "string";
		if (numericRet && numericArgs) {
			return cfunc
		}
		var argNames = argTypes.map((function(x, i) {
			return "$" + i
		}));
		var funcstr = "(function(" + argNames.join(",") + ") {";
		var nargs = argTypes.length;
		if (!numericArgs) {
			ensureJSsource();
			funcstr += "var stack = " + JSsource["stackSave"].body + ";";
			for (var i = 0; i < nargs; i++) {
				var arg = argNames[i],
					type = argTypes[i];
				if (type === "number") continue;
				var convertCode = JSsource[type + "ToC"];
				funcstr += "var " + convertCode.arguments + " = " + arg + ";";
				funcstr += convertCode.body + ";";
				funcstr += arg + "=(" + convertCode.returnValue + ");"
			}
		}
		var cfuncname = parseJSFunc((function() {
			return cfunc
		})).returnValue;
		funcstr += "var ret = " + cfuncname + "(" + argNames.join(",") + ");";
		if (!numericRet) {
			var strgfy = parseJSFunc((function() {
				return Pointer_stringify
			})).returnValue;
			funcstr += "ret = " + strgfy + "(ret);"
		}
		if (!numericArgs) {
			ensureJSsource();
			funcstr += JSsource["stackRestore"].body.replace("()", "(stack)") + ";"
		}
		funcstr += "return ret})";
		return eval(funcstr)
	}
}))();
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;

function setValue(ptr, value, type, noSafe) {
	type = type || "i8";
	if (type.charAt(type.length - 1) === "*") type = "i32";
	switch (type) {
		case "i1":
			HEAP8[ptr >> 0] = value;
			break;
		case "i8":
			HEAP8[ptr >> 0] = value;
			break;
		case "i16":
			HEAP16[ptr >> 1] = value;
			break;
		case "i32":
			HEAP32[ptr >> 2] = value;
			break;
		case "i64":
			tempI64 = [value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= +1 ? tempDouble > +0 ? (Math_min(+Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
			break;
		case "float":
			HEAPF32[ptr >> 2] = value;
			break;
		case "double":
			HEAPF64[ptr >> 3] = value;
			break;
		default:
			abort("invalid type for setValue: " + type)
	}
}
Module["setValue"] = setValue;

function getValue(ptr, type, noSafe) {
	type = type || "i8";
	if (type.charAt(type.length - 1) === "*") type = "i32";
	switch (type) {
		case "i1":
			return HEAP8[ptr >> 0];
		case "i8":
			return HEAP8[ptr >> 0];
		case "i16":
			return HEAP16[ptr >> 1];
		case "i32":
			return HEAP32[ptr >> 2];
		case "i64":
			return HEAP32[ptr >> 2];
		case "float":
			return HEAPF32[ptr >> 2];
		case "double":
			return HEAPF64[ptr >> 3];
		default:
			abort("invalid type for setValue: " + type)
	}
	return null
}
Module["getValue"] = getValue;
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
var ALLOC_STATIC = 2;
var ALLOC_DYNAMIC = 3;
var ALLOC_NONE = 4;
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;



function allocate(slab, types, allocator, ptr) {
	var zeroinit, size;
	if (typeof slab === "number") {
		zeroinit = true;
		size = slab
	} else {
		zeroinit = false;
		size = slab.length
	}
	var singleType = typeof types === "string" ? types : null;
	var ret;
	if (allocator == ALLOC_NONE) {
		ret = ptr
	} else {
		ret = [typeof _malloc === "function" ? _malloc : Runtime.staticAlloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length))
	}
	if (zeroinit) {
		var ptr = ret,
			stop;
		assert((ret & 3) == 0);
		stop = ret + (size & ~3);
		for (; ptr < stop; ptr += 4) {
			HEAP32[ptr >> 2] = 0
		}
		stop = ret + size;
		while (ptr < stop) {
			HEAP8[ptr++ >> 0] = 0
		}
		return ret
	}
	if (singleType === "i8") {
		if (slab.subarray || slab.slice) {
			HEAPU8.set(slab, ret)
		} else {
			HEAPU8.set(new Uint8Array(slab), ret)
		}
		return ret
	}
	var i = 0,
		type, typeSize, previousType;
	while (i < size) {
		var curr = slab[i];
		if (typeof curr === "function") {
			curr = Runtime.getFunctionIndex(curr)
		}
		type = singleType || types[i];
		if (type === 0) {
			i++;
			continue
		}
		if (type == "i64") type = "i32";
		setValue(ret + i, curr, type);
		if (previousType !== type) {
			typeSize = Runtime.getNativeTypeSize(type);
			previousType = type
		}
		i += typeSize
	}
	return ret
}
Module["allocate"] = allocate;

function getMemory(size) {
	if (!staticSealed) return Runtime.staticAlloc(size);
	if (typeof _sbrk !== "undefined" && !_sbrk.called || !runtimeInitialized) return Runtime.dynamicAlloc(size);
	return _malloc(size)
}
Module["getMemory"] = getMemory;

function Pointer_stringify(ptr, length) {
	if (length === 0 || !ptr) return "";
	var hasUtf = 0;
	var t;
	var i = 0;
	while (1) {
		t = HEAPU8[ptr + i >> 0];
		hasUtf |= t;
		if (t == 0 && !length) break;
		i++;
		if (length && i == length) break
	}
	if (!length) length = i;
	var ret = "";
	if (hasUtf < 128) {
		var MAX_CHUNK = 1024;
		var curr;
		while (length > 0) {
			curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
			ret = ret ? ret + curr : curr;
			ptr += MAX_CHUNK;
			length -= MAX_CHUNK
		}
		return ret
	}
	return Module["UTF8ToString"](ptr)
}
Module["Pointer_stringify"] = Pointer_stringify;

function AsciiToString(ptr) {
	var str = "";
	while (1) {
		var ch = HEAP8[ptr++ >> 0];
		if (!ch) return str;
		str += String.fromCharCode(ch)
	}
}
Module["AsciiToString"] = AsciiToString;

function stringToAscii(str, outPtr) {
	return writeAsciiToMemory(str, outPtr, false)
}
Module["stringToAscii"] = stringToAscii;

function UTF8ArrayToString(u8Array, idx) {
	var u0, u1, u2, u3, u4, u5;
	var str = "";
	while (1) {
		u0 = u8Array[idx++];
		if (!u0) return str;
		if (!(u0 & 128)) {
			str += String.fromCharCode(u0);
			continue
		}
		u1 = u8Array[idx++] & 63;
		if ((u0 & 224) == 192) {
			str += String.fromCharCode((u0 & 31) << 6 | u1);
			continue
		}
		u2 = u8Array[idx++] & 63;
		if ((u0 & 240) == 224) {
			u0 = (u0 & 15) << 12 | u1 << 6 | u2
		} else {
			u3 = u8Array[idx++] & 63;
			if ((u0 & 248) == 240) {
				u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u3
			} else {
				u4 = u8Array[idx++] & 63;
				if ((u0 & 252) == 248) {
					u0 = (u0 & 3) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4
				} else {
					u5 = u8Array[idx++] & 63;
					u0 = (u0 & 1) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5
				}
			}
		}
		if (u0 < 65536) {
			str += String.fromCharCode(u0)
		} else {
			var ch = u0 - 65536;
			str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
		}
	}
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;

function UTF8ToString(ptr) {
	return UTF8ArrayToString(HEAPU8, ptr)
}
Module["UTF8ToString"] = UTF8ToString;

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
	if (!(maxBytesToWrite > 0)) return 0;
	var startIdx = outIdx;
	var endIdx = outIdx + maxBytesToWrite - 1;
	for (var i = 0; i < str.length; ++i) {
		var u = str.charCodeAt(i);
		if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
		if (u <= 127) {
			if (outIdx >= endIdx) break;
			outU8Array[outIdx++] = u
		} else if (u <= 2047) {
			if (outIdx + 1 >= endIdx) break;
			outU8Array[outIdx++] = 192 | u >> 6;
			outU8Array[outIdx++] = 128 | u & 63
		} else if (u <= 65535) {
			if (outIdx + 2 >= endIdx) break;
			outU8Array[outIdx++] = 224 | u >> 12;
			outU8Array[outIdx++] = 128 | u >> 6 & 63;
			outU8Array[outIdx++] = 128 | u & 63
		} else if (u <= 2097151) {
			if (outIdx + 3 >= endIdx) break;
			outU8Array[outIdx++] = 240 | u >> 18;
			outU8Array[outIdx++] = 128 | u >> 12 & 63;
			outU8Array[outIdx++] = 128 | u >> 6 & 63;
			outU8Array[outIdx++] = 128 | u & 63
		} else if (u <= 67108863) {
			if (outIdx + 4 >= endIdx) break;
			outU8Array[outIdx++] = 248 | u >> 24;
			outU8Array[outIdx++] = 128 | u >> 18 & 63;
			outU8Array[outIdx++] = 128 | u >> 12 & 63;
			outU8Array[outIdx++] = 128 | u >> 6 & 63;
			outU8Array[outIdx++] = 128 | u & 63
		} else {
			if (outIdx + 5 >= endIdx) break;
			outU8Array[outIdx++] = 252 | u >> 30;
			outU8Array[outIdx++] = 128 | u >> 24 & 63;
			outU8Array[outIdx++] = 128 | u >> 18 & 63;
			outU8Array[outIdx++] = 128 | u >> 12 & 63;
			outU8Array[outIdx++] = 128 | u >> 6 & 63;
			outU8Array[outIdx++] = 128 | u & 63
		}
	}
	outU8Array[outIdx] = 0;
	return outIdx - startIdx
}
Module["stringToUTF8Array"] = stringToUTF8Array;

function stringToUTF8(str, outPtr, maxBytesToWrite) {
	return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
}
Module["stringToUTF8"] = stringToUTF8;

function lengthBytesUTF8(str) {
	var len = 0;
	for (var i = 0; i < str.length; ++i) {
		var u = str.charCodeAt(i);
		if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
		if (u <= 127) {
			++len
		} else if (u <= 2047) {
			len += 2
		} else if (u <= 65535) {
			len += 3
		} else if (u <= 2097151) {
			len += 4
		} else if (u <= 67108863) {
			len += 5
		} else {
			len += 6
		}
	}
	return len
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;

function demangle(func) {
	var hasLibcxxabi = !!Module["___cxa_demangle"];
	if (hasLibcxxabi) {
		try {
			var buf = _malloc(func.length);
			writeStringToMemory(func.substr(1), buf);
			var status = _malloc(4);
			var ret = Module["___cxa_demangle"](buf, 0, 0, status);
			if (getValue(status, "i32") === 0 && ret) {
				return Pointer_stringify(ret)
			}
		} catch (e) {
			return func
		} finally {
			if (buf) _free(buf);
			if (status) _free(status);
			if (ret) _free(ret)
		}
	}
	Runtime.warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
	return func
}

function demangleAll(text) {
	return text.replace(/__Z[\w\d_]+/g, (function(x) {
		var y = demangle(x);
		return x === y ? x : x + " [" + y + "]"
	}))
}

function jsStackTrace() {
	var err = new Error;
	if (!err.stack) {
		try {
			throw new Error(0)
		} catch (e) {
			err = e
		}
		if (!err.stack) {
			return "(no stack trace available)"
		}
	}
	return err.stack.toString()
}

function stackTrace() {
	return demangleAll(jsStackTrace())
}
Module["stackTrace"] = stackTrace;
var PAGE_SIZE = 4096;

function alignMemoryPage(x) {
	if (x % 4096 > 0) {
		x += 4096 - x % 4096
	}
	return x
}
var HEAP;
var buffer;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateGlobalBufferViews() {
	Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
	Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
	Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
	Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
	Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
	Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
	Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
	Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer)
}
var STATIC_BASE = 0,
	STATICTOP = 0,
	staticSealed = false;
var STACK_BASE = 0,
	STACKTOP = 0,
	STACK_MAX = 0;
var DYNAMIC_BASE = 0,
	DYNAMICTOP = 0;

function abortOnCannotGrowMemory() {
	abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")
}

function enlargeMemory() {
	abortOnCannotGrowMemory()
}
var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 268435456;
var totalMemory = 64 * 1024;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2 * TOTAL_STACK) {
	if (totalMemory < 16 * 1024 * 1024) {
		totalMemory *= 2
	} else {
		totalMemory += 16 * 1024 * 1024
	}
}
if (totalMemory !== TOTAL_MEMORY) {
	TOTAL_MEMORY = totalMemory
}
if (Module["buffer"]) {
	buffer = Module["buffer"]
} else {
	buffer = new ArrayBuffer(TOTAL_MEMORY)
}
updateGlobalBufferViews();
HEAP32[0] = 255;
if (HEAPU8[0] !== 255 || HEAPU8[3] !== 0) throw "Typed arrays 2 must be run on a little-endian system";
Module["HEAP"] = HEAP;
Module["buffer"] = buffer;
Module["HEAP8"] = HEAP8;
Module["HEAP16"] = HEAP16;
Module["HEAP32"] = HEAP32;
Module["HEAPU8"] = HEAPU8;
Module["HEAPU16"] = HEAPU16;
Module["HEAPU32"] = HEAPU32;
Module["HEAPF32"] = HEAPF32;
Module["HEAPF64"] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
	while (callbacks.length > 0) {
		var callback = callbacks.shift();
		if (typeof callback == "function") {
			callback();
			continue
		}
		var func = callback.func;
		if (typeof func === "number") {
			if (callback.arg === undefined) {
				Runtime.dynCall("v", func)
			} else {
				Runtime.dynCall("vi", func, [callback.arg])
			}
		} else {
			func(callback.arg === undefined ? null : callback.arg)
		}
	}
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {
	if (Module["preRun"]) {
		if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
		while (Module["preRun"].length) {
			addOnPreRun(Module["preRun"].shift())
		}
	}
	callRuntimeCallbacks(__ATPRERUN__)
}

function ensureInitRuntime() {
	if (runtimeInitialized) return;
	runtimeInitialized = true;
	callRuntimeCallbacks(__ATINIT__)
}

function preMain() {
	callRuntimeCallbacks(__ATMAIN__)
}

function exitRuntime() {
	callRuntimeCallbacks(__ATEXIT__);
	runtimeExited = true
}

function postRun() {
	if (Module["postRun"]) {
		if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
		while (Module["postRun"].length) {
			addOnPostRun(Module["postRun"].shift())
		}
	}
	callRuntimeCallbacks(__ATPOSTRUN__)
}

function addOnPreRun(cb) {
	__ATPRERUN__.unshift(cb)
}
Module["addOnPreRun"] = addOnPreRun;

function addOnInit(cb) {
	__ATINIT__.unshift(cb)
}
Module["addOnInit"] = addOnInit;

function addOnPreMain(cb) {
	__ATMAIN__.unshift(cb)
}
Module["addOnPreMain"] = addOnPreMain;

function addOnExit(cb) {
	__ATEXIT__.unshift(cb)
}
Module["addOnExit"] = addOnExit;

function addOnPostRun(cb) {
	__ATPOSTRUN__.unshift(cb)
}
Module["addOnPostRun"] = addOnPostRun;

function intArrayFromString(stringy, dontAddNull, length) {
	var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
	var u8array = new Array(len);
	var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
	if (dontAddNull) u8array.length = numBytesWritten;
	return u8array
}
Module["intArrayFromString"] = intArrayFromString;

function intArrayToString(array) {
	var ret = [];
	for (var i = 0; i < array.length; i++) {
		var chr = array[i];
		if (chr > 255) {
			chr &= 255
		}
		ret.push(String.fromCharCode(chr))
	}
	return ret.join("")
}
Module["intArrayToString"] = intArrayToString;

function writeStringToMemory(string, buffer, dontAddNull) {
	var array = intArrayFromString(string, dontAddNull);
	var i = 0;
	while (i < array.length) {
		var chr = array[i];
		HEAP8[buffer + i >> 0] = chr;
		i = i + 1
	}
}
Module["writeStringToMemory"] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
	for (var i = 0; i < array.length; i++) {
		HEAP8[buffer++ >> 0] = array[i]
	}
}
Module["writeArrayToMemory"] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
	for (var i = 0; i < str.length; ++i) {
		HEAP8[buffer++ >> 0] = str.charCodeAt(i)
	}
	if (!dontAddNull) HEAP8[buffer >> 0] = 0
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;
if (!Math["imul"] || Math["imul"](4294967295, 5) !== -5) Math["imul"] = function imul(a, b) {
	var ah = a >>> 16;
	var al = a & 65535;
	var bh = b >>> 16;
	var bl = b & 65535;
	return al * bl + (ah * bl + al * bh << 16) | 0
};
Math.imul = Math["imul"];
if (!Math["clz32"]) Math["clz32"] = (function(x) {
	x = x >>> 0;
	for (var i = 0; i < 32; i++) {
		if (x & 1 << 31 - i) return i
	}
	return 32
});
Math.clz32 = Math["clz32"];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;

function getUniqueRunDependency(id) {
	return id
}

function addRunDependency(id) {
	runDependencies++;
	if (Module["monitorRunDependencies"]) {
		Module["monitorRunDependencies"](runDependencies)
	}
}
Module["addRunDependency"] = addRunDependency;

function removeRunDependency(id) {
	runDependencies--;
	if (Module["monitorRunDependencies"]) {
		Module["monitorRunDependencies"](runDependencies)
	}
	if (runDependencies == 0) {
		if (runDependencyWatcher !== null) {
			clearInterval(runDependencyWatcher);
			runDependencyWatcher = null
		}
		if (dependenciesFulfilled) {
			var callback = dependenciesFulfilled;
			dependenciesFulfilled = null;
			callback()
		}
	}
}


Module["removeRunDependency"] = removeRunDependency;
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var memoryInitializer = null;
var ASM_CONSTS = [(function() {
	{
		return Module["canvas"].width
	}
}), (function() {
	{
		return Module["canvas"].height
	}
}), (function() {
	{
		var unlockSoundContext = (function() {
			if (AL.currentContext) {
				if (AL.currentContext.ctx.currentTime == 0) {
					var buffer = AL.currentContext.ctx.createBuffer(1, 1, 22050);
					var source = AL.currentContext.ctx.createBufferSource();
					source.buffer = buffer;
					source.connect(AL.currentContext.ctx.destination);
					if (typeof source.start !== "undefined") source.start(0);
					else if (typeof source.noteOn !== "undefined") source.noteOn(0)
				}
				window.removeEventListener("touchstart", unlockSoundContext, false)
			}
		});
		var unlockMusicContext = (function() {
			if (SDL.audioContext) {
				if (SDL.audioContext.currentTime == 0) {
					var buffer = SDL.audioContext.createBuffer(1, 1, 22050);
					var source = SDL.audioContext.createBufferSource();
					source.buffer = buffer;
					source.connect(SDL.audioContext.destination);
					if (typeof source.start !== "undefined") source.start(0);
					else if (typeof source.noteOn !== "undefined") source.noteOn(0)
				}
				window.removeEventListener("touchstart", unlockMusicContext, false)
			}
		});
		window.addEventListener("touchstart", unlockSoundContext, false);
		window.addEventListener("touchstart", unlockMusicContext, false)
	}
}), (function() {
	{
		return Browser.isFullScreen ? 1 : 0
	}
}), (function() {
	{
		return window.devicePixelRatio
	}
}), (function() {
	{
		return screen.width
	}
}), (function() {
	{
		return screen.height
	}
}), (function() {
	{
		var width = document.documentElement.clientWidth;
		return width
	}
}), (function() {
	{
		var height = document.documentElement.clientHeight;
		return height
	}
}), (function($0) {
	{
		window.open(Pointer_stringify($0), "_blank")
	}
}), (function($0) {
	{
		var video = document.getElementById("AGKVideo");
		if (video == null) console.log("AGKVideo tag is missing on this page, videos will not play");
		video.autoplay = false;
		video.loop = false;
		video.muted = false;
		video.src = Pointer_stringify($0)
	}
}), (function() {
	{
		var video = document.getElementById("AGKVideo");
		if (video != null) {
			video.pause();
			video.src = ""
		}
	}
}), (function($0) {
	{
		var video = document.getElementById("AGKVideo");
		if (video != null) {
			if (video.src != null && video.src != "" && !video.ended) {
				var canvas = document.getElementById("canvas");
				var gl = canvas.getContext("webgl");
				gl.bindTexture(gl.TEXTURE_2D, GL.textures[$0]);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
			}
		}
	}
}), (function() {
	{
		var video = document.getElementById("AGKVideo");
		if (video != null) {
			video.play()
		}
	}
}), (function() {
	{
		var video = document.getElementById("AGKVideo");
		if (video != null) {
			video.pause()
		}
	}
}), (function() {
	{
		var video = document.getElementById("AGKVideo");
		var result = 0;
		if (video != null && video.src != null && video.src != "" && !video.ended) result = 1;
		return result
	}
}), (function() {
	{
		var video = document.getElementById("AGKVideo");
		if (video == null || video.src == null || video.src == "") return 0;
		else return video.currentTime
	}
}), (function() {
	{
		var video = document.getElementById("AGKVideo");
		if (video == null || video.src == null || video.src == "") return 0;
		else return video.duration
	}
}), (function($0) {
	{
		var video = document.getElementById("AGKVideo");
		if (video != null) video.volume = $0 / 100
	}
}), (function() {
	{
		var video = document.getElementById("AGKVideo");
		if (video == null || video.src == null || video.src == "") return 0;
		else return video.width
	}
}), (function() {
	{
		var video = document.getElementById("AGKVideo");
		if (video == null || video.src == null || video.src == "") return 0;
		else return video.height
	}
}), (function($0) {
	{
		var video = document.getElementById("AGKVideo");
		if (video != null && video.src != null && video.src != "") video.currentTime = $0
	}
}), (function($0) {
	{
		console.log(Pointer_stringify($0))
	}
}), (function($0) {
	{
		alert(Pointer_stringify($0))
	}
}), (function($0, $1) {
	{	
		var cookieName = UTF8ToString($0);
		var cookieValue = UTF8ToString($1);
		var d = new Date;
		
		d.setTime(d.getTime() + 5 * 365 * 24 * 60 * 60 * 1e3);
		var expires = "expires=" + d.toUTCString();
		document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/"
	}
}), (function($0, $1) {
	{
		var cookieName = UTF8ToString($0);
		var returnValue = UTF8ToString($1);
		var name = cookieName + "=";
		var ca = document.cookie.split(";");
		
		if (cookieName.indexOf("call") == 0){
			let result = eval(returnValue);
			
			if (result == undefined){
				returnValue = ""
			}else{
				returnValue = result.toString();
			}
			
		}else if (cookieName.indexOf("resize") == 0 ){
			if (__resize == true ){
				__resize = false
				returnValue = "1" //true
			}else{
				returnValue = "0" //false
			}
		}else if (cookieName.indexOf("web") == 0 ){
			if (returnValue.indexOf("width") == 0 ){
				returnValue = window.innerWidth.toString();
			
			} else if (returnValue.indexOf("height") == 0 ){
				
				returnValue = window.innerHeight.toString();
			}
		}else{
			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == " ") {
					c = c.substring(1)
				}
				if (c.indexOf(name) == 0) {
					returnValue = c.substring(name.length, c.length);
					break
				}
			}
		}
		var lengthBytes = lengthBytesUTF8(returnValue) + 1;
		var heapString = _malloc(lengthBytes);
		stringToUTF8(returnValue, heapString, lengthBytes);
		return heapString
		
	}
}), (function($0) {
	{
		document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
	}
})];

function _emscripten_asm_const_d(code) {
	return ASM_CONSTS[code]()
}

function _emscripten_asm_const_i(code) {
	return ASM_CONSTS[code]()
}

function _emscripten_asm_const_ii(code, a0) {
	return ASM_CONSTS[code](a0)
}

function _emscripten_asm_const_v(code) {
	return ASM_CONSTS[code]()
}

function _emscripten_asm_const_iii(code, a0, a1) {
	return ASM_CONSTS[code](a0, a1)
}

function _emscripten_asm_const_id(code, a0) {
	return ASM_CONSTS[code](a0)
}
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 696304;
__ATINIT__.push({
	func: (function() {
		__GLOBAL__sub_I_interpreter_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_Wrapper_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_ZipFile_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_HTML5Network_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_HTML5Core_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_Assimp_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_ObjFileParser_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_FBXImporter_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_ContactReport_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_DynamicsWorld_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_AGKShader_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_cTouch_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_ObjFileMtlImporter_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_FBXMeshGeometry_cpp()
	})
}, {
	func: (function() {
		__GLOBAL__sub_I_btQuickprof_cpp()
	})
});
memoryInitializer = "AGKPlayer.html.mem";
var tempDoublePtr = STATICTOP;
STATICTOP += 16;
var ERRNO_CODES = {
	EPERM: 1,
	ENOENT: 2,
	ESRCH: 3,
	EINTR: 4,
	EIO: 5,
	ENXIO: 6,
	E2BIG: 7,
	ENOEXEC: 8,
	EBADF: 9,
	ECHILD: 10,
	EAGAIN: 11,
	EWOULDBLOCK: 11,
	ENOMEM: 12,
	EACCES: 13,
	EFAULT: 14,
	ENOTBLK: 15,
	EBUSY: 16,
	EEXIST: 17,
	EXDEV: 18,
	ENODEV: 19,
	ENOTDIR: 20,
	EISDIR: 21,
	EINVAL: 22,
	ENFILE: 23,
	EMFILE: 24,
	ENOTTY: 25,
	ETXTBSY: 26,
	EFBIG: 27,
	ENOSPC: 28,
	ESPIPE: 29,
	EROFS: 30,
	EMLINK: 31,
	EPIPE: 32,
	EDOM: 33,
	ERANGE: 34,
	ENOMSG: 42,
	EIDRM: 43,
	ECHRNG: 44,
	EL2NSYNC: 45,
	EL3HLT: 46,
	EL3RST: 47,
	ELNRNG: 48,
	EUNATCH: 49,
	ENOCSI: 50,
	EL2HLT: 51,
	EDEADLK: 35,
	ENOLCK: 37,
	EBADE: 52,
	EBADR: 53,
	EXFULL: 54,
	ENOANO: 55,
	EBADRQC: 56,
	EBADSLT: 57,
	EDEADLOCK: 35,
	EBFONT: 59,
	ENOSTR: 60,
	ENODATA: 61,
	ETIME: 62,
	ENOSR: 63,
	ENONET: 64,
	ENOPKG: 65,
	EREMOTE: 66,
	ENOLINK: 67,
	EADV: 68,
	ESRMNT: 69,
	ECOMM: 70,
	EPROTO: 71,
	EMULTIHOP: 72,
	EDOTDOT: 73,
	EBADMSG: 74,
	ENOTUNIQ: 76,
	EBADFD: 77,
	EREMCHG: 78,
	ELIBACC: 79,
	ELIBBAD: 80,
	ELIBSCN: 81,
	ELIBMAX: 82,
	ELIBEXEC: 83,
	ENOSYS: 38,
	ENOTEMPTY: 39,
	ENAMETOOLONG: 36,
	ELOOP: 40,
	EOPNOTSUPP: 95,
	EPFNOSUPPORT: 96,
	ECONNRESET: 104,
	ENOBUFS: 105,
	EAFNOSUPPORT: 97,
	EPROTOTYPE: 91,
	ENOTSOCK: 88,
	ENOPROTOOPT: 92,
	ESHUTDOWN: 108,
	ECONNREFUSED: 111,
	EADDRINUSE: 98,
	ECONNABORTED: 103,
	ENETUNREACH: 101,
	ENETDOWN: 100,
	ETIMEDOUT: 110,
	EHOSTDOWN: 112,
	EHOSTUNREACH: 113,
	EINPROGRESS: 115,
	EALREADY: 114,
	EDESTADDRREQ: 89,
	EMSGSIZE: 90,
	EPROTONOSUPPORT: 93,
	ESOCKTNOSUPPORT: 94,
	EADDRNOTAVAIL: 99,
	ENETRESET: 102,
	EISCONN: 106,
	ENOTCONN: 107,
	ETOOMANYREFS: 109,
	EUSERS: 87,
	EDQUOT: 122,
	ESTALE: 116,
	ENOTSUP: 95,
	ENOMEDIUM: 123,
	EILSEQ: 84,
	EOVERFLOW: 75,
	ECANCELED: 125,
	ENOTRECOVERABLE: 131,
	EOWNERDEAD: 130,
	ESTRPIPE: 86
};
var ERRNO_MESSAGES = {
	0: "Success",
	1: "Not super-user",
	2: "No such file or directory",
	3: "No such process",
	4: "Interrupted system call",
	5: "I/O error",
	6: "No such device or address",
	7: "Arg list too long",
	8: "Exec format error",
	9: "Bad file number",
	10: "No children",
	11: "No more processes",
	12: "Not enough core",
	13: "Permission denied",
	14: "Bad address",
	15: "Block device required",
	16: "Mount device busy",
	17: "File exists",
	18: "Cross-device link",
	19: "No such device",
	20: "Not a directory",
	21: "Is a directory",
	22: "Invalid argument",
	23: "Too many open files in system",
	24: "Too many open files",
	25: "Not a typewriter",
	26: "Text file busy",
	27: "File too large",
	28: "No space left on device",
	29: "Illegal seek",
	30: "Read only file system",
	31: "Too many links",
	32: "Broken pipe",
	33: "Math arg out of domain of func",
	34: "Math result not representable",
	35: "File locking deadlock error",
	36: "File or path name too long",
	37: "No record locks available",
	38: "Function not implemented",
	39: "Directory not empty",
	40: "Too many symbolic links",
	42: "No message of desired type",
	43: "Identifier removed",
	44: "Channel number out of range",
	45: "Level 2 not synchronized",
	46: "Level 3 halted",
	47: "Level 3 reset",
	48: "Link number out of range",
	49: "Protocol driver not attached",
	50: "No CSI structure available",
	51: "Level 2 halted",
	52: "Invalid exchange",
	53: "Invalid request descriptor",
	54: "Exchange full",
	55: "No anode",
	56: "Invalid request code",
	57: "Invalid slot",
	59: "Bad font file fmt",
	60: "Device not a stream",
	61: "No data (for no delay io)",
	62: "Timer expired",
	63: "Out of streams resources",
	64: "Machine is not on the network",
	65: "Package not installed",
	66: "The object is remote",
	67: "The link has been severed",
	68: "Advertise error",
	69: "Srmount error",
	70: "Communication error on send",
	71: "Protocol error",
	72: "Multihop attempted",
	73: "Cross mount point (not really error)",
	74: "Trying to read unreadable message",
	75: "Value too large for defined data type",
	76: "Given log. name not unique",
	77: "f.d. invalid for this operation",
	78: "Remote address changed",
	79: "Can   access a needed shared lib",
	80: "Accessing a corrupted shared lib",
	81: ".lib section in a.out corrupted",
	82: "Attempting to link in too many libs",
	83: "Attempting to exec a shared library",
	84: "Illegal byte sequence",
	86: "Streams pipe error",
	87: "Too many users",
	88: "Socket operation on non-socket",
	89: "Destination address required",
	90: "Message too long",
	91: "Protocol wrong type for socket",
	92: "Protocol not available",
	93: "Unknown protocol",
	94: "Socket type not supported",
	95: "Not supported",
	96: "Protocol family not supported",
	97: "Address family not supported by protocol family",
	98: "Address already in use",
	99: "Address not available",
	100: "Network interface is not configured",
	101: "Network is unreachable",
	102: "Connection reset by network",
	103: "Connection aborted",
	104: "Connection reset by peer",
	105: "No buffer space available",
	106: "Socket is already connected",
	107: "Socket is not connected",
	108: "Can't send after socket shutdown",
	109: "Too many references",
	110: "Connection timed out",
	111: "Connection refused",
	112: "Host is down",
	113: "Host is unreachable",
	114: "Socket already connected",
	115: "Connection already in progress",
	116: "Stale file handle",
	122: "Quota exceeded",
	123: "No medium (in tape drive)",
	125: "Operation canceled",
	130: "Previous owner died",
	131: "State not recoverable"
};

function ___setErrNo(value) {
	if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value;
	return value
}
var PATH = {
	splitPath: (function(filename) {
		var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
		return splitPathRe.exec(filename).slice(1)
	}),
	normalizeArray: (function(parts, allowAboveRoot) {
		var up = 0;
		for (var i = parts.length - 1; i >= 0; i--) {
			var last = parts[i];
			if (last === ".") {
				parts.splice(i, 1)
			} else if (last === "..") {
				parts.splice(i, 1);
				up++
			} else if (up) {
				parts.splice(i, 1);
				up--
			}
		}
		if (allowAboveRoot) {
			for (; up--; up) {
				parts.unshift("..")
			}
		}
		return parts
	}),
	normalize: (function(path) {
		var isAbsolute = path.charAt(0) === "/",
			trailingSlash = path.substr(-1) === "/";
		path = PATH.normalizeArray(path.split("/").filter((function(p) {
			return !!p
		})), !isAbsolute).join("/");
		if (!path && !isAbsolute) {
			path = "."
		}
		if (path && trailingSlash) {
			path += "/"
		}
		return (isAbsolute ? "/" : "") + path
	}),
	dirname: (function(path) {
		var result = PATH.splitPath(path),
			root = result[0],
			dir = result[1];
		if (!root && !dir) {
			return "."
		}
		if (dir) {
			dir = dir.substr(0, dir.length - 1)
		}
		return root + dir
	}),
	basename: (function(path) {
		if (path === "/") return "/";
		var lastSlash = path.lastIndexOf("/");
		if (lastSlash === -1) return path;
		return path.substr(lastSlash + 1)
	}),
	extname: (function(path) {
		return PATH.splitPath(path)[3]
	}),
	join: (function() {
		var paths = Array.prototype.slice.call(arguments, 0);
		return PATH.normalize(paths.join("/"))
	}),
	join2: (function(l, r) {
		return PATH.normalize(l + "/" + r)
	}),
	resolve: (function() {
		var resolvedPath = "",
			resolvedAbsolute = false;
		for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
			var path = i >= 0 ? arguments[i] : FS.cwd();
			if (typeof path !== "string") {
				throw new TypeError("Arguments to path.resolve must be strings")
			} else if (!path) {
				return ""
			}
			resolvedPath = path + "/" + resolvedPath;
			resolvedAbsolute = path.charAt(0) === "/"
		}
		resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((function(p) {
			return !!p
		})), !resolvedAbsolute).join("/");
		return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
	}),
	relative: (function(from, to) {
		from = PATH.resolve(from).substr(1);
		to = PATH.resolve(to).substr(1);

		function trim(arr) {
			var start = 0;
			for (; start < arr.length; start++) {
				if (arr[start] !== "") break
			}
			var end = arr.length - 1;
			for (; end >= 0; end--) {
				if (arr[end] !== "") break
			}
			if (start > end) return [];
			return arr.slice(start, end - start + 1)
		}
		var fromParts = trim(from.split("/"));
		var toParts = trim(to.split("/"));
		var length = Math.min(fromParts.length, toParts.length);
		var samePartsLength = length;
		for (var i = 0; i < length; i++) {
			if (fromParts[i] !== toParts[i]) {
				samePartsLength = i;
				break
			}
		}
		var outputParts = [];
		for (var i = samePartsLength; i < fromParts.length; i++) {
			outputParts.push("..")
		}
		outputParts = outputParts.concat(toParts.slice(samePartsLength));
		return outputParts.join("/")
	})
};
var TTY = {
	ttys: [],
	init: (function() {}),
	shutdown: (function() {}),
	register: (function(dev, ops) {
		TTY.ttys[dev] = {
			input: [],
			output: [],
			ops: ops
		};
		FS.registerDevice(dev, TTY.stream_ops)
	}),
	stream_ops: {
		open: (function(stream) {
			var tty = TTY.ttys[stream.node.rdev];
			if (!tty) {
				throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
			}
			stream.tty = tty;
			stream.seekable = false
		}),
		close: (function(stream) {
			stream.tty.ops.flush(stream.tty)
		}),
		flush: (function(stream) {
			stream.tty.ops.flush(stream.tty)
		}),
		read: (function(stream, buffer, offset, length, pos) {
			if (!stream.tty || !stream.tty.ops.get_char) {
				throw new FS.ErrnoError(ERRNO_CODES.ENXIO)
			}
			var bytesRead = 0;
			for (var i = 0; i < length; i++) {
				var result;
				try {
					result = stream.tty.ops.get_char(stream.tty)
				} catch (e) {
					throw new FS.ErrnoError(ERRNO_CODES.EIO)
				}
				if (result === undefined && bytesRead === 0) {
					throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
				}
				if (result === null || result === undefined) break;
				bytesRead++;
				buffer[offset + i] = result
			}
			if (bytesRead) {
				stream.node.timestamp = Date.now()
			}
			return bytesRead
		}),
		write: (function(stream, buffer, offset, length, pos) {
			if (!stream.tty || !stream.tty.ops.put_char) {
				throw new FS.ErrnoError(ERRNO_CODES.ENXIO)
			}
			for (var i = 0; i < length; i++) {
				try {
					stream.tty.ops.put_char(stream.tty, buffer[offset + i])
				} catch (e) {
					throw new FS.ErrnoError(ERRNO_CODES.EIO)
				}
			}
			if (length) {
				stream.node.timestamp = Date.now()
			}
			return i
		})
	},
	default_tty_ops: {
		get_char: (function(tty) {
			if (!tty.input.length) {
				var result = null;
				if (ENVIRONMENT_IS_NODE) {
					var BUFSIZE = 256;
					var buf = new Buffer(BUFSIZE);
					var bytesRead = 0;
					var fd = process.stdin.fd;
					var usingDevice = false;
					try {
						fd = fs.openSync("/dev/stdin", "r");
						usingDevice = true
					} catch (e) {}
					bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
					if (usingDevice) {
						fs.closeSync(fd)
					}
					if (bytesRead > 0) {
						result = buf.slice(0, bytesRead).toString("utf-8")
					} else {
						result = null
					}
				} else if (typeof window != "undefined" && typeof window.prompt == "function") {
					result = window.prompt("Input: ");
					if (result !== null) {
						result += "\n"
					}
				} else if (typeof readline == "function") {
					result = readline();
					if (result !== null) {
						result += "\n"
					}
				}
				if (!result) {
					return null
				}
				tty.input = intArrayFromString(result, true)
			}
			return tty.input.shift()
		}),
		put_char: (function(tty, val) {
			if (val === null || val === 10) {
				Module["print"](UTF8ArrayToString(tty.output, 0));
				tty.output = []
			} else {
				if (val != 0) tty.output.push(val)
			}
		}),
		flush: (function(tty) {
			if (tty.output && tty.output.length > 0) {
				Module["print"](UTF8ArrayToString(tty.output, 0));
				tty.output = []
			}
		})
	},
	default_tty1_ops: {
		put_char: (function(tty, val) {
			if (val === null || val === 10) {
				Module["printErr"](UTF8ArrayToString(tty.output, 0));
				tty.output = []
			} else {
				if (val != 0) tty.output.push(val)
			}
		}),
		flush: (function(tty) {
			if (tty.output && tty.output.length > 0) {
				Module["printErr"](UTF8ArrayToString(tty.output, 0));
				tty.output = []
			}
		})
	}
};
var MEMFS = {
	ops_table: null,
	mount: (function(mount) {
		return MEMFS.createNode(null, "/", 16384 | 511, 0)
	}),
	createNode: (function(parent, name, mode, dev) {
		if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}
		if (!MEMFS.ops_table) {
			MEMFS.ops_table = {
				dir: {
					node: {
						getattr: MEMFS.node_ops.getattr,
						setattr: MEMFS.node_ops.setattr,
						lookup: MEMFS.node_ops.lookup,
						mknod: MEMFS.node_ops.mknod,
						rename: MEMFS.node_ops.rename,
						unlink: MEMFS.node_ops.unlink,
						rmdir: MEMFS.node_ops.rmdir,
						readdir: MEMFS.node_ops.readdir,
						symlink: MEMFS.node_ops.symlink
					},
					stream: {
						llseek: MEMFS.stream_ops.llseek
					}
				},
				file: {
					node: {
						getattr: MEMFS.node_ops.getattr,
						setattr: MEMFS.node_ops.setattr
					},
					stream: {
						llseek: MEMFS.stream_ops.llseek,
						read: MEMFS.stream_ops.read,
						write: MEMFS.stream_ops.write,
						allocate: MEMFS.stream_ops.allocate,
						mmap: MEMFS.stream_ops.mmap,
						msync: MEMFS.stream_ops.msync
					}
				},
				link: {
					node: {
						getattr: MEMFS.node_ops.getattr,
						setattr: MEMFS.node_ops.setattr,
						readlink: MEMFS.node_ops.readlink
					},
					stream: {}
				},
				chrdev: {
					node: {
						getattr: MEMFS.node_ops.getattr,
						setattr: MEMFS.node_ops.setattr
					},
					stream: FS.chrdev_stream_ops
				}
			}
		}
		var node = FS.createNode(parent, name, mode, dev);
		if (FS.isDir(node.mode)) {
			node.node_ops = MEMFS.ops_table.dir.node;
			node.stream_ops = MEMFS.ops_table.dir.stream;
			node.contents = {}
		} else if (FS.isFile(node.mode)) {
			node.node_ops = MEMFS.ops_table.file.node;
			node.stream_ops = MEMFS.ops_table.file.stream;
			node.usedBytes = 0;
			node.contents = null
		} else if (FS.isLink(node.mode)) {
			node.node_ops = MEMFS.ops_table.link.node;
			node.stream_ops = MEMFS.ops_table.link.stream
		} else if (FS.isChrdev(node.mode)) {
			node.node_ops = MEMFS.ops_table.chrdev.node;
			node.stream_ops = MEMFS.ops_table.chrdev.stream
		}
		node.timestamp = Date.now();
		if (parent) {
			parent.contents[name] = node
		}
		return node
	}),
	getFileDataAsRegularArray: (function(node) {
		if (node.contents && node.contents.subarray) {
			var arr = [];
			for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
			return arr
		}
		return node.contents
	}),
	getFileDataAsTypedArray: (function(node) {
		if (!node.contents) return new Uint8Array;
		if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
		return new Uint8Array(node.contents)
	}),
	expandFileStorage: (function(node, newCapacity) {
		if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
			node.contents = MEMFS.getFileDataAsRegularArray(node);
			node.usedBytes = node.contents.length
		}
		if (!node.contents || node.contents.subarray) {
			var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
			if (prevCapacity >= newCapacity) return;
			var CAPACITY_DOUBLING_MAX = 1024 * 1024;
			newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) | 0);
			if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
			var oldContents = node.contents;
			node.contents = new Uint8Array(newCapacity);
			if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
			return
		}
		if (!node.contents && newCapacity > 0) node.contents = [];
		while (node.contents.length < newCapacity) node.contents.push(0)
	}),
	resizeFileStorage: (function(node, newSize) {
		if (node.usedBytes == newSize) return;
		if (newSize == 0) {
			node.contents = null;
			node.usedBytes = 0;
			return
		}
		if (!node.contents || node.contents.subarray) {
			var oldContents = node.contents;
			node.contents = new Uint8Array(new ArrayBuffer(newSize));
			if (oldContents) {
				node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
			}
			node.usedBytes = newSize;
			return
		}
		if (!node.contents) node.contents = [];
		if (node.contents.length > newSize) node.contents.length = newSize;
		else
			while (node.contents.length < newSize) node.contents.push(0);
		node.usedBytes = newSize
	}),
	node_ops: {
		getattr: (function(node) {
			var attr = {};
			attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
			attr.ino = node.id;
			attr.mode = node.mode;
			attr.nlink = 1;
			attr.uid = 0;
			attr.gid = 0;
			attr.rdev = node.rdev;
			if (FS.isDir(node.mode)) {
				attr.size = 4096
			} else if (FS.isFile(node.mode)) {
				attr.size = node.usedBytes
			} else if (FS.isLink(node.mode)) {
				attr.size = node.link.length
			} else {
				attr.size = 0
			}
			attr.atime = new Date(node.timestamp);
			attr.mtime = new Date(node.timestamp);
			attr.ctime = new Date(node.timestamp);
			attr.blksize = 4096;
			attr.blocks = Math.ceil(attr.size / attr.blksize);
			return attr
		}),
		setattr: (function(node, attr) {
			if (attr.mode !== undefined) {
				node.mode = attr.mode
			}
			if (attr.timestamp !== undefined) {
				node.timestamp = attr.timestamp
			}
			if (attr.size !== undefined) {
				MEMFS.resizeFileStorage(node, attr.size)
			}
		}),
		lookup: (function(parent, name) {
			throw FS.genericErrors[ERRNO_CODES.ENOENT]
		}),
		mknod: (function(parent, name, mode, dev) {
			return MEMFS.createNode(parent, name, mode, dev)
		}),
		rename: (function(old_node, new_dir, new_name) {
			if (FS.isDir(old_node.mode)) {
				var new_node;
				try {
					new_node = FS.lookupNode(new_dir, new_name)
				} catch (e) {}
				if (new_node) {
					for (var i in new_node.contents) {
						throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
					}
				}
			}
			delete old_node.parent.contents[old_node.name];
			old_node.name = new_name;
			new_dir.contents[new_name] = old_node;
			old_node.parent = new_dir
		}),
		unlink: (function(parent, name) {
			delete parent.contents[name]
		}),
		rmdir: (function(parent, name) {
			var node = FS.lookupNode(parent, name);
			for (var i in node.contents) {
				throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
			}
			delete parent.contents[name]
		}),
		readdir: (function(node) {
			var entries = [".", ".."];
			for (var key in node.contents) {
				if (!node.contents.hasOwnProperty(key)) {
					continue
				}
				entries.push(key)
			}
			return entries
		}),
		symlink: (function(parent, newname, oldpath) {
			var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
			node.link = oldpath;
			return node
		}),
		readlink: (function(node) {
			if (!FS.isLink(node.mode)) {
				throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
			}
			return node.link
		})
	},
	stream_ops: {
		read: (function(stream, buffer, offset, length, position) {
			var contents = stream.node.contents;
			if (position >= stream.node.usedBytes) return 0;
			var size = Math.min(stream.node.usedBytes - position, length);
			assert(size >= 0);
			if (size > 8 && contents.subarray) {
				buffer.set(contents.subarray(position, position + size), offset)
			} else {
				for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
			}
			return size
		}),
		write: (function(stream, buffer, offset, length, position, canOwn) {
			if (!length) return 0;
			var node = stream.node;
			node.timestamp = Date.now();
			if (buffer.subarray && (!node.contents || node.contents.subarray)) {
				if (canOwn) {
					node.contents = buffer.subarray(offset, offset + length);
					node.usedBytes = length;
					return length
				} else if (node.usedBytes === 0 && position === 0) {
					node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
					node.usedBytes = length;
					return length
				} else if (position + length <= node.usedBytes) {
					node.contents.set(buffer.subarray(offset, offset + length), position);
					return length
				}
			}
			MEMFS.expandFileStorage(node, position + length);
			if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position);
			else {
				for (var i = 0; i < length; i++) {
					node.contents[position + i] = buffer[offset + i]
				}
			}
			node.usedBytes = Math.max(node.usedBytes, position + length);
			return length
		}),
		llseek: (function(stream, offset, whence) {
			var position = offset;
			if (whence === 1) {
				position += stream.position
			} else if (whence === 2) {
				if (FS.isFile(stream.node.mode)) {
					position += stream.node.usedBytes
				}
			}
			if (position < 0) {
				throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
			}
			return position
		}),
		allocate: (function(stream, offset, length) {
			MEMFS.expandFileStorage(stream.node, offset + length);
			stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
		}),
		mmap: (function(stream, buffer, offset, length, position, prot, flags) {
			if (!FS.isFile(stream.node.mode)) {
				throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
			}
			var ptr;
			var allocated;
			var contents = stream.node.contents;
			if (!(flags & 2) && (contents.buffer === buffer || contents.buffer === buffer.buffer)) {
				allocated = false;
				ptr = contents.byteOffset
			} else {
				if (position > 0 || position + length < stream.node.usedBytes) {
					if (contents.subarray) {
						contents = contents.subarray(position, position + length)
					} else {
						contents = Array.prototype.slice.call(contents, position, position + length)
					}
				}
				allocated = true;
				ptr = _malloc(length);
				if (!ptr) {
					throw new FS.ErrnoError(ERRNO_CODES.ENOMEM)
				}
				buffer.set(contents, ptr)
			}
			return {
				ptr: ptr,
				allocated: allocated
			}
		}),
		msync: (function(stream, buffer, offset, length, mmapFlags) {
			if (!FS.isFile(stream.node.mode)) {
				throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
			}
			if (mmapFlags & 2) {
				return 0
			}
			var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
			return 0
		})
	}
};
var IDBFS = {
	dbs: {},
	indexedDB: (function() {
		if (typeof indexedDB !== "undefined") return indexedDB;
		var ret = null;
		if (typeof window === "object") ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
		assert(ret, "IDBFS used, but indexedDB not supported");
		return ret
	}),
	DB_VERSION: 21,
	DB_STORE_NAME: "FILE_DATA",
	mount: (function(mount) {
		return MEMFS.mount.apply(null, arguments)
	}),
	syncfs: (function(mount, populate, callback) {
		IDBFS.getLocalSet(mount, (function(err, local) {
			if (err) return callback(err);
			IDBFS.getRemoteSet(mount, (function(err, remote) {
				if (err) return callback(err);
				var src = populate ? remote : local;
				var dst = populate ? local : remote;
				IDBFS.reconcile(src, dst, callback)
			}))
		}))
	}),
	getDB: (function(name, callback) {
		var db = IDBFS.dbs[name];
		if (db) {
			return callback(null, db)
		}
		var req;
		try {
			req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION)
		} catch (e) {
			return callback(e)
		}
		req.onupgradeneeded = (function(e) {
			var db = e.target.result;
			var transaction = e.target.transaction;
			var fileStore;
			if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
				fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME)
			} else {
				fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME)
			}
			if (!fileStore.indexNames.contains("timestamp")) {
				fileStore.createIndex("timestamp", "timestamp", {
					unique: false
				})
			}
		});
		req.onsuccess = (function() {
			db = req.result;
			IDBFS.dbs[name] = db;
			callback(null, db)
		});
		req.onerror = (function(e) {
			callback(this.error);
			e.preventDefault()
		})
	}),
	getLocalSet: (function(mount, callback) {
		var entries = {};

		function isRealDir(p) {
			return p !== "." && p !== ".."
		}

		function toAbsolute(root) {
			return (function(p) {
				return PATH.join2(root, p)
			})
		}
		var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
		while (check.length) {
			var path = check.pop();
			var stat;
			try {
				stat = FS.stat(path)
			} catch (e) {
				return callback(e)
			}
			if (FS.isDir(stat.mode)) {
				check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)))
			}
			entries[path] = {
				timestamp: stat.mtime
			}
		}
		return callback(null, {
			type: "local",
			entries: entries
		})
	}),
	getRemoteSet: (function(mount, callback) {
		var entries = {};
		IDBFS.getDB(mount.mountpoint, (function(err, db) {
			if (err) return callback(err);
			var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readonly");
			transaction.onerror = (function(e) {
				callback(this.error);
				e.preventDefault()
			});
			var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
			var index = store.index("timestamp");
			index.openKeyCursor().onsuccess = (function(event) {
				var cursor = event.target.result;
				if (!cursor) {
					return callback(null, {
						type: "remote",
						db: db,
						entries: entries
					})
				}
				entries[cursor.primaryKey] = {
					timestamp: cursor.key
				};
				cursor.continue()
			})
		}))
	}),
	loadLocalEntry: (function(path, callback) {
		var stat, node;
		try {
			var lookup = FS.lookupPath(path);
			node = lookup.node;
			stat = FS.stat(path)
		} catch (e) {
			return callback(e)
		}
		if (FS.isDir(stat.mode)) {
			return callback(null, {
				timestamp: stat.mtime,
				mode: stat.mode
			})
		} else if (FS.isFile(stat.mode)) {
			node.contents = MEMFS.getFileDataAsTypedArray(node);
			return callback(null, {
				timestamp: stat.mtime,
				mode: stat.mode,
				contents: node.contents
			})
		} else {
			return callback(new Error("node type not supported"))
		}
	}),
	storeLocalEntry: (function(path, entry, callback) {
		try {
			if (FS.isDir(entry.mode)) {
				FS.mkdir(path, entry.mode)
			} else if (FS.isFile(entry.mode)) {
				FS.writeFile(path, entry.contents, {
					encoding: "binary",
					canOwn: true
				})
			} else {
				return callback(new Error("node type not supported"))
			}
			FS.chmod(path, entry.mode);
			FS.utime(path, entry.timestamp, entry.timestamp)
		} catch (e) {
			return callback(e)
		}
		callback(null)
	}),
	removeLocalEntry: (function(path, callback) {
		try {
			var lookup = FS.lookupPath(path);
			var stat = FS.stat(path);
			if (FS.isDir(stat.mode)) {
				FS.rmdir(path)
			} else if (FS.isFile(stat.mode)) {
				FS.unlink(path)
			}
		} catch (e) {
			return callback(e)
		}
		callback(null)
	}),
	loadRemoteEntry: (function(store, path, callback) {
		var req = store.get(path);
		req.onsuccess = (function(event) {
			callback(null, event.target.result)
		});
		req.onerror = (function(e) {
			callback(this.error);
			e.preventDefault()
		})
	}),
	storeRemoteEntry: (function(store, path, entry, callback) {
		var req = store.put(entry, path);
		req.onsuccess = (function() {
			callback(null)
		});
		req.onerror = (function(e) {
			callback(this.error);
			e.preventDefault()
		})
	}),
	removeRemoteEntry: (function(store, path, callback) {
		var req = store.delete(path);
		req.onsuccess = (function() {
			callback(null)
		});
		req.onerror = (function(e) {
			callback(this.error);
			e.preventDefault()
		})
	}),
	reconcile: (function(src, dst, callback) {
		var total = 0;
		var create = [];
		Object.keys(src.entries).forEach((function(key) {
			var e = src.entries[key];
			var e2 = dst.entries[key];
			if (!e2 || e.timestamp > e2.timestamp) {
				create.push(key);
				total++
			}
		}));
		var remove = [];
		Object.keys(dst.entries).forEach((function(key) {
			var e = dst.entries[key];
			var e2 = src.entries[key];
			if (!e2) {
				remove.push(key);
				total++
			}
		}));
		if (!total) {
			return callback(null)
		}
		var completed = 0;
		var db = src.type === "remote" ? src.db : dst.db;
		var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readwrite");
		var store = transaction.objectStore(IDBFS.DB_STORE_NAME);

		function done(err) {
			if (err) {
				if (!done.errored) {
					done.errored = true;
					return callback(err)
				}
				return
			}
			if (++completed >= total) {
				return callback(null)
			}
		}
		transaction.onerror = (function(e) {
			done(this.error);
			e.preventDefault()
		});
		create.sort().forEach((function(path) {
			if (dst.type === "local") {
				IDBFS.loadRemoteEntry(store, path, (function(err, entry) {
					if (err) return done(err);
					IDBFS.storeLocalEntry(path, entry, done)
				}))
			} else {
				IDBFS.loadLocalEntry(path, (function(err, entry) {
					if (err) return done(err);
					IDBFS.storeRemoteEntry(store, path, entry, done)
				}))
			}
		}));
		remove.sort().reverse().forEach((function(path) {
			if (dst.type === "local") {
				IDBFS.removeLocalEntry(path, done)
			} else {
				IDBFS.removeRemoteEntry(store, path, done)
			}
		}))
	})
};
var NODEFS = {
	isWindows: false,
	staticInit: (function() {
		NODEFS.isWindows = !!process.platform.match(/^win/)
	}),
	mount: (function(mount) {
		assert(ENVIRONMENT_IS_NODE);
		return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0)
	}),
	createNode: (function(parent, name, mode, dev) {
		if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		var node = FS.createNode(parent, name, mode);
		node.node_ops = NODEFS.node_ops;
		node.stream_ops = NODEFS.stream_ops;
		return node
	}),
	getMode: (function(path) {
		var stat;
		try {
			stat = fs.lstatSync(path);
			if (NODEFS.isWindows) {
				stat.mode = stat.mode | (stat.mode & 146) >> 1
			}
		} catch (e) {
			if (!e.code) throw e;
			throw new FS.ErrnoError(ERRNO_CODES[e.code])
		}
		return stat.mode
	}),
	realPath: (function(node) {
		var parts = [];
		while (node.parent !== node) {
			parts.push(node.name);
			node = node.parent
		}
		parts.push(node.mount.opts.root);
		parts.reverse();
		return PATH.join.apply(null, parts)
	}),
	flagsToPermissionStringMap: {
		0: "r",
		1: "r+",
		2: "r+",
		64: "r",
		65: "r+",
		66: "r+",
		129: "rx+",
		193: "rx+",
		514: "w+",
		577: "w",
		578: "w+",
		705: "wx",
		706: "wx+",
		1024: "a",
		1025: "a",
		1026: "a+",
		1089: "a",
		1090: "a+",
		1153: "ax",
		1154: "ax+",
		1217: "ax",
		1218: "ax+",
		4096: "rs",
		4098: "rs+"
	},
	flagsToPermissionString: (function(flags) {
		flags &= ~32768;
		flags &= ~524288;
		if (flags in NODEFS.flagsToPermissionStringMap) {
			return NODEFS.flagsToPermissionStringMap[flags]
		} else {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
	}),
	node_ops: {
		getattr: (function(node) {
			var path = NODEFS.realPath(node);
			var stat;
			try {
				stat = fs.lstatSync(path)
			} catch (e) {
				if (!e.code) throw e;
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
			if (NODEFS.isWindows && !stat.blksize) {
				stat.blksize = 4096
			}
			if (NODEFS.isWindows && !stat.blocks) {
				stat.blocks = (stat.size + stat.blksize - 1) / stat.blksize | 0
			}
			return {
				dev: stat.dev,
				ino: stat.ino,
				mode: stat.mode,
				nlink: stat.nlink,
				uid: stat.uid,
				gid: stat.gid,
				rdev: stat.rdev,
				size: stat.size,
				atime: stat.atime,
				mtime: stat.mtime,
				ctime: stat.ctime,
				blksize: stat.blksize,
				blocks: stat.blocks
			}
		}),
		setattr: (function(node, attr) {
			var path = NODEFS.realPath(node);
			try {
				if (attr.mode !== undefined) {
					fs.chmodSync(path, attr.mode);
					node.mode = attr.mode
				}
				if (attr.timestamp !== undefined) {
					var date = new Date(attr.timestamp);
					fs.utimesSync(path, date, date)
				}
				if (attr.size !== undefined) {
					fs.truncateSync(path, attr.size)
				}
			} catch (e) {
				if (!e.code) throw e;
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
		}),
		lookup: (function(parent, name) {
			var path = PATH.join2(NODEFS.realPath(parent), name);
			var mode = NODEFS.getMode(path);
			return NODEFS.createNode(parent, name, mode)
		}),
		mknod: (function(parent, name, mode, dev) {
			var node = NODEFS.createNode(parent, name, mode, dev);
			var path = NODEFS.realPath(node);
			try {
				if (FS.isDir(node.mode)) {
					fs.mkdirSync(path, node.mode)
				} else {
					fs.writeFileSync(path, "", {
						mode: node.mode
					})
				}
			} catch (e) {
				if (!e.code) throw e;
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
			return node
		}),
		rename: (function(oldNode, newDir, newName) {
			var oldPath = NODEFS.realPath(oldNode);
			var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
			try {
				fs.renameSync(oldPath, newPath)
			} catch (e) {
				if (!e.code) throw e;
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
		}),
		unlink: (function(parent, name) {
			var path = PATH.join2(NODEFS.realPath(parent), name);
			try {
				fs.unlinkSync(path)
			} catch (e) {
				if (!e.code) throw e;
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
		}),
		rmdir: (function(parent, name) {
			var path = PATH.join2(NODEFS.realPath(parent), name);
			try {
				fs.rmdirSync(path)
			} catch (e) {
				if (!e.code) throw e;
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
		}),
		readdir: (function(node) {
			var path = NODEFS.realPath(node);
			try {
				return fs.readdirSync(path)
			} catch (e) {
				if (!e.code) throw e;
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
		}),
		symlink: (function(parent, newName, oldPath) {
			var newPath = PATH.join2(NODEFS.realPath(parent), newName);
			try {
				fs.symlinkSync(oldPath, newPath)
			} catch (e) {
				if (!e.code) throw e;
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
		}),
		readlink: (function(node) {
			var path = NODEFS.realPath(node);
			try {
				path = fs.readlinkSync(path);
				path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
				return path
			} catch (e) {
				if (!e.code) throw e;
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
		})
	},
	stream_ops: {
		open: (function(stream) {
			var path = NODEFS.realPath(stream.node);
			try {
				if (FS.isFile(stream.node.mode)) {
					stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags))
				}
			} catch (e) {
				if (!e.code) throw e;
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
		}),
		close: (function(stream) {
			try {
				if (FS.isFile(stream.node.mode) && stream.nfd) {
					fs.closeSync(stream.nfd)
				}
			} catch (e) {
				if (!e.code) throw e;
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
		}),
		read: (function(stream, buffer, offset, length, position) {
			if (length === 0) return 0;
			var nbuffer = new Buffer(length);
			var res;
			try {
				res = fs.readSync(stream.nfd, nbuffer, 0, length, position)
			} catch (e) {
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
			if (res > 0) {
				for (var i = 0; i < res; i++) {
					buffer[offset + i] = nbuffer[i]
				}
			}
			return res
		}),
		write: (function(stream, buffer, offset, length, position) {
			var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
			var res;
			try {
				res = fs.writeSync(stream.nfd, nbuffer, 0, length, position)
			} catch (e) {
				throw new FS.ErrnoError(ERRNO_CODES[e.code])
			}
			return res
		}),
		llseek: (function(stream, offset, whence) {
			var position = offset;
			if (whence === 1) {
				position += stream.position
			} else if (whence === 2) {
				if (FS.isFile(stream.node.mode)) {
					try {
						var stat = fs.fstatSync(stream.nfd);
						position += stat.size
					} catch (e) {
						throw new FS.ErrnoError(ERRNO_CODES[e.code])
					}
				}
			}
			if (position < 0) {
				throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
			}
			return position
		})
	}
};
var WORKERFS = {
	DIR_MODE: 16895,
	FILE_MODE: 33279,
	reader: null,
	mount: (function(mount) {
		assert(ENVIRONMENT_IS_WORKER);
		if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync;
		var root = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0);
		var createdParents = {};

		function ensureParent(path) {
			var parts = path.split("/");
			var parent = root;
			for (var i = 0; i < parts.length - 1; i++) {
				var curr = parts.slice(0, i + 1).join("/");
				if (!createdParents[curr]) {
					createdParents[curr] = WORKERFS.createNode(parent, curr, WORKERFS.DIR_MODE, 0)
				}
				parent = createdParents[curr]
			}
			return parent
		}

		function base(path) {
			var parts = path.split("/");
			return parts[parts.length - 1]
		}
		Array.prototype.forEach.call(mount.opts["files"] || [], (function(file) {
			WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate)
		}));
		(mount.opts["blobs"] || []).forEach((function(obj) {
			WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"])
		}));
		(mount.opts["packages"] || []).forEach((function(pack) {
			pack["metadata"].files.forEach((function(file) {
				var name = file.filename.substr(1);
				WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack["blob"].slice(file.start, file.end))
			}))
		}));
		return root
	}),
	createNode: (function(parent, name, mode, dev, contents, mtime) {
		var node = FS.createNode(parent, name, mode);
		node.mode = mode;
		node.node_ops = WORKERFS.node_ops;
		node.stream_ops = WORKERFS.stream_ops;
		node.timestamp = (mtime || new Date).getTime();
		assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
		if (mode === WORKERFS.FILE_MODE) {
			node.size = contents.size;
			node.contents = contents
		} else {
			node.size = 4096;
			node.contents = {}
		}
		if (parent) {
			parent.contents[name] = node
		}
		return node
	}),
	node_ops: {
		getattr: (function(node) {
			return {
				dev: 1,
				ino: undefined,
				mode: node.mode,
				nlink: 1,
				uid: 0,
				gid: 0,
				rdev: undefined,
				size: node.size,
				atime: new Date(node.timestamp),
				mtime: new Date(node.timestamp),
				ctime: new Date(node.timestamp),
				blksize: 4096,
				blocks: Math.ceil(node.size / 4096)
			}
		}),
		setattr: (function(node, attr) {
			if (attr.mode !== undefined) {
				node.mode = attr.mode
			}
			if (attr.timestamp !== undefined) {
				node.timestamp = attr.timestamp
			}
		}),
		lookup: (function(parent, name) {
			throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
		}),
		mknod: (function(parent, name, mode, dev) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}),
		rename: (function(oldNode, newDir, newName) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}),
		unlink: (function(parent, name) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}),
		rmdir: (function(parent, name) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}),
		readdir: (function(node) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}),
		symlink: (function(parent, newName, oldPath) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}),
		readlink: (function(node) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		})
	},
	stream_ops: {
		read: (function(stream, buffer, offset, length, position) {
			if (position >= stream.node.size) return 0;
			var chunk = stream.node.contents.slice(position, position + length);
			var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
			buffer.set(new Uint8Array(ab), offset);
			return chunk.size
		}),
		write: (function(stream, buffer, offset, length, position) {
			throw new FS.ErrnoError(ERRNO_CODES.EIO)
		}),
		llseek: (function(stream, offset, whence) {
			var position = offset;
			if (whence === 1) {
				position += stream.position
			} else if (whence === 2) {
				if (FS.isFile(stream.node.mode)) {
					position += stream.node.size
				}
			}
			if (position < 0) {
				throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
			}
			return position
		})
	}
};
STATICTOP += 16;
STATICTOP += 16;
STATICTOP += 16;
var FS = {
	root: null,
	mounts: [],
	devices: [null],
	streams: [],
	nextInode: 1,
	nameTable: null,
	currentPath: "/",
	initialized: false,
	ignorePermissions: true,
	trackingDelegate: {},
	tracking: {
		openFlags: {
			READ: 1,
			WRITE: 2
		}
	},
	ErrnoError: null,
	genericErrors: {},
	filesystems: null,
	syncFSRequests: 0,
	handleFSError: (function(e) {
		if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
		return ___setErrNo(e.errno)
	}),
	lookupPath: (function(path, opts) {
		path = PATH.resolve(FS.cwd(), path);
		opts = opts || {};
		if (!path) return {
			path: "",
			node: null
		};
		var defaults = {
			follow_mount: true,
			recurse_count: 0
		};
		for (var key in defaults) {
			if (opts[key] === undefined) {
				opts[key] = defaults[key]
			}
		}
		if (opts.recurse_count > 8) {
			throw new FS.ErrnoError(ERRNO_CODES.ELOOP)
		}
		var parts = PATH.normalizeArray(path.split("/").filter((function(p) {
			return !!p
		})), false);
		var current = FS.root;
		var current_path = "/";
		for (var i = 0; i < parts.length; i++) {
			var islast = i === parts.length - 1;
			if (islast && opts.parent) {
				break
			}
			current = FS.lookupNode(current, parts[i]);
			current_path = PATH.join2(current_path, parts[i]);
			if (FS.isMountpoint(current)) {
				if (!islast || islast && opts.follow_mount) {
					current = current.mounted.root
				}
			}
			if (!islast || opts.follow) {
				var count = 0;
				while (FS.isLink(current.mode)) {
					var link = FS.readlink(current_path);
					current_path = PATH.resolve(PATH.dirname(current_path), link);
					var lookup = FS.lookupPath(current_path, {
						recurse_count: opts.recurse_count
					});
					current = lookup.node;
					if (count++ > 40) {
						throw new FS.ErrnoError(ERRNO_CODES.ELOOP)
					}
				}
			}
		}
		return {
			path: current_path,
			node: current
		}
	}),
	getPath: (function(node) {
		var path;
		while (true) {
			if (FS.isRoot(node)) {
				var mount = node.mount.mountpoint;
				if (!path) return mount;
				return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path
			}
			path = path ? node.name + "/" + path : node.name;
			node = node.parent
		}
	}),
	hashName: (function(parentid, name) {
		var hash = 0;
		for (var i = 0; i < name.length; i++) {
			hash = (hash << 5) - hash + name.charCodeAt(i) | 0
		}
		return (parentid + hash >>> 0) % FS.nameTable.length
	}),
	hashAddNode: (function(node) {
		var hash = FS.hashName(node.parent.id, node.name);
		node.name_next = FS.nameTable[hash];
		FS.nameTable[hash] = node
	}),
	hashRemoveNode: (function(node) {
		var hash = FS.hashName(node.parent.id, node.name);
		if (FS.nameTable[hash] === node) {
			FS.nameTable[hash] = node.name_next
		} else {
			var current = FS.nameTable[hash];
			while (current) {
				if (current.name_next === node) {
					current.name_next = node.name_next;
					break
				}
				current = current.name_next
			}
		}
	}),
	lookupNode: (function(parent, name) {
		var err = FS.mayLookup(parent);
		if (err) {
			throw new FS.ErrnoError(err, parent)
		}
		var hash = FS.hashName(parent.id, name);
		for (var node = FS.nameTable[hash]; node; node = node.name_next) {
			var nodeName = node.name;
			if (node.parent.id === parent.id && nodeName === name) {
				return node
			}
		}
		return FS.lookup(parent, name)
	}),
	createNode: (function(parent, name, mode, rdev) {
		if (!FS.FSNode) {
			FS.FSNode = (function(parent, name, mode, rdev) {
				if (!parent) {
					parent = this
				}
				this.parent = parent;
				this.mount = parent.mount;
				this.mounted = null;
				this.id = FS.nextInode++;
				this.name = name;
				this.mode = mode;
				this.node_ops = {};
				this.stream_ops = {};
				this.rdev = rdev
			});
			FS.FSNode.prototype = {};
			var readMode = 292 | 73;
			var writeMode = 146;
			Object.defineProperties(FS.FSNode.prototype, {
				read: {
					get: (function() {
						return (this.mode & readMode) === readMode
					}),
					set: (function(val) {
						val ? this.mode |= readMode : this.mode &= ~readMode
					})
				},
				write: {
					get: (function() {
						return (this.mode & writeMode) === writeMode
					}),
					set: (function(val) {
						val ? this.mode |= writeMode : this.mode &= ~writeMode
					})
				},
				isFolder: {
					get: (function() {
						return FS.isDir(this.mode)
					})
				},
				isDevice: {
					get: (function() {
						return FS.isChrdev(this.mode)
					})
				}
			})
		}
		var node = new FS.FSNode(parent, name, mode, rdev);
		FS.hashAddNode(node);
		return node
	}),
	destroyNode: (function(node) {
		FS.hashRemoveNode(node)
	}),
	isRoot: (function(node) {
		return node === node.parent
	}),
	isMountpoint: (function(node) {
		return !!node.mounted
	}),
	isFile: (function(mode) {
		return (mode & 61440) === 32768
	}),
	isDir: (function(mode) {
		return (mode & 61440) === 16384
	}),
	isLink: (function(mode) {
		return (mode & 61440) === 40960
	}),
	isChrdev: (function(mode) {
		return (mode & 61440) === 8192
	}),
	isBlkdev: (function(mode) {
		return (mode & 61440) === 24576
	}),
	isFIFO: (function(mode) {
		return (mode & 61440) === 4096
	}),
	isSocket: (function(mode) {
		return (mode & 49152) === 49152
	}),
	flagModes: {
		"r": 0,
		"rs": 1052672,
		"r+": 2,
		"w": 577,
		"wx": 705,
		"xw": 705,
		"w+": 578,
		"wx+": 706,
		"xw+": 706,
		"a": 1089,
		"ax": 1217,
		"xa": 1217,
		"a+": 1090,
		"ax+": 1218,
		"xa+": 1218
	},
	modeStringToFlags: (function(str) {
		var flags = FS.flagModes[str];
		if (typeof flags === "undefined") {
			throw new Error("Unknown file open mode: " + str)
		}
		return flags
	}),
	flagsToPermissionString: (function(flag) {
		var perms = ["r", "w", "rw"][flag & 3];
		if (flag & 512) {
			perms += "w"
		}
		return perms
	}),
	nodePermissions: (function(node, perms) {
		if (FS.ignorePermissions) {
			return 0
		}
		if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
			return ERRNO_CODES.EACCES
		} else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
			return ERRNO_CODES.EACCES
		} else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
			return ERRNO_CODES.EACCES
		}
		return 0
	}),
	mayLookup: (function(dir) {
		var err = FS.nodePermissions(dir, "x");
		if (err) return err;
		if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
		return 0
	}),
	mayCreate: (function(dir, name) {
		try {
			var node = FS.lookupNode(dir, name);
			return ERRNO_CODES.EEXIST
		} catch (e) {}
		return FS.nodePermissions(dir, "wx")
	}),
	mayDelete: (function(dir, name, isdir) {
		var node;
		try {
			node = FS.lookupNode(dir, name)
		} catch (e) {
			return e.errno
		}
		var err = FS.nodePermissions(dir, "wx");
		if (err) {
			return err
		}
		if (isdir) {
			if (!FS.isDir(node.mode)) {
				return ERRNO_CODES.ENOTDIR
			}
			if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
				return ERRNO_CODES.EBUSY
			}
		} else {
			if (FS.isDir(node.mode)) {
				return ERRNO_CODES.EISDIR
			}
		}
		return 0
	}),
	mayOpen: (function(node, flags) {
		if (!node) {
			return ERRNO_CODES.ENOENT
		}
		if (FS.isLink(node.mode)) {
			return ERRNO_CODES.ELOOP
		} else if (FS.isDir(node.mode)) {
			if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
				return ERRNO_CODES.EISDIR
			}
		}
		return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
	}),
	MAX_OPEN_FDS: 4096,
	nextfd: (function(fd_start, fd_end) {
		fd_start = fd_start || 0;
		fd_end = fd_end || FS.MAX_OPEN_FDS;
		for (var fd = fd_start; fd <= fd_end; fd++) {
			if (!FS.streams[fd]) {
				return fd
			}
		}
		throw new FS.ErrnoError(ERRNO_CODES.EMFILE)
	}),
	getStream: (function(fd) {
		return FS.streams[fd]
	}),
	createStream: (function(stream, fd_start, fd_end) {
		if (!FS.FSStream) {
			FS.FSStream = (function() {});
			FS.FSStream.prototype = {};
			Object.defineProperties(FS.FSStream.prototype, {
				object: {
					get: (function() {
						return this.node
					}),
					set: (function(val) {
						this.node = val
					})
				},
				isRead: {
					get: (function() {
						return (this.flags & 2097155) !== 1
					})
				},
				isWrite: {
					get: (function() {
						return (this.flags & 2097155) !== 0
					})
				},
				isAppend: {
					get: (function() {
						return this.flags & 1024
					})
				}
			})
		}
		var newStream = new FS.FSStream;
		for (var p in stream) {
			newStream[p] = stream[p]
		}
		stream = newStream;
		var fd = FS.nextfd(fd_start, fd_end);
		stream.fd = fd;
		FS.streams[fd] = stream;
		return stream
	}),
	closeStream: (function(fd) {
		FS.streams[fd] = null
	}),
	chrdev_stream_ops: {
		open: (function(stream) {
			var device = FS.getDevice(stream.node.rdev);
			stream.stream_ops = device.stream_ops;
			if (stream.stream_ops.open) {
				stream.stream_ops.open(stream)
			}
		}),
		llseek: (function() {
			throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
		})
	},
	major: (function(dev) {
		return dev >> 8
	}),
	minor: (function(dev) {
		return dev & 255
	}),
	makedev: (function(ma, mi) {
		return ma << 8 | mi
	}),
	registerDevice: (function(dev, ops) {
		FS.devices[dev] = {
			stream_ops: ops
		}
	}),
	getDevice: (function(dev) {
		return FS.devices[dev]
	}),
	getMounts: (function(mount) {
		var mounts = [];
		var check = [mount];
		while (check.length) {
			var m = check.pop();
			mounts.push(m);
			check.push.apply(check, m.mounts)
		}
		return mounts
	}),
	syncfs: (function(populate, callback) {
		if (typeof populate === "function") {
			callback = populate;
			populate = false
		}
		FS.syncFSRequests++;
		if (FS.syncFSRequests > 1) {
			console.log("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work")
		}
		var mounts = FS.getMounts(FS.root.mount);
		var completed = 0;

		function doCallback(err) {
			assert(FS.syncFSRequests > 0);
			FS.syncFSRequests--;
			return callback(err)
		}

		function done(err) {
			if (err) {
				if (!done.errored) {
					done.errored = true;
					return doCallback(err)
				}
				return
			}
			if (++completed >= mounts.length) {
				doCallback(null)
			}
		}
		mounts.forEach((function(mount) {
			if (!mount.type.syncfs) {
				return done(null)
			}
			mount.type.syncfs(mount, populate, done)
		}))
	}),
	mount: (function(type, opts, mountpoint) {
		var root = mountpoint === "/";
		var pseudo = !mountpoint;
		var node;
		if (root && FS.root) {
			throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
		} else if (!root && !pseudo) {
			var lookup = FS.lookupPath(mountpoint, {
				follow_mount: false
			});
			mountpoint = lookup.path;
			node = lookup.node;
			if (FS.isMountpoint(node)) {
				throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
			}
			if (!FS.isDir(node.mode)) {
				throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
			}
		}
		var mount = {
			type: type,
			opts: opts,
			mountpoint: mountpoint,
			mounts: []
		};
		var mountRoot = type.mount(mount);
		mountRoot.mount = mount;
		mount.root = mountRoot;
		if (root) {
			FS.root = mountRoot
		} else if (node) {
			node.mounted = mount;
			if (node.mount) {
				node.mount.mounts.push(mount)
			}
		}
		return mountRoot
	}),
	unmount: (function(mountpoint) {
		var lookup = FS.lookupPath(mountpoint, {
			follow_mount: false
		});
		if (!FS.isMountpoint(lookup.node)) {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		var node = lookup.node;
		var mount = node.mounted;
		var mounts = FS.getMounts(mount);
		Object.keys(FS.nameTable).forEach((function(hash) {
			var current = FS.nameTable[hash];
			while (current) {
				var next = current.name_next;
				if (mounts.indexOf(current.mount) !== -1) {
					FS.destroyNode(current)
				}
				current = next
			}
		}));
		node.mounted = null;
		var idx = node.mount.mounts.indexOf(mount);
		assert(idx !== -1);
		node.mount.mounts.splice(idx, 1)
	}),
	lookup: (function(parent, name) {
		return parent.node_ops.lookup(parent, name)
	}),
	mknod: (function(path, mode, dev) {
		var lookup = FS.lookupPath(path, {
			parent: true
		});
		var parent = lookup.node;
		var name = PATH.basename(path);
		if (!name || name === "." || name === "..") {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		var err = FS.mayCreate(parent, name);
		if (err) {
			throw new FS.ErrnoError(err)
		}
		if (!parent.node_ops.mknod) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}
		return parent.node_ops.mknod(parent, name, mode, dev)
	}),
	create: (function(path, mode) {
		mode = mode !== undefined ? mode : 438;
		mode &= 4095;
		mode |= 32768;
		return FS.mknod(path, mode, 0)
	}),
	mkdir: (function(path, mode) {
		mode = mode !== undefined ? mode : 511;
		mode &= 511 | 512;
		mode |= 16384;
		return FS.mknod(path, mode, 0)
	}),
	mkdev: (function(path, mode, dev) {
		if (typeof dev === "undefined") {
			dev = mode;
			mode = 438
		}
		mode |= 8192;
		return FS.mknod(path, mode, dev)
	}),
	symlink: (function(oldpath, newpath) {
		if (!PATH.resolve(oldpath)) {
			throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
		}
		var lookup = FS.lookupPath(newpath, {
			parent: true
		});
		var parent = lookup.node;
		if (!parent) {
			throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
		}
		var newname = PATH.basename(newpath);
		var err = FS.mayCreate(parent, newname);
		if (err) {
			throw new FS.ErrnoError(err)
		}
		if (!parent.node_ops.symlink) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}
		return parent.node_ops.symlink(parent, newname, oldpath)
	}),
	rename: (function(old_path, new_path) {
		var old_dirname = PATH.dirname(old_path);
		var new_dirname = PATH.dirname(new_path);
		var old_name = PATH.basename(old_path);
		var new_name = PATH.basename(new_path);
		var lookup, old_dir, new_dir;
		try {
			lookup = FS.lookupPath(old_path, {
				parent: true
			});
			old_dir = lookup.node;
			lookup = FS.lookupPath(new_path, {
				parent: true
			});
			new_dir = lookup.node
		} catch (e) {
			throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
		}
		if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
		if (old_dir.mount !== new_dir.mount) {
			throw new FS.ErrnoError(ERRNO_CODES.EXDEV)
		}
		var old_node = FS.lookupNode(old_dir, old_name);
		var relative = PATH.relative(old_path, new_dirname);
		if (relative.charAt(0) !== ".") {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		relative = PATH.relative(new_path, old_dirname);
		if (relative.charAt(0) !== ".") {
			throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)
		}
		var new_node;
		try {
			new_node = FS.lookupNode(new_dir, new_name)
		} catch (e) {}
		if (old_node === new_node) {
			return
		}
		var isdir = FS.isDir(old_node.mode);
		var err = FS.mayDelete(old_dir, old_name, isdir);
		if (err) {
			throw new FS.ErrnoError(err)
		}
		err = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
		if (err) {
			throw new FS.ErrnoError(err)
		}
		if (!old_dir.node_ops.rename) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}
		if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
			throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
		}
		if (new_dir !== old_dir) {
			err = FS.nodePermissions(old_dir, "w");
			if (err) {
				throw new FS.ErrnoError(err)
			}
		}
		try {
			if (FS.trackingDelegate["willMovePath"]) {
				FS.trackingDelegate["willMovePath"](old_path, new_path)
			}
		} catch (e) {
			console.log("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
		}
		FS.hashRemoveNode(old_node);
		try {
			old_dir.node_ops.rename(old_node, new_dir, new_name)
		} catch (e) {
			throw e
		} finally {
			FS.hashAddNode(old_node)
		}
		try {
			if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path)
		} catch (e) {
			console.log("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
		}
	}),
	rmdir: (function(path) {
		var lookup = FS.lookupPath(path, {
			parent: true
		});
		var parent = lookup.node;
		var name = PATH.basename(path);
		var node = FS.lookupNode(parent, name);
		var err = FS.mayDelete(parent, name, true);
		if (err) {
			throw new FS.ErrnoError(err)
		}
		if (!parent.node_ops.rmdir) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}
		if (FS.isMountpoint(node)) {
			throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
		}
		try {
			if (FS.trackingDelegate["willDeletePath"]) {
				FS.trackingDelegate["willDeletePath"](path)
			}
		} catch (e) {
			console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
		}
		parent.node_ops.rmdir(parent, name);
		FS.destroyNode(node);
		try {
			if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
		} catch (e) {
			console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
		}
	}),
	readdir: (function(path) {
		var lookup = FS.lookupPath(path, {
			follow: true
		});
		var node = lookup.node;
		if (!node.node_ops.readdir) {
			throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
		}
		return node.node_ops.readdir(node)
	}),
	unlink: (function(path) {
		var lookup = FS.lookupPath(path, {
			parent: true
		});
		var parent = lookup.node;
		var name = PATH.basename(path);
		var node = FS.lookupNode(parent, name);
		var err = FS.mayDelete(parent, name, false);
		if (err) {
			if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
			throw new FS.ErrnoError(err)
		}
		if (!parent.node_ops.unlink) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}
		if (FS.isMountpoint(node)) {
			throw new FS.ErrnoError(ERRNO_CODES.EBUSY)
		}
		try {
			if (FS.trackingDelegate["willDeletePath"]) {
				FS.trackingDelegate["willDeletePath"](path)
			}
		} catch (e) {
			console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
		}
		parent.node_ops.unlink(parent, name);
		FS.destroyNode(node);
		try {
			if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
		} catch (e) {
			console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
		}
	}),
	readlink: (function(path) {
		var lookup = FS.lookupPath(path);
		var link = lookup.node;
		if (!link) {
			throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
		}
		if (!link.node_ops.readlink) {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		return PATH.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
	}),
	stat: (function(path, dontFollow) {
		var lookup = FS.lookupPath(path, {
			follow: !dontFollow
		});
		var node = lookup.node;
		if (!node) {
			throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
		}
		if (!node.node_ops.getattr) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}
		return node.node_ops.getattr(node)
	}),
	lstat: (function(path) {
		return FS.stat(path, true)
	}),
	chmod: (function(path, mode, dontFollow) {
		var node;
		if (typeof path === "string") {
			var lookup = FS.lookupPath(path, {
				follow: !dontFollow
			});
			node = lookup.node
		} else {
			node = path
		}
		if (!node.node_ops.setattr) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}
		node.node_ops.setattr(node, {
			mode: mode & 4095 | node.mode & ~4095,
			timestamp: Date.now()
		})
	}),
	lchmod: (function(path, mode) {
		FS.chmod(path, mode, true)
	}),
	fchmod: (function(fd, mode) {
		var stream = FS.getStream(fd);
		if (!stream) {
			throw new FS.ErrnoError(ERRNO_CODES.EBADF)
		}
		FS.chmod(stream.node, mode)
	}),
	chown: (function(path, uid, gid, dontFollow) {
		var node;
		if (typeof path === "string") {
			var lookup = FS.lookupPath(path, {
				follow: !dontFollow
			});
			node = lookup.node
		} else {
			node = path
		}
		if (!node.node_ops.setattr) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}
		node.node_ops.setattr(node, {
			timestamp: Date.now()
		})
	}),
	lchown: (function(path, uid, gid) {
		FS.chown(path, uid, gid, true)
	}),
	fchown: (function(fd, uid, gid) {
		var stream = FS.getStream(fd);
		if (!stream) {
			throw new FS.ErrnoError(ERRNO_CODES.EBADF)
		}
		FS.chown(stream.node, uid, gid)
	}),
	truncate: (function(path, len) {
		if (len < 0) {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		var node;
		if (typeof path === "string") {
			var lookup = FS.lookupPath(path, {
				follow: true
			});
			node = lookup.node
		} else {
			node = path
		}
		if (!node.node_ops.setattr) {
			throw new FS.ErrnoError(ERRNO_CODES.EPERM)
		}
		if (FS.isDir(node.mode)) {
			throw new FS.ErrnoError(ERRNO_CODES.EISDIR)
		}
		if (!FS.isFile(node.mode)) {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		var err = FS.nodePermissions(node, "w");
		if (err) {
			throw new FS.ErrnoError(err)
		}
		node.node_ops.setattr(node, {
			size: len,
			timestamp: Date.now()
		})
	}),
	ftruncate: (function(fd, len) {
		var stream = FS.getStream(fd);
		if (!stream) {
			throw new FS.ErrnoError(ERRNO_CODES.EBADF)
		}
		if ((stream.flags & 2097155) === 0) {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		FS.truncate(stream.node, len)
	}),
	utime: (function(path, atime, mtime) {
		var lookup = FS.lookupPath(path, {
			follow: true
		});
		var node = lookup.node;
		node.node_ops.setattr(node, {
			timestamp: Math.max(atime, mtime)
		})
	}),
	open: (function(path, flags, mode, fd_start, fd_end) {
		if (path === "") {
			throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
		}
		flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
		mode = typeof mode === "undefined" ? 438 : mode;
		if (flags & 64) {
			mode = mode & 4095 | 32768
		} else {
			mode = 0
		}
		var node;
		if (typeof path === "object") {
			node = path
		} else {
			path = PATH.normalize(path);
			try {
				var lookup = FS.lookupPath(path, {
					follow: !(flags & 131072)
				});
				node = lookup.node
			} catch (e) {}
		}
		var created = false;
		if (flags & 64) {
			if (node) {
				if (flags & 128) {
					throw new FS.ErrnoError(ERRNO_CODES.EEXIST)
				}
			} else {
				node = FS.mknod(path, mode, 0);
				created = true
			}
		}
		if (!node) {
			throw new FS.ErrnoError(ERRNO_CODES.ENOENT)
		}
		if (FS.isChrdev(node.mode)) {
			flags &= ~512
		}
		if (flags & 65536 && !FS.isDir(node.mode)) {
			throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
		}
		if (!created) {
			var err = FS.mayOpen(node, flags);
			if (err) {
				throw new FS.ErrnoError(err)
			}
		}
		if (flags & 512) {
			FS.truncate(node, 0)
		}
		flags &= ~(128 | 512);
		var stream = FS.createStream({
			node: node,
			path: FS.getPath(node),
			flags: flags,
			seekable: true,
			position: 0,
			stream_ops: node.stream_ops,
			ungotten: [],
			error: false
		}, fd_start, fd_end);
		if (stream.stream_ops.open) {
			stream.stream_ops.open(stream)
		}
		if (Module["logReadFiles"] && !(flags & 1)) {
			if (!FS.readFiles) FS.readFiles = {};
			if (!(path in FS.readFiles)) {
				FS.readFiles[path] = 1;
				Module["printErr"]("read file: " + path)
			}
		}
		try {
			if (FS.trackingDelegate["onOpenFile"]) {
				var trackingFlags = 0;
				if ((flags & 2097155) !== 1) {
					trackingFlags |= FS.tracking.openFlags.READ
				}
				if ((flags & 2097155) !== 0) {
					trackingFlags |= FS.tracking.openFlags.WRITE
				}
				FS.trackingDelegate["onOpenFile"](path, trackingFlags)
			}
		} catch (e) {
			console.log("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message)
		}
		return stream
	}),
	close: (function(stream) {
		if (stream.getdents) stream.getdents = null;
		try {
			if (stream.stream_ops.close) {
				stream.stream_ops.close(stream)
			}
		} catch (e) {
			throw e
		} finally {
			FS.closeStream(stream.fd)
		}
	}),
	llseek: (function(stream, offset, whence) {
		if (!stream.seekable || !stream.stream_ops.llseek) {
			throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
		}
		stream.position = stream.stream_ops.llseek(stream, offset, whence);
		stream.ungotten = [];
		return stream.position
	}),
	read: (function(stream, buffer, offset, length, position) {
		if (length < 0 || position < 0) {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		if ((stream.flags & 2097155) === 1) {
			throw new FS.ErrnoError(ERRNO_CODES.EBADF)
		}
		if (FS.isDir(stream.node.mode)) {
			throw new FS.ErrnoError(ERRNO_CODES.EISDIR)
		}
		if (!stream.stream_ops.read) {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		var seeking = true;
		if (typeof position === "undefined") {
			position = stream.position;
			seeking = false
		} else if (!stream.seekable) {
			throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
		}
		var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
		if (!seeking) stream.position += bytesRead;
		return bytesRead
	}),
	write: (function(stream, buffer, offset, length, position, canOwn) {
		if (length < 0 || position < 0) {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		if ((stream.flags & 2097155) === 0) {
			throw new FS.ErrnoError(ERRNO_CODES.EBADF)
		}
		if (FS.isDir(stream.node.mode)) {
			throw new FS.ErrnoError(ERRNO_CODES.EISDIR)
		}
		if (!stream.stream_ops.write) {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		if (stream.flags & 1024) {
			FS.llseek(stream, 0, 2)
		}
		var seeking = true;
		if (typeof position === "undefined") {
			position = stream.position;
			seeking = false
		} else if (!stream.seekable) {
			throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)
		}
		var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
		if (!seeking) stream.position += bytesWritten;
		try {
			if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path)
		} catch (e) {
			console.log("FS.trackingDelegate['onWriteToFile']('" + path + "') threw an exception: " + e.message)
		}
		return bytesWritten
	}),
	allocate: (function(stream, offset, length) {
		if (offset < 0 || length <= 0) {
			throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
		}
		if ((stream.flags & 2097155) === 0) {
			throw new FS.ErrnoError(ERRNO_CODES.EBADF)
		}
		if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
			throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
		}
		if (!stream.stream_ops.allocate) {
			throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)
		}
		stream.stream_ops.allocate(stream, offset, length)
	}),
	mmap: (function(stream, buffer, offset, length, position, prot, flags) {
		if ((stream.flags & 2097155) === 1) {
			throw new FS.ErrnoError(ERRNO_CODES.EACCES)
		}
		if (!stream.stream_ops.mmap) {
			throw new FS.ErrnoError(ERRNO_CODES.ENODEV)
		}
		return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags)
	}),
	msync: (function(stream, buffer, offset, length, mmapFlags) {
		if (!stream || !stream.stream_ops.msync) {
			return 0
		}
		return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
	}),
	munmap: (function(stream) {
		return 0
	}),
	ioctl: (function(stream, cmd, arg) {
		if (!stream.stream_ops.ioctl) {
			throw new FS.ErrnoError(ERRNO_CODES.ENOTTY)
		}
		return stream.stream_ops.ioctl(stream, cmd, arg)
	}),
	readFile: (function(path, opts) {
		opts = opts || {};
		opts.flags = opts.flags || "r";
		opts.encoding = opts.encoding || "binary";
		if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
			throw new Error('Invalid encoding type "' + opts.encoding + '"')
		}
		var ret;
		var stream = FS.open(path, opts.flags);
		var stat = FS.stat(path);
		var length = stat.size;
		var buf = new Uint8Array(length);
		FS.read(stream, buf, 0, length, 0);
		if (opts.encoding === "utf8") {
			ret = UTF8ArrayToString(buf, 0)
		} else if (opts.encoding === "binary") {
			ret = buf
		}
		FS.close(stream);
		return ret
	}),
	writeFile: (function(path, data, opts) {
		opts = opts || {};
		opts.flags = opts.flags || "w";
		opts.encoding = opts.encoding || "utf8";
		if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
			throw new Error('Invalid encoding type "' + opts.encoding + '"')
		}
		var stream = FS.open(path, opts.flags, opts.mode);
		if (opts.encoding === "utf8") {
			var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
			var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
			FS.write(stream, buf, 0, actualNumBytes, 0, opts.canOwn)
		} else if (opts.encoding === "binary") {
			FS.write(stream, data, 0, data.length, 0, opts.canOwn)
		}
		FS.close(stream)
	}),
	cwd: (function() {
		return FS.currentPath
	}),
	chdir: (function(path) {
		var lookup = FS.lookupPath(path, {
			follow: true
		});
		if (!FS.isDir(lookup.node.mode)) {
			throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)
		}
		var err = FS.nodePermissions(lookup.node, "x");
		if (err) {
			throw new FS.ErrnoError(err)
		}
		FS.currentPath = lookup.path
	}),
	createDefaultDirectories: (function() {
		FS.mkdir("/tmp");
		FS.mkdir("/home");
		FS.mkdir("/home/web_user")
	}),
	createDefaultDevices: (function() {
		FS.mkdir("/dev");
		FS.registerDevice(FS.makedev(1, 3), {
			read: (function() {
				return 0
			}),
			write: (function(stream, buffer, offset, length, pos) {
				return length
			})
		});
		FS.mkdev("/dev/null", FS.makedev(1, 3));
		TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
		TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
		FS.mkdev("/dev/tty", FS.makedev(5, 0));
		FS.mkdev("/dev/tty1", FS.makedev(6, 0));
		var random_device;
		if (typeof crypto !== "undefined") {
			var randomBuffer = new Uint8Array(1);
			random_device = (function() {
				crypto.getRandomValues(randomBuffer);
				return randomBuffer[0]
			})
		} else if (ENVIRONMENT_IS_NODE) {
			random_device = (function() {
				return require("crypto").randomBytes(1)[0]
			})
		} else {
			random_device = (function() {
				return Math.random() * 256 | 0
			})
		}
		FS.createDevice("/dev", "random", random_device);
		FS.createDevice("/dev", "urandom", random_device);
		FS.mkdir("/dev/shm");
		FS.mkdir("/dev/shm/tmp")
	}),
	createSpecialDirectories: (function() {
		FS.mkdir("/proc");
		FS.mkdir("/proc/self");
		FS.mkdir("/proc/self/fd");
		FS.mount({
			mount: (function() {
				var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
				node.node_ops = {
					lookup: (function(parent, name) {
						var fd = +name;
						var stream = FS.getStream(fd);
						if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
						var ret = {
							parent: null,
							mount: {
								mountpoint: "fake"
							},
							node_ops: {
								readlink: (function() {
									return stream.path
								})
							}
						};
						ret.parent = ret;
						return ret
					})
				};
				return node
			})
		}, {}, "/proc/self/fd")
	}),
	createStandardStreams: (function() {
		if (Module["stdin"]) {
			FS.createDevice("/dev", "stdin", Module["stdin"])
		} else {
			FS.symlink("/dev/tty", "/dev/stdin")
		}
		if (Module["stdout"]) {
			FS.createDevice("/dev", "stdout", null, Module["stdout"])
		} else {
			FS.symlink("/dev/tty", "/dev/stdout")
		}
		if (Module["stderr"]) {
			FS.createDevice("/dev", "stderr", null, Module["stderr"])
		} else {
			FS.symlink("/dev/tty1", "/dev/stderr")
		}
		var stdin = FS.open("/dev/stdin", "r");
		assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
		var stdout = FS.open("/dev/stdout", "w");
		assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");
		var stderr = FS.open("/dev/stderr", "w");
		assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")")
	}),
	ensureErrnoError: (function() {
		if (FS.ErrnoError) return;
		FS.ErrnoError = function ErrnoError(errno, node) {
			this.node = node;
			this.setErrno = (function(errno) {
				this.errno = errno;
				for (var key in ERRNO_CODES) {
					if (ERRNO_CODES[key] === errno) {
						this.code = key;
						break
					}
				}
			});
			this.setErrno(errno);
			this.message = ERRNO_MESSAGES[errno]
		};
		FS.ErrnoError.prototype = new Error;
		FS.ErrnoError.prototype.constructor = FS.ErrnoError;
		[ERRNO_CODES.ENOENT].forEach((function(code) {
			FS.genericErrors[code] = new FS.ErrnoError(code);
			FS.genericErrors[code].stack = "<generic error, no stack>"
		}))
	}),
	staticInit: (function() {
		FS.ensureErrnoError();
		FS.nameTable = new Array(4096);
		FS.mount(MEMFS, {}, "/");
		FS.createDefaultDirectories();
		FS.createDefaultDevices();
		FS.createSpecialDirectories();
		FS.filesystems = {
			"MEMFS": MEMFS,
			"IDBFS": IDBFS,
			"NODEFS": NODEFS,
			"WORKERFS": WORKERFS
		}
	}),
	init: (function(input, output, error) {
		assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
		FS.init.initialized = true;
		FS.ensureErrnoError();
		Module["stdin"] = input || Module["stdin"];
		Module["stdout"] = output || Module["stdout"];
		Module["stderr"] = error || Module["stderr"];
		FS.createStandardStreams()
	}),
	quit: (function() {
		FS.init.initialized = false;
		var fflush = Module["_fflush"];
		if (fflush) fflush(0);
		for (var i = 0; i < FS.streams.length; i++) {
			var stream = FS.streams[i];
			if (!stream) {
				continue
			}
			FS.close(stream)
		}
	}),
	getMode: (function(canRead, canWrite) {
		var mode = 0;
		if (canRead) mode |= 292 | 73;
		if (canWrite) mode |= 146;
		return mode
	}),
	joinPath: (function(parts, forceRelative) {
		var path = PATH.join.apply(null, parts);
		if (forceRelative && path[0] == "/") path = path.substr(1);
		return path
	}),
	absolutePath: (function(relative, base) {
		return PATH.resolve(base, relative)
	}),
	standardizePath: (function(path) {
		return PATH.normalize(path)
	}),
	findObject: (function(path, dontResolveLastLink) {
		var ret = FS.analyzePath(path, dontResolveLastLink);
		if (ret.exists) {
			return ret.object
		} else {
			___setErrNo(ret.error);
			return null
		}
	}),
	analyzePath: (function(path, dontResolveLastLink) {
		try {
			var lookup = FS.lookupPath(path, {
				follow: !dontResolveLastLink
			});
			path = lookup.path
		} catch (e) {}
		var ret = {
			isRoot: false,
			exists: false,
			error: 0,
			name: null,
			path: null,
			object: null,
			parentExists: false,
			parentPath: null,
			parentObject: null
		};
		try {
			var lookup = FS.lookupPath(path, {
				parent: true
			});
			ret.parentExists = true;
			ret.parentPath = lookup.path;
			ret.parentObject = lookup.node;
			ret.name = PATH.basename(path);
			lookup = FS.lookupPath(path, {
				follow: !dontResolveLastLink
			});
			ret.exists = true;
			ret.path = lookup.path;
			ret.object = lookup.node;
			ret.name = lookup.node.name;
			ret.isRoot = lookup.path === "/"
		} catch (e) {
			ret.error = e.errno
		}
		return ret
	}),
	createFolder: (function(parent, name, canRead, canWrite) {
		var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
		var mode = FS.getMode(canRead, canWrite);
		return FS.mkdir(path, mode)
	}),
	createPath: (function(parent, path, canRead, canWrite) {
		parent = typeof parent === "string" ? parent : FS.getPath(parent);
		var parts = path.split("/").reverse();
		while (parts.length) {
			var part = parts.pop();
			if (!part) continue;
			var current = PATH.join2(parent, part);
			try {
				FS.mkdir(current)
			} catch (e) {}
			parent = current
		}
		return current
	}),
	createFile: (function(parent, name, properties, canRead, canWrite) {
		var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
		var mode = FS.getMode(canRead, canWrite);
		return FS.create(path, mode)
	}),
	createDataFile: (function(parent, name, data, canRead, canWrite, canOwn) {
		var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
		var mode = FS.getMode(canRead, canWrite);
		var node = FS.create(path, mode);
		if (data) {
			if (typeof data === "string") {
				var arr = new Array(data.length);
				for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
				data = arr
			}
			FS.chmod(node, mode | 146);
			var stream = FS.open(node, "w");
			FS.write(stream, data, 0, data.length, 0, canOwn);
			FS.close(stream);
			FS.chmod(node, mode)
		}
		return node
	}),
	createDevice: (function(parent, name, input, output) {
		var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
		var mode = FS.getMode(!!input, !!output);
		if (!FS.createDevice.major) FS.createDevice.major = 64;
		var dev = FS.makedev(FS.createDevice.major++, 0);
		FS.registerDevice(dev, {
			open: (function(stream) {
				stream.seekable = false
			}),
			close: (function(stream) {
				if (output && output.buffer && output.buffer.length) {
					output(10)
				}
			}),
			read: (function(stream, buffer, offset, length, pos) {
				var bytesRead = 0;
				for (var i = 0; i < length; i++) {
					var result;
					try {
						result = input()
					} catch (e) {
						throw new FS.ErrnoError(ERRNO_CODES.EIO)
					}
					if (result === undefined && bytesRead === 0) {
						throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
					}
					if (result === null || result === undefined) break;
					bytesRead++;
					buffer[offset + i] = result
				}
				if (bytesRead) {
					stream.node.timestamp = Date.now()
				}
				return bytesRead
			}),
			write: (function(stream, buffer, offset, length, pos) {
				for (var i = 0; i < length; i++) {
					try {
						output(buffer[offset + i])
					} catch (e) {
						throw new FS.ErrnoError(ERRNO_CODES.EIO)
					}
				}
				if (length) {
					stream.node.timestamp = Date.now()
				}
				return i
			})
		});
		return FS.mkdev(path, mode, dev)
	}),
	createLink: (function(parent, name, target, canRead, canWrite) {
		var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
		return FS.symlink(target, path)
	}),
	forceLoadFile: (function(obj) {
		if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
		var success = true;
		if (typeof XMLHttpRequest !== "undefined") {
			throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
		} else if (Module["read"]) {
			try {
				obj.contents = intArrayFromString(Module["read"](obj.url), true);
				obj.usedBytes = obj.contents.length
			} catch (e) {
				success = false
			}
		} else {
			throw new Error("Cannot load without read() or XMLHttpRequest.")
		}
		if (!success) ___setErrNo(ERRNO_CODES.EIO);
		return success
	}),
	createLazyFile: (function(parent, name, url, canRead, canWrite) {
		function LazyUint8Array() {
			this.lengthKnown = false;
			this.chunks = []
		}
		LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
			if (idx > this.length - 1 || idx < 0) {
				return undefined
			}
			var chunkOffset = idx % this.chunkSize;
			var chunkNum = idx / this.chunkSize | 0;
			return this.getter(chunkNum)[chunkOffset]
		};
		LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
			this.getter = getter
		};
		LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
			var xhr = new XMLHttpRequest;
			xhr.open("HEAD", url, false);
			xhr.send(null);
			if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
			var datalength = Number(xhr.getResponseHeader("Content-length"));
			var header;
			var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
			var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
			var chunkSize = 1024 * 1024;
			if (!hasByteServing) chunkSize = datalength;
			var doXHR = (function(from, to) {
				if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
				if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
				var xhr = new XMLHttpRequest;
				xhr.open("GET", url, false);
				if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
				if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
				if (xhr.overrideMimeType) {
					xhr.overrideMimeType("text/plain; charset=x-user-defined")
				}
				xhr.send(null);
				if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
				if (xhr.response !== undefined) {
					return new Uint8Array(xhr.response || [])
				} else {
					return intArrayFromString(xhr.responseText || "", true)
				}
			});
			var lazyArray = this;
			lazyArray.setDataGetter((function(chunkNum) {
				var start = chunkNum * chunkSize;
				var end = (chunkNum + 1) * chunkSize - 1;
				end = Math.min(end, datalength - 1);
				if (typeof lazyArray.chunks[chunkNum] === "undefined") {
					lazyArray.chunks[chunkNum] = doXHR(start, end)
				}
				if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
				return lazyArray.chunks[chunkNum]
			}));
			if (usesGzip || !datalength) {
				chunkSize = datalength = 1;
				datalength = this.getter(0).length;
				chunkSize = datalength;
				console.log("LazyFiles on gzip forces download of the whole file when length is accessed")
			}
			this._length = datalength;
			this._chunkSize = chunkSize;
			this.lengthKnown = true
		};
		if (typeof XMLHttpRequest !== "undefined") {
			if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
			var lazyArray = new LazyUint8Array;
			Object.defineProperties(lazyArray, {
				length: {
					get: (function() {
						if (!this.lengthKnown) {
							this.cacheLength()
						}
						return this._length
					})
				},
				chunkSize: {
					get: (function() {
						if (!this.lengthKnown) {
							this.cacheLength()
						}
						return this._chunkSize
					})
				}
			});
			var properties = {
				isDevice: false,
				contents: lazyArray
			}
		} else {
			var properties = {
				isDevice: false,
				url: url
			}
		}
		var node = FS.createFile(parent, name, properties, canRead, canWrite);
		if (properties.contents) {
			node.contents = properties.contents
		} else if (properties.url) {
			node.contents = null;
			node.url = properties.url
		}
		Object.defineProperties(node, {
			usedBytes: {
				get: (function() {
					return this.contents.length
				})
			}
		});
		var stream_ops = {};
		var keys = Object.keys(node.stream_ops);
		keys.forEach((function(key) {
			var fn = node.stream_ops[key];
			stream_ops[key] = function forceLoadLazyFile() {
				if (!FS.forceLoadFile(node)) {
					throw new FS.ErrnoError(ERRNO_CODES.EIO)
				}
				return fn.apply(null, arguments)
			}
		}));
		stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
			if (!FS.forceLoadFile(node)) {
				throw new FS.ErrnoError(ERRNO_CODES.EIO)
			}
			var contents = stream.node.contents;
			if (position >= contents.length) return 0;
			var size = Math.min(contents.length - position, length);
			assert(size >= 0);
			if (contents.slice) {
				for (var i = 0; i < size; i++) {
					buffer[offset + i] = contents[position + i]
				}
			} else {
				for (var i = 0; i < size; i++) {
					buffer[offset + i] = contents.get(position + i)
				}
			}
			return size
		};
		node.stream_ops = stream_ops;
		return node
	}),
	createPreloadedFile: (function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
		Browser.init();
		var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
		var dep = getUniqueRunDependency("cp " + fullname);

		function processData(byteArray) {
			function finish(byteArray) {
				if (preFinish) preFinish();
				if (!dontCreateFile) {
					FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
				}
				if (onload) onload();
				removeRunDependency(dep)
			}
			var handled = false;
			Module["preloadPlugins"].forEach((function(plugin) {
				if (handled) return;
				if (plugin["canHandle"](fullname)) {
					plugin["handle"](byteArray, fullname, finish, (function() {
						if (onerror) onerror();
						removeRunDependency(dep)
					}));
					handled = true
				}
			}));
			if (!handled) finish(byteArray)
		}
		addRunDependency(dep);
		if (typeof url == "string") {
			Browser.asyncLoad(url, (function(byteArray) {
				processData(byteArray)
			}), onerror)
		} else {
			processData(url)
		}
	}),
	indexedDB: (function() {
		return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
	}),
	DB_NAME: (function() {
		return "EM_FS_" + window.location.pathname
	}),
	DB_VERSION: 20,
	DB_STORE_NAME: "FILE_DATA",
	saveFilesToDB: (function(paths, onload, onerror) {
		onload = onload || (function() {});
		onerror = onerror || (function() {});
		var indexedDB = FS.indexedDB();
		try {
			var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
		} catch (e) {
			return onerror(e)
		}
		openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
			console.log("creating db");
			var db = openRequest.result;
			db.createObjectStore(FS.DB_STORE_NAME)
		};
		openRequest.onsuccess = function openRequest_onsuccess() {
			var db = openRequest.result;
			var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
			var files = transaction.objectStore(FS.DB_STORE_NAME);
			var ok = 0,
				fail = 0,
				total = paths.length;

			function finish() {
				if (fail == 0) onload();
				else onerror()
			}
			paths.forEach((function(path) {
				var putRequest = files.put(FS.analyzePath(path).object.contents, path);
				putRequest.onsuccess = function putRequest_onsuccess() {
					ok++;
					if (ok + fail == total) finish()
				};
				putRequest.onerror = function putRequest_onerror() {
					fail++;
					if (ok + fail == total) finish()
				}
			}));
			transaction.onerror = onerror
		};
		openRequest.onerror = onerror
	}),
	loadFilesFromDB: (function(paths, onload, onerror) {
		onload = onload || (function() {});
		onerror = onerror || (function() {});
		var indexedDB = FS.indexedDB();
		try {
			var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
		} catch (e) {
			return onerror(e)
		}
		openRequest.onupgradeneeded = onerror;
		openRequest.onsuccess = function openRequest_onsuccess() {
			var db = openRequest.result;
			try {
				var transaction = db.transaction([FS.DB_STORE_NAME], "readonly")
			} catch (e) {
				onerror(e);
				return
			}
			var files = transaction.objectStore(FS.DB_STORE_NAME);
			var ok = 0,
				fail = 0,
				total = paths.length;

			function finish() {
				if (fail == 0) onload();
				else onerror()
			}
			paths.forEach((function(path) {
				var getRequest = files.get(path);
				getRequest.onsuccess = function getRequest_onsuccess() {
					if (FS.analyzePath(path).exists) {
						FS.unlink(path)
					}
					FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
					ok++;
					if (ok + fail == total) finish()
				};
				getRequest.onerror = function getRequest_onerror() {
					fail++;
					if (ok + fail == total) finish()
				}
			}));
			transaction.onerror = onerror
		};
		openRequest.onerror = onerror
	})
};

function _emscripten_set_main_loop_timing(mode, value) {
	Browser.mainLoop.timingMode = mode;
	Browser.mainLoop.timingValue = value;
	if (!Browser.mainLoop.func) {
		return 1
	}
	if (mode == 0) {
		Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
			setTimeout(Browser.mainLoop.runner, value)
		};
		Browser.mainLoop.method = "timeout"
	} else if (mode == 1) {
		Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
			Browser.requestAnimationFrame(Browser.mainLoop.runner)
		};
		Browser.mainLoop.method = "rAF"
	} else if (mode == 2) {
		if (!window["setImmediate"]) {
			var setImmediates = [];
			var emscriptenMainLoopMessageId = "__emcc";

			function Browser_setImmediate_messageHandler(event) {
				if (event.source === window && event.data === emscriptenMainLoopMessageId) {
					event.stopPropagation();
					setImmediates.shift()()
				}
			}
			window.addEventListener("message", Browser_setImmediate_messageHandler, true);
			window["setImmediate"] = function Browser_emulated_setImmediate(func) {
				setImmediates.push(func);
				window.postMessage(emscriptenMainLoopMessageId, "*")
			}
		}
		Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
			window["setImmediate"](Browser.mainLoop.runner)
		};
		Browser.mainLoop.method = "immediate"
	}
	return 0
}

function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
	Module["noExitRuntime"] = true;
	assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
	Browser.mainLoop.func = func;
	Browser.mainLoop.arg = arg;
	var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
	Browser.mainLoop.runner = function Browser_mainLoop_runner() {
		if (ABORT) return;
		if (Browser.mainLoop.queue.length > 0) {
			var start = Date.now();
			var blocker = Browser.mainLoop.queue.shift();
			blocker.func(blocker.arg);
			if (Browser.mainLoop.remainingBlockers) {
				var remaining = Browser.mainLoop.remainingBlockers;
				var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
				if (blocker.counted) {
					Browser.mainLoop.remainingBlockers = next
				} else {
					next = next + .5;
					Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9
				}
			}
			console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
			Browser.mainLoop.updateStatus();
			if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
			setTimeout(Browser.mainLoop.runner, 0);
			return
		}
		if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
		Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
		if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
			Browser.mainLoop.scheduler();
			return
		}
		GL.newRenderingFrameStarted();
		if (Browser.mainLoop.method === "timeout" && Module.ctx) {
			Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
			Browser.mainLoop.method = ""
		}
		Browser.mainLoop.runIter((function() {
			if (typeof arg !== "undefined") {
				Runtime.dynCall("vi", func, [arg])
			} else {
				Runtime.dynCall("v", func)
			}
		}));
		if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
		if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
		Browser.mainLoop.scheduler()
	};
	if (!noSetTiming) {
		if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps);
		else _emscripten_set_main_loop_timing(1, 1);
		Browser.mainLoop.scheduler()
	}
	if (simulateInfiniteLoop) {
		throw "SimulateInfiniteLoop"
	}
}
var Browser = {
	mainLoop: {
		scheduler: null,
		method: "",
		currentlyRunningMainloop: 0,
		func: null,
		arg: 0,
		timingMode: 0,
		timingValue: 0,
		currentFrameNumber: 0,
		queue: [],
		pause: (function() {
			Browser.mainLoop.scheduler = null;
			Browser.mainLoop.currentlyRunningMainloop++
		}),
		resume: (function() {
			Browser.mainLoop.currentlyRunningMainloop++;
			var timingMode = Browser.mainLoop.timingMode;
			var timingValue = Browser.mainLoop.timingValue;
			var func = Browser.mainLoop.func;
			Browser.mainLoop.func = null;
			_emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
			_emscripten_set_main_loop_timing(timingMode, timingValue);
			Browser.mainLoop.scheduler()
		}),
		updateStatus: (function() {
			if (Module["setStatus"]) {
				var message = Module["statusMessage"] || "Please wait...";
				var remaining = Browser.mainLoop.remainingBlockers;
				var expected = Browser.mainLoop.expectedBlockers;
				if (remaining) {
					if (remaining < expected) {
						Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")")
					} else {
						Module["setStatus"](message)
					}
				} else {
					Module["setStatus"]("")
				}
			}
		}),
		runIter: (function(func) {
			if (ABORT) return;
			if (Module["preMainLoop"]) {
				var preRet = Module["preMainLoop"]();
				if (preRet === false) {
					return
				}
			}
			try {
				func()
			} catch (e) {
				if (e instanceof ExitStatus) {
					return
				} else {
					if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [e, e.stack]);
					throw e
				}
			}
			if (Module["postMainLoop"]) Module["postMainLoop"]()
		})
	},
	isFullScreen: false,
	pointerLock: false,
	moduleContextCreatedCallbacks: [],
	workers: [],
	init: (function() {
		if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
		if (Browser.initted) return;
		Browser.initted = true;
		try {
			new Blob;
			Browser.hasBlobConstructor = true
		} catch (e) {
			Browser.hasBlobConstructor = false;
			console.log("warning: no blob constructor, cannot create blobs with mimetypes")
		}
		Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
		Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
		if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
			console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
			Module.noImageDecoding = true
		}
		var imagePlugin = {};
		imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
			return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name)
		};
		imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
			var b = null;
			if (Browser.hasBlobConstructor) {
				try {
					b = new Blob([byteArray], {
						type: Browser.getMimetype(name)
					});
					if (b.size !== byteArray.length) {
						b = new Blob([(new Uint8Array(byteArray)).buffer], {
							type: Browser.getMimetype(name)
						})
					}
				} catch (e) {
					Runtime.warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder")
				}
			}
			if (!b) {
				var bb = new Browser.BlobBuilder;
				bb.append((new Uint8Array(byteArray)).buffer);
				b = bb.getBlob()
			}
			var url = Browser.URLObject.createObjectURL(b);
			var img = new Image;
			img.onload = function img_onload() {
				assert(img.complete, "Image " + name + " could not be decoded");
				var canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;
				var ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0);
				Module["preloadedImages"][name] = canvas;
				Browser.URLObject.revokeObjectURL(url);
				if (onload) onload(byteArray)
			};
			img.onerror = function img_onerror(event) {
				console.log("Image " + url + " could not be decoded");
				if (onerror) onerror()
			};
			img.src = url
		};
		Module["preloadPlugins"].push(imagePlugin);
		var audioPlugin = {};
		audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
			return !Module.noAudioDecoding && name.substr(-4) in {
				".ogg": 1,
				".wav": 1,
				".mp3": 1
			}
		};
		audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
			var done = false;

			function finish(audio) {
				if (done) return;
				done = true;
				Module["preloadedAudios"][name] = audio;
				if (onload) onload(byteArray)
			}

			function fail() {
				if (done) return;
				done = true;
				Module["preloadedAudios"][name] = new Audio;
				if (onerror) onerror()
			}
			if (Browser.hasBlobConstructor) {
				try {
					var b = new Blob([byteArray], {
						type: Browser.getMimetype(name)
					})
				} catch (e) {
					return fail()
				}
				var url = Browser.URLObject.createObjectURL(b);
				var audio = new Audio;
				audio.addEventListener("canplaythrough", (function() {
					finish(audio)
				}), false);
				audio.onerror = function audio_onerror(event) {
					if (done) return;
					console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");

					function encode64(data) {
						var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
						var PAD = "=";
						var ret = "";
						var leftchar = 0;
						var leftbits = 0;
						for (var i = 0; i < data.length; i++) {
							leftchar = leftchar << 8 | data[i];
							leftbits += 8;
							while (leftbits >= 6) {
								var curr = leftchar >> leftbits - 6 & 63;
								leftbits -= 6;
								ret += BASE[curr]
							}
						}
						if (leftbits == 2) {
							ret += BASE[(leftchar & 3) << 4];
							ret += PAD + PAD
						} else if (leftbits == 4) {
							ret += BASE[(leftchar & 15) << 2];
							ret += PAD
						}
						return ret
					}
					audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
					finish(audio)
				};
				audio.src = url;
				Browser.safeSetTimeout((function() {
					finish(audio)
				}), 1e4)
			} else {
				return fail()
			}
		};
		Module["preloadPlugins"].push(audioPlugin);
		var canvas = Module["canvas"];

		function pointerLockChange() {
			Browser.pointerLock = document["pointerLockElement"] === canvas || document["mozPointerLockElement"] === canvas || document["webkitPointerLockElement"] === canvas || document["msPointerLockElement"] === canvas
		}
		if (canvas) {
			canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (function() {});
			canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (function() {});
			canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
			document.addEventListener("pointerlockchange", pointerLockChange, false);
			document.addEventListener("mozpointerlockchange", pointerLockChange, false);
			document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
			document.addEventListener("mspointerlockchange", pointerLockChange, false);
			if (Module["elementPointerLock"]) {
				canvas.addEventListener("click", (function(ev) {
					if (!Browser.pointerLock && canvas.requestPointerLock) {
						canvas.requestPointerLock();
						ev.preventDefault()
					}
				}), false)
			}
		}
		window.addEventListener("orientationchange", Browser.onOrientationChanged, false)
	}),
	createContext: (function(canvas, useWebGL, setInModule, webGLContextAttributes) {
		if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
		var ctx;
		var contextHandle;
		if (useWebGL) {
			var contextAttributes = {
				antialias: false,
				alpha: false
			};
			if (webGLContextAttributes) {
				for (var attribute in webGLContextAttributes) {
					contextAttributes[attribute] = webGLContextAttributes[attribute]
				}
			}
			contextHandle = GL.createContext(canvas, contextAttributes);
			if (contextHandle) {
				ctx = GL.getContext(contextHandle).GLctx
			}
			canvas.style.backgroundColor = "black"
		} else {
			ctx = canvas.getContext("2d")
		}
		if (!ctx) return null;
		if (setInModule) {
			if (!useWebGL) assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
			Module.ctx = ctx;
			if (useWebGL) GL.makeContextCurrent(contextHandle);
			Module.useWebGL = useWebGL;
			Browser.moduleContextCreatedCallbacks.forEach((function(callback) {
				callback()
			}));
			Browser.init()
		}
		return ctx
	}),
	destroyContext: (function(canvas, useWebGL, setInModule) {}),
	fullScreenHandlersInstalled: false,
	lockPointer: undefined,
	resizeCanvas: true,
	requestFullScreen: (function(lockPointer, resizeCanvas, vrDevice) {
		Browser.lockPointer = lockPointer;
		Browser.resizeCanvas = true;
		Browser.vrDevice = vrDevice;
		if (typeof Browser.lockPointer === "undefined") Browser.lockPointer = true;
		if (typeof Browser.resizeCanvas === "undefined") Browser.resizeCanvas = true;
		if (typeof Browser.vrDevice === "undefined") Browser.vrDevice = null;
		var canvas = Module["canvas"];

		function fullScreenChange() {
			Browser.isFullScreen = false;
			var canvasContainer = canvas.parentNode;
			if ((document["webkitFullScreenElement"] || document["webkitFullscreenElement"] || document["mozFullScreenElement"] || document["mozFullscreenElement"] || document["fullScreenElement"] || document["fullscreenElement"] || document["msFullScreenElement"] || document["msFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
				canvas.cancelFullScreen = document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["webkitCancelFullScreen"] || document["msExitFullscreen"] || document["exitFullscreen"] || (function() {});
				canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
				if (Browser.lockPointer) canvas.requestPointerLock();
				Browser.isFullScreen = true;
				if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize()
			} else {
				canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
				canvasContainer.parentNode.removeChild(canvasContainer);
				if (Browser.resizeCanvas) Browser.setWindowedCanvasSize()
			}
			if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullScreen);
			Browser.updateCanvasDimensions(canvas);
			Browser.updateResizeListeners()
		}
		if (!Browser.fullScreenHandlersInstalled) {
			Browser.fullScreenHandlersInstalled = true;
			document.addEventListener("fullscreenchange", fullScreenChange, false);
			document.addEventListener("mozfullscreenchange", fullScreenChange, false);
			document.addEventListener("webkitfullscreenchange", fullScreenChange, false);
			document.addEventListener("MSFullscreenChange", fullScreenChange, false)
		}
		var canvasContainer = document.createElement("div");
		canvas.parentNode.insertBefore(canvasContainer, canvas);
		canvasContainer.appendChild(canvas);
		canvasContainer.requestFullScreen = canvasContainer["requestFullScreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullScreen"] ? (function() {
			canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"])
		}) : null);
		if (vrDevice) {
			canvasContainer.requestFullScreen({
				vrDisplay: vrDevice
			})
		} else {
			canvasContainer.requestFullScreen()
		}
	}),
	nextRAF: 0,
	fakeRequestAnimationFrame: (function(func) {
		var now = Date.now();
		if (Browser.nextRAF === 0) {
			Browser.nextRAF = now + 1e3 / 60
		} else {
			while (now + 2 >= Browser.nextRAF) {
				Browser.nextRAF += 1e3 / 60
			}
		}
		var delay = Math.max(Browser.nextRAF - now, 0);
		setTimeout(func, delay)
	}),
	requestAnimationFrame: function requestAnimationFrame(func) {
		if (typeof window === "undefined") {
			Browser.fakeRequestAnimationFrame(func)
		} else {
			if (!window.requestAnimationFrame) {
				window.requestAnimationFrame = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"] || Browser.fakeRequestAnimationFrame
			}
			window.requestAnimationFrame(func)
		}
	},
	safeCallback: (function(func) {
		return (function() {
			if (!ABORT) return func.apply(null, arguments)
		})
	}),
	allowAsyncCallbacks: true,
	queuedAsyncCallbacks: [],
	pauseAsyncCallbacks: (function() {
		Browser.allowAsyncCallbacks = false
	}),
	resumeAsyncCallbacks: (function() {
		Browser.allowAsyncCallbacks = true;
		if (Browser.queuedAsyncCallbacks.length > 0) {
			var callbacks = Browser.queuedAsyncCallbacks;
			Browser.queuedAsyncCallbacks = [];
			callbacks.forEach((function(func) {
				func()
			}))
		}
	}),
	safeRequestAnimationFrame: (function(func) {
		return Browser.requestAnimationFrame((function() {
			if (ABORT) return;
			if (Browser.allowAsyncCallbacks) {
				func()
			} else {
				Browser.queuedAsyncCallbacks.push(func)
			}
		}))
	}),
	safeSetTimeout: (function(func, timeout) {
		Module["noExitRuntime"] = true;
		return setTimeout((function() {
			if (ABORT) return;
			if (Browser.allowAsyncCallbacks) {
				func()
			} else {
				Browser.queuedAsyncCallbacks.push(func)
			}
		}), timeout)
	}),
	safeSetInterval: (function(func, timeout) {
		Module["noExitRuntime"] = true;
		return setInterval((function() {
			if (ABORT) return;
			if (Browser.allowAsyncCallbacks) {
				func()
			}
		}), timeout)
	}),
	getMimetype: (function(name) {
		return {
			"jpg": "image/jpeg",
			"jpeg": "image/jpeg",
			"png": "image/png",
			"bmp": "image/bmp",
			"ogg": "audio/ogg",
			"wav": "audio/wav",
			"mp3": "audio/mpeg"
		} [name.substr(name.lastIndexOf(".") + 1)]
	}),
	getUserMedia: (function(func) {
		if (!window.getUserMedia) {
			window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"]
		}
		window.getUserMedia(func)
	}),
	getMovementX: (function(event) {
		return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0
	}),
	getMovementY: (function(event) {
		return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0
	}),
	getMouseWheelDelta: (function(event) {
		var delta = 0;
		switch (event.type) {
			case "DOMMouseScroll":
				delta = event.detail;
				break;
			case "mousewheel":
				delta = event.wheelDelta;
				break;
			case "wheel":
				delta = event["deltaY"];
				break;
			default:
				throw "unrecognized mouse wheel event: " + event.type
		}
		return delta
	}),
	mouseX: 0,
	mouseY: 0,
	mouseMovementX: 0,
	mouseMovementY: 0,
	touches: {},
	lastTouches: {},
	calculateMouseEvent: (function(event) {
		if (Browser.pointerLock) {
			if (event.type != "mousemove" && "mozMovementX" in event) {
				Browser.mouseMovementX = Browser.mouseMovementY = 0
			} else {
				Browser.mouseMovementX = Browser.getMovementX(event);
				Browser.mouseMovementY = Browser.getMovementY(event)
			}
			if (typeof SDL != "undefined") {
				Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
				Browser.mouseY = SDL.mouseY + Browser.mouseMovementY
			} else {
				Browser.mouseX += Browser.mouseMovementX;
				Browser.mouseY += Browser.mouseMovementY
			}
		} else {
			var rect = Module["canvas"].getBoundingClientRect();
			var cw = Module["canvas"].width;
			var ch = Module["canvas"].height;
			var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
			var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
			if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
				var touch = event.touch;
				if (touch === undefined) {
					return
				}
				var adjustedX = touch.pageX - (scrollX + rect.left);
				var adjustedY = touch.pageY - (scrollY + rect.top);
				adjustedX = adjustedX * (cw / rect.width);
				adjustedY = adjustedY * (ch / rect.height);
				var coords = {
					x: adjustedX,
					y: adjustedY
				};
				if (event.type === "touchstart") {
					Browser.lastTouches[touch.identifier] = coords;
					Browser.touches[touch.identifier] = coords
				} else if (event.type === "touchend" || event.type === "touchmove") {
					var last = Browser.touches[touch.identifier];
					if (!last) last = coords;
					Browser.lastTouches[touch.identifier] = last;
					Browser.touches[touch.identifier] = coords
				}
				return
			}
			var x = event.pageX - (scrollX + rect.left);
			var y = event.pageY - (scrollY + rect.top);
			x = x * (cw / rect.width);
			y = y * (ch / rect.height);
			Browser.mouseMovementX = x - Browser.mouseX;
			Browser.mouseMovementY = y - Browser.mouseY;
			Browser.mouseX = x;
			Browser.mouseY = y
		}
	}),
	asyncLoad: (function(url, onload, onerror, noRunDep) {
		Module["readAsync"](url, (function(arrayBuffer) {
			assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
			onload(new Uint8Array(arrayBuffer));
			if (!noRunDep) removeRunDependency("al " + url)
		}), (function(event) {
			if (onerror) {
				onerror()
			} else {
				throw 'Loading data file "' + url + '" failed.'
			}
		}));
		if (!noRunDep) addRunDependency("al " + url)
	}),
	onOrientationChanged: (function() {
		if (Browser.isFullScreen) {
			Browser.updateCanvasDimensions(Module["canvas"], null, null);
			Browser.updateResizeListeners()
		}
	}),
	resizeListeners: [],
	updateResizeListeners: (function() {
		var canvas = Module["canvas"];
		Browser.resizeListeners.forEach((function(listener) {
			listener(canvas.width, canvas.height)
		}))
	}),
	setCanvasSize: (function(width, height, noUpdates) {
		var canvas = Module["canvas"];
		Browser.updateCanvasDimensions(canvas, width, height);
		if (!noUpdates) Browser.updateResizeListeners()
	}),
	windowedWidth: 0,
	windowedHeight: 0,
	setFullScreenCanvasSize: (function() {
		if (typeof SDL != "undefined") {
			var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
			flags = flags | 8388608;
			HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags
		}
	}),
	setWindowedCanvasSize: (function() {
		if (typeof SDL != "undefined") {
			var flags = HEAPU32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2];
			flags = flags & ~8388608;
			HEAP32[SDL.screen + Runtime.QUANTUM_SIZE * 0 >> 2] = flags
		}
	}),
	updateCanvasDimensions: (function(canvas, wNative, hNative) {
		if (wNative && hNative) {
			canvas.widthNative = wNative;
			canvas.heightNative = hNative
		} else {
			wNative = canvas.widthNative;
			hNative = canvas.heightNative
		}
		var w = wNative;
		var h = hNative;
		if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
			if (w / h < Module["forcedAspectRatio"]) {
				w = Math.round(h * Module["forcedAspectRatio"])
			} else {
				h = Math.round(w / Module["forcedAspectRatio"])
			}
		}
		var fullscreen = 0;
		if ((document["webkitFullScreenElement"] || document["webkitFullscreenElement"] || document["mozFullScreenElement"] || document["mozFullscreenElement"] || document["fullScreenElement"] || document["fullscreenElement"] || document["msFullScreenElement"] || document["msFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
			w = screen.width;
			h = screen.height;
			fullscreen = 1;
			if (window.devicePixelRatio) {
				w *= window.devicePixelRatio;
				h *= window.devicePixelRatio
			}
		}
		if (Browser.resizeCanvas) {
			if (canvas.width != w) canvas.width = w;
			if (canvas.height != h) canvas.height = h;
			if (typeof canvas.style != "undefined") {
				canvas.style.removeProperty("width");
				canvas.style.removeProperty("height");
				if (fullscreen) {
					canvas.parentNode.style.setProperty("width", "100%", "important");
					canvas.parentNode.style.setProperty("height", "100%", "important");
					canvas.style.setProperty("width", "100%", "important");
					canvas.style.setProperty("height", "100%", "important")
				}
			}
		} else {
			if (canvas.width != wNative) canvas.width = wNative;
			if (canvas.height != hNative) canvas.height = hNative;
			if (typeof canvas.style != "undefined") {
				if (w != wNative || h != hNative) {
					canvas.style.setProperty("width", w + "px", "important");
					canvas.style.setProperty("height", h + "px", "important")
				} else {
					canvas.style.removeProperty("width");
					canvas.style.removeProperty("height")
				}
			}
		}
	}),
	wgetRequests: {},
	nextWgetRequestHandle: 0,
	getNextWgetRequestHandle: (function() {
		var handle = Browser.nextWgetRequestHandle;
		Browser.nextWgetRequestHandle++;
		return handle
	})
};

function _malloc(bytes) {
	var ptr = Runtime.dynamicAlloc(bytes + 8);
	return ptr + 8 & 4294967288
}
Module["_malloc"] = _malloc;

function _free() {}
Module["_free"] = _free;
var _environ = STATICTOP;
STATICTOP += 16;

function ___buildEnvironment(env) {
	var MAX_ENV_VALUES = 64;
	var TOTAL_ENV_SIZE = 1024;
	var poolPtr;
	var envPtr;
	if (!___buildEnvironment.called) {
		___buildEnvironment.called = true;
		ENV["USER"] = ENV["LOGNAME"] = "web_user";
		ENV["PATH"] = "/";
		ENV["PWD"] = "/";
		ENV["HOME"] = "/home/web_user";
		ENV["LANG"] = "C";
		ENV["_"] = Module["thisProgram"];
		poolPtr = allocate(TOTAL_ENV_SIZE, "i8", ALLOC_STATIC);
		envPtr = allocate(MAX_ENV_VALUES * 4, "i8*", ALLOC_STATIC);
		HEAP32[envPtr >> 2] = poolPtr;
		HEAP32[_environ >> 2] = envPtr
	} else {
		envPtr = HEAP32[_environ >> 2];
		poolPtr = HEAP32[envPtr >> 2]
	}
	var strings = [];
	var totalSize = 0;
	for (var key in env) {
		if (typeof env[key] === "string") {
			var line = key + "=" + env[key];
			strings.push(line);
			totalSize += line.length
		}
	}
	if (totalSize > TOTAL_ENV_SIZE) {
		throw new Error("Environment size exceeded TOTAL_ENV_SIZE!")
	}
	var ptrSize = 4;
	for (var i = 0; i < strings.length; i++) {
		var line = strings[i];
		writeAsciiToMemory(line, poolPtr);
		HEAP32[envPtr + i * ptrSize >> 2] = poolPtr;
		poolPtr += line.length + 1
	}
	HEAP32[envPtr + strings.length * ptrSize >> 2] = 0
}
var ENV = {};

function _getenv(name) {
	if (name === 0) return 0;
	name = Pointer_stringify(name);
	if (!ENV.hasOwnProperty(name)) return 0;
	if (_getenv.ret) _free(_getenv.ret);
	_getenv.ret = allocate(intArrayFromString(ENV[name]), "i8", ALLOC_NORMAL);
	return _getenv.ret
}

function _putenv(string) {
	if (string === 0) {
		___setErrNo(ERRNO_CODES.EINVAL);
		return -1
	}
	string = Pointer_stringify(string);
	var splitPoint = string.indexOf("=");
	if (string === "" || string.indexOf("=") === -1) {
		___setErrNo(ERRNO_CODES.EINVAL);
		return -1
	}
	var name = string.slice(0, splitPoint);
	var value = string.slice(splitPoint + 1);
	if (!(name in ENV) || ENV[name] !== value) {
		ENV[name] = value;
		___buildEnvironment(ENV)
	}
	return 0
}

function _SDL_RWFromConstMem(mem, size) {
	var id = SDL.rwops.length;
	SDL.rwops.push({
		bytes: mem,
		count: size
	});
	return id
}

function _TTF_FontHeight(font) {
	var fontData = SDL.fonts[font];
	return fontData.size
}

function _TTF_SizeText(font, text, w, h) {
	var fontData = SDL.fonts[font];
	if (w) {
		HEAP32[w >> 2] = SDL.estimateTextWidth(fontData, Pointer_stringify(text))
	}
	if (h) {
		HEAP32[h >> 2] = fontData.size
	}
	return 0
}

function _TTF_RenderText_Solid(font, text, color) {
	text = Pointer_stringify(text) || " ";
	var fontData = SDL.fonts[font];
	var w = SDL.estimateTextWidth(fontData, text);
	var h = fontData.size;
	var color = SDL.loadColorToCSSRGB(color);
	var fontString = h + "px " + fontData.name;
	var surf = SDL.makeSurface(w, h, 0, false, "text:" + text);
	var surfData = SDL.surfaces[surf];
	surfData.ctx.save();
	surfData.ctx.fillStyle = color;
	surfData.ctx.font = fontString;
	surfData.ctx.textBaseline = "top";
	surfData.ctx.fillText(text, 0, 0);
	surfData.ctx.restore();
	return surf
}

function _Mix_HaltMusic() {
	var audio = SDL.music.audio;
	if (audio) {
		audio.src = audio.src;
		audio.currentPosition = 0;
		audio.pause()
	}
	SDL.music.audio = null;
	if (SDL.hookMusicFinished) {
		Runtime.dynCall("v", SDL.hookMusicFinished)
	}
	return 0
}

function _Mix_PlayMusic(id, loops) {
	if (SDL.music.audio) {
		if (!SDL.music.audio.paused) Module.printErr("Music is already playing. " + SDL.music.source);
		SDL.music.audio.pause()
	}
	var info = SDL.audios[id];
	var audio;
	if (info.webAudio) {
		audio = {};
		audio.resource = info;
		audio.paused = false;
		audio.currentPosition = 0;
		audio.play = (function() {
			SDL.playWebAudio(this)
		});
		audio.pause = (function() {
			SDL.pauseWebAudio(this)
		})
	} else if (info.audio) {
		audio = info.audio
	}
	audio["onended"] = (function() {
		if (SDL.music.audio == this) _Mix_HaltMusic()
	});
	audio.loop = loops != 0;
	audio.volume = SDL.music.volume;
	SDL.music.audio = audio;
	audio.play();
	return 0
}

function _Mix_FreeChunk(id) {
	SDL.audios[id] = null
}

function _Mix_LoadWAV_RW(rwopsID, freesrc) {
	var rwops = SDL.rwops[rwopsID];
	if (rwops === undefined) return 0;
	var filename = "";
	var audio;
	var webAudio;
	var bytes;
	if (rwops.filename !== undefined) {
		filename = PATH.resolve(rwops.filename);
		var raw = Module["preloadedAudios"][filename];
		if (!raw) {
			if (raw === null) Module.printErr("Trying to reuse preloaded audio, but freePreloadedMediaOnUse is set!");
			if (!Module.noAudioDecoding) Runtime.warnOnce("Cannot find preloaded audio " + filename);
			try {
				bytes = FS.readFile(filename)
			} catch (e) {
				Module.printErr("Couldn't find file for: " + filename);
				return 0
			}
		}
		if (Module["freePreloadedMediaOnUse"]) {
			Module["preloadedAudios"][filename] = null
		}
		audio = raw
	} else if (rwops.bytes !== undefined) {
		if (SDL.webAudioAvailable()) bytes = HEAPU8.buffer.slice(rwops.bytes, rwops.bytes + rwops.count);
		else bytes = HEAPU8.subarray(rwops.bytes, rwops.bytes + rwops.count)
	} else {
		return 0
	}
	var arrayBuffer = bytes ? bytes.buffer || bytes : bytes;
	var canPlayWithWebAudio = Module["SDL_canPlayWithWebAudio"] === undefined || Module["SDL_canPlayWithWebAudio"](filename, arrayBuffer);
	if (bytes !== undefined && SDL.webAudioAvailable() && canPlayWithWebAudio) {
		audio = undefined;
		webAudio = {};
		webAudio.onDecodeComplete = [];

		function onDecodeComplete(data) {
			webAudio.decodedBuffer = data;
			webAudio.onDecodeComplete.forEach((function(e) {
				e()
			}));
			webAudio.onDecodeComplete = undefined
		}
		SDL.audioContext["decodeAudioData"](arrayBuffer, onDecodeComplete)
	} else if (audio === undefined && bytes) {
		var blob = new Blob([bytes], {
			type: rwops.mimetype
		});
		var url = URL.createObjectURL(blob);
		audio = new Audio;
		audio.src = url;
		audio.mozAudioChannelType = "content"
	}
	var id = SDL.audios.length;
	SDL.audios.push({
		source: filename,
		audio: audio,
		webAudio: webAudio
	});
	return id
}

function _Mix_PlayChannel(channel, id, loops) {
	var info = SDL.audios[id];
	if (!info) return -1;
	if (!info.audio && !info.webAudio) return -1;
	if (channel == -1) {
		for (var i = SDL.channelMinimumNumber; i < SDL.numChannels; i++) {
			if (!SDL.channels[i].audio) {
				channel = i;
				break
			}
		}
		if (channel == -1) {
			Module.printErr("All " + SDL.numChannels + " channels in use!");
			return -1
		}
	}
	var channelInfo = SDL.channels[channel];
	var audio;
	if (info.webAudio) {
		audio = {};
		audio.resource = info;
		audio.paused = false;
		audio.currentPosition = 0;
		audio.play = (function() {
			SDL.playWebAudio(this)
		});
		audio.pause = (function() {
			SDL.pauseWebAudio(this)
		})
	} else {
		audio = info.audio.cloneNode(true);
		audio.numChannels = info.audio.numChannels;
		audio.frequency = info.audio.frequency
	}
	audio["onended"] = function SDL_audio_onended() {
		if (channelInfo.audio == this) {
			channelInfo.audio.paused = true;
			channelInfo.audio = null
		}
		if (SDL.channelFinished) Runtime.getFuncWrapper(SDL.channelFinished, "vi")(channel)
	};
	channelInfo.audio = audio;
	audio.loop = loops != 0;
	audio.volume = channelInfo.volume;
	audio.play();
	return channel
}

function _SDL_PauseAudio(pauseOn) {
	if (!SDL.audio) {
		return
	}
	if (pauseOn) {
		if (SDL.audio.timer !== undefined) {
			clearTimeout(SDL.audio.timer);
			SDL.audio.numAudioTimersPending = 0;
			SDL.audio.timer = undefined
		}
	} else if (!SDL.audio.timer) {
		SDL.audio.numAudioTimersPending = 1;
		SDL.audio.timer = Browser.safeSetTimeout(SDL.audio.caller, 1)
	}
	SDL.audio.paused = pauseOn
}

function _SDL_CloseAudio() {
	if (SDL.audio) {
		_SDL_PauseAudio(1);
		_free(SDL.audio.buffer);
		SDL.audio = null;
		SDL.allocateChannels(0)
	}
}

function _SDL_LockSurface(surf) {
	var surfData = SDL.surfaces[surf];
	surfData.locked++;
	if (surfData.locked > 1) return 0;
	if (!surfData.buffer) {
		surfData.buffer = _malloc(surfData.width * surfData.height * 4);
		HEAP32[surf + 20 >> 2] = surfData.buffer
	}
	HEAP32[surf + 20 >> 2] = surfData.buffer;
	if (surf == SDL.screen && Module.screenIsReadOnly && surfData.image) return 0;
	if (SDL.defaults.discardOnLock) {
		if (!surfData.image) {
			surfData.image = surfData.ctx.createImageData(surfData.width, surfData.height)
		}
		if (!SDL.defaults.opaqueFrontBuffer) return
	} else {
		surfData.image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height)
	}
	if (surf == SDL.screen && SDL.defaults.opaqueFrontBuffer) {
		var data = surfData.image.data;
		var num = data.length;
		for (var i = 0; i < num / 4; i++) {
			data[i * 4 + 3] = 255
		}
	}
	if (SDL.defaults.copyOnLock && !SDL.defaults.discardOnLock) {
		if (surfData.isFlagSet(2097152)) {
			throw "CopyOnLock is not supported for SDL_LockSurface with SDL_HWPALETTE flag set" + (new Error).stack
		} else {
			HEAPU8.set(surfData.image.data, surfData.buffer)
		}
	}
	return 0
}

function _SDL_FreeRW(rwopsID) {
	SDL.rwops[rwopsID] = null;
	while (SDL.rwops.length > 0 && SDL.rwops[SDL.rwops.length - 1] === null) {
		SDL.rwops.pop()
	}
}

function _IMG_Load_RW(rwopsID, freeSrc) {
	try {
		function cleanup() {
			if (rwops && freeSrc) _SDL_FreeRW(rwopsID)
		}

		function addCleanup(func) {
			var old = cleanup;
			cleanup = function added_cleanup() {
				old();
				func()
			}
		}
		var rwops = SDL.rwops[rwopsID];
		if (rwops === undefined) {
			return 0
		}
		var filename = rwops.filename;
		if (filename === undefined) {
			Runtime.warnOnce("Only file names that have been preloaded are supported for IMG_Load_RW. Consider using STB_IMAGE=1 if you want synchronous image decoding (see settings.js), or package files with --use-preload-plugins");
			return 0
		}
		if (!raw) {
			filename = PATH.resolve(filename);
			var raw = Module["preloadedImages"][filename];
			if (!raw) {
				if (raw === null) Module.printErr("Trying to reuse preloaded image, but freePreloadedMediaOnUse is set!");
				Runtime.warnOnce("Cannot find preloaded image " + filename);
				Runtime.warnOnce("Cannot find preloaded image " + filename + ". Consider using STB_IMAGE=1 if you want synchronous image decoding (see settings.js), or package files with --use-preload-plugins");
				return 0
			} else if (Module["freePreloadedMediaOnUse"]) {
				Module["preloadedImages"][filename] = null
			}
		}
		var surf = SDL.makeSurface(raw.width, raw.height, 0, false, "load:" + filename);
		var surfData = SDL.surfaces[surf];
		surfData.ctx.globalCompositeOperation = "copy";
		if (!raw.rawData) {
			surfData.ctx.drawImage(raw, 0, 0, raw.width, raw.height, 0, 0, raw.width, raw.height)
		} else {
			var imageData = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
			if (raw.bpp == 4) {
				imageData.data.set(HEAPU8.subarray(raw.data, raw.data + raw.size))
			} else if (raw.bpp == 3) {
				var pixels = raw.size / 3;
				var data = imageData.data;
				var sourcePtr = raw.data;
				var destPtr = 0;
				for (var i = 0; i < pixels; i++) {
					data[destPtr++] = HEAPU8[sourcePtr++ >> 0];
					data[destPtr++] = HEAPU8[sourcePtr++ >> 0];
					data[destPtr++] = HEAPU8[sourcePtr++ >> 0];
					data[destPtr++] = 255
				}
			} else if (raw.bpp == 1) {
				var pixels = raw.size;
				var data = imageData.data;
				var sourcePtr = raw.data;
				var destPtr = 0;
				for (var i = 0; i < pixels; i++) {
					var value = HEAPU8[sourcePtr++ >> 0];
					data[destPtr++] = value;
					data[destPtr++] = value;
					data[destPtr++] = value;
					data[destPtr++] = 255
				}
			} else {
				Module.printErr("cannot handle bpp " + raw.bpp);
				return 0
			}
			surfData.ctx.putImageData(imageData, 0, 0)
		}
		surfData.ctx.globalCompositeOperation = "source-over";
		_SDL_LockSurface(surf);
		surfData.locked--;
		if (SDL.GL) {
			surfData.canvas = surfData.ctx = null
		}
		return surf
	} finally {
		cleanup()
	}
}

function _SDL_RWFromFile(_name, mode) {
	var id = SDL.rwops.length;
	var name = Pointer_stringify(_name);
	SDL.rwops.push({
		filename: name,
		mimetype: Browser.getMimetype(name)
	});
	return id
}

function _IMG_Load(filename) {
	var rwops = _SDL_RWFromFile(filename);
	var result = _IMG_Load_RW(rwops, 1);
	return result
}

function _SDL_UpperBlitScaled(src, srcrect, dst, dstrect) {
	return SDL.blitSurface(src, srcrect, dst, dstrect, true)
}

function _SDL_UpperBlit(src, srcrect, dst, dstrect) {
	return SDL.blitSurface(src, srcrect, dst, dstrect, false)
}

function _SDL_GetTicks() {
	return Date.now() - SDL.startTime | 0
}
var SDL = {
	defaults: {
		width: 320,
		height: 200,
		copyOnLock: true,
		discardOnLock: false,
		opaqueFrontBuffer: true
	},
	version: null,
	surfaces: {},
	canvasPool: [],
	events: [],
	fonts: [null],
	audios: [null],
	rwops: [null],
	music: {
		audio: null,
		volume: 1
	},
	mixerFrequency: 22050,
	mixerFormat: 32784,
	mixerNumChannels: 2,
	mixerChunkSize: 1024,
	channelMinimumNumber: 0,
	GL: false,
	glAttributes: {
		0: 3,
		1: 3,
		2: 2,
		3: 0,
		4: 0,
		5: 1,
		6: 16,
		7: 0,
		8: 0,
		9: 0,
		10: 0,
		11: 0,
		12: 0,
		13: 0,
		14: 0,
		15: 1,
		16: 0,
		17: 0,
		18: 0
	},
	keyboardState: null,
	keyboardMap: {},
	canRequestFullscreen: false,
	isRequestingFullscreen: false,
	textInput: false,
	startTime: null,
	initFlags: 0,
	buttonState: 0,
	modState: 0,
	DOMButtons: [0, 0, 0],
	DOMEventToSDLEvent: {},
	TOUCH_DEFAULT_ID: 0,
	eventHandler: null,
	eventHandlerContext: null,
	eventHandlerTemp: 0,
	keyCodes: {
		16: 1249,
		17: 1248,
		18: 1250,
		20: 1081,
		33: 1099,
		34: 1102,
		35: 1101,
		36: 1098,
		37: 1104,
		38: 1106,
		39: 1103,
		40: 1105,
		44: 316,
		45: 1097,
		46: 127,
		91: 1251,
		93: 1125,
		96: 1122,
		97: 1113,
		98: 1114,
		99: 1115,
		100: 1116,
		101: 1117,
		102: 1118,
		103: 1119,
		104: 1120,
		105: 1121,
		106: 1109,
		107: 1111,
		109: 1110,
		110: 1123,
		111: 1108,
		112: 1082,
		113: 1083,
		114: 1084,
		115: 1085,
		116: 1086,
		117: 1087,
		118: 1088,
		119: 1089,
		120: 1090,
		121: 1091,
		122: 1092,
		123: 1093,
		124: 1128,
		125: 1129,
		126: 1130,
		127: 1131,
		128: 1132,
		129: 1133,
		130: 1134,
		131: 1135,
		132: 1136,
		133: 1137,
		134: 1138,
		135: 1139,
		144: 1107,
		160: 94,
		161: 33,
		162: 34,
		163: 35,
		164: 36,
		165: 37,
		166: 38,
		167: 95,
		168: 40,
		169: 41,
		170: 42,
		171: 43,
		172: 124,
		173: 45,
		174: 123,
		175: 125,
		176: 126,
		181: 127,
		182: 129,
		183: 128,
		188: 44,
		190: 46,
		191: 47,
		192: 96,
		219: 91,
		220: 92,
		221: 93,
		222: 39,
		224: 1251
	},
	scanCodes: {
		8: 42,
		9: 43,
		13: 40,
		27: 41,
		32: 44,
		35: 204,
		39: 53,
		44: 54,
		46: 55,
		47: 56,
		48: 39,
		49: 30,
		50: 31,
		51: 32,
		52: 33,
		53: 34,
		54: 35,
		55: 36,
		56: 37,
		57: 38,
		58: 203,
		59: 51,
		61: 46,
		91: 47,
		92: 49,
		93: 48,
		96: 52,
		97: 4,
		98: 5,
		99: 6,
		100: 7,
		101: 8,
		102: 9,
		103: 10,
		104: 11,
		105: 12,
		106: 13,
		107: 14,
		108: 15,
		109: 16,
		110: 17,
		111: 18,
		112: 19,
		113: 20,
		114: 21,
		115: 22,
		116: 23,
		117: 24,
		118: 25,
		119: 26,
		120: 27,
		121: 28,
		122: 29,
		127: 76,
		305: 224,
		308: 226,
		316: 70
	},
	loadRect: (function(rect) {
		return {
			x: HEAP32[rect + 0 >> 2],
			y: HEAP32[rect + 4 >> 2],
			w: HEAP32[rect + 8 >> 2],
			h: HEAP32[rect + 12 >> 2]
		}
	}),
	updateRect: (function(rect, r) {
		HEAP32[rect >> 2] = r.x;
		HEAP32[rect + 4 >> 2] = r.y;
		HEAP32[rect + 8 >> 2] = r.w;
		HEAP32[rect + 12 >> 2] = r.h
	}),
	intersectionOfRects: (function(first, second) {
		var leftX = Math.max(first.x, second.x);
		var leftY = Math.max(first.y, second.y);
		var rightX = Math.min(first.x + first.w, second.x + second.w);
		var rightY = Math.min(first.y + first.h, second.y + second.h);
		return {
			x: leftX,
			y: leftY,
			w: Math.max(leftX, rightX) - leftX,
			h: Math.max(leftY, rightY) - leftY
		}
	}),
	checkPixelFormat: (function(fmt) {}),
	loadColorToCSSRGB: (function(color) {
		var rgba = HEAP32[color >> 2];
		return "rgb(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + ")"
	}),
	loadColorToCSSRGBA: (function(color) {
		var rgba = HEAP32[color >> 2];
		return "rgba(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + "," + (rgba >> 24 & 255) / 255 + ")"
	}),
	translateColorToCSSRGBA: (function(rgba) {
		return "rgba(" + (rgba & 255) + "," + (rgba >> 8 & 255) + "," + (rgba >> 16 & 255) + "," + (rgba >>> 24) / 255 + ")"
	}),
	translateRGBAToCSSRGBA: (function(r, g, b, a) {
		return "rgba(" + (r & 255) + "," + (g & 255) + "," + (b & 255) + "," + (a & 255) / 255 + ")"
	}),
	translateRGBAToColor: (function(r, g, b, a) {
		return r | g << 8 | b << 16 | a << 24
	}),
	makeSurface: (function(width, height, flags, usePageCanvas, source, rmask, gmask, bmask, amask) {
		flags = flags || 0;
		var is_SDL_HWSURFACE = flags & 1;
		var is_SDL_HWPALETTE = flags & 2097152;
		var is_SDL_OPENGL = flags & 67108864;
		var surf = _malloc(60);
		var pixelFormat = _malloc(44);
		var bpp = is_SDL_HWPALETTE ? 1 : 4;
		var buffer = 0;
		if (!is_SDL_HWSURFACE && !is_SDL_OPENGL) {
			buffer = _malloc(width * height * 4)
		}
		HEAP32[surf >> 2] = flags;
		HEAP32[surf + 4 >> 2] = pixelFormat;
		HEAP32[surf + 8 >> 2] = width;
		HEAP32[surf + 12 >> 2] = height;
		HEAP32[surf + 16 >> 2] = width * bpp;
		HEAP32[surf + 20 >> 2] = buffer;
		HEAP32[surf + 36 >> 2] = 0;
		HEAP32[surf + 40 >> 2] = 0;
		HEAP32[surf + 44 >> 2] = Module["canvas"].width;
		HEAP32[surf + 48 >> 2] = Module["canvas"].height;
		HEAP32[surf + 56 >> 2] = 1;
		HEAP32[pixelFormat >> 2] = -2042224636;
		HEAP32[pixelFormat + 4 >> 2] = 0;
		HEAP8[pixelFormat + 8 >> 0] = bpp * 8;
		HEAP8[pixelFormat + 9 >> 0] = bpp;
		HEAP32[pixelFormat + 12 >> 2] = rmask || 255;
		HEAP32[pixelFormat + 16 >> 2] = gmask || 65280;
		HEAP32[pixelFormat + 20 >> 2] = bmask || 16711680;
		HEAP32[pixelFormat + 24 >> 2] = amask || 4278190080;
		SDL.GL = SDL.GL || is_SDL_OPENGL;
		var canvas;
		if (!usePageCanvas) {
			if (SDL.canvasPool.length > 0) {
				canvas = SDL.canvasPool.pop()
			} else {
				canvas = document.createElement("canvas")
			}
			canvas.width = width;
			canvas.height = height
		} else {
			canvas = Module["canvas"]
		}
		var webGLContextAttributes = {
			antialias: SDL.glAttributes[13] != 0 && SDL.glAttributes[14] > 1,
			depth: SDL.glAttributes[6] > 0,
			stencil: SDL.glAttributes[7] > 0
		};
		var ctx = Browser.createContext(canvas, is_SDL_OPENGL, usePageCanvas, webGLContextAttributes);
		SDL.surfaces[surf] = {
			width: width,
			height: height,
			canvas: canvas,
			ctx: ctx,
			surf: surf,
			buffer: buffer,
			pixelFormat: pixelFormat,
			alpha: 255,
			flags: flags,
			locked: 0,
			usePageCanvas: usePageCanvas,
			source: source,
			isFlagSet: (function(flag) {
				return flags & flag
			})
		};
		return surf
	}),
	copyIndexedColorData: (function(surfData, rX, rY, rW, rH) {
		if (!surfData.colors) {
			return
		}
		var fullWidth = Module["canvas"].width;
		var fullHeight = Module["canvas"].height;
		var startX = rX || 0;
		var startY = rY || 0;
		var endX = (rW || fullWidth - startX) + startX;
		var endY = (rH || fullHeight - startY) + startY;
		var buffer = surfData.buffer;
		if (!surfData.image.data32) {
			surfData.image.data32 = new Uint32Array(surfData.image.data.buffer)
		}
		var data32 = surfData.image.data32;
		var colors32 = surfData.colors32;
		for (var y = startY; y < endY; ++y) {
			var base = y * fullWidth;
			for (var x = startX; x < endX; ++x) {
				data32[base + x] = colors32[HEAPU8[buffer + base + x >> 0]]
			}
		}
	}),
	freeSurface: (function(surf) {
		var refcountPointer = surf + 56;
		var refcount = HEAP32[refcountPointer >> 2];
		if (refcount > 1) {
			HEAP32[refcountPointer >> 2] = refcount - 1;
			return
		}
		var info = SDL.surfaces[surf];
		if (!info.usePageCanvas && info.canvas) SDL.canvasPool.push(info.canvas);
		if (info.buffer) _free(info.buffer);
		_free(info.pixelFormat);
		_free(surf);
		SDL.surfaces[surf] = null;
		if (surf === SDL.screen) {
			SDL.screen = null
		}
	}),
	blitSurface__deps: ["SDL_LockSurface"],
	blitSurface: (function(src, srcrect, dst, dstrect, scale) {
		var srcData = SDL.surfaces[src];
		var dstData = SDL.surfaces[dst];
		var sr, dr;
		if (srcrect) {
			sr = SDL.loadRect(srcrect)
		} else {
			sr = {
				x: 0,
				y: 0,
				w: srcData.width,
				h: srcData.height
			}
		}
		if (dstrect) {
			dr = SDL.loadRect(dstrect)
		} else {
			dr = {
				x: 0,
				y: 0,
				w: srcData.width,
				h: srcData.height
			}
		}
		if (dstData.clipRect) {
			var widthScale = !scale || sr.w === 0 ? 1 : sr.w / dr.w;
			var heightScale = !scale || sr.h === 0 ? 1 : sr.h / dr.h;
			dr = SDL.intersectionOfRects(dstData.clipRect, dr);
			sr.w = dr.w * widthScale;
			sr.h = dr.h * heightScale;
			if (dstrect) {
				SDL.updateRect(dstrect, dr)
			}
		}
		var blitw, blith;
		if (scale) {
			blitw = dr.w;
			blith = dr.h
		} else {
			blitw = sr.w;
			blith = sr.h
		}
		if (sr.w === 0 || sr.h === 0 || blitw === 0 || blith === 0) {
			return 0
		}
		var oldAlpha = dstData.ctx.globalAlpha;
		dstData.ctx.globalAlpha = srcData.alpha / 255;
		dstData.ctx.drawImage(srcData.canvas, sr.x, sr.y, sr.w, sr.h, dr.x, dr.y, blitw, blith);
		dstData.ctx.globalAlpha = oldAlpha;
		if (dst != SDL.screen) {
			Runtime.warnOnce("WARNING: copying canvas data to memory for compatibility");
			_SDL_LockSurface(dst);
			dstData.locked--
		}
		return 0
	}),
	downFingers: {},
	savedKeydown: null,
	receiveEvent: (function(event) {
		function unpressAllPressedKeys() {
			for (var code in SDL.keyboardMap) {
				SDL.events.push({
					type: "keyup",
					keyCode: SDL.keyboardMap[code]
				})
			}
		}
		switch (event.type) {
			case "touchstart":
			case "touchmove": {
				event.preventDefault();
				var touches = [];
				if (event.type === "touchstart") {
					for (var i = 0; i < event.touches.length; i++) {
						var touch = event.touches[i];
						if (SDL.downFingers[touch.identifier] != true) {
							SDL.downFingers[touch.identifier] = true;
							touches.push(touch)
						}
					}
				} else {
					touches = event.touches
				}
				var firstTouch = touches[0];
				if (event.type == "touchstart") {
					SDL.DOMButtons[0] = 1
				}
				var mouseEventType;
				switch (event.type) {
					case "touchstart":
						mouseEventType = "mousedown";
						break;
					case "touchmove":
						mouseEventType = "mousemove";
						break
				}
				var mouseEvent = {
					type: mouseEventType,
					button: 0,
					pageX: firstTouch.clientX,
					pageY: firstTouch.clientY
				};
				SDL.events.push(mouseEvent);
				for (var i = 0; i < touches.length; i++) {
					var touch = touches[i];
					SDL.events.push({
						type: event.type,
						touch: touch
					})
				}
				break
			};
		case "touchend": {
			event.preventDefault();
			for (var i = 0; i < event.changedTouches.length; i++) {
				var touch = event.changedTouches[i];
				if (SDL.downFingers[touch.identifier] === true) {
					delete SDL.downFingers[touch.identifier]
				}
			}
			var mouseEvent = {
				type: "mouseup",
				button: 0,
				pageX: event.changedTouches[0].clientX,
				pageY: event.changedTouches[0].clientY
			};
			SDL.DOMButtons[0] = 0;
			SDL.events.push(mouseEvent);
			for (var i = 0; i < event.changedTouches.length; i++) {
				var touch = event.changedTouches[i];
				SDL.events.push({
					type: "touchend",
					touch: touch
				})
			}
			break
		};
		case "DOMMouseScroll":
		case "mousewheel":
		case "wheel":
			var delta = -Browser.getMouseWheelDelta(event);
			delta = delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
			var button = delta > 0 ? 3 : 4;
			SDL.events.push({
				type: "mousedown",
				button: button,
				pageX: event.pageX,
				pageY: event.pageY
			});
			SDL.events.push({
				type: "mouseup",
				button: button,
				pageX: event.pageX,
				pageY: event.pageY
			});
			SDL.events.push({
				type: "wheel",
				deltaX: 0,
				deltaY: delta
			});
			event.preventDefault();
			break;
		case "mousemove":
			if (SDL.DOMButtons[0] === 1) {
				SDL.events.push({
					type: "touchmove",
					touch: {
						identifier: 0,
						deviceID: -1,
						pageX: event.pageX,
						pageY: event.pageY
					}
				})
			}
			if (Browser.pointerLock) {
				if ("mozMovementX" in event) {
					event["movementX"] = event["mozMovementX"];
					event["movementY"] = event["mozMovementY"]
				}
				if (event["movementX"] == 0 && event["movementY"] == 0) {
					event.preventDefault();
					return
				}
			};
		case "keydown":
		case "keyup":
		case "keypress":
		case "mousedown":
		case "mouseup":
			if (event.type !== "keydown" || !SDL.unicode && !SDL.textInput || event.keyCode === 8 || event.keyCode === 9) {
				event.preventDefault()
			}
			if (event.type == "mousedown") {
				SDL.DOMButtons[event.button] = 1;
				SDL.events.push({
					type: "touchstart",
					touch: {
						identifier: 0,
						deviceID: -1,
						pageX: event.pageX,
						pageY: event.pageY
					}
				})
			} else if (event.type == "mouseup") {
				if (!SDL.DOMButtons[event.button]) {
					return
				}
				SDL.events.push({
					type: "touchend",
					touch: {
						identifier: 0,
						deviceID: -1,
						pageX: event.pageX,
						pageY: event.pageY
					}
				});
				SDL.DOMButtons[event.button] = 0
			}
			if (event.type === "keydown" || event.type === "mousedown") {
				SDL.canRequestFullscreen = true
			} else if (event.type === "keyup" || event.type === "mouseup") {
				if (SDL.isRequestingFullscreen) {
					Module["requestFullScreen"](true, true);
					SDL.isRequestingFullscreen = false
				}
				SDL.canRequestFullscreen = false
			}
			if (event.type === "keypress" && SDL.savedKeydown) {
				SDL.savedKeydown.keypressCharCode = event.charCode;
				SDL.savedKeydown = null
			} else if (event.type === "keydown") {
				SDL.savedKeydown = event
			}
			if (event.type !== "keypress" || SDL.textInput) {
				SDL.events.push(event)
			}
			break;
		case "mouseout":
			for (var i = 0; i < 3; i++) {
				if (SDL.DOMButtons[i]) {
					SDL.events.push({
						type: "mouseup",
						button: i,
						pageX: event.pageX,
						pageY: event.pageY
					});
					SDL.DOMButtons[i] = 0
				}
			}
			event.preventDefault();
			break;
		case "focus":
			SDL.events.push(event);
			event.preventDefault();
			break;
		case "blur":
			SDL.events.push(event);
			unpressAllPressedKeys();
			event.preventDefault();
			break;
		case "visibilitychange":
			SDL.events.push({
				type: "visibilitychange",
				visible: !document.hidden
			});
			unpressAllPressedKeys();
			event.preventDefault();
			break;
		case "unload":
			if (Browser.mainLoop.runner) {
				SDL.events.push(event);
				Browser.mainLoop.runner()
			}
			return;
		case "resize":
			SDL.events.push(event);
			if (event.preventDefault) {
				event.preventDefault()
			}
			break
		}
		if (SDL.events.length >= 1e4) {
			Module.printErr("SDL event queue full, dropping events");
			SDL.events = SDL.events.slice(0, 1e4)
		}
		SDL.flushEventsToHandler();
		return
	}),
	lookupKeyCodeForEvent: (function(event) {
		var code = event.keyCode;
		if (code >= 65 && code <= 90) {
			code += 32
		} else {
			code = SDL.keyCodes[event.keyCode] || event.keyCode;
			if (event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT && code >= (224 | 1 << 10) && code <= (227 | 1 << 10)) {
				code += 4
			}
		}
		return code
	}),
	handleEvent: (function(event) {
		if (event.handled) return;
		event.handled = true;
		switch (event.type) {
			case "touchstart":
			case "touchend":
			case "touchmove": {
				Browser.calculateMouseEvent(event);
				break
			};
		case "keydown":
		case "keyup": {
			var down = event.type === "keydown";
			var code = SDL.lookupKeyCodeForEvent(event);
			HEAP8[SDL.keyboardState + code >> 0] = down;
			SDL.modState = (HEAP8[SDL.keyboardState + 1248 >> 0] ? 64 : 0) | (HEAP8[SDL.keyboardState + 1249 >> 0] ? 1 : 0) | (HEAP8[SDL.keyboardState + 1250 >> 0] ? 256 : 0) | (HEAP8[SDL.keyboardState + 1252 >> 0] ? 128 : 0) | (HEAP8[SDL.keyboardState + 1253 >> 0] ? 2 : 0) | (HEAP8[SDL.keyboardState + 1254 >> 0] ? 512 : 0);
			if (down) {
				SDL.keyboardMap[code] = event.keyCode
			} else {
				delete SDL.keyboardMap[code]
			}
			break
		};
		case "mousedown":
		case "mouseup":
			if (event.type == "mousedown") {
				SDL.buttonState |= 1 << event.button
			} else if (event.type == "mouseup") {
				SDL.buttonState &= ~(1 << event.button)
			};
		case "mousemove": {
			Browser.calculateMouseEvent(event);
			break
		}
		}
	}),
	flushEventsToHandler: (function() {
		if (!SDL.eventHandler) return;
		while (SDL.pollEvent(SDL.eventHandlerTemp)) {
			Runtime.dynCall("iii", SDL.eventHandler, [SDL.eventHandlerContext, SDL.eventHandlerTemp])
		}
	}),
	pollEvent: (function(ptr) {
		if (SDL.initFlags & 512 && SDL.joystickEventState) {
			SDL.queryJoysticks()
		}
		if (ptr) {
			while (SDL.events.length > 0) {
				if (SDL.makeCEvent(SDL.events.shift(), ptr) !== false) return 1
			}
			return 0
		} else {
			return SDL.events.length > 0
		}
	}),
	makeCEvent: (function(event, ptr) {
		if (typeof event === "number") {
			_memcpy(ptr, event, 28);
			_free(event);
			return
		}
		SDL.handleEvent(event);
		switch (event.type) {
			case "keydown":
			case "keyup": {
				var down = event.type === "keydown";
				var key = SDL.lookupKeyCodeForEvent(event);
				var scan;
				if (key >= 1024) {
					scan = key - 1024
				} else {
					scan = SDL.scanCodes[key] || key
				}
				HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
				HEAP8[ptr + 8 >> 0] = down ? 1 : 0;
				HEAP8[ptr + 9 >> 0] = 0;
				HEAP32[ptr + 12 >> 2] = scan;
				HEAP32[ptr + 16 >> 2] = key;
				HEAP16[ptr + 20 >> 1] = SDL.modState;
				HEAP32[ptr + 24 >> 2] = event.keypressCharCode || key;
				break
			};
		case "keypress": {
			HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
			var cStr = intArrayFromString(String.fromCharCode(event.charCode));
			for (var i = 0; i < cStr.length; ++i) {
				HEAP8[ptr + (8 + i) >> 0] = cStr[i]
			}
			break
		};
		case "mousedown":
		case "mouseup":
		case "mousemove": {
			if (event.type != "mousemove") {
				var down = event.type === "mousedown";
				HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
				HEAP32[ptr + 4 >> 2] = 0;
				HEAP32[ptr + 8 >> 2] = 0;
				HEAP32[ptr + 12 >> 2] = 0;
				HEAP8[ptr + 16 >> 0] = event.button + 1;
				HEAP8[ptr + 17 >> 0] = down ? 1 : 0;
				HEAP32[ptr + 20 >> 2] = Browser.mouseX;
				HEAP32[ptr + 24 >> 2] = Browser.mouseY
			} else {
				HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
				HEAP32[ptr + 4 >> 2] = 0;
				HEAP32[ptr + 8 >> 2] = 0;
				HEAP32[ptr + 12 >> 2] = 0;
				HEAP32[ptr + 16 >> 2] = SDL.buttonState;
				HEAP32[ptr + 20 >> 2] = Browser.mouseX;
				HEAP32[ptr + 24 >> 2] = Browser.mouseY;
				HEAP32[ptr + 28 >> 2] = Browser.mouseMovementX;
				HEAP32[ptr + 32 >> 2] = Browser.mouseMovementY
			}
			break
		};
		case "wheel": {
			HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
			HEAP32[ptr + 16 >> 2] = event.deltaX;
			HEAP32[ptr + 20 >> 2] = event.deltaY;
			break
		};
		case "touchstart":
		case "touchend":
		case "touchmove": {
			var touch = event.touch;
			if (!Browser.touches[touch.identifier]) break;
			var w = Module["canvas"].width;
			var h = Module["canvas"].height;
			var x = Browser.touches[touch.identifier].x / w;
			var y = Browser.touches[touch.identifier].y / h;
			var lx = Browser.lastTouches[touch.identifier].x / w;
			var ly = Browser.lastTouches[touch.identifier].y / h;
			var dx = x - lx;
			var dy = y - ly;
			if (touch["deviceID"] === undefined) touch.deviceID = SDL.TOUCH_DEFAULT_ID;
			if (dx === 0 && dy === 0 && event.type === "touchmove") return false;
			HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
			HEAP32[ptr + 4 >> 2] = _SDL_GetTicks();
			tempI64 = [touch.deviceID >>> 0, (tempDouble = touch.deviceID, +Math_abs(tempDouble) >= +1 ? tempDouble > +0 ? (Math_min(+Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0 : 0)], HEAP32[ptr + 8 >> 2] = tempI64[0], HEAP32[ptr + 12 >> 2] = tempI64[1];
			tempI64 = [touch.identifier >>> 0, (tempDouble = touch.identifier, +Math_abs(tempDouble) >= +1 ? tempDouble > +0 ? (Math_min(+Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0 : 0)], HEAP32[ptr + 16 >> 2] = tempI64[0], HEAP32[ptr + 20 >> 2] = tempI64[1];
			HEAPF32[ptr + 24 >> 2] = x;
			HEAPF32[ptr + 28 >> 2] = y;
			HEAPF32[ptr + 32 >> 2] = dx;
			HEAPF32[ptr + 36 >> 2] = dy;
			if (touch.force !== undefined) {
				HEAPF32[ptr + 40 >> 2] = touch.force
			} else {
				HEAPF32[ptr + 40 >> 2] = event.type == "touchend" ? 0 : 1
			}
			break
		};
		case "unload": {
			HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
			break
		};
		case "resize": {
			HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
			HEAP32[ptr + 4 >> 2] = event.w;
			HEAP32[ptr + 8 >> 2] = event.h;
			break
		};
		case "joystick_button_up":
		case "joystick_button_down": {
			var state = event.type === "joystick_button_up" ? 0 : 1;
			HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
			HEAP8[ptr + 4 >> 0] = event.index;
			HEAP8[ptr + 5 >> 0] = event.button;
			HEAP8[ptr + 6 >> 0] = state;
			break
		};
		case "joystick_axis_motion": {
			HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
			HEAP8[ptr + 4 >> 0] = event.index;
			HEAP8[ptr + 5 >> 0] = event.axis;
			HEAP32[ptr + 8 >> 2] = SDL.joystickAxisValueConversion(event.value);
			break
		};
		case "focus": {
			var SDL_WINDOWEVENT_FOCUS_GAINED = 12;
			HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
			HEAP32[ptr + 4 >> 2] = 0;
			HEAP8[ptr + 8 >> 0] = SDL_WINDOWEVENT_FOCUS_GAINED;
			break
		};
		case "blur": {
			var SDL_WINDOWEVENT_FOCUS_LOST = 13;
			HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
			HEAP32[ptr + 4 >> 2] = 0;
			HEAP8[ptr + 8 >> 0] = SDL_WINDOWEVENT_FOCUS_LOST;
			break
		};
		case "visibilitychange": {
			var SDL_WINDOWEVENT_SHOWN = 1;
			var SDL_WINDOWEVENT_HIDDEN = 2;
			var visibilityEventID = event.visible ? SDL_WINDOWEVENT_SHOWN : SDL_WINDOWEVENT_HIDDEN;
			HEAP32[ptr >> 2] = SDL.DOMEventToSDLEvent[event.type];
			HEAP32[ptr + 4 >> 2] = 0;
			HEAP8[ptr + 8 >> 0] = visibilityEventID;
			break
		};
		default:
			throw "Unhandled SDL event: " + event.type
		}
	}),
	estimateTextWidth: (function(fontData, text) {
		var h = fontData.size;
		var fontString = h + "px " + fontData.name;
		var tempCtx = SDL.ttfContext;
		tempCtx.save();
		tempCtx.font = fontString;
		var ret = tempCtx.measureText(text).width | 0;
		tempCtx.restore();
		return ret
	}),
	allocateChannels: (function(num) {
		if (SDL.numChannels && SDL.numChannels >= num && num != 0) return;
		SDL.numChannels = num;
		SDL.channels = [];
		for (var i = 0; i < num; i++) {
			SDL.channels[i] = {
				audio: null,
				volume: 1
			}
		}
	}),
	setGetVolume: (function(info, volume) {
		if (!info) return 0;
		var ret = info.volume * 128;
		if (volume != -1) {
			info.volume = Math.min(Math.max(volume, 0), 128) / 128;
			if (info.audio) {
				try {
					info.audio.volume = info.volume;
					if (info.audio.webAudioGainNode) info.audio.webAudioGainNode["gain"]["value"] = info.volume
				} catch (e) {
					Module.printErr("setGetVolume failed to set audio volume: " + e)
				}
			}
		}
		return ret
	}),
	setPannerPosition: (function(info, x, y, z) {
		if (!info) return;
		if (info.audio) {
			if (info.audio.webAudioPannerNode) {
				info.audio.webAudioPannerNode["setPosition"](x, y, z)
			}
		}
	}),
	playWebAudio: (function(audio) {
		if (!audio) return;
		if (audio.webAudioNode) return;
		if (!SDL.webAudioAvailable()) return;
		try {
			var webAudio = audio.resource.webAudio;
			audio.paused = false;
			if (!webAudio.decodedBuffer) {
				if (webAudio.onDecodeComplete === undefined) abort("Cannot play back audio object that was not loaded");
				webAudio.onDecodeComplete.push((function() {
					if (!audio.paused) SDL.playWebAudio(audio)
				}));
				return
			}
			audio.webAudioNode = SDL.audioContext["createBufferSource"]();
			audio.webAudioNode["buffer"] = webAudio.decodedBuffer;
			audio.webAudioNode["loop"] = audio.loop;
			audio.webAudioNode["onended"] = (function() {
				audio["onended"]()
			});
			audio.webAudioPannerNode = SDL.audioContext["createPanner"]();
			audio.webAudioPannerNode["panningModel"] = "equalpower";
			audio.webAudioGainNode = SDL.audioContext["createGain"]();
			audio.webAudioGainNode["gain"]["value"] = audio.volume;
			audio.webAudioNode["connect"](audio.webAudioGainNode);
			audio.webAudioGainNode["connect"](SDL.audioContext["destination"]);
			audio.webAudioNode["start"](0, audio.currentPosition);
			audio.startTime = SDL.audioContext["currentTime"] - audio.currentPosition
		} catch (e) {
			Module.printErr("playWebAudio failed: " + e)
		}
	}),
	pauseWebAudio: (function(audio) {
		if (!audio) return;
		if (audio.webAudioNode) {
			try {
				audio.currentPosition = (SDL.audioContext["currentTime"] - audio.startTime) % audio.resource.webAudio.decodedBuffer.duration;
				audio.webAudioNode["onended"] = undefined;
				audio.webAudioNode.stop(0);
				audio.webAudioNode = undefined
			} catch (e) {
				Module.printErr("pauseWebAudio failed: " + e)
			}
		}
		audio.paused = true
	}),
	openAudioContext: (function() {
		if (!SDL.audioContext) {
			if (typeof AudioContext !== "undefined") SDL.audioContext = new AudioContext;
			else if (typeof webkitAudioContext !== "undefined") SDL.audioContext = new webkitAudioContext
		}
	}),
	webAudioAvailable: (function() {
		return !!SDL.audioContext
	}),
	fillWebAudioBufferFromHeap: (function(heapPtr, sizeSamplesPerChannel, dstAudioBuffer) {
		var numChannels = SDL.audio.channels;
		for (var c = 0; c < numChannels; ++c) {
			var channelData = dstAudioBuffer["getChannelData"](c);
			if (channelData.length != sizeSamplesPerChannel) {
				throw "Web Audio output buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + sizeSamplesPerChannel + " samples!"
			}
			if (SDL.audio.format == 32784) {
				for (var j = 0; j < sizeSamplesPerChannel; ++j) {
					channelData[j] = HEAP16[heapPtr + (j * numChannels + c) * 2 >> 1] / 32768
				}
			} else if (SDL.audio.format == 8) {
				for (var j = 0; j < sizeSamplesPerChannel; ++j) {
					var v = HEAP8[heapPtr + (j * numChannels + c) >> 0];
					channelData[j] = (v >= 0 ? v - 128 : v + 128) / 128
				}
			}
		}
	}),
	debugSurface: (function(surfData) {
		console.log("dumping surface " + [surfData.surf, surfData.source, surfData.width, surfData.height]);
		var image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
		var data = image.data;
		var num = Math.min(surfData.width, surfData.height);
		for (var i = 0; i < num; i++) {
			console.log("   diagonal " + i + ":" + [data[i * surfData.width * 4 + i * 4 + 0], data[i * surfData.width * 4 + i * 4 + 1], data[i * surfData.width * 4 + i * 4 + 2], data[i * surfData.width * 4 + i * 4 + 3]])
		}
	}),
	joystickEventState: 1,
	lastJoystickState: {},
	joystickNamePool: {},
	recordJoystickState: (function(joystick, state) {
		var buttons = new Array(state.buttons.length);
		for (var i = 0; i < state.buttons.length; i++) {
			buttons[i] = SDL.getJoystickButtonState(state.buttons[i])
		}
		SDL.lastJoystickState[joystick] = {
			buttons: buttons,
			axes: state.axes.slice(0),
			timestamp: state.timestamp,
			index: state.index,
			id: state.id
		}
	}),
	getJoystickButtonState: (function(button) {
		if (typeof button === "object") {
			return button.pressed
		} else {
			return button > 0
		}
	}),
	queryJoysticks: (function() {
		for (var joystick in SDL.lastJoystickState) {
			var state = SDL.getGamepad(joystick - 1);
			var prevState = SDL.lastJoystickState[joystick];
			if (typeof state.timestamp !== "number" || state.timestamp !== prevState.timestamp) {
				var i;
				for (i = 0; i < state.buttons.length; i++) {
					var buttonState = SDL.getJoystickButtonState(state.buttons[i]);
					if (buttonState !== prevState.buttons[i]) {
						SDL.events.push({
							type: buttonState ? "joystick_button_down" : "joystick_button_up",
							joystick: joystick,
							index: joystick - 1,
							button: i
						})
					}
				}
				for (i = 0; i < state.axes.length; i++) {
					if (state.axes[i] !== prevState.axes[i]) {
						SDL.events.push({
							type: "joystick_axis_motion",
							joystick: joystick,
							index: joystick - 1,
							axis: i,
							value: state.axes[i]
						})
					}
				}
				SDL.recordJoystickState(joystick, state)
			}
		}
	}),
	joystickAxisValueConversion: (function(value) {
		value = Math.min(1, Math.max(value, -1));
		return Math.ceil((value + 1) * 32767.5 - 32768)
	}),
	getGamepads: (function() {
		var fcn = navigator.getGamepads || navigator.webkitGamepads || navigator.mozGamepads || navigator.gamepads || navigator.webkitGetGamepads;
		if (fcn !== undefined) {
			return fcn.apply(navigator)
		} else {
			return []
		}
	}),
	getGamepad: (function(deviceIndex) {
		var gamepads = SDL.getGamepads();
		if (gamepads.length > deviceIndex && deviceIndex >= 0) {
			return gamepads[deviceIndex]
		}
		return null
	})
};

function _Mix_VolumeMusic(volume) {
	return SDL.setGetVolume(SDL.music, volume)
}
var GL = {
	counter: 1,
	lastError: 0,
	buffers: [],
	mappedBuffers: {},
	programs: [],
	framebuffers: [],
	renderbuffers: [],
	textures: [],
	uniforms: [],
	shaders: [],
	vaos: [],
	contexts: [],
	currentContext: null,
	currArrayBuffer: 0,
	currElementArrayBuffer: 0,
	byteSizeByTypeRoot: 5120,
	byteSizeByType: [1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8],
	programInfos: {},
	stringCache: {},
	packAlignment: 4,
	unpackAlignment: 4,
	init: (function() {
		GL.createLog2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
		GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
		for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
			GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i + 1)
		}
	}),
	recordError: function recordError(errorCode) {
		if (!GL.lastError) {
			GL.lastError = errorCode
		}
	},
	getNewId: (function(table) {
		var ret = GL.counter++;
		for (var i = table.length; i < ret; i++) {
			table[i] = null
		}
		return ret
	}),
	MINI_TEMP_BUFFER_SIZE: 16,
	miniTempBuffer: null,
	miniTempBufferViews: [0],
	MAX_TEMP_BUFFER_SIZE: 2097152,
	numTempVertexBuffersPerSize: 64,
	log2ceilLookup: null,
	createLog2ceilLookup: (function(maxValue) {
		GL.log2ceilLookup = new Uint8Array(maxValue + 1);
		var log2 = 0;
		var pow2 = 1;
		GL.log2ceilLookup[0] = 0;
		for (var i = 1; i <= maxValue; ++i) {
			if (i > pow2) {
				pow2 <<= 1;
				++log2
			}
			GL.log2ceilLookup[i] = log2
		}
	}),
	generateTempBuffers: (function(quads, context) {
		var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
		context.tempVertexBufferCounters1 = [];
		context.tempVertexBufferCounters2 = [];
		context.tempVertexBufferCounters1.length = context.tempVertexBufferCounters2.length = largestIndex + 1;
		context.tempVertexBuffers1 = [];
		context.tempVertexBuffers2 = [];
		context.tempVertexBuffers1.length = context.tempVertexBuffers2.length = largestIndex + 1;
		context.tempIndexBuffers = [];
		context.tempIndexBuffers.length = largestIndex + 1;
		for (var i = 0; i <= largestIndex; ++i) {
			context.tempIndexBuffers[i] = null;
			context.tempVertexBufferCounters1[i] = context.tempVertexBufferCounters2[i] = 0;
			var ringbufferLength = GL.numTempVertexBuffersPerSize;
			context.tempVertexBuffers1[i] = [];
			context.tempVertexBuffers2[i] = [];
			var ringbuffer1 = context.tempVertexBuffers1[i];
			var ringbuffer2 = context.tempVertexBuffers2[i];
			ringbuffer1.length = ringbuffer2.length = ringbufferLength;
			for (var j = 0; j < ringbufferLength; ++j) {
				ringbuffer1[j] = ringbuffer2[j] = null
			}
		}
		if (quads) {
			context.tempQuadIndexBuffer = GLctx.createBuffer();
			context.GLctx.bindBuffer(context.GLctx.ELEMENT_ARRAY_BUFFER, context.tempQuadIndexBuffer);
			var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
			var quadIndexes = new Uint16Array(numIndexes);
			var i = 0,
				v = 0;
			while (1) {
				quadIndexes[i++] = v;
				if (i >= numIndexes) break;
				quadIndexes[i++] = v + 1;
				if (i >= numIndexes) break;
				quadIndexes[i++] = v + 2;
				if (i >= numIndexes) break;
				quadIndexes[i++] = v;
				if (i >= numIndexes) break;
				quadIndexes[i++] = v + 2;
				if (i >= numIndexes) break;
				quadIndexes[i++] = v + 3;
				if (i >= numIndexes) break;
				v += 4
			}
			context.GLctx.bufferData(context.GLctx.ELEMENT_ARRAY_BUFFER, quadIndexes, context.GLctx.STATIC_DRAW);
			context.GLctx.bindBuffer(context.GLctx.ELEMENT_ARRAY_BUFFER, null)
		}
	}),
	getTempVertexBuffer: function getTempVertexBuffer(sizeBytes) {
		var idx = GL.log2ceilLookup[sizeBytes];
		var ringbuffer = GL.currentContext.tempVertexBuffers1[idx];
		var nextFreeBufferIndex = GL.currentContext.tempVertexBufferCounters1[idx];
		GL.currentContext.tempVertexBufferCounters1[idx] = GL.currentContext.tempVertexBufferCounters1[idx] + 1 & GL.numTempVertexBuffersPerSize - 1;
		var vbo = ringbuffer[nextFreeBufferIndex];
		if (vbo) {
			return vbo
		}
		var prevVBO = GLctx.getParameter(GLctx.ARRAY_BUFFER_BINDING);
		ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer();
		GLctx.bindBuffer(GLctx.ARRAY_BUFFER, ringbuffer[nextFreeBufferIndex]);
		GLctx.bufferData(GLctx.ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
		GLctx.bindBuffer(GLctx.ARRAY_BUFFER, prevVBO);
		return ringbuffer[nextFreeBufferIndex]
	},
	getTempIndexBuffer: function getTempIndexBuffer(sizeBytes) {
		var idx = GL.log2ceilLookup[sizeBytes];
		var ibo = GL.currentContext.tempIndexBuffers[idx];
		if (ibo) {
			return ibo
		}
		var prevIBO = GLctx.getParameter(GLctx.ELEMENT_ARRAY_BUFFER_BINDING);
		GL.currentContext.tempIndexBuffers[idx] = GLctx.createBuffer();
		GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, GL.currentContext.tempIndexBuffers[idx]);
		GLctx.bufferData(GLctx.ELEMENT_ARRAY_BUFFER, 1 << idx, GLctx.DYNAMIC_DRAW);
		GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, prevIBO);
		return GL.currentContext.tempIndexBuffers[idx]
	},
	newRenderingFrameStarted: function newRenderingFrameStarted() {
		if (!GL.currentContext) {
			return
		}
		var vb = GL.currentContext.tempVertexBuffers1;
		GL.currentContext.tempVertexBuffers1 = GL.currentContext.tempVertexBuffers2;
		GL.currentContext.tempVertexBuffers2 = vb;
		vb = GL.currentContext.tempVertexBufferCounters1;
		GL.currentContext.tempVertexBufferCounters1 = GL.currentContext.tempVertexBufferCounters2;
		GL.currentContext.tempVertexBufferCounters2 = vb;
		var largestIndex = GL.log2ceilLookup[GL.MAX_TEMP_BUFFER_SIZE];
		for (var i = 0; i <= largestIndex; ++i) {
			GL.currentContext.tempVertexBufferCounters1[i] = 0
		}
	},
	getSource: (function(shader, count, string, length) {
		var source = "";
		for (var i = 0; i < count; ++i) {
			var frag;
			if (length) {
				var len = HEAP32[length + i * 4 >> 2];
				if (len < 0) {
					frag = Pointer_stringify(HEAP32[string + i * 4 >> 2])
				} else {
					frag = Pointer_stringify(HEAP32[string + i * 4 >> 2], len)
				}
			} else {
				frag = Pointer_stringify(HEAP32[string + i * 4 >> 2])
			}
			source += frag
		}
		return source
	}),
	calcBufLength: function calcBufLength(size, type, stride, count) {
		if (stride > 0) {
			return count * stride
		}
		var typeSize = GL.byteSizeByType[type - GL.byteSizeByTypeRoot];
		return size * typeSize * count
	},
	usedTempBuffers: [],
	preDrawHandleClientVertexAttribBindings: function preDrawHandleClientVertexAttribBindings(count) {
		GL.resetBufferBinding = false;
		for (var i = 0; i < GL.currentContext.maxVertexAttribs; ++i) {
			var cb = GL.currentContext.clientBuffers[i];
			if (!cb.clientside || !cb.enabled) continue;
			GL.resetBufferBinding = true;
			var size = GL.calcBufLength(cb.size, cb.type, cb.stride, count);
			var buf = GL.getTempVertexBuffer(size);
			GLctx.bindBuffer(GLctx.ARRAY_BUFFER, buf);
			GLctx.bufferSubData(GLctx.ARRAY_BUFFER, 0, HEAPU8.subarray(cb.ptr, cb.ptr + size));
			GLctx.vertexAttribPointer(i, cb.size, cb.type, cb.normalized, cb.stride, 0)
		}
	},
	postDrawHandleClientVertexAttribBindings: function postDrawHandleClientVertexAttribBindings() {
		if (GL.resetBufferBinding) {
			GLctx.bindBuffer(GLctx.ARRAY_BUFFER, GL.buffers[GL.currArrayBuffer])
		}
	},
	createContext: (function(canvas, webGLContextAttributes) {
		if (typeof webGLContextAttributes.majorVersion === "undefined" && typeof webGLContextAttributes.minorVersion === "undefined") {
			webGLContextAttributes.majorVersion = 1;
			webGLContextAttributes.minorVersion = 0
		}
		var ctx;
		var errorInfo = "?";

		function onContextCreationError(event) {
			errorInfo = event.statusMessage || errorInfo
		}
		try {
			canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);
			try {
				if (webGLContextAttributes.majorVersion == 1 && webGLContextAttributes.minorVersion == 0) {
					ctx = canvas.getContext("webgl", webGLContextAttributes) || canvas.getContext("experimental-webgl", webGLContextAttributes)
				} else if (webGLContextAttributes.majorVersion == 2 && webGLContextAttributes.minorVersion == 0) {
					ctx = canvas.getContext("webgl2", webGLContextAttributes) || canvas.getContext("experimental-webgl2", webGLContextAttributes)
				} else {
					throw "Unsupported WebGL context version " + majorVersion + "." + minorVersion + "!"
				}
			} finally {
				canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false)
			}
			if (!ctx) throw ":("
		} catch (e) {
			Module.print("Could not create canvas: " + [errorInfo, e, JSON.stringify(webGLContextAttributes)]);
			return 0
		}
		if (!ctx) return 0;
		return GL.registerContext(ctx, webGLContextAttributes)
	}),
	registerContext: (function(ctx, webGLContextAttributes) {
		var handle = GL.getNewId(GL.contexts);
		var context = {
			handle: handle,
			version: webGLContextAttributes.majorVersion,
			GLctx: ctx
		};
		if (ctx.canvas) ctx.canvas.GLctxObject = context;
		GL.contexts[handle] = context;
		if (typeof webGLContextAttributes["enableExtensionsByDefault"] === "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
			GL.initExtensions(context)
		}
		return handle
	}),
	makeContextCurrent: (function(contextHandle) {
		var context = GL.contexts[contextHandle];
		if (!context) return false;
		GLctx = Module.ctx = context.GLctx;
		GL.currentContext = context;
		return true
	}),
	getContext: (function(contextHandle) {
		return GL.contexts[contextHandle]
	}),
	deleteContext: (function(contextHandle) {
		if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
		if (typeof JSEvents === "object") JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
		if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
		GL.contexts[contextHandle] = null
	}),
	initExtensions: (function(context) {
		if (!context) context = GL.currentContext;
		if (context.initExtensionsDone) return;
		context.initExtensionsDone = true;
		var GLctx = context.GLctx;
		context.maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
		context.clientBuffers = [];
		for (var i = 0; i < context.maxVertexAttribs; i++) {
			context.clientBuffers[i] = {
				enabled: false,
				clientside: false,
				size: 0,
				type: 0,
				normalized: 0,
				stride: 0,
				ptr: 0
			}
		}
		GL.generateTempBuffers(false, context);
		if (context.version < 2) {
			var instancedArraysExt = GLctx.getExtension("ANGLE_instanced_arrays");
			if (instancedArraysExt) {
				GLctx["vertexAttribDivisor"] = (function(index, divisor) {
					instancedArraysExt["vertexAttribDivisorANGLE"](index, divisor)
				});
				GLctx["drawArraysInstanced"] = (function(mode, first, count, primcount) {
					instancedArraysExt["drawArraysInstancedANGLE"](mode, first, count, primcount)
				});
				GLctx["drawElementsInstanced"] = (function(mode, count, type, indices, primcount) {
					instancedArraysExt["drawElementsInstancedANGLE"](mode, count, type, indices, primcount)
				})
			}
			var vaoExt = GLctx.getExtension("OES_vertex_array_object");
			if (vaoExt) {
				GLctx["createVertexArray"] = (function() {
					return vaoExt["createVertexArrayOES"]()
				});
				GLctx["deleteVertexArray"] = (function(vao) {
					vaoExt["deleteVertexArrayOES"](vao)
				});
				GLctx["bindVertexArray"] = (function(vao) {
					vaoExt["bindVertexArrayOES"](vao)
				});
				GLctx["isVertexArray"] = (function(vao) {
					return vaoExt["isVertexArrayOES"](vao)
				})
			}
			var drawBuffersExt = GLctx.getExtension("WEBGL_draw_buffers");
			if (drawBuffersExt) {
				GLctx["drawBuffers"] = (function(n, bufs) {
					drawBuffersExt["drawBuffersWEBGL"](n, bufs)
				})
			}
		}
		var automaticallyEnabledExtensions = ["OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives", "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "OES_element_index_uint", "EXT_texture_filter_anisotropic", "ANGLE_instanced_arrays", "OES_texture_float_linear", "OES_texture_half_float_linear", "WEBGL_compressed_texture_atc", "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "EXT_frag_depth", "EXT_sRGB", "WEBGL_draw_buffers", "WEBGL_shared_resources", "EXT_shader_texture_lod"];
		var exts = GLctx.getSupportedExtensions();
		if (exts && exts.length > 0) {
			GLctx.getSupportedExtensions().forEach((function(ext) {
				if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
					GLctx.getExtension(ext)
				}
			}))
		}
	}),
	populateUniformTable: (function(program) {
		var p = GL.programs[program];
		GL.programInfos[program] = {
			uniforms: {},
			maxUniformLength: 0,
			maxAttributeLength: -1
		};
		var ptable = GL.programInfos[program];
		var utable = ptable.uniforms;
		var numUniforms = GLctx.getProgramParameter(p, GLctx.ACTIVE_UNIFORMS);
		for (var i = 0; i < numUniforms; ++i) {
			var u = GLctx.getActiveUniform(p, i);
			var name = u.name;
			ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
			if (name.indexOf("]", name.length - 1) !== -1) {
				var ls = name.lastIndexOf("[");
				name = name.slice(0, ls)
			}
			var loc = GLctx.getUniformLocation(p, name);
			var id = GL.getNewId(GL.uniforms);
			utable[name] = [u.size, id];
			GL.uniforms[id] = loc;
			for (var j = 1; j < u.size; ++j) {
				var n = name + "[" + j + "]";
				loc = GLctx.getUniformLocation(p, n);
				id = GL.getNewId(GL.uniforms);
				GL.uniforms[id] = loc
			}
		}
	})
};

function _glClearColor(x0, x1, x2, x3) {
	GLctx.clearColor(x0, x1, x2, x3)
}

function _emscripten_get_now() {
	if (!_emscripten_get_now.actual) {
		if (ENVIRONMENT_IS_NODE) {
			_emscripten_get_now.actual = function _emscripten_get_now_actual() {
				var t = process["hrtime"]();
				return t[0] * 1e3 + t[1] / 1e6
			}
		} else if (typeof dateNow !== "undefined") {
			_emscripten_get_now.actual = dateNow
		} else if (typeof self === "object" && self["performance"] && typeof self["performance"]["now"] === "function") {
			_emscripten_get_now.actual = function _emscripten_get_now_actual() {
				return self["performance"]["now"]()
			}
		} else if (typeof performance === "object" && typeof performance["now"] === "function") {
			_emscripten_get_now.actual = function _emscripten_get_now_actual() {
				return performance["now"]()
			}
		} else {
			_emscripten_get_now.actual = Date.now
		}
	}
	return _emscripten_get_now.actual()
}
var GLFW = {
	Window: (function(id, width, height, title, monitor, share) {
		this.id = id;
		this.x = 0;
		this.y = 0;
		this.isFullScreen = 0;
		this.storedX = 0;
		this.storedY = 0;
		this.width = width;
		this.height = height;
		this.storedWidth = width;
		this.storedHeight = height;
		this.title = title;
		this.monitor = monitor;
		this.share = share;
		this.attributes = GLFW.hints;
		this.inputModes = {
			208897: 212993,
			208898: 0,
			208899: 0
		};
		this.buttons = 0;
		this.keys = new Array;
		this.shouldClose = 0;
		this.title = null;
		this.windowPosFunc = null;
		this.windowSizeFunc = null;
		this.windowCloseFunc = null;
		this.windowRefreshFunc = null;
		this.windowFocusFunc = null;
		this.windowIconifyFunc = null;
		this.framebufferSizeFunc = null;
		this.mouseButtonFunc = null;
		this.cursorPosFunc = null;
		this.cursorEnterFunc = null;
		this.scrollFunc = null;
		this.keyFunc = null;
		this.charFunc = null;
		this.userptr = null
	}),
	WindowFromId: (function(id) {
		if (id <= 0 || !GLFW.windows) return null;
		return GLFW.windows[id - 1]
	}),
	errorFunc: null,
	monitorFunc: null,
	active: null,
	windows: null,
	monitors: null,
	monitorString: null,
	versionString: null,
	initialTime: null,
	extensions: null,
	hints: null,
	defaultHints: {
		131073: 0,
		131074: 0,
		131075: 1,
		131076: 1,
		131077: 1,
		135169: 8,
		135170: 8,
		135171: 8,
		135172: 8,
		135173: 24,
		135174: 8,
		135175: 0,
		135176: 0,
		135177: 0,
		135178: 0,
		135179: 0,
		135180: 0,
		135181: 0,
		135182: 0,
		135183: 0,
		139265: 196609,
		139266: 1,
		139267: 0,
		139268: 0,
		139269: 0,
		139270: 0,
		139271: 0,
		139272: 0
	},
	DOMToGLFWKeyCode: (function(keycode) {
		switch (keycode) {
			case 32:
				return 32;
			case 222:
				return 39;
			case 188:
				return 44;
			case 173:
				return 45;
			case 190:
				return 46;
			case 191:
				return 47;
			case 48:
				return 48;
			case 49:
				return 49;
			case 50:
				return 50;
			case 51:
				return 51;
			case 52:
				return 52;
			case 53:
				return 53;
			case 54:
				return 54;
			case 55:
				return 55;
			case 56:
				return 56;
			case 57:
				return 57;
			case 59:
				return 59;
			case 97:
				return 61;
			case 65:
				return 65;
			case 66:
				return 66;
			case 67:
				return 67;
			case 68:
				return 68;
			case 69:
				return 69;
			case 70:
				return 70;
			case 71:
				return 71;
			case 72:
				return 72;
			case 73:
				return 73;
			case 74:
				return 74;
			case 75:
				return 75;
			case 76:
				return 76;
			case 77:
				return 77;
			case 78:
				return 78;
			case 79:
				return 79;
			case 80:
				return 80;
			case 81:
				return 81;
			case 82:
				return 82;
			case 83:
				return 83;
			case 84:
				return 84;
			case 85:
				return 85;
			case 86:
				return 86;
			case 87:
				return 87;
			case 88:
				return 88;
			case 89:
				return 89;
			case 90:
				return 90;
			case 219:
				return 91;
			case 220:
				return 92;
			case 221:
				return 93;
			case 192:
				return 94;
			case 27:
				return 256;
			case 13:
				return 257;
			case 9:
				return 258;
			case 8:
				return 259;
			case 45:
				return 260;
			case 46:
				return 261;
			case 39:
				return 262;
			case 37:
				return 263;
			case 40:
				return 264;
			case 38:
				return 265;
			case 33:
				return 266;
			case 34:
				return 267;
			case 36:
				return 268;
			case 35:
				return 269;
			case 20:
				return 280;
			case 145:
				return 281;
			case 144:
				return 282;
			case 44:
				return 283;
			case 19:
				return 284;
			case 112:
				return 290;
			case 113:
				return 291;
			case 114:
				return 292;
			case 115:
				return 293;
			case 116:
				return 294;
			case 117:
				return 295;
			case 118:
				return 296;
			case 119:
				return 297;
			case 120:
				return 298;
			case 121:
				return 299;
			case 122:
				return 300;
			case 123:
				return 301;
			case 124:
				return 302;
			case 125:
				return 303;
			case 126:
				return 304;
			case 127:
				return 305;
			case 128:
				return 306;
			case 129:
				return 307;
			case 130:
				return 308;
			case 131:
				return 309;
			case 132:
				return 310;
			case 133:
				return 311;
			case 134:
				return 312;
			case 135:
				return 313;
			case 136:
				return 314;
			case 96:
				return 320;
			case 97:
				return 321;
			case 98:
				return 322;
			case 99:
				return 323;
			case 100:
				return 324;
			case 101:
				return 325;
			case 102:
				return 326;
			case 103:
				return 327;
			case 104:
				return 328;
			case 105:
				return 329;
			case 110:
				return 330;
			case 111:
				return 331;
			case 106:
				return 332;
			case 109:
				return 333;
			case 107:
				return 334;
			case 16:
				return 340;
			case 17:
				return 341;
			case 18:
				return 342;
			case 91:
				return 343;
			case 93:
				return 348;
			default:
				return -1
		}
	}),
	getModBits: (function(win) {
		var mod = 0;
		if (win.keys[340]) mod |= 1;
		if (win.keys[341]) mod |= 2;
		if (win.keys[342]) mod |= 4;
		if (win.keys[343]) mod |= 8;
		return mod
	}),
	onKeyPress: (function(event) {
		if (!GLFW.active || !GLFW.active.charFunc) return;
		var charCode = event.charCode;
		if (charCode == 0 || charCode >= 0 && charCode <= 31) return;
		Runtime.dynCall("vii", GLFW.active.charFunc, [GLFW.active.id, charCode])
	}),
	onKeyChanged: (function(event, status) {
		if (!GLFW.active) return;
		var key = GLFW.DOMToGLFWKeyCode(event.keyCode);
		if (key == -1) return;
		var repeat = status && GLFW.active.keys[key];
		GLFW.active.keys[key] = status;
		if (!GLFW.active.keyFunc) return;
		if (repeat) status = 2;
		Runtime.dynCall("viiiii", GLFW.active.keyFunc, [GLFW.active.id, key, event.keyCode, status, GLFW.getModBits(GLFW.active)])
	}),
	onKeydown: (function(event) {
		GLFW.onKeyChanged(event, 1);
		if (event.keyCode === 8 || event.keyCode === 9) {
			event.preventDefault()
		}
	}),
	onKeyup: (function(event) {
		GLFW.onKeyChanged(event, 0)
	}),
	onMousemove: (function(event) {
		if (!GLFW.active) return;
		Browser.calculateMouseEvent(event);
		if (event.target != Module["canvas"] || !GLFW.active.cursorPosFunc) return;
		Runtime.dynCall("vidd", GLFW.active.cursorPosFunc, [GLFW.active.id, Browser.mouseX, Browser.mouseY])
	}),
	onMouseButtonChanged: (function(event, status) {
		if (!GLFW.active || !GLFW.active.mouseButtonFunc) return;
		Browser.calculateMouseEvent(event);
		if (event.target != Module["canvas"]) return;
		if (status == 1) {
			try {
				event.target.setCapture()
			} catch (e) {}
		}
		var eventButton = event["button"];
		if (eventButton > 0) {
			if (eventButton == 1) {
				eventButton = 2
			} else {
				eventButton = 1
			}
		}
		Runtime.dynCall("viiii", GLFW.active.mouseButtonFunc, [GLFW.active.id, eventButton, status, GLFW.getModBits(GLFW.active)])
	}),
	onMouseButtonDown: (function(event) {
		if (!GLFW.active) return;
		GLFW.active.buttons |= 1 << event["button"];
		GLFW.onMouseButtonChanged(event, 1)
	}),
	onMouseButtonUp: (function(event) {
		if (!GLFW.active) return;
		GLFW.active.buttons &= ~(1 << event["button"]);
		GLFW.onMouseButtonChanged(event, 0)
	}),
	onMouseWheel: (function(event) {
		var delta = -Browser.getMouseWheelDelta(event);
		delta = delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
		GLFW.wheelPos += delta;
		if (!GLFW.active || !GLFW.active.scrollFunc || event.target != Module["canvas"]) return;
		var sx = 0;
		var sy = 0;
		if (event.type == "mousewheel") {
			sx = event.wheelDeltaX;
			sy = event.wheelDeltaY
		} else {
			sx = event.deltaX;
			sy = event.deltaY
		}
		Runtime.dynCall("vidd", GLFW.active.scrollFunc, [GLFW.active.id, sx, sy]);
		event.preventDefault()
	}),
	onSizeChange: (function() {
		if (!GLFW.active || !GLFW.active.windowSizeFunc) return;
		Runtime.dynCall("viii", GLFW.active.windowSizeFunc, [GLFW.active.id, GLFW.active.width, GLFW.active.height])
	}),
	requestFullScreen: (function() {
		var RFS = Module["canvas"]["requestFullscreen"] || Module["canvas"]["requestFullScreen"] || Module["canvas"]["mozRequestFullScreen"] || Module["canvas"]["webkitRequestFullScreen"] || (function() {});
		RFS.apply(Module["canvas"], [])
	}),
	cancelFullScreen: (function() {
		var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["webkitCancelFullScreen"] || (function() {});
		CFS.apply(document, [])
	}),
	getTime: (function() {
		return _emscripten_get_now() / 1e3
	}),
	setWindowTitle: (function(winid, title) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		win.title = Pointer_stringify(title);
		if (GLFW.active.id == win.id) {
			document.title = win.title
		}
	}),
	setKeyCallback: (function(winid, cbfun) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		win.keyFunc = cbfun
	}),
	setCharCallback: (function(winid, cbfun) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		win.charFunc = cbfun
	}),
	setMouseButtonCallback: (function(winid, cbfun) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		win.mouseButtonFunc = cbfun
	}),
	setCursorPosCallback: (function(winid, cbfun) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		win.cursorPosFunc = cbfun
	}),
	setScrollCallback: (function(winid, cbfun) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		win.scrollFunc = cbfun
	}),
	setWindowSizeCallback: (function(winid, cbfun) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		win.windowSizeFunc = cbfun
	}),
	setWindowCloseCallback: (function(winid, cbfun) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		win.windowCloseFunc = cbfun
	}),
	setWindowRefreshCallback: (function(winid, cbfun) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		win.windowRefreshFunc = cbfun
	}),
	onClickRequestPointerLock: (function(e) {
		if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
			Module["canvas"].requestPointerLock();
			e.preventDefault()
		}
	}),
	setInputMode: (function(winid, mode, value) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		switch (mode) {
			case 208897: {
				switch (value) {
					case 212993: {
						win.inputModes[mode] = value;
						Module["canvas"].removeEventListener("click", GLFW.onClickRequestPointerLock, true);
						Module["canvas"].exitPointerLock();
						break
					};
				case 212994: {
					console.log("glfwSetInputMode called with GLFW_CURSOR_HIDDEN value not implemented.");
					break
				};
				case 212995: {
					win.inputModes[mode] = value;
					Module["canvas"].addEventListener("click", GLFW.onClickRequestPointerLock, true);
					Module["canvas"].requestPointerLock();
					break
				};
				default: {
					console.log("glfwSetInputMode called with unknown value parameter value: " + value + ".");
					break
				}
				}
				break
			};
		case 208898: {
			console.log("glfwSetInputMode called with GLFW_STICKY_KEYS mode not implemented.");
			break
		};
		case 208899: {
			console.log("glfwSetInputMode called with GLFW_STICKY_MOUSE_BUTTONS mode not implemented.");
			break
		};
		default: {
			console.log("glfwSetInputMode called with unknown mode parameter value: " + mode + ".");
			break
		}
		}
	}),
	getKey: (function(winid, key) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return 0;
		return win.keys[key]
	}),
	getMouseButton: (function(winid, button) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return 0;
		return (win.buttons & 1 << button) > 0
	}),
	getCursorPos: (function(winid, x, y) {
		setValue(x, Browser.mouseX, "double");
		setValue(y, Browser.mouseY, "double")
	}),
	getMousePos: (function(winid, x, y) {
		setValue(x, Browser.mouseX, "i32");
		setValue(y, Browser.mouseY, "i32")
	}),
	setCursorPos: (function(winid, x, y) {}),
	getWindowPos: (function(winid, x, y) {
		var wx = 0;
		var wy = 0;
		var win = GLFW.WindowFromId(winid);
		if (win) {
			wx = win.x;
			wy = win.y
		}
		setValue(x, wx, "i32");
		setValue(y, wy, "i32")
	}),
	setWindowPos: (function(winid, x, y) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		win.x = x;
		win.y = y
	}),
	getWindowSize: (function(winid, width, height) {
		var ww = 0;
		var wh = 0;
		var win = GLFW.WindowFromId(winid);
		if (win) {
			ww = win.width;
			wh = win.height
		}
		setValue(width, ww, "i32");
		setValue(height, wh, "i32")
	}),
	setWindowSize: (function(winid, width, height) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		if (GLFW.active.id == win.id) {
			if (width == screen.width && height == screen.height) {
				GLFW.requestFullScreen()
			} else {
				GLFW.cancelFullScreen();
				Browser.setCanvasSize(width, height);
				win.width = width;
				win.height = height
			}
		}
		if (!win.windowSizeFunc) return;
		Runtime.dynCall("viii", win.windowSizeFunc, [win.id, width, height])
	}),
	createWindow: (function(width, height, title, monitor, share) {
		var i, id;
		for (i = 0; i < GLFW.windows.length && GLFW.windows[i] !== null; i++);
		if (i > 0) throw "glfwCreateWindow only supports one window at time currently";
		id = i + 1;
		if (width <= 0 || height <= 0) return 0;
		if (monitor) {
			GLFW.requestFullScreen()
		} else {
			Browser.setCanvasSize(width, height)
		}
		for (i = 0; i < GLFW.windows.length && GLFW.windows[i] == null; i++);
		if (i == GLFW.windows.length) {
			var contextAttributes = {
				antialias: GLFW.hints[135181] > 1,
				depth: GLFW.hints[135173] > 0,
				stencil: GLFW.hints[135174] > 0
			};
			Module.ctx = Browser.createContext(Module["canvas"], true, true, contextAttributes)
		}
		if (!Module.ctx) return 0;
		var win = new GLFW.Window(id, width, height, title, monitor, share);
		if (id - 1 == GLFW.windows.length) {
			GLFW.windows.push(win)
		} else {
			GLFW.windows[id - 1] = win
		}
		GLFW.active = win;
		return win.id
	}),
	destroyWindow: (function(winid) {
		var win = GLFW.WindowFromId(winid);
		if (!win) return;
		if (win.windowCloseFunc) Runtime.dynCall("vi", win.windowCloseFunc, [win.id]);
		GLFW.windows[win.id - 1] = null;
		if (GLFW.active.id == win.id) GLFW.active = null;
		for (var i = 0; i < GLFW.windows.length; i++)
			if (GLFW.windows[i] !== null) return;
		Module.ctx = Browser.destroyContext(Module["canvas"], true, true)
	}),
	swapBuffers: (function(winid) {}),
	GLFW2ParamToGLFW3Param: (function(param) {
		table = {
			196609: 0,
			196610: 0,
			196611: 0,
			196612: 0,
			196613: 0,
			196614: 0,
			131073: 0,
			131074: 0,
			131075: 0,
			131076: 0,
			131077: 135169,
			131078: 135170,
			131079: 135171,
			131080: 135172,
			131081: 135173,
			131082: 135174,
			131083: 135183,
			131084: 135175,
			131085: 135176,
			131086: 135177,
			131087: 135178,
			131088: 135179,
			131089: 135180,
			131090: 0,
			131091: 135181,
			131092: 139266,
			131093: 139267,
			131094: 139270,
			131095: 139271,
			131096: 139272
		};
		return table[param]
	})
};

function _glfwSetWindowSize(winid, width, height) {
	GLFW.setWindowSize(winid, width, height)
}

function _Mix_OpenAudio(frequency, format, channels, chunksize) {
	SDL.openAudioContext();
	SDL.allocateChannels(32);
	SDL.mixerFrequency = frequency;
	SDL.mixerFormat = format;
	SDL.mixerNumChannels = channels;
	SDL.mixerChunkSize = chunksize;
	return 0
}
var SYSCALLS = {
	DEFAULT_POLLMASK: 5,
	mappings: {},
	umask: 511,
	calculateAt: (function(dirfd, path) {
		if (path[0] !== "/") {
			var dir;
			if (dirfd === -100) {
				dir = FS.cwd()
			} else {
				var dirstream = FS.getStream(dirfd);
				if (!dirstream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
				dir = dirstream.path
			}
			path = PATH.join2(dir, path)
		}
		return path
	}),
	doStat: (function(func, path, buf) {
		try {
			var stat = func(path)
		} catch (e) {
			if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
				return -ERRNO_CODES.ENOTDIR
			}
			throw e
		}
		HEAP32[buf >> 2] = stat.dev;
		HEAP32[buf + 4 >> 2] = 0;
		HEAP32[buf + 8 >> 2] = stat.ino;
		HEAP32[buf + 12 >> 2] = stat.mode;
		HEAP32[buf + 16 >> 2] = stat.nlink;
		HEAP32[buf + 20 >> 2] = stat.uid;
		HEAP32[buf + 24 >> 2] = stat.gid;
		HEAP32[buf + 28 >> 2] = stat.rdev;
		HEAP32[buf + 32 >> 2] = 0;
		HEAP32[buf + 36 >> 2] = stat.size;
		HEAP32[buf + 40 >> 2] = 4096;
		HEAP32[buf + 44 >> 2] = stat.blocks;
		HEAP32[buf + 48 >> 2] = stat.atime.getTime() / 1e3 | 0;
		HEAP32[buf + 52 >> 2] = 0;
		HEAP32[buf + 56 >> 2] = stat.mtime.getTime() / 1e3 | 0;
		HEAP32[buf + 60 >> 2] = 0;
		HEAP32[buf + 64 >> 2] = stat.ctime.getTime() / 1e3 | 0;
		HEAP32[buf + 68 >> 2] = 0;
		HEAP32[buf + 72 >> 2] = stat.ino;
		return 0
	}),
	doMsync: (function(addr, stream, len, flags) {
		var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
		FS.msync(stream, buffer, 0, len, flags)
	}),
	doMkdir: (function(path, mode) {
		path = PATH.normalize(path);
		if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
		FS.mkdir(path, mode, 0);
		return 0
	}),
	doMknod: (function(path, mode, dev) {
		switch (mode & 61440) {
			case 32768:
			case 8192:
			case 24576:
			case 4096:
			case 49152:
				break;
			default:
				return -ERRNO_CODES.EINVAL
		}
		FS.mknod(path, mode, dev);
		return 0
	}),
	doReadlink: (function(path, buf, bufsize) {
		if (bufsize <= 0) return -ERRNO_CODES.EINVAL;
		var ret = FS.readlink(path);
		ret = ret.slice(0, Math.max(0, bufsize));
		writeStringToMemory(ret, buf, true);
		return ret.length
	}),
	doAccess: (function(path, amode) {
		if (amode & ~7) {
			return -ERRNO_CODES.EINVAL
		}
		var node;
		var lookup = FS.lookupPath(path, {
			follow: true
		});
		node = lookup.node;
		var perms = "";
		if (amode & 4) perms += "r";
		if (amode & 2) perms += "w";
		if (amode & 1) perms += "x";
		if (perms && FS.nodePermissions(node, perms)) {
			return -ERRNO_CODES.EACCES
		}
		return 0
	}),
	doDup: (function(path, flags, suggestFD) {
		var suggest = FS.getStream(suggestFD);
		if (suggest) FS.close(suggest);
		return FS.open(path, flags, 0, suggestFD, suggestFD).fd
	}),
	doReadv: (function(stream, iov, iovcnt, offset) {
		var ret = 0;
		for (var i = 0; i < iovcnt; i++) {
			var ptr = HEAP32[iov + i * 8 >> 2];
			var len = HEAP32[iov + (i * 8 + 4) >> 2];
			var curr = FS.read(stream, HEAP8, ptr, len, offset);
			if (curr < 0) return -1;
			ret += curr;
			if (curr < len) break
		}
		return ret
	}),
	doWritev: (function(stream, iov, iovcnt, offset) {
		var ret = 0;
		for (var i = 0; i < iovcnt; i++) {
			var ptr = HEAP32[iov + i * 8 >> 2];
			var len = HEAP32[iov + (i * 8 + 4) >> 2];
			var curr = FS.write(stream, HEAP8, ptr, len, offset);
			if (curr < 0) return -1;
			ret += curr
		}
		return ret
	}),
	varargs: 0,
	get: (function(varargs) {
		SYSCALLS.varargs += 4;
		var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
		return ret
	}),
	getStr: (function() {
		var ret = Pointer_stringify(SYSCALLS.get());
		return ret
	}),
	getStreamFromFD: (function() {
		var stream = FS.getStream(SYSCALLS.get());
		if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
		return stream
	}),
	getSocketFromFD: (function() {
		var socket = SOCKFS.getSocket(SYSCALLS.get());
		if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
		return socket
	}),
	getSocketAddress: (function(allowNull) {
		var addrp = SYSCALLS.get(),
			addrlen = SYSCALLS.get();
		if (allowNull && addrp === 0) return null;
		var info = __read_sockaddr(addrp, addrlen);
		if (info.errno) throw new FS.ErrnoError(info.errno);
		info.addr = DNS.lookup_addr(info.addr) || info.addr;
		return info
	}),
	get64: (function() {
		var low = SYSCALLS.get(),
			high = SYSCALLS.get();
		if (low >= 0) assert(high === 0);
		else assert(high === -1);
		return low
	}),
	getZero: (function() {
		assert(SYSCALLS.get() === 0)
	})
};

function ___syscall195(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var path = SYSCALLS.getStr(),
			buf = SYSCALLS.get();
		return SYSCALLS.doStat(FS.stat, path, buf)
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function ___cxa_free_exception(ptr) {
	try {
		return _free(ptr)
	} catch (e) {}
}
var EXCEPTIONS = {
	last: 0,
	caught: [],
	infos: {},
	deAdjust: (function(adjusted) {
		if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
		for (var ptr in EXCEPTIONS.infos) {
			var info = EXCEPTIONS.infos[ptr];
			if (info.adjusted === adjusted) {
				return ptr
			}
		}
		return adjusted
	}),
	addRef: (function(ptr) {
		if (!ptr) return;
		var info = EXCEPTIONS.infos[ptr];
		info.refcount++
	}),
	decRef: (function(ptr) {
		if (!ptr) return;
		var info = EXCEPTIONS.infos[ptr];
		assert(info.refcount > 0);
		info.refcount--;
		if (info.refcount === 0) {
			if (info.destructor) {
				Runtime.dynCall("vi", info.destructor, [ptr])
			}
			delete EXCEPTIONS.infos[ptr];
			___cxa_free_exception(ptr)
		}
	}),
	clearRef: (function(ptr) {
		if (!ptr) return;
		var info = EXCEPTIONS.infos[ptr];
		info.refcount = 0
	})
};

function ___cxa_end_catch() {
	if (___cxa_end_catch.rethrown) {
		___cxa_end_catch.rethrown = false;
		return
	}
	asm["setThrew"](0);
	var ptr = EXCEPTIONS.caught.pop();
	if (ptr) {
		EXCEPTIONS.decRef(EXCEPTIONS.deAdjust(ptr));
		EXCEPTIONS.last = 0
	}
}

function _glLinkProgram(program) {
	GLctx.linkProgram(GL.programs[program]);
	GL.programInfos[program] = null;
	GL.populateUniformTable(program)
}

function _glBindTexture(target, texture) {
	GLctx.bindTexture(target, texture ? GL.textures[texture] : null)
}

function _glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
	GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer])
}

function _glGetString(name_) {
	if (GL.stringCache[name_]) return GL.stringCache[name_];
	var ret;
	switch (name_) {
		case 7936:
		case 7937:
		case 7938:
			ret = allocate(intArrayFromString(GLctx.getParameter(name_)), "i8", ALLOC_NORMAL);
			break;
		case 7939:
			var exts = GLctx.getSupportedExtensions();
			var gl_exts = [];
			for (var i in exts) {
				gl_exts.push(exts[i]);
				gl_exts.push("GL_" + exts[i])
			}
			ret = allocate(intArrayFromString(gl_exts.join(" ")), "i8", ALLOC_NORMAL);
			break;
		case 35724:
			var glslVersion = GLctx.getParameter(GLctx.SHADING_LANGUAGE_VERSION);
			if (glslVersion.indexOf("WebGL GLSL ES 1.0") != -1) glslVersion = "OpenGL ES GLSL ES 1.00 (WebGL)";
			ret = allocate(intArrayFromString(glslVersion), "i8", ALLOC_NORMAL);
			break;
		default:
			GL.recordError(1280);
			return 0
	}
	GL.stringCache[name_] = ret;
	return ret
}

function ___syscall296(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var dirfd = SYSCALLS.get(),
			path = SYSCALLS.getStr(),
			mode = SYSCALLS.get();
		path = SYSCALLS.calculateAt(dirfd, path);
		return SYSCALLS.doMkdir(path, mode)
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function _Mix_FreeMusic() {
	return _Mix_FreeChunk.apply(null, arguments)
}

function _glfwSetWindowShouldClose(winid, value) {
	var win = GLFW.WindowFromId(winid);
	if (!win) return;
	win.shouldClose = value
}
var JSEvents = {
	keyEvent: 0,
	mouseEvent: 0,
	wheelEvent: 0,
	uiEvent: 0,
	focusEvent: 0,
	deviceOrientationEvent: 0,
	deviceMotionEvent: 0,
	fullscreenChangeEvent: 0,
	pointerlockChangeEvent: 0,
	visibilityChangeEvent: 0,
	touchEvent: 0,
	previousFullscreenElement: null,
	previousScreenX: null,
	previousScreenY: null,
	removeEventListenersRegistered: false,
	registerRemoveEventListeners: (function() {
		if (!JSEvents.removeEventListenersRegistered) {
			__ATEXIT__.push((function() {
				for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
					JSEvents._removeHandler(i)
				}
			}));
			JSEvents.removeEventListenersRegistered = true
		}
	}),
	findEventTarget: (function(target) {
		if (target) {
			if (typeof target == "number") {
				target = Pointer_stringify(target)
			}
			if (target == "#window") return window;
			else if (target == "#document") return document;
			else if (target == "#screen") return window.screen;
			else if (target == "#canvas") return Module["canvas"];
			if (typeof target == "string") return document.getElementById(target);
			else return target
		} else {
			return window
		}
	}),
	deferredCalls: [],
	deferCall: (function(targetFunction, precedence, argsList) {
		function arraysHaveEqualContent(arrA, arrB) {
			if (arrA.length != arrB.length) return false;
			for (var i in arrA) {
				if (arrA[i] != arrB[i]) return false
			}
			return true
		}
		for (var i in JSEvents.deferredCalls) {
			var call = JSEvents.deferredCalls[i];
			if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
				return
			}
		}
		JSEvents.deferredCalls.push({
			targetFunction: targetFunction,
			precedence: precedence,
			argsList: argsList
		});
		JSEvents.deferredCalls.sort((function(x, y) {
			return x.precedence < y.precedence
		}))
	}),
	removeDeferredCalls: (function(targetFunction) {
		for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
			if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
				JSEvents.deferredCalls.splice(i, 1);
				--i
			}
		}
	}),
	canPerformEventHandlerRequests: (function() {
		return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls
	}),
	runDeferredCalls: (function() {
		if (!JSEvents.canPerformEventHandlerRequests()) {
			return
		}
		for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
			var call = JSEvents.deferredCalls[i];
			JSEvents.deferredCalls.splice(i, 1);
			--i;
			call.targetFunction.apply(this, call.argsList)
		}
	}),
	inEventHandler: 0,
	currentEventHandler: null,
	eventHandlers: [],
	isInternetExplorer: (function() {
		return navigator.userAgent.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident/") > 0
	}),
	removeAllHandlersOnTarget: (function(target, eventTypeString) {
		for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
			if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
				JSEvents._removeHandler(i--)
			}
		}
	}),
	_removeHandler: (function(i) {
		var h = JSEvents.eventHandlers[i];
		h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
		JSEvents.eventHandlers.splice(i, 1)
	}),
	registerOrRemoveHandler: (function(eventHandler) {
		var jsEventHandler = function jsEventHandler(event) {
			++JSEvents.inEventHandler;
			JSEvents.currentEventHandler = eventHandler;
			JSEvents.runDeferredCalls();
			eventHandler.handlerFunc(event);
			JSEvents.runDeferredCalls();
			--JSEvents.inEventHandler
		};
		if (eventHandler.callbackfunc) {
			eventHandler.eventListenerFunc = jsEventHandler;
			eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
			JSEvents.eventHandlers.push(eventHandler);
			JSEvents.registerRemoveEventListeners()
		} else {
			for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
				if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
					JSEvents._removeHandler(i--)
				}
			}
		}
	}),
	registerKeyEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.keyEvent) {
			JSEvents.keyEvent = _malloc(164)
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			writeStringToMemory(e.key ? e.key : "", JSEvents.keyEvent + 0);
			writeStringToMemory(e.code ? e.code : "", JSEvents.keyEvent + 32);
			HEAP32[JSEvents.keyEvent + 64 >> 2] = e.location;
			HEAP32[JSEvents.keyEvent + 68 >> 2] = e.ctrlKey;
			HEAP32[JSEvents.keyEvent + 72 >> 2] = e.shiftKey;
			HEAP32[JSEvents.keyEvent + 76 >> 2] = e.altKey;
			HEAP32[JSEvents.keyEvent + 80 >> 2] = e.metaKey;
			HEAP32[JSEvents.keyEvent + 84 >> 2] = e.repeat;
			writeStringToMemory(e.locale ? e.locale : "", JSEvents.keyEvent + 88);
			writeStringToMemory(e.char ? e.char : "", JSEvents.keyEvent + 120);
			HEAP32[JSEvents.keyEvent + 152 >> 2] = e.charCode;
			HEAP32[JSEvents.keyEvent + 156 >> 2] = e.keyCode;
			HEAP32[JSEvents.keyEvent + 160 >> 2] = e.which;
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.keyEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: JSEvents.findEventTarget(target),
			allowsDeferredCalls: JSEvents.isInternetExplorer() ? false : true,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	getBoundingClientRectOrZeros: (function(target) {
		return target.getBoundingClientRect ? target.getBoundingClientRect() : {
			left: 0,
			top: 0
		}
	}),
	fillMouseEventData: (function(eventStruct, e, target) {
		HEAPF64[eventStruct >> 3] = JSEvents.tick();
		HEAP32[eventStruct + 8 >> 2] = e.screenX;
		HEAP32[eventStruct + 12 >> 2] = e.screenY;
		HEAP32[eventStruct + 16 >> 2] = e.clientX;
		HEAP32[eventStruct + 20 >> 2] = e.clientY;
		HEAP32[eventStruct + 24 >> 2] = e.ctrlKey;
		HEAP32[eventStruct + 28 >> 2] = e.shiftKey;
		HEAP32[eventStruct + 32 >> 2] = e.altKey;
		HEAP32[eventStruct + 36 >> 2] = e.metaKey;
		HEAP16[eventStruct + 40 >> 1] = e.button;
		HEAP16[eventStruct + 42 >> 1] = e.buttons;
		HEAP32[eventStruct + 44 >> 2] = e["movementX"] || e["mozMovementX"] || e["webkitMovementX"] || e.screenX - JSEvents.previousScreenX;
		HEAP32[eventStruct + 48 >> 2] = e["movementY"] || e["mozMovementY"] || e["webkitMovementY"] || e.screenY - JSEvents.previousScreenY;
		if (Module["canvas"]) {
			var rect = Module["canvas"].getBoundingClientRect();
			HEAP32[eventStruct + 60 >> 2] = e.clientX - rect.left;
			HEAP32[eventStruct + 64 >> 2] = e.clientY - rect.top
		} else {
			HEAP32[eventStruct + 60 >> 2] = 0;
			HEAP32[eventStruct + 64 >> 2] = 0
		}
		if (target) {
			var rect = JSEvents.getBoundingClientRectOrZeros(target);
			HEAP32[eventStruct + 52 >> 2] = e.clientX - rect.left;
			HEAP32[eventStruct + 56 >> 2] = e.clientY - rect.top
		} else {
			HEAP32[eventStruct + 52 >> 2] = 0;
			HEAP32[eventStruct + 56 >> 2] = 0
		}
		JSEvents.previousScreenX = e.screenX;
		JSEvents.previousScreenY = e.screenY
	}),
	registerMouseEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.mouseEvent) {
			JSEvents.mouseEvent = _malloc(72)
		}
		target = JSEvents.findEventTarget(target);
		var handlerFunc = (function(event) {
			var e = event || window.event;
			JSEvents.fillMouseEventData(JSEvents.mouseEvent, e, target);
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.mouseEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: target,
			allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave",
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		if (JSEvents.isInternetExplorer() && eventTypeString == "mousedown") eventHandler.allowsDeferredCalls = false;
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	registerWheelEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.wheelEvent) {
			JSEvents.wheelEvent = _malloc(104)
		}
		target = JSEvents.findEventTarget(target);
		var wheelHandlerFunc = (function(event) {
			var e = event || window.event;
			JSEvents.fillMouseEventData(JSEvents.wheelEvent, e, target);
			HEAPF64[JSEvents.wheelEvent + 72 >> 3] = e["deltaX"];
			HEAPF64[JSEvents.wheelEvent + 80 >> 3] = e["deltaY"];
			HEAPF64[JSEvents.wheelEvent + 88 >> 3] = e["deltaZ"];
			HEAP32[JSEvents.wheelEvent + 96 >> 2] = e["deltaMode"];
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.wheelEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var mouseWheelHandlerFunc = (function(event) {
			var e = event || window.event;
			JSEvents.fillMouseEventData(JSEvents.wheelEvent, e, target);
			HEAPF64[JSEvents.wheelEvent + 72 >> 3] = e["wheelDeltaX"];
			HEAPF64[JSEvents.wheelEvent + 80 >> 3] = -e["wheelDeltaY"];
			HEAPF64[JSEvents.wheelEvent + 88 >> 3] = 0;
			HEAP32[JSEvents.wheelEvent + 96 >> 2] = 0;
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.wheelEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: target,
			allowsDeferredCalls: true,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: eventTypeString == "wheel" ? wheelHandlerFunc : mouseWheelHandlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	pageScrollPos: (function() {
		if (window.pageXOffset > 0 || window.pageYOffset > 0) {
			return [window.pageXOffset, window.pageYOffset]
		}
		if (typeof document.documentElement.scrollLeft !== "undefined" || typeof document.documentElement.scrollTop !== "undefined") {
			return [document.documentElement.scrollLeft, document.documentElement.scrollTop]
		}
		return [document.body.scrollLeft | 0, document.body.scrollTop | 0]
	}),
	registerUiEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.uiEvent) {
			JSEvents.uiEvent = _malloc(36)
		}
		if (eventTypeString == "scroll" && !target) {
			target = document
		} else {
			target = JSEvents.findEventTarget(target)
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			if (e.target != target) {
				return
			}
			var scrollPos = JSEvents.pageScrollPos();
			HEAP32[JSEvents.uiEvent >> 2] = e.detail;
			HEAP32[JSEvents.uiEvent + 4 >> 2] = document.body.clientWidth;
			HEAP32[JSEvents.uiEvent + 8 >> 2] = document.body.clientHeight;
			HEAP32[JSEvents.uiEvent + 12 >> 2] = window.innerWidth;
			HEAP32[JSEvents.uiEvent + 16 >> 2] = window.innerHeight;
			HEAP32[JSEvents.uiEvent + 20 >> 2] = window.outerWidth;
			HEAP32[JSEvents.uiEvent + 24 >> 2] = window.outerHeight;
			HEAP32[JSEvents.uiEvent + 28 >> 2] = scrollPos[0];
			HEAP32[JSEvents.uiEvent + 32 >> 2] = scrollPos[1];
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.uiEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: target,
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	getNodeNameForTarget: (function(target) {
		if (!target) return "";
		if (target == window) return "#window";
		if (target == window.screen) return "#screen";
		return target && target.nodeName ? target.nodeName : ""
	}),
	registerFocusEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.focusEvent) {
			JSEvents.focusEvent = _malloc(256)
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			var nodeName = JSEvents.getNodeNameForTarget(e.target);
			var id = e.target.id ? e.target.id : "";
			writeStringToMemory(nodeName, JSEvents.focusEvent + 0);
			writeStringToMemory(id, JSEvents.focusEvent + 128);
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.focusEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: JSEvents.findEventTarget(target),
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	tick: (function() {
		if (window["performance"] && window["performance"]["now"]) return window["performance"]["now"]();
		else return Date.now()
	}),
	registerDeviceOrientationEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.deviceOrientationEvent) {
			JSEvents.deviceOrientationEvent = _malloc(40)
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			HEAPF64[JSEvents.deviceOrientationEvent >> 3] = JSEvents.tick();
			HEAPF64[JSEvents.deviceOrientationEvent + 8 >> 3] = e.alpha;
			HEAPF64[JSEvents.deviceOrientationEvent + 16 >> 3] = e.beta;
			HEAPF64[JSEvents.deviceOrientationEvent + 24 >> 3] = e.gamma;
			HEAP32[JSEvents.deviceOrientationEvent + 32 >> 2] = e.absolute;
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.deviceOrientationEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: JSEvents.findEventTarget(target),
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	registerDeviceMotionEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.deviceMotionEvent) {
			JSEvents.deviceMotionEvent = _malloc(80)
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			HEAPF64[JSEvents.deviceOrientationEvent >> 3] = JSEvents.tick();
			HEAPF64[JSEvents.deviceMotionEvent + 8 >> 3] = e.acceleration.x;
			HEAPF64[JSEvents.deviceMotionEvent + 16 >> 3] = e.acceleration.y;
			HEAPF64[JSEvents.deviceMotionEvent + 24 >> 3] = e.acceleration.z;
			HEAPF64[JSEvents.deviceMotionEvent + 32 >> 3] = e.accelerationIncludingGravity.x;
			HEAPF64[JSEvents.deviceMotionEvent + 40 >> 3] = e.accelerationIncludingGravity.y;
			HEAPF64[JSEvents.deviceMotionEvent + 48 >> 3] = e.accelerationIncludingGravity.z;
			HEAPF64[JSEvents.deviceMotionEvent + 56 >> 3] = e.rotationRate.alpha;
			HEAPF64[JSEvents.deviceMotionEvent + 64 >> 3] = e.rotationRate.beta;
			HEAPF64[JSEvents.deviceMotionEvent + 72 >> 3] = e.rotationRate.gamma;
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.deviceMotionEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: JSEvents.findEventTarget(target),
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	screenOrientation: (function() {
		if (!window.screen) return undefined;
		return window.screen.orientation || window.screen.mozOrientation || window.screen.webkitOrientation || window.screen.msOrientation
	}),
	fillOrientationChangeEventData: (function(eventStruct, e) {
		var orientations = ["portrait-primary", "portrait-secondary", "landscape-primary", "landscape-secondary"];
		var orientations2 = ["portrait", "portrait", "landscape", "landscape"];
		var orientationString = JSEvents.screenOrientation();
		var orientation = orientations.indexOf(orientationString);
		if (orientation == -1) {
			orientation = orientations2.indexOf(orientationString)
		}
		HEAP32[eventStruct >> 2] = 1 << orientation;
		HEAP32[eventStruct + 4 >> 2] = window.orientation
	}),
	registerOrientationChangeEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.orientationChangeEvent) {
			JSEvents.orientationChangeEvent = _malloc(8)
		}
		if (!target) {
			target = window.screen
		} else {
			target = JSEvents.findEventTarget(target)
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			JSEvents.fillOrientationChangeEventData(JSEvents.orientationChangeEvent, e);
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.orientationChangeEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		if (eventTypeString == "orientationchange" && window.screen.mozOrientation !== undefined) {
			eventTypeString = "mozorientationchange"
		}
		var eventHandler = {
			target: target,
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	fullscreenEnabled: (function() {
		return document.fullscreenEnabled || document.mozFullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled
	}),
	fillFullscreenChangeEventData: (function(eventStruct, e) {
		var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
		var isFullscreen = !!fullscreenElement;
		HEAP32[eventStruct >> 2] = isFullscreen;
		HEAP32[eventStruct + 4 >> 2] = JSEvents.fullscreenEnabled();
		var reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement;
		var nodeName = JSEvents.getNodeNameForTarget(reportedElement);
		var id = reportedElement && reportedElement.id ? reportedElement.id : "";
		writeStringToMemory(nodeName, eventStruct + 8);
		writeStringToMemory(id, eventStruct + 136);
		HEAP32[eventStruct + 264 >> 2] = reportedElement ? reportedElement.clientWidth : 0;
		HEAP32[eventStruct + 268 >> 2] = reportedElement ? reportedElement.clientHeight : 0;
		HEAP32[eventStruct + 272 >> 2] = screen.width;
		HEAP32[eventStruct + 276 >> 2] = screen.height;
		if (isFullscreen) {
			JSEvents.previousFullscreenElement = fullscreenElement
		}
	}),
	registerFullscreenChangeEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.fullscreenChangeEvent) {
			JSEvents.fullscreenChangeEvent = _malloc(280)
		}
		if (!target) {
			target = document
		} else {
			target = JSEvents.findEventTarget(target)
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			JSEvents.fillFullscreenChangeEventData(JSEvents.fullscreenChangeEvent, e);
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.fullscreenChangeEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: target,
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	resizeCanvasForFullscreen: (function(target, strategy) {
		var restoreOldStyle = __registerRestoreOldStyle(target);
		var cssWidth = strategy.softFullscreen ? window.innerWidth : screen.width;
		var cssHeight = strategy.softFullscreen ? window.innerHeight : screen.height;
		var rect = target.getBoundingClientRect();
		var windowedCssWidth = rect.right - rect.left;
		var windowedCssHeight = rect.bottom - rect.top;
		var windowedRttWidth = target.width;
		var windowedRttHeight = target.height;
		if (strategy.scaleMode == 3) {
			__setLetterbox(target, (cssHeight - windowedCssHeight) / 2, (cssWidth - windowedCssWidth) / 2);
			cssWidth = windowedCssWidth;
			cssHeight = windowedCssHeight
		} else if (strategy.scaleMode == 2) {
			if (cssWidth * windowedRttHeight < windowedRttWidth * cssHeight) {
				var desiredCssHeight = windowedRttHeight * cssWidth / windowedRttWidth;
				__setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
				cssHeight = desiredCssHeight
			} else {
				var desiredCssWidth = windowedRttWidth * cssHeight / windowedRttHeight;
				__setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
				cssWidth = desiredCssWidth
			}
		}
		if (!target.style.backgroundColor) target.style.backgroundColor = "black";
		if (!document.body.style.backgroundColor) document.body.style.backgroundColor = "black";
		target.style.width = cssWidth + "px";
		target.style.height = cssHeight + "px";
		if (strategy.filteringMode == 1) {
			target.style.imageRendering = "optimizeSpeed";
			target.style.imageRendering = "-moz-crisp-edges";
			target.style.imageRendering = "-o-crisp-edges";
			target.style.imageRendering = "-webkit-optimize-contrast";
			target.style.imageRendering = "optimize-contrast";
			target.style.imageRendering = "crisp-edges";
			target.style.imageRendering = "pixelated"
		}
		var dpiScale = strategy.canvasResolutionScaleMode == 2 ? window.devicePixelRatio : 1;
		if (strategy.canvasResolutionScaleMode != 0) {
			target.width = cssWidth * dpiScale;
			target.height = cssHeight * dpiScale;
			if (target.GLctxObject) target.GLctxObject.GLctx.viewport(0, 0, target.width, target.height)
		}
		return restoreOldStyle
	}),
	requestFullscreen: (function(target, strategy) {
		if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
			JSEvents.resizeCanvasForFullscreen(target, strategy)
		}
		if (target.requestFullscreen) {
			target.requestFullscreen()
		} else if (target.msRequestFullscreen) {
			target.msRequestFullscreen()
		} else if (target.mozRequestFullScreen) {
			target.mozRequestFullScreen()
		} else if (target.mozRequestFullscreen) {
			target.mozRequestFullscreen()
		} else if (target.webkitRequestFullscreen) {
			target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
		} else {
			if (typeof JSEvents.fullscreenEnabled() === "undefined") {
				return -1
			} else {
				return -3
			}
		}
		if (strategy.canvasResizedCallback) {
			Runtime.dynCall("iiii", strategy.canvasResizedCallback, [37, 0, strategy.canvasResizedCallbackUserData])
		}
		return 0
	}),
	fillPointerlockChangeEventData: (function(eventStruct, e) {
		var pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement;
		var isPointerlocked = !!pointerLockElement;
		HEAP32[eventStruct >> 2] = isPointerlocked;
		var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
		var id = pointerLockElement && pointerLockElement.id ? pointerLockElement.id : "";
		writeStringToMemory(nodeName, eventStruct + 4);
		writeStringToMemory(id, eventStruct + 132)
	}),
	registerPointerlockChangeEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.pointerlockChangeEvent) {
			JSEvents.pointerlockChangeEvent = _malloc(260)
		}
		if (!target) {
			target = document
		} else {
			target = JSEvents.findEventTarget(target)
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			JSEvents.fillPointerlockChangeEventData(JSEvents.pointerlockChangeEvent, e);
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.pointerlockChangeEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: target,
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	requestPointerLock: (function(target) {
		if (target.requestPointerLock) {
			target.requestPointerLock()
		} else if (target.mozRequestPointerLock) {
			target.mozRequestPointerLock()
		} else if (target.webkitRequestPointerLock) {
			target.webkitRequestPointerLock()
		} else if (target.msRequestPointerLock) {
			target.msRequestPointerLock()
		} else {
			if (document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock || document.body.msRequestPointerLock) {
				return -3
			} else {
				return -1
			}
		}
		return 0
	}),
	fillVisibilityChangeEventData: (function(eventStruct, e) {
		var visibilityStates = ["hidden", "visible", "prerender", "unloaded"];
		var visibilityState = visibilityStates.indexOf(document.visibilityState);
		HEAP32[eventStruct >> 2] = document.hidden;
		HEAP32[eventStruct + 4 >> 2] = visibilityState
	}),
	registerVisibilityChangeEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.visibilityChangeEvent) {
			JSEvents.visibilityChangeEvent = _malloc(8)
		}
		if (!target) {
			target = document
		} else {
			target = JSEvents.findEventTarget(target)
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			JSEvents.fillVisibilityChangeEventData(JSEvents.visibilityChangeEvent, e);
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.visibilityChangeEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: target,
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	registerTouchEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.touchEvent) {
			JSEvents.touchEvent = _malloc(1684)
		}
		target = JSEvents.findEventTarget(target);
		var handlerFunc = (function(event) {
			var e = event || window.event;
			var touches = {};
			for (var i = 0; i < e.touches.length; ++i) {
				var touch = e.touches[i];
				touches[touch.identifier] = touch
			}
			for (var i = 0; i < e.changedTouches.length; ++i) {
				var touch = e.changedTouches[i];
				touches[touch.identifier] = touch;
				touch.changed = true
			}
			for (var i = 0; i < e.targetTouches.length; ++i) {
				var touch = e.targetTouches[i];
				touches[touch.identifier].onTarget = true
			}
			var ptr = JSEvents.touchEvent;
			HEAP32[ptr + 4 >> 2] = e.ctrlKey;
			HEAP32[ptr + 8 >> 2] = e.shiftKey;
			HEAP32[ptr + 12 >> 2] = e.altKey;
			HEAP32[ptr + 16 >> 2] = e.metaKey;
			ptr += 20;
			var canvasRect = Module["canvas"] ? Module["canvas"].getBoundingClientRect() : undefined;
			var targetRect = JSEvents.getBoundingClientRectOrZeros(target);
			var numTouches = 0;
			for (var i in touches) {
				var t = touches[i];
				HEAP32[ptr >> 2] = t.identifier;
				HEAP32[ptr + 4 >> 2] = t.screenX;
				HEAP32[ptr + 8 >> 2] = t.screenY;
				HEAP32[ptr + 12 >> 2] = t.clientX;
				HEAP32[ptr + 16 >> 2] = t.clientY;
				HEAP32[ptr + 20 >> 2] = t.pageX;
				HEAP32[ptr + 24 >> 2] = t.pageY;
				HEAP32[ptr + 28 >> 2] = t.changed;
				HEAP32[ptr + 32 >> 2] = t.onTarget;
				if (canvasRect) {
					HEAP32[ptr + 44 >> 2] = t.clientX - canvasRect.left;
					HEAP32[ptr + 48 >> 2] = t.clientY - canvasRect.top
				} else {
					HEAP32[ptr + 44 >> 2] = 0;
					HEAP32[ptr + 48 >> 2] = 0
				}
				HEAP32[ptr + 36 >> 2] = t.clientX - targetRect.left;
				HEAP32[ptr + 40 >> 2] = t.clientY - targetRect.top;
				ptr += 52;
				if (++numTouches >= 32) {
					break
				}
			}
			HEAP32[JSEvents.touchEvent >> 2] = numTouches;
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.touchEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: target,
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	fillGamepadEventData: (function(eventStruct, e) {
		HEAPF64[eventStruct >> 3] = e.timestamp;
		for (var i = 0; i < e.axes.length; ++i) {
			HEAPF64[eventStruct + i * 8 + 16 >> 3] = e.axes[i]
		}
		for (var i = 0; i < e.buttons.length; ++i) {
			if (typeof e.buttons[i] === "object") {
				HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i].value
			} else {
				HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i]
			}
		}
		for (var i = 0; i < e.buttons.length; ++i) {
			if (typeof e.buttons[i] === "object") {
				HEAP32[eventStruct + i * 4 + 1040 >> 2] = e.buttons[i].pressed
			} else {
				HEAP32[eventStruct + i * 4 + 1040 >> 2] = e.buttons[i] == 1
			}
		}
		HEAP32[eventStruct + 1296 >> 2] = e.connected;
		HEAP32[eventStruct + 1300 >> 2] = e.index;
		HEAP32[eventStruct + 8 >> 2] = e.axes.length;
		HEAP32[eventStruct + 12 >> 2] = e.buttons.length;
		writeStringToMemory(e.id, eventStruct + 1304);
		writeStringToMemory(e.mapping, eventStruct + 1368)
	}),
	registerGamepadEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.gamepadEvent) {
			JSEvents.gamepadEvent = _malloc(1432)
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			JSEvents.fillGamepadEventData(JSEvents.gamepadEvent, e.gamepad);
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.gamepadEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: JSEvents.findEventTarget(target),
			allowsDeferredCalls: true,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	registerBeforeUnloadEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		var handlerFunc = (function(event) {
			var e = event || window.event;
			var confirmationMessage = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, 0, userData]);
			if (confirmationMessage) {
				confirmationMessage = Pointer_stringify(confirmationMessage)
			}
			if (confirmationMessage) {
				e.preventDefault();
				e.returnValue = confirmationMessage;
				return confirmationMessage
			}
		});
		var eventHandler = {
			target: JSEvents.findEventTarget(target),
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	battery: (function() {
		return navigator.battery || navigator.mozBattery || navigator.webkitBattery
	}),
	fillBatteryEventData: (function(eventStruct, e) {
		HEAPF64[eventStruct >> 3] = e.chargingTime;
		HEAPF64[eventStruct + 8 >> 3] = e.dischargingTime;
		HEAPF64[eventStruct + 16 >> 3] = e.level;
		HEAP32[eventStruct + 24 >> 2] = e.charging
	}),
	registerBatteryEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!JSEvents.batteryEvent) {
			JSEvents.batteryEvent = _malloc(32)
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			JSEvents.fillBatteryEventData(JSEvents.batteryEvent, JSEvents.battery());
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, JSEvents.batteryEvent, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: JSEvents.findEventTarget(target),
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	}),
	registerWebGlEventCallback: (function(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
		if (!target) {
			target = Module["canvas"]
		}
		var handlerFunc = (function(event) {
			var e = event || window.event;
			var shouldCancel = Runtime.dynCall("iiii", callbackfunc, [eventTypeId, 0, userData]);
			if (shouldCancel) {
				e.preventDefault()
			}
		});
		var eventHandler = {
			target: JSEvents.findEventTarget(target),
			allowsDeferredCalls: false,
			eventTypeString: eventTypeString,
			callbackfunc: callbackfunc,
			handlerFunc: handlerFunc,
			useCapture: useCapture
		};
		JSEvents.registerOrRemoveHandler(eventHandler)
	})
};

function _emscripten_get_gamepad_status(index, gamepadState) {
	if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
	var gamepads;
	if (navigator.getGamepads) {
		gamepads = navigator.getGamepads()
	} else if (navigator.webkitGetGamepads) {
		gamepads = navigator.webkitGetGamepads()
	}
	if (index < 0 || index >= gamepads.length) {
		return -5
	}
	if (!gamepads[index]) {
		return -7
	}
	JSEvents.fillGamepadEventData(gamepadState, gamepads[index]);
	return 0
}

function _realloc() {
	throw "bad"
}
Module["_realloc"] = _realloc;
Module["_saveSetjmp"] = _saveSetjmp;

function _glUniform2fv(location, count, value) {
	location = GL.uniforms[location];
	var view;
	if (count === 1) {
		view = GL.miniTempBufferViews[1];
		view[0] = HEAPF32[value >> 2];
		view[1] = HEAPF32[value + 4 >> 2]
	} else {
		view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2)
	}
	GLctx.uniform2fv(location, view)
}

function _glBlendFuncSeparate(x0, x1, x2, x3) {
	GLctx.blendFuncSeparate(x0, x1, x2, x3)
}
var AL = {
	contexts: [],
	currentContext: null,
	alcErr: 0,
	stringCache: {},
	alcStringCache: {},
	QUEUE_INTERVAL: 25,
	QUEUE_LOOKAHEAD: 100,
	newSrcId: 1,
	updateSources: function updateSources(context) {
		if (Browser.mainLoop.timingMode == 1 && document["visibilityState"] != "visible") return;
		for (var srcId in context.src) {
			AL.updateSource(context.src[srcId])
		}
	},
	updateSource: function updateSource(src) {
		if (src.state !== 4114) {
			return
		}
		var currentTime = AL.currentContext.ctx.currentTime;
		var startTime = src.bufferPosition;
		if (startTime < 1) {
			if (currentTime < 1) return;
			else {
				src.bufferPosition = currentTime;
				startTime = currentTime
			}
		}
		for (var i = src.buffersPlayed; i < src.queue.length; i++) {
			var entry = src.queue[i];
			var startOffset = startTime - currentTime;
			var endTime = startTime + entry.buffer.duration;
			if (currentTime >= endTime) {
				src.bufferPosition = endTime;
				src.buffersPlayed = i + 1;
				if (src.buffersPlayed >= src.queue.length) {
					if (src.loop) {
						AL.setSourceState(src, 4114)
					} else {}
				}
			} else if (startOffset < AL.QUEUE_LOOKAHEAD / 1e3 && !entry.src) {
				var offset = Math.abs(Math.min(startOffset, 0));
				entry.src = AL.currentContext.ctx.createBufferSource();
				entry.src.buffer = entry.buffer;
				entry.src.connect(src.gain);
				if (typeof entry.src.start !== "undefined") {
					entry.src.start(startTime, offset)
				} else if (typeof entry.src.noteOn !== "undefined") {
					entry.src.noteOn(startTime)
				}
			}
			startTime = endTime
		}
	},
	setSourceState: function setSourceState(src, state) {
		if (state === 4114) {
			if (src.state !== 4115) {
				src.state = 4114;
				src.bufferPosition = AL.currentContext.ctx.currentTime;
				src.buffersPlayed = 0
			} else {
				src.state = 4114;
				src.bufferPosition = AL.currentContext.ctx.currentTime - src.bufferPosition
			}
			AL.stopSourceQueue(src);
			AL.updateSource(src)
		} else if (state === 4115) {
			if (src.state === 4114) {
				src.state = 4115;
				src.bufferPosition = AL.currentContext.ctx.currentTime - src.bufferPosition;
				AL.stopSourceQueue(src)
			}
		} else if (state === 4116) {
			if (src.state !== 4113) {
				src.state = 4116;
				src.buffersPlayed = src.queue.length;
				AL.stopSourceQueue(src)
			}
		} else if (state == 4113) {
			if (src.state !== 4113) {
				src.state = 4113;
				src.bufferPosition = 0;
				src.buffersPlayed = 0
			}
		}
	},
	stopSourceQueue: function stopSourceQueue(src) {
		for (var i = 0; i < src.queue.length; i++) {
			var entry = src.queue[i];
			if (entry.src) {
				entry.src.stop(0);
				entry.src = null
			}
		}
	}
};

function _alSourcef(source, param, value) {
	if (!AL.currentContext) {
		return
	}
	var src = AL.currentContext.src[source];
	if (!src) {
		AL.currentContext.err = 40961;
		return
	}
	switch (param) {
		case 4099:
			break;
		case 4106:
			src.gain.gain.value = value;
			break;
		case 4131:
			src.maxDistance = value;
			break;
		case 4129:
			src.rolloffFactor = value;
			break;
		case 4130:
			src.coneOuterGain = value;
			break;
		case 4097:
			src.coneInnerAngle = value;
			break;
		case 4098:
			src.coneOuterAngle = value;
			break;
		case 4128:
			src.refDistance = value;
			break;
		default:
			AL.currentContext.err = 40962;
			break
	}
}

function _glCompileShader(shader) {
	GLctx.compileShader(GL.shaders[shader])
}

function ___syscall54(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var stream = SYSCALLS.getStreamFromFD(),
			op = SYSCALLS.get();
		switch (op) {
			case 21505: {
				if (!stream.tty) return -ERRNO_CODES.ENOTTY;
				return 0
			};
		case 21506: {
			if (!stream.tty) return -ERRNO_CODES.ENOTTY;
			return 0
		};
		case 21519: {
			if (!stream.tty) return -ERRNO_CODES.ENOTTY;
			var argp = SYSCALLS.get();
			HEAP32[argp >> 2] = 0;
			return 0
		};
		case 21520: {
			if (!stream.tty) return -ERRNO_CODES.ENOTTY;
			return -ERRNO_CODES.EINVAL
		};
		case 21531: {
			var argp = SYSCALLS.get();
			return FS.ioctl(stream, op, argp)
		};
		default:
			abort("bad ioctl syscall " + op)
		}
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}
var ___tm_current = STATICTOP;
STATICTOP += 48;
var ___tm_timezone = allocate(intArrayFromString("GMT"), "i8", ALLOC_STATIC);
var _tzname = STATICTOP;
STATICTOP += 16;
var _daylight = STATICTOP;
STATICTOP += 16;
var _timezone = STATICTOP;
STATICTOP += 16;

function _tzset() {
	if (_tzset.called) return;
	_tzset.called = true;
	HEAP32[_timezone >> 2] = -(new Date).getTimezoneOffset() * 60;
	var winter = new Date(2e3, 0, 1);
	var summer = new Date(2e3, 6, 1);
	HEAP32[_daylight >> 2] = Number(winter.getTimezoneOffset() != summer.getTimezoneOffset());

	function extractZone(date) {
		var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
		return match ? match[1] : "GMT"
	}
	var winterName = extractZone(winter);
	var summerName = extractZone(summer);
	var winterNamePtr = allocate(intArrayFromString(winterName), "i8", ALLOC_NORMAL);
	var summerNamePtr = allocate(intArrayFromString(summerName), "i8", ALLOC_NORMAL);
	if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
		HEAP32[_tzname >> 2] = winterNamePtr;
		HEAP32[_tzname + 4 >> 2] = summerNamePtr
	} else {
		HEAP32[_tzname >> 2] = summerNamePtr;
		HEAP32[_tzname + 4 >> 2] = winterNamePtr
	}
}

function _localtime_r(time, tmPtr) {
	_tzset();
	var date = new Date(HEAP32[time >> 2] * 1e3);
	HEAP32[tmPtr >> 2] = date.getSeconds();
	HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
	HEAP32[tmPtr + 8 >> 2] = date.getHours();
	HEAP32[tmPtr + 12 >> 2] = date.getDate();
	HEAP32[tmPtr + 16 >> 2] = date.getMonth();
	HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
	HEAP32[tmPtr + 24 >> 2] = date.getDay();
	var start = new Date(date.getFullYear(), 0, 1);
	var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
	HEAP32[tmPtr + 28 >> 2] = yday;
	HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
	var summerOffset = (new Date(2e3, 6, 1)).getTimezoneOffset();
	var winterOffset = start.getTimezoneOffset();
	var dst = date.getTimezoneOffset() == Math.min(winterOffset, summerOffset) | 0;
	HEAP32[tmPtr + 32 >> 2] = dst;
	var zonePtr = HEAP32[_tzname + (dst ? Runtime.QUANTUM_SIZE : 0) >> 2];
	HEAP32[tmPtr + 40 >> 2] = zonePtr;
	return tmPtr
}

function _localtime(time) {
	return _localtime_r(time, ___tm_current)
}

function _glDeleteTextures(n, textures) {
	for (var i = 0; i < n; i++) {
		var id = HEAP32[textures + i * 4 >> 2];
		var texture = GL.textures[id];
		if (!texture) continue;
		GLctx.deleteTexture(texture);
		texture.name = 0;
		GL.textures[id] = null
	}
}
Module["_bitshift64Ashr"] = _bitshift64Ashr;

function ___syscall33(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var path = SYSCALLS.getStr(),
			amode = SYSCALLS.get();
		return SYSCALLS.doAccess(path, amode)
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function _glfwSetWindowSizeCallback(winid, cbfun) {
	GLFW.setWindowSizeCallback(winid, cbfun)
}

function _glfwSetWindowTitle(winid, title) {
	GLFW.setWindowTitle(winid, title)
}

function _alSourcei(source, param, value) {
	if (!AL.currentContext) {
		return
	}
	var src = AL.currentContext.src[source];
	if (!src) {
		AL.currentContext.err = 40961;
		return
	}
	switch (param) {
		case 4097:
			src.coneInnerAngle = value;
			break;
		case 4098:
			src.coneOuterAngle = value;
			break;
		case 4103:
			src.loop = value === 1;
			break;
		case 4105:
			var buffer = AL.currentContext.buf[value - 1];
			if (value == 0) {
				src.queue = []
			} else {
				src.queue = [{
					buffer: buffer
				}]
			}
			AL.updateSource(src);
			break;
		case 514:
			if (value === 1) {
				if (src.panner) {
					src.panner = null;
					src.gain.disconnect();
					src.gain.connect(AL.currentContext.gain)
				}
			} else if (value === 0) {
				if (!src.panner) {
					var panner = src.panner = AL.currentContext.ctx.createPanner();
					panner.panningModel = "equalpower";
					panner.distanceModel = "linear";
					panner.refDistance = src.refDistance;
					panner.maxDistance = src.maxDistance;
					panner.rolloffFactor = src.rolloffFactor;
					panner.setPosition(src.position[0], src.position[1], src.position[2]);
					panner.setVelocity(src.velocity[0], src.velocity[1], src.velocity[2]);
					panner.connect(AL.currentContext.gain);
					src.gain.disconnect();
					src.gain.connect(panner)
				}
			} else {
				AL.currentContext.err = 40963
			}
			break;
		default:
			AL.currentContext.err = 40962;
			break
	}
}

function _alSourceQueueBuffers(source, count, buffers) {
	if (!AL.currentContext) {
		return
	}
	var src = AL.currentContext.src[source];
	if (!src) {
		AL.currentContext.err = 40961;
		return
	}
	for (var i = 0; i < count; ++i) {
		var bufferIdx = HEAP32[buffers + i * 4 >> 2];
		if (bufferIdx > AL.currentContext.buf.length) {
			AL.currentContext.err = 40961;
			return
		}
	}
	for (var i = 0; i < count; ++i) {
		var bufferIdx = HEAP32[buffers + i * 4 >> 2];
		var buffer = AL.currentContext.buf[bufferIdx - 1];
		src.queue.push({
			buffer: buffer,
			src: null
		})
	}
	AL.updateSource(src)
}

function _glfwGetFramebufferSize(winid, width, height) {
	var ww = 0;
	var wh = 0;
	var win = GLFW.WindowFromId(winid);
	if (win) {
		ww = win.width;
		wh = win.height
	}
	setValue(width, ww, "i32");
	setValue(height, wh, "i32")
}

function _emscripten_memcpy_big(dest, src, num) {
	HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
	return dest
}
Module["_memcpy"] = _memcpy;

function _glClearDepthf(x0) {
	GLctx.clearDepth(x0)
}

function _utime(path, times) {
	var time;
	if (times) {
		var offset = 4;
		time = HEAP32[times + offset >> 2];
		time *= 1e3
	} else {
		time = Date.now()
	}
	path = Pointer_stringify(path);
	try {
		FS.utime(path, time, time);
		return 0
	} catch (e) {
		FS.handleFSError(e);
		return -1
	}
}
Module["_memmove"] = _memmove;

function _glGenTextures(n, textures) {
	for (var i = 0; i < n; i++) {
		var texture = GLctx.createTexture();
		if (!texture) {
			GL.recordError(1282);
			while (i < n) HEAP32[textures + i++ * 4 >> 2] = 0;
			return
		}
		var id = GL.getNewId(GL.textures);
		texture.name = id;
		GL.textures[id] = texture;
		HEAP32[textures + i * 4 >> 2] = id
	}
}

function __ZSt18uncaught_exceptionv() {
	return !!__ZSt18uncaught_exceptionv.uncaught_exception
}

function ___resumeException(ptr) {
	if (!EXCEPTIONS.last) {
		EXCEPTIONS.last = ptr
	}
	EXCEPTIONS.clearRef(EXCEPTIONS.deAdjust(ptr));
	throw ptr
}

function ___cxa_find_matching_catch() {
	var thrown = EXCEPTIONS.last;
	if (!thrown) {
		return (asm["setTempRet0"](0), 0) | 0
	}
	var info = EXCEPTIONS.infos[thrown];
	var throwntype = info.type;
	if (!throwntype) {
		return (asm["setTempRet0"](0), thrown) | 0
	}
	var typeArray = Array.prototype.slice.call(arguments);
	var pointer = Module["___cxa_is_pointer_type"](throwntype);
	if (!___cxa_find_matching_catch.buffer) ___cxa_find_matching_catch.buffer = _malloc(4);
	HEAP32[___cxa_find_matching_catch.buffer >> 2] = thrown;
	thrown = ___cxa_find_matching_catch.buffer;
	for (var i = 0; i < typeArray.length; i++) {
		if (typeArray[i] && Module["___cxa_can_catch"](typeArray[i], throwntype, thrown)) {
			thrown = HEAP32[thrown >> 2];
			info.adjusted = thrown;
			return (asm["setTempRet0"](typeArray[i]), thrown) | 0
		}
	}
	thrown = HEAP32[thrown >> 2];
	return (asm["setTempRet0"](throwntype), thrown) | 0
}

function ___gxx_personality_v0() {}

function ___cxa_guard_abort() {}

function _alcDestroyContext(context) {
	clearInterval(AL.contexts[context - 1].interval)
}

function _glUniform1i(location, v0) {
	location = GL.uniforms[location];
	GLctx.uniform1i(location, v0)
}

function _alGetError() {
	if (!AL.currentContext) {
		return 40964
	} else {
		var err = AL.currentContext.err;
		AL.currentContext.err = 0;
		return err
	}
}

function _glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
	program = GL.programs[program];
	var info = GLctx.getActiveAttrib(program, index);
	if (!info) return;
	var infoname = info.name.slice(0, Math.max(0, bufSize - 1));
	if (bufSize > 0 && name) {
		writeStringToMemory(infoname, name);
		if (length) HEAP32[length >> 2] = infoname.length
	} else {
		if (length) HEAP32[length >> 2] = 0
	}
	if (size) HEAP32[size >> 2] = info.size;
	if (type) HEAP32[type >> 2] = info.type
}

function _emscripten_get_now_is_monotonic() {
	return ENVIRONMENT_IS_NODE || typeof dateNow !== "undefined" || (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self["performance"] && self["performance"]["now"]
}

function _clock_gettime(clk_id, tp) {
	var now;
	if (clk_id === 0) {
		now = Date.now()
	} else if (clk_id === 1 && _emscripten_get_now_is_monotonic()) {
		now = _emscripten_get_now()
	} else {
		___setErrNo(ERRNO_CODES.EINVAL);
		return -1
	}
	HEAP32[tp >> 2] = now / 1e3 | 0;
	HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
	return 0
}

function emscriptenWebGLComputeImageSize(width, height, sizePerPixel, alignment) {
	function roundedToNextMultipleOf(x, y) {
		return Math.floor((x + y - 1) / y) * y
	}
	var plainRowSize = width * sizePerPixel;
	var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
	return height <= 0 ? 0 : (height - 1) * alignedRowSize + plainRowSize
}

function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
	var sizePerPixel;
	var numChannels;
	switch (format) {
		case 6406:
		case 6409:
		case 6402:
		case 6403:
			numChannels = 1;
			break;
		case 6410:
		case 33319:
			numChannels = 2;
			break;
		case 6407:
		case 35904:
			numChannels = 3;
			break;
		case 6408:
		case 35906:
			numChannels = 4;
			break;
		default:
			GL.recordError(1280);
			return {
				pixels: null, internalFormat: 0
			}
	}
	switch (type) {
		case 5121:
			sizePerPixel = numChannels * 1;
			break;
		case 5123:
		case 36193:
			sizePerPixel = numChannels * 2;
			break;
		case 5125:
		case 5126:
			sizePerPixel = numChannels * 4;
			break;
		case 34042:
			sizePerPixel = 4;
			break;
		case 33635:
		case 32819:
		case 32820:
			sizePerPixel = 2;
			break;
		default:
			GL.recordError(1280);
			return {
				pixels: null, internalFormat: 0
			}
	}
	var bytes = emscriptenWebGLComputeImageSize(width, height, sizePerPixel, GL.unpackAlignment);
	if (type == 5121) {
		pixels = HEAPU8.subarray(pixels, pixels + bytes)
	} else if (type == 5126) {
		pixels = HEAPF32.subarray(pixels >> 2, pixels + bytes >> 2)
	} else if (type == 5125 || type == 34042) {
		pixels = HEAPU32.subarray(pixels >> 2, pixels + bytes >> 2)
	} else {
		pixels = HEAPU16.subarray(pixels >> 1, pixels + bytes >> 1)
	}
	return {
		pixels: pixels,
		internalFormat: internalFormat
	}
}

function _glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
	var pixelData;
	if (pixels) {
		pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, -1).pixels
	} else {
		pixelData = null
	}
	GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData)
}

function _glDisable(x0) {
	GLctx.disable(x0)
}

function ___set_network_callback(event, userData, callback) {
	function _callback(data) {
		try {
			if (event === "error") {
				var sp = Runtime.stackSave();
				var msg = allocate(intArrayFromString(data[2]), "i8", ALLOC_STACK);
				Runtime.dynCall("viiii", callback, [data[0], data[1], msg, userData]);
				Runtime.stackRestore(sp)
			} else {
				Runtime.dynCall("vii", callback, [data, userData])
			}
		} catch (e) {
			if (e instanceof ExitStatus) {
				return
			} else {
				if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [e, e.stack]);
				throw e
			}
		}
	}
	Module["noExitRuntime"] = true;
	Module["websocket"]["on"](event, callback ? _callback : null)
}

function _emscripten_set_socket_open_callback(userData, callback) {
	___set_network_callback("open", userData, callback)
}

function _glUniform2f(location, v0, v1) {
	location = GL.uniforms[location];
	GLctx.uniform2f(location, v0, v1)
}
Module["_memset"] = _memset;

function _glGetProgramiv(program, pname, p) {
	if (!p) {
		GL.recordError(1281);
		return
	}
	if (pname == 35716) {
		var log = GLctx.getProgramInfoLog(GL.programs[program]);
		if (log === null) log = "(unknown error)";
		HEAP32[p >> 2] = log.length + 1
	} else if (pname == 35719) {
		var ptable = GL.programInfos[program];
		if (ptable) {
			HEAP32[p >> 2] = ptable.maxUniformLength;
			return
		} else if (program < GL.counter) {
			GL.recordError(1282)
		} else {
			GL.recordError(1281)
		}
	} else if (pname == 35722) {
		var ptable = GL.programInfos[program];
		if (ptable) {
			if (ptable.maxAttributeLength == -1) {
				var program = GL.programs[program];
				var numAttribs = GLctx.getProgramParameter(program, GLctx.ACTIVE_ATTRIBUTES);
				ptable.maxAttributeLength = 0;
				for (var i = 0; i < numAttribs; ++i) {
					var activeAttrib = GLctx.getActiveAttrib(program, i);
					ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length + 1)
				}
			}
			HEAP32[p >> 2] = ptable.maxAttributeLength;
			return
		} else if (program < GL.counter) {
			GL.recordError(1282)
		} else {
			GL.recordError(1281)
		}
	} else {
		HEAP32[p >> 2] = GLctx.getProgramParameter(GL.programs[program], pname)
	}
}

function _glDepthFunc(x0) {
	GLctx.depthFunc(x0)
}

function _alDeleteBuffers(count, buffers) {
	if (!AL.currentContext) {
		return
	}
	if (count > AL.currentContext.buf.length) {
		AL.currentContext.err = 40963;
		return
	}
	for (var i = 0; i < count; ++i) {
		var bufferIdx = HEAP32[buffers + i * 4 >> 2] - 1;
		if (bufferIdx >= AL.currentContext.buf.length || !AL.currentContext.buf[bufferIdx]) {
			AL.currentContext.err = 40961;
			return
		}
		var buffer = AL.currentContext.buf[bufferIdx];
		for (var srcId in AL.currentContext.src) {
			var src = AL.currentContext.src[srcId];
			if (!src) {
				continue
			}
			for (var k = 0; k < src.queue.length; k++) {
				if (buffer === src.queue[k].buffer) {
					AL.currentContext.err = 40964;
					return
				}
			}
		}
	}
	for (var i = 0; i < count; ++i) {
		var bufferIdx = HEAP32[buffers + i * 4 >> 2] - 1;
		delete AL.currentContext.buf[bufferIdx]
	}
}

function _alcMakeContextCurrent(context) {
	if (context == 0) {
		AL.currentContext = null;
		return 0
	} else {
		AL.currentContext = AL.contexts[context - 1];
		return 1
	}
}

function _glfwInit() {
	if (GLFW.windows) return 1;
	GLFW.initialTime = GLFW.getTime();
	GLFW.hints = GLFW.defaultHints;
	GLFW.windows = new Array;
	GLFW.active = null;
	window.addEventListener("keydown", GLFW.onKeydown, true);
	window.addEventListener("keypress", GLFW.onKeyPress, true);
	window.addEventListener("keyup", GLFW.onKeyup, true);
	Module["canvas"].addEventListener("mousemove", GLFW.onMousemove, true);
	Module["canvas"].addEventListener("mousedown", GLFW.onMouseButtonDown, true);
	Module["canvas"].addEventListener("mouseup", GLFW.onMouseButtonUp, true);
	Module["canvas"].addEventListener("wheel", GLFW.onMouseWheel, true);
	Module["canvas"].addEventListener("mousewheel", GLFW.onMouseWheel, true);
	Browser.resizeListeners.push((function(width, height) {
		GLFW.onSizeChange()
	}));
	return 1
}

function ___assert_fail(condition, filename, line, func) {
	ABORT = true;
	throw "Assertion failed: " + Pointer_stringify(condition) + ", at: " + [filename ? Pointer_stringify(filename) : "unknown filename", line, func ? Pointer_stringify(func) : "unknown function"] + " at " + stackTrace()
}

function _glfwMakeContextCurrent(winid) {}

function _emscripten_set_touchcancel_callback(target, userData, useCapture, callbackfunc) {
	JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel");
	return 0
}

function _glBindFramebuffer(target, framebuffer) {
	GLctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : null)
}

function ___lock() {}

function _glCullFace(x0) {
	GLctx.cullFace(x0)
}

function _glUniform4fv(location, count, value) {
	location = GL.uniforms[location];
	var view;
	if (count === 1) {
		view = GL.miniTempBufferViews[3];
		view[0] = HEAPF32[value >> 2];
		view[1] = HEAPF32[value + 4 >> 2];
		view[2] = HEAPF32[value + 8 >> 2];
		view[3] = HEAPF32[value + 12 >> 2]
	} else {
		view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2)
	}
	GLctx.uniform4fv(location, view)
}

function _glUniform1f(location, v0) {
	location = GL.uniforms[location];
	GLctx.uniform1f(location, v0)
}

function _emscripten_set_touchstart_callback(target, userData, useCapture, callbackfunc) {
	JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart");
	return 0
}

function __inet_pton4_raw(str) {
	var b = str.split(".");
	for (var i = 0; i < 4; i++) {
		var tmp = Number(b[i]);
		if (isNaN(tmp)) return null;
		b[i] = tmp
	}
	return (b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24) >>> 0
}

function _inet_addr(ptr) {
	var addr = __inet_pton4_raw(Pointer_stringify(ptr));
	if (addr === null) {
		return -1
	}
	return addr
}

function _glfwSetScrollCallback(winid, cbfun) {
	GLFW.setScrollCallback(winid, cbfun)
}

function __exit(status) {
	Module["exit"](status)
}

function _exit(status) {
	__exit(status)
}
var PTHREAD_SPECIFIC = {};

function _pthread_setspecific(key, value) {
	if (!(key in PTHREAD_SPECIFIC)) {
		return ERRNO_CODES.EINVAL
	}
	PTHREAD_SPECIFIC[key] = value;
	return 0
}

function _glRenderbufferStorage(x0, x1, x2, x3) {
	GLctx.renderbufferStorage(x0, x1, x2, x3)
}

function _alSourcePlay(source) {
	if (!AL.currentContext) {
		return
	}
	var src = AL.currentContext.src[source];
	if (!src) {
		AL.currentContext.err = 40961;
		return
	}
	AL.setSourceState(src, 4114)
}

function _glAttachShader(program, shader) {
	GLctx.attachShader(GL.programs[program], GL.shaders[shader])
}

function _glfwGetPrimaryMonitor() {
	return 1
}

function _glfwIconifyWindow(winid) {
	GLFW.iconifyWindow(winid)
}

function _Mix_PauseMusic() {
	var audio = SDL.music.audio;
	if (audio) audio.pause();
	return 0
}

function _glDeleteProgram(id) {
	if (!id) return;
	var program = GL.programs[id];
	if (!program) {
		GL.recordError(1281);
		return
	}
	GLctx.deleteProgram(program);
	program.name = 0;
	GL.programs[id] = null;
	GL.programInfos[id] = null
}

function _glCheckFramebufferStatus(x0) {
	return GLctx.checkFramebufferStatus(x0)
}

function _glfwSetCursorPosCallback(winid, cbfun) {
	GLFW.setCursorPosCallback(winid, cbfun)
}

function _glfwSetWindowCloseCallback(winid, cbfun) {
	GLFW.setWindowCloseCallback(winid, cbfun)
}

function ___syscall10(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var path = SYSCALLS.getStr();
		FS.unlink(path);
		return 0
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function _glUniform3f(location, v0, v1, v2) {
	location = GL.uniforms[location];
	GLctx.uniform3f(location, v0, v1, v2)
}

function ___cxa_guard_acquire(variable) {
	if (!HEAP8[variable >> 0]) {
		HEAP8[variable >> 0] = 1;
		return 1
	}
	return 0
}

function _glDrawElements(mode, count, type, indices) {
	var buf;
	if (!GL.currElementArrayBuffer) {
		var size = GL.calcBufLength(1, type, 0, count);
		buf = GL.getTempIndexBuffer(size);
		GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, buf);
		GLctx.bufferSubData(GLctx.ELEMENT_ARRAY_BUFFER, 0, HEAPU8.subarray(indices, indices + size));
		indices = 0
	}
	GL.preDrawHandleClientVertexAttribBindings(count);
	GLctx.drawElements(mode, count, type, indices);
	GL.postDrawHandleClientVertexAttribBindings(count);
	if (!GL.currElementArrayBuffer) {
		GLctx.bindBuffer(GLctx.ELEMENT_ARRAY_BUFFER, null)
	}
}

function ___cxa_begin_catch(ptr) {
	__ZSt18uncaught_exceptionv.uncaught_exception--;
	EXCEPTIONS.caught.push(ptr);
	EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));
	return ptr
}

function _glfwTerminate() {
	window.removeEventListener("keydown", GLFW.onKeydown, true);
	window.removeEventListener("keypress", GLFW.onKeyPress, true);
	window.removeEventListener("keyup", GLFW.onKeyup, true);
	Module["canvas"].removeEventListener("mousemove", GLFW.onMousemove, true);
	Module["canvas"].removeEventListener("mousedown", GLFW.onMouseButtonDown, true);
	Module["canvas"].removeEventListener("mouseup", GLFW.onMouseButtonUp, true);
	Module["canvas"].removeEventListener("wheel", GLFW.onMouseWheel, true);
	Module["canvas"].removeEventListener("mousewheel", GLFW.onMouseWheel, true);
	Module["canvas"].width = Module["canvas"].height = 1;
	GLFW.windows = null;
	GLFW.active = null
}

function ___syscall12(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var path = SYSCALLS.getStr();
		FS.chdir(path);
		return 0
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function ___syscall5(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var pathname = SYSCALLS.getStr(),
			flags = SYSCALLS.get(),
			mode = SYSCALLS.get();
		var stream = FS.open(pathname, flags, mode);
		return stream.fd
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function ___syscall6(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var stream = SYSCALLS.getStreamFromFD();
		FS.close(stream);
		return 0
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function _emscripten_async_wget2_abort(handle) {
	var http = Browser.wgetRequests[handle];
	if (http) {
		http.abort()
	}
}

function _SDL_Init(initFlags) {
	SDL.startTime = Date.now();
	SDL.initFlags = initFlags;
	if (!Module["doNotCaptureKeyboard"]) {
		var keyboardListeningElement = Module["keyboardListeningElement"] || document;
		keyboardListeningElement.addEventListener("keydown", SDL.receiveEvent);
		keyboardListeningElement.addEventListener("keyup", SDL.receiveEvent);
		keyboardListeningElement.addEventListener("keypress", SDL.receiveEvent);
		window.addEventListener("focus", SDL.receiveEvent);
		window.addEventListener("blur", SDL.receiveEvent);
		document.addEventListener("visibilitychange", SDL.receiveEvent)
	}
	if (initFlags & 512) {
		addEventListener("gamepadconnected", (function() {}))
	}
	window.addEventListener("unload", SDL.receiveEvent);
	SDL.keyboardState = _malloc(65536);
	_memset(SDL.keyboardState, 0, 65536);
	SDL.DOMEventToSDLEvent["keydown"] = 768;
	SDL.DOMEventToSDLEvent["keyup"] = 769;
	SDL.DOMEventToSDLEvent["keypress"] = 771;
	SDL.DOMEventToSDLEvent["mousedown"] = 1025;
	SDL.DOMEventToSDLEvent["mouseup"] = 1026;
	SDL.DOMEventToSDLEvent["mousemove"] = 1024;
	SDL.DOMEventToSDLEvent["wheel"] = 1027;
	SDL.DOMEventToSDLEvent["touchstart"] = 1792;
	SDL.DOMEventToSDLEvent["touchend"] = 1793;
	SDL.DOMEventToSDLEvent["touchmove"] = 1794;
	SDL.DOMEventToSDLEvent["unload"] = 256;
	SDL.DOMEventToSDLEvent["resize"] = 28673;
	SDL.DOMEventToSDLEvent["visibilitychange"] = 512;
	SDL.DOMEventToSDLEvent["focus"] = 512;
	SDL.DOMEventToSDLEvent["blur"] = 512;
	SDL.DOMEventToSDLEvent["joystick_axis_motion"] = 1536;
	SDL.DOMEventToSDLEvent["joystick_button_down"] = 1539;
	SDL.DOMEventToSDLEvent["joystick_button_up"] = 1540;
	return 0
}

function _glCreateShader(shaderType) {
	var id = GL.getNewId(GL.shaders);
	GL.shaders[id] = GLctx.createShader(shaderType);
	return id
}

function ___syscall295(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var dirfd = SYSCALLS.get(),
			path = SYSCALLS.getStr(),
			flags = SYSCALLS.get(),
			mode = SYSCALLS.get();
		path = SYSCALLS.calculateAt(dirfd, path);
		return FS.open(path, flags, mode).fd
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function _gettimeofday(ptr) {
	var now = Date.now();
	HEAP32[ptr >> 2] = now / 1e3 | 0;
	HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
	return 0
}

function _glViewport(x0, x1, x2, x3) {
	GLctx.viewport(x0, x1, x2, x3)
}

function _glGenerateMipmap(x0) {
	GLctx.generateMipmap(x0)
}

function ___syscall40(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var path = SYSCALLS.getStr();
		FS.rmdir(path);
		return 0
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function ___syscall265(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		return 0
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function _glGetShaderiv(shader, pname, p) {
	if (!p) {
		GL.recordError(1281);
		return
	}
	if (pname == 35716) {
		var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
		if (log === null) log = "(unknown error)";
		HEAP32[p >> 2] = log.length + 1
	} else {
		HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname)
	}
}

function ___syscall140(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var stream = SYSCALLS.getStreamFromFD(),
			offset_high = SYSCALLS.get(),
			offset_low = SYSCALLS.get(),
			result = SYSCALLS.get(),
			whence = SYSCALLS.get();
		var offset = offset_low;
		assert(offset_high === 0);
		FS.llseek(stream, offset, whence);
		HEAP32[result >> 2] = stream.position;
		if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
		return 0
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function ___syscall146(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var stream = SYSCALLS.getStreamFromFD(),
			iov = SYSCALLS.get(),
			iovcnt = SYSCALLS.get();
		return SYSCALLS.doWritev(stream, iov, iovcnt)
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function _alSource3f(source, param, v1, v2, v3) {
	if (!AL.currentContext) {
		return
	}
	var src = AL.currentContext.src[source];
	if (!src) {
		AL.currentContext.err = 40961;
		return
	}
	switch (param) {
		case 4100:
			src.position = [v1, v2, v3];
			break;
		case 4101:
			src.direction = [v1, v2, v3];
			break;
		case 4102:
			src.velocity = [v1, v2, v3];
			break;
		default:
			AL.currentContext.err = 40962;
			break
	}
}

function _alSourcefv(source, param, value) {
	_alSource3f(source, param, HEAPF32[value >> 2], HEAPF32[value + 4 >> 2], HEAPF32[value + 8 >> 2])
}

function _emscripten_async_call(func, arg, millis) {
	Module["noExitRuntime"] = true;

	function wrapper() {
		Runtime.getFuncWrapper(func, "vi")(arg)
	}
	if (millis >= 0) {
		Browser.safeSetTimeout(wrapper, millis)
	} else {
		Browser.safeRequestAnimationFrame(wrapper)
	}
}

function _atexit(func, arg) {
	__ATEXIT__.unshift({
		func: func,
		arg: arg
	})
}

function ___cxa_atexit() {
	return _atexit.apply(null, arguments)
}

function _glGenRenderbuffers(n, renderbuffers) {
	for (var i = 0; i < n; i++) {
		var renderbuffer = GLctx.createRenderbuffer();
		if (!renderbuffer) {
			GL.recordError(1282);
			while (i < n) HEAP32[renderbuffers + i++ * 4 >> 2] = 0;
			return
		}
		var id = GL.getNewId(GL.renderbuffers);
		renderbuffer.name = id;
		GL.renderbuffers[id] = renderbuffer;
		HEAP32[renderbuffers + i * 4 >> 2] = id
	}
}
Module["_i64Subtract"] = _i64Subtract;
Module["_i64Add"] = _i64Add;

function _glGetShaderPrecisionFormat(shaderType, precisionType, range, precision) {
	var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
	HEAP32[range >> 2] = result.rangeMin;
	HEAP32[range + 4 >> 2] = result.rangeMax;
	HEAP32[precision >> 2] = result.precision
}

function _Mix_ResumeMusic() {
	var audio = SDL.music.audio;
	if (audio) audio.play();
	return 0
}

function ___cxa_throw(ptr, type, destructor) {
	EXCEPTIONS.infos[ptr] = {
		ptr: ptr,
		adjusted: ptr,
		type: type,
		destructor: destructor,
		refcount: 0
	};
	EXCEPTIONS.last = ptr;
	if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
		__ZSt18uncaught_exceptionv.uncaught_exception = 1
	} else {
		__ZSt18uncaught_exceptionv.uncaught_exception++
	}
	throw ptr
}

function _emscripten_set_touchmove_callback(target, userData, useCapture, callbackfunc) {
	JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove");
	return 0
}

function _emscripten_set_touchend_callback(target, userData, useCapture, callbackfunc) {
	JSEvents.registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend");
	return 0
}

function _glUseProgram(program) {
	GLctx.useProgram(program ? GL.programs[program] : null)
}

function _alcCreateContext(device, attrList) {
	if (device != 1) {
		return 0
	}
	if (attrList) {
		return 0
	}
	var ctx;
	try {
		ctx = new AudioContext
	} catch (e) {
		try {
			ctx = new webkitAudioContext
		} catch (e) {}
	}
	if (ctx) {
		if (typeof ctx.createGain === "undefined") ctx.createGain = ctx.createGainNode;
		var gain = ctx.createGain();
		gain.connect(ctx.destination);
		var context = {
			ctx: ctx,
			err: 0,
			src: {},
			buf: [],
			interval: setInterval((function() {
				AL.updateSources(context)
			}), AL.QUEUE_INTERVAL),
			gain: gain
		};
		AL.contexts.push(context);
		var buffer = ctx.createBuffer(1, 1, 22050);
		var source = ctx.createBufferSource();
		source.buffer = buffer;
		source.connect(ctx.destination);
		if (typeof source.start !== "undefined") source.start(0);
		else if (typeof source.noteOn !== "undefined") source.noteOn(0);
		return AL.contexts.length
	} else {
		return 0
	}
}

function _alSourceStop(source) {
	if (!AL.currentContext) {
		return
	}
	var src = AL.currentContext.src[source];
	if (!src) {
		AL.currentContext.err = 40961;
		return
	}
	AL.setSourceState(src, 4116)
}

function _alcCloseDevice(device) {}

function _glShaderSource(shader, count, string, length) {
	var source = GL.getSource(shader, count, string, length);
	GLctx.shaderSource(GL.shaders[shader], source)
}

function _glBindRenderbuffer(target, renderbuffer) {
	GLctx.bindRenderbuffer(target, renderbuffer ? GL.renderbuffers[renderbuffer] : null)
}

function _glDeleteRenderbuffers(n, renderbuffers) {
	for (var i = 0; i < n; i++) {
		var id = HEAP32[renderbuffers + i * 4 >> 2];
		var renderbuffer = GL.renderbuffers[id];
		if (!renderbuffer) continue;
		GLctx.deleteRenderbuffer(renderbuffer);
		renderbuffer.name = 0;
		GL.renderbuffers[id] = null
	}
}

function _glDeleteFramebuffers(n, framebuffers) {
	for (var i = 0; i < n; ++i) {
		var id = HEAP32[framebuffers + i * 4 >> 2];
		var framebuffer = GL.framebuffers[id];
		if (!framebuffer) continue;
		GLctx.deleteFramebuffer(framebuffer);
		framebuffer.name = 0;
		GL.framebuffers[id] = null
	}
}

function _glDrawArrays(mode, first, count) {
	GL.preDrawHandleClientVertexAttribBindings(first + count);
	GLctx.drawArrays(mode, first, count);
	GL.postDrawHandleClientVertexAttribBindings()
}

function _usleep(useconds) {
	var msec = useconds / 1e3;
	if ((ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self["performance"] && self["performance"]["now"]) {
		var start = self["performance"]["now"]();
		while (self["performance"]["now"]() - start < msec) {}
	} else {
		var start = Date.now();
		while (Date.now() - start < msec) {}
	}
	return 0
}

function _alcOpenDevice(deviceName) {
	if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
		return 1
	} else {
		return 0
	}
}

function _emscripten_get_num_gamepads() {
	if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
	if (navigator.getGamepads) {
		return navigator.getGamepads().length
	} else if (navigator.webkitGetGamepads) {
		return navigator.webkitGetGamepads().length
	}
}

function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
	var log = GLctx.getProgramInfoLog(GL.programs[program]);
	if (log === null) log = "(unknown error)";
	log = log.substr(0, maxLength - 1);
	if (maxLength > 0 && infoLog) {
		writeStringToMemory(log, infoLog);
		if (length) HEAP32[length >> 2] = log.length
	} else {
		if (length) HEAP32[length >> 2] = 0
	}
}
var PTHREAD_SPECIFIC_NEXT_KEY = 1;

function _pthread_key_create(key, destructor) {
	if (key == 0) {
		return ERRNO_CODES.EINVAL
	}
	HEAP32[key >> 2] = PTHREAD_SPECIFIC_NEXT_KEY;
	PTHREAD_SPECIFIC[PTHREAD_SPECIFIC_NEXT_KEY] = 0;
	PTHREAD_SPECIFIC_NEXT_KEY++;
	return 0
}

function _glClear(x0) {
	GLctx.clear(x0)
}

function _emscripten_set_socket_error_callback(userData, callback) {
	___set_network_callback("error", userData, callback)
}

function _glActiveTexture(x0) {
	GLctx.activeTexture(x0)
}

function _glEnableVertexAttribArray(index) {
	var cb = GL.currentContext.clientBuffers[index];
	cb.enabled = true;
	GLctx.enableVertexAttribArray(index)
}

function _glBindBuffer(target, buffer) {
	var bufferObj = buffer ? GL.buffers[buffer] : null;
	if (target == GLctx.ARRAY_BUFFER) {
		GL.currArrayBuffer = buffer
	} else if (target == GLctx.ELEMENT_ARRAY_BUFFER) {
		GL.currElementArrayBuffer = buffer
	}
	GLctx.bindBuffer(target, bufferObj)
}

function _glReadPixels(x, y, width, height, format, type, pixels) {
	var data = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
	if (!data.pixels) {
		GL.recordError(1280);
		return
	}
	GLctx.readPixels(x, y, width, height, format, type, data.pixels)
}

function _glfwSetInputMode(winid, mode, value) {
	GLFW.setInputMode(winid, mode, value)
}

function _glUniform4f(location, v0, v1, v2, v3) {
	location = GL.uniforms[location];
	GLctx.uniform4f(location, v0, v1, v2, v3)
}

function _glFramebufferTexture2D(target, attachment, textarget, texture, level) {
	GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level)
}

function _glUniformMatrix2fv(location, count, transpose, value) {
	location = GL.uniforms[location];
	var view;
	if (count === 1) {
		view = GL.miniTempBufferViews[3];
		for (var i = 0; i < 4; i++) {
			view[i] = HEAPF32[value + i * 4 >> 2]
		}
	} else {
		view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2)
	}
	GLctx.uniformMatrix2fv(location, transpose, view)
}
Module["_bitshift64Lshr"] = _bitshift64Lshr;

function _glUniform3fv(location, count, value) {
	location = GL.uniforms[location];
	var view;
	if (count === 1) {
		view = GL.miniTempBufferViews[2];
		view[0] = HEAPF32[value >> 2];
		view[1] = HEAPF32[value + 4 >> 2];
		view[2] = HEAPF32[value + 8 >> 2]
	} else {
		view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2)
	}
	GLctx.uniform3fv(location, view)
}

function _glBufferData(target, size, data, usage) {
	switch (usage) {
		case 35041:
		case 35042:
			usage = 35040;
			break;
		case 35045:
		case 35046:
			usage = 35044;
			break;
		case 35049:
		case 35050:
			usage = 35048;
			break
	}
	if (!data) {
		GLctx.bufferData(target, size, usage)
	} else {
		GLctx.bufferData(target, HEAPU8.subarray(data, data + size), usage)
	}
}

function _glfwCreateWindow(width, height, title, monitor, share) {
	return GLFW.createWindow(width, height, title, monitor, share)
}
Module["_testSetjmp"] = _testSetjmp;

function _longjmp(env, value) {
	asm["setThrew"](env, value || 1);
	throw "longjmp"
}

function _emscripten_longjmp(env, value) {
	_longjmp(env, value)
}

function _alGetSourcei(source, param, value) {
	if (!AL.currentContext) {
		return
	}
	var src = AL.currentContext.src[source];
	if (!src) {
		AL.currentContext.err = 40961;
		return
	}
	AL.updateSource(src);
	switch (param) {
		case 514:
			HEAP32[value >> 2] = src.panner ? 1 : 0;
			break;
		case 4097:
			HEAP32[value >> 2] = src.coneInnerAngle;
			break;
		case 4098:
			HEAP32[value >> 2] = src.coneOuterAngle;
			break;
		case 4103:
			HEAP32[value >> 2] = src.loop;
			break;
		case 4105:
			if (!src.queue.length) {
				HEAP32[value >> 2] = 0
			} else {
				var buffer = src.queue[src.buffersPlayed].buffer;
				for (var i = 0; i < AL.currentContext.buf.length; ++i) {
					if (buffer == AL.currentContext.buf[i]) {
						HEAP32[value >> 2] = i + 1;
						return
					}
				}
				HEAP32[value >> 2] = 0
			}
			break;
		case 4112:
			HEAP32[value >> 2] = src.state;
			break;
		case 4117:
			HEAP32[value >> 2] = src.queue.length;
			break;
		case 4118:
			if (src.loop) {
				HEAP32[value >> 2] = 0
			} else {
				HEAP32[value >> 2] = src.buffersPlayed
			}
			break;
		default:
			AL.currentContext.err = 40962;
			break
	}
}

function _pthread_cleanup_pop() {
	assert(_pthread_cleanup_push.level == __ATEXIT__.length, "cannot pop if something else added meanwhile!");
	__ATEXIT__.pop();
	_pthread_cleanup_push.level = __ATEXIT__.length
}

function ___cxa_find_matching_catch_2() {
	return ___cxa_find_matching_catch.apply(null, arguments)
}

function _alSourceUnqueueBuffers(source, count, buffers) {
	if (!AL.currentContext) {
		return
	}
	var src = AL.currentContext.src[source];
	if (!src) {
		AL.currentContext.err = 40961;
		return
	}
	if (count > src.buffersPlayed) {
		AL.currentContext.err = 40963;
		return
	}
	for (var i = 0; i < count; i++) {
		var entry = src.queue.shift();
		for (var j = 0; j < AL.currentContext.buf.length; j++) {
			var b = AL.currentContext.buf[j];
			if (b && b == entry.buffer) {
				HEAP32[buffers + i * 4 >> 2] = j + 1;
				break
			}
		}
		src.buffersPlayed--
	}
	AL.updateSource(src)
}

function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
	var cb = GL.currentContext.clientBuffers[index];
	if (!GL.currArrayBuffer) {
		cb.size = size;
		cb.type = type;
		cb.normalized = normalized;
		cb.stride = stride;
		cb.ptr = ptr;
		cb.clientside = true;
		return
	}
	cb.clientside = false;
	GLctx.vertexAttribPointer(index, size, type, normalized, stride, ptr)
}

function _alGenSources(count, sources) {
	if (!AL.currentContext) {
		return
	}
	for (var i = 0; i < count; ++i) {
		var gain = AL.currentContext.ctx.createGain();
		gain.connect(AL.currentContext.gain);
		AL.currentContext.src[AL.newSrcId] = {
			state: 4113,
			queue: [],
			loop: false,
			get refDistance() {
				return this._refDistance || 1
			},
			set refDistance(val) {
				this._refDistance = val;
				if (this.panner) this.panner.refDistance = val
			},
			get maxDistance() {
				return this._maxDistance || 1e4
			},
			set maxDistance(val) {
				this._maxDistance = val;
				if (this.panner) this.panner.maxDistance = val
			},
			get rolloffFactor() {
				return this._rolloffFactor || 1
			},
			set rolloffFactor(val) {
				this._rolloffFactor = val;
				if (this.panner) this.panner.rolloffFactor = val
			},
			get position() {
				return this._position || [0, 0, 0]
			},
			set position(val) {
				this._position = val;
				if (this.panner) this.panner.setPosition(val[0], val[1], val[2])
			},
			get velocity() {
				return this._velocity || [0, 0, 0]
			},
			set velocity(val) {
				this._velocity = val;
				if (this.panner) this.panner.setVelocity(val[0], val[1], val[2])
			},
			get direction() {
				return this._direction || [0, 0, 0]
			},
			set direction(val) {
				this._direction = val;
				if (this.panner) this.panner.setOrientation(val[0], val[1], val[2])
			},
			get coneOuterGain() {
				return this._coneOuterGain || 0
			},
			set coneOuterGain(val) {
				this._coneOuterGain = val;
				if (this.panner) this.panner.coneOuterGain = val
			},
			get coneInnerAngle() {
				return this._coneInnerAngle || 360
			},
			set coneInnerAngle(val) {
				this._coneInnerAngle = val;
				if (this.panner) this.panner.coneInnerAngle = val
			},
			get coneOuterAngle() {
				return this._coneOuterAngle || 360
			},
			set coneOuterAngle(val) {
				this._coneOuterAngle = val;
				if (this.panner) this.panner.coneOuterAngle = val
			},
			gain: gain,
			panner: null,
			buffersPlayed: 0,
			bufferPosition: 0
		};
		HEAP32[sources + i * 4 >> 2] = AL.newSrcId;
		AL.newSrcId++
	}
}

function _glGenFramebuffers(n, ids) {
	for (var i = 0; i < n; ++i) {
		var framebuffer = GLctx.createFramebuffer();
		if (!framebuffer) {
			GL.recordError(1282);
			while (i < n) HEAP32[ids + i++ * 4 >> 2] = 0;
			return
		}
		var id = GL.getNewId(GL.framebuffers);
		framebuffer.name = id;
		GL.framebuffers[id] = framebuffer;
		HEAP32[ids + i * 4 >> 2] = id
	}
}
var _llvm_pow_f64 = Math_pow;

function _sbrk(bytes) {
	var self = _sbrk;
	if (!self.called) {
		DYNAMICTOP = alignMemoryPage(DYNAMICTOP);
		self.called = true;
		assert(Runtime.dynamicAlloc);
		self.alloc = Runtime.dynamicAlloc;
		Runtime.dynamicAlloc = (function() {
			abort("cannot dynamically allocate, sbrk now has control")
		})
	}
	var ret = DYNAMICTOP;
	if (bytes != 0) {
		var success = self.alloc(bytes);
		if (!success) return -1 >>> 0
	}
	return ret
}
var _llvm_fabs_f32 = Math_abs;

function emscriptenWebGLGet(name_, p, type) {
	if (!p) {
		GL.recordError(1281);
		return
	}
	var ret = undefined;
	switch (name_) {
		case 36346:
			ret = 1;
			break;
		case 36344:
			if (type !== "Integer" && type !== "Integer64") {
				GL.recordError(1280)
			}
			return;
		case 36345:
			ret = 0;
			break;
		case 34466:
			var formats = GLctx.getParameter(34467);
			ret = formats.length;
			break;
		case 35738:
			ret = 5121;
			break;
		case 35739:
			ret = 6408;
			break
	}
	if (ret === undefined) {
		var result = GLctx.getParameter(name_);
		switch (typeof result) {
			case "number":
				ret = result;
				break;
			case "boolean":
				ret = result ? 1 : 0;
				break;
			case "string":
				GL.recordError(1280);
				return;
			case "object":
				if (result === null) {
					switch (name_) {
						case 34964:
						case 35725:
						case 34965:
						case 36006:
						case 36007:
						case 32873:
						case 34068: {
							ret = 0;
							break
						};
					default: {
						GL.recordError(1280);
						return
					}
					}
				} else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
					for (var i = 0; i < result.length; ++i) {
						switch (type) {
							case "Integer":
								HEAP32[p + i * 4 >> 2] = result[i];
								break;
							case "Float":
								HEAPF32[p + i * 4 >> 2] = result[i];
								break;
							case "Boolean":
								HEAP8[p + i >> 0] = result[i] ? 1 : 0;
								break;
							default:
								throw "internal glGet error, bad type: " + type
						}
					}
					return
				} else if (result instanceof WebGLBuffer || result instanceof WebGLProgram || result instanceof WebGLFramebuffer || result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
					ret = result.name | 0
				} else {
					GL.recordError(1280);
					return
				}
				break;
			default:
				GL.recordError(1280);
				return
		}
	}
	switch (type) {
		case "Integer64":
			tempI64 = [ret >>> 0, (tempDouble = ret, +Math_abs(tempDouble) >= +1 ? tempDouble > +0 ? (Math_min(+Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0 : 0)], HEAP32[p >> 2] = tempI64[0], HEAP32[p + 4 >> 2] = tempI64[1];
			break;
		case "Integer":
			HEAP32[p >> 2] = ret;
			break;
		case "Float":
			HEAPF32[p >> 2] = ret;
			break;
		case "Boolean":
			HEAP8[p >> 0] = ret ? 1 : 0;
			break;
		default:
			throw "internal glGet error, bad type: " + type
	}
}

function _glGetIntegerv(name_, p) {
	emscriptenWebGLGet(name_, p, "Integer")
}

function _alDeleteSources(count, sources) {
	if (!AL.currentContext) {
		return
	}
	for (var i = 0; i < count; ++i) {
		var sourceIdx = HEAP32[sources + i * 4 >> 2];
		delete AL.currentContext.src[sourceIdx]
	}
}
Module["_llvm_bswap_i32"] = _llvm_bswap_i32;

function _glfwSwapBuffers(winid) {
	GLFW.swapBuffers(winid)
}

function ___cxa_guard_release() {}

function _Mix_LoadMUS_RW() {
	return _Mix_LoadWAV_RW.apply(null, arguments)
}

function _Mix_LoadMUS(filename) {
	var rwops = _SDL_RWFromFile(filename);
	var result = _Mix_LoadMUS_RW(rwops);
	_SDL_FreeRW(rwops);
	return result
}

function _glfwSetKeyCallback(winid, cbfun) {
	GLFW.setKeyCallback(winid, cbfun)
}

function _glDisableVertexAttribArray(index) {
	var cb = GL.currentContext.clientBuffers[index];
	cb.enabled = false;
	GLctx.disableVertexAttribArray(index)
}

function _glfwRestoreWindow(winid) {
	GLFW.restoreWindow(winid)
}

function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
	var pixelData;
	if (pixels) {
		var data = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat);
		pixelData = data.pixels;
		internalFormat = data.internalFormat
	} else {
		pixelData = null
	}
	GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData)
}

function _sysconf(name) {
	switch (name) {
		case 30:
			return PAGE_SIZE;
		case 85:
			return totalMemory / PAGE_SIZE;
		case 132:
		case 133:
		case 12:
		case 137:
		case 138:
		case 15:
		case 235:
		case 16:
		case 17:
		case 18:
		case 19:
		case 20:
		case 149:
		case 13:
		case 10:
		case 236:
		case 153:
		case 9:
		case 21:
		case 22:
		case 159:
		case 154:
		case 14:
		case 77:
		case 78:
		case 139:
		case 80:
		case 81:
		case 82:
		case 68:
		case 67:
		case 164:
		case 11:
		case 29:
		case 47:
		case 48:
		case 95:
		case 52:
		case 51:
		case 46:
			return 200809;
		case 79:
			return 0;
		case 27:
		case 246:
		case 127:
		case 128:
		case 23:
		case 24:
		case 160:
		case 161:
		case 181:
		case 182:
		case 242:
		case 183:
		case 184:
		case 243:
		case 244:
		case 245:
		case 165:
		case 178:
		case 179:
		case 49:
		case 50:
		case 168:
		case 169:
		case 175:
		case 170:
		case 171:
		case 172:
		case 97:
		case 76:
		case 32:
		case 173:
		case 35:
			return -1;
		case 176:
		case 177:
		case 7:
		case 155:
		case 8:
		case 157:
		case 125:
		case 126:
		case 92:
		case 93:
		case 129:
		case 130:
		case 131:
		case 94:
		case 91:
			return 1;
		case 74:
		case 60:
		case 69:
		case 70:
		case 4:
			return 1024;
		case 31:
		case 42:
		case 72:
			return 32;
		case 87:
		case 26:
		case 33:
			return 2147483647;
		case 34:
		case 1:
			return 47839;
		case 38:
		case 36:
			return 99;
		case 43:
		case 37:
			return 2048;
		case 0:
			return 2097152;
		case 3:
			return 65536;
		case 28:
			return 32768;
		case 44:
			return 32767;
		case 75:
			return 16384;
		case 39:
			return 1e3;
		case 89:
			return 700;
		case 71:
			return 256;
		case 40:
			return 255;
		case 2:
			return 100;
		case 180:
			return 64;
		case 25:
			return 20;
		case 5:
			return 16;
		case 6:
			return 6;
		case 73:
			return 4;
		case 84: {
			if (typeof navigator === "object") return navigator["hardwareConcurrency"] || 1;
			return 1
		}
	}
	___setErrNo(ERRNO_CODES.EINVAL);
	return -1
}

function _glfwGetWindowSize(winid, width, height) {
	GLFW.getWindowSize(winid, width, height)
}

function _emscripten_async_wget2_data(url, request, param, arg, free, onload, onerror, onprogress) {
	var _url = Pointer_stringify(url);
	var _request = Pointer_stringify(request);
	var _param = Pointer_stringify(param);
	var http = new XMLHttpRequest;
	http.open(_request, _url, true);
	http.responseType = "arraybuffer";
	var handle = Browser.getNextWgetRequestHandle();
	http.onload = function http_onload(e) {
		if (http.status == 200 || _url.substr(0, 4).toLowerCase() != "http") {
			var byteArray = new Uint8Array(http.response);
			var buffer = _malloc(byteArray.length);
			HEAPU8.set(byteArray, buffer);
			if (onload) Runtime.dynCall("viiii", onload, [handle, arg, buffer, byteArray.length]);
			if (free) _free(buffer)
		} else {
			if (onerror) Runtime.dynCall("viiii", onerror, [handle, arg, http.status, http.statusText])
		}
		delete Browser.wgetRequests[handle]
	};
	http.onerror = function http_onerror(e) {
		if (onerror) {
			Runtime.dynCall("viiii", onerror, [handle, arg, http.status, http.statusText])
		}
		delete Browser.wgetRequests[handle]
	};
	http.onprogress = function http_onprogress(e) {
		if (onprogress) Runtime.dynCall("viiii", onprogress, [handle, arg, e.loaded, e.lengthComputable || e.lengthComputable === undefined ? e.total : 0])
	};
	http.onabort = function http_onabort(e) {
		delete Browser.wgetRequests[handle]
	};
	try {
		if (http.channel instanceof Ci.nsIHttpChannel) http.channel.redirectionLimit = 0
	} catch (ex) {}
	if (_request == "POST") {
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		http.send(_param)
	} else {
		http.send(null)
	}
	Browser.wgetRequests[handle] = http;
	return handle
}

function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
	var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
	if (log === null) log = "(unknown error)";
	log = log.substr(0, maxLength - 1);
	if (maxLength > 0 && infoLog) {
		writeStringToMemory(log, infoLog);
		if (length) HEAP32[length >> 2] = log.length
	} else {
		if (length) HEAP32[length >> 2] = 0
	}
}

function _glGetUniformLocation(program, name) {
	name = Pointer_stringify(name);
	var arrayOffset = 0;
	if (name.indexOf("]", name.length - 1) !== -1) {
		var ls = name.lastIndexOf("[");
		var arrayIndex = name.slice(ls + 1, -1);
		if (arrayIndex.length > 0) {
			arrayOffset = parseInt(arrayIndex);
			if (arrayOffset < 0) {
				return -1
			}
		}
		name = name.slice(0, ls)
	}
	var ptable = GL.programInfos[program];
	if (!ptable) {
		return -1
	}
	var utable = ptable.uniforms;
	var uniformInfo = utable[name];
	if (uniformInfo && arrayOffset < uniformInfo[0]) {
		return uniformInfo[1] + arrayOffset
	} else {
		return -1
	}
}

function _glfwSetWindowPos(winid, x, y) {
	GLFW.setWindowPos(winid, x, y)
}

function _abort() {
	Module["abort"]()
}

function _glUniform1fv(location, count, value) {
	location = GL.uniforms[location];
	var view;
	if (count === 1) {
		view = GL.miniTempBufferViews[0];
		view[0] = HEAPF32[value >> 2]
	} else {
		view = HEAPF32.subarray(value >> 2, value + count * 4 >> 2)
	}
	GLctx.uniform1fv(location, view)
}

function _glfwSetMouseButtonCallback(winid, cbfun) {
	GLFW.setMouseButtonCallback(winid, cbfun)
}

function _pthread_once(ptr, func) {
	if (!_pthread_once.seen) _pthread_once.seen = {};
	if (ptr in _pthread_once.seen) return;
	Runtime.dynCall("v", func);
	_pthread_once.seen[ptr] = 1
}

function _alSourcePause(source) {
	if (!AL.currentContext) {
		return
	}
	var src = AL.currentContext.src[source];
	if (!src) {
		AL.currentContext.err = 40961;
		return
	}
	AL.setSourceState(src, 4115)
}

function _alGenBuffers(count, buffers) {
	if (!AL.currentContext) {
		return
	}
	for (var i = 0; i < count; ++i) {
		AL.currentContext.buf.push(null);
		HEAP32[buffers + i * 4 >> 2] = AL.currentContext.buf.length
	}
}

function ___unlock() {}

function _glUniformMatrix3fv(location, count, transpose, value) {
	location = GL.uniforms[location];
	var view;
	if (count === 1) {
		view = GL.miniTempBufferViews[8];
		for (var i = 0; i < 9; i++) {
			view[i] = HEAPF32[value + i * 4 >> 2]
		}
	} else {
		view = HEAPF32.subarray(value >> 2, value + count * 36 >> 2)
	}
	GLctx.uniformMatrix3fv(location, transpose, view)
}

function _glEnable(x0) {
	GLctx.enable(x0)
}

function _emscripten_async_wget2(url, file, request, param, arg, onload, onerror, onprogress) {
	Module["noExitRuntime"] = true;
	var _url = Pointer_stringify(url);
	var _file = Pointer_stringify(file);
	var _request = Pointer_stringify(request);
	var _param = Pointer_stringify(param);
	var index = _file.lastIndexOf("/");
	var http = new XMLHttpRequest;
	http.open(_request, _url, true);
	http.responseType = "arraybuffer";
	var handle = Browser.getNextWgetRequestHandle();
	http.onload = function http_onload(e) {
		if (http.status == 200) {
			try {
				FS.unlink(_file)
			} catch (e) {}
			FS.createDataFile(_file.substr(0, index), _file.substr(index + 1), new Uint8Array(http.response), true, true);
			if (onload) {
				var stack = Runtime.stackSave();
				Runtime.dynCall("viii", onload, [handle, arg, allocate(intArrayFromString(_file), "i8", ALLOC_STACK)]);
				Runtime.stackRestore(stack)
			}
		} else {
			if (onerror) Runtime.dynCall("viii", onerror, [handle, arg, http.status])
		}
		delete Browser.wgetRequests[handle]
	};
	http.onerror = function http_onerror(e) {
		if (onerror) Runtime.dynCall("viii", onerror, [handle, arg, http.status]);
		delete Browser.wgetRequests[handle]
	};
	http.onprogress = function http_onprogress(e) {
		if (e.lengthComputable || e.lengthComputable === undefined && e.total != 0) {
			var percentComplete = e.loaded / e.total * 100;
			if (onprogress) Runtime.dynCall("viii", onprogress, [handle, arg, percentComplete])
		}
	};
	http.onabort = function http_onabort(e) {
		delete Browser.wgetRequests[handle]
	};
	try {
		if (http.channel instanceof Ci.nsIHttpChannel) http.channel.redirectionLimit = 0
	} catch (ex) {}
	if (_request == "POST") {
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		http.send(_param)
	} else {
		http.send(null)
	}
	Browser.wgetRequests[handle] = http;
	return handle
}

function _glGenBuffers(n, buffers) {
	for (var i = 0; i < n; i++) {
		var buffer = GLctx.createBuffer();
		if (!buffer) {
			GL.recordError(1282);
			while (i < n) HEAP32[buffers + i++ * 4 >> 2] = 0;
			return
		}
		var id = GL.getNewId(GL.buffers);
		buffer.name = id;
		GL.buffers[id] = buffer;
		HEAP32[buffers + i * 4 >> 2] = id
	}
}

function _glGetAttribLocation(program, name) {
	program = GL.programs[program];
	name = Pointer_stringify(name);
	return GLctx.getAttribLocation(program, name)
}

function _Mix_PlayingMusic() {
	return SDL.music.audio && !SDL.music.audio.paused ? 1 : 0
}

function _glfwWindowHint(target, hint) {
	GLFW.hints[target] = hint
}

function ___cxa_allocate_exception(size) {
	return _malloc(size)
}

function _glDeleteShader(id) {
	if (!id) return;
	var shader = GL.shaders[id];
	if (!shader) {
		GL.recordError(1281);
		return
	}
	GLctx.deleteShader(shader);
	GL.shaders[id] = null
}

function _glCreateProgram() {
	var id = GL.getNewId(GL.programs);
	var program = GLctx.createProgram();
	program.name = id;
	GL.programs[id] = program;
	return id
}

function ___cxa_pure_virtual() {
	ABORT = true;
	throw "Pure virtual function called!"
}

function ___syscall220(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var stream = SYSCALLS.getStreamFromFD(),
			dirp = SYSCALLS.get(),
			count = SYSCALLS.get();
		if (!stream.getdents) {
			stream.getdents = FS.readdir(stream.path)
		}
		var pos = 0;
		while (stream.getdents.length > 0 && pos + 268 < count) {
			var id;
			var type;
			var name = stream.getdents.pop();
			assert(name.length < 256);
			if (name[0] === ".") {
				id = 1;
				type = 4
			} else {
				var child = FS.lookupNode(stream.node, name);
				id = child.id;
				type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8
			}
			HEAP32[dirp + pos >> 2] = id;
			HEAP32[dirp + pos + 4 >> 2] = stream.position;
			HEAP16[dirp + pos + 8 >> 1] = 268;
			HEAP8[dirp + pos + 10 >> 0] = type;
			for (var i = 0; i < name.length; i++) {
				HEAP8[dirp + pos + (11 + i) >> 0] = name.charCodeAt(i)
			}
			HEAP8[dirp + pos + (11 + i) >> 0] = 0;
			pos += 268
		}
		return pos
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function _pthread_cleanup_push(routine, arg) {
	__ATEXIT__.push((function() {
		Runtime.dynCall("vi", routine, [arg])
	}));
	_pthread_cleanup_push.level = __ATEXIT__.length
}

function _pthread_getspecific(key) {
	return PTHREAD_SPECIFIC[key] || 0
}

function _glfwDestroyWindow(winid) {
	return GLFW.destroyWindow(winid)
}

function _glDepthMask(x0) {
	GLctx.depthMask(x0)
}

function _glfwSetCursorPos(winid, x, y) {
	GLFW.setCursorPos(winid, x, y)
}
var _llvm_fabs_f64 = Math_abs;

function _glPolygonOffset(x0, x1) {
	GLctx.polygonOffset(x0, x1)
}

function _glUniformMatrix4fv(location, count, transpose, value) {
	location = GL.uniforms[location];
	var view;
	if (count === 1) {
		view = GL.miniTempBufferViews[15];
		for (var i = 0; i < 16; i++) {
			view[i] = HEAPF32[value + i * 4 >> 2]
		}
	} else {
		view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2)
	}
	GLctx.uniformMatrix4fv(location, transpose, view)
}

function _alBufferData(buffer, format, data, size, freq) {
	if (!AL.currentContext) {
		return
	}
	if (buffer > AL.currentContext.buf.length) {
		return
	}
	var channels, bytes;
	switch (format) {
		case 4352:
			bytes = 1;
			channels = 1;
			break;
		case 4353:
			bytes = 2;
			channels = 1;
			break;
		case 4354:
			bytes = 1;
			channels = 2;
			break;
		case 4355:
			bytes = 2;
			channels = 2;
			break;
		case 65552:
			bytes = 4;
			channels = 1;
			break;
		case 65553:
			bytes = 4;
			channels = 2;
			break;
		default:
			return
	}
	try {
		AL.currentContext.buf[buffer - 1] = AL.currentContext.ctx.createBuffer(channels, size / (bytes * channels), freq);
		AL.currentContext.buf[buffer - 1].bytesPerSample = bytes
	} catch (e) {
		AL.currentContext.err = 40963;
		return
	}
	var buf = new Array(channels);
	for (var i = 0; i < channels; ++i) {
		buf[i] = AL.currentContext.buf[buffer - 1].getChannelData(i)
	}
	for (var i = 0; i < size / (bytes * channels); ++i) {
		for (var j = 0; j < channels; ++j) {
			switch (bytes) {
				case 1:
					var val = HEAP8[data + (i * channels + j) >> 0] & 255;
					buf[j][i] = -1 + val * (2 / 256);
					break;
				case 2:
					var val = HEAP16[data + 2 * (i * channels + j) >> 1];
					buf[j][i] = val / 32768;
					break;
				case 4:
					buf[j][i] = HEAPF32[data + 4 * (i * channels + j) >> 2];
					break
			}
		}
	}
}

function _glGetActiveUniform(program, index, bufSize, length, size, type, name) {
	program = GL.programs[program];
	var info = GLctx.getActiveUniform(program, index);
	if (!info) return;
	var infoname = info.name.slice(0, Math.max(0, bufSize - 1));
	if (bufSize > 0 && name) {
		writeStringToMemory(infoname, name);
		if (length) HEAP32[length >> 2] = infoname.length
	} else {
		if (length) HEAP32[length >> 2] = 0
	}
	if (size) HEAP32[size >> 2] = info.size;
	if (type) HEAP32[type >> 2] = info.type
}

function _glTexParameterf(x0, x1, x2) {
	GLctx.texParameterf(x0, x1, x2)
}
Module["_bitshift64Shl"] = _bitshift64Shl;

function _glTexParameteri(x0, x1, x2) {
	GLctx.texParameteri(x0, x1, x2)
}

function _glFrontFace(x0) {
	GLctx.frontFace(x0)
}
var SOCKFS = {
	mount: (function(mount) {
		Module["websocket"] = Module["websocket"] && "object" === typeof Module["websocket"] ? Module["websocket"] : {};
		Module["websocket"]._callbacks = {};
		Module["websocket"]["on"] = (function(event, callback) {
			if ("function" === typeof callback) {
				this._callbacks[event] = callback
			}
			return this
		});
		Module["websocket"].emit = (function(event, param) {
			if ("function" === typeof this._callbacks[event]) {
				this._callbacks[event].call(this, param)
			}
		});
		return FS.createNode(null, "/", 16384 | 511, 0)
	}),
	createSocket: (function(family, type, protocol) {
		var streaming = type == 1;
		if (protocol) {
			assert(streaming == (protocol == 6))
		}
		var sock = {
			family: family,
			type: type,
			protocol: protocol,
			server: null,
			error: null,
			peers: {},
			pending: [],
			recv_queue: [],
			sock_ops: SOCKFS.websocket_sock_ops
		};
		var name = SOCKFS.nextname();
		var node = FS.createNode(SOCKFS.root, name, 49152, 0);
		node.sock = sock;
		var stream = FS.createStream({
			path: name,
			node: node,
			flags: FS.modeStringToFlags("r+"),
			seekable: false,
			stream_ops: SOCKFS.stream_ops
		});
		sock.stream = stream;
		return sock
	}),
	getSocket: (function(fd) {
		var stream = FS.getStream(fd);
		if (!stream || !FS.isSocket(stream.node.mode)) {
			return null
		}
		return stream.node.sock
	}),
	stream_ops: {
		poll: (function(stream) {
			var sock = stream.node.sock;
			return sock.sock_ops.poll(sock)
		}),
		ioctl: (function(stream, request, varargs) {
			var sock = stream.node.sock;
			return sock.sock_ops.ioctl(sock, request, varargs)
		}),
		read: (function(stream, buffer, offset, length, position) {
			var sock = stream.node.sock;
			var msg = sock.sock_ops.recvmsg(sock, length);
			if (!msg) {
				return 0
			}
			buffer.set(msg.buffer, offset);
			return msg.buffer.length
		}),
		write: (function(stream, buffer, offset, length, position) {
			var sock = stream.node.sock;
			return sock.sock_ops.sendmsg(sock, buffer, offset, length)
		}),
		close: (function(stream) {
			var sock = stream.node.sock;
			sock.sock_ops.close(sock)
		})
	},
	nextname: (function() {
		if (!SOCKFS.nextname.current) {
			SOCKFS.nextname.current = 0
		}
		return "socket[" + SOCKFS.nextname.current++ + "]"
	}),
	websocket_sock_ops: {
		createPeer: (function(sock, addr, port) {
			var ws;
			if (typeof addr === "object") {
				ws = addr;
				addr = null;
				port = null
			}
			if (ws) {
				if (ws._socket) {
					addr = ws._socket.remoteAddress;
					port = ws._socket.remotePort
				} else {
					var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
					if (!result) {
						throw new Error("WebSocket URL must be in the format ws(s)://address:port")
					}
					addr = result[1];
					port = parseInt(result[2], 10)
				}
			} else {
				try {
					var runtimeConfig = Module["websocket"] && "object" === typeof Module["websocket"];
					var url = "ws:#".replace("#", "//");
					if (runtimeConfig) {
						if ("string" === typeof Module["websocket"]["url"]) {
							url = Module["websocket"]["url"]
						}
					}
					if (url === "ws://" || url === "wss://") {
						var parts = addr.split("/");
						url = url + parts[0] + ":" + port + "/" + parts.slice(1).join("/")
					}
					var subProtocols = "binary";
					if (runtimeConfig) {
						if ("string" === typeof Module["websocket"]["subprotocol"]) {
							subProtocols = Module["websocket"]["subprotocol"]
						}
					}
					subProtocols = subProtocols.replace(/^ +| +$/g, "").split(/ *, */);
					var opts = ENVIRONMENT_IS_NODE ? {
						"protocol": subProtocols.toString()
					} : subProtocols;
					var WebSocketConstructor;
					if (ENVIRONMENT_IS_NODE) {
						WebSocketConstructor = require("ws")
					} else if (ENVIRONMENT_IS_WEB) {
						WebSocketConstructor = window["WebSocket"]
					} else {
						WebSocketConstructor = WebSocket
					}
					ws = new WebSocketConstructor(url, opts);
					ws.binaryType = "arraybuffer"
				} catch (e) {
					throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH)
				}
			}
			var peer = {
				addr: addr,
				port: port,
				socket: ws,
				dgram_send_queue: []
			};
			SOCKFS.websocket_sock_ops.addPeer(sock, peer);
			SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
			if (sock.type === 2 && typeof sock.sport !== "undefined") {
				peer.dgram_send_queue.push(new Uint8Array([255, 255, 255, 255, "p".charCodeAt(0), "o".charCodeAt(0), "r".charCodeAt(0), "t".charCodeAt(0), (sock.sport & 65280) >> 8, sock.sport & 255]))
			}
			return peer
		}),
		getPeer: (function(sock, addr, port) {
			return sock.peers[addr + ":" + port]
		}),
		addPeer: (function(sock, peer) {
			sock.peers[peer.addr + ":" + peer.port] = peer
		}),
		removePeer: (function(sock, peer) {
			delete sock.peers[peer.addr + ":" + peer.port]
		}),
		handlePeerEvents: (function(sock, peer) {
			var first = true;
			var handleOpen = (function() {
				Module["websocket"].emit("open", sock.stream.fd);
				try {
					var queued = peer.dgram_send_queue.shift();
					while (queued) {
						peer.socket.send(queued);
						queued = peer.dgram_send_queue.shift()
					}
				} catch (e) {
					peer.socket.close()
				}
			});

			function handleMessage(data) {
				assert(typeof data !== "string" && data.byteLength !== undefined);
				data = new Uint8Array(data);
				var wasfirst = first;
				first = false;
				if (wasfirst && data.length === 10 && data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 && data[4] === "p".charCodeAt(0) && data[5] === "o".charCodeAt(0) && data[6] === "r".charCodeAt(0) && data[7] === "t".charCodeAt(0)) {
					var newport = data[8] << 8 | data[9];
					SOCKFS.websocket_sock_ops.removePeer(sock, peer);
					peer.port = newport;
					SOCKFS.websocket_sock_ops.addPeer(sock, peer);
					return
				}
				sock.recv_queue.push({
					addr: peer.addr,
					port: peer.port,
					data: data
				});
				Module["websocket"].emit("message", sock.stream.fd)
			}
			if (ENVIRONMENT_IS_NODE) {
				peer.socket.on("open", handleOpen);
				peer.socket.on("message", (function(data, flags) {
					if (!flags.binary) {
						return
					}
					handleMessage((new Uint8Array(data)).buffer)
				}));
				peer.socket.on("close", (function() {
					Module["websocket"].emit("close", sock.stream.fd)
				}));
				peer.socket.on("error", (function(error) {
					sock.error = ERRNO_CODES.ECONNREFUSED;
					Module["websocket"].emit("error", [sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused"])
				}))
			} else {
				peer.socket.onopen = handleOpen;
				peer.socket.onclose = (function() {
					Module["websocket"].emit("close", sock.stream.fd)
				});
				peer.socket.onmessage = function peer_socket_onmessage(event) {
					handleMessage(event.data)
				};
				peer.socket.onerror = (function(error) {
					sock.error = ERRNO_CODES.ECONNREFUSED;
					Module["websocket"].emit("error", [sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused"])
				})
			}
		}),
		poll: (function(sock) {
			if (sock.type === 1 && sock.server) {
				return sock.pending.length ? 64 | 1 : 0
			}
			var mask = 0;
			var dest = sock.type === 1 ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null;
			if (sock.recv_queue.length || !dest || dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
				mask |= 64 | 1
			}
			if (!dest || dest && dest.socket.readyState === dest.socket.OPEN) {
				mask |= 4
			}
			if (dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
				mask |= 16
			}
			return mask
		}),
		ioctl: (function(sock, request, arg) {
			switch (request) {
				case 21531:
					var bytes = 0;
					if (sock.recv_queue.length) {
						bytes = sock.recv_queue[0].data.length
					}
					HEAP32[arg >> 2] = bytes;
					return 0;
				default:
					return ERRNO_CODES.EINVAL
			}
		}),
		close: (function(sock) {
			if (sock.server) {
				try {
					sock.server.close()
				} catch (e) {}
				sock.server = null
			}
			var peers = Object.keys(sock.peers);
			for (var i = 0; i < peers.length; i++) {
				var peer = sock.peers[peers[i]];
				try {
					peer.socket.close()
				} catch (e) {}
				SOCKFS.websocket_sock_ops.removePeer(sock, peer)
			}
			return 0
		}),
		bind: (function(sock, addr, port) {
			if (typeof sock.saddr !== "undefined" || typeof sock.sport !== "undefined") {
				throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
			}
			sock.saddr = addr;
			sock.sport = port;
			if (sock.type === 2) {
				if (sock.server) {
					sock.server.close();
					sock.server = null
				}
				try {
					sock.sock_ops.listen(sock, 0)
				} catch (e) {
					if (!(e instanceof FS.ErrnoError)) throw e;
					if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e
				}
			}
		}),
		connect: (function(sock, addr, port) {
			if (sock.server) {
				throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)
			}
			if (typeof sock.daddr !== "undefined" && typeof sock.dport !== "undefined") {
				var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
				if (dest) {
					if (dest.socket.readyState === dest.socket.CONNECTING) {
						throw new FS.ErrnoError(ERRNO_CODES.EALREADY)
					} else {
						throw new FS.ErrnoError(ERRNO_CODES.EISCONN)
					}
				}
			}
			var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
			sock.daddr = peer.addr;
			sock.dport = peer.port;
			throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS)
		}),
		listen: (function(sock, backlog) {
			if (!ENVIRONMENT_IS_NODE) {
				throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)
			}
			if (sock.server) {
				throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
			}
			var WebSocketServer = require("ws").Server;
			var host = sock.saddr;
			sock.server = new WebSocketServer({
				host: host,
				port: sock.sport
			});
			Module["websocket"].emit("listen", sock.stream.fd);
			sock.server.on("connection", (function(ws) {
				if (sock.type === 1) {
					var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
					var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
					newsock.daddr = peer.addr;
					newsock.dport = peer.port;
					sock.pending.push(newsock);
					Module["websocket"].emit("connection", newsock.stream.fd)
				} else {
					SOCKFS.websocket_sock_ops.createPeer(sock, ws);
					Module["websocket"].emit("connection", sock.stream.fd)
				}
			}));
			sock.server.on("closed", (function() {
				Module["websocket"].emit("close", sock.stream.fd);
				sock.server = null
			}));
			sock.server.on("error", (function(error) {
				sock.error = ERRNO_CODES.EHOSTUNREACH;
				Module["websocket"].emit("error", [sock.stream.fd, sock.error, "EHOSTUNREACH: Host is unreachable"])
			}))
		}),
		accept: (function(listensock) {
			if (!listensock.server) {
				throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
			}
			var newsock = listensock.pending.shift();
			newsock.stream.flags = listensock.stream.flags;
			return newsock
		}),
		getname: (function(sock, peer) {
			var addr, port;
			if (peer) {
				if (sock.daddr === undefined || sock.dport === undefined) {
					throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN)
				}
				addr = sock.daddr;
				port = sock.dport
			} else {
				addr = sock.saddr || 0;
				port = sock.sport || 0
			}
			return {
				addr: addr,
				port: port
			}
		}),
		sendmsg: (function(sock, buffer, offset, length, addr, port) {
			if (sock.type === 2) {
				if (addr === undefined || port === undefined) {
					addr = sock.daddr;
					port = sock.dport
				}
				if (addr === undefined || port === undefined) {
					throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ)
				}
			} else {
				addr = sock.daddr;
				port = sock.dport
			}
			var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
			if (sock.type === 1) {
				if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
					throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN)
				} else if (dest.socket.readyState === dest.socket.CONNECTING) {
					throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
				}
			}
			var data;
			if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
				data = buffer.slice(offset, offset + length)
			} else {
				data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length)
			}
			if (sock.type === 2) {
				if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
					if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
						dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port)
					}
					dest.dgram_send_queue.push(data);
					return length
				}
			}
			try {
				dest.socket.send(data);
				return length
			} catch (e) {
				throw new FS.ErrnoError(ERRNO_CODES.EINVAL)
			}
		}),
		recvmsg: (function(sock, length) {
			if (sock.type === 1 && sock.server) {
				throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN)
			}
			var queued = sock.recv_queue.shift();
			if (!queued) {
				if (sock.type === 1) {
					var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
					if (!dest) {
						throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN)
					} else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
						return null
					} else {
						throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
					}
				} else {
					throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)
				}
			}
			var queuedLength = queued.data.byteLength || queued.data.length;
			var queuedOffset = queued.data.byteOffset || 0;
			var queuedBuffer = queued.data.buffer || queued.data;
			var bytesRead = Math.min(length, queuedLength);
			var res = {
				buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
				addr: queued.addr,
				port: queued.port
			};
			if (sock.type === 1 && bytesRead < queuedLength) {
				var bytesRemaining = queuedLength - bytesRead;
				queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
				sock.recv_queue.unshift(queued)
			}
			return res
		})
	}
};
var _htons = undefined;
Module["_htons"] = _htons;

function __inet_pton6_raw(str) {
	var words;
	var w, offset, z;
	var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
	var parts = [];
	if (!valid6regx.test(str)) {
		return null
	}
	if (str === "::") {
		return [0, 0, 0, 0, 0, 0, 0, 0]
	}
	if (str.indexOf("::") === 0) {
		str = str.replace("::", "Z:")
	} else {
		str = str.replace("::", ":Z:")
	}
	if (str.indexOf(".") > 0) {
		str = str.replace(new RegExp("[.]", "g"), ":");
		words = str.split(":");
		words[words.length - 4] = parseInt(words[words.length - 4]) + parseInt(words[words.length - 3]) * 256;
		words[words.length - 3] = parseInt(words[words.length - 2]) + parseInt(words[words.length - 1]) * 256;
		words = words.slice(0, words.length - 2)
	} else {
		words = str.split(":")
	}
	offset = 0;
	z = 0;
	for (w = 0; w < words.length; w++) {
		if (typeof words[w] === "string") {
			if (words[w] === "Z") {
				for (z = 0; z < 8 - words.length + 1; z++) {
					parts[w + z] = 0
				}
				offset = z - 1
			} else {
				parts[w + offset] = _htons(parseInt(words[w], 16))
			}
		} else {
			parts[w + offset] = words[w]
		}
	}
	return [parts[1] << 16 | parts[0], parts[3] << 16 | parts[2], parts[5] << 16 | parts[4], parts[7] << 16 | parts[6]]
}
var DNS = {
	address_map: {
		id: 1,
		addrs: {},
		names: {}
	},
	lookup_name: (function(name) {
		var res = __inet_pton4_raw(name);
		if (res !== null) {
			return name
		}
		res = __inet_pton6_raw(name);
		if (res !== null) {
			return name
		}
		var addr;
		if (DNS.address_map.addrs[name]) {
			addr = DNS.address_map.addrs[name]
		} else {
			var id = DNS.address_map.id++;
			assert(id < 65535, "exceeded max address mappings of 65535");
			addr = "172.29." + (id & 255) + "." + (id & 65280);
			DNS.address_map.names[addr] = name;
			DNS.address_map.addrs[name] = addr
		}
		return addr
	}),
	lookup_addr: (function(addr) {
		if (DNS.address_map.names[addr]) {
			return DNS.address_map.names[addr]
		}
		return null
	})
};
var Sockets = {
	BUFFER_SIZE: 10240,
	MAX_BUFFER_SIZE: 10485760,
	nextFd: 1,
	fds: {},
	nextport: 1,
	maxport: 65535,
	peer: null,
	connections: {},
	portmap: {},
	localAddr: 4261412874,
	addrPool: [33554442, 50331658, 67108874, 83886090, 100663306, 117440522, 134217738, 150994954, 167772170, 184549386, 201326602, 218103818, 234881034]
};

function __inet_ntop4_raw(addr) {
	return (addr & 255) + "." + (addr >> 8 & 255) + "." + (addr >> 16 & 255) + "." + (addr >> 24 & 255)
}
var _ntohs = undefined;
Module["_ntohs"] = _ntohs;

function __inet_ntop6_raw(ints) {
	var str = "";
	var word = 0;
	var longest = 0;
	var lastzero = 0;
	var zstart = 0;
	var len = 0;
	var i = 0;
	var parts = [ints[0] & 65535, ints[0] >> 16, ints[1] & 65535, ints[1] >> 16, ints[2] & 65535, ints[2] >> 16, ints[3] & 65535, ints[3] >> 16];
	var hasipv4 = true;
	var v4part = "";
	for (i = 0; i < 5; i++) {
		if (parts[i] !== 0) {
			hasipv4 = false;
			break
		}
	}
	if (hasipv4) {
		v4part = __inet_ntop4_raw(parts[6] | parts[7] << 16);
		if (parts[5] === -1) {
			str = "::ffff:";
			str += v4part;
			return str
		}
		if (parts[5] === 0) {
			str = "::";
			if (v4part === "0.0.0.0") v4part = "";
			if (v4part === "0.0.0.1") v4part = "1";
			str += v4part;
			return str
		}
	}
	for (word = 0; word < 8; word++) {
		if (parts[word] === 0) {
			if (word - lastzero > 1) {
				len = 0
			}
			lastzero = word;
			len++
		}
		if (len > longest) {
			longest = len;
			zstart = word - longest + 1
		}
	}
	for (word = 0; word < 8; word++) {
		if (longest > 1) {
			if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
				if (word === zstart) {
					str += ":";
					if (zstart === 0) str += ":"
				}
				continue
			}
		}
		str += Number(_ntohs(parts[word] & 65535)).toString(16);
		str += word < 7 ? ":" : ""
	}
	return str
}

function __read_sockaddr(sa, salen) {
	var family = HEAP16[sa >> 1];
	var port = _ntohs(HEAP16[sa + 2 >> 1]);
	var addr;
	switch (family) {
		case 2:
			if (salen !== 16) {
				return {
					errno: ERRNO_CODES.EINVAL
				}
			}
			addr = HEAP32[sa + 4 >> 2];
			addr = __inet_ntop4_raw(addr);
			break;
		case 10:
			if (salen !== 28) {
				return {
					errno: ERRNO_CODES.EINVAL
				}
			}
			addr = [HEAP32[sa + 8 >> 2], HEAP32[sa + 12 >> 2], HEAP32[sa + 16 >> 2], HEAP32[sa + 20 >> 2]];
			addr = __inet_ntop6_raw(addr);
			break;
		default:
			return {
				errno: ERRNO_CODES.EAFNOSUPPORT
			}
	}
	return {
		family: family,
		addr: addr,
		port: port
	}
}

function __write_sockaddr(sa, family, addr, port) {
	switch (family) {
		case 2:
			addr = __inet_pton4_raw(addr);
			HEAP16[sa >> 1] = family;
			HEAP32[sa + 4 >> 2] = addr;
			HEAP16[sa + 2 >> 1] = _htons(port);
			break;
		case 10:
			addr = __inet_pton6_raw(addr);
			HEAP32[sa >> 2] = family;
			HEAP32[sa + 8 >> 2] = addr[0];
			HEAP32[sa + 12 >> 2] = addr[1];
			HEAP32[sa + 16 >> 2] = addr[2];
			HEAP32[sa + 20 >> 2] = addr[3];
			HEAP16[sa + 2 >> 1] = _htons(port);
			HEAP32[sa + 4 >> 2] = 0;
			HEAP32[sa + 24 >> 2] = 0;
			break;
		default:
			return {
				errno: ERRNO_CODES.EAFNOSUPPORT
			}
	}
	return {}
}

function ___syscall102(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var call = SYSCALLS.get(),
			socketvararg = SYSCALLS.get();
		SYSCALLS.varargs = socketvararg;
		switch (call) {
			case 1: {
				var domain = SYSCALLS.get(),
					type = SYSCALLS.get(),
					protocol = SYSCALLS.get();
				var sock = SOCKFS.createSocket(domain, type, protocol);
				assert(sock.stream.fd < 64);
				return sock.stream.fd
			};
		case 2: {
			var sock = SYSCALLS.getSocketFromFD(),
				info = SYSCALLS.getSocketAddress();
			sock.sock_ops.bind(sock, info.addr, info.port);
			return 0
		};
		case 3: {
			var sock = SYSCALLS.getSocketFromFD(),
				info = SYSCALLS.getSocketAddress();
			sock.sock_ops.connect(sock, info.addr, info.port);
			return 0
		};
		case 4: {
			var sock = SYSCALLS.getSocketFromFD(),
				backlog = SYSCALLS.get();
			sock.sock_ops.listen(sock, backlog);
			return 0
		};
		case 5: {
			var sock = SYSCALLS.getSocketFromFD(),
				addr = SYSCALLS.get(),
				addrlen = SYSCALLS.get();
			var newsock = sock.sock_ops.accept(sock);
			if (addr) {
				var res = __write_sockaddr(addr, newsock.family, DNS.lookup_name(newsock.daddr), newsock.dport);
				assert(!res.errno)
			}
			return newsock.stream.fd
		};
		case 6: {
			var sock = SYSCALLS.getSocketFromFD(),
				addr = SYSCALLS.get(),
				addrlen = SYSCALLS.get();
			var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(sock.saddr || "0.0.0.0"), sock.sport);
			assert(!res.errno);
			return 0
		};
		case 7: {
			var sock = SYSCALLS.getSocketFromFD(),
				addr = SYSCALLS.get(),
				addrlen = SYSCALLS.get();
			if (!sock.daddr) {
				return -ERRNO_CODES.ENOTCONN
			}
			var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(sock.daddr), sock.dport);
			assert(!res.errno);
			return 0
		};
		case 11: {
			var sock = SYSCALLS.getSocketFromFD(),
				message = SYSCALLS.get(),
				length = SYSCALLS.get(),
				flags = SYSCALLS.get(),
				dest = SYSCALLS.getSocketAddress(true);
			if (!dest) {
				return FS.write(sock.stream, HEAP8, message, length)
			} else {
				return sock.sock_ops.sendmsg(sock, HEAP8, message, length, dest.addr, dest.port)
			}
		};
		case 12: {
			var sock = SYSCALLS.getSocketFromFD(),
				buf = SYSCALLS.get(),
				len = SYSCALLS.get(),
				flags = SYSCALLS.get(),
				addr = SYSCALLS.get(),
				addrlen = SYSCALLS.get();
			var msg = sock.sock_ops.recvmsg(sock, len);
			if (!msg) return 0;
			if (addr) {
				var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(msg.addr), msg.port);
				assert(!res.errno)
			}
			HEAPU8.set(msg.buffer, buf);
			return msg.buffer.byteLength
		};
		case 14: {
			return -ERRNO_CODES.ENOPROTOOPT
		};
		case 15: {
			var sock = SYSCALLS.getSocketFromFD(),
				level = SYSCALLS.get(),
				optname = SYSCALLS.get(),
				optval = SYSCALLS.get(),
				optlen = SYSCALLS.get();
			if (level === 1) {
				if (optname === 4) {
					HEAP32[optval >> 2] = sock.error;
					HEAP32[optlen >> 2] = 4;
					sock.error = null;
					return 0
				}
			}
			return -ERRNO_CODES.ENOPROTOOPT
		};
		case 16: {
			var sock = SYSCALLS.getSocketFromFD(),
				message = SYSCALLS.get(),
				flags = SYSCALLS.get();
			var iov = HEAP32[message + 8 >> 2];
			var num = HEAP32[message + 12 >> 2];
			var addr, port;
			var name = HEAP32[message >> 2];
			var namelen = HEAP32[message + 4 >> 2];
			if (name) {
				var info = __read_sockaddr(name, namelen);
				if (info.errno) return -info.errno;
				port = info.port;
				addr = DNS.lookup_addr(info.addr) || info.addr
			}
			var total = 0;
			for (var i = 0; i < num; i++) {
				total += HEAP32[iov + (8 * i + 4) >> 2]
			}
			var view = new Uint8Array(total);
			var offset = 0;
			for (var i = 0; i < num; i++) {
				var iovbase = HEAP32[iov + (8 * i + 0) >> 2];
				var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
				for (var j = 0; j < iovlen; j++) {
					view[offset++] = HEAP8[iovbase + j >> 0]
				}
			}
			return sock.sock_ops.sendmsg(sock, view, 0, total, addr, port)
		};
		case 17: {
			var sock = SYSCALLS.getSocketFromFD(),
				message = SYSCALLS.get(),
				flags = SYSCALLS.get();
			var iov = HEAP32[message + 8 >> 2];
			var num = HEAP32[message + 12 >> 2];
			var total = 0;
			for (var i = 0; i < num; i++) {
				total += HEAP32[iov + (8 * i + 4) >> 2]
			}
			var msg = sock.sock_ops.recvmsg(sock, total);
			if (!msg) return 0;
			var name = HEAP32[message >> 2];
			if (name) {
				var res = __write_sockaddr(name, sock.family, DNS.lookup_name(msg.addr), msg.port);
				assert(!res.errno)
			}
			var bytesRead = 0;
			var bytesRemaining = msg.buffer.byteLength;
			for (var i = 0; bytesRemaining > 0 && i < num; i++) {
				var iovbase = HEAP32[iov + (8 * i + 0) >> 2];
				var iovlen = HEAP32[iov + (8 * i + 4) >> 2];
				if (!iovlen) {
					continue
				}
				var length = Math.min(iovlen, bytesRemaining);
				var buf = msg.buffer.subarray(bytesRead, bytesRead + length);
				HEAPU8.set(buf, iovbase + bytesRead);
				bytesRead += length;
				bytesRemaining -= length
			}
			return bytesRead
		};
		default:
			abort("unsupported socketcall syscall " + call)
		}
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function _glDepthRangef(x0, x1) {
	GLctx.depthRange(x0, x1)
}

function _glDeleteBuffers(n, buffers) {
	for (var i = 0; i < n; i++) {
		var id = HEAP32[buffers + i * 4 >> 2];
		var buffer = GL.buffers[id];
		if (!buffer) continue;
		GLctx.deleteBuffer(buffer);
		buffer.name = 0;
		GL.buffers[id] = null;
		if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
		if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0
	}
}

function _glScissor(x0, x1, x2, x3) {
	GLctx.scissor(x0, x1, x2, x3)
}

function _glPixelStorei(pname, param) {
	if (pname == 3333) {
		GL.packAlignment = param
	} else if (pname == 3317) {
		GL.unpackAlignment = param
	}
	GLctx.pixelStorei(pname, param)
}

function _time(ptr) {
	var ret = Date.now() / 1e3 | 0;
	if (ptr) {
		HEAP32[ptr >> 2] = ret
	}
	return ret
}

function _pthread_self() {
	return 0
}

function ___syscall145(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var stream = SYSCALLS.getStreamFromFD(),
			iov = SYSCALLS.get(),
			iovcnt = SYSCALLS.get();
		return SYSCALLS.doReadv(stream, iov, iovcnt)
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function ___syscall221(which, varargs) {
	SYSCALLS.varargs = varargs;
	try {
		var stream = SYSCALLS.getStreamFromFD(),
			cmd = SYSCALLS.get();
		switch (cmd) {
			case 0: {
				var arg = SYSCALLS.get();
				if (arg < 0) {
					return -ERRNO_CODES.EINVAL
				}
				var newStream;
				newStream = FS.open(stream.path, stream.flags, 0, arg);
				return newStream.fd
			};
		case 1:
		case 2:
			return 0;
		case 3:
			return stream.flags;
		case 4: {
			var arg = SYSCALLS.get();
			stream.flags |= arg;
			return 0
		};
		case 12:
		case 12: {
			var arg = SYSCALLS.get();
			var offset = 0;
			HEAP16[arg + offset >> 1] = 2;
			return 0
		};
		case 13:
		case 14:
		case 13:
		case 14:
			return 0;
		case 16:
		case 8:
			return -ERRNO_CODES.EINVAL;
		case 9:
			___setErrNo(ERRNO_CODES.EINVAL);
			return -1;
		default: {
			return -ERRNO_CODES.EINVAL
		}
		}
	} catch (e) {
		if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
		return -e.errno
	}
}

function ___cxa_find_matching_catch_3() {
	return ___cxa_find_matching_catch.apply(null, arguments)
}
var ___dso_handle = STATICTOP;
STATICTOP += 16;
FS.staticInit();
__ATINIT__.unshift((function() {
	if (!Module["noFSInit"] && !FS.init.initialized) FS.init()
}));
__ATMAIN__.push((function() {
	FS.ignorePermissions = false
}));
__ATEXIT__.push((function() {
	FS.quit()
}));
Module["FS_createFolder"] = FS.createFolder;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createLink"] = FS.createLink;
Module["FS_createDevice"] = FS.createDevice;
Module["FS_unlink"] = FS.unlink;
__ATINIT__.unshift((function() {
	TTY.init()
}));
__ATEXIT__.push((function() {
	TTY.shutdown()
}));
if (ENVIRONMENT_IS_NODE) {
	var fs = require("fs");
	var NODEJS_PATH = require("path");
	NODEFS.staticInit()
}
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) {
	Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice)
};
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
	Browser.requestAnimationFrame(func)
};
Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
	Browser.setCanvasSize(width, height, noUpdates)
};
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
	Browser.mainLoop.pause()
};
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
	Browser.mainLoop.resume()
};
Module["getUserMedia"] = function Module_getUserMedia() {
	Browser.getUserMedia()
};
Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
	return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes)
};
___buildEnvironment(ENV);
var GLctx;
GL.init();
__ATINIT__.push((function() {
	SOCKFS.root = FS.mount(SOCKFS, {}, null)
}));
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true;
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
var cttz_i8 = allocate([8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0], "i8", ALLOC_DYNAMIC);

function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
	try {
		return Module["dynCall_iiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viiiii(index, a1, a2, a3, a4, a5) {
	try {
		Module["dynCall_viiiii"](index, a1, a2, a3, a4, a5)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vd(index, a1) {
	try {
		Module["dynCall_vd"](index, a1)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vid(index, a1, a2) {
	try {
		Module["dynCall_vid"](index, a1, a2)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vi(index, a1) {
	try {
		Module["dynCall_vi"](index, a1)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viidii(index, a1, a2, a3, a4, a5) {
	try {
		Module["dynCall_viidii"](index, a1, a2, a3, a4, a5)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vii(index, a1, a2) {
	try {
		Module["dynCall_vii"](index, a1, a2)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
	try {
		return Module["dynCall_iiiiiii"](index, a1, a2, a3, a4, a5, a6)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_ii(index, a1) {
	try {
		return Module["dynCall_ii"](index, a1)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viidiiii(index, a1, a2, a3, a4, a5, a6, a7) {
	try {
		Module["dynCall_viidiiii"](index, a1, a2, a3, a4, a5, a6, a7)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viidd(index, a1, a2, a3, a4) {
	try {
		Module["dynCall_viidd"](index, a1, a2, a3, a4)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viidi(index, a1, a2, a3, a4) {
	try {
		Module["dynCall_viidi"](index, a1, a2, a3, a4)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viiidddd(index, a1, a2, a3, a4, a5, a6, a7) {
	try {
		Module["dynCall_viiidddd"](index, a1, a2, a3, a4, a5, a6, a7)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_id(index, a1) {
	try {
		return Module["dynCall_id"](index, a1)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vidii(index, a1, a2, a3, a4) {
	try {
		Module["dynCall_vidii"](index, a1, a2, a3, a4)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viddd(index, a1, a2, a3, a4) {
	try {
		Module["dynCall_viddd"](index, a1, a2, a3, a4)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_iiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
	try {
		return Module["dynCall_iiiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vidi(index, a1, a2, a3) {
	try {
		Module["dynCall_vidi"](index, a1, a2, a3)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viddi(index, a1, a2, a3, a4) {
	try {
		Module["dynCall_viddi"](index, a1, a2, a3, a4)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vidd(index, a1, a2, a3) {
	try {
		Module["dynCall_vidd"](index, a1, a2, a3)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_iiii(index, a1, a2, a3) {
	try {
		return Module["dynCall_iiii"](index, a1, a2, a3)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viiiiii(index, a1, a2, a3, a4, a5, a6) {
	try {
		Module["dynCall_viiiiii"](index, a1, a2, a3, a4, a5, a6)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_iiid(index, a1, a2, a3) {
	try {
		return Module["dynCall_iiid"](index, a1, a2, a3)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viii(index, a1, a2, a3) {
	try {
		Module["dynCall_viii"](index, a1, a2, a3)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viid(index, a1, a2, a3) {
	try {
		Module["dynCall_viid"](index, a1, a2, a3)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viddddd(index, a1, a2, a3, a4, a5, a6) {
	try {
		Module["dynCall_viddddd"](index, a1, a2, a3, a4, a5, a6)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_di(index, a1) {
	try {
		return Module["dynCall_di"](index, a1)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_iiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
	try {
		return Module["dynCall_iiiiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_dd(index, a1) {
	try {
		return Module["dynCall_dd"](index, a1)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vidddd(index, a1, a2, a3, a4, a5) {
	try {
		Module["dynCall_vidddd"](index, a1, a2, a3, a4, a5)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_iid(index, a1, a2) {
	try {
		return Module["dynCall_iid"](index, a1, a2)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
	try {
		Module["dynCall_viiiiiii"](index, a1, a2, a3, a4, a5, a6, a7)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
	try {
		Module["dynCall_viiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8, a9)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_iii(index, a1, a2) {
	try {
		return Module["dynCall_iii"](index, a1, a2)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
	try {
		return Module["dynCall_iiiiii"](index, a1, a2, a3, a4, a5)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_dii(index, a1, a2) {
	try {
		return Module["dynCall_dii"](index, a1, a2)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vidddddd(index, a1, a2, a3, a4, a5, a6, a7) {
	try {
		Module["dynCall_vidddddd"](index, a1, a2, a3, a4, a5, a6, a7)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_d(index) {
	try {
		return Module["dynCall_d"](index)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_did(index, a1, a2) {
	try {
		return Module["dynCall_did"](index, a1, a2)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vidddddi(index, a1, a2, a3, a4, a5, a6, a7) {
	try {
		Module["dynCall_vidddddi"](index, a1, a2, a3, a4, a5, a6, a7)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_iiiii(index, a1, a2, a3, a4) {
	try {
		return Module["dynCall_iiiii"](index, a1, a2, a3, a4)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_i(index) {
	try {
		return Module["dynCall_i"](index)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vdddd(index, a1, a2, a3, a4) {
	try {
		Module["dynCall_vdddd"](index, a1, a2, a3, a4)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_vdd(index, a1, a2) {
	try {
		Module["dynCall_vdd"](index, a1, a2)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_v(index) {
	try {
		Module["dynCall_v"](index)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_iiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8) {
	try {
		return Module["dynCall_iiiiiiiii"](index, a1, a2, a3, a4, a5, a6, a7, a8)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_viiii(index, a1, a2, a3, a4) {
	try {
		Module["dynCall_viiii"](index, a1, a2, a3, a4)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}

function invoke_diiiid(index, a1, a2, a3, a4, a5) {
	try {
		return Module["dynCall_diiiid"](index, a1, a2, a3, a4, a5)
	} catch (e) {
		if (typeof e !== "number" && e !== "longjmp") throw e;
		asm["setThrew"](1, 0)
	}
}
Module.asmGlobalArg = {
	"Math": Math,
	"Int8Array": Int8Array,
	"Int16Array": Int16Array,
	"Int32Array": Int32Array,
	"Uint8Array": Uint8Array,
	"Uint16Array": Uint16Array,
	"Uint32Array": Uint32Array,
	"Float32Array": Float32Array,
	"Float64Array": Float64Array,
	"NaN": NaN,
	"Infinity": Infinity
};
Module.asmLibraryArg = {
	"abort": abort,
	"assert": assert,
	"invoke_iiiiiiii": invoke_iiiiiiii,
	"invoke_viiiii": invoke_viiiii,
	"invoke_vd": invoke_vd,
	"invoke_vid": invoke_vid,
	"invoke_vi": invoke_vi,
	"invoke_viidii": invoke_viidii,
	"invoke_vii": invoke_vii,
	"invoke_iiiiiii": invoke_iiiiiii,
	"invoke_ii": invoke_ii,
	"invoke_viidiiii": invoke_viidiiii,
	"invoke_viidd": invoke_viidd,
	"invoke_viidi": invoke_viidi,
	"invoke_viiidddd": invoke_viiidddd,
	"invoke_id": invoke_id,
	"invoke_vidii": invoke_vidii,
	"invoke_viddd": invoke_viddd,
	"invoke_iiiiiiiiii": invoke_iiiiiiiiii,
	"invoke_vidi": invoke_vidi,
	"invoke_viddi": invoke_viddi,
	"invoke_vidd": invoke_vidd,
	"invoke_iiii": invoke_iiii,
	"invoke_viiiiii": invoke_viiiiii,
	"invoke_iiid": invoke_iiid,
	"invoke_viii": invoke_viii,
	"invoke_viid": invoke_viid,
	"invoke_viddddd": invoke_viddddd,
	"invoke_di": invoke_di,
	"invoke_iiiiiiiiiii": invoke_iiiiiiiiiii,
	"invoke_dd": invoke_dd,
	"invoke_vidddd": invoke_vidddd,
	"invoke_iid": invoke_iid,
	"invoke_viiiiiii": invoke_viiiiiii,
	"invoke_viiiiiiiii": invoke_viiiiiiiii,
	"invoke_iii": invoke_iii,
	"invoke_iiiiii": invoke_iiiiii,
	"invoke_dii": invoke_dii,
	"invoke_vidddddd": invoke_vidddddd,
	"invoke_d": invoke_d,
	"invoke_did": invoke_did,
	"invoke_vidddddi": invoke_vidddddi,
	"invoke_iiiii": invoke_iiiii,
	"invoke_i": invoke_i,
	"invoke_vdddd": invoke_vdddd,
	"invoke_vdd": invoke_vdd,
	"invoke_v": invoke_v,
	"invoke_iiiiiiiii": invoke_iiiiiiiii,
	"invoke_viiii": invoke_viiii,
	"invoke_diiiid": invoke_diiiid,
	"_glUseProgram": _glUseProgram,
	"___syscall220": ___syscall220,
	"_glCullFace": _glCullFace,
	"_glUniformMatrix3fv": _glUniformMatrix3fv,
	"__inet_ntop6_raw": __inet_ntop6_raw,
	"_glUniformMatrix2fv": _glUniformMatrix2fv,
	"_pthread_key_create": _pthread_key_create,
	"_glUniformMatrix4fv": _glUniformMatrix4fv,
	"_glClearColor": _glClearColor,
	"___cxa_guard_acquire": ___cxa_guard_acquire,
	"_SDL_RWFromFile": _SDL_RWFromFile,
	"_glUniform2fv": _glUniform2fv,
	"_alBufferData": _alBufferData,
	"___assert_fail": ___assert_fail,
	"_glDeleteProgram": _glDeleteProgram,
	"__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv,
	"_longjmp": _longjmp,
	"_glBindBuffer": _glBindBuffer,
	"_glfwCreateWindow": _glfwCreateWindow,
	"_glGetShaderInfoLog": _glGetShaderInfoLog,
	"_clock_gettime": _clock_gettime,
	"_emscripten_set_touchmove_callback": _emscripten_set_touchmove_callback,
	"_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing,
	"_emscripten_asm_const_id": _emscripten_asm_const_id,
	"_sbrk": _sbrk,
	"_glGetAttribLocation": _glGetAttribLocation,
	"_glDisableVertexAttribArray": _glDisableVertexAttribArray,
	"_Mix_PlayChannel": _Mix_PlayChannel,
	"_TTF_RenderText_Solid": _TTF_RenderText_Solid,
	"_glPolygonOffset": _glPolygonOffset,
	"_sysconf": _sysconf,
	"_utime": _utime,
	"_emscripten_set_touchstart_callback": _emscripten_set_touchstart_callback,
	"_Mix_PlayMusic": _Mix_PlayMusic,
	"_glGetShaderPrecisionFormat": _glGetShaderPrecisionFormat,
	"___syscall221": ___syscall221,
	"_glUniform4f": _glUniform4f,
	"_glfwTerminate": _glfwTerminate,
	"_glfwSetWindowSizeCallback": _glfwSetWindowSizeCallback,
	"_emscripten_asm_const_v": _emscripten_asm_const_v,
	"_glfwInit": _glfwInit,
	"__write_sockaddr": __write_sockaddr,
	"_glGenBuffers": _glGenBuffers,
	"_glShaderSource": _glShaderSource,
	"_glFramebufferRenderbuffer": _glFramebufferRenderbuffer,
	"___cxa_atexit": ___cxa_atexit,
	"_llvm_fabs_f64": _llvm_fabs_f64,
	"_pthread_cleanup_push": _pthread_cleanup_push,
	"_Mix_HaltMusic": _Mix_HaltMusic,
	"_TTF_FontHeight": _TTF_FontHeight,
	"_alSourcePlay": _alSourcePlay,
	"___syscall140": ___syscall140,
	"_alSourcePause": _alSourcePause,
	"_glfwDestroyWindow": _glfwDestroyWindow,
	"___syscall146": ___syscall146,
	"_pthread_cleanup_pop": _pthread_cleanup_pop,
	"_glGenerateMipmap": _glGenerateMipmap,
	"_emscripten_get_now_is_monotonic": _emscripten_get_now_is_monotonic,
	"_alcCreateContext": _alcCreateContext,
	"_alSourcefv": _alSourcefv,
	"__inet_ntop4_raw": __inet_ntop4_raw,
	"_glGetProgramInfoLog": _glGetProgramInfoLog,
	"_SDL_GetTicks": _SDL_GetTicks,
	"_glfwSetInputMode": _glfwSetInputMode,
	"___cxa_free_exception": ___cxa_free_exception,
	"___cxa_find_matching_catch": ___cxa_find_matching_catch,
	"_glfwMakeContextCurrent": _glfwMakeContextCurrent,
	"_glDrawElements": _glDrawElements,
	"_alGetSourcei": _alGetSourcei,
	"_emscripten_asm_const_i": _emscripten_asm_const_i,
	"_alcMakeContextCurrent": _alcMakeContextCurrent,
	"_SDL_LockSurface": _SDL_LockSurface,
	"_glViewport": _glViewport,
	"_alSourceQueueBuffers": _alSourceQueueBuffers,
	"___setErrNo": ___setErrNo,
	"_alSourcef": _alSourcef,
	"_glDeleteTextures": _glDeleteTextures,
	"_glDepthFunc": _glDepthFunc,
	"___resumeException": ___resumeException,
	"_SDL_PauseAudio": _SDL_PauseAudio,
	"__read_sockaddr": __read_sockaddr,
	"_alSourcei": _alSourcei,
	"_Mix_VolumeMusic": _Mix_VolumeMusic,
	"_alGenBuffers": _alGenBuffers,
	"_glBindRenderbuffer": _glBindRenderbuffer,
	"_emscripten_asm_const_ii": _emscripten_asm_const_ii,
	"_pthread_once": _pthread_once,
	"_glfwIconifyWindow": _glfwIconifyWindow,
	"_glGenTextures": _glGenTextures,
	"_glGetIntegerv": _glGetIntegerv,
	"_glGetString": _glGetString,
	"emscriptenWebGLGet": emscriptenWebGLGet,
	"_glCreateShader": _glCreateShader,
	"_alGetError": _alGetError,
	"_emscripten_get_now": _emscripten_get_now,
	"___syscall10": ___syscall10,
	"_glAttachShader": _glAttachShader,
	"_Mix_ResumeMusic": _Mix_ResumeMusic,
	"_glCreateProgram": _glCreateProgram,
	"___cxa_guard_release": ___cxa_guard_release,
	"_glfwRestoreWindow": _glfwRestoreWindow,
	"___lock": ___lock,
	"emscriptenWebGLGetTexPixelData": emscriptenWebGLGetTexPixelData,
	"___syscall6": ___syscall6,
	"_emscripten_asm_const_d": _emscripten_asm_const_d,
	"___syscall145": ___syscall145,
	"_time": _time,
	"_glBindFramebuffer": _glBindFramebuffer,
	"_gettimeofday": _gettimeofday,
	"_glGenFramebuffers": _glGenFramebuffers,
	"_SDL_UpperBlitScaled": _SDL_UpperBlitScaled,
	"_exit": _exit,
	"_emscripten_async_call": _emscripten_async_call,
	"___cxa_guard_abort": ___cxa_guard_abort,
	"_alDeleteSources": _alDeleteSources,
	"__inet_pton4_raw": __inet_pton4_raw,
	"_putenv": _putenv,
	"___syscall102": ___syscall102,
	"_llvm_pow_f64": _llvm_pow_f64,
	"___syscall265": ___syscall265,
	"_glDeleteFramebuffers": _glDeleteFramebuffers,
	"_emscripten_get_gamepad_status": _emscripten_get_gamepad_status,
	"_IMG_Load": _IMG_Load,
	"_emscripten_async_wget2": _emscripten_async_wget2,
	"_glfwSetWindowShouldClose": _glfwSetWindowShouldClose,
	"_inet_addr": _inet_addr,
	"_glCheckFramebufferStatus": _glCheckFramebufferStatus,
	"_Mix_LoadMUS": _Mix_LoadMUS,
	"___cxa_allocate_exception": ___cxa_allocate_exception,
	"_glVertexAttribPointer": _glVertexAttribPointer,
	"_emscripten_get_num_gamepads": _emscripten_get_num_gamepads,
	"___buildEnvironment": ___buildEnvironment,
	"_glBlendFuncSeparate": _glBlendFuncSeparate,
	"_glUniform3fv": _glUniform3fv,
	"___syscall295": ___syscall295,
	"___syscall296": ___syscall296,
	"_Mix_FreeMusic": _Mix_FreeMusic,
	"_glClearDepthf": _glClearDepthf,
	"_glfwGetFramebufferSize": _glfwGetFramebufferSize,
	"_emscripten_async_wget2_data": _emscripten_async_wget2_data,
	"_localtime_r": _localtime_r,
	"_tzset": _tzset,
	"___syscall12": ___syscall12,
	"_SDL_Init": _SDL_Init,
	"_glUniform1f": _glUniform1f,
	"___syscall195": ___syscall195,
	"___cxa_end_catch": ___cxa_end_catch,
	"_glfwWindowHint": _glfwWindowHint,
	"_glUniform1i": _glUniform1i,
	"___cxa_find_matching_catch_2": ___cxa_find_matching_catch_2,
	"___cxa_begin_catch": ___cxa_begin_catch,
	"_pthread_getspecific": _pthread_getspecific,
	"_alcDestroyContext": _alcDestroyContext,
	"_glDrawArrays": _glDrawArrays,
	"_glReadPixels": _glReadPixels,
	"_glfwSetCursorPos": _glfwSetCursorPos,
	"_glfwSetWindowPos": _glfwSetWindowPos,
	"_glGetActiveAttrib": _glGetActiveAttrib,
	"_llvm_fabs_f32": _llvm_fabs_f32,
	"_getenv": _getenv,
	"___syscall33": ___syscall33,
	"_glGetActiveUniform": _glGetActiveUniform,
	"_glActiveTexture": _glActiveTexture,
	"_Mix_PauseMusic": _Mix_PauseMusic,
	"_glfwSwapBuffers": _glfwSwapBuffers,
	"_emscripten_asm_const_iii": _emscripten_asm_const_iii,
	"_alSourceStop": _alSourceStop,
	"_glFrontFace": _glFrontFace,
	"_glCompileShader": _glCompileShader,
	"_alcCloseDevice": _alcCloseDevice,
	"_Mix_PlayingMusic": _Mix_PlayingMusic,
	"_glEnableVertexAttribArray": _glEnableVertexAttribArray,
	"_abort": _abort,
	"_Mix_FreeChunk": _Mix_FreeChunk,
	"_glDeleteBuffers": _glDeleteBuffers,
	"_glBufferData": _glBufferData,
	"_glTexImage2D": _glTexImage2D,
	"_localtime": _localtime,
	"___set_network_callback": ___set_network_callback,
	"___cxa_pure_virtual": ___cxa_pure_virtual,
	"_Mix_LoadWAV_RW": _Mix_LoadWAV_RW,
	"_glDeleteShader": _glDeleteShader,
	"_glGetProgramiv": _glGetProgramiv,
	"_glUniform3f": _glUniform3f,
	"_glfwSetWindowSize": _glfwSetWindowSize,
	"_glScissor": _glScissor,
	"___syscall40": ___syscall40,
	"_emscripten_set_touchcancel_callback": _emscripten_set_touchcancel_callback,
	"emscriptenWebGLComputeImageSize": emscriptenWebGLComputeImageSize,
	"_SDL_CloseAudio": _SDL_CloseAudio,
	"___syscall5": ___syscall5,
	"___gxx_personality_v0": ___gxx_personality_v0,
	"_glfwGetWindowSize": _glfwGetWindowSize,
	"__inet_pton6_raw": __inet_pton6_raw,
	"_glDeleteRenderbuffers": _glDeleteRenderbuffers,
	"_glfwGetPrimaryMonitor": _glfwGetPrimaryMonitor,
	"_glDepthRangef": _glDepthRangef,
	"_emscripten_async_wget2_abort": _emscripten_async_wget2_abort,
	"___cxa_find_matching_catch_3": ___cxa_find_matching_catch_3,
	"_emscripten_set_socket_open_callback": _emscripten_set_socket_open_callback,
	"_glLinkProgram": _glLinkProgram,
	"_emscripten_set_touchend_callback": _emscripten_set_touchend_callback,
	"_glfwSetMouseButtonCallback": _glfwSetMouseButtonCallback,
	"_SDL_FreeRW": _SDL_FreeRW,
	"_glGenRenderbuffers": _glGenRenderbuffers,
	"_Mix_LoadMUS_RW": _Mix_LoadMUS_RW,
	"_glGetUniformLocation": _glGetUniformLocation,
	"_glClear": _glClear,
	"_alSource3f": _alSource3f,
	"_glUniform4fv": _glUniform4fv,
	"_glRenderbufferStorage": _glRenderbufferStorage,
	"_glBindTexture": _glBindTexture,
	"__exit": __exit,
	"_glfwSetWindowCloseCallback": _glfwSetWindowCloseCallback,
	"_IMG_Load_RW": _IMG_Load_RW,
	"_glPixelStorei": _glPixelStorei,
	"_usleep": _usleep,
	"_glGetShaderiv": _glGetShaderiv,
	"_alDeleteBuffers": _alDeleteBuffers,
	"_pthread_self": _pthread_self,
	"_emscripten_set_socket_error_callback": _emscripten_set_socket_error_callback,
	"_glEnable": _glEnable,
	"_TTF_SizeText": _TTF_SizeText,
	"_Mix_OpenAudio": _Mix_OpenAudio,
	"___syscall54": ___syscall54,
	"___unlock": ___unlock,
	"_glFramebufferTexture2D": _glFramebufferTexture2D,
	"_emscripten_memcpy_big": _emscripten_memcpy_big,
	"_emscripten_set_main_loop": _emscripten_set_main_loop,
	"_glUniform2f": _glUniform2f,
	"_glDepthMask": _glDepthMask,
	"_alGenSources": _alGenSources,
	"_SDL_RWFromConstMem": _SDL_RWFromConstMem,
	"_pthread_setspecific": _pthread_setspecific,
	"_alcOpenDevice": _alcOpenDevice,
	"___cxa_throw": ___cxa_throw,
	"_glfwSetKeyCallback": _glfwSetKeyCallback,
	"_glDisable": _glDisable,
	"_glTexParameteri": _glTexParameteri,
	"_emscripten_longjmp": _emscripten_longjmp,
	"_atexit": _atexit,
	"_SDL_UpperBlit": _SDL_UpperBlit,
	"_glfwSetScrollCallback": _glfwSetScrollCallback,
	"_glfwSetWindowTitle": _glfwSetWindowTitle,
	"_glfwSetCursorPosCallback": _glfwSetCursorPosCallback,
	"_glTexParameterf": _glTexParameterf,
	"_glUniform1fv": _glUniform1fv,
	"_glTexSubImage2D": _glTexSubImage2D,
	"_alSourceUnqueueBuffers": _alSourceUnqueueBuffers,
	"STACKTOP": STACKTOP,
	"STACK_MAX": STACK_MAX,
	"tempDoublePtr": tempDoublePtr,
	"ABORT": ABORT,
	"cttz_i8": cttz_i8,
	"___dso_handle": ___dso_handle
}; // EMSCRIPTEN_START_ASM
var asm = Module["asm"] // EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
var _main = Module["_main"] = asm["_main"];
var __GLOBAL__sub_I_HTML5Core_cpp = Module["__GLOBAL__sub_I_HTML5Core_cpp"] = asm["__GLOBAL__sub_I_HTML5Core_cpp"];
var __GLOBAL__sub_I_FBXMeshGeometry_cpp = Module["__GLOBAL__sub_I_FBXMeshGeometry_cpp"] = asm["__GLOBAL__sub_I_FBXMeshGeometry_cpp"];
var __GLOBAL__sub_I_Wrapper_cpp = Module["__GLOBAL__sub_I_Wrapper_cpp"] = asm["__GLOBAL__sub_I_Wrapper_cpp"];
var __GLOBAL__sub_I_Assimp_cpp = Module["__GLOBAL__sub_I_Assimp_cpp"] = asm["__GLOBAL__sub_I_Assimp_cpp"];
var _bitshift64Lshr = Module["_bitshift64Lshr"] = asm["_bitshift64Lshr"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var _fflush = Module["_fflush"] = asm["_fflush"];
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = asm["___cxa_is_pointer_type"];
var _bitshift64Ashr = Module["_bitshift64Ashr"] = asm["_bitshift64Ashr"];
var __GLOBAL__sub_I_ObjFileMtlImporter_cpp = Module["__GLOBAL__sub_I_ObjFileMtlImporter_cpp"] = asm["__GLOBAL__sub_I_ObjFileMtlImporter_cpp"];
var _memset = Module["_memset"] = asm["_memset"];
var __GLOBAL__sub_I_cTouch_cpp = Module["__GLOBAL__sub_I_cTouch_cpp"] = asm["__GLOBAL__sub_I_cTouch_cpp"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var ___errno_location = Module["___errno_location"] = asm["___errno_location"];
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var __GLOBAL__sub_I_ObjFileParser_cpp = Module["__GLOBAL__sub_I_ObjFileParser_cpp"] = asm["__GLOBAL__sub_I_ObjFileParser_cpp"];
var _ntohs = Module["_ntohs"] = asm["_ntohs"];
var _htonl = Module["_htonl"] = asm["_htonl"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var __GLOBAL__sub_I_ContactReport_cpp = Module["__GLOBAL__sub_I_ContactReport_cpp"] = asm["__GLOBAL__sub_I_ContactReport_cpp"];
var ___cxa_can_catch = Module["___cxa_can_catch"] = asm["___cxa_can_catch"];
var __GLOBAL__sub_I_HTML5Network_cpp = Module["__GLOBAL__sub_I_HTML5Network_cpp"] = asm["__GLOBAL__sub_I_HTML5Network_cpp"];
var _htons = Module["_htons"] = asm["_htons"];
var _llvm_bswap_i32 = Module["_llvm_bswap_i32"] = asm["_llvm_bswap_i32"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var _testSetjmp = Module["_testSetjmp"] = asm["_testSetjmp"];
var _saveSetjmp = Module["_saveSetjmp"] = asm["_saveSetjmp"];
var _free = Module["_free"] = asm["_free"];
var __GLOBAL__sub_I_DynamicsWorld_cpp = Module["__GLOBAL__sub_I_DynamicsWorld_cpp"] = asm["__GLOBAL__sub_I_DynamicsWorld_cpp"];
var __GLOBAL__sub_I_btQuickprof_cpp = Module["__GLOBAL__sub_I_btQuickprof_cpp"] = asm["__GLOBAL__sub_I_btQuickprof_cpp"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var __GLOBAL__sub_I_ZipFile_cpp = Module["__GLOBAL__sub_I_ZipFile_cpp"] = asm["__GLOBAL__sub_I_ZipFile_cpp"];
var __GLOBAL__sub_I_AGKShader_cpp = Module["__GLOBAL__sub_I_AGKShader_cpp"] = asm["__GLOBAL__sub_I_AGKShader_cpp"];
var __GLOBAL__sub_I_FBXImporter_cpp = Module["__GLOBAL__sub_I_FBXImporter_cpp"] = asm["__GLOBAL__sub_I_FBXImporter_cpp"];
var __GLOBAL__sub_I_interpreter_cpp = Module["__GLOBAL__sub_I_interpreter_cpp"] = asm["__GLOBAL__sub_I_interpreter_cpp"];
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = asm["dynCall_iiiiiiii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vd = Module["dynCall_vd"] = asm["dynCall_vd"];
var dynCall_vid = Module["dynCall_vid"] = asm["dynCall_vid"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_viidii = Module["dynCall_viidii"] = asm["dynCall_viidii"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = asm["dynCall_iiiiiii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viidiiii = Module["dynCall_viidiiii"] = asm["dynCall_viidiiii"];
var dynCall_viidd = Module["dynCall_viidd"] = asm["dynCall_viidd"];
var dynCall_viidi = Module["dynCall_viidi"] = asm["dynCall_viidi"];
var dynCall_viiidddd = Module["dynCall_viiidddd"] = asm["dynCall_viiidddd"];
var dynCall_id = Module["dynCall_id"] = asm["dynCall_id"];
var dynCall_vidii = Module["dynCall_vidii"] = asm["dynCall_vidii"];
var dynCall_viddd = Module["dynCall_viddd"] = asm["dynCall_viddd"];
var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = asm["dynCall_iiiiiiiiii"];
var dynCall_vidi = Module["dynCall_vidi"] = asm["dynCall_vidi"];
var dynCall_viddi = Module["dynCall_viddi"] = asm["dynCall_viddi"];
var dynCall_vidd = Module["dynCall_vidd"] = asm["dynCall_vidd"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iiid = Module["dynCall_iiid"] = asm["dynCall_iiid"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_viid = Module["dynCall_viid"] = asm["dynCall_viid"];
var dynCall_viddddd = Module["dynCall_viddddd"] = asm["dynCall_viddddd"];
var dynCall_di = Module["dynCall_di"] = asm["dynCall_di"];
var dynCall_iiiiiiiiiii = Module["dynCall_iiiiiiiiiii"] = asm["dynCall_iiiiiiiiiii"];
var dynCall_dd = Module["dynCall_dd"] = asm["dynCall_dd"];
var dynCall_vidddd = Module["dynCall_vidddd"] = asm["dynCall_vidddd"];
var dynCall_iid = Module["dynCall_iid"] = asm["dynCall_iid"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_dii = Module["dynCall_dii"] = asm["dynCall_dii"];
var dynCall_vidddddd = Module["dynCall_vidddddd"] = asm["dynCall_vidddddd"];
var dynCall_d = Module["dynCall_d"] = asm["dynCall_d"];
var dynCall_did = Module["dynCall_did"] = asm["dynCall_did"];
var dynCall_vidddddi = Module["dynCall_vidddddi"] = asm["dynCall_vidddddi"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_vdddd = Module["dynCall_vdddd"] = asm["dynCall_vdddd"];
var dynCall_vdd = Module["dynCall_vdd"] = asm["dynCall_vdd"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = asm["dynCall_iiiiiiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
var dynCall_diiiid = Module["dynCall_diiiid"] = asm["dynCall_diiiid"];
Runtime.stackAlloc = asm["stackAlloc"];
Runtime.stackSave = asm["stackSave"];
Runtime.stackRestore = asm["stackRestore"];
Runtime.establishStackSpace = asm["establishStackSpace"];
Runtime.setTempRet0 = asm["setTempRet0"];
Runtime.getTempRet0 = asm["getTempRet0"];
if (memoryInitializer) {
	if (typeof Module["locateFile"] === "function") {
		memoryInitializer = Module["locateFile"](memoryInitializer)
	} else if (Module["memoryInitializerPrefixURL"]) {
		memoryInitializer = Module["memoryInitializerPrefixURL"] + memoryInitializer
	}
	if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
		var data = Module["readBinary"](memoryInitializer);
		HEAPU8.set(data, Runtime.GLOBAL_BASE)
	} else {
		addRunDependency("memory initializer");
		var applyMemoryInitializer = (function(data) {
			if (data.byteLength) data = new Uint8Array(data);
			HEAPU8.set(data, Runtime.GLOBAL_BASE);
			if (Module["memoryInitializerRequest"]) delete Module["memoryInitializerRequest"].response;
			removeRunDependency("memory initializer")
		});

		function doBrowserLoad() {
			Module["readAsync"](memoryInitializer, applyMemoryInitializer, (function() {
				throw "could not load memory initializer " + memoryInitializer
			}))
		}
		if (Module["memoryInitializerRequest"]) {
			function useRequest() {
				var request = Module["memoryInitializerRequest"];
				if (request.status !== 200 && request.status !== 0) {
					console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: " + request.status + ", retrying " + memoryInitializer);
					doBrowserLoad();
					return
				}
				applyMemoryInitializer(request.response)
			}
			if (Module["memoryInitializerRequest"].response) {
				setTimeout(useRequest, 0)
			} else {
				Module["memoryInitializerRequest"].addEventListener("load", useRequest)
			}
		} else {
			doBrowserLoad()
		}
	}
}

function ExitStatus(status) {
	this.name = "ExitStatus";
	this.message = "Program terminated with exit(" + status + ")";
	this.status = status
}
ExitStatus.prototype = new Error;
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
dependenciesFulfilled = function runCaller() {
	if (!Module["calledRun"]) run();
	if (!Module["calledRun"]) dependenciesFulfilled = runCaller
};
Module["callMain"] = Module.callMain = function callMain(args) {
	args = args || [];
	ensureInitRuntime();
	var argc = args.length + 1;

	function pad() {
		for (var i = 0; i < 4 - 1; i++) {
			argv.push(0)
		}
	}
	var argv = [allocate(intArrayFromString(Module["thisProgram"]), "i8", ALLOC_NORMAL)];
	pad();
	for (var i = 0; i < argc - 1; i = i + 1) {
		argv.push(allocate(intArrayFromString(args[i]), "i8", ALLOC_NORMAL));
		pad()
	}
	argv.push(0);
	argv = allocate(argv, "i32", ALLOC_NORMAL);
	try {
		var ret = Module["_main"](argc, argv, 0);
		exit(ret, true)
	} catch (e) {
		if (e instanceof ExitStatus) {
			return
		} else if (e == "SimulateInfiniteLoop") {
			Module["noExitRuntime"] = true;
			return
		} else {
			if (e && typeof e === "object" && e.stack) Module.printErr("exception thrown: " + [e, e.stack]);
			throw e
		}
	} finally {
		calledMain = true
	}
};

function run(args) {
	args = args || Module["arguments"];
	if (preloadStartTime === null) preloadStartTime = Date.now();
	if (runDependencies > 0) {
		return
	}
	preRun();
	if (runDependencies > 0) return;
	if (Module["calledRun"]) return;

	function doRun() {
		if (Module["calledRun"]) return;
		Module["calledRun"] = true;
		if (ABORT) return;
		ensureInitRuntime();
		preMain();
		if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
		if (Module["_main"] && shouldRunNow) Module["callMain"](args);
		postRun()
	}
	if (Module["setStatus"]) {
		Module["setStatus"]("Running...");
		setTimeout((function() {
			setTimeout((function() {
				Module["setStatus"]("")
			}), 1);
			doRun()
		}), 1)
	} else {
		doRun()
	}
}
Module["run"] = Module.run = run;

function exit(status, implicit) {
	if (implicit && Module["noExitRuntime"]) {
		return
	}
	if (Module["noExitRuntime"]) {} else {
		ABORT = true;
		EXITSTATUS = status;
		STACKTOP = initialStackTop;
		exitRuntime();
		if (Module["onExit"]) Module["onExit"](status)
	}
	if (ENVIRONMENT_IS_NODE) {
		process["exit"](status)
	} else if (ENVIRONMENT_IS_SHELL && typeof quit === "function") {
		quit(status)
	}
	throw new ExitStatus(status)
}
Module["exit"] = Module.exit = exit;
var abortDecorators = [];

function abort(what) {
	if (what !== undefined) {
		Module.print(what);
		Module.printErr(what);
		what = JSON.stringify(what)
	} else {
		what = ""
	}
	ABORT = true;
	EXITSTATUS = 1;
	var extra = "\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";
	var output = "abort(" + what + ") at " + stackTrace() + extra;
	if (abortDecorators) {
		abortDecorators.forEach((function(decorator) {
			output = decorator(output, what)
		}))
	}
	throw output
}
Module["abort"] = Module.abort = abort;
if (Module["preInit"]) {
	if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
	while (Module["preInit"].length > 0) {
		Module["preInit"].pop()()
	}
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
	shouldRunNow = false
}
run()