MEASURE=echo -n 'Time, ms: '; /usr/bin/time --format='Peak: %M Kb'


all: check test

check:
	# Doing sanity checks...
	/usr/bin/time -V
	java -version
	gcc --version
	dmd --help
	node --version
	perl --version
	ruby --version

test:
	# Java
	cp tests/Main.java .
	javac Main.java
	${MEASURE} java Main
	rm Main.java Main.class
	# C
	gcc tests/main.c -o ./main -O3 -march=native
	${MEASURE} ./main
	rm ./main
	# D
	dmd tests/main.d -of./main -O
	${MEASURE} ./main
	rm ./main ./main.o
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
