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
It is not recommended that you change the sizes of other elements.
However, you may change aesthetic styles such as fonts, page edge
borders etc.

## License
Apache 2.0. See LICENSE file for details.
