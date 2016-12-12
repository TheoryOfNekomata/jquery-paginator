(function () {
    Paginator.Settings = function Settings(opts) {
        var settings;

        settings = {
            //page: new Paginator.PageSettings(opts),
            component: new Paginator.ComponentSettings(opts)
        };

        return settings;
    };
})();
