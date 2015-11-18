<?php
$w = 256;
$h = 2048;
$a = new SplFixedArray($w*$h);
$stt = microtime(true);

for ($i=0; $i<$w; $i++)
	for ($j=0; $j<$h; $j++)
		$a[$i+$w*$j] = $i*$j;
print(((microtime(true)-$stt)*1000)."\n");
?>
