function run_demo(ctx, cowboyImageData) {
	let rendererImageData, rendererLayer, workingLayer;

	// Main instance:
	const rastr = new RastrTools;

	// Add error listener:
	rastr.onError = err => console.error("Got error:", err);

	// load respective module,
	// m32Mb means that maximum layer size for
	//       - multi-layers mode is limitted to 644 pixels per side (for each layer)
	//       - single-layer mode is limitted to 1562 pixels per side
	//
	// m64Mb means that maximum layer size for
	//       - multi-layers mode is limitted to 1024 pixels per side (for each layer)
	//       - single-layer mode is limitted to 2484 pixels per side
	//
	// The bigger number in name of the module, the bigger amount of memory it will consume,
	// m32Mb - will literally occupy 32Mb and m64Mb will literally occupy 64Mb,
	// The library will occupy all required memory of all possible layers count and sizes on upstart.
	rastr.reload("./m64Mb_x32.wasm", err => {
		if (err) {
			console.error(err);
			return;
		}

		// Reset the internal state;
		// send true here in case single-layer mode is needed
		// For multi-layer mode, the rastr.layer.getMaxCount method will always return 12,
		// For single-layer mode, the method will always return 1
		rastr.reset(false);

		// Resize all layers;
		// Since, this is an init routines, no need to redraw anything after resizing,
		// But keep in mind, that after any drawing/image modification, it is required to redraw things.
		rastr.layers.resizeAll(null, 0, 0, cowboyImageData.width, cowboyImageData.height);

		// -----------------------------------------------------------------------------------------------
		console.log("Maximum layer count: " + rastr.layers.getMaxCount());
		console.log("Maximum layer size (per side): " + rastr.layers.getMaxSideSize() + "(pixels)");
		console.log("Minimum layer size (per side): " + rastr.layers.getMinSideSize() + "(pixels)");
		console.log("Current layer width: " + rastr.layers.getWidth() + "(pixels)");
		console.log("Current layer height: " + rastr.layers.getHeight() + "(pixels)");
		// -----------------------------------------------------------------------------------------------

		// Set global compose operation (color mixing)
		// 1 - means Source Over
		rastr.layers.globalCompositeOperationSet(1);

		// Since all possible layers are already available,
		// Just pick any layer's index wich will be responsible for a particular task.
		// So the 0 layer will be rendering layer (e.g. renderer/view/result),
		// All other layer should be composed to this one
		//     (Not actual for singe-layer mode, because this one will be the only option)
		rendererLayer = rastr.layers.getAddr(0);

		// ImageData of the given layer:
		rendererImageData = rastr.layers.getImageData(rendererLayer);

		// Pick any other index for "working" layers
		// In signle-layer mode however, all operations will be for one available layer.
		workingLayer = rastr.layers.getAddr(1);

		// -----------------------------------------------------------------------------------------------
		console.log("Working layer addr: " + workingLayer);
		console.log("Renderer layer addr: " + rendererLayer);
		console.log("ImageData width: " + rendererImageData.width + "(pixels)");
		console.log("ImageData height: " + rendererImageData.height + "(pixels)");
		// -----------------------------------------------------------------------------------------------



		// -----------------------------------------------------------------------------------------------
		// Demo logic:
		// -----------------------------------------------------------------------------------------------

		// Save initial state
		rastr.history.saveLayer(workingLayer);
		// Put cowboyImageData with no offset,
		// so cowboyImageData will be copied to destinatiop layer:
		rastr.layers.putImageData(workingLayer, cowboyImageData, 0, 0);



		// Flip the image a little bit:
		rastr.history.saveLayer(workingLayer);
		rastr.layers.flip(workingLayer);

		rastr.history.saveLayer(workingLayer);
		rastr.layers.mirror(workingLayer);

		rastr.history.saveLayer(workingLayer);
		rastr.layers.flip(workingLayer);

		rastr.history.saveLayer(workingLayer);
		rastr.layers.mirror(workingLayer);



		// "Shake" it from side to side:
		rastr.history.saveLayer(workingLayer);
		rastr.layers.moveClip(workingLayer, 1, 0, 0, 0, 16, 16, true); // Move area inside 0:0-16:16 rect to the right

		rastr.history.saveLayer(workingLayer);
		rastr.layers.moveClip(workingLayer, -1, 0, 0, 0, 16, 16, true); // Move area inside 0:0-16:16 rect back to the left



		// NOTE: multiple changes will be saved as one operation:
		rastr.history.saveLayer(workingLayer);
		// Rebuild clip-shape from default (rectangle, covers full layer)
		// to the custom clip-shape (triangle):
		rastr.vertices.prepareBuild();
		rastr.vertices.add(0, 0);
		rastr.vertices.add(15, 0);
		rastr.vertices.add(15, 15);
		rastr.vertices.finishBuild();
		rastr.layers.moveClip(workingLayer, 1, 0, 0, 0, 16, 16, true); // Move area inside currently active clip-chape to the right



		rastr.history.saveLayer(workingLayer);
		rastr.layers.channelSet(workingLayer, 0, 0); // Sets red channel of currently selected shape to 0



		// multiple changes will be saved as one operation:
		rastr.history.saveLayer(workingLayer);
		// Rebuild clip-shape from prev custom (triangle)
		// to another custom (triangle):
		rastr.vertices.prepareBuild();
		rastr.vertices.add(0, 0);
		rastr.vertices.add(0, 15);
		rastr.vertices.add(15, 15);
		rastr.vertices.finishBuild();
		rastr.layers.channelSet(workingLayer, 0, 0); // Sets red channel of currently selected shape to 0



		// multiple changes will be saved as one operation:
		rastr.history.saveLayer(workingLayer);
		rastr.vertices.buildDefault(); // Rebuild vertices to default state (cover whole layer)
		rastr.layers.filter(workingLayer, 6, 1.0); // Apply 100% Grayscale filter 



		rastr.history.saveLayer(workingLayer);
		rastr.layers.floodFill(workingLayer, RastrTools.rgba(0xFF, 0, 0, 0xFF), 0, 0); // Flood fill by red at 0:0 position



		rastr.history.saveLayer(workingLayer);
		rastr.layers.floodFill(workingLayer, RastrTools.rgba(0, 0xFF, 0, 0xFF), 15, 15); // Flood fill by green at 15:15 position



		rastr.history.saveLayer(workingLayer);
		rastr.layers.colorReplace(workingLayer, RastrTools.rgba(0, 0, 0, 0), RastrTools.rgba(0, 0, 0xFF, 0xFF), 0); // Replace all zero colors by blue



		// Save size before resizing layers:
		rastr.history.saveSize([workingLayer], cowboyImageData.width, cowboyImageData.height);
		rastr.layers.resizeAll([workingLayer], -4, -4, 8, 8); // Resize next layers:
		rendererImageData = rastr.layers.getImageData(rendererLayer); // Need to get new ImageData after each resize:



		// Save page title (custom history item to save)
		rastr.history.saveCustom("CUSTOM_NAME", document.querySelector("h2").textContent);
		document.querySelector("h2").textContent += ". Fin.";


		rastr.history.undo();
		rastr.history.undo();
		rastr.history.undo();
		rastr.history.undo();
		rastr.history.undo();


		render(15, 15);
	});




	// -----------------------------------------------------------------------------------------------
	// Rendering logic:
	// -----------------------------------------------------------------------------------------------


	const composeLayers = () => {
		// Clear renderer layer by zero color:
		rastr.layers.colorClear(rendererLayer, RastrTools.rgba(0, 0, 0, 0));

		// Copy all working layer to the renderer layer.
		// In current example we have only one, so only one call for copyLayer is applied.
		// All color blending will rely on globalCompositeOperation whivh was set by globalCompositeOperationSet
		rastr.layers.copyLayer(rendererLayer, workingLayer);

		// For example, if we would have more layers:
		// rastr.layers.copyLayer(rendererLayer, workingLayer2);
		// rastr.layers.copyLayer(rendererLayer, workingLayer3);
		// ...
	};
	const draw = (scaleX, scaleY) => {
		// Simple draw on a canvas operation:
		drawWithScale(ctx, rendererImageData, 0, 0, scaleX, scaleY);
	};
	const render = (scaleX, scaleY) => {
		// Main rendering entry point
		composeLayers();
		draw(scaleX, scaleY);
	};




	// -----------------------------------------------------------------------------------------------
	// History listenres:
	// -----------------------------------------------------------------------------------------------


	// Undo/redo which caused the resize
	rastr.history.onSizeSwap = () => {
		// It is mandatory to update imageData reference on any size changes:
		rendererImageData = rastr.layers.getImageData(rendererLayer);
		render(1, 1);

		updateHistoryCursor();
	};

	// Undo/redo which caused the changes inside of the layers
	rastr.history.onLayerSwap = (addr) => {
		// Just run the rendering method:
		render(1, 1);

		updateHistoryCursor();
	};

	// Undo/redo which caused the custom changes
	rastr.history.onCustomSwap = (type, data) => {
		var prev;
		switch (type) {
		case "CUSTOM_NAME":
			prev = document.querySelector("h2").textContent;
			document.querySelector("h2").textContent = data;
			break;
		default: break;
		}

		updateHistoryCursor();

		// Whatever data has been changed and whatever changes where applied,
		// it is necessary to always return previos value:
		return prev;
	};




	// -----------------------------------------------------------------------------------------------
	// History actions:
	// -----------------------------------------------------------------------------------------------


	// Listen buttons and call respective action:
	document.querySelector("#undo").addEventListener("click", event => {
		rastr.history.undo();
	}, false);
	document.querySelector("#redo").addEventListener("click", event => {
		rastr.history.redo();
	}, false);



	// Update text item to show current history iteration:
	const updateHistoryCursor = () => {
		document.querySelector("#cursor").textContent = rastr.history.getCursor() + " of " + rastr.history.getItemsCount();
	}

}
