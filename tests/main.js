w=25600;
h=2048;
a = new Int32Array(w*h);

var i,j;
stt = new Date().getTime();
for (i=0; i<w; i++)
	for (j=0; j<h; j++)
		a[i+w*j]=i*j;
console.log(new Date().getTime() - stt);

for (i=0;i<1000000000;i++) {}
