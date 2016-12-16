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
