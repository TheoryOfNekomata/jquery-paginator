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
