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
	${MEASURE} node main.js
	# OCaml: skipped
	# PHP: skipped
	# Perl
	${MEASURE} perl main.pl
	# Python: skipped
	# Ruby
	${MEASURE} ruby main.rb
