(function () {
    /**
     * Class for the paginator.
     * @param {jQuery} $paginator The paginator element wrapped in jQuery.
     * @param {Paginator.Settings} opts The paginator options.
     * @returns {jQuery} The initialized paginator.
     * @constructor
     */
    Paginator.Component = function Component($paginator, opts) {
        var isRendering = false;

        //
        // Set up the component.
        //

        $paginator.addClass('paginator');
        $paginator.data('settings', new Paginator.Settings(opts || {}));
        $paginator.$$model = new Paginator.Model($paginator);
        $paginator.$$view = new Paginator.View($paginator);
        $paginator._renderer = new Paginator.Renderer($paginator);
        $paginator._lastPageNumber = 0;
        $paginator.$$model.on('DOMSubtreeModified', function () {
            $paginator.$$model.imagesLoaded()
                .always(function () {
                    if (!!$paginator.data('isRendering')) {
                        return;
                    }

                    $paginator._renderer.render();
                });
        });

        $paginator.$$model.imagesLoaded()
            .always(function () {
                $paginator._renderer.render();
            });
        return $paginator;
    };
})();
