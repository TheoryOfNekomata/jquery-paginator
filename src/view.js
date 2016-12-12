(function () {
    Paginator.View = function View($paginator) {
        var $view;

        $view = $('<div>');
        $view.addClass('view');

        $paginator.append($view);

        return $view;
    };
})();
