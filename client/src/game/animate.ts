export function animate(onFrame: (delta: number) => boolean){
  let frame: number | null = null;
  let result: boolean = true;
  const render = (lastTime?: number) => {
    frame = requestAnimationFrame((time) => {
      if (lastTime) {
        const delta = time - lastTime;
        result = onFrame(delta);
      }
      render(time)
    })
  }
  if (result) {
      render();
  }
  return () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }
}