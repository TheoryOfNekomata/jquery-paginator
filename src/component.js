(function () {
    Paginator.Component = function Component($paginator, opts) {
        var isRendering = false;

        $paginator.addClass('paginator');
        $paginator.data('settings', new Paginator.Settings(opts || {}));

        $paginator.$$model = new Paginator.Model($paginator);
        $paginator.$$view = new Paginator.View($paginator);
        $paginator._renderer = new Paginator.Renderer($paginator);
        $paginator._lastPageNumber = 0;

        $paginator.$$model.on('DOMSubtreeModified', function () {
            if (!!$paginator.data('isRendering')) {
                return;
            }

            $paginator._renderer.render();
        });

        $paginator._renderer.render();

        return $paginator;
    };
})();
