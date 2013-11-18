// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module)
{
	if (Module.hasOwnProperty(key))
	{
		moduleOverrides[key] = Module[key];
	}
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE)
{
	// Expose functionality in the same simple way that the shells work
	// Note that we pollute the global namespace here, otherwise we break in node
	Module['print'] = function (x)
	{
		process['stdout'].write(x + '\n');
	};
	Module['printErr'] = function (x)
	{
		process['stderr'].write(x + '\n');
	};
	var nodeFS = require('fs');
	var nodePath = require('path');
	Module['read'] = function (filename, binary)
	{
		filename = nodePath['normalize'](filename);
		var ret = nodeFS['readFileSync'](filename);
		// The path is absolute if the normalized version is the same as the resolved.
		if (!ret && filename != nodePath['resolve'](filename))
		{
			filename = path.join(__dirname, '..', 'src', filename);
			ret = nodeFS['readFileSync'](filename);
		}
		if (ret && !binary) ret = ret.toString();
		return ret;
	};
	Module['readBinary'] = function (filename)
	{
		return Module['read'](filename, true)
	};
	Module['load'] = function (f)
	{
		globalEval(read(f));
	};
	Module['arguments'] = process['argv'].slice(2);
	module.exports = Module;
}
if (ENVIRONMENT_IS_SHELL)
{
	Module['print'] = print;
	if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
	Module['read'] = read;
	Module['readBinary'] = function (f)
	{
		return read(f, 'binary');
	};
	if (typeof scriptArgs != 'undefined')
	{
		Module['arguments'] = scriptArgs;
	}
	else if (typeof arguments != 'undefined')
	{
		Module['arguments'] = arguments;
	}
	this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER)
{
	Module['print'] = function (x)
	{
		console.log(x);
	};
	Module['printErr'] = function (x)
	{
		console.log(x);
	};
	this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)
{
	Module['read'] = function (url)
	{
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send(null);
		return xhr.responseText;
	};
	if (typeof arguments != 'undefined')
	{
		Module['arguments'] = arguments;
	}
}
if (ENVIRONMENT_IS_WORKER)
{
	// We can do very little here...
	var TRY_USE_DUMP = false;
	Module['print'] = (TRY_USE_DUMP && (typeof (dump) !== "undefined") ? (function (x)
	{
		dump(x);
	}) : (function (x)
	{
		// self.postMessage(x); // enable this if you want stdout to be sent as messages
	}));
	Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL)
{
	// Unreachable because SHELL is dependant on the others
	throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x)
{
	eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read'])
{
	Module['load'] = function (f)
	{
		globalEval(Module['read'](f));
	};
}
if (!Module['print'])
{
	Module['print'] = function () {};
}
if (!Module['printErr'])
{
	Module['printErr'] = Module['print'];
}
if (!Module['arguments'])
{
	Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides)
{
	if (moduleOverrides.hasOwnProperty(key))
	{
		Module[key] = moduleOverrides[key];
	}
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
	stackSave: function ()
	{
		return STACKTOP;
	},
	stackRestore: function (stackTop)
	{
		STACKTOP = stackTop;
	},
	forceAlign: function (target, quantum)
	{
		quantum = quantum || 4;
		if (quantum == 1) return target;
		if (isNumber(target) && isNumber(quantum))
		{
			return Math.ceil(target / quantum) * quantum;
		}
		else if (isNumber(quantum) && isPowerOfTwo(quantum))
		{
			var logg = log2(quantum);
			return '((((' + target + ')+' + (quantum - 1) + ')>>' + logg + ')<<' + logg + ')';
		}
		return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
	},
	isNumberType: function (type)
	{
		return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
	},
	isPointerType: function isPointerType(type)
	{
		return type[type.length - 1] == '*';
	},
	isStructType: function isStructType(type)
	{
		if (isPointerType(type)) return false;
		if (isArrayType(type)) return true;
		if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
		// See comment in isStructPointerType()
		return type[0] == '%';
	},
	INT_TYPES:
	{
		"i1": 0,
		"i8": 0,
		"i16": 0,
		"i32": 0,
		"i64": 0
	},
	FLOAT_TYPES:
	{
		"float": 0,
		"double": 0
	},
	or64: function (x, y)
	{
		var l = (x | 0) | (y | 0);
		var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
		return l + h;
	},
	and64: function (x, y)
	{
		var l = (x | 0) & (y | 0);
		var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
		return l + h;
	},
	xor64: function (x, y)
	{
		var l = (x | 0) ^ (y | 0);
		var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
		return l + h;
	},
	getNativeTypeSize: function (type, quantumSize)
	{
		if (Runtime.QUANTUM_SIZE == 1) return 1;
		var size = {
			'%i1': 1,
			'%i8': 1,
			'%i16': 2,
			'%i32': 4,
			'%i64': 8,
			"%float": 4,
			"%double": 8
		}['%' + type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
		if (!size)
		{
			if (type.charAt(type.length - 1) == '*')
			{
				size = Runtime.QUANTUM_SIZE; // A pointer
			}
			else if (type[0] == 'i')
			{
				var bits = parseInt(type.substr(1));
				assert(bits % 8 == 0);
				size = bits / 8;
			}
		}
		return size;
	},
	getNativeFieldSize: function (type)
	{
		return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
	},
	dedup: function dedup(items, ident)
	{
		var seen = {};
		if (ident)
		{
			return items.filter(function (item)
			{
				if (seen[item[ident]]) return false;
				seen[item[ident]] = true;
				return true;
			});
		}
		else
		{
			return items.filter(function (item)
			{
				if (seen[item]) return false;
				seen[item] = true;
				return true;
			});
		}
	},
	set: function set()
	{
		var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
		var ret = {};
		for (var i = 0; i < args.length; i++)
		{
			ret[args[i]] = 0;
		}
		return ret;
	},
	STACK_ALIGN: 8,
	getAlignSize: function (type, size, vararg)
	{
		// we align i64s and doubles on 64-bit boundaries, unlike x86
		if (type == 'i64' || type == 'double' || vararg) return 8;
		if (!type) return Math.min(size, 8); // align structures internally to 64 bits
		return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
	},
	calculateStructAlignment: function calculateStructAlignment(type)
	{
		type.flatSize = 0;
		type.alignSize = 0;
		var diffs = [];
		var prev = -1;
		var index = 0;
		type.flatIndexes = type.fields.map(function (field)
		{
			index++;
			var size, alignSize;
			if (Runtime.isNumberType(field) || Runtime.isPointerType(field))
			{
				size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
				alignSize = Runtime.getAlignSize(field, size);
			}
			else if (Runtime.isStructType(field))
			{
				if (field[1] === '0')
				{
					// this is [0 x something]. When inside another structure like here, it must be at the end,
					// and it adds no size
					// XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
					size = 0;
					alignSize = type.alignSize || QUANTUM_SIZE;
				}
				else
				{
					size = Types.types[field].flatSize;
					alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
				}
			}
			else if (field[0] == 'b')
			{
				// bN, large number field, like a [N x i8]
				size = field.substr(1) | 0;
				alignSize = 1;
			}
			else
			{
				throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
			}
			if (type.packed) alignSize = 1;
			type.alignSize = Math.max(type.alignSize, alignSize);
			var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
			type.flatSize = curr + size;
			if (prev >= 0)
			{
				diffs.push(curr - prev);
			}
			prev = curr;
			return curr;
		});
		type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
		if (diffs.length == 0)
		{
			type.flatFactor = type.flatSize;
		}
		else if (Runtime.dedup(diffs).length == 1)
		{
			type.flatFactor = diffs[0];
		}
		type.needsFlattening = (type.flatFactor != 1);
		return type.flatIndexes;
	},
	generateStructInfo: function (struct, typeName, offset)
	{
		var type, alignment;
		if (typeName)
		{
			offset = offset || 0;
			type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
			if (!type) return null;
			if (type.fields.length != struct.length)
			{
				printErr('Number of named fields must match the type for ' + typeName +
					': possibly duplicate struct names. Cannot return structInfo');
				return null;
			}
			alignment = type.flatIndexes;
		}
		else
		{
			var type = {
				fields: struct.map(function (item)
				{
					return item[0]
				})
			};
			alignment = Runtime.calculateStructAlignment(type);
		}
		var ret = {
			__size__: type.flatSize
		};
		if (typeName)
		{
			struct.forEach(function (item, i)
			{
				if (typeof item === 'string')
				{
					ret[item] = alignment[i] + offset;
				}
				else
				{
					// embedded struct
					var key;
					for (var k in item) key = k;
					ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
				}
			});
		}
		else
		{
			struct.forEach(function (item, i)
			{
				ret[item[1]] = alignment[i];
			});
		}
		return ret;
	},
	dynCall: function (sig, ptr, args)
	{
		if (args && args.length)
		{
			if (!args.splice) args = Array.prototype.slice.call(args);
			args.splice(0, 0, ptr);
			return Module['dynCall_' + sig].apply(null, args);
		}
		else
		{
			return Module['dynCall_' + sig].call(null, ptr);
		}
	},
	functionPointers: [],
	addFunction: function (func)
	{
		for (var i = 0; i < Runtime.functionPointers.length; i++)
		{
			if (!Runtime.functionPointers[i])
			{
				Runtime.functionPointers[i] = func;
				return 2 + 2 * i;
			}
		}
		throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
	},
	removeFunction: function (index)
	{
		Runtime.functionPointers[(index - 2) / 2] = null;
	},
	warnOnce: function (text)
	{
		if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
		if (!Runtime.warnOnce.shown[text])
		{
			Runtime.warnOnce.shown[text] = 1;
			Module.printErr(text);
		}
	},
	funcWrappers:
	{},
	getFuncWrapper: function (func, sig)
	{
		assert(sig);
		if (!Runtime.funcWrappers[func])
		{
			Runtime.funcWrappers[func] = function ()
			{
				return Runtime.dynCall(sig, func, arguments);
			};
		}
		return Runtime.funcWrappers[func];
	},
	UTF8Processor: function ()
	{
		var buffer = [];
		var needed = 0;
		this.processCChar = function (code)
		{
			code = code & 0xff;
			if (needed)
			{
				buffer.push(code);
				needed--;
			}
			if (buffer.length == 0)
			{
				if (code < 128) return String.fromCharCode(code);
				buffer.push(code);
				if (code > 191 && code < 224)
				{
					needed = 1;
				}
				else
				{
					needed = 2;
				}
				return '';
			}
			if (needed > 0) return '';
			var c1 = buffer[0];
			var c2 = buffer[1];
			var c3 = buffer[2];
			var ret;
			if (c1 > 191 && c1 < 224)
			{
				ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
			}
			else
			{
				ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
			}
			buffer.length = 0;
			return ret;
		}
		this.processJSString = function (string)
		{
			string = unescape(encodeURIComponent(string));
			var ret = [];
			for (var i = 0; i < string.length; i++)
			{
				ret.push(string.charCodeAt(i));
			}
			return ret;
		}
	},
	stackAlloc: function (size)
	{
		var ret = STACKTOP;
		STACKTOP = (STACKTOP + size) | 0;
		STACKTOP = ((((STACKTOP) + 7) >> 3) << 3);
		return ret;
	},
	staticAlloc: function (size)
	{
		var ret = STATICTOP;
		STATICTOP = (STATICTOP + size) | 0;
		STATICTOP = ((((STATICTOP) + 7) >> 3) << 3);
		return ret;
	},
	dynamicAlloc: function (size)
	{
		var ret = DYNAMICTOP;
		DYNAMICTOP = (DYNAMICTOP + size) | 0;
		DYNAMICTOP = ((((DYNAMICTOP) + 7) >> 3) << 3);
		if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();;
		return ret;
	},
	alignMemory: function (size, quantum)
	{
		var ret = size = Math.ceil((size) / (quantum ? quantum : 8)) * (quantum ? quantum : 8);
		return ret;
	},
	makeBigInt: function (low, high, unsigned)
	{
		var ret = (unsigned ? ((+(((low) >>> (0)))) + ((+(((high) >>> (0)))) * (+(4294967296)))) : ((+(((low) >>> (
			0)))) + ((+(((high) | (0)))) * (+(4294967296)))));
		return ret;
	},
	GLOBAL_BASE: 8,
	QUANTUM_SIZE: 4,
	__dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS,
		tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text)
{
	if (!condition)
	{
		abort('Assertion failed: ' + text);
	}
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args)
{
	return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident)
{
	try
	{
		var func = Module['_' + ident]; // closure exported function
		if (!func) func = eval('_' + ident); // explicit lookup
	}
	catch (e)
	{}
	assert(func, 'Cannot call unknown function ' + ident +
		' (perhaps LLVM optimizations or closure removed it?)');
	return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args)
{
	var stack = 0;

	function toC(value, type)
	{
		if (type == 'string')
		{
			if (value === null || value === undefined || value === 0) return 0; // null string
			if (!stack) stack = Runtime.stackSave();
			var ret = Runtime.stackAlloc(value.length + 1);
			writeStringToMemory(value, ret);
			return ret;
		}
		else if (type == 'array')
		{
			if (!stack) stack = Runtime.stackSave();
			var ret = Runtime.stackAlloc(value.length);
			writeArrayToMemory(value, ret);
			return ret;
		}
		return value;
	}

	function fromC(value, type)
	{
		if (type == 'string')
		{
			return Pointer_stringify(value);
		}
		assert(type != 'array');
		return value;
	}
	var i = 0;
	var cArgs = args ? args.map(function (arg)
	{
		return toC(arg, argTypes[i++]);
	}) : [];
	var ret = fromC(func.apply(null, cArgs), returnType);
	if (stack) Runtime.stackRestore(stack);
	return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes)
{
	var func = getCFunc(ident);
	return function ()
	{
		return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
	}
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe)
{
	type = type || 'i8';
	if (type.charAt(type.length - 1) === '*') type = 'i32'; // pointers are 32-bit
	switch (type)
	{
	case 'i1':
		HEAP8[(ptr)] = value;
		break;
	case 'i8':
		HEAP8[(ptr)] = value;
		break;
	case 'i16':
		HEAP16[((ptr) >> 1)] = value;
		break;
	case 'i32':
		HEAP32[((ptr) >> 2)] = value;
		break;
	case 'i64':
		(tempI64 = [value >>> 0, ((Math.min((+(Math.floor((value) / (+(4294967296))))), (+(4294967295)))) | 0) >>>
			0
		], HEAP32[((ptr) >> 2)] = tempI64[0], HEAP32[(((ptr) + (4)) >> 2)] = tempI64[1]);
		break;
	case 'float':
		HEAPF32[((ptr) >> 2)] = value;
		break;
	case 'double':
		HEAPF64[((ptr) >> 3)] = value;
		break;
	default:
		abort('invalid type for setValue: ' + type);
	}
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe)
{
	type = type || 'i8';
	if (type.charAt(type.length - 1) === '*') type = 'i32'; // pointers are 32-bit
	switch (type)
	{
	case 'i1':
		return HEAP8[(ptr)];
	case 'i8':
		return HEAP8[(ptr)];
	case 'i16':
		return HEAP16[((ptr) >> 1)];
	case 'i32':
		return HEAP32[((ptr) >> 2)];
	case 'i64':
		return HEAP32[((ptr) >> 2)];
	case 'float':
		return HEAPF32[((ptr) >> 2)];
	case 'double':
		return HEAPF64[((ptr) >> 3)];
	default:
		abort('invalid type for setValue: ' + type);
	}
	return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr)
{
	var zeroinit, size;
	if (typeof slab === 'number')
	{
		zeroinit = true;
		size = slab;
	}
	else
	{
		zeroinit = false;
		size = slab.length;
	}
	var singleType = typeof types === 'string' ? types : null;
	var ret;
	if (allocator == ALLOC_NONE)
	{
		ret = ptr;
	}
	else
	{
		ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ?
			ALLOC_STATIC : allocator
		](Math.max(size, singleType ? 1 : types.length));
	}
	if (zeroinit)
	{
		var ptr = ret,
			stop;
		assert((ret & 3) == 0);
		stop = ret + (size & ~3);
		for (; ptr < stop; ptr += 4)
		{
			HEAP32[((ptr) >> 2)] = 0;
		}
		stop = ret + size;
		while (ptr < stop)
		{
			HEAP8[((ptr++) | 0)] = 0;
		}
		return ret;
	}
	if (singleType === 'i8')
	{
		if (slab.subarray || slab.slice)
		{
			HEAPU8.set(slab, ret);
		}
		else
		{
			HEAPU8.set(new Uint8Array(slab), ret);
		}
		return ret;
	}
	var i = 0,
		type, typeSize, previousType;
	while (i < size)
	{
		var curr = slab[i];
		if (typeof curr === 'function')
		{
			curr = Runtime.getFunctionIndex(curr);
		}
		type = singleType || types[i];
		if (type === 0)
		{
			i++;
			continue;
		}
		if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
		setValue(ret + i, curr, type);
		// no need to look up size unless type changes, so cache it
		if (previousType !== type)
		{
			typeSize = Runtime.getNativeTypeSize(type);
			previousType = type;
		}
		i += typeSize;
	}
	return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length)
{
	// Find the length, and check for UTF while doing so
	var hasUtf = false;
	var t;
	var i = 0;
	while (1)
	{
		t = HEAPU8[(((ptr) + (i)) | 0)];
		if (t >= 128) hasUtf = true;
		else if (t == 0 && !length) break;
		i++;
		if (length && i == length) break;
	}
	if (!length) length = i;
	var ret = '';
	if (!hasUtf)
	{
		var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
		var curr;
		while (length > 0)
		{
			curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
			ret = ret ? ret + curr : curr;
			ptr += MAX_CHUNK;
			length -= MAX_CHUNK;
		}
		return ret;
	}
	var utf8 = new Runtime.UTF8Processor();
	for (i = 0; i < length; i++)
	{
		t = HEAPU8[(((ptr) + (i)) | 0)];
		ret += utf8.processCChar(t);
	}
	return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;

function alignMemoryPage(x)
{
	return ((x + 4095) >> 12) << 12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0,
	STATICTOP = 0,
	staticSealed = false; // static area
var STACK_BASE = 0,
	STACKTOP = 0,
	STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0,
	DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory()
{
	abort(
		'Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.'
	);
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 536870912;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert( !! Int32Array && !! Float64Array && !! (new Int32Array(1)['subarray']) && !! (new Int32Array(1)['set']),
	'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks)
{
	while (callbacks.length > 0)
	{
		var callback = callbacks.shift();
		if (typeof callback == 'function')
		{
			callback();
			continue;
		}
		var func = callback.func;
		if (typeof func === 'number')
		{
			if (callback.arg === undefined)
			{
				Runtime.dynCall('v', func);
			}
			else
			{
				Runtime.dynCall('vi', func, [callback.arg]);
			}
		}
		else
		{
			func(callback.arg === undefined ? null : callback.arg);
		}
	}
}
var __ATPRERUN__ = []; // functions called before the runtime is initialized
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;

function preRun()
{
	// compatibility - merge in anything from Module['preRun'] at this time
	if (Module['preRun'])
	{
		if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
		while (Module['preRun'].length)
		{
			addOnPreRun(Module['preRun'].shift());
		}
	}
	callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime()
{
	if (runtimeInitialized) return;
	runtimeInitialized = true;
	callRuntimeCallbacks(__ATINIT__);
}

function preMain()
{
	callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime()
{
	callRuntimeCallbacks(__ATEXIT__);
}

function postRun()
{
	// compatibility - merge in anything from Module['postRun'] at this time
	if (Module['postRun'])
	{
		if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
		while (Module['postRun'].length)
		{
			addOnPostRun(Module['postRun'].shift());
		}
	}
	callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb)
{
	__ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb)
{
	__ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb)
{
	__ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb)
{
	__ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb)
{
	__ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */ )
{
	var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
	if (length)
	{
		ret.length = length;
	}
	if (!dontAddNull)
	{
		ret.push(0);
	}
	return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array)
{
	var ret = [];
	for (var i = 0; i < array.length; i++)
	{
		var chr = array[i];
		if (chr > 0xFF)
		{
			chr &= 0xFF;
		}
		ret.push(String.fromCharCode(chr));
	}
	return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull)
{
	var array = intArrayFromString(string, dontAddNull);
	var i = 0;
	while (i < array.length)
	{
		var chr = array[i];
		HEAP8[(((buffer) + (i)) | 0)] = chr
		i = i + 1;
	}
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer)
{
	for (var i = 0; i < array.length; i++)
	{
		HEAP8[(((buffer) + (i)) | 0)] = array[i];
	}
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function unSign(value, bits, ignore, sig)
{
	if (value >= 0)
	{
		return value;
	}
	return bits <= 32 ? 2 * Math.abs(1 << (bits - 1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
	: Math.pow(2, bits) + value;
}

function reSign(value, bits, ignore, sig)
{
	if (value <= 0)
	{
		return value;
	}
	var half = bits <= 32 ? Math.abs(1 << (bits - 1)) // abs is needed if bits == 32
	: Math.pow(2, bits - 1);
	if (value >= half && (bits <= 32 || value > half))
	{ // for huge values, we can hit the precision limit and always get true here. so don't do that
		// but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
		// TODO: In i64 mode 1, resign the two parts separately and safely
		value = -2 * half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
	}
	return value;
}
if (!Math['imul']) Math['imul'] = function (a, b)
{
	var ah = a >>> 16;
	var al = a & 0xffff;
	var bh = b >>> 16;
	var bl = b & 0xffff;
	return (al * bl + ((ah * bl + al * bh) << 16)) | 0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false,
	calledRun = false;
var runDependencyWatcher = null;

function addRunDependency(id)
{
	runDependencies++;
	if (Module['monitorRunDependencies'])
	{
		Module['monitorRunDependencies'](runDependencies);
	}
	if (id)
	{
		assert(!runDependencyTracking[id]);
		runDependencyTracking[id] = 1;
	}
	else
	{
		Module.printErr('warning: run dependency added without ID');
	}
}
Module['addRunDependency'] = addRunDependency;

function removeRunDependency(id)
{
	runDependencies--;
	if (Module['monitorRunDependencies'])
	{
		Module['monitorRunDependencies'](runDependencies);
	}
	if (id)
	{
		assert(runDependencyTracking[id]);
		delete runDependencyTracking[id];
	}
	else
	{
		Module.printErr('warning: run dependency removed without ID');
	}
	if (runDependencies == 0)
	{
		if (runDependencyWatcher !== null)
		{
			clearInterval(runDependencyWatcher);
			runDependencyWatcher = null;
		}
		// If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
		if (!calledRun && shouldRunNow) run();
	}
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function loadMemoryInitializer(filename)
{
	function applyData(data)
	{
		HEAPU8.set(data, STATIC_BASE);
	}
	// always do this asynchronously, to keep shell and web as similar as possible
	addOnPreRun(function ()
	{
		if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL)
		{
			applyData(Module['readBinary'](filename));
		}
		else
		{
			Browser.asyncLoad(filename, function (data)
			{
				applyData(data);
			}, function (data)
			{
				throw 'could not load memory initializer ' + filename;
			});
		}
	});
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 552;
/* global initializers */
__ATINIT__.push(
{
	func: function ()
	{
		runPostSets()
	}
});
/* memory initializer */
allocate([0, 100, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 37, 108, 100, 10, 0, 0, 0, 0, 45, 45, 10, 0, 0, 0,
	0, 0, 37, 100, 10, 0, 0, 0, 0, 0
], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr)
{ // functions, because inlining this code increases code size too much
	HEAP8[tempDoublePtr] = HEAP8[ptr];
	HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];
	HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];
	HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];
}

function copyTempDouble(ptr)
{
	HEAP8[tempDoublePtr] = HEAP8[ptr];
	HEAP8[tempDoublePtr + 1] = HEAP8[ptr + 1];
	HEAP8[tempDoublePtr + 2] = HEAP8[ptr + 2];
	HEAP8[tempDoublePtr + 3] = HEAP8[ptr + 3];
	HEAP8[tempDoublePtr + 4] = HEAP8[ptr + 4];
	HEAP8[tempDoublePtr + 5] = HEAP8[ptr + 5];
	HEAP8[tempDoublePtr + 6] = HEAP8[ptr + 6];
	HEAP8[tempDoublePtr + 7] = HEAP8[ptr + 7];
}
var ___timespec_struct_layout = {
	__size__: 8,
	tv_sec: 0,
	tv_nsec: 4
};

function _clock_gettime(clk_id, tp)
{
	// int clock_gettime(clockid_t clk_id, struct timespec *tp);
	var now = Date.now();
	HEAP32[(((tp) + (___timespec_struct_layout.tv_sec)) >> 2)] = Math.floor(now / 1000); // seconds
	HEAP32[(((tp) + (___timespec_struct_layout.tv_nsec)) >> 2)] = 0; // nanoseconds - not supported
	return 0;
}
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
	ENOMSG: 35,
	EIDRM: 36,
	ECHRNG: 37,
	EL2NSYNC: 38,
	EL3HLT: 39,
	EL3RST: 40,
	ELNRNG: 41,
	EUNATCH: 42,
	ENOCSI: 43,
	EL2HLT: 44,
	EDEADLK: 45,
	ENOLCK: 46,
	EBADE: 50,
	EBADR: 51,
	EXFULL: 52,
	ENOANO: 53,
	EBADRQC: 54,
	EBADSLT: 55,
	EDEADLOCK: 56,
	EBFONT: 57,
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
	EMULTIHOP: 74,
	ELBIN: 75,
	EDOTDOT: 76,
	EBADMSG: 77,
	EFTYPE: 79,
	ENOTUNIQ: 80,
	EBADFD: 81,
	EREMCHG: 82,
	ELIBACC: 83,
	ELIBBAD: 84,
	ELIBSCN: 85,
	ELIBMAX: 86,
	ELIBEXEC: 87,
	ENOSYS: 88,
	ENMFILE: 89,
	ENOTEMPTY: 90,
	ENAMETOOLONG: 91,
	ELOOP: 92,
	EOPNOTSUPP: 95,
	EPFNOSUPPORT: 96,
	ECONNRESET: 104,
	ENOBUFS: 105,
	EAFNOSUPPORT: 106,
	EPROTOTYPE: 107,
	ENOTSOCK: 108,
	ENOPROTOOPT: 109,
	ESHUTDOWN: 110,
	ECONNREFUSED: 111,
	EADDRINUSE: 112,
	ECONNABORTED: 113,
	ENETUNREACH: 114,
	ENETDOWN: 115,
	ETIMEDOUT: 116,
	EHOSTDOWN: 117,
	EHOSTUNREACH: 118,
	EINPROGRESS: 119,
	EALREADY: 120,
	EDESTADDRREQ: 121,
	EMSGSIZE: 122,
	EPROTONOSUPPORT: 123,
	ESOCKTNOSUPPORT: 124,
	EADDRNOTAVAIL: 125,
	ENETRESET: 126,
	EISCONN: 127,
	ENOTCONN: 128,
	ETOOMANYREFS: 129,
	EPROCLIM: 130,
	EUSERS: 131,
	EDQUOT: 132,
	ESTALE: 133,
	ENOTSUP: 134,
	ENOMEDIUM: 135,
	ENOSHARE: 136,
	ECASECLASH: 137,
	EILSEQ: 138,
	EOVERFLOW: 139,
	ECANCELED: 140,
	ENOTRECOVERABLE: 141,
	EOWNERDEAD: 142,
	ESTRPIPE: 143
};
var ___errno_state = 0;

function ___setErrNo(value)
{
	// For convenient setting and returning of errno.
	HEAP32[((___errno_state) >> 2)] = value
	return value;
}
var _stdin = allocate(1, "i32*", ALLOC_STATIC);
var _stdout = allocate(1, "i32*", ALLOC_STATIC);
var _stderr = allocate(1, "i32*", ALLOC_STATIC);
var __impure_ptr = allocate(1, "i32*", ALLOC_STATIC);
var FS = {
	currentPath: "/",
	nextInode: 2,
	streams: [null],
	ignorePermissions: true,
	createFileHandle: function (stream, fd)
	{
		if (typeof stream === 'undefined')
		{
			stream = null;
		}
		if (!fd)
		{
			if (stream && stream.socket)
			{
				for (var i = 1; i < 64; i++)
				{
					if (!FS.streams[i])
					{
						fd = i;
						break;
					}
				}
				assert(fd, 'ran out of low fds for sockets');
			}
			else
			{
				fd = Math.max(FS.streams.length, 64);
				for (var i = FS.streams.length; i < fd; i++)
				{
					FS.streams[i] = null; // Keep dense
				}
			}
		}
		// Close WebSocket first if we are about to replace the fd (i.e. dup2)
		if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close)
		{
			FS.streams[fd].socket.close();
		}
		FS.streams[fd] = stream;
		return fd;
	},
	removeFileHandle: function (fd)
	{
		FS.streams[fd] = null;
	},
	joinPath: function (parts, forceRelative)
	{
		var ret = parts[0];
		for (var i = 1; i < parts.length; i++)
		{
			if (ret[ret.length - 1] != '/') ret += '/';
			ret += parts[i];
		}
		if (forceRelative && ret[0] == '/') ret = ret.substr(1);
		return ret;
	},
	absolutePath: function (relative, base)
	{
		if (typeof relative !== 'string') return null;
		if (base === undefined) base = FS.currentPath;
		if (relative && relative[0] == '/') base = '';
		var full = base + '/' + relative;
		var parts = full.split('/').reverse();
		var absolute = [''];
		while (parts.length)
		{
			var part = parts.pop();
			if (part == '' || part == '.')
			{
				// Nothing.
			}
			else if (part == '..')
			{
				if (absolute.length > 1) absolute.pop();
			}
			else
			{
				absolute.push(part);
			}
		}
		return absolute.length == 1 ? '/' : absolute.join('/');
	},
	analyzePath: function (path, dontResolveLastLink, linksVisited)
	{
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
		path = FS.absolutePath(path);
		if (path == '/')
		{
			ret.isRoot = true;
			ret.exists = ret.parentExists = true;
			ret.name = '/';
			ret.path = ret.parentPath = '/';
			ret.object = ret.parentObject = FS.root;
		}
		else if (path !== null)
		{
			linksVisited = linksVisited || 0;
			path = path.slice(1).split('/');
			var current = FS.root;
			var traversed = [''];
			while (path.length)
			{
				if (path.length == 1 && current.isFolder)
				{
					ret.parentExists = true;
					ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
					ret.parentObject = current;
					ret.name = path[0];
				}
				var target = path.shift();
				if (!current.isFolder)
				{
					ret.error = ERRNO_CODES.ENOTDIR;
					break;
				}
				else if (!current.read)
				{
					ret.error = ERRNO_CODES.EACCES;
					break;
				}
				else if (!current.contents.hasOwnProperty(target))
				{
					ret.error = ERRNO_CODES.ENOENT;
					break;
				}
				current = current.contents[target];
				if (current.link && !(dontResolveLastLink && path.length == 0))
				{
					if (linksVisited > 40)
					{ // Usual Linux SYMLOOP_MAX.
						ret.error = ERRNO_CODES.ELOOP;
						break;
					}
					var link = FS.absolutePath(current.link, traversed.join('/'));
					ret = FS.analyzePath([link].concat(path).join('/'),
						dontResolveLastLink, linksVisited + 1);
					return ret;
				}
				traversed.push(target);
				if (path.length == 0)
				{
					ret.exists = true;
					ret.path = traversed.join('/');
					ret.object = current;
				}
			}
		}
		return ret;
	},
	findObject: function (path, dontResolveLastLink)
	{
		var ret = FS.analyzePath(path, dontResolveLastLink);
		if (ret.exists)
		{
			return ret.object;
		}
		else
		{
			___setErrNo(ret.error);
			return null;
		}
	},
	createObject: function (parent, name, properties, canRead, canWrite)
	{
		if (!parent) parent = '/';
		if (typeof parent === 'string') parent = FS.findObject(parent);
		if (!parent)
		{
			___setErrNo(ERRNO_CODES.EACCES);
			throw new Error('Parent path must exist.');
		}
		if (!parent.isFolder)
		{
			___setErrNo(ERRNO_CODES.ENOTDIR);
			throw new Error('Parent must be a folder.');
		}
		if (!parent.write && !FS.ignorePermissions)
		{
			___setErrNo(ERRNO_CODES.EACCES);
			throw new Error('Parent folder must be writeable.');
		}
		if (!name || name == '.' || name == '..')
		{
			___setErrNo(ERRNO_CODES.ENOENT);
			throw new Error('Name must not be empty.');
		}
		if (parent.contents.hasOwnProperty(name))
		{
			___setErrNo(ERRNO_CODES.EEXIST);
			throw new Error("Can't overwrite object.");
		}
		parent.contents[name] = {
			read: canRead === undefined ? true : canRead,
			write: canWrite === undefined ? false : canWrite,
			timestamp: Date.now(),
			inodeNumber: FS.nextInode++
		};
		for (var key in properties)
		{
			if (properties.hasOwnProperty(key))
			{
				parent.contents[name][key] = properties[key];
			}
		}
		return parent.contents[name];
	},
	createFolder: function (parent, name, canRead, canWrite)
	{
		var properties = {
			isFolder: true,
			isDevice: false,
			contents:
			{}
		};
		return FS.createObject(parent, name, properties, canRead, canWrite);
	},
	createPath: function (parent, path, canRead, canWrite)
	{
		var current = FS.findObject(parent);
		if (current === null) throw new Error('Invalid parent.');
		path = path.split('/').reverse();
		while (path.length)
		{
			var part = path.pop();
			if (!part) continue;
			if (!current.contents.hasOwnProperty(part))
			{
				FS.createFolder(current, part, canRead, canWrite);
			}
			current = current.contents[part];
		}
		return current;
	},
	createFile: function (parent, name, properties, canRead, canWrite)
	{
		properties.isFolder = false;
		return FS.createObject(parent, name, properties, canRead, canWrite);
	},
	createDataFile: function (parent, name, data, canRead, canWrite)
	{
		if (typeof data === 'string')
		{
			var dataArray = new Array(data.length);
			for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
			data = dataArray;
		}
		var properties = {
			isDevice: false,
			contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
		};
		return FS.createFile(parent, name, properties, canRead, canWrite);
	},
	createLazyFile: function (parent, name, url, canRead, canWrite)
	{
		if (typeof XMLHttpRequest !== 'undefined')
		{
			if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
			// Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
			var LazyUint8Array = function ()
			{
				this.lengthKnown = false;
				this.chunks = []; // Loaded chunks. Index is the chunk number
			}
			LazyUint8Array.prototype.get = function (idx)
			{
				if (idx > this.length - 1 || idx < 0)
				{
					return undefined;
				}
				var chunkOffset = idx % this.chunkSize;
				var chunkNum = Math.floor(idx / this.chunkSize);
				return this.getter(chunkNum)[chunkOffset];
			}
			LazyUint8Array.prototype.setDataGetter = function (getter)
			{
				this.getter = getter;
			}
			LazyUint8Array.prototype.cacheLength = function ()
			{
				// Find length
				var xhr = new XMLHttpRequest();
				xhr.open('HEAD', url, false);
				xhr.send(null);
				if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " +
					url + ". Status: " + xhr.status);
				var datalength = Number(xhr.getResponseHeader("Content-length"));
				var header;
				var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
				var chunkSize = 1024 * 1024; // Chunk size in bytes
				if (!hasByteServing) chunkSize = datalength;
				// Function to get a range from the remote URL.
				var doXHR = (function (from, to)
				{
					if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
					if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
					// TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
					var xhr = new XMLHttpRequest();
					xhr.open('GET', url, false);
					if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
					// Some hints to the browser that we want binary data.
					if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
					if (xhr.overrideMimeType)
					{
						xhr.overrideMimeType('text/plain; charset=x-user-defined');
					}
					xhr.send(null);
					if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " +
						url + ". Status: " + xhr.status);
					if (xhr.response !== undefined)
					{
						return new Uint8Array(xhr.response || []);
					}
					else
					{
						return intArrayFromString(xhr.responseText || '', true);
					}
				});
				var lazyArray = this;
				lazyArray.setDataGetter(function (chunkNum)
				{
					var start = chunkNum * chunkSize;
					var end = (chunkNum + 1) * chunkSize - 1; // including this byte
					end = Math.min(end, datalength - 1); // if datalength-1 is selected, this is the last block
					if (typeof (lazyArray.chunks[chunkNum]) === "undefined")
					{
						lazyArray.chunks[chunkNum] = doXHR(start, end);
					}
					if (typeof (lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
					return lazyArray.chunks[chunkNum];
				});
				this._length = datalength;
				this._chunkSize = chunkSize;
				this.lengthKnown = true;
			}
			var lazyArray = new LazyUint8Array();
			Object.defineProperty(lazyArray, "length",
			{
				get: function ()
				{
					if (!this.lengthKnown)
					{
						this.cacheLength();
					}
					return this._length;
				}
			});
			Object.defineProperty(lazyArray, "chunkSize",
			{
				get: function ()
				{
					if (!this.lengthKnown)
					{
						this.cacheLength();
					}
					return this._chunkSize;
				}
			});
			var properties = {
				isDevice: false,
				contents: lazyArray
			};
		}
		else
		{
			var properties = {
				isDevice: false,
				url: url
			};
		}
		return FS.createFile(parent, name, properties, canRead, canWrite);
	},
	createPreloadedFile: function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile)
	{
		Browser.init();
		var fullname = FS.joinPath([parent, name], true);

		function processData(byteArray)
		{
			function finish(byteArray)
			{
				if (!dontCreateFile)
				{
					FS.createDataFile(parent, name, byteArray, canRead, canWrite);
				}
				if (onload) onload();
				removeRunDependency('cp ' + fullname);
			}
			var handled = false;
			Module['preloadPlugins'].forEach(function (plugin)
			{
				if (handled) return;
				if (plugin['canHandle'](fullname))
				{
					plugin['handle'](byteArray, fullname, finish, function ()
					{
						if (onerror) onerror();
						removeRunDependency('cp ' + fullname);
					});
					handled = true;
				}
			});
			if (!handled) finish(byteArray);
		}
		addRunDependency('cp ' + fullname);
		if (typeof url == 'string')
		{
			Browser.asyncLoad(url, function (byteArray)
			{
				processData(byteArray);
			}, onerror);
		}
		else
		{
			processData(url);
		}
	},
	createLink: function (parent, name, target, canRead, canWrite)
	{
		var properties = {
			isDevice: false,
			link: target
		};
		return FS.createFile(parent, name, properties, canRead, canWrite);
	},
	createDevice: function (parent, name, input, output)
	{
		if (!(input || output))
		{
			throw new Error('A device must have at least one callback defined.');
		}
		var ops = {
			isDevice: true,
			input: input,
			output: output
		};
		return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
	},
	forceLoadFile: function (obj)
	{
		if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
		var success = true;
		if (typeof XMLHttpRequest !== 'undefined')
		{
			throw new Error(
				"Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
			);
		}
		else if (Module['read'])
		{
			// Command-line.
			try
			{
				// WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
				//          read() will try to parse UTF8.
				obj.contents = intArrayFromString(Module['read'](obj.url), true);
			}
			catch (e)
			{
				success = false;
			}
		}
		else
		{
			throw new Error('Cannot load without read() or XMLHttpRequest.');
		}
		if (!success) ___setErrNo(ERRNO_CODES.EIO);
		return success;
	},
	staticInit: function ()
	{
		// The main file system tree. All the contents are inside this.
		FS.root = {
			read: true,
			write: true,
			isFolder: true,
			isDevice: false,
			timestamp: Date.now(),
			inodeNumber: 1,
			contents:
			{}
		};
		// Create the temporary folder, if not already created
		try
		{
			FS.createFolder('/', 'tmp', true, true);
		}
		catch (e)
		{}
		FS.createFolder('/', 'dev', true, true);
	},
	init: function (input, output, error)
	{
		// Make sure we initialize only once.
		assert(!FS.init.initialized,
			'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)'
		);
		FS.init.initialized = true;
		// Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
		input = input || Module['stdin'];
		output = output || Module['stdout'];
		error = error || Module['stderr'];
		// Default handlers.
		var stdinOverridden = true,
			stdoutOverridden = true,
			stderrOverridden = true;
		if (!input)
		{
			stdinOverridden = false;
			input = function ()
			{
				if (!input.cache || !input.cache.length)
				{
					var result;
					if (typeof window != 'undefined' &&
						typeof window.prompt == 'function')
					{
						// Browser.
						result = window.prompt('Input: ');
						if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
					}
					else if (typeof readline == 'function')
					{
						// Command line.
						result = readline();
					}
					if (!result) result = '';
					input.cache = intArrayFromString(result + '\n', true);
				}
				return input.cache.shift();
			};
		}
		var utf8 = new Runtime.UTF8Processor();

		function createSimpleOutput()
		{
			var fn = function (val)
			{
				if (val === null || val === 10)
				{
					fn.printer(fn.buffer.join(''));
					fn.buffer = [];
				}
				else
				{
					fn.buffer.push(utf8.processCChar(val));
				}
			};
			return fn;
		}
		if (!output)
		{
			stdoutOverridden = false;
			output = createSimpleOutput();
		}
		if (!output.printer) output.printer = Module['print'];
		if (!output.buffer) output.buffer = [];
		if (!error)
		{
			stderrOverridden = false;
			error = createSimpleOutput();
		}
		if (!error.printer) error.printer = Module['printErr'];
		if (!error.buffer) error.buffer = [];
		// Create the I/O devices.
		var stdin = FS.createDevice('/dev', 'stdin', input);
		stdin.isTerminal = !stdinOverridden;
		var stdout = FS.createDevice('/dev', 'stdout', null, output);
		stdout.isTerminal = !stdoutOverridden;
		var stderr = FS.createDevice('/dev', 'stderr', null, error);
		stderr.isTerminal = !stderrOverridden;
		FS.createDevice('/dev', 'tty', input, output);
		FS.createDevice('/dev', 'null', function () {}, function () {});
		// Create default streams.
		FS.streams[1] = {
			path: '/dev/stdin',
			object: stdin,
			position: 0,
			isRead: true,
			isWrite: false,
			isAppend: false,
			error: false,
			eof: false,
			ungotten: []
		};
		FS.streams[2] = {
			path: '/dev/stdout',
			object: stdout,
			position: 0,
			isRead: false,
			isWrite: true,
			isAppend: false,
			error: false,
			eof: false,
			ungotten: []
		};
		FS.streams[3] = {
			path: '/dev/stderr',
			object: stderr,
			position: 0,
			isRead: false,
			isWrite: true,
			isAppend: false,
			error: false,
			eof: false,
			ungotten: []
		};
		// TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
		HEAP32[((_stdin) >> 2)] = 1;
		HEAP32[((_stdout) >> 2)] = 2;
		HEAP32[((_stderr) >> 2)] = 3;
		// Other system paths
		FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
		// Newlib initialization
		for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++)
		{
			FS.streams[i] = null; // Make sure to keep FS.streams dense
		}
		FS.streams[_stdin] = FS.streams[1];
		FS.streams[_stdout] = FS.streams[2];
		FS.streams[_stderr] = FS.streams[3];
		allocate([allocate(
			[0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
			'void*', ALLOC_NORMAL)], 'void*', ALLOC_NONE, __impure_ptr);
	},
	quit: function ()
	{
		if (!FS.init.initialized) return;
		// Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
		if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
		if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
	},
	standardizePath: function (path)
	{
		if (path.substr(0, 2) == './') path = path.substr(2);
		return path;
	},
	deleteFile: function (path)
	{
		path = FS.analyzePath(path);
		if (!path.parentExists || !path.exists)
		{
			throw 'Invalid path ' + path;
		}
		delete path.parentObject.contents[path.name];
	}
};

function _send(fd, buf, len, flags)
{
	var info = FS.streams[fd];
	if (!info) return -1;
	info.sender(HEAPU8.subarray(buf, buf + len));
	return len;
}

function _pwrite(fildes, buf, nbyte, offset)
{
	// ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
	// http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
	var stream = FS.streams[fildes];
	if (!stream || stream.object.isDevice)
	{
		___setErrNo(ERRNO_CODES.EBADF);
		return -1;
	}
	else if (!stream.isWrite)
	{
		___setErrNo(ERRNO_CODES.EACCES);
		return -1;
	}
	else if (stream.object.isFolder)
	{
		___setErrNo(ERRNO_CODES.EISDIR);
		return -1;
	}
	else if (nbyte < 0 || offset < 0)
	{
		___setErrNo(ERRNO_CODES.EINVAL);
		return -1;
	}
	else
	{
		var contents = stream.object.contents;
		while (contents.length < offset) contents.push(0);
		for (var i = 0; i < nbyte; i++)
		{
			contents[offset + i] = HEAPU8[(((buf) + (i)) | 0)];
		}
		stream.object.timestamp = Date.now();
		return i;
	}
}

function _write(fildes, buf, nbyte)
{
	// ssize_t write(int fildes, const void *buf, size_t nbyte);
	// http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
	var stream = FS.streams[fildes];
	if (stream && ('socket' in stream))
	{
		return _send(fildes, buf, nbyte, 0);
	}
	else if (!stream)
	{
		___setErrNo(ERRNO_CODES.EBADF);
		return -1;
	}
	else if (!stream.isWrite)
	{
		___setErrNo(ERRNO_CODES.EACCES);
		return -1;
	}
	else if (nbyte < 0)
	{
		___setErrNo(ERRNO_CODES.EINVAL);
		return -1;
	}
	else
	{
		if (stream.object.isDevice)
		{
			if (stream.object.output)
			{
				for (var i = 0; i < nbyte; i++)
				{
					try
					{
						stream.object.output(HEAP8[(((buf) + (i)) | 0)]);
					}
					catch (e)
					{
						___setErrNo(ERRNO_CODES.EIO);
						return -1;
					}
				}
				stream.object.timestamp = Date.now();
				return i;
			}
			else
			{
				___setErrNo(ERRNO_CODES.ENXIO);
				return -1;
			}
		}
		else
		{
			var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
			if (bytesWritten != -1) stream.position += bytesWritten;
			return bytesWritten;
		}
	}
}

function _fwrite(ptr, size, nitems, stream)
{
	// size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
	// http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
	var bytesToWrite = nitems * size;
	if (bytesToWrite == 0) return 0;
	var bytesWritten = _write(stream, ptr, bytesToWrite);
	if (bytesWritten == -1)
	{
		if (FS.streams[stream]) FS.streams[stream].error = true;
		return 0;
	}
	else
	{
		return Math.floor(bytesWritten / size);
	}
}
Module["_strlen"] = _strlen;

function __reallyNegative(x)
{
	return x < 0 || (x === 0 && (1 / x) === -Infinity);
}

function __formatString(format, varargs)
{
	var textIndex = format;
	var argIndex = 0;

	function getNextArg(type)
	{
		// NOTE: Explicitly ignoring type safety. Otherwise this fails:
		//       int x = 4; printf("%c\n", (char)x);
		var ret;
		if (type === 'double')
		{
			ret = HEAPF64[(((varargs) + (argIndex)) >> 3)];
		}
		else if (type == 'i64')
		{
			ret = [HEAP32[(((varargs) + (argIndex)) >> 2)],
				HEAP32[(((varargs) + (argIndex + 8)) >> 2)]
			];
			argIndex += 8; // each 32-bit chunk is in a 64-bit block
		}
		else
		{
			type = 'i32'; // varargs are always i32, i64, or double
			ret = HEAP32[(((varargs) + (argIndex)) >> 2)];
		}
		argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
		return ret;
	}
	var ret = [];
	var curr, next, currArg;
	while (1)
	{
		var startTextIndex = textIndex;
		curr = HEAP8[(textIndex)];
		if (curr === 0) break;
		next = HEAP8[((textIndex + 1) | 0)];
		if (curr == 37)
		{
			// Handle flags.
			var flagAlwaysSigned = false;
			var flagLeftAlign = false;
			var flagAlternative = false;
			var flagZeroPad = false;
			flagsLoop: while (1)
			{
				switch (next)
				{
				case 43:
					flagAlwaysSigned = true;
					break;
				case 45:
					flagLeftAlign = true;
					break;
				case 35:
					flagAlternative = true;
					break;
				case 48:
					if (flagZeroPad)
					{
						break flagsLoop;
					}
					else
					{
						flagZeroPad = true;
						break;
					}
				default:
					break flagsLoop;
				}
				textIndex++;
				next = HEAP8[((textIndex + 1) | 0)];
			}
			// Handle width.
			var width = 0;
			if (next == 42)
			{
				width = getNextArg('i32');
				textIndex++;
				next = HEAP8[((textIndex + 1) | 0)];
			}
			else
			{
				while (next >= 48 && next <= 57)
				{
					width = width * 10 + (next - 48);
					textIndex++;
					next = HEAP8[((textIndex + 1) | 0)];
				}
			}
			// Handle precision.
			var precisionSet = false;
			if (next == 46)
			{
				var precision = 0;
				precisionSet = true;
				textIndex++;
				next = HEAP8[((textIndex + 1) | 0)];
				if (next == 42)
				{
					precision = getNextArg('i32');
					textIndex++;
				}
				else
				{
					while (1)
					{
						var precisionChr = HEAP8[((textIndex + 1) | 0)];
						if (precisionChr < 48 ||
							precisionChr > 57) break;
						precision = precision * 10 + (precisionChr - 48);
						textIndex++;
					}
				}
				next = HEAP8[((textIndex + 1) | 0)];
			}
			else
			{
				var precision = 6; // Standard default.
			}
			// Handle integer sizes. WARNING: These assume a 32-bit architecture!
			var argSize;
			switch (String.fromCharCode(next))
			{
			case 'h':
				var nextNext = HEAP8[((textIndex + 2) | 0)];
				if (nextNext == 104)
				{
					textIndex++;
					argSize = 1; // char (actually i32 in varargs)
				}
				else
				{
					argSize = 2; // short (actually i32 in varargs)
				}
				break;
			case 'l':
				var nextNext = HEAP8[((textIndex + 2) | 0)];
				if (nextNext == 108)
				{
					textIndex++;
					argSize = 8; // long long
				}
				else
				{
					argSize = 4; // long
				}
				break;
			case 'L': // long long
			case 'q': // int64_t
			case 'j': // intmax_t
				argSize = 8;
				break;
			case 'z': // size_t
			case 't': // ptrdiff_t
			case 'I': // signed ptrdiff_t or unsigned size_t
				argSize = 4;
				break;
			default:
				argSize = null;
			}
			if (argSize) textIndex++;
			next = HEAP8[((textIndex + 1) | 0)];
			// Handle type specifier.
			switch (String.fromCharCode(next))
			{
			case 'd':
			case 'i':
			case 'u':
			case 'o':
			case 'x':
			case 'X':
			case 'p':
				{
					// Integer.
					var signed = next == 100 || next == 105;
					argSize = argSize || 4;
					var currArg = getNextArg('i' + (argSize * 8));
					var origArg = currArg;
					var argText;
					// Flatten i64-1 [low, high] into a (slightly rounded) double
					if (argSize == 8)
					{
						currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
					}
					// Truncate to requested size.
					if (argSize <= 4)
					{
						var limit = Math.pow(256, argSize) - 1;
						currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
					}
					// Format the number.
					var currAbsArg = Math.abs(currArg);
					var prefix = '';
					if (next == 100 || next == 105)
					{
						if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null);
						else
							argText = reSign(currArg, 8 * argSize, 1).toString(10);
					}
					else if (next == 117)
					{
						if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true);
						else
							argText = unSign(currArg, 8 * argSize, 1).toString(10);
						currArg = Math.abs(currArg);
					}
					else if (next == 111)
					{
						argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
					}
					else if (next == 120 || next == 88)
					{
						prefix = (flagAlternative && currArg != 0) ? '0x' : '';
						if (argSize == 8 && i64Math)
						{
							if (origArg[1])
							{
								argText = (origArg[1] >>> 0).toString(16);
								var lower = (origArg[0] >>> 0).toString(16);
								while (lower.length < 8) lower = '0' + lower;
								argText += lower;
							}
							else
							{
								argText = (origArg[0] >>> 0).toString(16);
							}
						}
						else
						if (currArg < 0)
						{
							// Represent negative numbers in hex as 2's complement.
							currArg = -currArg;
							argText = (currAbsArg - 1).toString(16);
							var buffer = [];
							for (var i = 0; i < argText.length; i++)
							{
								buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
							}
							argText = buffer.join('');
							while (argText.length < argSize * 2) argText = 'f' + argText;
						}
						else
						{
							argText = currAbsArg.toString(16);
						}
						if (next == 88)
						{
							prefix = prefix.toUpperCase();
							argText = argText.toUpperCase();
						}
					}
					else if (next == 112)
					{
						if (currAbsArg === 0)
						{
							argText = '(nil)';
						}
						else
						{
							prefix = '0x';
							argText = currAbsArg.toString(16);
						}
					}
					if (precisionSet)
					{
						while (argText.length < precision)
						{
							argText = '0' + argText;
						}
					}
					// Add sign if needed
					if (flagAlwaysSigned)
					{
						if (currArg < 0)
						{
							prefix = '-' + prefix;
						}
						else
						{
							prefix = '+' + prefix;
						}
					}
					// Add padding.
					while (prefix.length + argText.length < width)
					{
						if (flagLeftAlign)
						{
							argText += ' ';
						}
						else
						{
							if (flagZeroPad)
							{
								argText = '0' + argText;
							}
							else
							{
								prefix = ' ' + prefix;
							}
						}
					}
					// Insert the result into the buffer.
					argText = prefix + argText;
					argText.split('').forEach(function (chr)
					{
						ret.push(chr.charCodeAt(0));
					});
					break;
				}
			case 'f':
			case 'F':
			case 'e':
			case 'E':
			case 'g':
			case 'G':
				{
					// Float.
					var currArg = getNextArg('double');
					var argText;
					if (isNaN(currArg))
					{
						argText = 'nan';
						flagZeroPad = false;
					}
					else if (!isFinite(currArg))
					{
						argText = (currArg < 0 ? '-' : '') + 'inf';
						flagZeroPad = false;
					}
					else
					{
						var isGeneral = false;
						var effectivePrecision = Math.min(precision, 20);
						// Convert g/G to f/F or e/E, as per:
						// http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
						if (next == 103 || next == 71)
						{
							isGeneral = true;
							precision = precision || 1;
							var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
							if (precision > exponent && exponent >= -4)
							{
								next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
								precision -= exponent + 1;
							}
							else
							{
								next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
								precision--;
							}
							effectivePrecision = Math.min(precision, 20);
						}
						if (next == 101 || next == 69)
						{
							argText = currArg.toExponential(effectivePrecision);
							// Make sure the exponent has at least 2 digits.
							if (/[eE][-+]\d$/.test(argText))
							{
								argText = argText.slice(0, -1) + '0' + argText.slice(-1);
							}
						}
						else if (next == 102 || next == 70)
						{
							argText = currArg.toFixed(effectivePrecision);
							if (currArg === 0 && __reallyNegative(currArg))
							{
								argText = '-' + argText;
							}
						}
						var parts = argText.split('e');
						if (isGeneral && !flagAlternative)
						{
							// Discard trailing zeros and periods.
							while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
								(parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.'))
							{
								parts[0] = parts[0].slice(0, -1);
							}
						}
						else
						{
							// Make sure we have a period in alternative mode.
							if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
							// Zero pad until required precision.
							while (precision > effectivePrecision++) parts[0] += '0';
						}
						argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
						// Capitalize 'E' if needed.
						if (next == 69) argText = argText.toUpperCase();
						// Add sign.
						if (flagAlwaysSigned && currArg >= 0)
						{
							argText = '+' + argText;
						}
					}
					// Add padding.
					while (argText.length < width)
					{
						if (flagLeftAlign)
						{
							argText += ' ';
						}
						else
						{
							if (flagZeroPad && (argText[0] == '-' || argText[0] == '+'))
							{
								argText = argText[0] + '0' + argText.slice(1);
							}
							else
							{
								argText = (flagZeroPad ? '0' : ' ') + argText;
							}
						}
					}
					// Adjust case.
					if (next < 97) argText = argText.toUpperCase();
					// Insert the result into the buffer.
					argText.split('').forEach(function (chr)
					{
						ret.push(chr.charCodeAt(0));
					});
					break;
				}
			case 's':
				{
					// String.
					var arg = getNextArg('i8*');
					var argLength = arg ? _strlen(arg) : '(null)'.length;
					if (precisionSet) argLength = Math.min(argLength, precision);
					if (!flagLeftAlign)
					{
						while (argLength < width--)
						{
							ret.push(32);
						}
					}
					if (arg)
					{
						for (var i = 0; i < argLength; i++)
						{
							ret.push(HEAPU8[((arg++) | 0)]);
						}
					}
					else
					{
						ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
					}
					if (flagLeftAlign)
					{
						while (argLength < width--)
						{
							ret.push(32);
						}
					}
					break;
				}
			case 'c':
				{
					// Character.
					if (flagLeftAlign) ret.push(getNextArg('i8'));
					while (--width > 0)
					{
						ret.push(32);
					}
					if (!flagLeftAlign) ret.push(getNextArg('i8'));
					break;
				}
			case 'n':
				{
					// Write the length written so far to the next parameter.
					var ptr = getNextArg('i32*');
					HEAP32[((ptr) >> 2)] = ret.length
					break;
				}
			case '%':
				{
					// Literal percent sign.
					ret.push(curr);
					break;
				}
			default:
				{
					// Unknown specifiers remain untouched.
					for (var i = startTextIndex; i < textIndex + 2; i++)
					{
						ret.push(HEAP8[(i)]);
					}
				}
			}
			textIndex += 2;
			// TODO: Support a/A (hex float) and m (last error) specifiers.
			// TODO: Support %1${specifier} for arg selection.
		}
		else
		{
			ret.push(curr);
			textIndex += 1;
		}
	}
	return ret;
}

function _fprintf(stream, format, varargs)
{
	// int fprintf(FILE *restrict stream, const char *restrict format, ...);
	// http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
	var result = __formatString(format, varargs);
	var stack = Runtime.stackSave();
	var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
	Runtime.stackRestore(stack);
	return ret;
}

function _printf(format, varargs)
{
	// int printf(const char *restrict format, ...);
	// http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
	var stdout = HEAP32[((_stdout) >> 2)];
	return _fprintf(stdout, format, varargs);
}

function _abort()
{
	Module['abort']();
}

function ___errno_location()
{
	return ___errno_state;
}
var ___errno = ___errno_location;
Module["_memcpy"] = _memcpy;
var _llvm_memcpy_p0i8_p0i8_i32 = _memcpy;

function _sysconf(name)
{
	// long sysconf(int name);
	// http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
	switch (name)
	{
	case 8:
		return PAGE_SIZE;
	case 54:
	case 56:
	case 21:
	case 61:
	case 63:
	case 22:
	case 67:
	case 23:
	case 24:
	case 25:
	case 26:
	case 27:
	case 69:
	case 28:
	case 101:
	case 70:
	case 71:
	case 29:
	case 30:
	case 199:
	case 75:
	case 76:
	case 32:
	case 43:
	case 44:
	case 80:
	case 46:
	case 47:
	case 45:
	case 48:
	case 49:
	case 42:
	case 82:
	case 33:
	case 7:
	case 108:
	case 109:
	case 107:
	case 112:
	case 119:
	case 121:
		return 200809;
	case 13:
	case 104:
	case 94:
	case 95:
	case 34:
	case 35:
	case 77:
	case 81:
	case 83:
	case 84:
	case 85:
	case 86:
	case 87:
	case 88:
	case 89:
	case 90:
	case 91:
	case 94:
	case 95:
	case 110:
	case 111:
	case 113:
	case 114:
	case 115:
	case 116:
	case 117:
	case 118:
	case 120:
	case 40:
	case 16:
	case 79:
	case 19:
		return -1;
	case 92:
	case 93:
	case 5:
	case 72:
	case 6:
	case 74:
	case 92:
	case 93:
	case 96:
	case 97:
	case 98:
	case 99:
	case 102:
	case 103:
	case 105:
		return 1;
	case 38:
	case 66:
	case 50:
	case 51:
	case 4:
		return 1024;
	case 15:
	case 64:
	case 41:
		return 32;
	case 55:
	case 37:
	case 17:
		return 2147483647;
	case 18:
	case 1:
		return 47839;
	case 59:
	case 57:
		return 99;
	case 68:
	case 58:
		return 2048;
	case 0:
		return 2097152;
	case 3:
		return 65536;
	case 14:
		return 32768;
	case 73:
		return 32767;
	case 39:
		return 16384;
	case 60:
		return 1000;
	case 106:
		return 700;
	case 52:
		return 256;
	case 62:
		return 255;
	case 2:
		return 100;
	case 65:
		return 64;
	case 36:
		return 20;
	case 100:
		return 16;
	case 20:
		return 6;
	case 53:
		return 4;
	case 10:
		return 1;
	}
	___setErrNo(ERRNO_CODES.EINVAL);
	return -1;
}

function _time(ptr)
{
	var ret = Math.floor(Date.now() / 1000);
	if (ptr)
	{
		HEAP32[((ptr) >> 2)] = ret
	}
	return ret;
}

function _sbrk(bytes)
{
	// Implement a Linux-like 'memory area' for our 'process'.
	// Changes the size of the memory area by |bytes|; returns the
	// address of the previous top ('break') of the memory area
	// We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
	var self = _sbrk;
	if (!self.called)
	{
		DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
		self.called = true;
		assert(Runtime.dynamicAlloc);
		self.alloc = Runtime.dynamicAlloc;
		Runtime.dynamicAlloc = function ()
		{
			abort('cannot dynamically allocate, sbrk now has control')
		};
	}
	var ret = DYNAMICTOP;
	if (bytes != 0) self.alloc(bytes);
	return ret; // Previous break location.
}
Module["_memset"] = _memset;
var Browser = {
	mainLoop:
	{
		scheduler: null,
		shouldPause: false,
		paused: false,
		queue: [],
		pause: function ()
		{
			Browser.mainLoop.shouldPause = true;
		},
		resume: function ()
		{
			if (Browser.mainLoop.paused)
			{
				Browser.mainLoop.paused = false;
				Browser.mainLoop.scheduler();
			}
			Browser.mainLoop.shouldPause = false;
		},
		updateStatus: function ()
		{
			if (Module['setStatus'])
			{
				var message = Module['statusMessage'] || 'Please wait...';
				var remaining = Browser.mainLoop.remainingBlockers;
				var expected = Browser.mainLoop.expectedBlockers;
				if (remaining)
				{
					if (remaining < expected)
					{
						Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
					}
					else
					{
						Module['setStatus'](message);
					}
				}
				else
				{
					Module['setStatus']('');
				}
			}
		}
	},
	isFullScreen: false,
	pointerLock: false,
	moduleContextCreatedCallbacks: [],
	workers: [],
	init: function ()
	{
		if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
		if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
		Browser.initted = true;
		try
		{
			new Blob();
			Browser.hasBlobConstructor = true;
		}
		catch (e)
		{
			Browser.hasBlobConstructor = false;
			console.log("warning: no blob constructor, cannot create blobs with mimetypes");
		}
		Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder !=
			"undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") :
				null));
		Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log(
			"warning: cannot create object URLs");
		// Support for plugins that can process preloaded files. You can add more of these to
		// your app by creating and appending to Module.preloadPlugins.
		//
		// Each plugin is asked if it can handle a file based on the file's name. If it can,
		// it is given the file's raw data. When it is done, it calls a callback with the file's
		// (possibly modified) data. For example, a plugin might decompress a file, or it
		// might create some side data structure for use later (like an Image element, etc.).
		var imagePlugin = {};
		imagePlugin['canHandle'] = function (name)
		{
			return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
		};
		imagePlugin['handle'] = function (byteArray, name, onload, onerror)
		{
			var b = null;
			if (Browser.hasBlobConstructor)
			{
				try
				{
					b = new Blob([byteArray],
					{
						type: Browser.getMimetype(name)
					});
					if (b.size !== byteArray.length)
					{ // Safari bug #118630
						// Safari's Blob can only take an ArrayBuffer
						b = new Blob([(new Uint8Array(byteArray)).buffer],
						{
							type: Browser.getMimetype(name)
						});
					}
				}
				catch (e)
				{
					Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
				}
			}
			if (!b)
			{
				var bb = new Browser.BlobBuilder();
				bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
				b = bb.getBlob();
			}
			var url = Browser.URLObject.createObjectURL(b);
			var img = new Image();
			img.onload = function ()
			{
				assert(img.complete, 'Image ' + name + ' could not be decoded');
				var canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;
				var ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0);
				Module["preloadedImages"][name] = canvas;
				Browser.URLObject.revokeObjectURL(url);
				if (onload) onload(byteArray);
			};
			img.onerror = function (event)
			{
				console.log('Image ' + url + ' could not be decoded');
				if (onerror) onerror();
			};
			img.src = url;
		};
		Module['preloadPlugins'].push(imagePlugin);
		var audioPlugin = {};
		audioPlugin['canHandle'] = function (name)
		{
			return !Module.noAudioDecoding && name.substr(-4) in
			{
				'.ogg': 1,
				'.wav': 1,
				'.mp3': 1
			};
		};
		audioPlugin['handle'] = function (byteArray, name, onload, onerror)
		{
			var done = false;

			function finish(audio)
			{
				if (done) return;
				done = true;
				Module["preloadedAudios"][name] = audio;
				if (onload) onload(byteArray);
			}

			function fail()
			{
				if (done) return;
				done = true;
				Module["preloadedAudios"][name] = new Audio(); // empty shim
				if (onerror) onerror();
			}
			if (Browser.hasBlobConstructor)
			{
				try
				{
					var b = new Blob([byteArray],
					{
						type: Browser.getMimetype(name)
					});
				}
				catch (e)
				{
					return fail();
				}
				var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
				var audio = new Audio();
				audio.addEventListener('canplaythrough', function ()
				{
					finish(audio)
				}, false); // use addEventListener due to chromium bug 124926
				audio.onerror = function (event)
				{
					if (done) return;
					console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');

					function encode64(data)
					{
						var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
						var PAD = '=';
						var ret = '';
						var leftchar = 0;
						var leftbits = 0;
						for (var i = 0; i < data.length; i++)
						{
							leftchar = (leftchar << 8) | data[i];
							leftbits += 8;
							while (leftbits >= 6)
							{
								var curr = (leftchar >> (leftbits - 6)) & 0x3f;
								leftbits -= 6;
								ret += BASE[curr];
							}
						}
						if (leftbits == 2)
						{
							ret += BASE[(leftchar & 3) << 4];
							ret += PAD + PAD;
						}
						else if (leftbits == 4)
						{
							ret += BASE[(leftchar & 0xf) << 2];
							ret += PAD;
						}
						return ret;
					}
					audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
					finish(audio); // we don't wait for confirmation this worked - but it's worth trying
				};
				audio.src = url;
				// workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
				Browser.safeSetTimeout(function ()
				{
					finish(audio); // try to use it even though it is not necessarily ready to play
				}, 10000);
			}
			else
			{
				return fail();
			}
		};
		Module['preloadPlugins'].push(audioPlugin);
		// Canvas event setup
		var canvas = Module['canvas'];
		canvas.requestPointerLock = canvas['requestPointerLock'] ||
			canvas['mozRequestPointerLock'] ||
			canvas['webkitRequestPointerLock'];
		canvas.exitPointerLock = document['exitPointerLock'] ||
			document['mozExitPointerLock'] ||
			document['webkitExitPointerLock'] ||
			function () {}; // no-op if function does not exist
		canvas.exitPointerLock = canvas.exitPointerLock.bind(document);

		function pointerLockChange()
		{
			Browser.pointerLock = document['pointerLockElement'] === canvas ||
				document['mozPointerLockElement'] === canvas ||
				document['webkitPointerLockElement'] === canvas;
		}
		document.addEventListener('pointerlockchange', pointerLockChange, false);
		document.addEventListener('mozpointerlockchange', pointerLockChange, false);
		document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
		if (Module['elementPointerLock'])
		{
			canvas.addEventListener("click", function (ev)
			{
				if (!Browser.pointerLock && canvas.requestPointerLock)
				{
					canvas.requestPointerLock();
					ev.preventDefault();
				}
			}, false);
		}
	},
	createContext: function (canvas, useWebGL, setInModule)
	{
		var ctx;
		try
		{
			if (useWebGL)
			{
				ctx = canvas.getContext('experimental-webgl',
				{
					alpha: false
				});
			}
			else
			{
				ctx = canvas.getContext('2d');
			}
			if (!ctx) throw ':(';
		}
		catch (e)
		{
			Module.print('Could not create canvas - ' + e);
			return null;
		}
		if (useWebGL)
		{
			// Set the background of the WebGL canvas to black
			canvas.style.backgroundColor = "black";
			// Warn on context loss
			canvas.addEventListener('webglcontextlost', function (event)
			{
				alert('WebGL context lost. You will need to reload the page.');
			}, false);
		}
		if (setInModule)
		{
			Module.ctx = ctx;
			Module.useWebGL = useWebGL;
			Browser.moduleContextCreatedCallbacks.forEach(function (callback)
			{
				callback()
			});
			Browser.init();
		}
		return ctx;
	},
	destroyContext: function (canvas, useWebGL, setInModule) {},
	fullScreenHandlersInstalled: false,
	lockPointer: undefined,
	resizeCanvas: undefined,
	requestFullScreen: function (lockPointer, resizeCanvas)
	{
		Browser.lockPointer = lockPointer;
		Browser.resizeCanvas = resizeCanvas;
		if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
		if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
		var canvas = Module['canvas'];

		function fullScreenChange()
		{
			Browser.isFullScreen = false;
			if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
				document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
				document['fullScreenElement'] || document['fullscreenElement']) === canvas)
			{
				canvas.cancelFullScreen = document['cancelFullScreen'] ||
					document['mozCancelFullScreen'] ||
					document['webkitCancelFullScreen'];
				canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
				if (Browser.lockPointer) canvas.requestPointerLock();
				Browser.isFullScreen = true;
				if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
			}
			else if (Browser.resizeCanvas)
			{
				Browser.setWindowedCanvasSize();
			}
			if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
		}
		if (!Browser.fullScreenHandlersInstalled)
		{
			Browser.fullScreenHandlersInstalled = true;
			document.addEventListener('fullscreenchange', fullScreenChange, false);
			document.addEventListener('mozfullscreenchange', fullScreenChange, false);
			document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
		}
		canvas.requestFullScreen = canvas['requestFullScreen'] ||
			canvas['mozRequestFullScreen'] ||
			(canvas['webkitRequestFullScreen'] ? function ()
		{
			canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT'])
		} : null);
		canvas.requestFullScreen();
	},
	requestAnimationFrame: function (func)
	{
		if (!window.requestAnimationFrame)
		{
			window.requestAnimationFrame = window['requestAnimationFrame'] ||
				window['mozRequestAnimationFrame'] ||
				window['webkitRequestAnimationFrame'] ||
				window['msRequestAnimationFrame'] ||
				window['oRequestAnimationFrame'] ||
				window['setTimeout'];
		}
		window.requestAnimationFrame(func);
	},
	safeCallback: function (func)
	{
		return function ()
		{
			if (!ABORT) return func.apply(null, arguments);
		};
	},
	safeRequestAnimationFrame: function (func)
	{
		return Browser.requestAnimationFrame(function ()
		{
			if (!ABORT) func();
		});
	},
	safeSetTimeout: function (func, timeout)
	{
		return setTimeout(function ()
		{
			if (!ABORT) func();
		}, timeout);
	},
	safeSetInterval: function (func, timeout)
	{
		return setInterval(function ()
		{
			if (!ABORT) func();
		}, timeout);
	},
	getMimetype: function (name)
	{
		return {
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'png': 'image/png',
			'bmp': 'image/bmp',
			'ogg': 'audio/ogg',
			'wav': 'audio/wav',
			'mp3': 'audio/mpeg'
		}[name.substr(name.lastIndexOf('.') + 1)];
	},
	getUserMedia: function (func)
	{
		if (!window.getUserMedia)
		{
			window.getUserMedia = navigator['getUserMedia'] ||
				navigator['mozGetUserMedia'];
		}
		window.getUserMedia(func);
	},
	getMovementX: function (event)
	{
		return event['movementX'] ||
			event['mozMovementX'] ||
			event['webkitMovementX'] ||
			0;
	},
	getMovementY: function (event)
	{
		return event['movementY'] ||
			event['mozMovementY'] ||
			event['webkitMovementY'] ||
			0;
	},
	mouseX: 0,
	mouseY: 0,
	mouseMovementX: 0,
	mouseMovementY: 0,
	calculateMouseEvent: function (event)
	{ // event should be mousemove, mousedown or mouseup
		if (Browser.pointerLock)
		{
			// When the pointer is locked, calculate the coordinates
			// based on the movement of the mouse.
			// Workaround for Firefox bug 764498
			if (event.type != 'mousemove' &&
				('mozMovementX' in event))
			{
				Browser.mouseMovementX = Browser.mouseMovementY = 0;
			}
			else
			{
				Browser.mouseMovementX = Browser.getMovementX(event);
				Browser.mouseMovementY = Browser.getMovementY(event);
			}
			// check if SDL is available
			if (typeof SDL != "undefined")
			{
				Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
				Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
			}
			else
			{
				// just add the mouse delta to the current absolut mouse position
				// FIXME: ideally this should be clamped against the canvas size and zero
				Browser.mouseX += Browser.mouseMovementX;
				Browser.mouseY += Browser.mouseMovementY;
			}
		}
		else
		{
			// Otherwise, calculate the movement based on the changes
			// in the coordinates.
			var rect = Module["canvas"].getBoundingClientRect();
			var x = event.pageX - (window.scrollX + rect.left);
			var y = event.pageY - (window.scrollY + rect.top);
			// the canvas might be CSS-scaled compared to its backbuffer;
			// SDL-using content will want mouse coordinates in terms
			// of backbuffer units.
			var cw = Module["canvas"].width;
			var ch = Module["canvas"].height;
			x = x * (cw / rect.width);
			y = y * (ch / rect.height);
			Browser.mouseMovementX = x - Browser.mouseX;
			Browser.mouseMovementY = y - Browser.mouseY;
			Browser.mouseX = x;
			Browser.mouseY = y;
		}
	},
	xhrLoad: function (url, onload, onerror)
	{
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = function ()
		{
			if (xhr.status == 200 || (xhr.status == 0 && xhr.response))
			{ // file URLs can return 0
				onload(xhr.response);
			}
			else
			{
				onerror();
			}
		};
		xhr.onerror = onerror;
		xhr.send(null);
	},
	asyncLoad: function (url, onload, onerror, noRunDep)
	{
		Browser.xhrLoad(url, function (arrayBuffer)
		{
			assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
			onload(new Uint8Array(arrayBuffer));
			if (!noRunDep) removeRunDependency('al ' + url);
		}, function (event)
		{
			if (onerror)
			{
				onerror();
			}
			else
			{
				throw 'Loading data file "' + url + '" failed.';
			}
		});
		if (!noRunDep) addRunDependency('al ' + url);
	},
	resizeListeners: [],
	updateResizeListeners: function ()
	{
		var canvas = Module['canvas'];
		Browser.resizeListeners.forEach(function (listener)
		{
			listener(canvas.width, canvas.height);
		});
	},
	setCanvasSize: function (width, height, noUpdates)
	{
		var canvas = Module['canvas'];
		canvas.width = width;
		canvas.height = height;
		if (!noUpdates) Browser.updateResizeListeners();
	},
	windowedWidth: 0,
	windowedHeight: 0,
	setFullScreenCanvasSize: function ()
	{
		var canvas = Module['canvas'];
		this.windowedWidth = canvas.width;
		this.windowedHeight = canvas.height;
		canvas.width = screen.width;
		canvas.height = screen.height;
		// check if SDL is available
		if (typeof SDL != "undefined")
		{
			var flags = HEAPU32[((SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2)];
			flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
			HEAP32[((SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2)] = flags
		}
		Browser.updateResizeListeners();
	},
	setWindowedCanvasSize: function ()
	{
		var canvas = Module['canvas'];
		canvas.width = this.windowedWidth;
		canvas.height = this.windowedHeight;
		// check if SDL is available
		if (typeof SDL != "undefined")
		{
			var flags = HEAPU32[((SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2)];
			flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
			HEAP32[((SDL.screen + Runtime.QUANTUM_SIZE * 0) >> 2)] = flags
		}
		Browser.updateResizeListeners();
	}
};
FS.staticInit();
__ATINIT__.unshift(
{
	func: function ()
	{
		if (!Module["noFSInit"] && !FS.init.initialized) FS.init()
	}
});
__ATMAIN__.push(
{
	func: function ()
	{
		FS.ignorePermissions = false
	}
});
__ATEXIT__.push(
{
	func: function ()
	{
		FS.quit()
	}
});
Module["FS_createFolder"] = FS.createFolder;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createLink"] = FS.createLink;
Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4);
HEAP32[((___errno_state) >> 2)] = 0;
Module["requestFullScreen"] = function (lockPointer, resizeCanvas)
{
	Browser.requestFullScreen(lockPointer, resizeCanvas)
};
Module["requestAnimationFrame"] = function (func)
{
	Browser.requestAnimationFrame(func)
};
Module["pauseMainLoop"] = function ()
{
	Browser.mainLoop.pause()
};
Module["resumeMainLoop"] = function ()
{
	Browser.mainLoop.resume()
};
Module["getUserMedia"] = function ()
{
	Browser.getUserMedia()
}
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;

function invoke_ii(index, a1)
{
	try
	{
		return Module["dynCall_ii"](index, a1);
	}
	catch (e)
	{
		if (typeof e !== 'number' && e !== 'longjmp') throw e;
		asm["setThrew"](1, 0);
	}
}

function invoke_v(index)
{
	try
	{
		Module["dynCall_v"](index);
	}
	catch (e)
	{
		if (typeof e !== 'number' && e !== 'longjmp') throw e;
		asm["setThrew"](1, 0);
	}
}

function invoke_iii(index, a1, a2)
{
	try
	{
		return Module["dynCall_iii"](index, a1, a2);
	}
	catch (e)
	{
		if (typeof e !== 'number' && e !== 'longjmp') throw e;
		asm["setThrew"](1, 0);
	}
}

function invoke_vi(index, a1)
{
	try
	{
		Module["dynCall_vi"](index, a1);
	}
	catch (e)
	{
		if (typeof e !== 'number' && e !== 'longjmp') throw e;
		asm["setThrew"](1, 0);
	}
}

function asmPrintInt(x, y)
{
	Module.print('int ' + x + ',' + y); // + ' ' + new Error().stack);
}

function asmPrintFloat(x, y)
{
	Module.print('float ' + x + ',' + y); // + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function (global, env, buffer)
{
	"use asm";
	var a = new global.Int8Array(buffer);
	var b = new global.Int16Array(buffer);
	var c = new global.Int32Array(buffer);
	var d = new global.Uint8Array(buffer);
	var e = new global.Uint16Array(buffer);
	var f = new global.Uint32Array(buffer);
	var g = new global.Float32Array(buffer);
	var h = new global.Float64Array(buffer);
	var i = env.STACKTOP | 0;
	var j = env.STACK_MAX | 0;
	var k = env.tempDoublePtr | 0;
	var l = env.ABORT | 0;
	var m = +env.NaN;
	var n = +env.Infinity;
	var o = 0;
	var p = 0;
	var q = 0;
	var r = 0;
	var s = 0,
		t = 0,
		u = 0,
		v = 0,
		w = 0.0,
		x = 0,
		y = 0,
		z = 0,
		A = 0.0;
	var B = 0;
	var C = 0;
	var D = 0;
	var E = 0;
	var F = 0;
	var G = 0;
	var H = 0;
	var I = 0;
	var J = 0;
	var K = 0;
	var L = global.Math.floor;
	var M = global.Math.abs;
	var N = global.Math.sqrt;
	var O = global.Math.pow;
	var P = global.Math.cos;
	var Q = global.Math.sin;
	var R = global.Math.tan;
	var S = global.Math.acos;
	var T = global.Math.asin;
	var U = global.Math.atan;
	var V = global.Math.atan2;
	var W = global.Math.exp;
	var X = global.Math.log;
	var Y = global.Math.ceil;
	var Z = global.Math.imul;
	var _ = env.abort;
	var $ = env.assert;
	var aa = env.asmPrintInt;
	var ab = env.asmPrintFloat;
	var ac = env.min;
	var ad = env.invoke_ii;
	var ae = env.invoke_v;
	var af = env.invoke_iii;
	var ag = env.invoke_vi;
	var ah = env._clock_gettime;
	var ai = env._pwrite;
	var aj = env._sbrk;
	var ak = env._sysconf;
	var al = env.___setErrNo;
	var am = env._fwrite;
	var an = env.__reallyNegative;
	var ao = env._time;
	var ap = env.__formatString;
	var aq = env._send;
	var ar = env._write;
	var as = env._abort;
	var at = env._fprintf;
	var au = env._printf;
	var av = env.___errno_location;
	// EMSCRIPTEN_START_FUNCS
	function aA(a)
	{
		a = a | 0;
		var b = 0;
		b = i;
		i = i + a | 0;
		i = i + 7 >> 3 << 3;
		return b | 0
	}

	function aB()
	{
		return i | 0
	}

	function aC(a)
	{
		a = a | 0;
		i = a
	}

	function aD(a, b)
	{
		a = a | 0;
		b = b | 0;
		if ((o | 0) == 0)
		{
			o = a;
			p = b
		}
	}

	function aE(b)
	{
		b = b | 0;
		a[k] = a[b];
		a[k + 1 | 0] = a[b + 1 | 0];
		a[k + 2 | 0] = a[b + 2 | 0];
		a[k + 3 | 0] = a[b + 3 | 0]
	}

	function aF(b)
	{
		b = b | 0;
		a[k] = a[b];
		a[k + 1 | 0] = a[b + 1 | 0];
		a[k + 2 | 0] = a[b + 2 | 0];
		a[k + 3 | 0] = a[b + 3 | 0];
		a[k + 4 | 0] = a[b + 4 | 0];
		a[k + 5 | 0] = a[b + 5 | 0];
		a[k + 6 | 0] = a[b + 6 | 0];
		a[k + 7 | 0] = a[b + 7 | 0]
	}

	function aG(a)
	{
		a = a | 0;
		B = a
	}

	function aH(a)
	{
		a = a | 0;
		C = a
	}

	function aI(a)
	{
		a = a | 0;
		D = a
	}

	function aJ(a)
	{
		a = a | 0;
		E = a
	}

	function aK(a)
	{
		a = a | 0;
		F = a
	}

	function aL(a)
	{
		a = a | 0;
		G = a
	}

	function aM(a)
	{
		a = a | 0;
		H = a
	}

	function aN(a)
	{
		a = a | 0;
		I = a
	}

	function aO(a)
	{
		a = a | 0;
		J = a
	}

	function aP(a)
	{
		a = a | 0;
		K = a
	}

	function aQ()
	{}

	function aR()
	{
		var a = 0,
			b = 0,
			d = 0,
			e = 0,
			f = 0;
		a = i;
		b = aS((Z(c[2] | 0, c[4] | 0) | 0) << 2) | 0;
		ah(4, 48) | 0;
		d = 0;
		while (1)
		{
			if ((d | 0) >= (c[2] | 0))
			{
				break
			}
			e = 0;
			while (1)
			{
				if ((e | 0) >= (c[4] | 0))
				{
					break
				}
				f = Z(d, e) | 0;
				c[b + (d + (Z(c[2] | 0, e) | 0) << 2) >> 2] = f;
				e = e + 1 | 0
			}
			d = d + 1 | 0
		}
		ah(4, 80) | 0;
		au(40, (s = i, i = i + 8 | 0, c[s >> 2] = (((c[20] | 0) - (c[12] | 0) | 0) * 1e3 | 0) + (((c[21] | 0) - (c[
			13] | 0) | 0) / 1e6 | 0), s) | 0) | 0;
		au(32, (s = i, i = i + 1 | 0, i = i + 7 >> 3 << 3, c[s >> 2] = 0, s) | 0) | 0;
		au(24, (s = i, i = i + 8 | 0, c[s >> 2] = (((c[20] | 0) - (c[12] | 0) | 0) * 1e3 | 0) + (((c[21] | 0) - (c[
			13] | 0) | 0) / 1e6 | 0), s) | 0) | 0;
		au(24, (s = i, i = i + 8 | 0, c[s >> 2] = (c[21] | 0) - (c[13] | 0), s) | 0) | 0;
		aT(b);
		i = a;
		return 7
	}

	function aS(a)
	{
		a = a | 0;
		var b = 0,
			d = 0,
			e = 0,
			f = 0,
			g = 0,
			h = 0,
			i = 0,
			j = 0,
			k = 0,
			l = 0,
			m = 0,
			n = 0,
			o = 0,
			p = 0,
			q = 0,
			r = 0,
			s = 0,
			t = 0,
			u = 0,
			v = 0,
			w = 0,
			x = 0,
			y = 0,
			z = 0,
			A = 0,
			B = 0,
			C = 0,
			D = 0,
			E = 0,
			F = 0,
			G = 0,
			H = 0,
			I = 0,
			J = 0,
			K = 0,
			L = 0,
			M = 0,
			N = 0,
			O = 0,
			P = 0,
			Q = 0,
			R = 0,
			S = 0,
			T = 0,
			U = 0,
			V = 0,
			W = 0,
			X = 0,
			Y = 0,
			Z = 0,
			_ = 0,
			$ = 0,
			aa = 0,
			ab = 0,
			ac = 0,
			ad = 0,
			ae = 0,
			af = 0,
			ag = 0,
			ah = 0,
			ai = 0,
			al = 0,
			am = 0,
			an = 0,
			ap = 0,
			aq = 0,
			ar = 0,
			at = 0,
			au = 0,
			aw = 0,
			ax = 0,
			ay = 0,
			az = 0,
			aA = 0,
			aB = 0,
			aC = 0,
			aD = 0,
			aE = 0,
			aF = 0,
			aG = 0,
			aH = 0,
			aI = 0,
			aJ = 0,
			aK = 0,
			aL = 0,
			aM = 0,
			aN = 0,
			aO = 0;
		do {
			if (a >>> 0 < 245)
			{
				if (a >>> 0 < 11)
				{
					b = 16
				}
				else
				{
					b = a + 11 & -8
				}
				d = b >>> 3;
				e = c[22] | 0;
				f = e >>> (d >>> 0);
				if ((f & 3 | 0) != 0)
				{
					g = (f & 1 ^ 1) + d | 0;
					h = g << 1;
					i = 128 + (h << 2) | 0;
					j = 128 + (h + 2 << 2) | 0;
					h = c[j >> 2] | 0;
					k = h + 8 | 0;
					l = c[k >> 2] | 0;
					do {
						if ((i | 0) == (l | 0))
						{
							c[22] = e & ~(1 << g)
						}
						else
						{
							if (l >>> 0 < (c[26] | 0) >>> 0)
							{
								as();
								return 0
							}
							m = l + 12 | 0;
							if ((c[m >> 2] | 0) == (h | 0))
							{
								c[m >> 2] = i;
								c[j >> 2] = l;
								break
							}
							else
							{
								as();
								return 0
							}
						}
					} while (0);
					l = g << 3;
					c[h + 4 >> 2] = l | 3;
					j = h + (l | 4) | 0;
					c[j >> 2] = c[j >> 2] | 1;
					n = k;
					return n | 0
				}
				if (b >>> 0 <= (c[24] | 0) >>> 0)
				{
					o = b;
					break
				}
				if ((f | 0) != 0)
				{
					j = 2 << d;
					l = f << d & (j | -j);
					j = (l & -l) - 1 | 0;
					l = j >>> 12 & 16;
					i = j >>> (l >>> 0);
					j = i >>> 5 & 8;
					m = i >>> (j >>> 0);
					i = m >>> 2 & 4;
					p = m >>> (i >>> 0);
					m = p >>> 1 & 2;
					q = p >>> (m >>> 0);
					p = q >>> 1 & 1;
					r = (j | l | i | m | p) + (q >>> (p >>> 0)) | 0;
					p = r << 1;
					q = 128 + (p << 2) | 0;
					m = 128 + (p + 2 << 2) | 0;
					p = c[m >> 2] | 0;
					i = p + 8 | 0;
					l = c[i >> 2] | 0;
					do {
						if ((q | 0) == (l | 0))
						{
							c[22] = e & ~(1 << r)
						}
						else
						{
							if (l >>> 0 < (c[26] | 0) >>> 0)
							{
								as();
								return 0
							}
							j = l + 12 | 0;
							if ((c[j >> 2] | 0) == (p | 0))
							{
								c[j >> 2] = q;
								c[m >> 2] = l;
								break
							}
							else
							{
								as();
								return 0
							}
						}
					} while (0);
					l = r << 3;
					m = l - b | 0;
					c[p + 4 >> 2] = b | 3;
					q = p;
					e = q + b | 0;
					c[q + (b | 4) >> 2] = m | 1;
					c[q + l >> 2] = m;
					l = c[24] | 0;
					if ((l | 0) != 0)
					{
						q = c[27] | 0;
						d = l >>> 3;
						l = d << 1;
						f = 128 + (l << 2) | 0;
						k = c[22] | 0;
						h = 1 << d;
						do {
							if ((k & h | 0) == 0)
							{
								c[22] = k | h;
								s = f;
								t = 128 + (l + 2 << 2) | 0
							}
							else
							{
								d = 128 + (l + 2 << 2) | 0;
								g = c[d >> 2] | 0;
								if (g >>> 0 >= (c[26] | 0) >>> 0)
								{
									s = g;
									t = d;
									break
								}
								as();
								return 0
							}
						} while (0);
						c[t >> 2] = q;
						c[s + 12 >> 2] = q;
						c[q + 8 >> 2] = s;
						c[q + 12 >> 2] = f
					}
					c[24] = m;
					c[27] = e;
					n = i;
					return n | 0
				}
				l = c[23] | 0;
				if ((l | 0) == 0)
				{
					o = b;
					break
				}
				h = (l & -l) - 1 | 0;
				l = h >>> 12 & 16;
				k = h >>> (l >>> 0);
				h = k >>> 5 & 8;
				p = k >>> (h >>> 0);
				k = p >>> 2 & 4;
				r = p >>> (k >>> 0);
				p = r >>> 1 & 2;
				d = r >>> (p >>> 0);
				r = d >>> 1 & 1;
				g = c[392 + ((h | l | k | p | r) + (d >>> (r >>> 0)) << 2) >> 2] | 0;
				r = g;
				d = g;
				p = (c[g + 4 >> 2] & -8) - b | 0;
				while (1)
				{
					g = c[r + 16 >> 2] | 0;
					if ((g | 0) == 0)
					{
						k = c[r + 20 >> 2] | 0;
						if ((k | 0) == 0)
						{
							break
						}
						else
						{
							u = k
						}
					}
					else
					{
						u = g
					}
					g = (c[u + 4 >> 2] & -8) - b | 0;
					k = g >>> 0 < p >>> 0;
					r = u;
					d = k ? u : d;
					p = k ? g : p
				}
				r = d;
				i = c[26] | 0;
				if (r >>> 0 < i >>> 0)
				{
					as();
					return 0
				}
				e = r + b | 0;
				m = e;
				if (r >>> 0 >= e >>> 0)
				{
					as();
					return 0
				}
				e = c[d + 24 >> 2] | 0;
				f = c[d + 12 >> 2] | 0;
				do {
					if ((f | 0) == (d | 0))
					{
						q = d + 20 | 0;
						g = c[q >> 2] | 0;
						if ((g | 0) == 0)
						{
							k = d + 16 | 0;
							l = c[k >> 2] | 0;
							if ((l | 0) == 0)
							{
								v = 0;
								break
							}
							else
							{
								w = l;
								x = k
							}
						}
						else
						{
							w = g;
							x = q
						}
						while (1)
						{
							q = w + 20 | 0;
							g = c[q >> 2] | 0;
							if ((g | 0) != 0)
							{
								w = g;
								x = q;
								continue
							}
							q = w + 16 | 0;
							g = c[q >> 2] | 0;
							if ((g | 0) == 0)
							{
								break
							}
							else
							{
								w = g;
								x = q
							}
						}
						if (x >>> 0 < i >>> 0)
						{
							as();
							return 0
						}
						else
						{
							c[x >> 2] = 0;
							v = w;
							break
						}
					}
					else
					{
						q = c[d + 8 >> 2] | 0;
						if (q >>> 0 < i >>> 0)
						{
							as();
							return 0
						}
						g = q + 12 | 0;
						if ((c[g >> 2] | 0) != (d | 0))
						{
							as();
							return 0
						}
						k = f + 8 | 0;
						if ((c[k >> 2] | 0) == (d | 0))
						{
							c[g >> 2] = f;
							c[k >> 2] = q;
							v = f;
							break
						}
						else
						{
							as();
							return 0
						}
					}
				} while (0);
				L89: do {
					if ((e | 0) != 0)
					{
						f = d + 28 | 0;
						i = 392 + (c[f >> 2] << 2) | 0;
						do {
							if ((d | 0) == (c[i >> 2] | 0))
							{
								c[i >> 2] = v;
								if ((v | 0) != 0)
								{
									break
								}
								c[23] = c[23] & ~(1 << c[f >> 2]);
								break L89
							}
							else
							{
								if (e >>> 0 < (c[26] | 0) >>> 0)
								{
									as();
									return 0
								}
								q = e + 16 | 0;
								if ((c[q >> 2] | 0) == (d | 0))
								{
									c[q >> 2] = v
								}
								else
								{
									c[e + 20 >> 2] = v
								} if ((v | 0) == 0)
								{
									break L89
								}
							}
						} while (0);
						if (v >>> 0 < (c[26] | 0) >>> 0)
						{
							as();
							return 0
						}
						c[v + 24 >> 2] = e;
						f = c[d + 16 >> 2] | 0;
						do {
							if ((f | 0) != 0)
							{
								if (f >>> 0 < (c[26] | 0) >>> 0)
								{
									as();
									return 0
								}
								else
								{
									c[v + 16 >> 2] = f;
									c[f + 24 >> 2] = v;
									break
								}
							}
						} while (0);
						f = c[d + 20 >> 2] | 0;
						if ((f | 0) == 0)
						{
							break
						}
						if (f >>> 0 < (c[26] | 0) >>> 0)
						{
							as();
							return 0
						}
						else
						{
							c[v + 20 >> 2] = f;
							c[f + 24 >> 2] = v;
							break
						}
					}
				} while (0);
				if (p >>> 0 < 16)
				{
					e = p + b | 0;
					c[d + 4 >> 2] = e | 3;
					f = r + (e + 4) | 0;
					c[f >> 2] = c[f >> 2] | 1
				}
				else
				{
					c[d + 4 >> 2] = b | 3;
					c[r + (b | 4) >> 2] = p | 1;
					c[r + (p + b) >> 2] = p;
					f = c[24] | 0;
					if ((f | 0) != 0)
					{
						e = c[27] | 0;
						i = f >>> 3;
						f = i << 1;
						q = 128 + (f << 2) | 0;
						k = c[22] | 0;
						g = 1 << i;
						do {
							if ((k & g | 0) == 0)
							{
								c[22] = k | g;
								y = q;
								z = 128 + (f + 2 << 2) | 0
							}
							else
							{
								i = 128 + (f + 2 << 2) | 0;
								l = c[i >> 2] | 0;
								if (l >>> 0 >= (c[26] | 0) >>> 0)
								{
									y = l;
									z = i;
									break
								}
								as();
								return 0
							}
						} while (0);
						c[z >> 2] = e;
						c[y + 12 >> 2] = e;
						c[e + 8 >> 2] = y;
						c[e + 12 >> 2] = q
					}
					c[24] = p;
					c[27] = m
				}
				n = d + 8 | 0;
				return n | 0
			}
			else
			{
				if (a >>> 0 > 4294967231)
				{
					o = -1;
					break
				}
				f = a + 11 | 0;
				g = f & -8;
				k = c[23] | 0;
				if ((k | 0) == 0)
				{
					o = g;
					break
				}
				r = -g | 0;
				i = f >>> 8;
				do {
					if ((i | 0) == 0)
					{
						A = 0
					}
					else
					{
						if (g >>> 0 > 16777215)
						{
							A = 31;
							break
						}
						f = (i + 1048320 | 0) >>> 16 & 8;
						l = i << f;
						h = (l + 520192 | 0) >>> 16 & 4;
						j = l << h;
						l = (j + 245760 | 0) >>> 16 & 2;
						B = 14 - (h | f | l) + (j << l >>> 15) | 0;
						A = g >>> ((B + 7 | 0) >>> 0) & 1 | B << 1
					}
				} while (0);
				i = c[392 + (A << 2) >> 2] | 0;
				L137: do {
					if ((i | 0) == 0)
					{
						C = 0;
						D = r;
						E = 0
					}
					else
					{
						if ((A | 0) == 31)
						{
							F = 0
						}
						else
						{
							F = 25 - (A >>> 1) | 0
						}
						d = 0;
						m = r;
						p = i;
						q = g << F;
						e = 0;
						while (1)
						{
							B = c[p + 4 >> 2] & -8;
							l = B - g | 0;
							if (l >>> 0 < m >>> 0)
							{
								if ((B | 0) == (g | 0))
								{
									C = p;
									D = l;
									E = p;
									break L137
								}
								else
								{
									G = p;
									H = l
								}
							}
							else
							{
								G = d;
								H = m
							}
							l = c[p + 20 >> 2] | 0;
							B = c[p + 16 + (q >>> 31 << 2) >> 2] | 0;
							j = (l | 0) == 0 | (l | 0) == (B | 0) ? e : l;
							if ((B | 0) == 0)
							{
								C = G;
								D = H;
								E = j;
								break
							}
							else
							{
								d = G;
								m = H;
								p = B;
								q = q << 1;
								e = j
							}
						}
					}
				} while (0);
				if ((E | 0) == 0 & (C | 0) == 0)
				{
					i = 2 << A;
					r = k & (i | -i);
					if ((r | 0) == 0)
					{
						o = g;
						break
					}
					i = (r & -r) - 1 | 0;
					r = i >>> 12 & 16;
					e = i >>> (r >>> 0);
					i = e >>> 5 & 8;
					q = e >>> (i >>> 0);
					e = q >>> 2 & 4;
					p = q >>> (e >>> 0);
					q = p >>> 1 & 2;
					m = p >>> (q >>> 0);
					p = m >>> 1 & 1;
					I = c[392 + ((i | r | e | q | p) + (m >>> (p >>> 0)) << 2) >> 2] | 0
				}
				else
				{
					I = E
				} if ((I | 0) == 0)
				{
					J = D;
					K = C
				}
				else
				{
					p = I;
					m = D;
					q = C;
					while (1)
					{
						e = (c[p + 4 >> 2] & -8) - g | 0;
						r = e >>> 0 < m >>> 0;
						i = r ? e : m;
						e = r ? p : q;
						r = c[p + 16 >> 2] | 0;
						if ((r | 0) != 0)
						{
							p = r;
							m = i;
							q = e;
							continue
						}
						r = c[p + 20 >> 2] | 0;
						if ((r | 0) == 0)
						{
							J = i;
							K = e;
							break
						}
						else
						{
							p = r;
							m = i;
							q = e
						}
					}
				} if ((K | 0) == 0)
				{
					o = g;
					break
				}
				if (J >>> 0 >= ((c[24] | 0) - g | 0) >>> 0)
				{
					o = g;
					break
				}
				q = K;
				m = c[26] | 0;
				if (q >>> 0 < m >>> 0)
				{
					as();
					return 0
				}
				p = q + g | 0;
				k = p;
				if (q >>> 0 >= p >>> 0)
				{
					as();
					return 0
				}
				e = c[K + 24 >> 2] | 0;
				i = c[K + 12 >> 2] | 0;
				do {
					if ((i | 0) == (K | 0))
					{
						r = K + 20 | 0;
						d = c[r >> 2] | 0;
						if ((d | 0) == 0)
						{
							j = K + 16 | 0;
							B = c[j >> 2] | 0;
							if ((B | 0) == 0)
							{
								L = 0;
								break
							}
							else
							{
								M = B;
								N = j
							}
						}
						else
						{
							M = d;
							N = r
						}
						while (1)
						{
							r = M + 20 | 0;
							d = c[r >> 2] | 0;
							if ((d | 0) != 0)
							{
								M = d;
								N = r;
								continue
							}
							r = M + 16 | 0;
							d = c[r >> 2] | 0;
							if ((d | 0) == 0)
							{
								break
							}
							else
							{
								M = d;
								N = r
							}
						}
						if (N >>> 0 < m >>> 0)
						{
							as();
							return 0
						}
						else
						{
							c[N >> 2] = 0;
							L = M;
							break
						}
					}
					else
					{
						r = c[K + 8 >> 2] | 0;
						if (r >>> 0 < m >>> 0)
						{
							as();
							return 0
						}
						d = r + 12 | 0;
						if ((c[d >> 2] | 0) != (K | 0))
						{
							as();
							return 0
						}
						j = i + 8 | 0;
						if ((c[j >> 2] | 0) == (K | 0))
						{
							c[d >> 2] = i;
							c[j >> 2] = r;
							L = i;
							break
						}
						else
						{
							as();
							return 0
						}
					}
				} while (0);
				L187: do {
					if ((e | 0) != 0)
					{
						i = K + 28 | 0;
						m = 392 + (c[i >> 2] << 2) | 0;
						do {
							if ((K | 0) == (c[m >> 2] | 0))
							{
								c[m >> 2] = L;
								if ((L | 0) != 0)
								{
									break
								}
								c[23] = c[23] & ~(1 << c[i >> 2]);
								break L187
							}
							else
							{
								if (e >>> 0 < (c[26] | 0) >>> 0)
								{
									as();
									return 0
								}
								r = e + 16 | 0;
								if ((c[r >> 2] | 0) == (K | 0))
								{
									c[r >> 2] = L
								}
								else
								{
									c[e + 20 >> 2] = L
								} if ((L | 0) == 0)
								{
									break L187
								}
							}
						} while (0);
						if (L >>> 0 < (c[26] | 0) >>> 0)
						{
							as();
							return 0
						}
						c[L + 24 >> 2] = e;
						i = c[K + 16 >> 2] | 0;
						do {
							if ((i | 0) != 0)
							{
								if (i >>> 0 < (c[26] | 0) >>> 0)
								{
									as();
									return 0
								}
								else
								{
									c[L + 16 >> 2] = i;
									c[i + 24 >> 2] = L;
									break
								}
							}
						} while (0);
						i = c[K + 20 >> 2] | 0;
						if ((i | 0) == 0)
						{
							break
						}
						if (i >>> 0 < (c[26] | 0) >>> 0)
						{
							as();
							return 0
						}
						else
						{
							c[L + 20 >> 2] = i;
							c[i + 24 >> 2] = L;
							break
						}
					}
				} while (0);
				L215: do {
					if (J >>> 0 < 16)
					{
						e = J + g | 0;
						c[K + 4 >> 2] = e | 3;
						i = q + (e + 4) | 0;
						c[i >> 2] = c[i >> 2] | 1
					}
					else
					{
						c[K + 4 >> 2] = g | 3;
						c[q + (g | 4) >> 2] = J | 1;
						c[q + (J + g) >> 2] = J;
						i = J >>> 3;
						if (J >>> 0 < 256)
						{
							e = i << 1;
							m = 128 + (e << 2) | 0;
							r = c[22] | 0;
							j = 1 << i;
							do {
								if ((r & j | 0) == 0)
								{
									c[22] = r | j;
									O = m;
									P = 128 + (e + 2 << 2) | 0
								}
								else
								{
									i = 128 + (e + 2 << 2) | 0;
									d = c[i >> 2] | 0;
									if (d >>> 0 >= (c[26] | 0) >>> 0)
									{
										O = d;
										P = i;
										break
									}
									as();
									return 0
								}
							} while (0);
							c[P >> 2] = k;
							c[O + 12 >> 2] = k;
							c[q + (g + 8) >> 2] = O;
							c[q + (g + 12) >> 2] = m;
							break
						}
						e = p;
						j = J >>> 8;
						do {
							if ((j | 0) == 0)
							{
								Q = 0
							}
							else
							{
								if (J >>> 0 > 16777215)
								{
									Q = 31;
									break
								}
								r = (j + 1048320 | 0) >>> 16 & 8;
								i = j << r;
								d = (i + 520192 | 0) >>> 16 & 4;
								B = i << d;
								i = (B + 245760 | 0) >>> 16 & 2;
								l = 14 - (d | r | i) + (B << i >>> 15) | 0;
								Q = J >>> ((l + 7 | 0) >>> 0) & 1 | l << 1
							}
						} while (0);
						j = 392 + (Q << 2) | 0;
						c[q + (g + 28) >> 2] = Q;
						c[q + (g + 20) >> 2] = 0;
						c[q + (g + 16) >> 2] = 0;
						m = c[23] | 0;
						l = 1 << Q;
						if ((m & l | 0) == 0)
						{
							c[23] = m | l;
							c[j >> 2] = e;
							c[q + (g + 24) >> 2] = j;
							c[q + (g + 12) >> 2] = e;
							c[q + (g + 8) >> 2] = e;
							break
						}
						l = c[j >> 2] | 0;
						if ((Q | 0) == 31)
						{
							R = 0
						}
						else
						{
							R = 25 - (Q >>> 1) | 0
						}
						L236: do {
							if ((c[l + 4 >> 2] & -8 | 0) == (J | 0))
							{
								S = l
							}
							else
							{
								j = l;
								m = J << R;
								while (1)
								{
									T = j + 16 + (m >>> 31 << 2) | 0;
									i = c[T >> 2] | 0;
									if ((i | 0) == 0)
									{
										break
									}
									if ((c[i + 4 >> 2] & -8 | 0) == (J | 0))
									{
										S = i;
										break L236
									}
									else
									{
										j = i;
										m = m << 1
									}
								}
								if (T >>> 0 < (c[26] | 0) >>> 0)
								{
									as();
									return 0
								}
								else
								{
									c[T >> 2] = e;
									c[q + (g + 24) >> 2] = j;
									c[q + (g + 12) >> 2] = e;
									c[q + (g + 8) >> 2] = e;
									break L215
								}
							}
						} while (0);
						l = S + 8 | 0;
						m = c[l >> 2] | 0;
						i = c[26] | 0;
						if (S >>> 0 < i >>> 0)
						{
							as();
							return 0
						}
						if (m >>> 0 < i >>> 0)
						{
							as();
							return 0
						}
						else
						{
							c[m + 12 >> 2] = e;
							c[l >> 2] = e;
							c[q + (g + 8) >> 2] = m;
							c[q + (g + 12) >> 2] = S;
							c[q + (g + 24) >> 2] = 0;
							break
						}
					}
				} while (0);
				n = K + 8 | 0;
				return n | 0
			}
		} while (0);
		K = c[24] | 0;
		if (o >>> 0 <= K >>> 0)
		{
			S = K - o | 0;
			T = c[27] | 0;
			if (S >>> 0 > 15)
			{
				J = T;
				c[27] = J + o;
				c[24] = S;
				c[J + (o + 4) >> 2] = S | 1;
				c[J + K >> 2] = S;
				c[T + 4 >> 2] = o | 3
			}
			else
			{
				c[24] = 0;
				c[27] = 0;
				c[T + 4 >> 2] = K | 3;
				S = T + (K + 4) | 0;
				c[S >> 2] = c[S >> 2] | 1
			}
			n = T + 8 | 0;
			return n | 0
		}
		T = c[25] | 0;
		if (o >>> 0 < T >>> 0)
		{
			S = T - o | 0;
			c[25] = S;
			T = c[28] | 0;
			K = T;
			c[28] = K + o;
			c[K + (o + 4) >> 2] = S | 1;
			c[T + 4 >> 2] = o | 3;
			n = T + 8 | 0;
			return n | 0
		}
		do {
			if ((c[14] | 0) == 0)
			{
				T = ak(8) | 0;
				if ((T - 1 & T | 0) == 0)
				{
					c[16] = T;
					c[15] = T;
					c[17] = -1;
					c[18] = 2097152;
					c[19] = 0;
					c[133] = 0;
					c[14] = (ao(0) | 0) & -16 ^ 1431655768;
					break
				}
				else
				{
					as();
					return 0
				}
			}
		} while (0);
		T = o + 48 | 0;
		S = c[16] | 0;
		K = o + 47 | 0;
		J = S + K | 0;
		R = -S | 0;
		S = J & R;
		if (S >>> 0 <= o >>> 0)
		{
			n = 0;
			return n | 0
		}
		Q = c[132] | 0;
		do {
			if ((Q | 0) != 0)
			{
				O = c[130] | 0;
				P = O + S | 0;
				if (P >>> 0 <= O >>> 0 | P >>> 0 > Q >>> 0)
				{
					n = 0
				}
				else
				{
					break
				}
				return n | 0
			}
		} while (0);
		L280: do {
			if ((c[133] & 4 | 0) == 0)
			{
				Q = c[28] | 0;
				L282: do {
					if ((Q | 0) == 0)
					{
						U = 191
					}
					else
					{
						P = Q;
						O = 536;
						while (1)
						{
							V = O | 0;
							L = c[V >> 2] | 0;
							if (L >>> 0 <= P >>> 0)
							{
								W = O + 4 | 0;
								if ((L + (c[W >> 2] | 0) | 0) >>> 0 > P >>> 0)
								{
									break
								}
							}
							L = c[O + 8 >> 2] | 0;
							if ((L | 0) == 0)
							{
								U = 191;
								break L282
							}
							else
							{
								O = L
							}
						}
						if ((O | 0) == 0)
						{
							U = 191;
							break
						}
						P = J - (c[25] | 0) & R;
						if (P >>> 0 >= 2147483647)
						{
							X = 0;
							break
						}
						e = aj(P | 0) | 0;
						L = (e | 0) == ((c[V >> 2] | 0) + (c[W >> 2] | 0) | 0);
						Y = L ? e : -1;
						Z = L ? P : 0;
						_ = e;
						$ = P;
						U = 200
					}
				} while (0);
				do {
					if ((U | 0) == 191)
					{
						Q = aj(0) | 0;
						if ((Q | 0) == -1)
						{
							X = 0;
							break
						}
						P = Q;
						e = c[15] | 0;
						L = e - 1 | 0;
						if ((L & P | 0) == 0)
						{
							aa = S
						}
						else
						{
							aa = S - P + (L + P & -e) | 0
						}
						e = c[130] | 0;
						P = e + aa | 0;
						if (!(aa >>> 0 > o >>> 0 & aa >>> 0 < 2147483647))
						{
							X = 0;
							break
						}
						L = c[132] | 0;
						if ((L | 0) != 0)
						{
							if (P >>> 0 <= e >>> 0 | P >>> 0 > L >>> 0)
							{
								X = 0;
								break
							}
						}
						L = aj(aa | 0) | 0;
						P = (L | 0) == (Q | 0);
						Y = P ? Q : -1;
						Z = P ? aa : 0;
						_ = L;
						$ = aa;
						U = 200
					}
				} while (0);
				L302: do {
					if ((U | 0) == 200)
					{
						L = -$ | 0;
						if ((Y | 0) != -1)
						{
							ab = Z;
							ac = Y;
							U = 211;
							break L280
						}
						do {
							if ((_ | 0) != -1 & $ >>> 0 < 2147483647 & $ >>> 0 < T >>> 0)
							{
								P = c[16] | 0;
								Q = K - $ + P & -P;
								if (Q >>> 0 >= 2147483647)
								{
									ad = $;
									break
								}
								if ((aj(Q | 0) | 0) == -1)
								{
									aj(L | 0) | 0;
									X = Z;
									break L302
								}
								else
								{
									ad = Q + $ | 0;
									break
								}
							}
							else
							{
								ad = $
							}
						} while (0);
						if ((_ | 0) == -1)
						{
							X = Z
						}
						else
						{
							ab = ad;
							ac = _;
							U = 211;
							break L280
						}
					}
				} while (0);
				c[133] = c[133] | 4;
				ae = X;
				U = 208
			}
			else
			{
				ae = 0;
				U = 208
			}
		} while (0);
		do {
			if ((U | 0) == 208)
			{
				if (S >>> 0 >= 2147483647)
				{
					break
				}
				X = aj(S | 0) | 0;
				_ = aj(0) | 0;
				if (!((_ | 0) != -1 & (X | 0) != -1 & X >>> 0 < _ >>> 0))
				{
					break
				}
				ad = _ - X | 0;
				_ = ad >>> 0 > (o + 40 | 0) >>> 0;
				if (_)
				{
					ab = _ ? ad : ae;
					ac = X;
					U = 211
				}
			}
		} while (0);
		do {
			if ((U | 0) == 211)
			{
				ae = (c[130] | 0) + ab | 0;
				c[130] = ae;
				if (ae >>> 0 > (c[131] | 0) >>> 0)
				{
					c[131] = ae
				}
				ae = c[28] | 0;
				L322: do {
					if ((ae | 0) == 0)
					{
						S = c[26] | 0;
						if ((S | 0) == 0 | ac >>> 0 < S >>> 0)
						{
							c[26] = ac
						}
						c[134] = ac;
						c[135] = ab;
						c[137] = 0;
						c[31] = c[14];
						c[30] = -1;
						S = 0;
						do {
							X = S << 1;
							ad = 128 + (X << 2) | 0;
							c[128 + (X + 3 << 2) >> 2] = ad;
							c[128 + (X + 2 << 2) >> 2] = ad;
							S = S + 1 | 0;
						} while (S >>> 0 < 32);
						S = ac + 8 | 0;
						if ((S & 7 | 0) == 0)
						{
							af = 0
						}
						else
						{
							af = -S & 7
						}
						S = ab - 40 - af | 0;
						c[28] = ac + af;
						c[25] = S;
						c[ac + (af + 4) >> 2] = S | 1;
						c[ac + (ab - 36) >> 2] = 40;
						c[29] = c[18]
					}
					else
					{
						S = 536;
						while (1)
						{
							ag = c[S >> 2] | 0;
							ah = S + 4 | 0;
							ai = c[ah >> 2] | 0;
							if ((ac | 0) == (ag + ai | 0))
							{
								U = 223;
								break
							}
							ad = c[S + 8 >> 2] | 0;
							if ((ad | 0) == 0)
							{
								break
							}
							else
							{
								S = ad
							}
						}
						do {
							if ((U | 0) == 223)
							{
								if ((c[S + 12 >> 2] & 8 | 0) != 0)
								{
									break
								}
								ad = ae;
								if (!(ad >>> 0 >= ag >>> 0 & ad >>> 0 < ac >>> 0))
								{
									break
								}
								c[ah >> 2] = ai + ab;
								ad = c[28] | 0;
								X = (c[25] | 0) + ab | 0;
								_ = ad;
								Z = ad + 8 | 0;
								if ((Z & 7 | 0) == 0)
								{
									al = 0
								}
								else
								{
									al = -Z & 7
								}
								Z = X - al | 0;
								c[28] = _ + al;
								c[25] = Z;
								c[_ + (al + 4) >> 2] = Z | 1;
								c[_ + (X + 4) >> 2] = 40;
								c[29] = c[18];
								break L322
							}
						} while (0);
						if (ac >>> 0 < (c[26] | 0) >>> 0)
						{
							c[26] = ac
						}
						S = ac + ab | 0;
						X = 536;
						while (1)
						{
							am = X | 0;
							if ((c[am >> 2] | 0) == (S | 0))
							{
								U = 233;
								break
							}
							_ = c[X + 8 >> 2] | 0;
							if ((_ | 0) == 0)
							{
								break
							}
							else
							{
								X = _
							}
						}
						do {
							if ((U | 0) == 233)
							{
								if ((c[X + 12 >> 2] & 8 | 0) != 0)
								{
									break
								}
								c[am >> 2] = ac;
								S = X + 4 | 0;
								c[S >> 2] = (c[S >> 2] | 0) + ab;
								S = ac + 8 | 0;
								if ((S & 7 | 0) == 0)
								{
									an = 0
								}
								else
								{
									an = -S & 7
								}
								S = ac + (ab + 8) | 0;
								if ((S & 7 | 0) == 0)
								{
									ap = 0
								}
								else
								{
									ap = -S & 7
								}
								S = ac + (ap + ab) | 0;
								_ = S;
								Z = an + o | 0;
								ad = ac + Z | 0;
								$ = ad;
								K = S - (ac + an) - o | 0;
								c[ac + (an + 4) >> 2] = o | 3;
								L359: do {
									if ((_ | 0) == (c[28] | 0))
									{
										T = (c[25] | 0) + K | 0;
										c[25] = T;
										c[28] = $;
										c[ac + (Z + 4) >> 2] = T | 1
									}
									else
									{
										if ((_ | 0) == (c[27] | 0))
										{
											T = (c[24] | 0) + K | 0;
											c[24] = T;
											c[27] = $;
											c[ac + (Z + 4) >> 2] = T | 1;
											c[ac + (T + Z) >> 2] = T;
											break
										}
										T = ab + 4 | 0;
										Y = c[ac + (T + ap) >> 2] | 0;
										if ((Y & 3 | 0) == 1)
										{
											aa = Y & -8;
											W = Y >>> 3;
											L367: do {
												if (Y >>> 0 < 256)
												{
													V = c[ac + ((ap | 8) + ab) >> 2] | 0;
													R = c[ac + (ab + 12 + ap) >> 2] | 0;
													J = 128 + (W << 1 << 2) | 0;
													do {
														if ((V | 0) != (J | 0))
														{
															if (V >>> 0 < (c[26] | 0) >>> 0)
															{
																as();
																return 0
															}
															if ((c[V + 12 >> 2] | 0) == (_ | 0))
															{
																break
															}
															as();
															return 0
														}
													} while (0);
													if ((R | 0) == (V | 0))
													{
														c[22] = c[22] & ~(1 << W);
														break
													}
													do {
														if ((R | 0) == (J | 0))
														{
															aq = R + 8 | 0
														}
														else
														{
															if (R >>> 0 < (c[26] | 0) >>> 0)
															{
																as();
																return 0
															}
															L = R + 8 | 0;
															if ((c[L >> 2] | 0) == (_ | 0))
															{
																aq = L;
																break
															}
															as();
															return 0
														}
													} while (0);
													c[V + 12 >> 2] = R;
													c[aq >> 2] = V
												}
												else
												{
													J = S;
													L = c[ac + ((ap | 24) + ab) >> 2] | 0;
													O = c[ac + (ab + 12 + ap) >> 2] | 0;
													do {
														if ((O | 0) == (J | 0))
														{
															Q = ap | 16;
															P = ac + (T + Q) | 0;
															e = c[P >> 2] | 0;
															if ((e | 0) == 0)
															{
																M = ac + (Q + ab) | 0;
																Q = c[M >> 2] | 0;
																if ((Q | 0) == 0)
																{
																	ar = 0;
																	break
																}
																else
																{
																	at = Q;
																	au = M
																}
															}
															else
															{
																at = e;
																au = P
															}
															while (1)
															{
																P = at + 20 | 0;
																e = c[P >> 2] | 0;
																if ((e | 0) != 0)
																{
																	at = e;
																	au = P;
																	continue
																}
																P = at + 16 | 0;
																e = c[P >> 2] | 0;
																if ((e | 0) == 0)
																{
																	break
																}
																else
																{
																	at = e;
																	au = P
																}
															}
															if (au >>> 0 < (c[26] | 0) >>> 0)
															{
																as();
																return 0
															}
															else
															{
																c[au >> 2] = 0;
																ar = at;
																break
															}
														}
														else
														{
															P = c[ac + ((ap | 8) + ab) >> 2] | 0;
															if (P >>> 0 < (c[26] | 0) >>> 0)
															{
																as();
																return 0
															}
															e = P + 12 | 0;
															if ((c[e >> 2] | 0) != (J | 0))
															{
																as();
																return 0
															}
															M = O + 8 | 0;
															if ((c[M >> 2] | 0) == (J | 0))
															{
																c[e >> 2] = O;
																c[M >> 2] = P;
																ar = O;
																break
															}
															else
															{
																as();
																return 0
															}
														}
													} while (0);
													if ((L | 0) == 0)
													{
														break
													}
													O = ac + (ab + 28 + ap) | 0;
													V = 392 + (c[O >> 2] << 2) | 0;
													do {
														if ((J | 0) == (c[V >> 2] | 0))
														{
															c[V >> 2] = ar;
															if ((ar | 0) != 0)
															{
																break
															}
															c[23] = c[23] & ~(1 << c[O >> 2]);
															break L367
														}
														else
														{
															if (L >>> 0 < (c[26] | 0) >>> 0)
															{
																as();
																return 0
															}
															R = L + 16 | 0;
															if ((c[R >> 2] | 0) == (J | 0))
															{
																c[R >> 2] = ar
															}
															else
															{
																c[L + 20 >> 2] = ar
															} if ((ar | 0) == 0)
															{
																break L367
															}
														}
													} while (0);
													if (ar >>> 0 < (c[26] | 0) >>> 0)
													{
														as();
														return 0
													}
													c[ar + 24 >> 2] = L;
													J = ap | 16;
													O = c[ac + (J + ab) >> 2] | 0;
													do {
														if ((O | 0) != 0)
														{
															if (O >>> 0 < (c[26] | 0) >>> 0)
															{
																as();
																return 0
															}
															else
															{
																c[ar + 16 >> 2] = O;
																c[O + 24 >> 2] = ar;
																break
															}
														}
													} while (0);
													O = c[ac + (T + J) >> 2] | 0;
													if ((O | 0) == 0)
													{
														break
													}
													if (O >>> 0 < (c[26] | 0) >>> 0)
													{
														as();
														return 0
													}
													else
													{
														c[ar + 20 >> 2] = O;
														c[O + 24 >> 2] = ar;
														break
													}
												}
											} while (0);
											aw = ac + ((aa | ap) + ab) | 0;
											ax = aa + K | 0
										}
										else
										{
											aw = _;
											ax = K
										}
										T = aw + 4 | 0;
										c[T >> 2] = c[T >> 2] & -2;
										c[ac + (Z + 4) >> 2] = ax | 1;
										c[ac + (ax + Z) >> 2] = ax;
										T = ax >>> 3;
										if (ax >>> 0 < 256)
										{
											W = T << 1;
											Y = 128 + (W << 2) | 0;
											O = c[22] | 0;
											L = 1 << T;
											do {
												if ((O & L | 0) == 0)
												{
													c[22] = O | L;
													ay = Y;
													az = 128 + (W + 2 << 2) | 0
												}
												else
												{
													T = 128 + (W + 2 << 2) | 0;
													V = c[T >> 2] | 0;
													if (V >>> 0 >= (c[26] | 0) >>> 0)
													{
														ay = V;
														az = T;
														break
													}
													as();
													return 0
												}
											} while (0);
											c[az >> 2] = $;
											c[ay + 12 >> 2] = $;
											c[ac + (Z + 8) >> 2] = ay;
											c[ac + (Z + 12) >> 2] = Y;
											break
										}
										W = ad;
										L = ax >>> 8;
										do {
											if ((L | 0) == 0)
											{
												aA = 0
											}
											else
											{
												if (ax >>> 0 > 16777215)
												{
													aA = 31;
													break
												}
												O = (L + 1048320 | 0) >>> 16 & 8;
												aa = L << O;
												T = (aa + 520192 | 0) >>> 16 & 4;
												V = aa << T;
												aa = (V + 245760 | 0) >>> 16 & 2;
												R = 14 - (T | O | aa) + (V << aa >>> 15) | 0;
												aA = ax >>> ((R + 7 | 0) >>> 0) & 1 | R << 1
											}
										} while (0);
										L = 392 + (aA << 2) | 0;
										c[ac + (Z + 28) >> 2] = aA;
										c[ac + (Z + 20) >> 2] = 0;
										c[ac + (Z + 16) >> 2] = 0;
										Y = c[23] | 0;
										R = 1 << aA;
										if ((Y & R | 0) == 0)
										{
											c[23] = Y | R;
											c[L >> 2] = W;
											c[ac + (Z + 24) >> 2] = L;
											c[ac + (Z + 12) >> 2] = W;
											c[ac + (Z + 8) >> 2] = W;
											break
										}
										R = c[L >> 2] | 0;
										if ((aA | 0) == 31)
										{
											aB = 0
										}
										else
										{
											aB = 25 - (aA >>> 1) | 0
										}
										L456: do {
											if ((c[R + 4 >> 2] & -8 | 0) == (ax | 0))
											{
												aC = R
											}
											else
											{
												L = R;
												Y = ax << aB;
												while (1)
												{
													aD = L + 16 + (Y >>> 31 << 2) | 0;
													aa = c[aD >> 2] | 0;
													if ((aa | 0) == 0)
													{
														break
													}
													if ((c[aa + 4 >> 2] & -8 | 0) == (ax | 0))
													{
														aC = aa;
														break L456
													}
													else
													{
														L = aa;
														Y = Y << 1
													}
												}
												if (aD >>> 0 < (c[26] | 0) >>> 0)
												{
													as();
													return 0
												}
												else
												{
													c[aD >> 2] = W;
													c[ac + (Z + 24) >> 2] = L;
													c[ac + (Z + 12) >> 2] = W;
													c[ac + (Z + 8) >> 2] = W;
													break L359
												}
											}
										} while (0);
										R = aC + 8 | 0;
										Y = c[R >> 2] | 0;
										J = c[26] | 0;
										if (aC >>> 0 < J >>> 0)
										{
											as();
											return 0
										}
										if (Y >>> 0 < J >>> 0)
										{
											as();
											return 0
										}
										else
										{
											c[Y + 12 >> 2] = W;
											c[R >> 2] = W;
											c[ac + (Z + 8) >> 2] = Y;
											c[ac + (Z + 12) >> 2] = aC;
											c[ac + (Z + 24) >> 2] = 0;
											break
										}
									}
								} while (0);
								n = ac + (an | 8) | 0;
								return n | 0
							}
						} while (0);
						X = ae;
						Z = 536;
						while (1)
						{
							aE = c[Z >> 2] | 0;
							if (aE >>> 0 <= X >>> 0)
							{
								aF = c[Z + 4 >> 2] | 0;
								aG = aE + aF | 0;
								if (aG >>> 0 > X >>> 0)
								{
									break
								}
							}
							Z = c[Z + 8 >> 2] | 0
						}
						Z = aE + (aF - 39) | 0;
						if ((Z & 7 | 0) == 0)
						{
							aH = 0
						}
						else
						{
							aH = -Z & 7
						}
						Z = aE + (aF - 47 + aH) | 0;
						ad = Z >>> 0 < (ae + 16 | 0) >>> 0 ? X : Z;
						Z = ad + 8 | 0;
						$ = ac + 8 | 0;
						if (($ & 7 | 0) == 0)
						{
							aI = 0
						}
						else
						{
							aI = -$ & 7
						}
						$ = ab - 40 - aI | 0;
						c[28] = ac + aI;
						c[25] = $;
						c[ac + (aI + 4) >> 2] = $ | 1;
						c[ac + (ab - 36) >> 2] = 40;
						c[29] = c[18];
						c[ad + 4 >> 2] = 27;
						c[Z >> 2] = c[134];
						c[Z + 4 >> 2] = c[540 >> 2];
						c[Z + 8 >> 2] = c[544 >> 2];
						c[Z + 12 >> 2] = c[548 >> 2];
						c[134] = ac;
						c[135] = ab;
						c[137] = 0;
						c[136] = Z;
						Z = ad + 28 | 0;
						c[Z >> 2] = 7;
						if ((ad + 32 | 0) >>> 0 < aG >>> 0)
						{
							$ = Z;
							while (1)
							{
								Z = $ + 4 | 0;
								c[Z >> 2] = 7;
								if (($ + 8 | 0) >>> 0 < aG >>> 0)
								{
									$ = Z
								}
								else
								{
									break
								}
							}
						}
						if ((ad | 0) == (X | 0))
						{
							break
						}
						$ = ad - ae | 0;
						Z = X + ($ + 4) | 0;
						c[Z >> 2] = c[Z >> 2] & -2;
						c[ae + 4 >> 2] = $ | 1;
						c[X + $ >> 2] = $;
						Z = $ >>> 3;
						if ($ >>> 0 < 256)
						{
							K = Z << 1;
							_ = 128 + (K << 2) | 0;
							S = c[22] | 0;
							j = 1 << Z;
							do {
								if ((S & j | 0) == 0)
								{
									c[22] = S | j;
									aJ = _;
									aK = 128 + (K + 2 << 2) | 0
								}
								else
								{
									Z = 128 + (K + 2 << 2) | 0;
									Y = c[Z >> 2] | 0;
									if (Y >>> 0 >= (c[26] | 0) >>> 0)
									{
										aJ = Y;
										aK = Z;
										break
									}
									as();
									return 0
								}
							} while (0);
							c[aK >> 2] = ae;
							c[aJ + 12 >> 2] = ae;
							c[ae + 8 >> 2] = aJ;
							c[ae + 12 >> 2] = _;
							break
						}
						K = ae;
						j = $ >>> 8;
						do {
							if ((j | 0) == 0)
							{
								aL = 0
							}
							else
							{
								if ($ >>> 0 > 16777215)
								{
									aL = 31;
									break
								}
								S = (j + 1048320 | 0) >>> 16 & 8;
								X = j << S;
								ad = (X + 520192 | 0) >>> 16 & 4;
								Z = X << ad;
								X = (Z + 245760 | 0) >>> 16 & 2;
								Y = 14 - (ad | S | X) + (Z << X >>> 15) | 0;
								aL = $ >>> ((Y + 7 | 0) >>> 0) & 1 | Y << 1
							}
						} while (0);
						j = 392 + (aL << 2) | 0;
						c[ae + 28 >> 2] = aL;
						c[ae + 20 >> 2] = 0;
						c[ae + 16 >> 2] = 0;
						_ = c[23] | 0;
						Y = 1 << aL;
						if ((_ & Y | 0) == 0)
						{
							c[23] = _ | Y;
							c[j >> 2] = K;
							c[ae + 24 >> 2] = j;
							c[ae + 12 >> 2] = ae;
							c[ae + 8 >> 2] = ae;
							break
						}
						Y = c[j >> 2] | 0;
						if ((aL | 0) == 31)
						{
							aM = 0
						}
						else
						{
							aM = 25 - (aL >>> 1) | 0
						}
						L510: do {
							if ((c[Y + 4 >> 2] & -8 | 0) == ($ | 0))
							{
								aN = Y
							}
							else
							{
								j = Y;
								_ = $ << aM;
								while (1)
								{
									aO = j + 16 + (_ >>> 31 << 2) | 0;
									X = c[aO >> 2] | 0;
									if ((X | 0) == 0)
									{
										break
									}
									if ((c[X + 4 >> 2] & -8 | 0) == ($ | 0))
									{
										aN = X;
										break L510
									}
									else
									{
										j = X;
										_ = _ << 1
									}
								}
								if (aO >>> 0 < (c[26] | 0) >>> 0)
								{
									as();
									return 0
								}
								else
								{
									c[aO >> 2] = K;
									c[ae + 24 >> 2] = j;
									c[ae + 12 >> 2] = ae;
									c[ae + 8 >> 2] = ae;
									break L322
								}
							}
						} while (0);
						$ = aN + 8 | 0;
						Y = c[$ >> 2] | 0;
						_ = c[26] | 0;
						if (aN >>> 0 < _ >>> 0)
						{
							as();
							return 0
						}
						if (Y >>> 0 < _ >>> 0)
						{
							as();
							return 0
						}
						else
						{
							c[Y + 12 >> 2] = K;
							c[$ >> 2] = K;
							c[ae + 8 >> 2] = Y;
							c[ae + 12 >> 2] = aN;
							c[ae + 24 >> 2] = 0;
							break
						}
					}
				} while (0);
				ae = c[25] | 0;
				if (ae >>> 0 <= o >>> 0)
				{
					break
				}
				Y = ae - o | 0;
				c[25] = Y;
				ae = c[28] | 0;
				$ = ae;
				c[28] = $ + o;
				c[$ + (o + 4) >> 2] = Y | 1;
				c[ae + 4 >> 2] = o | 3;
				n = ae + 8 | 0;
				return n | 0
			}
		} while (0);
		c[(av() | 0) >> 2] = 12;
		n = 0;
		return n | 0
	}

	function aT(a)
	{
		a = a | 0;
		var b = 0,
			d = 0,
			e = 0,
			f = 0,
			g = 0,
			h = 0,
			i = 0,
			j = 0,
			k = 0,
			l = 0,
			m = 0,
			n = 0,
			o = 0,
			p = 0,
			q = 0,
			r = 0,
			s = 0,
			t = 0,
			u = 0,
			v = 0,
			w = 0,
			x = 0,
			y = 0,
			z = 0,
			A = 0,
			B = 0,
			C = 0,
			D = 0,
			E = 0,
			F = 0,
			G = 0,
			H = 0,
			I = 0,
			J = 0,
			K = 0,
			L = 0,
			M = 0,
			N = 0,
			O = 0;
		if ((a | 0) == 0)
		{
			return
		}
		b = a - 8 | 0;
		d = b;
		e = c[26] | 0;
		if (b >>> 0 < e >>> 0)
		{
			as()
		}
		f = c[a - 4 >> 2] | 0;
		g = f & 3;
		if ((g | 0) == 1)
		{
			as()
		}
		h = f & -8;
		i = a + (h - 8) | 0;
		j = i;
		L541: do {
			if ((f & 1 | 0) == 0)
			{
				k = c[b >> 2] | 0;
				if ((g | 0) == 0)
				{
					return
				}
				l = -8 - k | 0;
				m = a + l | 0;
				n = m;
				o = k + h | 0;
				if (m >>> 0 < e >>> 0)
				{
					as()
				}
				if ((n | 0) == (c[27] | 0))
				{
					p = a + (h - 4) | 0;
					if ((c[p >> 2] & 3 | 0) != 3)
					{
						q = n;
						r = o;
						break
					}
					c[24] = o;
					c[p >> 2] = c[p >> 2] & -2;
					c[a + (l + 4) >> 2] = o | 1;
					c[i >> 2] = o;
					return
				}
				p = k >>> 3;
				if (k >>> 0 < 256)
				{
					k = c[a + (l + 8) >> 2] | 0;
					s = c[a + (l + 12) >> 2] | 0;
					t = 128 + (p << 1 << 2) | 0;
					do {
						if ((k | 0) != (t | 0))
						{
							if (k >>> 0 < e >>> 0)
							{
								as()
							}
							if ((c[k + 12 >> 2] | 0) == (n | 0))
							{
								break
							}
							as()
						}
					} while (0);
					if ((s | 0) == (k | 0))
					{
						c[22] = c[22] & ~(1 << p);
						q = n;
						r = o;
						break
					}
					do {
						if ((s | 0) == (t | 0))
						{
							u = s + 8 | 0
						}
						else
						{
							if (s >>> 0 < e >>> 0)
							{
								as()
							}
							v = s + 8 | 0;
							if ((c[v >> 2] | 0) == (n | 0))
							{
								u = v;
								break
							}
							as()
						}
					} while (0);
					c[k + 12 >> 2] = s;
					c[u >> 2] = k;
					q = n;
					r = o;
					break
				}
				t = m;
				p = c[a + (l + 24) >> 2] | 0;
				v = c[a + (l + 12) >> 2] | 0;
				do {
					if ((v | 0) == (t | 0))
					{
						w = a + (l + 20) | 0;
						x = c[w >> 2] | 0;
						if ((x | 0) == 0)
						{
							y = a + (l + 16) | 0;
							z = c[y >> 2] | 0;
							if ((z | 0) == 0)
							{
								A = 0;
								break
							}
							else
							{
								B = z;
								C = y
							}
						}
						else
						{
							B = x;
							C = w
						}
						while (1)
						{
							w = B + 20 | 0;
							x = c[w >> 2] | 0;
							if ((x | 0) != 0)
							{
								B = x;
								C = w;
								continue
							}
							w = B + 16 | 0;
							x = c[w >> 2] | 0;
							if ((x | 0) == 0)
							{
								break
							}
							else
							{
								B = x;
								C = w
							}
						}
						if (C >>> 0 < e >>> 0)
						{
							as()
						}
						else
						{
							c[C >> 2] = 0;
							A = B;
							break
						}
					}
					else
					{
						w = c[a + (l + 8) >> 2] | 0;
						if (w >>> 0 < e >>> 0)
						{
							as()
						}
						x = w + 12 | 0;
						if ((c[x >> 2] | 0) != (t | 0))
						{
							as()
						}
						y = v + 8 | 0;
						if ((c[y >> 2] | 0) == (t | 0))
						{
							c[x >> 2] = v;
							c[y >> 2] = w;
							A = v;
							break
						}
						else
						{
							as()
						}
					}
				} while (0);
				if ((p | 0) == 0)
				{
					q = n;
					r = o;
					break
				}
				v = a + (l + 28) | 0;
				m = 392 + (c[v >> 2] << 2) | 0;
				do {
					if ((t | 0) == (c[m >> 2] | 0))
					{
						c[m >> 2] = A;
						if ((A | 0) != 0)
						{
							break
						}
						c[23] = c[23] & ~(1 << c[v >> 2]);
						q = n;
						r = o;
						break L541
					}
					else
					{
						if (p >>> 0 < (c[26] | 0) >>> 0)
						{
							as()
						}
						k = p + 16 | 0;
						if ((c[k >> 2] | 0) == (t | 0))
						{
							c[k >> 2] = A
						}
						else
						{
							c[p + 20 >> 2] = A
						} if ((A | 0) == 0)
						{
							q = n;
							r = o;
							break L541
						}
					}
				} while (0);
				if (A >>> 0 < (c[26] | 0) >>> 0)
				{
					as()
				}
				c[A + 24 >> 2] = p;
				t = c[a + (l + 16) >> 2] | 0;
				do {
					if ((t | 0) != 0)
					{
						if (t >>> 0 < (c[26] | 0) >>> 0)
						{
							as()
						}
						else
						{
							c[A + 16 >> 2] = t;
							c[t + 24 >> 2] = A;
							break
						}
					}
				} while (0);
				t = c[a + (l + 20) >> 2] | 0;
				if ((t | 0) == 0)
				{
					q = n;
					r = o;
					break
				}
				if (t >>> 0 < (c[26] | 0) >>> 0)
				{
					as()
				}
				else
				{
					c[A + 20 >> 2] = t;
					c[t + 24 >> 2] = A;
					q = n;
					r = o;
					break
				}
			}
			else
			{
				q = d;
				r = h
			}
		} while (0);
		d = q;
		if (d >>> 0 >= i >>> 0)
		{
			as()
		}
		A = a + (h - 4) | 0;
		e = c[A >> 2] | 0;
		if ((e & 1 | 0) == 0)
		{
			as()
		}
		do {
			if ((e & 2 | 0) == 0)
			{
				if ((j | 0) == (c[28] | 0))
				{
					B = (c[25] | 0) + r | 0;
					c[25] = B;
					c[28] = q;
					c[q + 4 >> 2] = B | 1;
					if ((q | 0) == (c[27] | 0))
					{
						c[27] = 0;
						c[24] = 0
					}
					if (B >>> 0 <= (c[29] | 0) >>> 0)
					{
						return
					}
					aU(0) | 0;
					return
				}
				if ((j | 0) == (c[27] | 0))
				{
					B = (c[24] | 0) + r | 0;
					c[24] = B;
					c[27] = q;
					c[q + 4 >> 2] = B | 1;
					c[d + B >> 2] = B;
					return
				}
				B = (e & -8) + r | 0;
				C = e >>> 3;
				L647: do {
					if (e >>> 0 < 256)
					{
						u = c[a + h >> 2] | 0;
						g = c[a + (h | 4) >> 2] | 0;
						b = 128 + (C << 1 << 2) | 0;
						do {
							if ((u | 0) != (b | 0))
							{
								if (u >>> 0 < (c[26] | 0) >>> 0)
								{
									as()
								}
								if ((c[u + 12 >> 2] | 0) == (j | 0))
								{
									break
								}
								as()
							}
						} while (0);
						if ((g | 0) == (u | 0))
						{
							c[22] = c[22] & ~(1 << C);
							break
						}
						do {
							if ((g | 0) == (b | 0))
							{
								D = g + 8 | 0
							}
							else
							{
								if (g >>> 0 < (c[26] | 0) >>> 0)
								{
									as()
								}
								f = g + 8 | 0;
								if ((c[f >> 2] | 0) == (j | 0))
								{
									D = f;
									break
								}
								as()
							}
						} while (0);
						c[u + 12 >> 2] = g;
						c[D >> 2] = u
					}
					else
					{
						b = i;
						f = c[a + (h + 16) >> 2] | 0;
						t = c[a + (h | 4) >> 2] | 0;
						do {
							if ((t | 0) == (b | 0))
							{
								p = a + (h + 12) | 0;
								v = c[p >> 2] | 0;
								if ((v | 0) == 0)
								{
									m = a + (h + 8) | 0;
									k = c[m >> 2] | 0;
									if ((k | 0) == 0)
									{
										E = 0;
										break
									}
									else
									{
										F = k;
										G = m
									}
								}
								else
								{
									F = v;
									G = p
								}
								while (1)
								{
									p = F + 20 | 0;
									v = c[p >> 2] | 0;
									if ((v | 0) != 0)
									{
										F = v;
										G = p;
										continue
									}
									p = F + 16 | 0;
									v = c[p >> 2] | 0;
									if ((v | 0) == 0)
									{
										break
									}
									else
									{
										F = v;
										G = p
									}
								}
								if (G >>> 0 < (c[26] | 0) >>> 0)
								{
									as()
								}
								else
								{
									c[G >> 2] = 0;
									E = F;
									break
								}
							}
							else
							{
								p = c[a + h >> 2] | 0;
								if (p >>> 0 < (c[26] | 0) >>> 0)
								{
									as()
								}
								v = p + 12 | 0;
								if ((c[v >> 2] | 0) != (b | 0))
								{
									as()
								}
								m = t + 8 | 0;
								if ((c[m >> 2] | 0) == (b | 0))
								{
									c[v >> 2] = t;
									c[m >> 2] = p;
									E = t;
									break
								}
								else
								{
									as()
								}
							}
						} while (0);
						if ((f | 0) == 0)
						{
							break
						}
						t = a + (h + 20) | 0;
						u = 392 + (c[t >> 2] << 2) | 0;
						do {
							if ((b | 0) == (c[u >> 2] | 0))
							{
								c[u >> 2] = E;
								if ((E | 0) != 0)
								{
									break
								}
								c[23] = c[23] & ~(1 << c[t >> 2]);
								break L647
							}
							else
							{
								if (f >>> 0 < (c[26] | 0) >>> 0)
								{
									as()
								}
								g = f + 16 | 0;
								if ((c[g >> 2] | 0) == (b | 0))
								{
									c[g >> 2] = E
								}
								else
								{
									c[f + 20 >> 2] = E
								} if ((E | 0) == 0)
								{
									break L647
								}
							}
						} while (0);
						if (E >>> 0 < (c[26] | 0) >>> 0)
						{
							as()
						}
						c[E + 24 >> 2] = f;
						b = c[a + (h + 8) >> 2] | 0;
						do {
							if ((b | 0) != 0)
							{
								if (b >>> 0 < (c[26] | 0) >>> 0)
								{
									as()
								}
								else
								{
									c[E + 16 >> 2] = b;
									c[b + 24 >> 2] = E;
									break
								}
							}
						} while (0);
						b = c[a + (h + 12) >> 2] | 0;
						if ((b | 0) == 0)
						{
							break
						}
						if (b >>> 0 < (c[26] | 0) >>> 0)
						{
							as()
						}
						else
						{
							c[E + 20 >> 2] = b;
							c[b + 24 >> 2] = E;
							break
						}
					}
				} while (0);
				c[q + 4 >> 2] = B | 1;
				c[d + B >> 2] = B;
				if ((q | 0) != (c[27] | 0))
				{
					H = B;
					break
				}
				c[24] = B;
				return
			}
			else
			{
				c[A >> 2] = e & -2;
				c[q + 4 >> 2] = r | 1;
				c[d + r >> 2] = r;
				H = r
			}
		} while (0);
		r = H >>> 3;
		if (H >>> 0 < 256)
		{
			d = r << 1;
			e = 128 + (d << 2) | 0;
			A = c[22] | 0;
			E = 1 << r;
			do {
				if ((A & E | 0) == 0)
				{
					c[22] = A | E;
					I = e;
					J = 128 + (d + 2 << 2) | 0
				}
				else
				{
					r = 128 + (d + 2 << 2) | 0;
					h = c[r >> 2] | 0;
					if (h >>> 0 >= (c[26] | 0) >>> 0)
					{
						I = h;
						J = r;
						break
					}
					as()
				}
			} while (0);
			c[J >> 2] = q;
			c[I + 12 >> 2] = q;
			c[q + 8 >> 2] = I;
			c[q + 12 >> 2] = e;
			return
		}
		e = q;
		I = H >>> 8;
		do {
			if ((I | 0) == 0)
			{
				K = 0
			}
			else
			{
				if (H >>> 0 > 16777215)
				{
					K = 31;
					break
				}
				J = (I + 1048320 | 0) >>> 16 & 8;
				d = I << J;
				E = (d + 520192 | 0) >>> 16 & 4;
				A = d << E;
				d = (A + 245760 | 0) >>> 16 & 2;
				r = 14 - (E | J | d) + (A << d >>> 15) | 0;
				K = H >>> ((r + 7 | 0) >>> 0) & 1 | r << 1
			}
		} while (0);
		I = 392 + (K << 2) | 0;
		c[q + 28 >> 2] = K;
		c[q + 20 >> 2] = 0;
		c[q + 16 >> 2] = 0;
		r = c[23] | 0;
		d = 1 << K;
		L733: do {
			if ((r & d | 0) == 0)
			{
				c[23] = r | d;
				c[I >> 2] = e;
				c[q + 24 >> 2] = I;
				c[q + 12 >> 2] = q;
				c[q + 8 >> 2] = q
			}
			else
			{
				A = c[I >> 2] | 0;
				if ((K | 0) == 31)
				{
					L = 0
				}
				else
				{
					L = 25 - (K >>> 1) | 0
				}
				L739: do {
					if ((c[A + 4 >> 2] & -8 | 0) == (H | 0))
					{
						M = A
					}
					else
					{
						J = A;
						E = H << L;
						while (1)
						{
							N = J + 16 + (E >>> 31 << 2) | 0;
							h = c[N >> 2] | 0;
							if ((h | 0) == 0)
							{
								break
							}
							if ((c[h + 4 >> 2] & -8 | 0) == (H | 0))
							{
								M = h;
								break L739
							}
							else
							{
								J = h;
								E = E << 1
							}
						}
						if (N >>> 0 < (c[26] | 0) >>> 0)
						{
							as()
						}
						else
						{
							c[N >> 2] = e;
							c[q + 24 >> 2] = J;
							c[q + 12 >> 2] = q;
							c[q + 8 >> 2] = q;
							break L733
						}
					}
				} while (0);
				A = M + 8 | 0;
				B = c[A >> 2] | 0;
				E = c[26] | 0;
				if (M >>> 0 < E >>> 0)
				{
					as()
				}
				if (B >>> 0 < E >>> 0)
				{
					as()
				}
				else
				{
					c[B + 12 >> 2] = e;
					c[A >> 2] = e;
					c[q + 8 >> 2] = B;
					c[q + 12 >> 2] = M;
					c[q + 24 >> 2] = 0;
					break
				}
			}
		} while (0);
		q = (c[30] | 0) - 1 | 0;
		c[30] = q;
		if ((q | 0) == 0)
		{
			O = 544
		}
		else
		{
			return
		}
		while (1)
		{
			q = c[O >> 2] | 0;
			if ((q | 0) == 0)
			{
				break
			}
			else
			{
				O = q + 8 | 0
			}
		}
		c[30] = -1;
		return
	}

	function aU(a)
	{
		a = a | 0;
		var b = 0,
			d = 0,
			e = 0,
			f = 0,
			g = 0,
			h = 0,
			i = 0,
			j = 0,
			k = 0,
			l = 0,
			m = 0,
			n = 0,
			o = 0,
			p = 0,
			q = 0;
		do {
			if ((c[14] | 0) == 0)
			{
				b = ak(8) | 0;
				if ((b - 1 & b | 0) == 0)
				{
					c[16] = b;
					c[15] = b;
					c[17] = -1;
					c[18] = 2097152;
					c[19] = 0;
					c[133] = 0;
					c[14] = (ao(0) | 0) & -16 ^ 1431655768;
					break
				}
				else
				{
					as();
					return 0
				}
			}
		} while (0);
		if (a >>> 0 >= 4294967232)
		{
			d = 0;
			return d | 0
		}
		b = c[28] | 0;
		if ((b | 0) == 0)
		{
			d = 0;
			return d | 0
		}
		e = c[25] | 0;
		do {
			if (e >>> 0 > (a + 40 | 0) >>> 0)
			{
				f = c[16] | 0;
				g = (((-40 - a - 1 + e + f | 0) >>> 0) / (f >>> 0) | 0) - 1 | 0;
				h = b;
				i = 536;
				while (1)
				{
					j = i | 0;
					k = c[j >> 2] | 0;
					if (k >>> 0 <= h >>> 0)
					{
						l = i + 4 | 0;
						if ((k + (c[l >> 2] | 0) | 0) >>> 0 > h >>> 0)
						{
							break
						}
					}
					i = c[i + 8 >> 2] | 0
				}
				h = Z(g, f) | 0;
				if ((c[i + 12 >> 2] & 8 | 0) != 0)
				{
					break
				}
				k = aj(0) | 0;
				if ((k | 0) != ((c[j >> 2] | 0) + (c[l >> 2] | 0) | 0))
				{
					break
				}
				m = aj(-(h >>> 0 > 2147483646 ? -2147483648 - f | 0 : h) | 0) | 0;
				h = aj(0) | 0;
				if (!((m | 0) != -1 & h >>> 0 < k >>> 0))
				{
					break
				}
				m = k - h | 0;
				if ((k | 0) == (h | 0))
				{
					break
				}
				c[l >> 2] = (c[l >> 2] | 0) - m;
				c[130] = (c[130] | 0) - m;
				n = c[28] | 0;
				o = (c[25] | 0) - m | 0;
				m = n;
				p = n + 8 | 0;
				if ((p & 7 | 0) == 0)
				{
					q = 0
				}
				else
				{
					q = -p & 7
				}
				p = o - q | 0;
				c[28] = m + q;
				c[25] = p;
				c[m + (q + 4) >> 2] = p | 1;
				c[m + (o + 4) >> 2] = 40;
				c[29] = c[18];
				d = (k | 0) != (h | 0) | 0;
				return d | 0
			}
		} while (0);
		if ((c[25] | 0) >>> 0 <= (c[29] | 0) >>> 0)
		{
			d = 0;
			return d | 0
		}
		c[29] = -1;
		d = 0;
		return d | 0
	}

	function aV(b)
	{
		b = b | 0;
		var c = 0;
		c = b;
		while (a[c] | 0)
		{
			c = c + 1 | 0
		}
		return c - b | 0
	}

	function aW(b, d, e)
	{
		b = b | 0;
		d = d | 0;
		e = e | 0;
		var f = 0;
		f = b | 0;
		if ((b & 3) == (d & 3))
		{
			while (b & 3)
			{
				if ((e | 0) == 0) return f | 0;
				a[b] = a[d] | 0;
				b = b + 1 | 0;
				d = d + 1 | 0;
				e = e - 1 | 0
			}
			while ((e | 0) >= 4)
			{
				c[b >> 2] = c[d >> 2];
				b = b + 4 | 0;
				d = d + 4 | 0;
				e = e - 4 | 0
			}
		}
		while ((e | 0) > 0)
		{
			a[b] = a[d] | 0;
			b = b + 1 | 0;
			d = d + 1 | 0;
			e = e - 1 | 0
		}
		return f | 0
	}

	function aX(b, d, e)
	{
		b = b | 0;
		d = d | 0;
		e = e | 0;
		var f = 0,
			g = 0,
			h = 0;
		f = b + e | 0;
		if ((e | 0) >= 20)
		{
			d = d & 255;
			e = b & 3;
			g = d | d << 8 | d << 16 | d << 24;
			h = f & ~3;
			if (e)
			{
				e = b + 4 - e | 0;
				while ((b | 0) < (e | 0))
				{
					a[b] = d;
					b = b + 1 | 0
				}
			}
			while ((b | 0) < (h | 0))
			{
				c[b >> 2] = g;
				b = b + 4 | 0
			}
		}
		while ((b | 0) < (f | 0))
		{
			a[b] = d;
			b = b + 1 | 0
		}
	}

	function aY(a, b)
	{
		a = a | 0;
		b = b | 0;
		return aw[a & 1](b | 0) | 0
	}

	function aZ(a)
	{
		a = a | 0;
		ax[a & 1]()
	}

	function a_(a, b, c)
	{
		a = a | 0;
		b = b | 0;
		c = c | 0;
		return ay[a & 1](b | 0, c | 0) | 0
	}

	function a$(a, b)
	{
		a = a | 0;
		b = b | 0;
		az[a & 1](b | 0)
	}

	function a0(a)
	{
		a = a | 0;
		_(0);
		return 0
	}

	function a1()
	{
		_(1)
	}

	function a2(a, b)
	{
		a = a | 0;
		b = b | 0;
		_(2);
		return 0
	}

	function a3(a)
	{
		a = a | 0;
		_(3)
	}
	// EMSCRIPTEN_END_FUNCS
	var aw = [a0, a0];
	var ax = [a1, a1];
	var ay = [a2, a2];
	var az = [a3, a3];
	return {
		_strlen: aV,
		_free: aT,
		_main: aR,
		_memset: aX,
		_malloc: aS,
		_memcpy: aW,
		runPostSets: aQ,
		stackAlloc: aA,
		stackSave: aB,
		stackRestore: aC,
		setThrew: aD,
		setTempRet0: aG,
		setTempRet1: aH,
		setTempRet2: aI,
		setTempRet3: aJ,
		setTempRet4: aK,
		setTempRet5: aL,
		setTempRet6: aM,
		setTempRet7: aN,
		setTempRet8: aO,
		setTempRet9: aP,
		dynCall_ii: aY,
		dynCall_v: aZ,
		dynCall_iii: a_,
		dynCall_vi: a$
	}
})
// EMSCRIPTEN_END_ASM
(
{
	"Math": Math,
	"Int8Array": Int8Array,
	"Int16Array": Int16Array,
	"Int32Array": Int32Array,
	"Uint8Array": Uint8Array,
	"Uint16Array": Uint16Array,
	"Uint32Array": Uint32Array,
	"Float32Array": Float32Array,
	"Float64Array": Float64Array
},
{
	"abort": abort,
	"assert": assert,
	"asmPrintInt": asmPrintInt,
	"asmPrintFloat": asmPrintFloat,
	"min": Math_min,
	"invoke_ii": invoke_ii,
	"invoke_v": invoke_v,
	"invoke_iii": invoke_iii,
	"invoke_vi": invoke_vi,
	"_clock_gettime": _clock_gettime,
	"_pwrite": _pwrite,
	"_sbrk": _sbrk,
	"_sysconf": _sysconf,
	"___setErrNo": ___setErrNo,
	"_fwrite": _fwrite,
	"__reallyNegative": __reallyNegative,
	"_time": _time,
	"__formatString": __formatString,
	"_send": _send,
	"_write": _write,
	"_abort": _abort,
	"_fprintf": _fprintf,
	"_printf": _printf,
	"___errno_location": ___errno_location,
	"STACKTOP": STACKTOP,
	"STACK_MAX": STACK_MAX,
	"tempDoublePtr": tempDoublePtr,
	"ABORT": ABORT,
	"NaN": NaN,
	"Infinity": Infinity
}, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
Runtime.stackAlloc = function (size)
{
	return asm['stackAlloc'](size)
};
Runtime.stackSave = function ()
{
	return asm['stackSave']()
};
Runtime.stackRestore = function (top)
{
	asm['stackRestore'](top)
};
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
var initialStackTop;
var inMain;
Module['callMain'] = Module.callMain = function callMain(args)
{
	assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
	assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
	args = args || [];
	ensureInitRuntime();
	var argc = args.length + 1;

	function pad()
	{
		for (var i = 0; i < 4 - 1; i++)
		{
			argv.push(0);
		}
	}
	var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL)];
	pad();
	for (var i = 0; i < argc - 1; i = i + 1)
	{
		argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
		pad();
	}
	argv.push(0);
	argv = allocate(argv, 'i32', ALLOC_NORMAL);
	initialStackTop = STACKTOP;
	inMain = true;
	var ret;
	try
	{
		var start = new Date().getTime();
		ret = Module['_main'](argc, argv, 0);
		var stop = new Date().getTime();
		console.log('final: '+(stop-start));
	}
	catch (e)
	{
		if (e && typeof e == 'object' && e.type == 'ExitStatus')
		{
			// exit() throws this once it's done to make sure execution
			// has been stopped completely
			Module.print('Exit Status: ' + e.value);
			return e.value;
		}
		else if (e == 'SimulateInfiniteLoop')
		{
			// running an evented main loop, don't immediately exit
			Module['noExitRuntime'] = true;
		}
		else
		{
			throw e;
		}
	}
	finally
	{
		inMain = false;
	}
	// if we're not running an evented main loop, it's time to exit
	if (!Module['noExitRuntime'])
	{
		exit(ret);
	}
}

function run(args)
{
	args = args || Module['arguments'];
	if (runDependencies > 0)
	{
		Module.printErr('run() called, but dependencies remain, so not running');
		return;
	}
	preRun();
	if (runDependencies > 0)
	{
		// a preRun added a dependency, run will be called later
		return;
	}

	function doRun()
	{
		ensureInitRuntime();
		preMain();
		calledRun = true;
		if (Module['_main'] && shouldRunNow)
		{
			Module['callMain'](args);
		}
		postRun();
	}
	if (Module['setStatus'])
	{
		Module['setStatus']('Running...');
		setTimeout(function ()
		{
			setTimeout(function ()
			{
				Module['setStatus']('');
			}, 1);
			if (!ABORT) doRun();
		}, 1);
	}
	else
	{
		doRun();
	}
}
Module['run'] = Module.run = run;

function exit(status)
{
	ABORT = true;
	STACKTOP = initialStackTop;
	// TODO call externally added 'exit' callbacks with the status code.
	// It'd be nice to provide the same interface for all Module events (e.g.
	// prerun, premain, postmain). Perhaps an EventEmitter so we can do:
	// Module.on('exit', function (status) {});
	// exit the runtime
	exitRuntime();
	if (inMain)
	{
		// if we're still inside the callMain's try/catch, we need to throw an
		// exception in order to immediately terminate execution.
		throw {
			type: 'ExitStatus',
			value: status
		};
	}
}
Module['exit'] = Module.exit = exit;

function abort(text)
{
	if (text)
	{
		Module.print(text);
	}
	ABORT = true;
	throw 'abort() at ' + (new Error().stack);
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit'])
{
	if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
	while (Module['preInit'].length > 0)
	{
		Module['preInit'].pop()();
	}
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun'])
{
	shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}
