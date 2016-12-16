# jquery-paginator

Splits elements into pages.

## Installation

NPM:

    $ npm install --save @theoryofnekomata/jquery-paginator
    
Bower

    $ bower install --save jquery-paginator
    
## Usage

HTML:
```html
<!-- ...some markup... -->
<div id="#element"></div>
<!-- ...more markup here... -->
```

CSS:
```css
/* just set margins to have metric units, with headers/footers having
 * tighter margins */

.paginator .header > .margin {
  margin: 1cm 1.5cm;
}

.paginator .footer > .margin {
  margin: 1cm 1.5cm;
}

.paginator .content > .margin {
  margin: 2cm;
}

/* set page size to A4 */

.paginator .page {
  width: 210mm;
  height: 297mm;
}
```

JavaScript:
```javascript
var $el = jQuery('#element');
$el.paginate();
$el
    .children('.model')
    .children('.content')
    .append('Very long text here');
```

## Notes
Please look at `src/style.css` for certain CSS rules that are allowed to
be overridden with.

There are certain classes that control the rendering of the pages:

- `.page-break` performs a forced page break. The page break only applies as a break to the next page. It does not support breaks to odd/even pages yet.
- `.page-block` specifies that an element can trigger page breaks. Make sure to put this on non-positioned elements. It is recommended that you put this on block elements.

## License
Apache 2.0. See LICENSE file for details.
