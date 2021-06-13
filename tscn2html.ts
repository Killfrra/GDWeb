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

class ControlNode {
    [key: string]: any;
    
    name: string
    type: string
    children: Array<ControlNode> = []
    
    anchor_left: number = 0
    anchor_top: number = 0
    anchor_right: number = 0
    anchor_bottom: number = 0

    margin_left: number = 0
    margin_top: number = 0
    margin_right: number = 0
    margin_bottom: number = 0

    constructor(name: string, type: string){
        this.name = name
        this.type = type
    }

    html(int = 0, parent_size: Vec2 = {}){
        
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

            ret += ` background-image: url('${this.texture.replace('res://', '')}');`
        
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
            //if((this.expand && !this.stretch_mode) || this.stretch_mode == mode.scale_on_expand || this.stretch_mode == mode.scale)
            //    ret += ' background-size: contain;'
            //if(!this.expand || !this.stretch_mode == 3)
        }

        if(this.type in ['VBoxContainer', 'HBoxContainer']){
            if(!this.alignment || this.alignment == 0)
                {} //ret += ' justify-content: flex-start' // default, handled by styles
            else if(this.alignment === 1)
                ret += ' justify-content: flex-center'
            else if(this.alignment === 2)
                ret += ' justify-content: flex-end'
        }

        if(this.rect_min_size)
            ret += ` min-width: ${round(this.rect_min_size.x)}px; min-height: ${round(this.rect_min_size.y)}px`

        // custom css ends
        //ret += ` background-color: #${(int * Math.floor(255 / 32)).toString(16).padStart(2, '0').repeat(3)};
        ret += '"'
        // custom attributes
        if(this.placeholder_text)
            ret += ` placeholder="${this.placeholder_text}"`
        if(this.disabled || this.editable === false)
            ret += ' disabled'
        ret += '>'

        //custom content
        if(this.type == 'CheckBox'){
            ret += `<label><input type="checkbox">${this.text || ''}</label>`
        } else if(this.text)
            ret += this.text
        
        let inner = '\n'
        size = {}
        for(let child of this.children)
            inner += child.html(int + 1, size) + '\n'
        if(inner.length > 1)
            ret += inner + tab.repeat(int)
        if(type != 'input')
            ret += `</${type}>`
        return ret
    }
}

let nodeHeader = /^\[node name="([^"]+)" type="([^"]+)"(?: parent="([^"]+)")?]/
let propAssign = /^(?!__meta__)(.*) = (.*)/
let extResHeader = /^\[ext_resource path="([^"]+)" type="([^"]+)" id=(\d+)]/
let subResHeader = /^\[sub_resource type="([^"]+)" id=(\d+)]/
let bigRegex = new RegExp([ nodeHeader.source, propAssign.source, extResHeader.source, subResHeader.source].join('|'), 'gm')

const type2class = {
    'Control': ControlNode
}

function convert(){
    var scene: string = fs.readFileSync('test.tscn', 'utf8')

    let paths: { [key: string]: ControlNode } = {}
    let lastNode: any
    let rootNode: ControlNode
    let resources: Array<string> = []
    let subresources = []

    for(let [_, name, type, parent, key, value, extPath, extType, extId, subType, subId] of scene.matchAll(bigRegex)){
        if(name && type){
            lastNode = new (type2class[type] || ControlNode)(name, type)
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
            else if(m = value.match(/Vector2\( ([-\d.]+), ([-\d.]+) \)/))
                lastNode[key] = { x: m[1], y: m[2] }
            else if(m = value.match(/^"(.*)"$/))
                lastNode[key] = m[1]
            else if(/^[-\d.]+$/.test(value))
                lastNode[key] = parseFloat(value)
            else if(value == 'true')
                lastNode[key] = true
            else if(value == 'false')
                lastNode[key] = false
        } else if(extPath && extId){
            resources[parseInt(extId)] = extPath
        } else if(subType && subId){
            let id = parseInt(subId)
            lastNode = { id, type: subType }
            subresources[id] = lastNode
        }
    }

    if(!rootNode)
        return

    let html = '' + 
`<html>
<head>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
${ rootNode.html(0) }
</body>
</html>`

    fs.writeFileSync('test.html', html)
}

convert()