use Time::HiRes qw/ time /;

$w = 2560*5;
$h = 2048;
@a = (0..$w*$h-1);

$stt = time;
for ($i=0; $i<$w; $i++) {
	for ($j=0; $j<$h; $j++) {
		$a[$i+$w*$j] = $i*$j;
	}
}
print ((time-$stt)*1000);
print "\n";
