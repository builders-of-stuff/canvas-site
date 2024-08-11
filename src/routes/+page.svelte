<script lang="ts">
  import { onMount } from 'svelte';
  import { fabric } from 'fabric';
  import playmat from '$lib/assets/play-mat.png';

  let canvas;
  let fabricCanvas;
  let containerDiv;

  onMount(() => {
    let imgWidth, imgHeight;

    const updateCanvasSize = () => {
      fabricCanvas.setWidth(containerDiv.clientWidth);
      fabricCanvas.setHeight(containerDiv.clientHeight);
      fabricCanvas.renderAll();
    };

    fabricCanvas = new fabric.Canvas(canvas, {
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Load your background image
    fabric.Image.fromURL(playmat, (img) => {
      img.set({
        originX: 'left',
        originY: 'top'
      });

      // Scale image to be larger than the canvas
      const scaleFactor = Math.max(
        (fabricCanvas.width / img.width) * 1,
        (fabricCanvas.height / img.height) * 1
      );

      imgWidth = img.width * scaleFactor;
      imgHeight = img.height * scaleFactor;

      img.scale(scaleFactor);

      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));

      // Center the image
      fabricCanvas.viewportTransform[4] =
        (fabricCanvas.width - img.width * scaleFactor) / 2;
      fabricCanvas.viewportTransform[5] =
        (fabricCanvas.height - img.height * scaleFactor) / 2;

      fabricCanvas.renderAll();
    });

    // Enable panning
    fabricCanvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      fabricCanvas.isDragging = true;
      fabricCanvas.lastPosX = evt.clientX;
      fabricCanvas.lastPosY = evt.clientY;
    });

    fabricCanvas.on('mouse:move', (opt) => {
      if (fabricCanvas.isDragging) {
        const evt = opt.e;
        const vpt = fabricCanvas.viewportTransform;

        // Calculate the new position
        let newX = vpt[4] + evt.clientX - fabricCanvas.lastPosX;
        let newY = vpt[5] + evt.clientY - fabricCanvas.lastPosY;

        // Limit the dragging within the image boundaries
        const maxX = 0;
        const minX = fabricCanvas.width - imgWidth;
        const maxY = 0;
        const minY = fabricCanvas.height - imgHeight;

        newX = Math.min(Math.max(newX, minX), maxX);
        newY = Math.min(Math.max(newY, minY), maxY);

        // Update the viewport transform
        vpt[4] = newX;
        vpt[5] = newY;

        fabricCanvas.requestRenderAll();
        fabricCanvas.lastPosX = evt.clientX;
        fabricCanvas.lastPosY = evt.clientY;
      }
    });

    fabricCanvas.on('mouse:up', () => {
      fabricCanvas.isDragging = false;
    });

    // Resize canvas when window is resized
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  });

  function addInteractiveAreas() {
    // Add your interactive areas here
  }
</script>

<div bind:this={containerDiv} class="canvas-container">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .canvas-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  canvas {
    width: 100%;
    height: 100%;
  }
</style>
