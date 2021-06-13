var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var fs = require('fs');
var settings = {
    optimize: true,
    round_margin: true
};
var round = function (x) { return (Math.round(x * 100) / 100); };
/*
function round(value: number, unit?: string){
    value = (Math.round(value * 100) / 100)
    if(value && unit)
        return value + unit
    return value
}
*/
var CSSProp = /** @class */ (function () {
    function CSSProp() {
    }
    return CSSProp;
}());
var Element = /** @class */ (function () {
    function Element(tag) {
        this.style = {};
        this.tag = tag;
    }
    return Element;
}());
var Document = /** @class */ (function () {
    function Document() {
    }
    Document.prototype.createElement = function (tagName) {
        return new Element(tagName);
    };
    return Document;
}());
function calc(percent, add) {
    if (add === void 0) { add = 0; }
    percent = round(percent * 100);
    add = round(add);
    if (add && percent)
        return "calc(" + percent + "% " + ((add > 0) ? '+' : '-') + " " + Math.abs(add) + "px)";
    else if (percent)
        return percent + '%';
    else if (add)
        return add + 'px';
    else
        return '0';
}
var doc = new Document();
var Vec2 = /** @class */ (function () {
    function Vec2() {
    }
    return Vec2;
}());
var ControlNode = /** @class */ (function () {
    function ControlNode(name, type) {
        this.children = [];
        this.anchor_left = 0;
        this.anchor_top = 0;
        this.anchor_right = 0;
        this.anchor_bottom = 0;
        this.margin_left = 0;
        this.margin_top = 0;
        this.margin_right = 0;
        this.margin_bottom = 0;
        this.name = name;
        this.type = type;
    }
    ControlNode.prototype.html = function (int, parent_size) {
        var e_1, _a;
        if (int === void 0) { int = 0; }
        if (parent_size === void 0) { parent_size = {}; }
        if (settings.round_margin) {
            this.margin_left |= 0;
            this.margin_top |= 0;
            this.margin_right |= 0;
            this.margin_bottom |= 0;
        }
        var size = {};
        var anchor_zero_width = (this.anchor_left || 0) == (this.anchor_right || 0);
        if (anchor_zero_width)
            size.x = Math.abs((this.margin_right || 0) - (this.margin_left || 0));
        else if (parent_size && parent_size.x !== undefined)
            size.x = parent_size.x * ((this.anchor_right || 0) - (this.anchor_left || 0)) - Math.abs((this.margin_right || 0) - (this.margin_left || 0));
        var anchor_zero_height = (this.anchor_top || 0) == (this.anchor_bottom || 0);
        if (anchor_zero_height)
            size.y = Math.abs((this.margin_bottom || 0) - (this.margin_top || 0));
        else if (parent_size && parent_size.y !== undefined)
            size.y = parent_size.y * ((this.anchor_bottom || 0) - (this.anchor_top || 0)) - Math.abs((this.margin_bottom || 0) - (this.margin_top || 0));
        var tab = '    ';
        var type = 'div';
        if (this.type == 'LineEdit')
            type = 'input';
        else if (this.type == 'Button')
            type = 'button';
        else if (this.type == 'OptionButton')
            type = 'select';
        var ret = tab.repeat(int) + ("<" + type + " name=\"" + this.name + "\" class=\"" + this.type + "\" style=\"");
        if (parent_size.y !== undefined) {
            var top = parent_size.y * (this.anchor_top || 0) + (this.margin_top || 0);
            ret += " top: " + round(top) + "px;";
        }
        else {
            //if(this.anchor_top == 1)
            //    ret += ` bottom: ${round(-this.margin_bottom)}px;`
            //else
            ret += " top: " + calc(this.anchor_top, this.margin_top) + ";";
        }
        if (parent_size.x !== undefined) {
            var left = parent_size.x * (this.anchor_left || 0) + (this.margin_left || 0);
            ret += " left: " + round(left) + "px;";
        }
        else {
            //if(this.anchor_left == 1)
            //    ret += ` right: ${round(-this.margin_right)}px;`
            //else
            ret += " left: " + calc(this.anchor_left, this.margin_left) + ";";
        }
        if (size.x)
            ret += " width: " + round(size.x) + "px;";
        else
            ret += " width: " + calc(this.anchor_right - this.anchor_left, this.margin_right - this.margin_left) + ";";
        if (size.y)
            ret += " height: " + round(size.y) + "px;";
        else
            ret += " height: " + calc(this.anchor_bottom - this.anchor_top, this.margin_bottom - this.margin_top) + ";";
        // custom css starts
        if (this.visible === false)
            ret += ' display: none;';
        if (this.align)
            ret += " text-align: " + ['left', 'center', 'right', 'justify'][this.align] + ";";
        if (this.rect_scale || this.rect_rotation) {
            ret += " transform:";
            if (this.rect_scale)
                ret += " scale(" + this.rect_scale.x + ", " + this.rect_scale.y + ")";
            if (this.rect_rotation)
                ret += " rotate(" + this.rect_rotation + "deg)";
            ret += ';';
            if (this.rect_pivot_offset)
                ret += " transform-origin: " + this.rect_pivot_offset.x + "px " + this.rect_pivot_offset.y + "px";
        }
        if (typeof this.texture === 'string') {
            ret += " background-image: url('" + this.texture.replace('res://', '') + "');";
            var mode = {
                scale_on_expand: 0,
                scale: 1,
                tile: 2,
                keep: 3,
                keep_centered: 4,
                keep_aspect: 5,
                keep_aspect_centered: 6,
                keep_aspect_covered: 7
            };
            // handled by styles
            //if((this.expand && !this.stretch_mode) || this.stretch_mode == mode.scale_on_expand || this.stretch_mode == mode.scale)
            //    ret += ' background-size: contain;'
            //if(!this.expand || !this.stretch_mode == 3)
        }
        if (this.type in ['VBoxContainer', 'HBoxContainer']) {
            if (!this.alignment || this.alignment == 0) { } //ret += ' justify-content: flex-start' // default, handled by styles
            else if (this.alignment === 1)
                ret += ' justify-content: flex-center';
            else if (this.alignment === 2)
                ret += ' justify-content: flex-end';
        }
        if (this.rect_min_size)
            ret += " min-width: " + round(this.rect_min_size.x) + "px; min-height: " + round(this.rect_min_size.y) + "px";
        // custom css ends
        //ret += ` background-color: #${(int * Math.floor(255 / 32)).toString(16).padStart(2, '0').repeat(3)};
        ret += '"';
        // custom attributes
        if (this.placeholder_text)
            ret += " placeholder=\"" + this.placeholder_text + "\"";
        if (this.disabled || this.editable === false)
            ret += ' disabled';
        ret += '>';
        //custom content
        if (this.type == 'CheckBox') {
            ret += "<label><input type=\"checkbox\">" + (this.text || '') + "</label>";
        }
        else if (this.text)
            ret += this.text;
        var inner = '\n';
        size = {};
        try {
            for (var _b = __values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                inner += child.html(int + 1, size) + '\n';
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (inner.length > 1)
            ret += inner + tab.repeat(int);
        if (type != 'input')
            ret += "</" + type + ">";
        return ret;
    };
    return ControlNode;
}());
var nodeHeader = /^\[node name="([^"]+)" type="([^"]+)"(?: parent="([^"]+)")?]/;
var propAssign = /^(?!__meta__)(.*) = (.*)/;
var extResHeader = /^\[ext_resource path="([^"]+)" type="([^"]+)" id=(\d+)]/;
var subResHeader = /^\[sub_resource type="([^"]+)" id=(\d+)]/;
var bigRegex = new RegExp([nodeHeader.source, propAssign.source, extResHeader.source, subResHeader.source].join('|'), 'gm');
var type2class = {
    'Control': ControlNode
};
function convert() {
    var e_2, _a;
    var scene = fs.readFileSync('test.tscn', 'utf8');
    var paths = {};
    var lastNode;
    var rootNode;
    var resources = [];
    var subresources = [];
    try {
        for (var _b = __values(scene.matchAll(bigRegex)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 11), _ = _d[0], name = _d[1], type = _d[2], parent = _d[3], key = _d[4], value = _d[5], extPath = _d[6], extType = _d[7], extId = _d[8], subType = _d[9], subId = _d[10];
            if (name && type) {
                lastNode = new (type2class[type] || ControlNode)(name, type);
                if (!parent) {
                    paths['.'] = lastNode;
                    rootNode = lastNode;
                }
                else {
                    if (parent == '.')
                        paths[name] = lastNode;
                    else
                        paths[parent + '/' + name] = lastNode;
                    paths[parent].children.push(lastNode);
                }
            }
            else if (key && value && lastNode) {
                var m = void 0;
                if (m = value.match(/SubResource\( (\d+) \)/))
                    lastNode[key] = subresources[parseInt(m[1])];
                else if (m = value.match(/ExtResource\( (\d+) \)/))
                    lastNode[key] = resources[parseInt(m[1])];
                else if (m = value.match(/Vector2\( ([-\d.]+), ([-\d.]+) \)/))
                    lastNode[key] = { x: m[1], y: m[2] };
                else if (m = value.match(/^"(.*)"$/))
                    lastNode[key] = m[1];
                else if (/^[-\d.]+$/.test(value))
                    lastNode[key] = parseFloat(value);
                else if (value == 'true')
                    lastNode[key] = true;
                else if (value == 'false')
                    lastNode[key] = false;
            }
            else if (extPath && extId) {
                resources[parseInt(extId)] = extPath;
            }
            else if (subType && subId) {
                var id = parseInt(subId);
                lastNode = { id: id, type: subType };
                subresources[id] = lastNode;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    if (!rootNode)
        return;
    var html = '' +
        ("<html>\n<head>\n    <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n" + rootNode.html(0) + "\n</body>\n</html>");
    fs.writeFileSync('test.html', html);
}
convert();
//# sourceMappingURL=tscn2html.js.map