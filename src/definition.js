(function () {
    /**
     * jQuery function for the paginator.
     * @param {Object} opts The paginator options.
     */
    $.fn.paginate = function (opts) {
        this.each(function () {
            new Paginator.Component($(this), opts);
        });
    };
})();
