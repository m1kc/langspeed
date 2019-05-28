package main

import (
	"fmt"
	"time"
)

const (
	w = 25600
	h = 2048
)

func main() {
	a := make([]int, w*h)
	start := time.Now()
	for i := 0; i < w; i++ {
		for j := 0; j < h; j++ {
			a[i+w*j] = i*j
		}
	}
	fmt.Println(time.Since(start).Nanoseconds() / 1000000)
	return
}
