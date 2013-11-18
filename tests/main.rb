w = 25600
h = 2048
a = [] #Array.new(w*h, 0)

stt = Time.now
(0...w).each do |i|
  (0...h).each do |j|
    a[i+w*j] = i*j
  end
end
p (Time.now - stt)*1000
