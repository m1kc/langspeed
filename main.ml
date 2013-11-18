let w = 2560;;
let h = 1024;;
let a = Array.make (w*h) 0;;
let stt = Sys.time();;
for k = 0 to 19 do
	for i = 0 to w-1 do
		for j = 0 to h-1 do
			a.(i) <- (i*j+k)
		done
	done
done;;
print_float ((Sys.time() -. stt)*.1000.0);;
print_newline ();;
