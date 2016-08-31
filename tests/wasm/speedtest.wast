(module
  (memory 3200 3200) ;;страницы по 64кб, нужно 25600*2048*4/64/1024 = 3200
  (export "memory" memory)
  (export "wasmTest" $wasmTest)
  (func $wasmTest
    (local $w i32 $h i32)
    (local $x i32 $y i32)

    (set_local $w (i32.const 25600))
    (set_local $h (i32.const 2048))

    (set_local $x (get_local $w))
    (loop $x-loop-stop $x-loop-continue
      (set_local $x (i32.sub (get_local $x) (i32.const 1))) ;;x = x-1

      (set_local $y (get_local $h))
      (loop $y-loop-stop $y-loop-continue
        (set_local $y (i32.sub (get_local $y) (i32.const 1))) ;;y = y-1

        ;; memory[x+w*y] = x*y
        (i32.store
          (i32.shl
            (i32.add
              (get_local $x)
              (i32.mul (get_local $y) (get_local $w))
            )
            (i32.const 2) ;;умножаем индекс на 4, потому что 4х-байтове инты
          )
          (i32.mul (get_local $x) (get_local $y))
        )

        (br_if $y-loop-stop (i32.eqz (get_local $y))) ;;if (y==0) break
        (br $y-loop-continue)
      )

      (br_if $x-loop-stop (i32.eqz (get_local $x))) ;;if (x==0) break
      (br $x-loop-continue)
    )
  )
)
