package main

import (
	"fmt"
	"time"
)

func main() {
	w := uint32(25600)
	h := uint32(2048)
	a := make([]uint32, w*h)

	start := time.Now()

	for i := uint32(0); i < w; i++ {
		for j := uint32(0); j < h; j++ {
			a[i+w*j] = i*j
		}
	}
	
	fmt.Println(time.Since(start).Nanoseconds()/1000000)
}
