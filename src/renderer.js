(function () {
    Paginator.Renderer = function Renderer($paginator) {
        var $page, pageNumber;

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
            }

            if ($kidz.length < 1) {
                return false;
            }

            $kidz
                .each(function () {
                    var $kiddo = $(this);

                    hasKidz = hasKidz || isBlockHead($kiddo, false);
                });

            $kidz
                .each(function () {
                    var $kiddo = $(this);

                    hasKidz = $kiddo.css('display') === 'block' || isBlockHead($kiddo, hasKidz);
                });

            return hasKidz;
        }

        function append($parent) {
            var $children = $parent.children(), $el;

            if (!$page) {
                $page = new Paginator.Page($paginator);
            }

            if (!hasKidsOnTheBlock($parent)) {
                $el = $parent.clone(true, true);
                $page.$margin.append($el);

                if ($page.needsBreaking()) {
                    $page = new Paginator.Page($paginator);
                    $page.$margin.append($el);
                }
                return;
            }

            $children
                .each(function () {
                    var $child = $(this);

                    append($child, $page);
                });
        }

        this.render = function render() {
            $paginator.$view.html('');
            $paginator._lastPageNumber = 0;
            $page = null;
            append(
                $paginator.$model.children('.content').children()
            );
        };
    };
})();
