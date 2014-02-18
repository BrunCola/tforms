function timeline(domElement, dataset) {

    //--------------------------------------------------------------------------
    //
    // chart
    //
   function sortByKey(array, key, key2) {
        return array.sort(function(a, b) {
            // var x = a[key]; var y = b[key];
            // return ((x < y) ? -1 : ((x > y) ? 1 : 0));

            if (a[key2] == b[key2])
            return a[key] < b[key] ? -1 : 1;
            return a[key2] < b[key2] ? 1 : -1;

        });
    }
    // chart geometry
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
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
        //.attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top +  ")");

    svg.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("width", width);
        //.attr("height", height);

    var chart = svg.append("g")
            .attr("class", "chart")
            .attr("clip-path", "url(#chart-area)" );

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("visibility", "visible");

    $(domElement).append( '<table width="100%" cellpadding="0" cellspacing="0" border="0" class="display" id="SwimChartTable"></table>' );

   

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
            console.log("\n");
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

        // Convert yearStrings into dates
       
        // data.items.forEach(function (item){
        //     //round all the time params
        //     item.time = Math.ceil(item.start/1000)*1000;
        //     item.start = parseDate(item.start);
        //     if (item.end == "") {
        //         //console.log("1 item.start: " + item.start);
        //         //console.log("2 item.end: " + item.end);
        //         item.end = new Date(item.start.getTime() + instantOffset);
        //         //console.log("3 item.end: " + item.end);
        //         item.instant = true;
        //     } else {
        //         //console.log("4 item.end: " + item.end);
        //         item.end = parseDate(item.end);
        //         item.instant = false;
        //     }
        //     // The timeline never reaches into the future.
        //     // This is an arbitrary decision.
        //     // Comment out, if dates in the future should be allowed.
        //     if (item.end > today) { item.end = today};
        // }); 

        // var a = [], pTime, pClass; 
        // var sData = {};
        // var objSorted = sortByKey(data.items, 'start');
        // for (var n in objSorted) {
        //     if ((objSorted[n].time !== pTime)) {
        //         a.push({
        //             time: objSorted[n].time,
        //         });
        //     }
        //     pTime = objSorted[n].time;
        // }
        // a.forEach(function (item){
        //     var d = [];
        //     for (var o in objSorted) {
        //         if (objSorted[o].time === item.time) {
        //             d.push(objSorted[o]);
        //         }
        //     }
        //     item.data = d;
        // });


        data.items.forEach(function (item){
            //round all the time params
            item.time = Math.ceil(item.start/1000)*1000;
            item.start = parseDate(item.start);      
        });
        var a = [], pTime, pClass; 
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
            pClass = objSorted[n].class;
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

        //calculateTracks(data.items);
        // Show patterns
        //calculateTracks(data.items, "ascending", "backward");
        //calculateTracks(data.items, "descending", "forward");
        // Show real data
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
        band.w2 = width*0.2;
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

        //var info = d3.selectAll(".info");
        // var infoAppend = function(d) {
        //      info
        //     .append("foreignObject")
        //     .attr("width", '100%')
        //     //.attr('background-color', '#FFF')
        //     .attr("height", '100%')
        //     //.append("xhtml:body")
        //     .style("font", "14px 'Helvetica Neue'")
        //     .style('color','#000')

        //     .html(function() {
        //         var t = '';
        //         for (var r in d.data) {
        //              // t.push(d.data[r][1]);
        //              t += '<tr><td>'+d.data[r][1]+' class:'+d.data[r].class+'</td></tr>';
        //         }
        //         return '<table border="1"><tr><th>Time here</th></tr>'+t+'</table>';
        //     });
        // };
        var infoAppend = function(d) {
            $(document).ready(function() {
                    //$(domElement).append( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="SwimChartTable"></table>' );
                    $('#SwimChartTable').dataTable( {
                        "aaData": d.data,
                        "bDestroy": true,
                        "bFilter": true,
                        "bRebuild": true,
                        "aoColumns": [
                            { "sTitle": "Test" },{ "sTitle": "Test" }
                        ]
                    } );   
                } );
        };
        intervals.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .on("click", function (d){
                infoAppend(d);
            });

        instants.append("circle")
            .attr("cx", band.itemHeight / 2)
            .attr("cy", band.itemHeight / 2)
            .attr("r", function (d) {return 5*d.data.length; })
            .on("click", function (d){
                //tooltip.style("visibility", "hidden");
                //alert('test');
                // if ($("#SwimChartTable").empty() !== true) {
                //     $("#SwimChartTable").html('');
                // }
                infoAppend(d);

                    //.html('</tr></table>');
                    //.html("<h1>An HTML Foreign Object in SVG</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eu enim quam. Quisque nisi risus, sagittis quis tempor nec, aliquam eget neque. Nulla bibendum semper lorem non ullamcorper. Nulla non ligula lorem. Praesent porttitor, tellus nec suscipit aliquam, enim elit posuere lorem, at laoreet enim ligula sed tortor. Ut sodales, urna a aliquam semper, nibh diam gravida sapien, sit amet fermentum purus lacus eget massa. Donec ac arcu vel magna consequat pretium et vel ligula. Donec sit amet erat elit. Vivamus eu metus eget est hendrerit rutrum. Curabitur vitae orci et leo interdum egestas ut sit amet dui. In varius enim ut sem posuere in tristique metus ultrices.<p>Integer mollis massa at orci porta vestibulum. Pellentesque dignissim turpis ut tortor ultricies condimentum et quis nibh. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod lorem vulputate dui pharetra luctus. Sed vulputate, nunc quis porttitor scelerisque, dui est varius ipsum, eu blandit mauris nibh pellentesque tortor. Vivamus ultricies ante eget ipsum pulvinar ac tempor turpis mollis. Morbi tortor orci, euismod vel sagittis ac, lobortis nec est. Quisque euismod venenatis felis at dapibus. Vestibulum dignissim nulla ut nisi tristique porttitor. Proin et nunc id arcu cursus dapibus non quis libero. Nunc ligula mi, bibendum non mattis nec, luctus id neque. Suspendisse ut eros lacus. Praesent eget lacus eget risus congue vestibulum. Morbi tincidunt pulvinar lacus sed faucibus. Phasellus sed vestibulum sapien.");

                    //$('#test').html(function (d) { return d.data; });
                    //.attr("class", 'instantLabel')
                    //.text('title', function (d) { return d.class; });
                    //tooltip.html(d.class);
                    //.style("fill", '#000');
            });

        instants.append("text")
            .attr("class", 'instantLabel')
            .attr("x", 15)
            .attr("y", 10)
            .text(function (d) { return d.label; });
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
            labelWidth = 46,
            labelHeight = 20,
            labelTop = band.y + band.h - 10,
            y = band.y + band.h + 1,
            yText = 15;

        var labelDefs = [
                ["start", "bandMinMaxLabel", 0, 4,
                    function(min, max) { return toYear(min); },
                    "Start of the selected interval", band.x + 30, labelTop],
                ["end", "bandMinMaxLabel", band.w - labelWidth, band.w - 4,
                    function(min, max) { return toYear(max); },
                    "End of the selected interval", band.x + band.w - 152, labelTop],
                ["middle", "bandMidLabel", (band.w - labelWidth) / 2, band.w / 2,
                    function(min, max) { return max.getUTCFullYear() - min.getUTCFullYear(); },
                    "Length of the selected interval", band.x + band.w / 2 - 75, labelTop]
            ];

        var bandLabels = chart.append("g")
            .attr("id", bandName + "Labels")
            .attr("transform", "translate(0," + (band.y + band.h + 1) +  ")")
            .selectAll("#" + bandName + "Labels")
            .data(labelDefs)
            .enter().append("g")
            .on("mouseover", function(d) {
                tooltip.html(d[5])
                    .style("top", d[7] + "px")
                    .style("left", d[6] + "px")
                    .style("visibility", "visible");
                })
            .on("mouseout", function(){
                tooltip.style("visibility", "hidden");
            });

        // bandLabels.append("rect")
        //     .attr("class", "bandLabel")
        //     .attr("x", function(d) { return d[2];})
        //     .attr("width", labelWidth)
        //     .attr("height", labelHeight)
        //     .style("opacity", 1);

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

    //----------------------------------------------------------------------
    //
    // tooltips
    //
     function getHtml(element, d) {
            var html;
            if (element.attr("class") == "interval") {
                html = d.label + "<br>" + toYear(d.start) + " - " + toYear(d.end);
            } else {
                html = d.label + "<br>" + toYear(d.start);
            }
            return html;
        }
    timeline.tooltips = function (bandName) {

        var band = bands[bandName];

        band.addActions([
            // trigger, function
            ["mouseover", showTooltip],
            ["mouseout", hideTooltip]
        ]);

        function getHtml(element, d) {
            var html;
            if (element.attr("class") == "interval") {
                html = d.label + "<br>" + toYear(d.start) + " - " + toYear(d.end);
            } else {
                html = d.label + "<br>" + toYear(d.start);
            }
            return html;
        }

        function showTooltip (d) {

        }

        function hideTooltip () {
            tooltip.style("visibility", "hidden");
        }

        return timeline;
    };

    //----------------------------------------------------------------------
    //
    // xAxis
    //

    timeline.xAxis = function (bandName, orientation) {

        var band = bands[bandName];

        var axis = d3.svg.axis()
            .scale(band.xScale)
            .orient(orientation || "bottom")
            .tickSize(6, 0)
            .tickFormat(function (d) { return toYear(d); });

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
        })
    };

    //--------------------------------------------------------------------------
    //
    // Utility functions
    //

    function parseDate(dateString) {
        // 'dateString' must either conform to the ISO date format YYYY-MM-DD
        // or be a full year without month and day.
        // AD years may not contain letters, only digits '0'-'9'!
        // Invalid AD years: '10 AD', '1234 AD', '500 CE', '300 n.Chr.'
        // Valid AD years: '1', '99', '2013'
        // BC years must contain letters or negative numbers!
        // Valid BC years: '1 BC', '-1', '12 BCE', '10 v.Chr.', '-384'
        // A dateString of '0' will be converted to '1 BC'.
        // Because JavaScript can't define AD years between 0..99,
        // these years require a special treatment.

        // var format = d3.time.format("%Y-%m-%d %H-%m-%s"),
        //     date,
        //     year;

        date = new Date(Math.ceil(dateString/1000)*1000000);

        // date = format.parse(dateString);
        // if (date !== null) return date;

        // // BC yearStrings are not numbers!
        // if (isNaN(dateString)) { // Handle BC year
        //     // Remove non-digits, convert to negative number
        //     year = -(dateString.replace(/[^0-9]/g, ""));
        // } else { // Handle AD year
        //     // Convert to positive number
        //     year = +dateString;
        // }
        // if (year < 0 || year > 99) { // 'Normal' dates
        //     date = new Date(year, 6, 1);
        // } else if (year == 0) { // Year 0 is '1 BC'
        //     date = new Date (-1, 6, 1);
        // } else { // Create arbitrary year and then set the correct year
        //     // For full years, I chose to set the date to mid year (1st of July).
        //     date = new Date(year, 6, 1);
        //     date.setUTCFullYear(("0000" + year).slice(-4));
        // }
        // Finally create the date
        return date;
    }

    function toYear(date, bcString) {
        // bcString is the prefix or postfix for BC dates.
        // If bcString starts with '-' (minus),
        // if will be placed in front of the year.
        bcString = bcString || " BC" // With blank!
        var year = date.getUTCFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        //var hour = date.getHours();
        // if (year > 0) return year.toString();
        // if (bcString[0] == '-') return bcString + (-year);
        //var fTime = day + month + year;
        //return day+'/'+month+'/'+year;
        return date.toDateString();
    }

    return timeline;
}