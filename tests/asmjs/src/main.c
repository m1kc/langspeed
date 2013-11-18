#include <stdio.h>
#include <time.h>
#include <memory.h>

struct timespec st, et;
int w=25600, h=2048;

int main() {
	int *a = malloc(w*h*4);
	clock_gettime(CLOCK_MONOTONIC, &st);
	int i,j;
	for (i=0; i<w; i++)
		for (j=0; j<h; j++)
			a[i+w*j] = i*j;
	clock_gettime(CLOCK_MONOTONIC, &et);
	printf("%d\n",
	       (int)((et.tv_sec -st.tv_sec )*1000+
	             (et.tv_nsec-st.tv_nsec)/1000000));
	printf("--\n");
	printf("%ld\n", ((et.tv_sec -st.tv_sec )*1000L+(et.tv_nsec-st.tv_nsec)/1000000L));
	printf("%ld\n", (et.tv_nsec-st.tv_nsec));
	free(a);
	return 7;
}
