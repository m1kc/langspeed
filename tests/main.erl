-module(main).
-export([start/0]).

start() ->
	W = 25600,
	H = 2048,
	Stt = now_mills(),
	array:get(W*H-1, w_loop(array:new(W*H), 0, 0, W, H)), % способ 1
	%array:map(fun (I,_) -> (I div H) + W*(I rem H) end, array:new(W*H)), % способ 2
	io:format('~w~n', [now_mills() - Stt]),
	erlang:exit(0).

w_loop(Arr, W, _, W, _) -> Arr;
w_loop(Arr, I, J, W, H) ->
	w_loop(h_loop(Arr, I, J, W, H), I+1, J, W, H).

h_loop(Arr, _, H, _, H) -> Arr;
h_loop(Arr, I, J, W, H) ->
	h_loop(array:set(I+W*J, I*J, Arr), I, J+1, W, H).

now_mills() ->
	{_, Secs, Microsecs} = now(), % {Megasecs, Secs, Microsecs}
	Secs*1000 + Microsecs/1000.
