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
            var id = 0,
                pageBreakingChildren = [];

            /**
             * Extracts the innermost page-breaking elements.
             * @param {jQuery} $child The element.
             */
            function extractPageBreakingChildren($child) {
                var $children = $child.children();

                if (!hasPageBreakingChildren($child) && isPageBreakingElement($child)) {
                    // Here is where the appending happens.
                    // We need to get the parent so we can put back the element to the model
                    // because the data/events are still there (.clone() is expensive).
                    $child.data('modelParent', $child.parent());
                    pageBreakingChildren.unshift($child);
                    return;
                }

                $child.data('order', id++);

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
                pageBreakingChildren.forEach(function ($child) {
                    console.log($child.data('order'));
                    if (!$pages[ $paginator._lastPageNumber ]) {
                        // Insert paper into the tray :P
                        $pages[ $paginator._lastPageNumber ] = new Paginator.Page($paginator, $paginator._lastPageNumber);
                        $paginator.$$view.append($pages[ $paginator._lastPageNumber ]);
                    }

                    // Print the element to the paper
                    $pages[ $paginator._lastPageNumber ].$margin.append($child);

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
            doPrintPageBreakingChildren();
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
