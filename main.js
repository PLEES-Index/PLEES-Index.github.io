import GeoJSON from '/node_modules/ol/format/GeoJSON.js';
import Map from '/node_modules/ol/Map.js';
import VectorLayer from '/node_modules/ol/layer/Vector.js';
import VectorSource from '/node_modules/ol/source/Vector.js';
import View from '/node_modules/ol/View.js';
import {Fill, Stroke, Style} from '/node_modules/ol/style.js';

//import dataset from './data/data.json' assert { type: 'JSON' };
var dataset;

fetch('/data/data.json')
  .then(res => res.json())
  .then(data => {
    dataset = data;
   })
  .then(() => {
	updatePlot();
   });

// Set constants that are used throughout the code
var scenario = "00_2010";
var selected_index = "PLEES";


// Function to return a value from an array	  
function findItems(atr, val, out) {
    for (let i = 0; i < dataset.length; i++) {
		if (dataset[i][atr] === val) {
		  return dataset[i][out];
		}
	}
	return NaN;
}

// Function to return a subset of values from an array	 
function findSub(atr, val, out) {
    var subset = [];
    for (let i = 0; i < dataset.length; i++) {
		if (dataset[i][atr] === val) {
		  subset.push(dataset[i][out]);
		}
	}
	return  subset;
}

// Function to determine if a number has a value
function checkValue(num) {  
	if (isNaN(num)) {
		if ( typeof num == "string" && num != "NaN" && num.length !== 0) {
			return num;
		} else {
			return 'Missing data';
		}
	}
	return Number(num).toFixed(2);
}

// Function to convert a value into a hex colour
function NumbertoColor(num) {
  if (isNaN(num))  {
	  return "#e5ecf6";
  } else {
    //HSL
    var mincol;
    var maxcol;
    var scale;
    if (selected_index == 'PLEES') {
        var maxval = 4-1;
        num = num - 1;
    } else {
        var maxval = 1;
    }

    if (num < maxval/8.0) {
        mincol = [224,83,19];           //blue
        maxcol = [232,60,36];           //midnight blue
        scale = (num - maxval * 0/8.0)/(maxval/8.0);
    } else if ( num < maxval * 2.0/8.0) {
        mincol = [232,60,36];           //midnight blue
        maxcol = [213,66,40];           //navy
        scale = (num - maxval * 1/8.0)/(maxval/8.0);
    } else if ( num < maxval * 3.0/8.0) {
        mincol = [213,66,40];           //navy
        maxcol = [197,74,43];           //light blue
        scale = (num - maxval * 2/8.0)/(maxval/8.0);
    } else if ( num < maxval * 4.0/8.0) {
        mincol = [197,74,43];           //light blue
        maxcol = [186,53,51];           //teal
        scale = (num - maxval * 3/8.0)/(maxval/8.0);
    } else if ( num < maxval * 5.0/8.0) {
        mincol = [186,53,51];           //teal
        maxcol = [166,44,65];           //green
        scale = (num - maxval * 4/8.0)/(maxval/8.0);
    } else if ( num < maxval * 6.0/8.0) {
        mincol = [166,44,65];           //green
        maxcol = [98,55,81];            //lime
        scale = (num - maxval * 5/8.0)/(maxval/8.0);
    } else if ( num < maxval * 7.0/8.0) {
        mincol = [98,55,81];            //lime
        maxcol = [69,84,84];            //lemon
        scale = (num - maxval * 6/8.0)/(maxval/8.0);
    } else if ( num <= maxval ) {
        mincol = [69,84,84];            //lemon
        maxcol = [60,100,93];           //yellow
        scale = (num - maxval * 7/8.0)/(maxval/8.0);
    }
    // Interpolate the colour
    const l = Math.floor((maxcol[2]-mincol[2])*scale+mincol[2])/100;
    const a = Math.floor((maxcol[1]-mincol[1])*scale+mincol[1]) * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + Math.floor((maxcol[0]-mincol[0])*scale+mincol[0]) / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
	  return `#${f(0)}${f(8)}${f(4)}`;
  }
}

// Function to set the index and legend correctly
document.getElementById("index").onchange = function() {
	selected_index = document.getElementById("index").value;
	if (selected_index == "PLEES") {
		legend0.innerHTML = "<span style='background:"+NumbertoColor("NaN")+";'></span>No Data";
		legend1.innerHTML = "<span style='background:"+NumbertoColor(1)+";'></span>1";
		legend2.innerHTML = "<span style='background:"+NumbertoColor(2)+";'></span>2";
		legend3.innerHTML = "<span style='background:"+NumbertoColor(3)+";'></span>3";
		legend4.innerHTML = "<span style='background:"+NumbertoColor(4)+";'></span>4";
	} else {
		legend0.innerHTML = "<span style='background:"+NumbertoColor(0.0)+";'></span>0";
		legend1.innerHTML = "<span style='background:"+NumbertoColor(0.25)+";'></span>0.25";
		legend2.innerHTML = "<span style='background:"+NumbertoColor(0.50)+";'></span>0.50";
		legend3.innerHTML = "<span style='background:"+NumbertoColor(0.75)+";'></span>0.75";
		legend4.innerHTML = "<span style='background:"+NumbertoColor(1.0)+";'></span>1";
	}
	if (selected_index == "P") {
		document.getElementById("row_plees").style.display = "none";
		document.getElementById("row_p").style.display = "table-row";
		document.getElementById("row_le").style.display = "none";
		document.getElementById("row_e").style.display = "none";
		document.getElementById("row_s").style.display = "none";
	} else if (selected_index == "LE") {
		document.getElementById("row_plees").style.display = "none";
		document.getElementById("row_p").style.display = "none";
		document.getElementById("row_le").style.display = "table-row";
		document.getElementById("row_e").style.display = "none";
		document.getElementById("row_s").style.display = "none";
	} else if (selected_index == "E") {
		document.getElementById("row_plees").style.display = "none";
		document.getElementById("row_p").style.display = "none";
		document.getElementById("row_le").style.display = "none";
		document.getElementById("row_e").style.display = "table-row";
		document.getElementById("row_s").style.display = "none";
	} else if (selected_index == "S") {
		document.getElementById("row_plees").style.display = "none";
		document.getElementById("row_p").style.display = "none";
		document.getElementById("row_le").style.display = "none";
		document.getElementById("row_e").style.display = "none";
		document.getElementById("row_s").style.display = "table-row";
	} else {
		document.getElementById("row_plees").style.display = "table-row";
		document.getElementById("row_p").style.display = "table-row";
		document.getElementById("row_le").style.display = "table-row";
		document.getElementById("row_e").style.display = "table-row";
		document.getElementById("row_s").style.display = "table-row";
	}
	vectorLayer.getSource().changed();
    plot1_ind1.innerHTML = selected_index;
    plot1_ind2.innerHTML = selected_index;
	updatePlot(highlight_select);
}

// Function to set the correct database
document.getElementById("basemaps").onchange = function() {
	scenario = document.getElementById("basemaps").value;
	vectorLayer.getSource().changed();
	updatePlot(highlight_select);
}

// Function to set the colour of a country based on a dataset
function datacolour(feature) {
    const code = feature.get('ISO_A3');
	style.getFill().setColor(NumbertoColor(findItems('country_code', code, selected_index+'_'+scenario)));
    return style;
}

// Fill in the background
const style = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
});


// Set the map with the country borders
const vectorLayer = new VectorLayer({
  //background: '#1a2b39',   // Dark sea colour
  background: '#9EB9DF',   // Light sea colour
  source: new VectorSource({
    url: '/data/countries.geojson',
    format: new GeoJSON(),
  }),
  style: function (feature) {   
    return datacolour(feature);
  },
});

// Sets the map
const map = new Map({
  layers: [vectorLayer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1,
  }),
});

// Set the highlight for hovering
const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(255, 255, 255, 0.7)',
      width: 2,
    }),
  }),
});

// Set the highlight for selecting
const selectedOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(255, 0, 0, 0.25)',
      width: 2,
    }),
  }),
});

// Set hover behaviour
let highlight_select;
let highlight;
const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });

  if (feature) {
    info_country.innerHTML = feature.get('ADMIN') || '&nbsp;';
    info_continent.innerHTML = checkValue(findItems('country_code', feature.get('ISO_A3'), 'continent')) || '&nbsp;';
    info_val.innerHTML = checkValue(findItems('country_code', feature.get('ISO_A3'), 'PLEES_'+scenario)) || '&nbsp;';
    info_x1.innerHTML = checkValue(findItems('country_code', feature.get('ISO_A3'), 'P_'+scenario)) || '&nbsp;';
    info_x2.innerHTML = checkValue(findItems('country_code', feature.get('ISO_A3'), 'LE_'+scenario)) || '&nbsp;';
    info_x3.innerHTML = checkValue(findItems('country_code', feature.get('ISO_A3'), 'E_'+scenario)) || '&nbsp;';
    info_x4.innerHTML = checkValue(findItems('country_code', feature.get('ISO_A3'), 'S_'+scenario)) || '&nbsp;';
  } else if (highlight_select) {
    info_country.innerHTML = highlight_select.get('ADMIN') || '&nbsp;';
    info_continent.innerHTML = checkValue(findItems('country_code', highlight_select.get('ISO_A3'), 'continent')) || '&nbsp;';
    info_val.innerHTML = checkValue(findItems('country_code', highlight_select.get('ISO_A3'), 'PLEES_'+scenario)) || '&nbsp;';
    info_x1.innerHTML = checkValue(findItems('country_code', highlight_select.get('ISO_A3'), 'P_'+scenario)) || '&nbsp;';
    info_x2.innerHTML = checkValue(findItems('country_code', highlight_select.get('ISO_A3'), 'LE_'+scenario)) || '&nbsp;';
    info_x3.innerHTML = checkValue(findItems('country_code', highlight_select.get('ISO_A3'), 'E_'+scenario)) || '&nbsp;';
    info_x4.innerHTML = checkValue(findItems('country_code', highlight_select.get('ISO_A3'), 'S_'+scenario)) || '&nbsp;';
  } else {
    info_country.innerHTML = '&nbsp;';
    info_continent.innerHTML = '&nbsp;';
    info_val.innerHTML = '&nbsp;';
    info_x1.innerHTML = '&nbsp;';
    info_x2.innerHTML = '&nbsp;';
    info_x3.innerHTML = '&nbsp;';
    info_x4.innerHTML = '&nbsp;';
  }

  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
};

// Set click behaviour
const detailedFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });

  if (highlight_select) {
	selectedOverlay.getSource().removeFeature(highlight_select);
  }
  if (feature === highlight_select) {
	updatePlot(null);
	selectedOverlay.getSource().removeFeature(highlight_select);
	highlight_select = null;
    plot1_country1.innerHTML = "a country";
    plot1_country2.innerHTML = "a selected country";
  } else if (feature) {
	updatePlot(feature);
    plot1_country1.innerHTML = feature.get('ADMIN');
    plot1_country2.innerHTML = feature.get('ADMIN');
    //info_country_2.innerHTML = feature.get('ADMIN') || '&nbsp;';
    //info_country_3.innerHTML = feature.get('ADMIN') || '&nbsp;';
    selectedOverlay.getSource().addFeature(feature);
    highlight_select = feature;
  }
};

// Listen to hovers on the map
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
});

// Listen to clicks on the map
map.on('click', function (evt) {
  detailedFeatureInfo(evt.pixel);
});

var plot1 = document.getElementById('info_country_1');
var layout = {  autosize: true, showlegend: false,
  //width: "50%",
  //height: "50%",
  margin: { l: 25, r: 25, b: 25, t: 25, pad: 0}};
  
Plotly.newPlot( plot1, [{x: [null],y: [null] }], layout, {staticPlot: true});



// Update the subplots
function updatePlot(feature) {
	// Read the data for the box plots
	var dat_af = {y: findSub('continent', 'Africa', selected_index+'_'+scenario), name: "Africa",type: 'box'} ;
	var dat_am = {y: findSub('continent', 'America', selected_index+'_'+scenario), name: "America",type: 'box'} ;
	var dat_as = {y: findSub('continent', 'Asia', selected_index+'_'+scenario), name: "Asia",type: 'box'} ;
	var dat_eu = {y: findSub('continent', 'Europe', selected_index+'_'+scenario), name: "Europe",type: 'box'} ;
	var dat_oc = {y: findSub('continent', 'Oceania', selected_index+'_'+scenario), name: "Oceania",type: 'box'} ;
	// If a feature is selected a line is added
	if (feature) {
		var dat_cur= {x: ['Africa','Oceania'], y:[findItems('country_code', feature.get('ISO_A3'), selected_index+'_'+scenario),findItems('country_code', feature.get('ISO_A3'), selected_index+'_'+scenario)], type: 'scatter'};
		var cont_data = [dat_af, dat_am, dat_as, dat_eu, dat_oc, dat_cur];
		var title_string = feature.get('ADMIN')+': '+selected_index;
		
	} else {
		var cont_data = [dat_af, dat_am, dat_as, dat_eu, dat_oc];
		var title_string = selected_index;
	}
	
	
	let x = [1, 2, 3, 4, 5];
	let y = [10, 5, 2, 8, 16];
	// Actually make the plot
	Plotly.newPlot(plot1, cont_data, 
	{title: title_string, autosize: true, showlegend: false, 
	margin: { l: 25, r: 25, b: 25, t: 25, pad: 0}}, {staticPlot: true});
}
