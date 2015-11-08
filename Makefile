MEASURE=echo -n 'Time, ms: '; /usr/bin/time --format='Peak: %M Kb'


all: check test

check:
	# Doing sanity checks...
	/usr/bin/time -V
	cargo --version # Rust
	java -version # Java
	gcc --version # C
	dmd --version # D
	crystal -v # Crystal
	erlc tests/main.erl; rm main.beam # Erlang
	node --version # JavaScript
	lua -v # Lua
	luajit -v # LuaJIT
	ocaml -version # OCaml
	perl --version # Perl
	python2 --version # Python
	pypy --version # Python/PyPy
	ruby --version # Ruby

test:
	# Rust
	cp tests/rust/Cargo.toml .
	mkdir src
	cp tests/rust/src/main.rs src/
	${MEASURE} cargo run --release
	rm Cargo.toml Cargo.lock
	rm -rf src/
	rm -rf target/
	# Java
	cp tests/Main.java .
	javac Main.java
	${MEASURE} java Main
	rm Main.java Main.class
	# C
	gcc tests/main.c -o ./main -O3 -march=native -lrt
	${MEASURE} ./main
	rm ./main
	# D
	dmd tests/main.d -of./main -O
	${MEASURE} ./main
	rm ./main ./main.o
	# Crystal
	${MEASURE} crystal run tests/main.cr
	rm -rf .crystal
	# Erlang
	cp tests/main.erl .
	erlc main.erl
	${MEASURE} erl -c main -run main start -noshell || true
	rm main.erl main.beam erl_crash.dump
	# JavaScript
	${MEASURE} node tests/main.js
	# Lua (x10 to get real numbers)
	${MEASURE} lua tests/main.lua
	# LuaJIT, JIT off (x10 to get real numbers)
	${MEASURE} luajit -j off tests/main.lua
	# LuaJIT (x10 to get real numbers)
	${MEASURE} luajit tests/main.lua
	# OCaml (memory x20 to get real size)
	${MEASURE} ocaml tests/main.ml
	# PHP: skipped (consumes too much memory, run main.php manually)
	# Perl
	${MEASURE} perl tests/main.pl
	# Python
	${MEASURE} python2 tests/main.py
	# Python/PyPy
	${MEASURE} pypy tests/main.py
	# Ruby
	${MEASURE} ruby tests/main.rb