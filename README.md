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

Language    | Time       | Peak memory
------------|-----------:|-------------:
Java        |    756  ms |   228 848  Kb
C           |  1 057  ms |   205 292  Kb
D           |    718  ms |   207 860  Kb
Erlang      | 63 452  ms | 1 944 716  Kb
JavaScript  |    919  ms |   214 636  Kb
OCaml       |  2 707  ms |   507 680  Kb
PHP         |      -     |         -
Perl        | 10 316  ms | 1 858 504  Kb
Python      | 16 258  ms |   618 688  Kb
Python/PyPy |  3 152  ms | 2 113 628  Kb
Ruby        | 10 572  ms |   416 248  Kb

Refer [Makefile](Makefile) to see compiler flags.


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
