#!/usr/bin/env coffee

require 'shelljs/global'
chalk = require 'chalk'

console.log chalk.blue "langspeed benchmark\n"

data =
	c:
		name: 'C'
		check: 'gcc --version | head -n 1'
		copy: [
			'./tests/main.c'
		]
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
		copy: [
			'./tests/Main.java'
		]
		compile: [
			'javac Main.java'
		]
		tests:
			'Regular': 'java Main'
			'Without JIT': 'java -Xint Main'

# TODO: check /usr/bin/time

# TODO: parse agrv
planned = ['c', 'java']

langs = []
for i in planned
	# TODO: check for mistakes
	langs.push(data[i])

for lang in langs
	console.log "#{chalk.green('Testing language:')} #{lang.name}"
	process.stdout.write chalk.green ' Detecting toolchain version... '
	exec lang.check, silent: false  # returns code 0 even if it fails, lol
	console.log chalk.green ' Preparing...'
	mkdir './_build'
	for f in lang.copy
		cp '-r', f, './_build'
	cd './_build'
	console.log chalk.green ' Compiling...'
	for cmd in lang.compile
		console.log chalk.gray "  $ #{cmd}"
		# TODO: --verbose
		result = exec cmd, silent: true
		if result.code != 0 then console.log chalk.red '  command failed'
	console.log chalk.green ' Running tests...'
	for test, cmd of lang.tests
		console.log "  #{test}"
		process.stdout.write '   Time, ms: '
		result = exec "/usr/bin/time --format='   Peak: %M Kb' #{cmd}", silent: false
		if result.code != 0 then console.log chalk.red '   command failed'
	console.log chalk.green ' Cleaning up...'
	cd '..'
	rm '-r', './_build'
	console.log ''
