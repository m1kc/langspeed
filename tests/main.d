import std.stdio;
import std.datetime;

int w=25600, h=2048;

void main() {
	int a[] = new int[w*h];
	long start = Clock.currStdTime();
	for (int i=0; i<w; i++)
		for (int j=0; j<h; j++)
			a[i+w*j] = i*j;
	writeln((Clock.currStdTime()-start)/10000); // hnsecs (hecto-nanoseconds (100 ns)) to millisecs
}
