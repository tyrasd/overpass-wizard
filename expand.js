var Promise = require('promise'),
    request = require('request-promise');

// converts relative time to ISO time string
function relativeTime(instr, callback) {
  var now = Date.now();
  // very basic differential date
  instr = instr.toLowerCase().match(/(-?[0-9]+) ?(seconds?|minutes?|hours?|days?|weeks?|months?|years?)?/);
  if (instr === null) {
    return Promise.reject(new Error('unable to expand date shortcut.'));
  }
  var count = parseInt(instr[1]);
  var interval;
  switch (instr[2]) {
    case "second":
    case "seconds":
    interval=1; break;
    case "minute":
    case "minutes":
    interval=60; break;
    case "hour":
    case "hours":
    interval=3600; break;
    case "day":
    case "days":
    default:
    interval=86400; break;
    case "week":
    case "weeks":
    interval=604800; break;
    case "month":
    case "months":
    interval=2628000; break;
    case "year":
    case "years":
    interval=31536000; break;
  }
  var date = now - count*interval*1000;
  return Promise.resolve((new Date(date)).toISOString());
}

// helper function to query nominatim for best fitting result
function nominatimRequest(search,filter) {
  return request({
    url: "https://nominatim.openstreetmap.org/search?format=json&q="+encodeURIComponent(search),
    method: "GET",
    headers: {"User-Agent": "overpass-wizard"},
    json: true
  }).then(function(data) {
    if (filter)
      data = data.filter(filter);
    if (data.length === 0)
      return Promise.reject(new Error("No result found for geocoding search: "+search));
    else
      return data[0];
  });
}

// geocoding shortcuts
function geocodeArea(instr) {
  function filter(n) {
    return n.osm_type && n.osm_id && n.osm_type!=="node";
  }
  return nominatimRequest(instr,filter).then(function(res) {
    var area_ref = 1*res.osm_id;
    if (res.osm_type == "way")
      area_ref += 2400000000;
    if (res.osm_type == "relation")
      area_ref += 3600000000;
    res = "area("+area_ref+")";
    return res;
  });
}
function geocodeCoords(instr) {
  return nominatimRequest(instr).then(function(res) {
    res = res.lat+','+res.lon;
    return res;
  });
}

module.exports = {
  date: relativeTime,
  geocodeArea: geocodeArea,
  geocodeCoords: geocodeCoords
};