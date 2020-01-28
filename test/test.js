var expect = require("expect.js"),
    wizard = require("../.");

function compact(q) {
  q = q.replace(/\/\*[\s\S]*?\*\//g,"");
  q = q.replace(/\/\/.*/g,"");
  q = q.replace(/\[out:json\]\[timeout:.*?\];/,"");
  q = q.replace(/\(\{\{bbox\}\}\)/g,"(bbox)");
  q = q.replace(/\{\{geocodeArea:([^\}]*)\}\}/g,"area($1)");
  q = q.replace(/\{\{geocodeCoords:([^\}]*)\}\}/g,"coords:$1");
  q = q.replace(/\{\{date:([^\}]*)\}\}/g,"date:$1");
  q = q.replace(/\{\{[\s\S]*?\}\}/g,"");
  q = q.replace(/ *\n */g,"");
  return q;
};
var out_str = "out body;>;out skel qt;";

var testOptions = {
  comment: true,
  outputMode: "recursive",
  globalBbox: false,
  timeout: 25,
  maxsize: undefined,
  outputFormat: "json",
  aroundRadius: 1000
}

function checkWizard(inStrings, outString) {
  if (!Array.isArray(inStrings)) {
    inStrings = [inStrings];
  }
  for (var i in inStrings) {
    var result = wizard(inStrings[i], testOptions);
    expect(compact(result)).to.equal(outString + out_str);
  }
}

// basic conditions
describe("basic conditions", function () {
  // key
  it("key=*", function () {
    checkWizard(
      ["foo=*", "foo==*", "foo is not null"],
      "("+
        "nwr[\"foo\"](bbox);"+
      ");"
    );
  });
  // not key
  it("key!=*", function () {
    checkWizard(
      ["foo!=*", "foo<>*", "foo is null"],
      "("+
        "nwr[\"foo\"!~\".*\"](bbox);"+
      ");"
    );
  });
  // key-value
  it("key=value", function () {
    checkWizard(
      ["foo=bar", "foo==bar"],
      "("+
        "nwr[\"foo\"=\"bar\"](bbox);"+
      ");"
    );
  });
  // not key-value
  it("key!=value", function () {
    checkWizard(
      ["foo!=bar", "foo<>bar"],
      "("+
        "nwr[\"foo\"!=\"bar\"](bbox);"+
      ");"
    );
  });
  // regex key-value
  it("key~value", function () {
    checkWizard(
      [
        "foo~bar", "foo~/bar/",
        "foo~=bar", "foo~=/bar/",
        "foo like bar", "foo like /bar/",
      ],
      "("+
        "nwr[\"foo\"~\"bar\"](bbox);"+
      ");"
    );
    // case insensitivity flag
    checkWizard(
      "foo~/bar/i",
      "("+
        "nwr[\"foo\"~\"bar\",i](bbox);"+
      ");"
    );
  });
  // regex key + regex value
  it("~key~value", function () {
    checkWizard(
      [
        "~foo~bar", "~foo~/bar/", "~/foo/~bar", "~/foo/~/bar/",
        "~foo~=bar", "~foo~=/bar/", "~/foo/~=bar", "~/foo/~=/bar/",
      ],
      "("+
        "nwr[~\"foo\"~\"bar\"](bbox);"+
      ");"
    );
    // case insensitivity flag
    checkWizard(
      "~/foo/i~/bar/i",
      "("+
        "nwr[~\"foo\"~\"bar\",i](bbox);"+
      ");"
    );
    checkWizard(
      "~/foo/~/bar/i",
      "("+
        "nwr[~\"foo\"~\"bar\",i][~\"foo\"~\".*\"](bbox);"+
      ");"
    );
    checkWizard(
      "~/foo/i~/bar/",
      "("+
        "nwr[~\"foo\"~\"bar\",i][~\".*\"~\"bar\"](bbox);"+
      ");"
    );
  });
  // not regex key-value
  it("key!~value", function () {
    checkWizard(
      ["foo!~bar", "foo not like bar"],
      "("+
        "nwr[\"foo\"!~\"bar\"](bbox);"+
      ");"
    );
  });
  // susbtring key-value
  it("key:value", function () {
    // normal case: just do a regex search
    checkWizard(
      "foo:bar",
      "("+
        "nwr[\"foo\"~\"bar\"](bbox);"+
      ");"
    );
    // but also escape special characters
    checkWizard(
      "foo:'*'",
      "("+
        "nwr[\"foo\"~\"\\\\*\"](bbox);"+
      ");"
    );
  });
});

// data types
describe("data types", function () {
  describe("strings", function () {
    // strings
    it("double quoted strings", function () {
      // double-quoted string
      checkWizard(
        '"a key"="a value"',
        '('+
          'nwr["a key"="a value"](bbox);'+
        ');'
      );
    });
    it("single-quoted string", function () {
      // single-quoted string
      checkWizard(
        "'foo bar'='asd fasd'",
        '('+
          'nwr["foo bar"="asd fasd"](bbox);'+
        ');'
      );
    });
    it("quoted unicode string", function () {
      checkWizard(
        "name='بیجنگ'",
        '('+
          'nwr["name"="بیجنگ"](bbox);'+
        ');'
      );
    });
    it("unicode string", function () {
      checkWizard(
        "name=Béziers",
        '('+
          'nwr["name"="Béziers"](bbox);'+
        ');'
      );
    });
  });
  // regexes
  it("regex", function () {
    // simple regex
    checkWizard(
      "foo~/bar/",
      "("+
        "nwr[\"foo\"~\"bar\"](bbox);"+
      ");"
    );
    // simple regex with modifier
    checkWizard(
      "foo~/bar/i",
      "("+
        "nwr[\"foo\"~\"bar\",i](bbox);"+
      ");"
    );
  });
});

// boolean logic
describe("boolean logic", function () {
  // logical and
  it("logical and", function () {
    checkWizard(
      [
        "foo=bar and asd=fasd",
        "foo=bar & asd=fasd",
        "foo=bar && asd=fasd",
      ],
      "("+
        "nwr[\"foo\"=\"bar\"][\"asd\"=\"fasd\"](bbox);"+
      ");"
    );
  });
  // logical or
  it("logical or", function () {
    checkWizard(
      [
        "foo=bar or asd=fasd",
        "foo=bar | asd=fasd",
        "foo=bar || asd=fasd"
      ],
      '('+
        'nwr["foo"="bar"](bbox);'+
        'nwr["asd"="fasd"](bbox);'+
      ');'
    );
  });
  // boolean expression
  it("boolean expression", function () {
    checkWizard(
      "(foo=* or bar=*) and (asd=* or fasd=*)",
      "("+
        "nwr[\"foo\"][\"asd\"](bbox);"+
        "nwr[\"foo\"][\"fasd\"](bbox);"+
        "nwr[\"bar\"][\"asd\"](bbox);"+
        "nwr[\"bar\"][\"fasd\"](bbox);"+
      ");"
    );
  });
});

// meta conditions
describe("meta conditions", function () {
  // type
  it("type", function () {
    // simple
    checkWizard(
      "foo=bar and type:node",
      "("+
        "node[\"foo\"=\"bar\"](bbox);"+
      ");"
    );
    // multiple types
    checkWizard(
      "foo=bar and (type:node or type:way)",
      "("+
        "node[\"foo\"=\"bar\"](bbox);"+
        "way[\"foo\"=\"bar\"](bbox);"+
      ");"
    );
    // excluding types
    checkWizard(
      "foo=bar and type:node and type:way",
      "("+
      ");"
    );
  });
  // newer
  it("newer", function () {
    // regular
    checkWizard(
      "newer:\"2000-01-01T01:01:01Z\" and type:node",
      "("+
        "node(newer:\"2000-01-01T01:01:01Z\")(bbox);"+
      ");"
    );
    // relative
    checkWizard(
      "newer:1day and type:node",
      "("+
        "node(newer:\"date:1day\")(bbox);"+
      ");"
    );
  });
  // user
  it("user", function () {
    // user name
    checkWizard(
      "user:foo and type:node",
      "("+
        "node(user:\"foo\")(bbox);"+
      ");"
    );
    // uid
    checkWizard(
      "uid:123 and type:node",
      "("+
        "node(uid:123)(bbox);"+
      ");"
    );
  });
  // id
  it("id", function () {
    // with type
    checkWizard(
      "id:123 and type:node",
      "("+
        "node(123)(bbox);"+
      ");"
    );
    // without type
    checkWizard(
      "id:123",
      "("+
        "nwr(123)(bbox);"+
      ");"
    );
  });
});

// search-regions
describe("regions", function () {
  // global
  it("global", function () {
    checkWizard(
      "foo=bar and type:node global",
      "("+
        "node[\"foo\"=\"bar\"];"+
      ");"
    );
  });
  // bbox
  it("in bbox", function () {
    // implicit
    checkWizard(
      "type:node",
      "("+
        "node(bbox);"+
      ");"
    );
    // explicit
    checkWizard(
      "type:node in bbox",
      "("+
        "node(bbox);"+
      ");"
    );
  });
  // area
  it("in area", function () {
    checkWizard(
      "type:node in foobar",
      "area(foobar)->.searchArea;"+
      "("+
        "node(area.searchArea);"+
      ");"
    );
  });
  // around
  it("around", function () {
    checkWizard(
      "type:node around foobar",
      "("+
        "node(around:,coords:foobar);"+
      ");"
    );
  });

});

// free form
describe("free form", function () {
  return;

  // todo: refactor this

  before(function() {
    var fake_ajax = {
      success: function(cb) {
        cb({
          "amenity/hospital": {
            "name": "Hospital",
            "terms": [],
            "geometry": ["point","area"],
            "tags": {"amenity": "hospital"}
          },
          "amenity/shelter": {
            "name": "Shelter",
            "terms": [],
            "geometry": ["point"],
            "tags": {"amenity": "shelter"}
          },
          "highway": {
            "name": "Highway",
            "terms": [],
            "geometry": ["line"],
            "tags": {"highway": "*"}
          }
        });
        return fake_ajax;
      },
      error: function(cb) {}
    };
    sinon.stub($,"ajax").returns(fake_ajax);
    i18n = {getLanguage: function() {return "en";}};
  });
  after(function() {
    $.ajax.restore();
  });

  it("preset", function() {
    var search, result;
    // preset not found
    search = "foo";
    result = wizard(search, testOptions);
    expect(result).to.equal(false);
    // preset (points, key-value)
    search = "Shelter";
    result = wizard(search, testOptions);
    expect(result).to.not.equal(false);
    expect(compact(result)).to.equal(
      "("+
        "node[\"amenity\"=\"shelter\"](bbox);"+
      ");"+
      out_str
    );
    // preset (points, areas, key-value)
    search = "Hospital";
    result = wizard(search, testOptions);
    expect(result).to.not.equal(false);
    expect(compact(result)).to.equal(
      "("+
        "nwr[\"amenity\"=\"hospital\"](bbox);"+
      ");"+
      out_str
    );
    // preset (lines, key=*)
    search = "Highway";
    result = wizard(search, testOptions);
    expect(result).to.not.equal(false);
    expect(compact(result)).to.equal(
      "("+
        "way[\"highway\"](bbox);"+
      ");"+
      out_str
    );

  });

});

// sanity conversions for special conditions
describe("special cases", function () {
  // empty value
  it("empty value", function () {
    checkWizard(
      "foo='' and type:way",
      "("+
        "way[\"foo\"~\"^$\"](bbox);"+
      ");"
    );
  });
  // empty key
  it("empty key", function () {
    checkWizard(
      "''=bar and type:way",
      "("+
        "way[~\"^$\"~\"^bar$\"](bbox);"+
      ");"
    );
    // make sure stuff in the value section gets escaped properly
    checkWizard(
      "''='*' and type:way",
      "("+
        "way[~\"^$\"~\"^\\\\*$\"](bbox);"+
      ");"
    );
    // does also work for =*, ~ and : searches
    checkWizard(
      "(''=* or ''~/.../) and type:way",
      "("+
        "way[~\"^$\"~\".*\"](bbox);"+
        "way[~\"^$\"~\"...\"](bbox);"+
      ");"
    );
  });
  // newlines, tabs
  it("newlines, tabs", function () {
    checkWizard(
      "(foo='\t' or foo='\n' or asd='\\t') and type:way",
      "("+
        "way[\"foo\"=\"\\t\"](bbox);"+
        "way[\"foo\"=\"\\n\"](bbox);"+
        "way[\"asd\"=\"\\t\"](bbox);"+
      ");"
    );
  });

});
