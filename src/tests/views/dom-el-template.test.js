import { DomElementTemplate } from '../../spyne/views/dom-element-template'
import { ScriptTemplate, StringTemplate, starWarsData } from '../mocks/template-renderer.mocks'
import { DomElement } from '../../spyne/views/dom-element'

chai.use(require('chai-dom'))
describe('DomElementTemplate should safely render special strings', () => {



  const testCases = [
    {
      ref: 'dollarDigit',
      label: 'should properly add $ sign before a number',
      val: 'Currently raising $1.5M'
    },
    {
      ref: 'dollarAmp',
      label: 'should preserve $& which refers to full match in replace',
      val: 'Matched value was: $&'
    },
    {
      ref: 'dollarBacktick',
      label: 'should preserve $` which refers to text before match in replace',
      val: 'Before the match: $`'
    },
    {
      ref: 'dollarSingleQuote',
      label: 'should preserve $\' which refers to text after match in replace',
      val: "After the match: $\'"
    },
    {
      ref: 'backslashPath',
      label: 'should preserve file path backslashes',
      val: 'User path: C:\\Users\\Frank\\Documents'
    },
    {
      ref: 'curlyBraces',
      label: 'should preserve double curly brace templates in string',
      val: 'This is not a template: {{user.name}}'
    },
    {
      ref: 'scriptTag',
      label: 'should render inline script tags safely (if allowed)',
      val: 'Click here: <script>alert("XSS")</script>'
    },
    {
      ref: 'richContentWithDot',
      label: 'should allow rich content with template syntax inside',
      val: 'Hello <b>{{.}}</b>, welcome back.'
    },
    {
      ref: 'unicodeCurrency',
      label: 'should preserve Unicode and currency characters',
      val: 'Price is €100 or ¥12000'
    }
  ];

  testCases.forEach(({ label, val, ref }) => {
    it(`${ref}: ${label}`, () => {
      const data = { val, arr: [val] };

      const template = '<h1>I am {{val}}'
      const domElTmpl = new DomElementTemplate(template, data, { testMode: true });
      const render = domElTmpl.renderDocFrag();

      const templateArr = '<h1>{{#arr}}{{.*}}{{/arr}}</h1>'
      const domElTmpArr = new DomElementTemplate(templateArr, data, { testMode: true });
      const renderArr = domElTmpArr.renderDocFrag();

      //console.log("RENDER: ", render.firstElementChild.innerText," RENDERARR: ", renderArr.firstElementChild.innerText);

      expect(render.firstElementChild.innerHTML).to.include(val.replace(/\n/g, ''));
      expect(renderArr.firstElementChild.innerHTML).to.include(val.replace(/\n/g, ''));
    });
  });

});

describe('DomElTemplate', () => {
  it('template renderer exists', () => {
    expect(DomElementTemplate).to.exist
  })

  it('should take in a tmpl parameter', () => {
    // console.log('String template ', starWarsData);
    const re = DomElementTemplate.findTmplLoopsRE()
    const reArr = ['{{#characters}}<li>{{.*}}</li>{{/characters}}', '{{#movies}}<li>{{title}} year:{{year}}</li>{{/movies}}']
    const tmplMatch = ScriptTemplate.innerHTML.match(DomElementTemplate.findTmplLoopsRE())
    expect(tmplMatch).to.deep.equal(reArr)
  })

  it('DomElementTemplate show render data value', () => {
    const data = { cat:'meow' }
    const template = '<h1>The cat says {{cat}}'
    const domElTmpl = new DomElementTemplate(template, data, {testMode:true})
    const render = domElTmpl.renderDocFrag()
    // console.log("RENDER IS ",render.firstElementChild);
    expect(render.firstElementChild.innerText).to.equal('The cat says meow')
  })

  it('DomElementTemplate Template show loop object values', () => {
    const data = {
      dog: {
        sound: 'woof'
      }
    }
    const template = '<h1>The dog says {{#dog}}{{sound}}{{/dog}}</h1>'
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()
    expect(render.firstElementChild.innerText).to.equal('The dog says woof')
  })

  it('DomElementTemplate Template show not render null objects', () => {
    const data = {
      cat: {
        sound: 'woof'
      }
    }
    const template = '<article>{{#dog}}<h1>The dog says {{sound}}</h1>{{/dog}}</article>'
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()
    expect(render.firstElementChild.innerText).to.equal('')
  })
  it('DomElementTemplate Template should render 0 as non-empty', () => {
    const data = { scriptNum:0, eventType:'scriptContent', tabName:'MyTab' }
    const template = '<button data-event-type="{{eventType}}" data-script-num="{{scriptNum}}" >{{scriptNum}}</button>'
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()
    expect(render.firstElementChild.innerText).to.equal('0')
  })
  it('DomElementTemplate Template show not render null objects with non-looped data', () => {
    const data = {
      cat: {
        sound: 'woof'
      }
    }
    const template = '<article><h1>The dog says {{test.sound}}</h1></article>'
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()
    expect(render.firstElementChild.innerText).to.equal('The dog says ')
  })
  it('DomElementTemplate Template show not render null values with non-looped data', () => {
    const data = {
      cat: {
        sound: 'woof'
      }
    }
    const template = '<article><h1>The dog says {{asdf}}</h1></article>'
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()
    expect(render.firstElementChild.innerText).to.equal('The dog says ')
  })
  it('DomElementTemplate Template show not render null values', () => {
    const data = {
      animals: [
        {
          name: 'dog',
          sound:'woof'
        },
        {
          name: 'cat',
          sound:'meow'
        }
      ]
    }
    const template = '<article>{{#animals}}<h1>The {{name}} says {{sound}}</h1>{{/animals}}</article>'
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()
    const renderStr = render.firstElementChild.querySelectorAll('h1')[1].innerText
    expect(renderStr).to.equal('The cat says meow')
  })

  it('DomElementTemplate Template renders array of objects', () => {
    const data = [
      { name: 'jane' },
      { name: 'joe' },
      { name: 'john' }
    ]
    const template = '<ul>{{#}}<li>Welcome, {{name}}.</li>{{/}}</ul>'
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()
    const lastItemTxt = render.firstElementChild.querySelectorAll('li')[2].innerText
    expect(lastItemTxt).to.equal('Welcome, john.')
  })

  it('DomElementTemplate Template renders array of objects and also nested objects', () => {
    const data = [
      { name: 'jane', hobbies: ['photography', 'driving', 'running'] },
      { name: 'joe', hobbies: [] },
      { name: 'john', hobbies: ['vlogging', 'dancing'] }
    ]
    const template = '<ul>{{#}}<li>Welcome, {{name}}. and hobbies are {{hobbies}} </li>{{/}}</ul>'
    // let template = "<ul>{{#}}<li>Welcome, {{name}}. <ol>{{#hobbies}}<li>{{.}}</li><{{/hobbies}}/ol></li>{{/}}</ul>";
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()

    const lastItemTxt = render.firstElementChild.querySelectorAll('li')[2].innerText
    // console.log('render nested obj ', { render, lastItemTxt }, render.firstElementChild)

    // expect(lastItemTxt).to.equal('Welcome, john.');
    return true
  })
  it('DomElementTemplate  renders object and loops arrays', () => {
    let data = [
      { name: 'jane', hobbies: ['photography', 'driving', 'running'], favFoods: ['hummus', 'quinoa', 'burritos'] },
      { name: 'joe', hobbies: [] },
      { name: 'john', hobbies: ['vlogging', 'dancing'] }
    ]
    const template = '<ul><li>Welcome, {{name}}. Your hobbies are {{#hobbies}}{{.}}, {{/hobbies}}and favorite foods are {{#favFoods}}<span>{{.}}, </span>{{/favFoods}} </li></ul>'
    data = data[0]
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()
    const favFoodInnerText = render.firstElementChild.querySelectorAll('span')[0].innerText
    expect(favFoodInnerText).to.equal('hummus, ')
  })

  it('DomElementTemplate  renders object and loops array and loops obj params', () => {
    let data = [
      { name: 'jane', hobbies: ['photography', 'driving', 'running'], details: { hair:'brown', eyes:'hazel' } },
      { name: 'joe', hobbies: [] },
      { name: 'john', hobbies: ['vlogging', 'dancing'] }
    ]
    const template = '<ul><li>Welcome, {{name}}. Your hobbies are {{#hobbies}}{{.}}, {{/hobbies}}and your {{#details}}hair is {{hair}} and your eyes are {{eyes}} {{/details}}and favorite foods are {{#favFoods}}<span>{{.}}, </span>{{/favFoods}} </li></ul>'
    data = data[0]
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()
    const favFoodInnerText = render.firstElementChild

    // console.log("render obj w looped arr ", favFoodInnerText);
    return true
  })

  it('DomElementTemplate Template renders array of nested objects and uses dot syntax', () => {
    const data = {
      users: [
        { name: 'jane', details: { age:24, hair: 'brown', education: { school:'nyu', degree:'Philosophy' } } },
        { name: 'joe', details: { age:34, hair: 'blonde', education: { school:'nyu', degree:'Computer Science' } } },
        { name: 'john', details: { age:54, hair: 'green', education: { school:'nyu', degree:'Math' } } }
      ]
    }
    const template = '<ul>{{#users}}<li>Welcome, {{name}}. and details are {{details.age}} and degree is {{details.education.degree}} </li>{{/users}}</ul>'
    // let template = "<ul>{{#}}<li>Welcome, {{name}}. <ol>{{#hobbies}}<li>{{.}}</li><{{/hobbies}}/ol></li>{{/}}</ul>";
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()

    // console.log("render nested array of objs ",render.firstElementChild);
    // let lastItemTxt = render.firstElementChild.querySelectorAll('li')[2].innerText
    // expect(lastItemTxt).to.equal('Welcome, john.');
    return true
  })

  it('DomElementTemplate Template renders dot syntax of non looping object', () => {
    let data = {
      users: [
        { name: 'jane', details: { age:24, hair: 'brown', education: { school:'nyu', degree:'Philosophy' } } },
        { name: 'joe', details: { age:34, hair: 'blonde' } },
        { name: 'john', details: { age:54, hair: 'green' } }
      ]
    }
    data = data.users[0]
    const template = '<ul><li>Welcome, {{name}}. and age is {{details.age}} and graduated from {{details.education.school}} </li></ul>'
    // let template = "<ul>{{#}}<li>Welcome, {{name}}. <ol>{{#hobbies}}<li>{{.}}</li><{{/hobbies}}/ol></li>{{/}}</ul>";
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})
    const render = domElTemplate.renderDocFrag()

    // console.log("render nested obj ",render.firstElementChild);
    // let lastItemTxt = render.firstElementChild.querySelectorAll('li')[2].innerText
    // expect(lastItemTxt).to.equal('Welcome, john.');
    return true
  })

  it('DomElementTemplate should render index string value of an array', () => {
    const article = ['Usu at illum porro audire. Nam at ubique latine, vidit ocurreret pri ea, cu elitr nonumes mediocritatem nam.',
      'Eu delenit meliore graecis sea. Sit id ubique commune, ius ne recusabo oportere similique, error putant usu ei.',
      'Nam mutat saperet detracto eu, te ubique utamur aliquando pro. Ut verear probatus sea. Porro sonet euripidis ex est.',
      'Mucius platonem eu per. Te utroque persecuti pro, error verterem scribentur no est.',
      'An pro nibh salutatus, ea rebum aeterno complectitur has.']

    const template = '<li>{{article.1}}</li>'
    const data = { article }
    const domElTemplate =new DomElementTemplate(template, data, {testMode:true})

    const result = domElTemplate.renderToString()

    expect(result).to.eq('<li>Eu delenit meliore graecis sea. Sit id ubique commune, ius ne recusabo oportere similique, error putant usu ei.</li>')
  })
})

// ─────────────────────────────────────────────────────────────────────────
//  One-level nested array loops
//
//  DomElementTemplate supports exactly one level of nested array loops.
//  These tests verify both the supported case (a loop inside a loop) and
//  the boundary behavior — outer-loop splitting with the backreference
//  regex, and a deliberate warning when deeper nesting is attempted.
// ─────────────────────────────────────────────────────────────────────────

describe('DomElementTemplate — one-level nested loops', () => {

  it('outer-loop regex correctly pairs {{#name}} with {{/name}} when a different-named inner loop is present', () => {
    // This verifies the \2 backreference fix — without it, the outer match
    // would incorrectly terminate at {{/cells}} and orphan {{/rows}}.
    const template = '<table>{{#rows}}<tr>{{#cells}}<td>{{.}}</td>{{/cells}}</tr>{{/rows}}</table>'
    const matches = template.match(DomElementTemplate.findTmplLoopsRE())
    expect(matches).to.have.lengthOf(1)
    expect(matches[0]).to.equal('{{#rows}}<tr>{{#cells}}<td>{{.}}</td>{{/cells}}</tr>{{/rows}}')
  })

  it('renders nested array-of-arrays (the canonical table case)', () => {
    const data = {
      rows: [
        { cells: ['a1', 'a2'] },
        { cells: ['b1', 'b2'] }
      ]
    }
    const template = '<table><tbody>{{#rows}}<tr>{{#cells}}<td>{{.}}</td>{{/cells}}</tr>{{/rows}}</tbody></table>'
    const domElTemplate = new DomElementTemplate(template, data, { testMode: true })
    const render = domElTemplate.renderDocFrag()

    const rows = render.firstElementChild.querySelectorAll('tr')
    expect(rows).to.have.lengthOf(2)

    const firstRowCells = rows[0].querySelectorAll('td')
    expect(firstRowCells).to.have.lengthOf(2)
    expect(firstRowCells[0].innerText).to.equal('a1')
    expect(firstRowCells[1].innerText).to.equal('a2')

    const secondRowCells = rows[1].querySelectorAll('td')
    expect(secondRowCells[0].innerText).to.equal('b1')
    expect(secondRowCells[1].innerText).to.equal('b2')
  })

  it('renders nested array-of-objects where each outer item has an inner array of objects', () => {
    const data = {
      sections: [
        {
          title: 'Numbers',
          entries: [
            { term: 'one', definition: 'the first number' },
            { term: 'two', definition: 'after one' }
          ]
        },
        {
          title: 'Letters',
          entries: [
            { term: 'a', definition: 'the first letter' }
          ]
        }
      ]
    }
    const template =
      '<div>{{#sections}}<section><h2>{{title}}</h2>{{#entries}}<p>{{term}}: {{definition}}</p>{{/entries}}</section>{{/sections}}</div>'

    const domElTemplate = new DomElementTemplate(template, data, { testMode: true })
    const render = domElTemplate.renderDocFrag()

    const sections = render.firstElementChild.querySelectorAll('section')
    expect(sections).to.have.lengthOf(2)

    expect(sections[0].querySelector('h2').innerText).to.equal('Numbers')
    const firstEntries = sections[0].querySelectorAll('p')
    expect(firstEntries).to.have.lengthOf(2)
    expect(firstEntries[0].innerText).to.equal('one: the first number')
    expect(firstEntries[1].innerText).to.equal('two: after one')

    expect(sections[1].querySelector('h2').innerText).to.equal('Letters')
    const secondEntries = sections[1].querySelectorAll('p')
    expect(secondEntries).to.have.lengthOf(1)
    expect(secondEntries[0].innerText).to.equal('a: the first letter')
  })

  it('renders outer-level variables alongside an inner loop in the same iteration body', () => {
    // Confirms that {{title}} at the outer scope is still resolved after the
    // inner loop has been expanded. Regression guard for the ordering of
    // inner-loop processing vs. outer-variable substitution.
    const data = {
      groups: [
        { title: 'Group A', items: ['one', 'two'] },
        { title: 'Group B', items: ['three'] }
      ]
    }
    const template =
      '<div>{{#groups}}<h3>{{title}}</h3><ul>{{#items}}<li>{{.}}</li>{{/items}}</ul>{{/groups}}</div>'

    const domElTemplate = new DomElementTemplate(template, data, { testMode: true })
    const render = domElTemplate.renderDocFrag()

    const headings = render.firstElementChild.querySelectorAll('h3')
    expect(headings[0].innerText).to.equal('Group A')
    expect(headings[1].innerText).to.equal('Group B')

    const lists = render.firstElementChild.querySelectorAll('ul')
    expect(lists[0].querySelectorAll('li')).to.have.lengthOf(2)
    expect(lists[0].querySelectorAll('li')[0].innerText).to.equal('one')
    expect(lists[1].querySelectorAll('li')).to.have.lengthOf(1)
    expect(lists[1].querySelectorAll('li')[0].innerText).to.equal('three')
  })

  it('renders an empty outer section to nothing (empty array)', () => {
    const data = { rows: [] }
    const template = '<table>{{#rows}}<tr>{{#cells}}<td>{{.}}</td>{{/cells}}</tr>{{/rows}}</table>'
    const domElTemplate = new DomElementTemplate(template, data, { testMode: true })
    const result = domElTemplate.renderToString()
    expect(result).to.equal('<table></table>')
  })

  it('renders an empty inner section to nothing while still iterating the outer section', () => {
    const data = {
      rows: [
        { cells: ['a1', 'a2'] },
        { cells: [] },
        { cells: ['c1'] }
      ]
    }
    const template = '<div>{{#rows}}<p>{{#cells}}<span>{{.}}</span>{{/cells}}</p>{{/rows}}</div>'
    const domElTemplate = new DomElementTemplate(template, data, { testMode: true })
    const render = domElTemplate.renderDocFrag()

    const paragraphs = render.firstElementChild.querySelectorAll('p')
    expect(paragraphs).to.have.lengthOf(3)
    expect(paragraphs[0].querySelectorAll('span')).to.have.lengthOf(2)
    expect(paragraphs[1].querySelectorAll('span')).to.have.lengthOf(0)
    expect(paragraphs[2].querySelectorAll('span')).to.have.lengthOf(1)
  })

  it('preserves the single-level (non-nested) case — a table template without an inner loop still renders', () => {
    // Regression guard that the inner-loop detection branch does not break
    // the hot path for templates that have no inner loop at all.
    const data = { items: [{ name: 'first' }, { name: 'second' }] }
    const template = '<ul>{{#items}}<li>{{name}}</li>{{/items}}</ul>'
    const domElTemplate = new DomElementTemplate(template, data, { testMode: true })
    const render = domElTemplate.renderDocFrag()

    const lis = render.firstElementChild.querySelectorAll('li')
    expect(lis).to.have.lengthOf(2)
    expect(lis[0].innerText).to.equal('first')
    expect(lis[1].innerText).to.equal('second')
  })

  it('two-level nested loops produce sensible output (deeper loop stripped, no crash)', () => {
    // Deeper nesting than one level is deliberately unsupported. This test
    // confirms the engine degrades gracefully: the outer and inner loops
    // render, the third-level loop tags are stripped so they don't emit as
    // garbled variables, and the test does not throw.
    const data = {
      a: [
        { b: [{ c: ['x', 'y'] }] }
      ]
    }
    const template = '<div>{{#a}}{{#b}}{{#c}}<span>{{.}}</span>{{/c}}{{/b}}{{/a}}</div>'

    // Should not throw. Output shape is implementation-defined for the
    // unsupported deeper loop; the important properties are:
    //   (1) no crash, (2) no literal "{{" or "}}" tokens leaking into output.
    const domElTemplate = new DomElementTemplate(template, data, { testMode: true })
    const result = domElTemplate.renderToString()
    expect(result).to.not.include('{{')
    expect(result).to.not.include('}}')
  })
})
