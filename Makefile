MEASURE=/usr/bin/time --format='Peak: %M Kb'


all: check test

check:
	# Doing sanity checks...
	/usr/bin/time -V
	java -version
	node --version
	perl --version
	ruby --version

test:
	# Java
	cp tests/Main.java .
	javac Main.java
	${MEASURE} java Main
	rm Main.java Main.class
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
