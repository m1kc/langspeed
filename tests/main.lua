local w = 2560
local h = 2048
local a = {}  -- w*h

local i
local j
for i=0,w-1 do
	for j=0,h-1 do
		--a[i+w*j] = i*j
		rawset(a, i+w*j, i*j)
	end
end
print(os.clock()*1000)
