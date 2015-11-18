#!/usr/bin/env coffee

shelljs = require 'shelljs'
require 'shelljs/global'
chalk = require 'chalk'

console.log chalk.blue "langspeed benchmark\n"

data =
	c:
		name: 'C'
		check: 'gcc --version | head -n 1'
		copy: './tests/main.c'
		compile: [
			'gcc main.c -o ./test1 -O2 -lrt'
			'gcc main.c -o ./test2 -O3 -march=native -lrt'
		]
		tests:
			'O2, generic': './test1'
			'O3, native': './test2'
	java:
		name: 'Java'
		check: 'java -version 2>&1 | head -n1'
		copy: './tests/Main.java'
		compile: [
			'javac Main.java'
		]
		tests:
			'Regular': 'java Main'
			'Without JIT': 'java -Xint Main'
	crystal:
		name: 'Crystal'
		check: 'crystal --version'
		copy: './tests/main.cr'
		tests:
			'Regular': 'crystal run --release main.cr'
	d:
		name: 'D'
		check: [
			'dmd --version | head -n1'
			'ldc --version | head -n500 | head -n1'
		]
		copy: './tests/main.d'
		compile: [
			'dmd main.d -of./main-dmd -O'
			'ldc main.d -of./main-ldc -O5'
		]
		tests:
			'DMD': './main-dmd'
			'LDC': './main-ldc'
	erlang:
		name: 'Erlang'
		check: 'erlc --version 2>&1 | head -n1'
		copy: 'tests/main.erl'
		compile: 'erlc main.erl'
		tests:
			'Regular': 'erl -c main -run main start -noshell || true'
	js:
		name: 'JavaScript (Node.js)'
		check: 'node -v'
		copy: 'tests/main.js'
		tests:
			'Regular': 'node main.js'
	lua:
		name: 'Lua'
		check: [
			'lua -v'
			'luajit -v'
		]
		copy: 'tests/main.lua'
		tests:
			'Regular': 'lua main.lua'
			'LuaJIT (JIT off)': 'luajit -j off main.lua'
			'LuaJIT': 'luajit main.lua'
		multiply:
			time: 10
			memory: 10
	ocaml:
		name: 'OCaml'
		check: 'ocaml -version'
		copy: 'tests/main.ml'
		tests:
			'Regular': 'ocaml main.ml'
		multiply:
			memory: 20
	php:
		name: 'PHP'
		check: 'php --version | head -n1'
		copy: 'tests/main.php'
		tests:
			'Regular': 'php main.php'
		multiply:
			time: 100
			memory: 100
	perl:
		name: 'Perl'
		check: 'perl --version | grep "This is"'
		copy: 'tests/main.pl'
		tests:
			'Regular': 'perl main.pl'
	python:
		name: 'Python'
		check: [
			'python2 --version'
			'pypy --version 2>&1 | xargs echo'
		]
		copy: 'tests/main.py'
		tests:
			'Regular': 'python2 main.py'
			'PyPy (JIT)': 'pypy main.py'
	ruby:
		name: 'Ruby'
		check: 'ruby --version'
		copy: 'tests/main.rb'
		tests:
			'Regular': 'ruby main.rb'
	rust:
		name: 'Rust'
		check: [
			'rustc --version'
			'cargo --version'
		]
		copy: [
			'tests/rust/Cargo.toml'
			'tests/rust/src'
		]
		compile: 'cargo build --release'
		tests:
			'Regular': './target/release/rust-benchmark'

arrayize = (x) ->
	if x is undefined
		return undefined
	if typeof(x) is 'array'
		return x
	if typeof(x) is 'object'
		return x
	return [x]

for x of data
	data[x].check = arrayize(data[x].check)
	data[x].copy = arrayize(data[x].copy)
	data[x].compile = arrayize(data[x].compile)
	data[x].tests = arrayize(data[x].tests)

# Check for /usr/bin/time
process.stdout.write 'Checking for /usr/bin/time... '
result = exec '/usr/bin/time --version', silent: true
console.log (if result.code is 0 then 'ok' else chalk.red('failed'))
console.log ''

# Pre-clean
if shelljs.test '-d', './_build'
	console.log "Cleaning up...\n"
	rm '-r', './_build'

# TODO: parse agrv
planned = [
	'c'
	'crystal'
	'rust'
	'lua'
]
planned = Object.keys(data)

# TODO: --checks-only

langs = []
for i in planned
	# TODO: check for mistakes
	langs.push(data[i])

execute = (cmd) ->
	tmp = exec cmd, silent: true
	tmp.output = tmp.output.trim()
	return tmp

results = {}

# Do the actual benchmarking
for lang in langs
	results[lang.name] = {}
	# Header
	console.log "#{chalk.green('Testing language:')} #{lang.name}"
	# Detect toolchain versions
	console.log chalk.green ' Detecting toolchain versions...'
	for cmd in lang.check
		# TODO: gray
		process.stdout.write '  '
		result = exec cmd, silent: false  # often returns code 0 even if it fails, lol
		if result.code != 0 then console.log chalk.red '  command failed'
	# Copy files into temp dir
	console.log chalk.green ' Preparing...'
	mkdir './_build'
	for f in lang.copy
		cp '-r', f, './_build'
	cd './_build'
	# Compile files (if needed)
	if lang.compile? and lang.compile.length > 0
		console.log chalk.green ' Compiling...'
		for cmd in lang.compile
			console.log chalk.gray "  $ #{cmd}"
			# TODO: --verbose
			result = exec cmd, silent: true
			if result.code != 0 then console.log chalk.red '  command failed'
	# Run tests
	console.log chalk.green ' Running tests...'
	# Warn if there are limitations
	if lang.multiply?
		tmp1 = []
		for i of lang.multiply
			tmp1.push "#{i} x#{lang.multiply[i]}"
		tmp2 = tmp1.join ', '
		#console.log "  Note: Shown numbers are wrong due to technical limitations."
		#console.log "  Multiply them: #{tmp2}."
	# Actually run tests
	for test, cmd of lang.tests
		console.log chalk.blue "  #{test}"
		process.stdout.write '...\r'
		result = execute "/usr/bin/time --format='   Peak: %M Kb' #{cmd}"
		#console.log "   Time, ms: #{result.output}"
		if result.code != 0 then console.log chalk.red '   command failed'
		# Parse results (for the sake of parsing)
		time = parseFloat(result.output.split('\n')[0])
		timeAccurate = true
		if lang.multiply?.time?
			time = time * lang.multiply.time
			timeAccurate = false
		memory = parseInt(result.output.match(/\d+\sKb/g)[0].split(' ')[0])
		memoryAccurate = true
		if lang.multiply?.memory?
			memory = memory * lang.multiply.memory
			memoryAccurate = false
		console.log "   Parsed time: #{time} ms"
		console.log "   Parsed memory: #{memory} KB"
		results[lang.name][test] =
			time: time
			timeAccurate: timeAccurate
			memory: memory
			memoryAccurate: memoryAccurate
	# Remove temp dir
	console.log chalk.green ' Cleaning up...'
	cd '..'
	rm '-r', './_build'
	console.log ''
#console.log JSON.stringify results
