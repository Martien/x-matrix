// Read in the matrix.json and render it.
d3.json("x-matrix.json", function(error, data) {
	if (error) return console.warn(error);
	//console.log(data[0]); //return;
	drawMatrix(data[0]);
});

// drawMatrix() sets up the data and canvas, then draws each layer.
function drawMatrix(m) {
  var canvas = setupCanvas();
	setupGradients(canvas);
  setupZigZag(m);
	setupStripsAndPatches(m);
	drawPanels(canvas, m);
	drawGrids(canvas, m);
	drawNumbers(canvas, m);
	drawClickers(canvas, m);
	drawText(canvas, m);
  drawOrigin(canvas, m);
}

// setupCanvas() sets up the svg viewbox and scale.
function setupCanvas() {
  return d3.select("body")
    .append("svg")
	    .attr("viewBox", "-500 -50 1000 2000")
	    .attr("preserveAspectRatio", "xMaxYMax meet")
    .append("g")
	    .attr("id", "x-matrix")
	    .attr("transform", "scale(5)")
  ;
}

// setupGradients() defines the translucent gradients used as panel background.
function setupGradients(canvas) {
	var defs = canvas.append("defs");

	createGradient(defs, "fader-north-east", "green");
	createGradient(defs, "fader-north-west", "orange");
	createGradient(defs, "fader-south-west", "blue");
	createGradient(defs, "fader-south-east", "red");

	var gridlineGradient = defs.append("linearGradient")
		.attr("id", "fader-gridline")
		.attr("x1", "0%")
		.attr("x2", "100%")
		.attr("y1", "0%")
		.attr("y2", "0%")
	;
	gridlineGradient.append("stop")
		.attr("offset", "40%")
		.attr("style","stop-color:steelblue;stop-opacity:1")
		;
	gridlineGradient.append("stop")
		.attr("offset", "100%")
		.attr("style","stop-color:white;stop-opacity:0")
		;
}

// createGradient() defines a specific gradient in svg.
function createGradient(defs, id, color) {
	var gradient = defs.append("linearGradient")
		.attr("id", id)
		.attr("x1", "0%")
		.attr("x2", "100%")
		.attr("y1", "0%")
		.attr("y2", "0%")
		;
	gradient.append("stop")
		.attr("offset", "30%")
		.attr("style","stop-color:" + color + ";stop-opacity:1")
		;
	gradient.append("stop")
		.attr("offset", "100%")
		.attr("style","stop-color:white;stop-opacity:0")
		;
}

// drawPanels() draws the panels (arms & legs), one for zig, one for zag.
function drawPanels(canvas, matrix) {
	var g = canvas.append("g").attr("id", "panels").selectAll("_");
	drawPanel(g, matrix.zig.panels);
	drawPanel(g, matrix.zag.panels);
}

// drawPanel() draws the panels (arms & legs) for a single side.
function drawPanel(canvas, panels) {
	canvas.data(panels)
		.enter()
			.append("g")
				.attr("transform",   (d) => {return d.transform;})
				.append("path")
					.attr("class",     (d) => {return d.direction;})
					.attr("fill",      (d) => {return "url(#fade-" + d.direction + ")";})
					.attr("transform", (d) => {return d.originPanel})
					.attr("d",         (d) => {return d.panelPath;})
	;
}

// drawGrids() draws the gridlines, one for zig, one for zag.
function drawGrids(canvas, matrix) {
	g = canvas.append("g").attr("id", "grids").selectAll("_");
	drawGrid(g, matrix.zig.panels);
	drawGrid(g, matrix.zag.panels);
}

// drawGrid() draws the gridlines for a single side.
function drawGrid(canvas, panels) {
	canvas.data(panels).enter().append("g")
		.attr("transform",   (d) => {return d.transform;})
		.append("path")
			.attr("class", "hairline")
			.attr("stroke", "url(#fader-gridline)")
			.attr("transform", (d) => {return d.originPanel})
			.attr("d",         (d) => {return d.gridLines;})
	;
}

// drawNumbers() draws a set of index numbers for each panel in zig & zag.
function drawNumbers(canvas, matrix) {
	g = canvas.append("g").attr("id", "numbers").selectAll("_");
	drawNumbersForOneSide(g, matrix.zig.panels);
	drawNumbersForOneSide(g, matrix.zag.panels);
}

// drawNumbersForOneSide() draws index numbers for each entry in a panel.
function drawNumbersForOneSide(canvas, panels) {
	var entries = canvas.data(panels)
		.enter().append("g")
			.attr("transform",   (d) => {return d.originText;})
			.attr("text-anchor", (d) => {return d.anchor;})
	;
	entries.append("g")
			.attr("transform", (d) => {return d.originEntries;})
			.selectAll("_")
			.data((d) => {return d.entries;})
		.enter()
			.append('text')
				.attr("class", "index")
				.attr("x", (d, i) => {return 2 * i * d.slope;})
				.attr("y", (d, i) => {return 2 * i;})
				.attr("dx",   (d) => {return d.dxIndex;})
				.attr("dy", "-.9")
				.text((d, i) => {return i + 1;})
	;
}

// drawText() renders section title and entries for each panel in zig & zag.
function drawText(canvas, matrix) {
	g = canvas.append("g").attr("id", "texts").selectAll("_");
	drawTextForOneSide(g, matrix.zig.panels);
	drawTextForOneSide(g, matrix.zag.panels);
}

// drawText() renders section titles and entries for a single side.
function drawTextForOneSide(canvas, panels) {
	var entries = canvas.data(panels)
		.enter().append("g")
			.attr("text-anchor", (d) => {return d.anchor;})
			.attr("transform",   (d) => {return d.originText;})
	;
	// section titles
	entries.append("text")
		.attr("class", "section")
		.attr("dy", "-.3")
		.text((d) => {return d.section;})
	;
	// entries
	entries.append("g")
			.attr("transform", (d) => {return d.originEntries;})
			.selectAll("_")
			.data((d) => {return d.entries;})
		.enter()
			.append('text')
				.attr("class", "entry")
				.attr("x", function(d, i){return 2 * i * d.slope;})
				.attr("y", function(d, i){return 2 * i;})
				.attr("dy", "-.5")
				.text((d) => {return d.entry;})
	;
}

// drawClickers() renders all clickers of alleys of patches of strips.
function drawClickers(canvas, matrix) {
	var binding = [ "none", "weak", "strong"];
	canvas.append("g")
			.attr("id", "clickers")
			.attr("transform", "translate(0,2)")
			.selectAll("_")
			.data(matrix.zig.strip)
		.enter() // foreach strip
			.selectAll("_")
			.data((d) => {return d;})
		.enter().append("g") // foreach patch
			.attr("transform",
				(d) => {return translate(2 * d.originNorth.x, 2 * d.originNorth.y);})
			.selectAll("_")
			.data((d) => {return d.patch;})
		.enter().append("g") // foreach alley
			.attr("transform", (d,i) => { return translate(2 * i, 2 * i);})
			.selectAll("_")
			.data((d,i) => {return d;})
		.enter().append("circle") // foreach clicker
			.attr("class", "dot")
			.attr("r", "1")
			.attr("cx", (d,i) => {return -2 * i;})
			.attr("cy", (d,i) => {return +2 * i;})
			.on("click", function(d) {
				d3.select(this)
					.attr("class", "dot " + binding[(++d.clicks % binding.length)]);
			})
	;
}

// drawOrigin() renders a useless clickable dot at the origin.
function drawOrigin(canvas, matrix) {
	var fills = ["red", "lightblue", "steelblue", "none"];
  canvas.append("g").attr("id", "home")
    .append("circle")
    .attr("class", "home")
    .attr("r", .5)
		.on("click", function(d){
			d3.select(this).style("fill", fills[(++matrix.clicks % 4)]);
		})
    ;
}

// setupZigzag() augments the data structure for elegant rendering by d3.
function setupZigZag(matrix) {
	let zip = 0;

	// Home button of matrix at (0,0) can be clicked. Pointless at the same time.
	matrix.clicks = 0;

	// The length of one leg is the other’s number of units.
	matrix.zag.leg = legLength(matrix.zig.panels, matrix.gap, matrix.padding);
	matrix.zig.leg = legLength(matrix.zag.panels, matrix.gap, matrix.padding);

	zip = setupSide(matrix, matrix.zig, zip, +1); // zig starts at (0,0)
	zip = setupSide(matrix, matrix.zag, zip, -1); // zag starts where zig ended
}

// legLenght() returns the number of units for all panels, plus gaps and padding.
function legLength(panels, gap, padding) {
	var units = (panels.length - 1) * gap;
	for (j = 0; j < panels.length; j++) {
		units += panels[j].entries.length;
	}
	return 2 * (units + padding);
}

// setupSide() sets up one side and returns the start for the next one.
// The start point is a single number, because x == y.
function setupSide(m, z, s, slope) {
	var panels = z.panels;
	var xx = yy = s; // origin is at (s, s)
	var xx0 = 0;
	var yy0 = 0;
	//console.log(l);

	for (j = 0; j < panels.length; j++) {
		panel = panels[j];

		northEast = (slope == +1) && (panel.anchor == "start");
		northWest = (slope == -1) && (panel.anchor == "end");
		southEast = (slope == -1) && (panel.anchor == "start");
		southWest = (slope == +1) && (panel.anchor == "end");

		upperHalf = northEast || northWest;
		lowerHalf = southEast || southWest;

		leftHalf  = northWest || southWest;
		rightHalf = northEast || southEast;

		// At each entry store the slope, so consecutive entries staircase
		// in the right direction.
		for (e = 0; e < panel.entries.length; e++) {
			panel.entries[e].slope = slope;
			panel.entries[e].dxIndex = 1.5 * (upperHalf ? -slope : slope);
		}

		// At each panel, store local transformation strings.
		// Used by both both panels and gridLines.
		// Since panels and grids all draw from (0,0), they need to
		// nudge themselves #rows left&down when flipped vertically and
		// #rows right&down when flipped both vertically & horizontally.
		nudgeX = upperHalf ? 0 : 2 * slope * panel.entries.length;
		nudgeY = slope * nudgeX;
		// Flip left-right when we are in the left side.
		scaleX = rightHalf ? +1 : -1;
		// Flip up-down when we are in the lower half.
		scaleY = upperHalf ? +1 : -1;

		// Add local transformation string for panel or gridLines.
		panel.originPanel = translate(nudgeX, nudgeY) + scale(scaleX, scaleY);

		// At panel, create and store string for panel path.
		panel.panelPath = panelPath(panel.entries.length, z.leg, m.arm);

		// At panel, create and store a path string for grid lines
		panel.gridLines = gridLines(panel.entries.length, z.leg, m.arm);

		//-------------------------------------------------------------------
		// At each panel, store its origin (x0, y0).
		// Panels, grid lines and text entries all render relative to this origin,
		// and locally nudge into place if needed .

		// Add a gap before every panel but the first one.
		if (j > 0) {
			xx += m.gap * slope;
			yy += m.gap;
		}

		// Calculate actual coordinates, moving padding away from the center.
		xx0 = 2 * xx + m.padding;
		yy0 = 2 * yy - slope * m.padding;

		// Shift the whole along the panel’s leg when on the other (left) side.
		if (leftHalf) {
			xx0 -= z.leg;
			yy0 += slope * z.leg;
		}

		// Now we’re at the origin. Calculate transform strings here.
		panel.transform = translate(xx0, yy0);

		// In the lowerHalf, align the start of the text with the previous
		// start position, so shift it right by one unit.
		panel.originText = translate(xx0 + (lowerHalf ? -2 * slope : 0), yy0);
		panel.originEntries = translate(2 * slope, 2);

		xx += panel.entries.length * slope;
		yy += panel.entries.length;
	}
	return yy;
}

// setupStripsAndPatches() creates strips of patches of alleys of clickers.
function setupStripsAndPatches(m) {
	let xx = yy = 0;
	m.zig.strip = new Array(m.zig.panels.length);
	for (let i = 0; i < m.zig.strip.length; i++) {
		let width = m.zig.panels[i].entries.length;
		m.zig.strip[i] = new Array(m.zag.panels.length);
		if (i > 0) {
			xx += m.gap;
			yy += m.gap;
		}
		let xx0 = xx;
		let yy0 = yy;
		for (let j = 0; j < m.zig.strip[i].length; j++) {
			let height = m.zag.panels[j].entries.length;
			if (j > 0) {
				xx0 -= m.gap;
				yy0 += m.gap;
			}
			m.zig.strip[i][j] = {
				originNorth: {x: xx0, y: yy0},
				originSouth: {x: xx0 + width, y: yy0 + width},
				patch: Patch(width, height)
			};
			xx0 -= height;
			yy0 += height;
		}
		xx += width;
		yy += width;
	}
}

// Patch() returns a two-dimensional array with clickers.
function Patch(r, c) {
	var p = new Array(r);
	for (let i = 0; i < r; i++) {
		p[i] = new Array(c);
			for (let j = 0; j < c; j++) {
				p[i][j] = {clicks: 0};
		}
	}
	return p;
}

// panelPath() returns the <path> string that composes panel p.
// Uses relative lines, so transform() it into proper place and orientation.
function panelPath(rows, leg, arm) {
		var width = 2 * rows;
		return m(0, 0)
			+ l(arm, 0)
      + l(width, width)
      + l(-arm, 0)
      + l(-leg, leg)
      + l(-width, -width)
			+ z()
		;
	};

// gridlines() returns a single string with the <path> for all the gridlines
// of panel p.
function gridLines(rows, leg, arm) {
	var lines = "";
  for (h = 0; h <= rows; h++) {
    lines += M(arm + 2 * h, 2 * h)
      + l(-arm, 0)
      + l(-leg, leg)
  }
	return lines;
}

// translate() returns a string with the translation.
function translate(x, y) {
  return "translate(" + x + "," + y + ") ";
}

// scale() returns a string with the scale.
function scale(x, y) {
  return "scale(" + x + "," + y + ") ";
}
// Convenience functions to compose a path while keeping the code readable.
function M(x, y) {
		return "M" + x + " " + y + " ";
	}

function m(x, y) {
	return "m" + x + " " + y + " ";
}

function l(x, y) {
	return "l" + x + " " + y + " ";
}

function z() {
	return "Z";
}

function other(i) {
  return (i + 1) % 2;
}

// mod() is like %, but loops through all w, 0-1-2 … w, even for negative n.
// E.g. mod(0, 4, -1) = 3, rather than -1 when using the % operator.
// j is the ‘jump’ forward or backward.
// (n + j) % w brings it into range -(w - 1) … (w - 1).
// Adding w brings it into range ≥ 0 (but not necessarily < w).
// Finally, %w brings it into range 0 … (w - 1).
function mod(n, w, j) {
	return ((n + j) % w + w) % w;
}

function even(x) {
	return (x % 2) == 0;
}

function odd(x) {
	return !even(x);
}
