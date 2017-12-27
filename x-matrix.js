
d3.json("x-matrix.json", function(error, data) {
	if (error) return console.warn(error);
	drawMatrix(data[0]);
});

function drawMatrix(m) {
  var svg = setupSVG();
	m.clicks = 0;
	setupGradients(svg);
  setupZigZag(m);
  drawPanels(svg, m.zigzag);
  drawGrids(svg, m.zigzag);
  drawNumbers(svg, m.zigzag);
	//drawClickers(svg, m);
  drawText(svg, m.zigzag);
  drawOrigin(m, svg);
}

function setupSVG() {
  return d3.select("body")
    .append("svg")
    .attr("viewBox", "-500 -50 1000 2000")
    .attr("preserveAspectRatio", "xMaxYMax meet")
    .append("g")
    .attr("id", "x-matrix")
    .attr("transform", "scale(5)")
  ;
}

function setupGradients(svg) {
	var defs = svg.append("defs");

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

function drawPanels(xMatrix, zigzag) {
  xMatrix.append("g")
    .attr("id", "panels")
    .selectAll("_")
  	.data(zigzag).enter().append("g")
    	.attr("id", function(d){return d.kind;})
      .selectAll("_")
      .data(function(d) {return d.panels;}).enter().append("g")
        .attr("id", function(d){return d.section;})
        .attr("transform", function(d){return d.transform;}).append("path")
        .attr("class", function(d, i){return d.direction;})
				.attr("fill", function(d){return "url(#fade-" + d.direction + ")";})
        .attr("transform", function(d){return d.originPanel})
        .attr("d", function(d){return d.panelPath;})
  ;
}

function drawGrids(xMatrix, zigzag) {
  xMatrix.append("g")
    .attr("id", "grids")
    .selectAll("_")
  	.data(zigzag).enter().append("g")
      .attr("id", function(d){return d.kind;})
      .selectAll("_")
      .data(function(d) {return d.panels;}).enter().append("g")
        .attr("id", function(d){return d.section;})
        .attr("transform", function(d){return d.transform;}).append("path")
        .attr("class", "hairline")
				.attr("stroke", "url(#fader-gridline)")
        .attr("transform", function(d){return d.originPanel})
        .attr("d", function(d){return d.gridLines;})
  ;
}

function drawNumbers(xMatrix, zigzag) {
  var entries = xMatrix.append("g")
  	.attr("id", "numbers")
  	.selectAll("_")
  		.data(zigzag).enter().append("g")
  		.attr("id", function(d){return d.kind;})
  		.selectAll("_")
  			.data(function(d) {return d.panels;}).enter().append("g")
  			.attr("id", function(d){return d.section;})
  			.attr("text-anchor", function(d){return d.anchor;})
        .attr("transform", function(d){return d.originText;})
	;

  entries.append("g")
    .attr("id", "numbers")
    .attr("transform", function(d){return d.originEntries;})
    .selectAll("_")
    .data(function(d) {return d.entries;})
      .enter().append('text')
      .attr("class", "index")
      .attr("dx", function(d){return d.dxIndex;})
      .attr("x", function(d, i){return 2 * i * d.dx;})
      .attr("y", function(d, i){return 2 * i;})
      .attr("dy", "-.9")
      .text(function(d, i){return i + 1;})
  ;
}

function drawText(xMatrix, zigzag) {
  var entries = xMatrix.append("g")
  	.attr("id", "contents")
  	.selectAll("_")
  		.data(zigzag).enter().append("g")
  		.attr("id", function(d){return d.kind;})
  		.selectAll("_")
  			.data(function(d) {return d.panels;}).enter().append("g")
  			.attr("id", function(d){return d.section;})
  			.attr("text-anchor", function(d){return d.anchor;})
        .attr("transform", function(d){return d.originText;})
	;

	// text > section titles
  entries.append("text").attr("class", "section")
  	.attr("dy", "-.5")
    .text(function(d){return d.section;})
  ;

	// text > entries
  entries.append("g").attr("id", "entries")
    .attr("transform", function(d){return d.originEntries;})
    .selectAll("_")
    .data(function(d) {return d.entries;})
      .enter().append('text')
      .attr("class", "entry")
      .attr("x", function(d, i){return 2 * i * d.dx;})
      .attr("y", function(d, i){return 2 * i;})
      .attr("dy", "-.5")
      .text(function(d, i){return d.entry;})
  ;
}

function drawClickers(svg, matrix) {
	var clickers = setupClickers(matrix);
	console.log(clickers);
	var rows = svg.append("g").attr("id", "clickers")
	.attr("transform", "translate(0,2)")
	.selectAll("_")
		.data(clickers).enter().append("g")
		.attr("id", "row")
		;
	var columns = rows.selectAll("_")
		.data(function(d, i){
			//console.log(d);
			return d;}).enter().append("g")
		.attr("id", "column")
		.attr("transform", function(d,i){
			//console.log(d);
		})
		;
	var stripes = columns.selectAll("_")
		.data(function(d, i){
			//console.log(d);
			return d;
		}).enter().append("g")
		.attr("id", "stripe")
		.attr("transform", function(d,i){return "translate(" + 2*i + "," + 2*i + ")";})

		;
	var zorks = stripes.selectAll("_")
		.data(function(d, i){return d;}).enter().append("g")
		.attr("id", "zork")
		;

	var fills = [ "none", "grey", "black"];

	zorks.append("g")
		.append("circle")
		.attr("id", "dot")
		.attr("r", "1")
		.attr("cx", function(d,i){return -2 * i;})
		.attr("cy", function(d,i){return 2 * i;})
		.on("click", function(d){
			console.log(d.clicks);
			d3.select(this).style("fill", fills[(++d.clicks % fills.length)]);
		})
		;
}

function drawOrigin(matrix, svg) {
	var fills = ["red", "lightblue", "steelblue", "none"];
  svg.append("g").attr("id", "center")
    .append("circle")
    .attr("id", "center")
    .attr("r", .5)
		.on("click", function(d){
			d3.select(this).style("fill", fills[(++matrix.clicks % 4)]);
		})
    ;
}

function setupZigZag(matrix) {
	// Set up and agument the data structure read from the JSON file:
	// - add x and y coordinates for each
	//   - text entry;
	//   - section title
	var zigzag = matrix.zigzag;

  // First, sum the total number of entries per zig and zag.
  // We will be needing this later for the length of the other section.
  for (i = 0; i < zigzag.length; i++) {
    units = (zigzag[i].panels.length - 1) * matrix.gap; // keep for R1!
    for (j = 0; j < zigzag[i].panels.length; j++) {
      units += zigzag[i].panels[j].entries.length; // keep for R1!
    }
    zigzag[other(i)].leg = 2 * (units + matrix.padding);
  }

  console.log(matrix);

  var xx = 0;
  var yy = 0;

  for (i = 0; i < zigzag.length; i++) {
    side = zigzag[i];
    slope = side.kind == "zig" ? +1 : -1;
    panels = side.panels;
    for (j = 0; j < panels.length; j++) {
      panel = panels[j];

      northEast = (side.kind == "zig") && (panel.anchor == "start");
      northWest = (side.kind == "zag") && (panel.anchor == "end");
      southEast = (side.kind == "zag") && (panel.anchor == "start");
      southWest = (side.kind == "zig") && (panel.anchor == "end");

      upperHalf = northEast || northWest;
      lowerHalf = southEast || southWest;

      leftHalf  = northWest || southWest;
      rightHalf = northEast || southEast;

      //-------------------------------------------------------------------
      // At each entry store dx, so consecutive entries staircase
      // in the right direction.
      for (e = 0; e < panel.entries.length; e++) {
        panel.entries[e].dx = slope;
        panel.entries[e].dxIndex = 1.5 * (upperHalf ? -slope : slope);
      }

      //-------------------------------------------------------------------
      // At each panel, store local transformation strings.
      // Used by both both panels and gridLines.
      // Since panels and grids all draw from (0,0), they need to
      // nudge themselves #rows left&down when flipped vertically and
      // #rows right&down when flipped both vertically & horizontally.
      nudgeX = upperHalf ? 0 : 2 * slope * panel.entries.length;
      nudgeY = slope * nudgeX;
      // Flip left-right when we are in the left side
      scaleX = rightHalf ? +1 : -1;
      // Flip up-down when we are in the lower half: either
      // zag & start or zig & end.
      scaleY = upperHalf ? +1 : -1;

      // Add local transformation string for panel or gridLines.
      panel.originPanel = translate(nudgeX, nudgeY) + scale(scaleX, scaleY);

      // at panel, create and store string for panelPath
      panel.panelPath = panelPath(
        panel.entries.length,
        side.leg,
        matrix.arm
      );

      // at panel, create and store a path string for grid lines
      panel.gridLines = gridLines(
        panel.entries.length,
        side.leg,
        matrix.arm
      );

      //-------------------------------------------------------------------
      // At each panel, store its origin (x0, y0).
      // Panels, grid lines and text entries all render relative to this origin,
      // and locally nudge into place if needed .

      // Add a gap before every panel but the first one.
      if (j > 0) {
        xx += matrix.gap * slope;
        yy += matrix.gap;
      }

      // Calculate actual coordinates, moving padding away from the center.
      xx0 = 2 * xx + matrix.padding;
      yy0 = 2 * yy - slope * matrix.padding;

      // Shift the whole along the panel’s leg when on the other (left) side.
      if (leftHalf) {
        xx0 -= side.leg;
        yy0 += slope * side.leg;
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

  }
}

function Paneel(x, y, rij) {
	this.x = x;
	this.y = y;
	this.rij = [];
}

function setupClickers(matrix) {

	var zig = matrix.zigzag[0];
	var zag = matrix.zigzag[1];
	var clickers = [];

	// Create array of zigs
	// of array of panels (zags)
	// of array of rows
	// of array of cells with click variable.
	tick = 0;
	tack = 0;

	for (i = 0; i < zig.panels.length; i++) {
		clickers.push([]);
		if (i > 0) {
			tick += matrix.gap;
		}
		for (j = 0; j < zag.panels.length; j++) {
			if (j > 0) {
				tack += matrix.gap;
			}
			clickers[i].push([]);
			for (k = 0; k < zig.panels[i].entries.length; k++) {
				clickers[i][j].push([]);
				for (q = 0; q < zag.panels[j].entries.length; q++) {
					clickers[i][j][k].push({
						clicks: 0
					});
				}
			}
			tack += zag.panels[j].entries.length;
		}
		tick += zig.panels[i].entries.length;
		tack = 0
	}
	return clickers;
}

function panelPath(rows, leg, arm) {
	// panelPath() returns the <path> string that composes panel p.
	// Uses relative lines, so transform() it into proper place and orientation.
		var
		  width = 2 * rows;

		return m(0, 0)
			+ l(arm, 0)
      + l(width, width)
      + l(-arm, 0)
      + l(-leg, leg)
      + l(-width, -width)
			+ z()
		;
	};

function gridLines(rows, leg, arm) {
	// gridlines() returns a single string with the <path> for all the gridlines
	// of panel p.
	var lines = "";
  for (h = 0; h <= rows; h++) {
    lines += M(arm + 2 * h, 2 * h)
      + l(-arm, 0)
      + l(-leg, leg)
  }
	return lines;
}

function translate(x, y) {
  return "translate(" + x + "," + y + ") ";
}

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

function mod(n, w, j) {
// mod() is like %, but loops through all w, 0-1-2 … w, even for negative n.
// E.g. mod(0, 4, -1) = 3, rather than -1 when using the % operator.
// j is the ‘jump’ forward or backward.
// (n + j) % w brings it into range -(w - 1) … (w - 1).
// Adding w brings it into range ≥ 0 (but not necessarily < w).
// Finally, %w brings it into range 0 … (w - 1).
	return ((n + j) % w + w) % w;
}

function even(x) {
	return (x % 2) == 0;
}

function odd(x) {
	return !even(x);
}
