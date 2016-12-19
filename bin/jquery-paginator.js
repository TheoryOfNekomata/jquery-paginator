(function () {
    // Just expose the namespace to the global object.
    window.Paginator = {};
})();

(function () {
    Paginator.ComponentSettings = function Settings(opts) {
        var settings;

        settings = {
            padding: opts.padding,
            paperGap: opts.paperGap
        };

        return settings;
    };
})();

(function () {
    /**
     * Class for the paginator settings.
     * @param {Object} opts The settings hash
     * @returns {Object} The normalized paginator settings.
     * @constructor
     */
    Paginator.Settings = function Settings(opts) {
        var settings;

        settings = {
            //page: new Paginator.PageSettings(opts),
            component: new Paginator.ComponentSettings(opts)
        };

        return settings;
    };
})();

(function () {
    /**
     * Class for the paginator's renderer, the component in charge of displaying
     * elements from the model to the view without losing data, as well as preserving
     * their bound data and events.
     * @param {Paginator.Component} $paginator The paginator.
     * @constructor
     */
    Paginator.Renderer = function Renderer($paginator) {
        var $pages = [];

        /**
         * Determines if an element can trigger page breaks.
         * This is the criteria for determining which elements should appear on pages.
         * @param {jQuery} $el The element.
         * @returns {boolean} Is the element able to trigger page breaks?
         */
        function isPageBreakingElement($el) {
            return $el.hasClass('page-block') || $el.hasClass('page-break');
        }

        /**
         * Gets a value indicating if an element has block children (excluding itself).
         * @param {jQuery} $el The element.
         * @returns {boolean} Does the element have block children?
         */
        function hasPageBreakingChildren($el) {
            var hasKidz = false,
                $kidz = $el.children();

            /**
             * Checks if an element or its descendants are block elements.
             * @param {jQuery} $kiddo The element.
             * @param {boolean} isBloke Is itself or its children blocks?
             * @returns {boolean} Is the element or its children blocks?
             */
            function isPageBreakingParent($kiddo, isBloke) {
                var $children = $kiddo.children();

                if ($children.length < 1) {
                    return false;
                }

                $children
                    .each(function () {
                        var $kiddo = $(this);

                        isBloke = isPageBreakingElement($kiddo) || isPageBreakingParent($kiddo, isBloke);
                    });

                return isBloke;
            }

            if ($kidz.length < 1) {
                return false;
            }

            $kidz
                .each(function () {
                    var $kiddo = $(this);

                    hasKidz = isPageBreakingElement($kiddo) || isPageBreakingParent($kiddo, hasKidz);
                });

            return hasKidz;
        }

        /**
         * Appends the page-breaking children of an element to the view on its corresponding page.
         * @param {jQuery} $parent The parent element.
         * @see moveToModel
         */
        function print($parent) {
            var parents = [],
                pageBreakingChildren = [];

            /**
             * Extracts the innermost page-breaking elements.
             * @param {jQuery} $child The element.
             */
            function extractPageBreakingChildren($child) {
                var $children = $child.children(),
                    $parent;

                if (!hasPageBreakingChildren($child) && isPageBreakingElement($child)) {
                    // Here is where the appending happens.
                    // We need to get the parent so we can put back the element to the model
                    // because the data/events are still there (.clone() is expensive).
                    $parent = $child.parent();
                    $child.data('modelParent', $parent);

                    if (parents.indexOf($parent[0]) < 0) {
                        parents.push($parent[0]);
                    }

                    setTimeout(function () {
                        pageBreakingChildren.push($child);
                    });
                    return;
                }

                // Look into its descendants for page breaking elements.
                $children
                    .each(function () {
                        var $child = $(this);
                        extractPageBreakingChildren($child);
                    });
            }

            /**
             * Prints the page-breaking children.
             */
            function doPrintPageBreakingChildren() {
                pageBreakingChildren.forEach(function ($child, i) {
                    $child.attr('data-order', i);
                    if (!$pages[ $paginator._lastPageNumber ]) {
                        // Insert paper into the tray :P
                        $pages[ $paginator._lastPageNumber ] = new Paginator.Page($paginator, $paginator._lastPageNumber);
                        $paginator.$$view.append($pages[ $paginator._lastPageNumber ]);
                    }

                    // Print the element to the paper
                    $pages[ $paginator._lastPageNumber ].$margin.append($child);

                    $child.insertBefore($paginator.$$view.find('[data-order=' + (i + 1) + ']'));

                    if ($child.hasClass('page-break') ||
                        $pages[ $paginator._lastPageNumber ].needsBreaking()) {
                        // Perform the page break when the page content goes larger than the content area
                        // or when a page break element is encountered.
                        $paginator._lastPageNumber++;
                        if (!$pages[ $paginator._lastPageNumber ]) {
                            $pages[ $paginator._lastPageNumber ] = new Paginator.Page($paginator, $paginator._lastPageNumber);
                            $paginator.$$view.append($pages[ $paginator._lastPageNumber ]);
                        }
                        $pages[ $paginator._lastPageNumber ] = $pages[ $paginator._lastPageNumber ] || new Paginator.Page($paginator, $paginator._lastPageNumber);
                        $pages[ $paginator._lastPageNumber ].$margin.append($child);
                    }
                });
            }

            extractPageBreakingChildren($parent);
            setTimeout(function () {
                doPrintPageBreakingChildren();
            });
        }

        /**
         * Moves the element to its corresponding parent.
         * @param {jQuery} $element The element from the view.
         */
        function moveToModel($element) {
            var ignoreList = [
                    '[data-ng-repeat]'
                ],
                isIgnored = ignoreList.reduce(function (isIgnored, sel) {
                    return isIgnored || $element.is(sel);
                }, false);

            if (isIgnored) {
                return;
            }

            $element.data('modelParent').appendChild($element);
        }

        /**
         * Moves all the elements from the view to the model.
         */
        function resetModel() {
            var $viewEl = $paginator.$$view.find('.page')
                .find('.content')
                .children()
                .children();

            $viewEl.each(function () {
                moveToModel($(this));
            });
        }

        /**
         * Resets the pagination of the view.
         */
        function resetPages() {
            $paginator._lastPageNumber = 0;
            $pages.forEach(function ($page) {
                $page.find('.content').children().children().each(function () {
                    var $modelParent = $(this).data('modelParent');

                    if (!!$modelParent && $modelParent.hasClass('page-deleted')) {
                        $(this).remove();
                    }
                });
                $page.removeAttr('hidden');
            });
        }

        /**
         * Set the visibility of the pages. This is to determine
         * if pages have content to be displayed in the viewport.
         */
        function setPagesVisibility() {
            $pages.forEach(function ($page) {
                if ($page.data('pageNumber') < 1 || !$page.isBlank()) {
                    return;
                }
                $page.attr('hidden', 'hidden');
            });
        }

        /**
         * Renders the elements from the paginator's model.
         */
        this.render = function render() {
            // Lock the paginator
            //
            // TODO queue writes?
            $paginator.data('isRendering', true);
            resetPages();
            setTimeout(function () {
                $paginator.$$model.children('.content').children().each(function () {
                    print($(this));
                });
                setTimeout(function () {
                    setPagesVisibility();
                    // Unlock it
                    $paginator.data('isRendering', false);
                });
            });
        };
    };
})();

(function () {
    /**
     * Class for the paginator's page.
     * @param {Paginator.Component} $paginator The paginator.
     * @param {number} pageNumber The page number.
     * @returns {jQuery} The page element.
     * @constructor
     */
    Paginator.Page = function Page($paginator, pageNumber) {
        var $page, settings;

        settings = $paginator.data('settings');

        $page = $('<div>');
        $page.$content = $('<div>');
        $page.$margin = $('<div>');

        /**
         * Gets the height of the page that can allow content.
         * @returns {number} The content height of the page.
         */
        $page.getContentHeight = function getContentHeight() {
            var $header = this.find('.header'),
                $footer = this.find('.footer'),
                topHeight = Math.max($header.length > 0 ? $header.height() : 0, parseInt(this.$margin.css('margin-top'))),
                bottomHeight = Math.max($footer.length > 0 ? $footer.height() : 0, parseInt(this.$margin.css('margin-top')));

            return this.height() - topHeight - bottomHeight;
        };

        /**
         * Determines if this page needs a break :)
         * @returns {boolean} Will the page take a break?
         */
        $page.needsBreaking = function needsBreaking() {
            return this.$content.height() > this.getContentHeight();
        };

        /**
         * Appends the header depending on the conditions in the paginator options.
         */
        $page.conditionallyAppendHeader = function conditionallyAppendHeader() {
            var $header;

            $header = $paginator.$$model.find('.header');

            if ($header.length > 0) {
                $header = $header.eq($header.length > 1 ? (($paginator._lastPageNumber) % $header.length) : 0).clone(true, true);

                if ($header.hasClass('terminal') && $paginator._lastPageNumber !== 1) {
                    return;
                }

                $header.children().wrapAll('<div class="margin">');

                this.append($header);
                setTimeout(function () {
                    $page.$content.css('margin-top', $header.height());
                });
            }
        };

        /**
         * Appends the footer depending on the conditions in the paginator options.
         */
        $page.conditionallyAppendFooter = function conditionallyAppendFooter() {
            var $footer;

            $footer = $paginator.$$model.find('.footer');

            if ($footer.length > 0) {
                $footer = $footer.eq($footer.length > 1 ? (($paginator._lastPageNumber) % $footer.length) : 0).clone(true, true);

                if ($footer.hasClass('terminal') && $paginator._lastPageNumber !== 1) {
                    return;
                }

                $footer.children().wrapAll('<div class="margin">');

                this.append($footer);
                setTimeout(function () {
                    $page.$content.css('margin-bottom', $footer.height());
                });
            }
        };

        /**
         * Determines if the page is blank
         * @returns {boolean} Is the page blank?
         */
        $page.isBlank = function isBlank() {
            return this.$margin.children().length < 1;
        };

        //
        // Set up the pages.
        //

        $page.data('pageNumber', pageNumber);
        $page.addClass('page');
        $page.$content.addClass('content');
        $page.$margin.addClass('margin');
        $page.$content.append($page.$margin);

        $page.conditionallyAppendHeader($paginator);
        $page.conditionallyAppendFooter($paginator);
        $page.append($page.$content);

        return $page;
    }
})();

(function () {
    /**
     * Class for the paginator's model, where the view gets its elements.
     * @param {Paginator.Component} $paginator The paginator.
     * @returns {jQuery} The paginator's model container.
     * @constructor
     */
    Paginator.Model = function Model($paginator) {
        var $$model;

        $$model = $('<div>');
        $$model.addClass('model');

        /**
         * Marks the model elements
         * @param {jQuery} $parent The parent element
         */
        function markChildren($parent) {
            $parent.children().each(function () {
                markChildren($(this).addClass('-model'));
            });
        }

        //
        // Set up the model.
        //

        $paginator
            .children()
            .each(function () {
                var $child = $(this);

                $child.filter('.content').children().each(function () {
                    var $grandChild = $(this);
                    markChildren($grandChild);
                });

                $$model.append($child);
            });

        $paginator.append($$model);

        return $$model;
    };
})();

(function () {
    /**
     * Class for the paginator view.
     * @param {Paginator.Component} $paginator The paginator.
     * @returns {jQuery} The view element.
     * @constructor
     */
    Paginator.View = function View($paginator) {
        var $$view;

        $$view = $('<div>');

        //
        // Set up the view.
        //

        $$view.addClass('view');

        $paginator.append($$view);

        return $$view;
    };
})();

(function () {
    /**
     * Class for the paginator.
     * @param {jQuery} $paginator The paginator element wrapped in jQuery.
     * @param {Paginator.Settings} opts The paginator options.
     * @returns {jQuery} The initialized paginator.
     * @constructor
     */
    Paginator.Component = function Component($paginator, opts) {
        var isRendering = false,
            onModelUpdate,
            observer;

        //
        // Set up the component.
        //

        $paginator.addClass('paginator');
        $paginator.data('settings', new Paginator.Settings(opts || {}));
        $paginator.$$model = new Paginator.Model($paginator);
        $paginator.$$view = new Paginator.View($paginator);
        $paginator._renderer = new Paginator.Renderer($paginator);
        $paginator._lastPageNumber = 0;

        onModelUpdate = function () {
            //var $deleted = $paginator.$$model.find('.page-deleted');
            //
            //if ($deleted.length > 0) {
            //    $deleted.remove(); // TODO better element removal in ng-repeat etc.
            //}

            setTimeout(function () {
                if (!!$paginator.data('isRendering')) {
                    return;
                }

                $paginator._renderer.render();
            });

            //$paginator.$$model.imagesLoaded()
            //    .always(function () {
            //
            //    });
        };

        observer = new MutationObserver(onModelUpdate);
        observer.observe($paginator.$$model[0], {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true
        });

        //$paginator.$$model.on('DOMSubtreeModified', );

        //$paginator.$$model.imagesLoaded()
        //    .always(function () {
                $paginator._renderer.render();
            //});
        return $paginator;
    };
})();

(function () {
    /**
     * jQuery function for the paginator.
     * @param {Object} opts The paginator options.
     */
    $.fn.paginate = function (opts) {
        this.each(function () {
            new Paginator.Component($(this), opts);
        });
    };
})();
