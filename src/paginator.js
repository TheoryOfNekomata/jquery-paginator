(function () {
    var componentClass = 'paginator-component',
        unpaginatedClass = 'paginator-unpaginated',
        modelClass = 'model',
        viewClass = 'view',
        watchClass = 'watch',
        pageClass = 'page',
        pageBlockClass = 'page-block',
        pageAddedClass = 'page-added',
        pageDeletedClass = 'page-deleted',
        contentClass = 'content',
        headerClass = 'header',
        footerClass = 'footer',
        marginClass = 'margin',
        parentDataAttrName = 'parent',
        terminalClass = '-terminal',
        blockParentClass = 'block-parent',
        orderDataAttrName = 'data-order';

    // http://stackoverflow.com/questions/7051897/how-can-i-select-the-shallowest-matching-descendant
    jQuery.fn.findShallow = function(sel) {
        return (function findShallow(root, sel) {
            var children = root.children();
            if (children.length) {
                var matching = children.filter(sel);
                if (matching.length) {
                    return matching.first();
                }
                return findShallow(children, sel);
            }
            return $();
        })(this, sel);
    };

    // http://james.padolsey.com/snippets/sorting-elements-with-jquery/
    jQuery.fn.sortElements = (function () {
        var sort = [].sort;

        return function (comparator, getSortable) {

            getSortable = getSortable || function () { return this; };

            var placements = this.map(function () {

                var sortElement = getSortable.call(this),
                    parentNode = sortElement.parentNode,

                // Since the element itself will change position, we have
                // to have some way of storing its original position in
                // the DOM. The easiest way is to have a 'flag' node:
                    nextSibling = parentNode.insertBefore(
                        document.createTextNode(''),
                        sortElement.nextSibling
                    );

                return function () {

                    if (parentNode === this) {
                        throw new Error(
                            "You can't sort elements if any one is a descendant of another."
                        );
                    }

                    // Insert before flag:
                    parentNode.insertBefore(this, nextSibling);
                    // Remove flag:
                    parentNode.removeChild(nextSibling);

                };

            });

            return sort.call(this, comparator).each(function (i) {
                placements[i].call(getSortable.call(this));
            });

        };

    })();

    /**
     * Converts a class string to a CSS selector.
     * @param {string} classString The class string.
     * @returns {string} The selector string.
     */
    function toClassSelector(classString) {
        return '.' + classString.split(' ').filter(function (string) { return string.trim().length > 0 }).join('.');
    }

    /**
     * Class for the options for the paginator.
     * @param {object} rawOpts The raw options data.
     * @constructor
     */
    function PaginatorOptions(rawOpts) {
        return rawOpts;
    }

    /**
     * Class for the container of contents on a page.
     * @param {string} klass The class name of the main HTML element generated by the component.
     * @param {PaginatorOptions} opts The options of the paginator.
     * @constructor
     */
    function PaginatorPageContent(klass, opts) {
        var self = this,
            page;

        /**
         * Creates the elements of the component.
         */
        function createElement() {
            self.$el = self.$el || $('<div>').addClass(klass);
            self.$margin = self.$margin = $('<div>').addClass(marginClass);

            self.$el.append(self.$margin);
        }

        /**
         * Appends a content to this component.
         * @param {jQuery} $el The element to append.
         */
        self.append = function append($el) {
            self.$margin.append($el);
        };

        /**
         *
         */
        self.clear = function clear() {
            self.$margin.html('');
        };

        /**
         * Mounts this component to a parent component.
         * @param {object} parent The parent component.
         */
        self.mountTo = function mountTo(parent) {
            if (page === parent) {
                return;
            }

            page = parent;
            page.$el.append(self.$el);
        };

        /**
         * Gets the content blocks of this component.
         * @returns {jQuery} The content blocks of this component.
         */
        self.getBlocks = function getBlocks() {
            return self.$margin.children();
        };

        createElement();
    }

    /**
     * Class for the page that is to be rendered in the paginator.
     * @param {PaginatorOptions} opts The options of the paginator.
     * @constructor
     */
    function PaginatorPage(opts) {
        var self = this,
            paginator;

        self.header = new PaginatorPageContent(headerClass, opts);
        self.content = new PaginatorPageContent(contentClass, opts);
        self.footer = new PaginatorPageContent(footerClass, opts);

        /**
         * Creates the elements of the component.
         */
        function createElement() {
            self.$el = self.$el || $('<div>').addClass(pageClass);
            self.$el
                .append(self.header.$el)
                .append(self.content.$el)
                .append(self.footer.$el);
        }

        /**
         * Gets the content height of the page.
         * @returns {number} The content height of the page.
         */
        function getContentHeight() {
            var $header = self.header.$el,
                $footer = self.footer.$el,
                $margin = self.content.$margin,
                topHeight = Math.max($header.length > 0 ? $header.height() : 0, parseInt($margin.css('margin-top'))),
                bottomHeight = Math.max($footer.length > 0 ? $footer.height() : 0, parseInt($margin.css('margin-bottom')));

            return self.$el.height() - topHeight - bottomHeight;
        }

        function getPageIndex() {
            var pageIndex = -1;

            paginator.pages.forEach(function (page, i) {
                if (page !== self) {
                    return;
                }

                pageIndex = i;
            });

            return pageIndex;
        }

        /**
         * Gets the lower boundary of the page.
         * @returns {number} The lower boundary of the page.
         */
        function getContentLowerBoundary() {
            var $header = self.header.$el,
                $margin = self.content.$margin,
                topHeight = Math.max($header.length > 0 ? $header.height() : 0, parseInt($margin.css('margin-top')));
            return topHeight + getContentHeight();
        }

        /**
         * Determines if the page has elements that can trigger page breaks.
         * @returns {boolean}
         */
        self.hasBreaks = function hasBreaks() {
            return self.getOverflowBlocks().length > 0;
        };

        self.isBlank = function isBlank() {
            return self.content.$margin.children().length < 1;
        };

        /**
         * Gets the elements that overflow the content area of the page.
         * @returns {jQuery} The elements.
         */
        self.getOverflowBlocks = function getOverflowBlocks() {
            return self.content.getBlocks()
                .filter(function () {
                    var $block = $(this),
                        position = $block.position().top,
                        height = $block.height();

                    return position + height > getContentLowerBoundary();
                });
        };

        self.unmount = function unmount() {
            self.$el.remove();
        };

        /**
         * Mounts the component to a parent.
         * @param {object} parent The component
         */
        self.mountTo = function mountTo(parent) {
            if (paginator === parent) {
                return;
            }

            paginator = parent;
            paginator.view.$el.append(self.$el);
        };

        createElement();
    }

    /**
     * Class for the renderer of the paginator.
     * @param {PaginatorOptions} opts
     * @constructor
     */
    function PaginatorRenderer(opts) {
        var self = this,
            model,
            view,
            paginator,
            firstPage = new PaginatorPage(opts),
            isRendering = false;

        /**
         * Writes the appropriate headers and the footers of the page.
         */
        function writePageComponents() {
            paginator.pages.forEach(function (page, i) {
                writeToBlockContainer(headerClass, page, i);
                writeToBlockContainer(footerClass, page, i);
            });
        }

        /**
         * Writes the content of the page.
         */
        function writeToBlockContainer(klass, page, i) {
            var blockContainerIndex = model.getIndexForPage(klass, i),
                blocks,
                isClone = false;

            // TODO refactor this part of the code.

            if (blockContainerIndex < 0) {
                switch (klass) {
                    case headerClass:
                        page.header.clear();
                        return;
                    case footerClass:
                        page.footer.clear();
                        return;
                    default:
                        break;
                }
                return;
            }

            switch (klass) {
                case footerClass:
                    page.footer.clear();
                    blocks = model.getBlocks(klass)(blockContainerIndex);
                    isClone = true;
                    break;
                case headerClass:
                    page.header.clear();
                    blocks = model.getBlocks(klass)(blockContainerIndex);
                    isClone = true;
                    break;
                default:
                    blocks = model.getBlocks(klass);
                    break;
            }

            blocks
                .each(function () {
                    var $block = $(this),
                        $renderedBlock = $block;

                    if (isClone) {
                        $renderedBlock = $block.clone(true, true);
                    }

                    if ($block.parents(toClassSelector(pageDeletedClass)).length > 0) {
                        return;
                    }

                    $blockParent = $block.parent();

                    $blockParent
                        .addClass(blockParentClass)
                        .attr(orderDataAttrName, 0);

                    $renderedBlock
                        .data(parentDataAttrName, $blockParent)
                        .removeClass(pageBlockClass)
                        .addClass(pageAddedClass);

                    switch (klass) {
                        case headerClass:
                            page.header.append($renderedBlock);
                            return;
                        case footerClass:
                            page.footer.append($renderedBlock);
                            return;
                        default:
                            break;
                    }

                    firstPage.content.append($renderedBlock);
                });

            switch (klass) {
                case headerClass:
                    page.content.$margin.css('margin-top', page.$el.find(toClassSelector(klass)).height());
                    break;
                case footerClass:
                    page.content.$margin.css('margin-bottom', page.$el.find(toClassSelector(klass)).height());
                    break;
                default:
                    break;
            }
        }

        /**
         * Sets the ordering of each block rendered in the view.
         */
        function setOrder() {
            model.$el
                .find(toClassSelector(blockParentClass))
                .each(function (i) {
                    $(this).attr(orderDataAttrName, i);
                });

            view.getBlocks('content')
                .each(function () {
                    var $block = $(this),
                        $blockParent = $block.data(parentDataAttrName);

                    $block.attr(orderDataAttrName, $blockParent.attr(orderDataAttrName));
                });
        }

        /**
         * Checks the view for deleted blocks and performs the appropriate actions.
         */
        function checkDeletedBlocks() {
            view
                .getBlocks('content')
                .each(function () {
                    var $block = $(this),
                        $blockParent,
                        isParentDeleted;

                    $blockParent = $block.data(parentDataAttrName);

                    isParentDeleted = !$blockParent ||
                            $blockParent.hasClass(pageDeletedClass) ||
                            $blockParent.parents(toClassSelector(pageDeletedClass)).length > 0 ||
                            !$blockParent.parents().is('body');

                    if (!isParentDeleted) {
                        return;
                    }

                    $block.remove();
                });
        }

        /**
         * Inserts a page for new content.
         * @param {{blocks:jQuery,pageIndex:number}} content The content.
         */
        function insertPageForContent(content) {
            var newPage = new PaginatorPage(opts);

            content.blocks.each(function () {
                newPage.content.append($(this));
            });

            paginator.pages.slice(content.pageIndex + 1).forEach(function (page) {
                newPage.content.append(page.content.getBlocks());
            });

            view.addPage(newPage);
        }

        /**
         * Gets the content of the first page that has a break.
         * @returns {{blocks:jQuery,pageIndex:number}} The content to insert.
         */
        function getFirstPageWithBreak() {
            var pageToBreak = null;

            paginator.pages.forEach(function (page, i) {
                if (!page.hasBreaks() || pageToBreak !== null) {
                    return;
                }

                // Get the first page to have page breaks.
                pageToBreak = {
                    pageIndex: i,
                    blocks: page.getOverflowBlocks()
                };
            });

            return pageToBreak;
        }

        /**
         * Performs page breaks among the view's pages.
         * @returns {boolean} A value that determines if the renderer performed page breaks, which is used to repeat this method.
         */
        function performPageBreaks() {
            var pageToBreak = getFirstPageWithBreak();

            if (pageToBreak === null) {
                return false;
            }

            insertPageForContent(pageToBreak);
            return true;
        }

        function removeBlankPages() {
            var pagesToDelete = [];

            paginator.pages.forEach(function (page, i) {
                if (!page.isBlank()) {
                    return;
                }
                pagesToDelete.push(i);
            });

            pagesToDelete
                .reverse()
                .forEach(function (pageNumber) {
                    if (paginator.pages.length < 2) {
                        return;
                    }
                    paginator.pages[pageNumber].unmount();
                    paginator.pages.splice(pageNumber, 1);
                });
        }

        function orderContent() {
            view
                .$el
                .find('.content')
                .find('.margin')
                .children()
                .sortElements(function (block1, block2) {
                    var order1 = parseInt($(block1).attr(orderDataAttrName)),
                        order2 = parseInt($(block2).attr(orderDataAttrName));

                    return order1 - order2;
                });
        }

        /**
         * Renders the content.
         */
        self.render = function render() {
            paginator.detachObserver();
            if (paginator.pages.length < 1) {
                view.addPage(firstPage);
            }

            var hasPerformedPageBreaks;
            checkDeletedBlocks();
            // TODO implement hard page/section breaks
            // section breaks are what reset the header indexing, etc.
            // TODO move elements when extra space has been found on previous pages.
            writeToBlockContainer(contentClass);
            setOrder();
            do {
                hasPerformedPageBreaks = performPageBreaks();
                writePageComponents();
            } while (hasPerformedPageBreaks);
            removeBlankPages();
            do {
                hasPerformedPageBreaks = performPageBreaks();
                writePageComponents();
            } while (hasPerformedPageBreaks);

            setTimeout(function () {
                isRendering = false;
            });
            paginator.observeModel();
        };

        /**
         *
         * @param parent
         */
        self.mountTo = function mountTo(parent) {
            paginator = parent;
            model = paginator.model;
            view = paginator.view;
        };
    }

    /**
     * Class for the model of the paginator.
     * @param {PaginatorOptions} opts The options of the paginator.
     * @constructor
     */
    function PaginatorModel(opts) {
        var self = this,
            paginator;

        /**
         *
         */
        function createElement() {
            self.$el = self.$el || $('<div>').addClass(modelClass);
            if (!!self.$watch) {
                return;
            }
            self.$watch = self.$watch || $('<div>').addClass(watchClass);
            self.$el.append(self.$watch);
        }

        /**
         *
         * @param klass
         * @param isTerminal
         * @returns {*}
         */
        function getBlockContainers(klass, isTerminal) {
            return self.$watch.find(toClassSelector(!!isTerminal ? klass + ' ' + terminalClass : klass));
        }

        /**
         *
         * @param klass
         * @returns {*}
         */
        function getCount(klass) {
            return getBlockContainers(klass).length;
        }

        /**
         *
         * @param klass
         * @param pageNumber
         * @returns {number|*}
         */
        function getIndexForTerminalBlockContainer(klass, pageNumber) {
            var i,
                count = getCount(klass),
                index = -1,
                pageCount = paginator.view.getPageCount(),
                lastIndex = pageCount - 1,
                $blocks = getBlockContainers(klass);

            if (count === 1) {
                switch (klass) {
                    case headerClass:
                        return pageNumber === 0 ? 0 : -1;
                    case footerClass:
                        return pageNumber === lastIndex ? 0 : -1;
                    default:
                        break;
                }
            }

            i = 0;
            do {
                index = (index + 1) % count;
                if (pageNumber === 0 && klass === headerClass ||
                    pageNumber === lastIndex && klass === footerClass) {
                    $blocks.each(function (k) {
                        if (!$(this).hasClass(terminalClass)) {
                            return;
                        }
                        index = k;
                    });
                    return index;
                }

                if ($blocks.eq(index).hasClass(terminalClass)) {
                    index++;
                }

                i++;
            } while (i < pageNumber);

            return index;
        }

        /**
         *
         * @param klass
         * @returns {boolean}
         */
        self.hasTerminalBlockContainer = function hasTerminalBlockContainer(klass) {
            return getBlockContainers(klass, true).length > 0;
        };

        /**
         *
         * @param klass
         * @param pageNumber
         * @returns {*}
         */
        self.getIndexForPage = function getIndexForPage(klass, pageNumber) {
            if (!self.hasTerminalBlockContainer(klass)) {
                return pageNumber % getCount(klass);
            }

            return getIndexForTerminalBlockContainer(klass, pageNumber);
        };

        /**
         *
         * @param klass
         * @returns {*}
         */
        self.getBlocks = function getBlocks(klass) {
            switch (klass) {
                case headerClass:
                case footerClass:
                    return function (i) {
                        var $blockContainer = getBlockContainers(klass).eq(i),

                            isTerminal = $blockContainer.hasClass(terminalClass),
                            $blocks = $blockContainer.find(toClassSelector(pageBlockClass));

                        return isTerminal ?
                            $blocks.addClass(terminalClass) :
                            $blocks.removeClass(terminalClass);
                    };
                default:
                    break;
            }

            return getBlockContainers(klass).find(toClassSelector(pageBlockClass));
        };

        /**
         *
         * @param klass
         * @returns {*|{}}
         */
        self.getOrderedBlocks = function getOrderedBlocks(klass) {
            return getBlockContainers(klass).find('[' + orderDataAttrName + ']');
        };

        /**
         *
         * @param parent
         */
        self.mountTo = function mountTo(parent) {
            if (paginator === parent) {
                return;
            }

            paginator = parent;
            paginator.$el.append(self.$el);
        };

        createElement();
    }

    /**
     * Class for the view of the paginator.
     * @param {PaginatorOptions} opts The options of the paginator.
     * @constructor
     */
    function PaginatorView(opts) {
        var self = this;

        self.paginator = null;

        /**
         *
         */
        function createElement() {
            self.$el = self.$el || $('<div>').addClass(viewClass);
        }

        /**
         *
         * @param page
         * @param i
         */
        function addToPageList(page, i) {
            if (isNaN(i) || i === null) {
                self.paginator.pages.push(page);
                return;
            }

            self.paginator.pages.splice(i, 0, page);
        }

        /**
         *
         * @returns {Number}
         */
        self.getPageCount = function getPageCount() {
            return self.paginator.pages.length;
        };

        /**
         *
         * @param klass
         * @returns {XMLList}
         */
        self.getBlocks = function getBlocks(klass) {
            return self.$el
                .find(toClassSelector(klass))
                .children(toClassSelector(marginClass))
                .children();
        };

        /**
         *
         * @param page
         * @param i
         * @returns {*}
         */
        self.addPage = function addPage(page, i) {
            addToPageList(page, i);
            page.mountTo(self.paginator);
            return page;
        };

        /**
         *
         * @param parent
         */
        self.mountTo = function mountTo(parent) {
            self.paginator = parent;
            self.paginator.$el.append(self.$el);
        };

        createElement();
    }

    /**
     * Class for the paginator.
     * @param {object} opts The options of the paginator.
     * @constructor
     */
    function Paginator(opts) {
        var self = this,
            modelObserver = new MutationObserver(commitMutations),
            pub,
            isObserving = false;

        opts = new PaginatorOptions(opts);

        /**
         *
         * @type {PaginatorModel}
         */
        self.model = new PaginatorModel(opts);

        /**
         *
         * @type {PaginatorView}
         */
        self.view = new PaginatorView(opts);

        /**
         *
         * @type {PaginatorRenderer}
         */
        self.renderer = new PaginatorRenderer(opts);

        /**
         *
         * @type {Array}
         */
        self.pages = self.pages || [];

        /**
         *
         */
        function render() {
            self.renderer.render();
        }

        function commitMutations() {
            render();
        }

        /**
         *
         * @param $el
         */
        function bindToElement($el) {
            if (!!self.$el) {
                self.$el.removeClass(componentClass);
            }
            self.$el = $el;
            if (self.$el.hasClass(componentClass)) {
                return;
            }
            self.$el
                .addClass(componentClass)
                .removeClass(unpaginatedClass);
        }

        /**
         *
         */
        function createModel() {
            var $modelChildren;

            self.model.mountTo(self);

            $modelChildren = self
                .$el
                .find(
                //.findShallow(
                    [
                        toClassSelector(headerClass),
                        toClassSelector(contentClass),
                        toClassSelector(footerClass)
                    ]
                        .join(',')
                );

            self.model.$watch.append($modelChildren);
        }

        /**
         *
         */
        function createView() {
            self.view.mountTo(self);
        }

        /**
         *
         */
        function createRenderer() {
            self.renderer.mountTo(self);
        }

        /**
         *
         */
        self.detachObserver = function detachObserver() {
            modelObserver.disconnect();
        };

        /**
         *
         */
        self.observeModel = function observeModel() {
            modelObserver
                .observe(self.model.$watch[0], {
                    childList: true,
                    attributes: true,
                    characterData: true,
                    subtree: true
                });
            isObserving = true;
        };

        pub = {
            observe: function doObserve() {
                if (!isObserving) {
                    return;
                }
                self.observeModel();
            },
            refresh: function doRender() {
                render();
            }
        };

        /**
         *
         * @param $el
         */
        self.bindTo = function bindTo($el) {
            bindToElement($el);
            createModel();
            createView();
            createRenderer();
            self.observeModel();
            $el.data('paginator', pub);
            return pub;
        };
    }

    $.fn.paginate = function paginate(opts) {
        return new Paginator(opts).bindTo(this);
    };
})();
