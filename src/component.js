(function () {
    Paginator.Component = function Component(el, opts) {
        var $paginator, isRendering = false;

        $paginator = $(el);

        $paginator.addClass('paginator');
        $paginator.data('settings', new Paginator.Settings(opts || {}));

        $paginator.$model = new Paginator.Model($paginator);
        $paginator.$view = new Paginator.View($paginator);
        $paginator._renderer = new Paginator.Renderer($paginator);
        $paginator._lastPageNumber = 0;

        /* Mount */

        $paginator.$model.on('DOMSubtreeModified', function () {
            if (!isRendering) {
                isRendering = true;
                $paginator._renderer.render();
                setTimeout(function () {
                    isRendering = false;
                }, 0);
            }
        });

        $paginator._renderer.render();

        return $paginator;
    };
})();
