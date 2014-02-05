function timeline(domElement, dataset) {

    //--------------------------------------------------------------------------
    //
    // chart
    //
    function logslider(x) {
    // position will be between 0 and 100
        if(x > 50) {
            x = 50;
        }
      var minp = 1;
      var maxp = 50;

      // The result should be between 100 an 10000000
      var minv = Math.log(4);
      var maxv = Math.log(10);

      // calculate adjustment factor
      var scale = (maxv-minv) / (maxp-minp);

      return Math.exp(minv + scale*(x-minp));
    }

    
    // chart geometry
    var margin = {top: 20, right: 20, bottom: 35, left: 20},
        outerWidth = $(domElement).width(),
        //outerHeight = dataset.length*30,
        outerHeight = 600,
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

    // global timeline variables
    var timeline = {},   // The timeline
        data = {},       // Container for the data
        components = [], // All the components of the timeline for redrawing
        bandGap = 25,    // Arbitray gap between to consecutive bands
        bands = {},      // Registry for all the bands in the timeline
        bandY = 0,       // Y-Position of the next band
        bandNum = 0;     // Count of bands for ids

    // Create svg element
    var svg = d3.select(domElement).append("svg")
        .attr("class", "svg")
        .attr("id", "svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top +  ")");

    svg.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var chart = svg.append("g")
            .attr("class", "chart")
            .attr("clip-path", "url(#chart-area)" );

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("visibility", "visible");

    $(domElement).append( '<div style="padding:10px;padding-bottom:20px;"><table style="width:100%" cellpadding="0" cellspacing="0" border="0" class="display" id="SwimChartTable"></table></div>' );

   

    //--------------------------------------------------------------------------
    //
    // data
    //

    timeline.data = function(items) {

        var today = new Date(),
            tracks = [],
            yearMillis = 31622400000,
            //x-axis offset (change this to be dynamic)
            instantOffset = yearMillis;

        data.items = items;

        function showItems(n) {
            var count = 0, n = n || 10;
            items.forEach(function (d) {
                count++;
                if (count > n) return;
                console.log(toYear(d.start) + " - " + toYear(d.end) + ": " + d.label);
            });
        }

        function compareAscending(item1, item2) {
            // Every item must have two fields: 'start' and 'end'.
            var result = item1.start - item2.start;
            // earlier first
            if (result < 0) { return -1; }
            if (result > 0) { return 1; }
            // longer first
            result = item2.end - item1.end;
            if (result < 0) { return -1; }
            if (result > 0) { return 1; }
            return 0;
        }

        function compareDescending(item1, item2) {
            // Every item must have two fields: 'start' and 'end'.
            var result = item1.start - item2.start;
            // later first
            if (result < 0) { return 1; }
            if (result > 0) { return -1; }
            // shorter first
            result = item2.end - item1.end;
            if (result < 0) { return 1; }
            if (result > 0) { return -1; }
            return 0;
        }

        function calculateTracks(items, sortOrder, timeOrder) {
            var i, track;

            sortOrder = sortOrder || "descending"; // "ascending", "descending"
            timeOrder = timeOrder || "backward";   // "forward", "backward"

            function sortBackward() {
                // older items end deeper
                items.forEach(function (item) {
                    for (i = 0, track = 0; i < tracks.length; i++, track++) {
                        if (item.end < tracks[i]) { break; }
                    }
                    item.track = track;
                    tracks[track] = item.start;
                });
            }
            function sortForward() {
                // younger items end deeper
                items.forEach(function (item) {
                    for (i = 0, track = 0; i < tracks.length; i++, track++) {
                        if (item.start > tracks[i]) { break; }
                    }
                    item.track = track;
                    tracks[track] = item.end;
                });
            }

            if (sortOrder === "ascending")
                data.items.sort(compareAscending);
            else
                data.items.sort(compareDescending);

            if (timeOrder === "forward")
                sortForward();
            else
                sortBackward();
        }

        data.items.forEach(function (item){
            //round all the time params
            item.time = Math.ceil(item.start/1000)*1000;
            item.start = parseDate(item.start);      
        });
        var a = [], pTime; 
        var sData = {};
        //sort items returned
        var objSorted = sortByKey(data.items, 'start', 'class');

      //  var classSort = sortByKey(dobjSorted, 'class');
        for (var n in objSorted) {
            if ((objSorted[n].time !== pTime)) {
                //push sorted/unique info to a new array
                a.push({
                    time: objSorted[n].time,
                    start: objSorted[n].start,
                    end: objSorted[n].end,
                    label: 'label',
                    class: objSorted[n].class //set to unique identifier based on group returned
                    //label should be a timestamp maybe
                    //and figure out whats happening with time ra3nges + classes
                });
            }
            //set previous time value (because its all in order, above wont append anything new if the next matches this)
            pTime = objSorted[n].time;
        }
        //clear original array
        data.items = [];
        //push the excess arrays to item.data to be accessed later onClick
        a.forEach(function (item){
            var d = [];
            for (var o in objSorted) {
                if ((objSorted[o].time === item.time) && (objSorted[o].class === item.class)) {
                    d.push(objSorted[o]);
                }
            }
            item.data = d;
            //push finished product back to original (data.items)
            data.items.push(item);
        });
        data.items.forEach(function (item){
            if (item.end === '') {
                item.end = new Date(item.start.getTime() + instantOffset);
                item.instant = true;
            } else {
                item.end = parseDate(item.end);
                item.instant = false;
            }
            if (item.end > today) { item.end = today;}
        });        

 
        calculateTracks(data.items, "descending", "backward");
        //calculateTracks(data.items, "ascending", "forward");
        data.nTracks = tracks.length;
        data.minDate = d3.min(data.items, function (d) { return d.start; });
        data.maxDate = d3.max(data.items, function (d) { return d.end; });

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // band
    //

    timeline.band = function (bandName, sizeFactor) {

        var band = {};
        band.id = "band" + bandNum;
        band.x = 0;
        band.y = bandY;
        band.w = width; //compressed the width be percentage for info sidebar
        band.h = ((data.items.length*40) - margin.top - margin.bottom) * (sizeFactor || 1);
        //band.h = (data.items.length*40) * (sizeFactor || 1);
        band.trackOffset = 4;
        // Prevent tracks from getting too high
        // band.trackHeight = Math.min((band.h - band.trackOffset) / data.nTracks, 20);
        band.trackHeight = Math.min((band.h - band.trackOffset) / data.nTracks, 25);
        band.itemHeight = band.trackHeight * 0.8,
        band.parts = [],
        band.instantWidth = 100; // arbitray value

        band.xScale = d3.time.scale()
            .domain([data.minDate, data.maxDate])
            .range([0, band.w]);

        band.yScale = function (track) {
            return band.trackOffset + track * band.trackHeight;
        };
        
        // build and append chart
        band.g = chart.append("g")
            .attr("id", band.id)
            .attr("transform", "translate(0," + band.y +  ")");  
       
        band.g.append("rect")
            .attr("class", "band")
            .attr("width", band.w)
            .attr("height", band.h); 

        // Items
        var items = band.g.selectAll("g")
            .data(data.items)
            .enter().append("svg")
            .attr("y", function (d) { return band.yScale(d.track); })
            .attr("height", band.itemHeight)
            .attr("class", function (d) { return d.instant ? "part instant swim-"+d.class : "part interval swim-"+d.class;});

        d3.select(domElement+' svg').attr("height", data.items.length*40);
        d3.select(domElement+' svg clipPath rect').attr("height", data.items.length*40);

        var instants = d3.select("#band" + bandNum).selectAll(".instant");

        var intervals = d3.select("#band" + bandNum).selectAll(".interval"); 

        var infoAppend = function(d) {
            $(document).ready(function() {
                $('#SwimChartTable').dataTable( {
                    "aaData": d.data,
                    "bDestroy": true,
                    "bFilter": true,
                    "bRebuild": true,
                    "aoColumns": [
                        { "sTitle": "Test" },{ "sTitle": "Test" }
                    ]
                } );   
                $('html').animate({
                    scrollTop: $("#SwimChartTable").offset().top-150
                }, 1000);
            } );
        };

        intervals.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr('style', 'cursor:pointer')
            .on("click", function (d){
                infoAppend(d);
            });

        instants.append("circle")
            .attr("cx", band.itemHeight / 2)
            .attr("cy", band.itemHeight / 2)
            .attr("r", function (d) {return logslider(d.data.length); })
            .attr('style', 'cursor:pointer')
            .on("click", function (d){
                infoAppend(d);
            });

        instants.append("text")
            .attr("class", 'instantLabel')
            .attr("x", 15)
            .attr("y", 10)
            .text(function (d) { return d.label+' ('+d.data.length+')'; })
            .attr('style', 'cursor:pointer')
            .on("click", function (d){
                infoAppend(d);
            });
            //console.log(new Function(function (d){return d.class}));

        band.addActions = function(actions) {
            // actions - array: [[trigger, function], ...]
            actions.forEach(function (action) {
                items.on(action[0], action[1]);
            });
        };

        band.redraw = function () {
            items
                .attr("x", function (d) { return band.xScale(d.start);})
                .attr("width", function (d) {
                    return band.xScale(d.end) - band.xScale(d.start); });
            band.parts.forEach(function(part) { part.redraw(); });
        };

        bands[bandName] = band;
        components.push(band);
        // Adjust values for next band
        bandY += band.h + bandGap;
        bandNum += 1;

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // labels
    //

    timeline.labels = function (bandName) {

        var band = bands[bandName],
            labelWidth = 60,
            labelHeight = 20,
            labelTop = band.y + band.h - 10,
            y = band.y + band.h + 1,
            yText = 20;

        var labelDefs = [
                ["start", "bandMinMaxLabel", 0, 4,
                    function(min, max) { return toYear(min); },
                    "Start of the selected interval", band.x + 30, labelTop],
                ["end", "bandMinMaxLabel", band.w - labelWidth, band.w - 4,
                    function(min, max) { return toYear(max); },
                    "End of the selected interval", band.x + band.w - 152, labelTop]
            ];

        var bandLabels = chart.append("g")
            .attr("id", bandName + "Labels")
            .attr("transform", "translate(0," + (band.y + band.h + 1) +  ")")
            .selectAll("#" + bandName + "Labels")
            .data(labelDefs)
            .enter().append("g");

        var labels = bandLabels.append("text")
            .attr("class", function(d) { return d[1];})
            .attr("id", function(d) { return d[0];})
            .attr("x", function(d) { return d[3];})
            .attr("y", yText)
            .attr("text-anchor", function(d) { return d[0];});

        labels.redraw = function () {
            var min = band.xScale.domain()[0],
                max = band.xScale.domain()[1];

            labels.text(function (d) { return d[4](min, max); });
        };

        band.parts.push(labels);
        components.push(labels);

        return timeline;
    };


    timeline.xAxis = function (bandName, orientation) {

        var band = bands[bandName];
        var axis = d3.svg.axis().scale(band.xScale).tickSize(1).tickSubdivide(true);
        var xAxis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (band.y + band.h)  + ")");

        xAxis.redraw = function () {
            xAxis.call(axis);
        };

        band.parts.push(xAxis); // for brush.redraw
        components.push(xAxis); // for timeline.redraw

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // brush
    //

    timeline.brush = function (bandName, targetNames) {

        var band = bands[bandName];

        var brush = d3.svg.brush()
            .x(band.xScale.range([0, band.w]))
            .on("brush", function() {
                var domain = brush.empty()
                    ? band.xScale.domain()
                    : brush.extent();
                targetNames.forEach(function(d) {
                    bands[d].xScale.domain(domain);
                    bands[d].redraw();
                });
            });

        var xBrush = band.g.append("svg")
            .attr("class", "x brush")
            .call(brush);

        xBrush.selectAll("rect")
            .attr("y", 4)
            .attr("height", band.h - 4);

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // redraw
    //

    timeline.redraw = function () {
        components.forEach(function (component) {
            component.redraw();
        });
    };

    //--------------------------------------------------------------------------
    //
    // Utility functions
    //

    function parseDate(dateString) {
        //convert the returnes unix time to a javascript date Object
        date = new Date(Math.ceil(dateString/1000)*1000000);
        return date;
    }

    function toYear(date) {
        return date.toDateString();
    }

    return timeline;
}