import std.stdio;
import core.stdc.time;

extern(C) {
	struct timespec {
		uint tv_sec;
		int tv_nsec;
	}
	int clock_gettime(int clk_id, timespec *tp);
}
timespec st, et;
int w=25600, h=2048;

void main() {
	int a[] = new int[w*h];
	clock_gettime(1, &st); //CLOCK_MONOTONIC
	for (int i=0; i<w; i++)
		for (int j=0; j<h; j++)
			a[i+w*j] = i*j;
	clock_gettime(1, &et); //CLOCK_MONOTONIC
	writeln((et.tv_sec -st.tv_sec )*1000+
	        (et.tv_nsec-st.tv_nsec)/1000000);
}
