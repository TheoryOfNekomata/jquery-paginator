(function () {
    $.fn.paginate = function (opts) {
        new Paginator.Component(this, opts);
    };
})();
