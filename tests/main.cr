w = 25600
h = 2048
a = Array.new(w*h, 0)
start = Time.now
w.times do |i|
	h.times do |j|
		a[i+w*j] = i*j
	end
end
puts (Time.now - start).total_milliseconds
