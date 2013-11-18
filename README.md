langspeed
=========

Array benchmark for different languages.

Credit: [@3bl3gamer](https://github.com/3bl3gamer)


Running
-------

Run `make` to run tests.

`make check` checks that you have all the compilers and interpreters, `make test` runs tests without any checks.


My results
----------

```
Language    | Time      | Peak memory
------------|-----------|-------------
Java        |    756 ms |   228,848 Kb  (i.e. 0.76 s and 229 Mb)
C           |  1,057 ms |   205,292 Kb
D           |    718 ms |   207,860 Kb
Erlang      | 63,452 ms | 1,944,716 Kb
JavaScript  |    919 ms |   214,636 Kb
OCaml       |  2,707 ms |   507,680 Kb
PHP         |      -    |         -
Perl        | 10,316 ms | 1,858,504 Kb
Python      | 16,258 ms |   618,688 Kb
Python/PyPy |  3,152 ms | 2,113,628 Kb
Ruby        | 10,572 ms |   416,248 Kb
```

Refer [Makefile](Makefile) to see compiler flags.
