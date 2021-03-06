function lexer(code) {
  return code.split(/\s+/)
           .filter(function (t) { return t.length > 0 })
           .map(function (t) {
             return isNaN(t)
                      ? { type: 'word', value: t }
                      : { type: 'number', value: t }
           })
}


function parser (tokens) {
  var AST = {
    type: 'Drawing',
    body: []
  }

  while (tokens.length > 0){
    var current_token = tokens.shift()

    if (current_token.type === 'word') {
      switch (current_token.value) {
        case 'Paper' :
          var expression = {
            type: 'CallExpression',
            name: 'Paper',
            arguments: []
          }

          var argument = tokens.shift()
          if(argument.type === 'number') {
            expression.arguments.push({
              type: 'NumberLiteral',
              value: argument.value
            })

            AST.body.push(expression)
          } else {
            throw 'Paper command must be followed by a number.'
          }
          break
        case 'Pen' :
          break
        case 'Line':
          break
        default:
          break;
      }
    }
  }
  return AST
}

function transformer (ast) {
  var svg_ast = {
    tag: 'svg',
    attr: {
      width: 100, height: 100, viewBox: '0 0 100 100',
      xmlns: 'http://www.w3.org/2000/svg', version: '1.1'
    },
    body: []
  }

  var pen_color = 100

  while (ast.body.length > 0) {
    var node = ast.body.shift()
    switch (node.name) {
      case 'Paper':
        var paper_color = 100 - node.arguments[0].value
        svg_ast.body.push({
          tag: 'rect',
          attr: {
            x: 0, y: 0,
            width: 100, height: 100,
            fill: 'rgb(' + paper_color + '%,' + paper_color + '%,' + paper_color + '%)'
          }
        })
        break;
      case 'Pen':
        pen_color = 100 - node.arguments[0].value
        break;
      case 'Line':
        break;
      default:
        break;
    }
  }
  return svg_ast
}

function generator (svg_ast) {

  function createAttrString (attr) {
    return Object.keys(attr).map(function (key){
      return key + '="' + attr[key] + '"'
    }).join(' ')
  }

  var svg_attr = createAttrString(svg_ast.attr)

  var elements = svg_ast.body.map(function (node) {
    return '<' + node.tag + ' ' + createAttrString(node.attr) + '></' + node.tag + '>'
  }).join('\n\t')

  return '<svg '+ svg_attr +'>\n' + elements + '\n</svg>'
}

var sbn = {}
sbn.VERSION = '0.0.1'
sbn.lexer = lexer
sbn.parser = parser
sbn.transformer = transformer
sbn.generator = generator

sbn.compile = function(code) {
  return this.generator(this.transformer(this.parser(this.lexer(code))))
}


var input = "Paper 100"
console.log(sbn.compile(input))
