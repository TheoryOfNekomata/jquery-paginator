(function () {
    $.fn.paginate = function (opts) {
        this.each(function () {
            new Paginator.Component($(this), opts);
        });
    };
})();
