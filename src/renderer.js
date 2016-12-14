(function () {
    var test = false;

    /**
     * Class for the paginator's renderer, the component in charge of displaying
     * elements from the model to the view without losing data, as well as preserving
     * their bound data and events.
     * @param {Paginator.Component} $paginator The paginator.
     * @constructor
     */
    Paginator.Renderer = function Renderer($paginator) {
        var $page;

        /**
         * Gets a value indicating if an element has block children (excluding itself).
         * @param {jQuery} $el The element.
         * @returns {boolean} Does the element have block children?
         */
        function hasKidsOnTheBlock($el) {
            var hasKidz = false,
                $kidz = $el.children();

            /**
             * Checks if an element or its descendants are block elements.
             * @param {jQuery} $kiddo The element.
             * @param {boolean} isBloke Is itself or its children blocks?
             * @returns {boolean} Is the element or its children blocks?
             */
            function isBlockHead($kiddo, isBloke) {
                var $children = $kiddo.children();

                if ($children.length < 1) {
                    return false;
                }

                $children
                    .each(function () {
                        var $kiddo = $(this);

                        isBloke = $kiddo.css('display') === 'block' || isBlockHead($kiddo, isBloke);
                    });

                return isBloke;
            }

            if ($kidz.length < 1) {
                return false;
            }

            $kidz
                .each(function () {
                    var $kiddo = $(this);

                    hasKidz = $kiddo.css('display') === 'block' || isBlockHead($kiddo, hasKidz);
                });

            return hasKidz;
        }

        /**
         * Appends the children of an element to the view on its corresponding page.
         * @param {jQuery} $parent The parent element.
         * @see moveToModel
         */
        function append($parent) {
            var $children = $parent.children();

            if (!$page) {
                $page = new Paginator.Page($paginator);
            }

            if (!hasKidsOnTheBlock($parent)) {
                // Here is where the appending happens.
                // We need to get the parent so we can put back the element to the model
                // because the data/events are still there (.clone() is expensive).
                $parent.data('modelParent', $parent.parent());
                $page.$margin.append($parent);

                if ($page.needsBreaking()) {
                    $page = new Paginator.Page($paginator);
                    $page.$margin.append($parent);
                }
                return;
            }

            $children
                .each(function () {
                    var $child = $(this);

                    append($child);
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

            $element.data('modelParent').append($element);
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
            $page = null;
        }

        /**
         * Renders the elements from the paginator's model.
         */
        this.render = function render() {
            $paginator.data('isRendering', true);
            resetModel();
            if (!test) {
                setTimeout(function () {
                    $paginator.$$view.html('');
                    resetPages();
                    append($paginator.$$model.children('.content').children());
                    $paginator.data('isRendering', false);
                }, 0);
            }
        };
    };
})();
