(function () {
    Paginator.Model = function Model($paginator) {
        var $model;

        $model = $('<div>');
        $model.addClass('model');

        /* Mount */

        $paginator
            .children()
            .each(function () {
                var $child = $(this);

                $model.append($child);
            });

        $paginator.append($model);

        return $model;
    };
})();
