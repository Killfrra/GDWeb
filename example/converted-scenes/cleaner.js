function clean(node) {
    for(let i = node.childNodes.length; i--;) {
        let child = node.childNodes[i];
        if ((child.nodeType === Node.TEXT_NODE && !/\S/.test(child.nodeValue)) || child.nodeType === Node.COMMENT_NODE){
            node.removeChild(child);
        } else {
            clean(child);
        }
    }
}

clean(document)