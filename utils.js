function initCanvas(canvas) {
	const ctx = canvas.getContext("2d", {
		"desynchronized": true // https://developers.google.com/web/updates/2019/05/desynchronized
	});
	canvas.width = 256;
	canvas.height = 256;
	ctx.imageSmoothingEnabled = false;
	ctx.globalCompositeOperation = "copy";
	return ctx;
}

function getImageData(img) {
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	canvas.width = img.width;
	canvas.height = img.height;
	context.drawImage(img, 0, 0);
	return context.getImageData(0, 0, img.width, img.height);
}

function drawWithScale(ctx, src, x, y, scaleX, scaleY) {
	const tmp = document.createElement("canvas");
	tmp.width = ctx.canvas.width;
	tmp.height = ctx.canvas.height;

	const tmpCtx = tmp.getContext("2d");

	tmpCtx.imageSmoothingEnabled = false;
	tmpCtx.globalCompositeOperation = "copy";
	tmpCtx.putImageData(src, x, y);

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.scale(scaleX, scaleY);
	ctx.drawImage(tmp, 0, 0);
}
