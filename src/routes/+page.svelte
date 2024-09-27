<script lang="ts">
  import { onMount } from 'svelte';
  import { fabric } from 'fabric';

  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import {
    BLOG_URL,
    GITHUB_URL,
    GM_SUI_URL,
    PLAY_MAT_HEIGHT,
    PLAY_MAT_WIDTH,
    SUIPRISE_URL,
    WALRUS_GAME_URL
  } from '$lib/shared/shared.constant';
  import PlayMat from '$lib/assets/play-mat.png';
  import PencilBox from '$lib/assets/pencil-box.png';
  import GmSui from '$lib/assets/gm-sui.png';
  import Walrus from '$lib/assets/walrus-250.png';
  import { calculateRelativePosition } from '$lib/shared/shared-tools';
  // import GmSui from '$lib/assets/gm-sui.svg';

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
      height: window.innerHeight,
      selection: false,
      interactive: false,
      enablePointerEvents: true
      // allowTouchScrolling: false
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
      addInteractiveAreas(imgWidth, imgHeight);
    });

    /**
     * Event listeners
     */
    // Enable panning
    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);

    function handleMouseDown(opt) {
      const evt = opt.e;
      startDragging(evt.clientX, evt.clientY);
    }

    function handleMouseMove(opt) {
      if (fabricCanvas.isDragging) {
        const evt = opt.e;
        moveCanvas(evt.clientX, evt.clientY);
      }
    }

    function handleMouseUp() {
      fabricCanvas.isDragging = false;
    }

    function startDragging(x, y) {
      fabricCanvas.isDragging = true;
      fabricCanvas.lastPosX = x;
      fabricCanvas.lastPosY = y;
    }

    function moveCanvas(x, y) {
      const vpt = fabricCanvas.viewportTransform;

      // Calculate the new position
      let newX = vpt[4] + x - fabricCanvas.lastPosX;
      let newY = vpt[5] + y - fabricCanvas.lastPosY;

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
      fabricCanvas.lastPosX = x;
      fabricCanvas.lastPosY = y;

      fabricCanvas.forEachObject((obj) => {
        obj.setCoords();
      });
    }

    // Resize canvas when window is resized
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  });

  /**
   * Interactive areas
   */
  function addInteractiveAreas(imgWidth, imgHeight) {
    /**
     * Blog
     */
    const blogPosition = calculateRelativePosition(560, 260, imgWidth, imgHeight);

    fabric.Image.fromURL(PencilBox, (img) => {
      // Set image properties
      img.set({
        left: blogPosition.left,
        top: blogPosition.top,
        scaleX: (1 * imgWidth) / PLAY_MAT_WIDTH,
        scaleY: (1 * imgHeight) / PLAY_MAT_HEIGHT,
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

      group.on('mouseup', function () {
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
    const gmSuiPosition = calculateRelativePosition(500, 140, imgWidth, imgHeight);

    fabric.Image.fromURL(GmSui, (img) => {
      // Set image properties
      img.set({
        left: gmSuiPosition.left,
        top: gmSuiPosition.top,
        scaleX: (1.35 * imgWidth) / 1920,
        scaleY: (1.35 * imgHeight) / 1080,
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

      group.on('mouseup', function () {
        window.open(GM_SUI_URL, '_blank');
      });

      // Add the image to the canvas
      fabricCanvas.add(group);
      group.bringToFront();
      fabricCanvas.renderAll();
    });

    /**
     * Walrus game
     */
    const walrusGamePosition = calculateRelativePosition(300, 260, imgWidth, imgHeight);

    fabric.Image.fromURL(Walrus, (img) => {
      // Set image properties
      img.set({
        left: walrusGamePosition.left,
        top: walrusGamePosition.top,
        scaleX: (0.5 * imgWidth) / PLAY_MAT_WIDTH,
        scaleY: (0.5 * imgHeight) / PLAY_MAT_HEIGHT,
        selectable: false,
        evented: true,
        hoverCursor: 'pointer'
      });

      const labelText = new fabric.Text('Walrus game (testnet)', {
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
        left: labelBackground.width / 5,
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

      group.on('mouseup', function () {
        window.open(WALRUS_GAME_URL, '_blank');
      });

      // Add the image to the canvas
      fabricCanvas.add(group);
      group.bringToFront();
      fabricCanvas.renderAll();
    });
  }
</script>

<div bind:this={containerDiv} class="canvas-container relative">
  <canvas bind:this={canvas}></canvas>
  <nav
    class="fixed right-5 top-5 z-50 flex items-center gap-6 rounded-full bg-white bg-opacity-90 px-6 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:shadow-xl"
  >
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <button class="nav-item flex items-center">
          Stuff
          <svg
            class="ml-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path></svg
          >
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <a href={BLOG_URL} target="_blank">
            <DropdownMenu.Item>Blog</DropdownMenu.Item>
          </a>
          <a href={GM_SUI_URL} target="_blank">
            <DropdownMenu.Item>GM Sui</DropdownMenu.Item>
          </a>
          <a href={WALRUS_GAME_URL} target="_blank">
            <DropdownMenu.Item>Walrus game (testnet)</DropdownMenu.Item>
          </a>
          <a href={SUIPRISE_URL} target="_blank">
            <DropdownMenu.Item>Suiprise</DropdownMenu.Item>
          </a>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>

    <!-- Github icon -->
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      class="text-gray-800 transition-all duration-300 ease-in-out hover:text-blue-600"
    >
      <svg
        class="h-6 w-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
        /></svg
      >
    </a>
  </nav>
</div>

<!-- <style>
  .canvas-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  canvas {
    width: 100%;
    height: 100%;
  }
</style> -->

<style>
  .canvas-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  canvas {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  :global(.nav-item) {
    @apply font-semibold text-gray-800 transition-all duration-300 ease-in-out hover:text-blue-600;
    font-family: 'Helvetica', sans-serif;
  }
</style>
