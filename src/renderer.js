(function () {
    var test = false;

    Paginator.Renderer = function Renderer($paginator) {
        var $page;

        function hasKidsOnTheBlock($el) {
            var hasKidz = false,
                $kidz = $el.children();

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

            console.log(hasKidz);
            return hasKidz;
        }

        function append($parent) {
            var $children = $parent.children();

            if (!$page) {
                $page = new Paginator.Page($paginator);
            }

            window.debug = hasKidsOnTheBlock;

            if (!hasKidsOnTheBlock($parent)) {
                console.log($parent);
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

        function appendToParent($element) {
            var ignoreList = [
                    '[data-ng-repeat]'
                ],
                isIgnored = ignoreList.reduce(function (isIgnored, sel) {
                    return isIgnored || $element.is(sel);
                }, false);

            if (isIgnored) {
                return;
            }

            console.log($element.data('modelParent'), $element);
            $element.data('modelParent').append($element);
        }

        function clearView() {
            var $viewEl = $paginator.$$view.find('.page')
                .find('.content')
                .children()
                .children();

            $viewEl.each(function () {
                appendToParent($(this));
            });
            //
            //$viewEl.each(function () {
            //    var $modelParent = $(this).data('modelParent');
            //    if (!$modelParent) {
            //        return;
            //    }
            //    $modelParent.prepend(this);
            //});

            //$paginator.$$model.find('.content').prepend(
            //    $paginator.$$view.find('.page').find('.content').children().children()
            //);

            $paginator.$$view.html('');
        }

        function resetPages() {
            $paginator._lastPageNumber = 0;
            $page = null;
        }

        this.render = function render() {
            $paginator.data('isRendering', true);
            clearView();
            if (!test) {
                setTimeout(function () {
                    resetPages();
                    append($paginator.$$model.children('.content').children());
                    $paginator.data('isRendering', false);
                }, 0);
            }
        };
    };
})();
