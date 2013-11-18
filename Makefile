MEASURE=/usr/bin/time --format='Peak: %M Kb'


all: check test

check:
	# Doing sanity checks...
	/usr/bin/time -V
	node --version
	perl --version
	ruby --version

test:
	# Java: skipped
	# C: skipped
	# D: skipped
	# Erlang: skipped
	# JavaScript
	${MEASURE} node tests/main.js
	# OCaml: skipped
	# PHP: skipped
	# Perl
	${MEASURE} perl tests/main.pl
	# Python: skipped
	# Ruby
	${MEASURE} ruby tests/main.rb
