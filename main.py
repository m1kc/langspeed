from array import *
from time import time

w = 25600
h = 2048
a = array('i', [0]*(w*h))

stt = time()
for i in xrange(w):
	for j in xrange(h):
		a[i+w*j] = i*j
print (time()-stt)*1000
