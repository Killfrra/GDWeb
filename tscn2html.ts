var fs = require('fs');

const settings = {
    optimize: true,
    round_margin: true
}

let round = (x: number) => (Math.round(x * 100) / 100)
/*
function round(value: number, unit?: string){
    value = (Math.round(value * 100) / 100)
    if(value && unit)
        return value + unit
    return value
}
*/

class CSSProp {
    [key: string]: any
}

class Element {
    tag: string
    style: CSSProp = {}
    constructor(tag: string){
        this.tag = tag
    }
}

class Document {
    createElement(tagName: string){
        return new Element(tagName)
    }
}

function calc(percent: number, add = 0){
    
    percent = round(percent * 100)
    add = round(add)

    if(add && percent)
        return `calc(${percent}% ${(add > 0) ? '+' : '-'} ${Math.abs(add)}px)`
    else if(percent)
        return percent + '%'
    else if(add)
        return add + 'px'
    else
        return '0'
}

let doc = new Document()

class Vec2 {
    x?: number
    y?: number
}

class Control {
    [key: string]: any;
    
    name: string
    type: string
    children: Array<Control> = []
    
    anchor_left: number = 0
    anchor_top: number = 0
    anchor_right: number = 0
    anchor_bottom: number = 0

    margin_left: number = 0
    margin_top: number = 0
    margin_right: number = 0
    margin_bottom: number = 0

    static readonly SizeFlags = {
        fill: 1,
        expand: 2,
        expand_fill: 3,
        shrink_center: 4,
        shrink_end: 8
    }

    size_flags_horizontal: number = Control.SizeFlags.fill
    size_flags_vertical: number = Control.SizeFlags.fill
    size_flags_stretch_ratio: number = 1

    constructor(name: string, type: string){
        this.name = name
        this.type = type
    }

    html(int = 0, parent: Control = undefined, parent_size: Vec2 = {}){
        
        if(settings.round_margin){
            this.margin_left |= 0
            this.margin_top |= 0
            this.margin_right |= 0
            this.margin_bottom |= 0
        }

        let size: Vec2 = {}
        let anchor_zero_width = (this.anchor_left || 0) == (this.anchor_right || 0)
        if(anchor_zero_width)
            size.x = Math.abs((this.margin_right || 0) - (this.margin_left || 0))
        else if(parent_size && parent_size.x !== undefined)
            size.x = parent_size.x * ((this.anchor_right || 0) - (this.anchor_left || 0)) - Math.abs((this.margin_right || 0) - (this.margin_left || 0))
        
        let anchor_zero_height = (this.anchor_top || 0) == (this.anchor_bottom || 0)
        if(anchor_zero_height)
            size.y = Math.abs((this.margin_bottom || 0) - (this.margin_top || 0))
        else if(parent_size && parent_size.y !== undefined)
            size.y = parent_size.y * ((this.anchor_bottom || 0) - (this.anchor_top || 0)) - Math.abs((this.margin_bottom || 0) - (this.margin_top || 0))
        
        const tab = '    '
        
        let type = 'div'
        if(this.type == 'LineEdit')
            type = 'input'
        else if(this.type == 'Button')
            type = 'button'
        else if(this.type == 'OptionButton')
            type = 'select'
        
        let ret = tab.repeat(int) + `<${type} name="${this.name}" class="${this.type}" style="`
        
        if(!parent || (!parent.type.endsWith('Container') && parent.script !== 'span_limiter.gd')){
            
            if(parent_size.y !== undefined){
                let top = parent_size.y * (this.anchor_top || 0) + (this.margin_top || 0)
                ret += ` top: ${round(top)}px;`;
            } else {
                //if(this.anchor_top == 1)
                //    ret += ` bottom: ${round(-this.margin_bottom)}px;`
                //else
                    ret += ` top: ${calc(this.anchor_top, this.margin_top)};`
            }
            
            if(parent_size.x !== undefined){
                let left = parent_size.x * (this.anchor_left || 0) + (this.margin_left || 0)
                ret += ` left: ${round(left)}px;`
            } else {
                //if(this.anchor_left == 1)
                //    ret += ` right: ${round(-this.margin_right)}px;`
                //else
                    ret += ` left: ${calc(this.anchor_left, this.margin_left)};`
            }

            if(size.x)
                ret += ` width: ${round(size.x)}px;`
            else
                ret += ` width: ${calc(this.anchor_right - this.anchor_left, this.margin_right - this.margin_left)};`
            
            if(size.y)
                ret += ` height: ${round(size.y)}px;`
            else
                ret += ` height: ${calc(this.anchor_bottom - this.anchor_top, this.margin_bottom - this.margin_top)};`
        }

        // custom css starts
        if(this.visible === false)
            ret += ' display: none;'

        if(this.align)
            ret += ` text-align: ${ ['left', 'center', 'right', 'justify'][this.align] };`

        if(this.rect_scale || this.rect_rotation){
            ret += ` transform:`
            if(this.rect_scale)
                ret += ` scale(${this.rect_scale.x}, ${this.rect_scale.y})`
            if(this.rect_rotation)
                ret += ` rotate(${this.rect_rotation}deg)`
            ret += ';'

            if(this.rect_pivot_offset)
                ret += ` transform-origin: ${this.rect_pivot_offset.x}px ${this.rect_pivot_offset.y}px`
        }

        if(typeof this.texture === 'string'){

            ret += ` background-image: url('${this.texture}');`
        
            const mode = {
                scale_on_expand: 0,
                scale: 1,
                tile: 2,
                keep: 3,
                keep_centered: 4,
                keep_aspect: 5,
                keep_aspect_centered: 6,
                keep_aspect_covered: 7
            }
            // handled by styles
            if((this.expand && !this.stretch_mode) || this.stretch_mode === mode.scale_on_expand || this.stretch_mode === mode.scale)
                ret += ' background-size: 100% 100%;'
            if(this.stretch_mode == mode.tile)
                ret += ' background-repeat: repeat;'
            if(!this.expand && (!this.stretch_mode || this.stretch_mode === mode.scale_on_expand) || this.stretch_mode === mode.keep)
                {} //ret += ' background-repeat: repeat;'
            if(this.stretch_mode === mode.keep_centered)
                ret += ' background-position: center;'
            if(this.stretch_mode === mode.keep_aspect)
                ret += ' background-size: contain;'
            if(this.stretch_mode === mode.keep_aspect_centered)
                ret += ' background-size: contain; background-position: center;'
            if(this.stretch_mode === mode.keep_aspect_covered)
                ret += ' background-size: cover;'

        }

        if(this.type in ['VBoxContainer', 'HBoxContainer']){
            if(!this.alignment || this.alignment == 0)
                {} //ret += ' justify-content: flex-start' // default, handled by styles
            else if(this.alignment === 1)
                ret += ' justify-content: flex-center'
            else if(this.alignment === 2)
                ret += ' justify-content: flex-end'
        }

        if(this.rect_clip_content)
            ret += ' overflow: hidden;'

        if(this.type == 'ScrollContainer'){
            if(this.scroll_horizontal_enabled === undefined || this.scroll_horizontal_enabled)
                ret += ' overflow-x: auto;'
            if(this.scroll_vertical_enabled === undefined || this.scroll_vertical_enabled)
                ret += ' overflow-y: auto;'
        }

        if(this.rect_min_size){
            if(this.rect_min_size.x)
                ret += ` min-width: ${round(this.rect_min_size.x)}px;`
            if(this.rect_min_size.y)
                ret += ` min-height: ${round(this.rect_min_size.y)}px;`
        }
        
        // https://github.com/godotengine/godot-proposals/issues/1802#issuecomment-864473401
        if(parent && parent.script == 'span_limiter.gd'){
            //ret = ret.replace(/ (width|height): .*?;/g, ' $1: 100%;')
            ret += ' width: 100%; height: 100%;'
            if(parent.rect_max_size){
                if(parent.rect_max_size.x != 10000000){
                    ret += ` max-width: ${round(parent.rect_max_size.x)}px;`
                    if(parent.align === 0)
                        // ret = ret.replace(/ (?:left|right): .*?;/,
                        ret += (' left: 0;')
                    else if(!parent.align || parent.align === 1)
                        //ret = ret.replace(/ left: .*?;/,
                        ret += (` left: max(0px, calc((100% - ${round(parent.rect_max_size.x)}px) / 2));`)
                    else if(parent.align === 2)
                        //ret = ret.replace(/ left: .*?;/,
                        ret += (` left: max(0px, 100% - ${round(parent.rect_max_size.x)}px);`)
                }
                if(parent.rect_max_size.y != 10000000){
                    ret += ` max-height: ${round(parent.rect_max_size.y)}px;`
                    if(parent.valign === 0)
                        //ret = ret.replace(/ (?:top|bottom): .*?;/,
                        ret += (' top: 0;')
                    else if(!parent.align || parent.valign === 1)
                        //ret = ret.replace(/ (?:top|bottom): .*?;/,
                        ret += (` top: max(0px, calc(100% - ${round(parent.rect_max_size.y)}px) / 2));`)
                    else if(parent.valign === 2)
                        //ret = ret.replace(/ (?:top|bottom): .*?;/,
                        ret += (` top: max(0, 100% - ${round(parent.rect_max_size.y)}px);`)
                }
            }
        }
        
        if((this.size_flags_horizontal & Control.SizeFlags.expand_fill) == Control.SizeFlags.expand_fill || (this.size_flags_vertical & Control.SizeFlags.expand_fill) == Control.SizeFlags.expand_fill)
            ret += ` flex-grow: ${this.size_flags_stretch_ratio};`

        // custom css ends
        //ret += ` background-color: #${(int * Math.floor(255 / 32)).toString(16).padStart(2, '0').repeat(3)};
        ret += '"'
        // custom attributes
        if(this.placeholder_text)
            ret += ` placeholder="${this.placeholder_text}"`
        if(this.disabled || this.editable === false)
            ret += ' disabled'

        if(this.type == 'LineEdit' && this.text)
            ret += ` value="${this.text}"`

        ret += '>'

        //custom content
        if(this.type == 'CheckBox'){
            ret += `<label><input type="checkbox">${this.text || ''}</label>`
        } else if(this.text && this.type != 'LineEdit')
            ret += this.text
        
        let inner = '\n'
        size = {} //TODO: fix
        for(let child of this.children)
            inner += child.html(int + 1, this, size) + '\n'
        if(inner.length > 1)
            ret += inner + tab.repeat(int)
        if(type != 'input')
            ret += `</${type}>`
        return ret
    }
}

let nodeHeader = /^\[node name="([^"]+)"(?: type="([^"]+)")?(?: parent="([^"]+)")?(?: instance=ExtResource\( (\d+) \))?]/
let propAssign = /^(?!__meta__)(.*) = (.*)/
let extResHeader = /^\[ext_resource path="([^"]+)" type="([^"]+)" id=(\d+)]/
let subResHeader = /^\[sub_resource type="([^"]+)" id=(\d+)]/
let bigRegex = new RegExp([ nodeHeader.source, propAssign.source, extResHeader.source, subResHeader.source].join('|'), 'gm')

const type2class = {}

function parse(scene_path: string){
    var scene: string = fs.readFileSync(scene_path, 'utf8')

    let paths: { [key: string]: Control } = {}
    let lastNode: any
    let rootNode: Control
    let resources: Array<string> = []
    let subresources = []

    for(let [_, name, type, parent, instId, key, value, extPath, extType, extId, subType, subId] of scene.matchAll(bigRegex)){
        if(name){
            lastNode = new (type2class[type] || Control)(name, type)
            if(!parent){
                paths['.'] = lastNode
                rootNode = lastNode
            } else {
                if(parent == '.')
                    paths[name] = lastNode
                else
                    paths[parent + '/' + name] = lastNode
                paths[parent].children.push(lastNode)
            }
        } else if(key && value && lastNode){
            let m: RegExpMatchArray | null
            if(m = value.match(/SubResource\( (\d+) \)/))
                lastNode[key] = subresources[parseInt(m[1])]
            else if(m = value.match(/ExtResource\( (\d+) \)/))
                lastNode[key] = resources[parseInt(m[1])]
            else if(m = value.match(/Vector2\( ([-\d.+e]+), ([-\d.+e]+) \)/))
                lastNode[key] = { x: parseFloat(m[1]), y: parseFloat(m[2]) }
            else if(m = value.match(/^"(.*)"$/))
                lastNode[key] = m[1]
            else if(/^[-\d.+e]+$/.test(value))
                lastNode[key] = parseFloat(value)
            else if(value == 'true')
                lastNode[key] = true
            else if(value == 'false')
                lastNode[key] = false
        } else if(extPath && extId){
            extPath = extPath.replace('res://', '')
            let extRes: any
            if(extType == 'PackedScene')
                extRes = parse(extPath)
            else
                extRes = extPath
            resources[parseInt(extId)] = extRes
        } else if(subType && subId){
            let id = parseInt(subId)
            lastNode = { id, type: subType }
            subresources[id] = lastNode
        }
    }
    return rootNode
}

function convert(){

    let rootNode = parse(process.argv[2] || 'test.tscn')

    if(!rootNode)
        return

    let html = '' + 
`<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
${ rootNode.html(0) }
<script src="cleaner.js"></script>
</body>
</html>`

    fs.writeFileSync(process.argv[3] || 'test.html', html)
}

convert()