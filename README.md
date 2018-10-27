langspeed
=========

Array benchmark for different languages.

Credit: [@3bl3gamer](https://github.com/3bl3gamer)

The task is to create a one-dimensional array of size 25600\*2048, loop over it and fill with values so `a[i+w*j] = i*j` and print time elapsed for this operation. Only loop time counts; time for starting up and allocating memory doesn't.


Running
-------

Run `make` to run tests.

`make check` checks that you have all the compilers and interpreters, `make test` runs tests without any checks.

There's also an experimental CoffeeScript runner. `npm install` to install deps, `./make.coffee` to run.


My results
----------

Language                     | Time       | Peak memory
-----------------------------|-----------:|-------------:
Java                         |    744  ms |   236 044  Kb
Java (JIT off)               |  1 227  ms |   233 760  Kb
C                            |  1 057  ms |   205 292  Kb
D                            |    718  ms |   207 860  Kb
Crystal                      |  1 300  ms |   207 140  Kb
Erlang                       | 14 934  ms | 1 835 808  Kb
JavaScript (V8, Node.js)     |    919  ms |   214 636  Kb
Lua                          | 20 665  ms | 2 969 400  Kb
LuaJIT (JIT off)             |  8 958  ms | 1 165 840  Kb
LuaJIT                       |  6 241  ms | 1 166 440  Kb
OCaml                        |  2 707  ms |   507 680  Kb
PHP                          | 20 334  ms | 4 406 800  Kb
Perl                         | 10 316  ms | 1 858 504  Kb
Python                       | 16 258  ms |   618 688  Kb
Python/PyPy                  |  3 152  ms | 2 113 628  Kb
Ruby                         | 10 572  ms |   416 248  Kb
Rust                         |    942  ms |   207 072  Kb

Refer [Makefile](Makefile) to see compiler flags.

```
langspeed benchmark

Checking for /usr/bin/time... ok

Testing language: C
 Detecting toolchain versions...
  gcc (GCC) 8.2.1 20180831
 Preparing...
 Compiling...
  $ gcc main.c -o ./test1 -O2 -lrt
  $ gcc main.c -o ./test2 -O3 -march=native -lrt
 Running tests...
  O2, generic
   Parsed time: 468 ms
   Parsed memory: 206268 KB
  O3, native
   Parsed time: 482 ms
   Parsed memory: 206208 KB
 Cleaning up...

Testing language: Java
 Detecting toolchain versions...
  openjdk version "1.8.0_192"
 Preparing...
 Compiling...
  $ javac Main.java
 Running tests...
  Regular
   Parsed time: 436 ms
   Parsed memory: 229268 KB
  Without JIT
   Parsed time: 898 ms
   Parsed memory: 226424 KB
 Cleaning up...

Testing language: Crystal
 Detecting toolchain versions...
  Crystal 0.26.1 (2018-09-27)

LLVM: 6.0.1
Default target: x86_64-pc-linux-gnu
 Preparing...
 Running tests...
  Regular
   Parsed time: 437.619 ms
   Parsed memory: 209300 KB
 Cleaning up...

Testing language: D
 Detecting toolchain versions...
  DMD64 D Compiler v2.082.1
  LDC - the LLVM D compiler (1.12.0):
 Preparing...
 Compiling...
  $ dmd main.d -of./main-dmd -O
  $ ldc main.d -of./main-ldc -O5
 Running tests...
  DMD
   Parsed time: 453 ms
   Parsed memory: 208084 KB
  LDC
   Parsed time: 437 ms
   Parsed memory: 211292 KB
 Cleaning up...

Testing language: Erlang
 Detecting toolchain versions...
  Unknown option: --version
 Preparing...
 Compiling...
  $ erlc main.erl
 Running tests...
  Regular
   Parsed time: 8851.324000000954 ms
   Parsed memory: 1989596 KB
 Cleaning up...

Testing language: JavaScript (Node.js)
 Detecting toolchain versions...
  v10.12.0
 Preparing...
 Running tests...
  Regular
   Parsed time: 503 ms
   Parsed memory: 236596 KB
 Cleaning up...

Testing language: Lua
 Detecting toolchain versions...
  Lua 5.3.5  Copyright (C) 1994-2018 Lua.org, PUC-Rio
  LuaJIT 2.0.5 -- Copyright (C) 2005-2017 Mike Pall. http://luajit.org/
 Preparing...
 Running tests...
  Regular
   Parsed time: 12096.65 ms
   Parsed memory: 2642960 KB
  LuaJIT (JIT off)
   Parsed time: 7927.84 ms
   Parsed memory: 1169440 KB
  LuaJIT
   Parsed time: 5290.54 ms
   Parsed memory: 1169920 KB
 Cleaning up...

Testing language: OCaml
 Detecting toolchain versions...
  The OCaml toplevel, version 4.07.0
 Preparing...
 Running tests...
  Regular
   Parsed time: 788.106 ms
   Parsed memory: 587840 KB
 Cleaning up...

Testing language: PHP
 Detecting toolchain versions...
  PHP 7.2.11 (cli) (built: Oct  9 2018 18:14:59) ( NTS )
 Preparing...
 Running tests...
  Regular
   Parsed time: 3849.0056991577 ms
   Parsed memory: 2753200 KB
 Cleaning up...

Testing language: Perl
 Detecting toolchain versions...
  This is perl 5, version 28, subversion 0 (v5.28.0) built for x86_64-linux-thread-multi
 Preparing...
 Running tests...
  Regular
   Parsed time: 5275.40993690491 ms
   Parsed memory: 1445000 KB
 Cleaning up...

Testing language: Python
 Detecting toolchain versions...
  Python 2.7.15
  Python 2.7.13 (ab0b9caf307db6592905a80b8faffd69b39005b8, Jun 22 2018, 02:37:02) [PyPy 6.0.0 with GCC 8.1.1 20180531]
 Preparing...
 Running tests...
  Regular
   Parsed time: 9613.56306076 ms
   Parsed memory: 620608 KB
  PyPy (JIT)
   Parsed time: 701.223134995 ms
   Parsed memory: 678584 KB
 Cleaning up...

Testing language: Ruby
 Detecting toolchain versions...
  ruby 2.5.3p105 (2018-10-18 revision 65156) [x86_64-linux]
 Preparing...
 Running tests...
  Regular
   Parsed time: 4063.145529 ms
   Parsed memory: 418276 KB
 Cleaning up...

Testing language: Rust
 Detecting toolchain versions...
  rustc 1.29.1
  cargo 1.29.0
 Preparing...
 Compiling...
  $ cargo build --release
 Running tests...
  Regular
   Parsed time: 440 ms
   Parsed memory: 207156 KB
 Cleaning up...
```


### Browsers

Language                                        | Time        | Peak memory
------------------------------------------------|------------:|-------------:
JavaScript (V8, Chromium)                       |     736  ms |   202 432  Kb
JavaScript (IonMonkey, FF)                      |   1 007  ms |         -


### Browsers - full time

I've made this test specifically to test asm.js and due to its technical limitations.

Language                                          | Time        | Peak memory
--------------------------------------------------|------------:|-------------:
JavaScript (V8, Chromium)                         |     991  ms |         -
JavaScript (IonMonkey, FF)                        |   1 130  ms |         -
JavaScript (OdinMonkey, FF / asm.js / Emscripten) |     948  ms |         -


Initial results
---------------

```
*почти везде использовался одномерный массив размером 25600x2048*
*обрабатывался он 2я циклами как двумерный (почему бы и нет?)*
*заполнялся значениями i*j*

просто ЖС-косоль (Хром)
8300ms на 256x2048, на бОльших размерах проверять влом


zblzgamer@1225c:~/tmp$ ruby main.rb
60383ms
202.3MiB


zblzgamer@1225c:~/tmp$ python main.py
80107ms
за первые пару секунд отожрал больше 300MiB,
через ещё пару секунд похудел до 201.7 и так стабильно продолжал


zblzgamer@1225c:~/tmp$ ./main
3908ms
200.1MiB


zblzgamer@1225c:~/tmp$ node main.js
3947ms
203.3MiB


ЖС-колсоль (Хром), код был обёрнут в функцию, функция вызывалась
3259ms
235MiB (до вызова функции процесс вкладки занимал 31MiB)


zblzgamer@1225c:~/tmp$ ./main_ocaml
(т.к. дефолтные короткие массивы не растягиваются до 2560x2048,
 а в Bigarray я не вкурил, использовался массив 2560х1024,
 использовался 3й цикл, заполнянлся массив не (i*j), а (i*j+k))
564ms
10MiB (на полноразмерном массивые было бы в 20 раз больше)


zblzgamer@1225c:~/tmp$ php main.php
(на полноразмерном массиве протестить не получилось.
 он обжирался памятью до полутора гигабайт и падал с аутофмемори.
 посему массив был в ДВА РАЗА МЕНЬШЕ)
37948ms *2 (!!!)
стабильно толстел до 1.2GiB *2 (!!!)


zblzgamer@1225c:~/tmp$ ~/Downloads/jdk1.7.0_25/bin/java Main
3359ms
207MiB


zblzgamer@1225c:~/tmp$ rdmd main.d
5924ms
200.8MiB


zblzgamer@1225c:~/tmp$ perl main.pl
(те же обжорствопроблемы, что и у ПХП, также массив В ДВА РАЗА МЕНЬШЕ)
41466ms *2 (!!!)
стабильно толстел до 1.3GiB *2 (!!!)


zblzgamer@1225c:~/tmp$ erl #(c(main). main:start().)
(ненативно)
256997.70999999344ms
395mb
(нативно (map))
54202.8219999969ms
434MiB
(MiB - занято максимум. в обоих случаях сильно скачет, обычно падает до 270, иногда до 200)
```
