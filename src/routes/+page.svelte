<script lang="ts">
  import { onMount } from 'svelte';
  import { fabric } from 'fabric';

  import { BLOG_URL, GM_SUI_URL } from '$lib/shared/shared.constant';
  import PlayMat from '$lib/assets/play-mat.png';
  import PencilBox from '$lib/assets/pencil-box.png';
  import GmSui from '$lib/assets/gm-sui.png';
  // import GmSui from '$lib/assets/gm-sui.svg';

  let canvas;
  let fabricCanvas;
  let containerDiv;

  onMount(() => {
    let imgWidth, imgHeight;

    // const updateCanvasSize = () => {
    //   fabricCanvas.setWidth(containerDiv.clientWidth);
    //   fabricCanvas.setHeight(containerDiv.clientHeight);
    //   fabricCanvas.renderAll();
    // };

    fabricCanvas = new fabric.Canvas(canvas, {
      width: window.innerWidth,
      height: window.innerHeight,
      selection: false, // Disable group selection
      interactive: true // Ensure interactivity is enabled
    });

    // Load your background image
    fabric.Image.fromURL(PlayMat, (img) => {
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
      addInteractiveAreas();
    });

    /**
     * Event listeners
     */
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

    // // Resize canvas when window is resized
    // window.addEventListener('resize', updateCanvasSize);

    // return () => {
    //   window.removeEventListener('resize', updateCanvasSize);
    // };
  });

  /**
   * Interactive areas
   */
  function addInteractiveAreas() {
    /**
     * Blog
     */
    fabric.Image.fromURL(PencilBox, (img) => {
      // Set image properties
      img.set({
        left: 875,
        top: 400,
        scaleX: 1.6, // Adjust scale as needed
        scaleY: 1.6, // Adjust scale as needed
        selectable: false,
        evented: true,
        hoverCursor: 'pointer'
      });

      const labelText = new fabric.Text('Blog', {
        fontSize: 16,
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: '600',
        fill: '#2c3e50',
        originX: 'center',
        originY: 'center'
      });

      const labelBackground = new fabric.Rect({
        width: labelText.width + 32,
        height: labelText.height + 16,
        fill: 'white',
        rx: 8,
        ry: 8,
        stroke: 'black',
        strokeWidth: 2.5,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.1)',
          blur: 8,
          offsetX: 0,
          offsetY: 4
        })
      });

      const label = new fabric.Group([labelBackground, labelText], {
        left: img.left + (img.width * img.scaleX) / 2.1,
        top: img.top - 35,
        originX: 'center',
        originY: 'center'
      });

      // Center text in background
      labelText.set({
        left: labelBackground.width / 7.5,
        top: labelBackground.height / 6
      });

      const group = new fabric.Group([img, label], {
        selectable: false,
        evented: true,
        hoverCursor: 'pointer'
      });

      // Add hover effect
      group.on('mouseover', () => {
        group.animate('top', group.top - 10, {
          duration: 200,
          onChange: fabricCanvas.renderAll.bind(fabricCanvas),
          easing: fabric.util.ease.easeOutCubic
        });
      });

      group.on('mouseout', () => {
        group.animate('top', group.top + 10, {
          duration: 200,
          onChange: fabricCanvas.renderAll.bind(fabricCanvas),
          easing: fabric.util.ease.easeOutCubic
        });
      });

      group.on('mousedown', function () {
        window.open(BLOG_URL, '_blank');
      });

      // Add the image to the canvas
      fabricCanvas.add(group);
      group.bringToFront();
      fabricCanvas.renderAll();
    });

    /**
     * GM Sui
     */
    fabric.Image.fromURL(GmSui, (img) => {
      // Set image properties
      img.set({
        left: 800,
        top: 225,
        scaleX: 1.2, // Adjust scale as needed
        scaleY: 1.2, // Adjust scale as needed
        selectable: false,
        evented: true,
        hoverCursor: 'pointer'
      });

      const labelText = new fabric.Text('GM Sui', {
        fontSize: 16,
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: '600',
        fill: '#2c3e50',
        originX: 'center',
        originY: 'center'
      });

      const labelBackground = new fabric.Rect({
        width: labelText.width + 32,
        height: labelText.height + 16,
        fill: 'white',
        rx: 8,
        ry: 8,
        stroke: 'black',
        strokeWidth: 2.5,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.1)',
          blur: 8,
          offsetX: 0,
          offsetY: 4
        })
      });

      const label = new fabric.Group([labelBackground, labelText], {
        left: img.left + (img.width * img.scaleX) / 2.5,
        top: img.top - 35,
        originX: 'center',
        originY: 'center'
      });

      // Center text in background
      labelText.set({
        left: labelBackground.width / 6.5,
        top: labelBackground.height / 6
      });

      const group = new fabric.Group([img, label], {
        selectable: false,
        evented: true,
        hoverCursor: 'pointer'
      });

      // Add hover effect
      group.on('mouseover', () => {
        group.animate('top', group.top - 10, {
          duration: 200,
          onChange: fabricCanvas.renderAll.bind(fabricCanvas),
          easing: fabric.util.ease.easeOutCubic
        });
      });

      group.on('mouseout', () => {
        group.animate('top', group.top + 10, {
          duration: 200,
          onChange: fabricCanvas.renderAll.bind(fabricCanvas),
          easing: fabric.util.ease.easeOutCubic
        });
      });

      group.on('mousedown', function () {
        window.open(GM_SUI_URL, '_blank');
      });

      // Add the image to the canvas
      fabricCanvas.add(group);
      group.bringToFront();
      fabricCanvas.renderAll();
    });
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
