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
