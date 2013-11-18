public class Main {
	public static void main(String[] args) {
		int w = 25600;
		int h = 2048;
		int a[] = new int[w*h];
		long stt = System.currentTimeMillis();
		for (int i=0; i<w; i++)
			for (int j=0; j<h; j++)
				a[i+w*j] = i*j;
		System.out.println(System.currentTimeMillis()-stt);
	}
}
